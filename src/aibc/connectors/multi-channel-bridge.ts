/**
 * AIBC Multi-Channel Bridge
 * Routes messages from external platforms (Slack, Teams) to the Super Agent Engine.
 */

import { runAutonomousLoop } from '../../../web/src/lib/aibc/signals/orchestrator.js';
import type { AgentId } from '../../../web/src/lib/types/marketing-os.js';
import { kaniTtsClient } from '../voice/kani-tts.js';
import { addMemory } from '../../../web/src/lib/aibc/signals/memory.js';

export interface ChannelMessage {
    platform: 'slack' | 'teams';
    userId: string;
    channelId: string;
    text: string;
    metadata?: any;
    wantsVoice?: boolean; // New flag for voice note requests
    isMention?: boolean;  // Whether the bot was explicitly tagged
}

export interface ChannelResponse {
    text: string;
    audioUrl?: string; // Audio URL for voice notes (external)
    audioBuffer?: Buffer; // Raw audio buffer from Kani TTS
    files?: { name: string; url: string; content?: Buffer }[];
    wantsVoice?: boolean;
}

/**
 * Universal handler for incoming messages
 */
export async function handleIncomingChannelMessage(
    message: ChannelMessage,
    geminiApiKey: string
): Promise<ChannelResponse> {
    console.log(`[Bridge] Incoming message from ${message.platform}: ${message.text}`);

    const objective = message.text;
    const brandContext = "General Marketing Assistant";
    const agentId: AgentId = 'oracle';

    // For this deployment, we associate the account with watchaibc@gmail.com
    const primaryUserId = message.userId || 'watchaibc@gmail.com';

    try {
        // A. Save incoming message to Dialogue History
        await addMemory('executive_briefing', 'short_term', `User: ${message.text}`, 0.9, { channelId: message.channelId, userId: primaryUserId });

        const result = await runAutonomousLoop(
            agentId,
            objective,
            brandContext,
            geminiApiKey,
            primaryUserId,
            message.channelId, // Pass channelId
            10, // maxSteps
            message.isMention,
            process.env.SLACK_BOT_TOKEN
        );

        if (result.success) {
            // Check for skip signal (legacy check, though we removed it from prompt)
            if (result.finalOutput.toLowerCase().includes("[skip_response]")) {
                console.log("[Bridge] Agent decided to skip response.");
                return { text: "" }; // Empty response triggers no message in Slack
            }

            let audioBuffer: Buffer | undefined;

            // Check if user explicitly asked for a voice note OR if voice is enabled globally
            const isVoiceRequested = message.text.toLowerCase().includes("voice note") ||
                message.text.toLowerCase().includes("talk") ||
                (result as any).wantsVoice === true; // Check if agent wants to speak

            const isVoiceEnabled = message.metadata?.voiceEnabled !== false;

            if (isVoiceEnabled && (message.wantsVoice || isVoiceRequested)) {
                // Use Kani TTS to generate voice
                console.log("[Bridge] Generating voice note with Kani TTS...");

                // Determine voice style based on context (optional) or use default
                // Kani TTS usually just needs text. If we have a style concept, we'd pass it here.
                const ttsResponse = await kaniTtsClient.synthesize(result.finalOutput);

                if (ttsResponse) {
                    audioBuffer = ttsResponse.audio;
                }
            }

            return {
                text: result.finalOutput,
                audioBuffer
            };
        } else {
            return {
                text: result.error || "Sorry, I hit a snag with that objective. Can we try again?",
            };
        }
    } catch (error: any) {
        return {
            text: `Hit an issue: ${error.message}`,
        };
    }
}
