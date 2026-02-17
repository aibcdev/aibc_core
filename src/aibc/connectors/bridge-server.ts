/**
 * AIBC Super Agent Bridge Server
 * Simple Express server to handle Slack/Teams webhooks.
 */
console.log("[Server] Entry point reached...");

import 'dotenv/config';
import express from 'express';
import crypto from 'crypto';
import { handleIncomingChannelMessage } from './multi-channel-bridge.js';
import { ProactivityService } from './proactivity-service.js';

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
async function sendSlackMessage(channel: string, text: string, token?: string) {
    const activeToken = token || SLACK_BOT_TOKEN;
    if (!activeToken) {
        console.warn("[Server] No Slack token available, cannot send message.");
        return;
    }

    try {
        const res = await fetch('https://slack.com/api/chat.postMessage', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${activeToken}`
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

// Helper to upload file to Slack
async function uploadSlackFile(channels: string, content: Buffer, filename: string, token?: string, initial_comment?: string) {
    const activeToken = token || SLACK_BOT_TOKEN;
    if (!activeToken) {
        console.warn("[Server] No Slack token available, cannot upload file.");
        return;
    }

    try {
        const formData = new FormData();
        formData.append('token', activeToken);
        formData.append('channels', channels);
        formData.append('filename', filename);
        if (initial_comment) formData.append('initial_comment', initial_comment);

        // Determine MIME type based on extension
        const ext = filename.split('.').pop()?.toLowerCase();
        const mimeType = ext === 'mp3' ? 'audio/mpeg' : 'audio/wav';

        const blob = new Blob([new Uint8Array(content)], { type: mimeType });
        formData.append('file', blob, filename);

        const res = await fetch('https://slack.com/api/files.upload', {
            method: 'POST',
            body: formData
        });

        const data = await res.json() as any;
        if (data.ok) {
            console.log(`[Server] Slack File Uploaded successfully to ${channels}`);
        } else {
            console.error(`[Server] Slack File Upload Error: ${data.error}`);
            // Fallback: Post text saying upload failed
            await sendSlackMessage(channels, `[Voice Note Upload Failed: ${data.error}]`, activeToken);
        }
    } catch (err) {
        console.error(`[Server] Network Error uploading to Slack: ${err}`);
    }
}

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
    console.log(`[Server] Received POST to /slack/events from team ${req.body.team_id}`);

    const event = req.body.event;
    if (event) {
        console.log(`[Server] DEBUG: Received event type "${event.type}" from Slack.`);
    }
    if (event && (event.type === 'message' || event.type === 'app_mention')) {
        // Skip bot messages
        if (event.bot_id || event.subtype === 'bot_message') return res.sendStatus(200);

        const teamId = req.body.team_id;
        const { getSlackToken } = await import('../../../../web/src/lib/aibc/signals/storage.js');
        const dynamicToken = await getSlackToken(teamId) || SLACK_BOT_TOKEN;

        console.log(`[Server] Slack Event (${event.type}) in ${event.channel} (Team: ${teamId})`);

        // 1. Check if it's a DM, an app_mention, or if he's addressed by name
        const isDM = event.channel_type === 'im' || (event.channel && event.channel.startsWith('D'));
        const nameMention = event.text && (
            event.text.toLowerCase().includes('julius') ||
            event.text.toLowerCase().includes('aibc super agent')
        );
        const isMention = event.type === 'app_mention' || isDM || !!nameMention;

        const shouldProcess = isMention || event.type === 'message';
        if (!shouldProcess) return res.sendStatus(200);

        // Run Agent Loop in background
        handleIncomingChannelMessage({
            platform: 'slack',
            userId: event.user,
            channelId: event.channel,
            text: event.text,
            isMention: isMention
        }, GEMINI_API_KEY).then(async (response) => {
            if (response.text) {
                await sendSlackMessage(event.channel, response.text, dynamicToken);
            }
            if (response.audioBuffer) {
                await uploadSlackFile(event.channel, response.audioBuffer, `julius_voice_${Date.now()}.mp3`, dynamicToken, "🎙️ Julius - Voice Note");
            }
        }).catch(err => {
            console.error("[Server] Background Agent Loop Error:", err);
        });

        return res.sendStatus(200);
    }
    res.sendStatus(200);
});

// OAuth: Installation Landing
app.get('/slack/install', (req, res) => {
    const client_id = process.env.SLACK_CLIENT_ID;
    const scopes = 'app_mentions:read,channels:history,channels:read,chat:write,files:write,groups:history,groups:read,im:history,im:read,im:write,mpim:history,mpim:read,mpim:write,users:read';
    const redirect_uri = process.env.SLACK_REDIRECT_URI || `https://${req.get('host')}/slack/oauth_redirect`;

    const url = `https://slack.com/oauth/v2/authorize?client_id=${client_id}&scope=${scopes}&redirect_uri=${redirect_uri}`;
    res.redirect(url);
});

// OAuth: Redirect Handlers
app.get('/slack/oauth_redirect', async (req, res) => {
    const code = req.query.code as string;
    if (!code) return res.status(400).send("Missing code");

    try {
        const { saveSlackInstallation } = await import('../../../../web/src/lib/aibc/signals/storage.js');

        const oauthRes = await fetch('https://slack.com/api/oauth.v2.access', {
            method: 'POST',
            headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
            body: new URLSearchParams({
                client_id: process.env.SLACK_CLIENT_ID || "",
                client_secret: process.env.SLACK_CLIENT_SECRET || "",
                code: code
            })
        });

        const data = await oauthRes.json() as any;

        if (data.ok) {
            await saveSlackInstallation({
                team_id: data.team.id,
                team_name: data.team.name,
                access_token: data.access_token,
                bot_user_id: data.bot_user_id,
                installer_user_id: data.authed_user.id
            });

            res.send("<h1>Julius is in the building!</h1><p>You can close this window now.</p>");
        } else {
            res.status(500).send(`OAuth Error: ${data.error}`);
        }
    } catch (err) {
        console.error("OAuth Error:", err);
        res.status(500).send("Auth failed.");
    }
});

// Teams Webhook Endpoint
app.post('/teams/webhook', async (req, res) => {
    console.log(`[Server] Teams Activity: ${req.body.text}`);
    // Logic for Teams activity handling
    res.sendStatus(200);
});

app.listen(PORT, () => {
    console.log(`\n🚀 Super Agent Bridge Server running on port ${PORT}`);
    console.log(`   - Install Link: http://localhost:${PORT}/slack/install`);
    console.log(`   - Events Endpoint: http://localhost:${PORT}/slack/events\n`);

    // Start Proactivity Heartbeat
    if (GEMINI_API_KEY && SLACK_BOT_TOKEN) {
        const proactivity = new ProactivityService(GEMINI_API_KEY, SLACK_BOT_TOKEN);

        // Wire up the message sender
        proactivity.onMessage = async (channel, response) => {
            if (response.text) await sendSlackMessage(channel, response.text, SLACK_BOT_TOKEN);
            if (response.audioBuffer) {
                await uploadSlackFile(channel, response.audioBuffer, `julius-proactive-${Date.now()}.wav`, SLACK_BOT_TOKEN, "🎙️ Julius has a thought...");
            }
        };

        // Every 30 minutes, Julius checks if he should say something
        proactivity.start(30);
    }
});
