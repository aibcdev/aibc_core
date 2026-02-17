/**
 * AIBC Proactivity Service
 * Allows Julius to "think" and send messages without being pinged.
 */

import { handleIncomingChannelMessage } from './multi-channel-bridge.js';

export class ProactivityService {
    private interval: NodeJS.Timeout | null = null;
    private geminiApiKey: string;
    private slackBotToken: string;
    private joinedChannels: string[] = [];

    constructor(geminiApiKey: string, slackBotToken: string) {
        this.geminiApiKey = geminiApiKey;
        this.slackBotToken = slackBotToken;
    }

    /**
     * Start the proactivity loop
     * @param intervalInMinutes How often Julius should check for a proactive thought
     */
    public async start(intervalInMinutes: number = 60) {
        console.log(`[Proactivity] Starting heartbeat every ${intervalInMinutes} minutes...`);

        // Initial fetch
        await this.refreshChannels();

        this.interval = setInterval(() => {
            this.pulse();
        }, intervalInMinutes * 60 * 1000);

        // Run an initial pulse after 1 minute of startup
        setTimeout(() => this.pulse(), 60 * 1000);
    }

    private async refreshChannels() {
        try {
            const res = await fetch('https://slack.com/api/conversations.list?types=public_channel,private_channel', {
                headers: { 'Authorization': `Bearer ${this.slackBotToken}` }
            });
            const data = await res.json() as any;
            if (data.ok) {
                // Filter channels where the bot is a member
                this.joinedChannels = data.channels
                    .filter((c: any) => c.is_member)
                    .map((c: any) => c.id);
                console.log(`[Proactivity] Found ${this.joinedChannels.length} joined channels: ${this.joinedChannels.join(', ')}`);
            } else {
                console.error(`[Proactivity] Error fetching channels: ${data.error}`);
            }
        } catch (err) {
            console.error(`[Proactivity] Network error fetching channels:`, err);
        }
    }

    public stop() {
        if (this.interval) clearInterval(this.interval);
    }

    private async pulse() {
        // Refresh channels before each pulse to catch new invites
        await this.refreshChannels();

        if (this.joinedChannels.length === 0) {
            console.log(`[Proactivity] No joined channels found. Skipping pulse.`);
            return;
        }

        // For now, pick a random joined channel to "think" about
        const targetChannel = this.joinedChannels[Math.floor(Math.random() * this.joinedChannels.length)];

        console.log(`[Proactivity] Julius is having a proactive thought about channel: ${targetChannel}`);

        // We "ping" the agent with a hidden proactivity prompt
        const proactiveMessage = "[PROACTIVE_PULSE] Analyze the recent conversation in this channel. Is there anything urgent, a win to celebrate, a skill gap to flag, or a proactive question you should ask? If yes, respond now. If no, respond with [skip_response].";

        try {
            const response = await handleIncomingChannelMessage({
                platform: 'slack',
                userId: 'system-heartbeat',
                channelId: targetChannel,
                text: proactiveMessage,
                isMention: true // Treat as mention so it always responds if it has something to say
            }, this.geminiApiKey);

            if (response.text && !response.text.includes("[skip_response]")) {
                console.log(`[Proactivity] Julius decided to speak: ${response.text.substring(0, 50)}...`);
                // Note: The actual posting is handled in bridge-server.ts or we expose a callback
                // For simplicity, we can emit an event or used a shared emitter.
                // In this architecture, we'll let bridge-server handle the actual send by passing a callback or using a function.
                if (this.onMessage) {
                    this.onMessage(targetChannel, response);
                }
            } else {
                console.log(`[Proactivity] Julius decided to remain silent.`);
            }
        } catch (err) {
            console.error(`[Proactivity] Error during pulse:`, err);
        }
    }

    public onMessage?: (channel: string, response: any) => void;
}
