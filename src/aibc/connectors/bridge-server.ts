/**
 * AIBC Super Agent Bridge Server
 * Simple Express server to handle Slack/Teams webhooks.
 */
console.log("[Server] Entry point reached...");

import 'dotenv/config';
import express from 'express';
import { handleIncomingChannelMessage } from './multi-channel-bridge.js';

const app = express();
app.use(express.json());

const PORT = process.env.PORT || 3000;
const SLACK_BOT_TOKEN = process.env.SLACK_BOT_TOKEN;
const GEMINI_API_KEY = process.env.GEMINI_API_KEY || "";

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

// Slack Events Endpoint
app.post('/slack/events', async (req, res) => {
    console.log(`[Server] Received POST to /slack/events: ${JSON.stringify(req.body).substring(0, 100)}...`);

    // Slack Challenge Handling
    if (req.body.type === 'url_verification') {
        console.log("[Server] Handled Slack URL verification challenge");
        return res.send(req.body.challenge);
    }

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
