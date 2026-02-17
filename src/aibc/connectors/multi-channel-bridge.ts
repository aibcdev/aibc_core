/**
 * AIBC Multi-Channel Bridge
 * Routes messages from external platforms (Slack, Teams) to the Super Agent Engine.
 */

import { runAutonomousLoop } from '../../../web/src/lib/aibc/signals/orchestrator.js';
import type { AgentId } from '../../../web/src/lib/types/marketing-os.js';
import { pocketTtsClient } from '../voice/pocket-tts.js';
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
    audioBuffer?: Buffer; // Raw audio buffer from Pocket TTS
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
            // Check for skip signal (Julius decides to stay silent)
            if (result.finalOutput.includes("[skip_response]")) {
                console.log("[Bridge] Agent decided to skip response.");
                return { text: "" }; // Empty response triggers no message in Slack
            }

            let finalOutput = result.finalOutput;
            let audioBuffer: Buffer | undefined;
            // Safely cast the result to check for wantsVoice
            let wantsVoice = (result as any).wantsVoice === true;

            // ---------------------------------------------------------
            // ROBUSTNESS FIX: Detect and Strip Hallucinated Voice Paths
            // ---------------------------------------------------------
            // The LLM sometimes hallucinates "Voice Note: /api/..." despite instructions.
            // We catch this, strip the text, and FORCE audio generation.
            const voiceHallucinationRegex = /(Voice Note:|Audio:|🔊|🔈)\s*(\/|\w+)\S+\.(mp3|wav)/gi;

            if (voiceHallucinationRegex.test(finalOutput)) {
                console.log("[Bridge] Detected voice path hallucination. Stripping text and enabling voice.");
                finalOutput = finalOutput.replace(voiceHallucinationRegex, '').trim();
                wantsVoice = true; // Force voice since the agent clearly intended it
            }

            // Check if user explicitly asked for a voice note OR if voice is enabled globally
            const isVoiceRequested = message.text.toLowerCase().includes("voice note") ||
                message.text.toLowerCase().includes("talk") ||
                wantsVoice;

            const isVoiceEnabled = message.metadata?.voiceEnabled !== false;

            if (isVoiceEnabled && (wantsVoice || isVoiceRequested)) {
                // Use Pocket TTS to generate voice
                console.log("[Bridge] Generating voice note with Pocket TTS...");

                // Determine voice seed. In the future this should come from Agent configs.
                // For now, hardcode Oracle -> Male1.mp3
                const voicePath = (agentId === 'oracle') ? 'audio/seeds/Male1.mp3' : 'audio/seeds/Female1.mp3';

                // Pocket TTS options
                const ttsOptions = {
                    voicePath: voicePath,
                    speed: 1.0 // Default speed
                };

                // Use finalOutput (sanitized) for synthesis
                const ttsResponse = await pocketTtsClient.synthesize(finalOutput, ttsOptions);

                if (ttsResponse) {
                    audioBuffer = ttsResponse.audio;
                }
            }

            return {
                text: finalOutput, // Return sanitized text
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
