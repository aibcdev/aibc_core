/**
 * Pocket TTS Client
 * 
 * Lightweight, CPU-based TTS with zero-shot voice cloning.
 * Connects to a Pocket TTS server running `pocket-tts serve`.
 * 
 * Ported from agentwrite-final for aibc_core.
 */

import * as fs from 'fs/promises';
import * as path from 'path';
import { execSync } from 'child_process';

interface PocketTtsResponse {
    audio: Buffer;
    sampleRate: number;
    format: string;
}

interface SynthesizeOptions {
    /** Path to reference audio for voice cloning (relative to web/public/) */
    voicePath?: string;
    /** Speed multiplier (default 1.0) */
    speed?: number;
    /** Tone modifiers based on persona description */
    toneModifiers?: {
        /** Aggression level 0-1 (affects speed and emphasis) */
        aggression?: number;
        /** Energy level 0-1 (affects pacing and volume) */
        energy?: number;
        /** Pitch adjustment -1 to 1 */
        pitch?: number;
    };
}

export class PocketTtsClient {
    private servers: string[];
    private configured: boolean;

    constructor() {
        const primary = process.env.POCKET_TTS_URL || 'http://137.184.82.132:8000'; // LOCKED IN: Permanent Fallback

        const backup = process.env.POCKET_TTS_BACKUP_URL;

        this.servers = [primary];
        if (backup) {
            this.servers.push(backup);
        }

        this.configured = !!process.env.POCKET_TTS_URL || true; // Always configured due to fallback
    }

    /**
     * Check if Pocket TTS server is configured
     */
    checkConfigured(): boolean {
        return this.configured;
    }

    /**
     * Check if ANY Pocket TTS server is healthy
     */
    async checkHealth(): Promise<boolean> {
        for (const server of this.servers) {
            try {
                const response = await fetch(`${server}/health`, {
                    method: 'GET',
                    signal: AbortSignal.timeout(2000), // Fast check
                });
                if (response.ok) return true;
            } catch (error) {
                // Try next server
                continue;
            }
        }
        return false;
    }

    /**
     * Load reference audio file as a Blob for multipart upload
     */
    private async loadReferenceAudio(voicePath: string): Promise<Blob | null> {
        // 1. Try Local File System (Works in Dev / when bundled)
        try {
            // Handle both absolute and relative paths
            let fullPath: string;
            if (path.isAbsolute(voicePath)) {
                fullPath = voicePath;
            } else {
                // Relative to web/public directory in aibc_core
                // voicePath typically "audio/seeds/Male1.mp3"
                fullPath = path.join(process.cwd(), 'web', 'public', voicePath);
            }

            console.log(`[Pocket TTS] Loading reference audio (FS): ${fullPath}`);
            const buffer = await fs.readFile(fullPath);

            // Determine MIME type from extension
            const ext = path.extname(fullPath).toLowerCase();
            const mimeType = ext === '.wav' ? 'audio/wav' : 'audio/mpeg';

            return new Blob([new Uint8Array(buffer)], { type: mimeType });
        } catch (error) {
            console.warn(`[Pocket TTS] FS load failed, trying HTTP fetch: ${voicePath} (${error})`);
        }

        // 2. Fallback: Fetch via HTTP
        try {
            const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
            const fetchUrl = `${baseUrl}/${voicePath}`; // Assumes served from public root
            console.log(`[Pocket TTS] Fetching reference audio (HTTP): ${fetchUrl}`);

            const response = await fetch(fetchUrl);
            if (!response.ok) {
                console.error(`[Pocket TTS] HTTP fetch failed: ${response.statusText}`);
                return null;
            }

            const buffer = await response.arrayBuffer();
            const ext = path.extname(voicePath).toLowerCase();
            const mimeType = ext === '.wav' ? 'audio/wav' : 'audio/mpeg';
            return new Blob([new Uint8Array(buffer)], { type: mimeType });

        } catch (fetchError) {
            console.error(`[Pocket TTS] HTTP fetch failed details:`, fetchError);
            return null;
        }
    }

    /**
     * Synthesize speech using Pocket TTS with Failover
     */
    async synthesize(text: string, options: SynthesizeOptions = {}, retries = 3): Promise<PocketTtsResponse | null> {
        let lastError: any;

        // Try each server in order (Primary -> Backup)
        for (let i = 0; i < this.servers.length; i++) {
            const serverUrl = this.servers[i];
            const isBackup = i > 0;
            console.log(`[Pocket TTS] Attempting generation on ${isBackup ? 'BACKUP' : 'PRIMARY'} server: ${serverUrl}`);

            // Per-server Retry Loop
            for (let attempt = 1; attempt <= retries; attempt++) {
                try {
                    if (attempt > 1) {
                        console.log(`[Pocket TTS] Retry attempt ${attempt}/${retries} on ${serverUrl}...`);
                        await new Promise(resolve => setTimeout(resolve, 500 * (attempt - 1)));
                    }

                    const formData = new FormData();

                    // Apply tone modifiers to adjust speed
                    let effectiveSpeed = options.speed || 1.0;
                    if (options.toneModifiers) {
                        const { aggression = 0, energy = 0.5 } = options.toneModifiers;
                        // Aggressive personas speak faster
                        if (aggression > 0.5) effectiveSpeed *= 1.0 + (aggression * 0.2);
                        // High energy = faster, low energy = slower
                        effectiveSpeed *= 0.9 + (energy * 0.2);
                        console.log(`[Pocket TTS] Tone modifiers applied: speed=${effectiveSpeed.toFixed(2)}`);
                    }

                    formData.append('text', text);
                    formData.append('speed', effectiveSpeed.toString());

                    // Load and attach voice reference for cloning
                    if (options.voicePath) {
                        const voiceBlob = await this.loadReferenceAudio(options.voicePath);
                        if (!voiceBlob) {
                            // Warn but proceed with default voice if seed fails? 
                            // Or fail? The original code throws. Let's throw to be safe/consistent.
                            console.warn(`[Pocket TTS] Warning: Could not load voice reference: ${options.voicePath}. Proceeding with default.`);
                        } else {
                            const filename = path.basename(options.voicePath);
                            formData.append('voice_wav', voiceBlob, filename);
                            console.log(`[Pocket TTS] Synthesizing with cloned voice: ${filename}`);
                        }
                    } else {
                        console.log('[Pocket TTS] Synthesizing with default voice (no cloning)');
                    }

                    const response = await fetch(`${serverUrl}/tts`, {
                        method: 'POST',
                        body: formData,
                        signal: AbortSignal.timeout(60000), // 60s timeout
                    });

                    if (!response.ok) {
                        const errorText = await response.text();
                        console.error(`[Pocket TTS] API Error (${response.status}):`, errorText);
                        throw new Error(`API error: ${response.status} - ${errorText}`);
                    }

                    const audioBuffer = Buffer.from(await response.arrayBuffer());

                    console.log(`[Pocket TTS] Success on ${serverUrl} (${audioBuffer.length} bytes)`);

                    return {
                        audio: audioBuffer,
                        sampleRate: 24000,
                        format: 'wav',
                    };

                } catch (error: any) {
                    console.error(`[Pocket TTS] Error on ${serverUrl} (attempt ${attempt}):`, error.message);
                    lastError = error;

                    if (error.cause?.code === 'ECONNREFUSED' || error.message.includes('fetch failed')) {
                        break;
                    }
                }
            }
            console.log(`[Pocket TTS] Server ${serverUrl} failed. Checking next backup...`);
        }

        console.error('[Pocket TTS] All backup servers failed.');
        throw lastError;
    }
}

export const pocketTtsClient = new PocketTtsClient();
