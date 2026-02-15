/**
 * AIBC Super Agent Bridge Server
 * Simple Express server to handle Slack/Teams webhooks.
 */
console.log("[Server] Entry point reached...");

import 'dotenv/config';
import express from 'express';
import crypto from 'crypto';
import { handleIncomingChannelMessage } from './multi-channel-bridge.js';

const app = express();

// Middleware to capture raw body for Slack signature verification
app.use(express.json({
    verify: (req: any, _res, buf) => {
        req.rawBody = buf;
    }
}));

const PORT = process.env.PORT || 3000;
const SLACK_BOT_TOKEN = process.env.SLACK_BOT_TOKEN;
const SLACK_SIGNING_SECRET = process.env.SLACK_SIGNING_SECRET;
const GEMINI_API_KEY = process.env.GEMINI_API_KEY || "";

// Slack Signature Verification Middleware
function verifySlackSignature(req: express.Request, res: express.Response, next: express.NextFunction) {
    const signature = req.headers['x-slack-signature'] as string;
    const timestamp = req.headers['x-slack-request-timestamp'] as string;

    if (!SLACK_SIGNING_SECRET) {
        console.warn("[Server] SLACK_SIGNING_SECRET missing, skipping verification.");
        return next();
    }

    if (!signature || !timestamp) {
        console.error("[Server] Missing Slack signature or timestamp");
        return res.status(401).send('Unauthorized');
    }

    // Prevent Replay Attacks (5 min window)
    const fiveMinutesAgo = Math.floor(Date.now() / 1000) - (60 * 5);
    if (parseInt(timestamp) < fiveMinutesAgo) {
        console.error("[Server] Stale Slack request");
        return res.status(401).send('Stale request');
    }

    try {
        const [version, hash] = signature.split('=');
        const baseString = `${version}:${timestamp}:${(req as any).rawBody}`;
        const hmac = crypto.createHmac('sha256', SLACK_SIGNING_SECRET);
        hmac.update(baseString);
        const computedHash = hmac.digest('hex');

        if (crypto.timingSafeEqual(Buffer.from(hash), Buffer.from(computedHash))) {
            next();
        } else {
            console.error("[Server] Slack signature mismatch");
            res.status(401).send('Unauthorized');
        }
    } catch (err) {
        console.error("[Server] Error verifying Slack signature:", err);
        res.status(500).send('Internal Server Error');
    }
}

// Helper to send message back to Slack using fetch (to avoid dependency delays)
async function sendSlackMessage(channel: string, text: string) {
    if (!SLACK_BOT_TOKEN) {
        console.warn("[Server] SLACK_BOT_TOKEN missing, cannot send message.");
        return;
    }

    try {
        const res = await fetch('https://slack.com/api/chat.postMessage', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${SLACK_BOT_TOKEN}`
            },
            body: JSON.stringify({ channel, text })
        });
        const data = await res.json() as any;
        if (data.ok) {
            console.log(`[Server] Slack Message Sent successfully to ${channel}`);
        } else {
            console.error(`[Server] Slack API Error while sending to ${channel}: ${data.error}`);
            if (data.needed) console.error(`[Server] Missing scope: ${data.needed}`);
        }
    } catch (err) {
        console.error(`[Server] Network Error sending to Slack: ${err}`);
    }
}

// Healthcheck Endpoints
app.get('/', (_req, res) => res.status(200).json({ status: 'ok', service: 'aibc-bridge' }));
app.get('/slack/events', (_req, res) => res.status(200).json({ status: 'listening' }));

// Slack Events Endpoint
app.post('/slack/events', async (req, res, next) => {
    // 1. Handle Slack Challenge FIRST (unauthenticated)
    if (req.body.type === 'url_verification') {
        console.log("[Server] Handled Slack URL verification challenge");
        return res.send(req.body.challenge);
    }
    // 2. Proceed to signature verification for actual events
    next();
}, verifySlackSignature, async (req, res) => {
    console.log(`[Server] Received POST to /slack/events: ${JSON.stringify(req.body).substring(0, 100)}...`);

    const event = req.body.event;
    if (event && (event.type === 'message' || event.type === 'app_mention')) {
        // Skip bot messages
        if (event.bot_id || event.subtype === 'bot_message') return res.sendStatus(200);

        console.log(`[Server] Slack Event (${event.type}): ${event.text}`);

        // DMs should be treated as mentions (explicit tagging)
        const isDM = event.channel_type === 'im' || (event.channel && event.channel.startsWith('D'));
        const isMention = event.type === 'app_mention' || isDM;

        // Run Agent Loop in background
        handleIncomingChannelMessage({
            platform: 'slack',
            userId: event.user,
            channelId: event.channel,
            text: event.text,
            isMention: isMention
        }, GEMINI_API_KEY).then(async (response) => {
            console.log(`[Server] Agent Result ready: ${response.text ? response.text.substring(0, 50) : "EMPTY"}...`);
            if (response.text) {
                await sendSlackMessage(event.channel, response.text);
            }
            if (response.audioUrl) {
                await sendSlackMessage(event.channel, `🔊 Voice Note: ${response.audioUrl}`);
            }
        }).catch(err => {
            console.error("[Server] Background Agent Loop Error:", err);
        });

        return res.sendStatus(200);
    }

    res.sendStatus(200);
});

// Teams Webhook Endpoint
app.post('/teams/webhook', async (req, res) => {
    console.log(`[Server] Teams Activity: ${req.body.text}`);
    // Logic for Teams activity handling
    res.sendStatus(200);
});

app.listen(PORT, () => {
    console.log(`\n🚀 Super Agent Bridge Server running on port ${PORT}`);
    console.log(`   - Slack Endpoint: http://localhost:${PORT}/slack/events`);
    console.log(`   - Teams Endpoint: http://localhost:${PORT}/teams/webhook\n`);
});
