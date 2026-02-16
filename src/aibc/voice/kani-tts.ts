import * as fs from 'fs/promises';
import * as path from 'path';

interface KaniTtsResponse {
    audio: Buffer;
    sampleRate: number;
    format: string;
}

interface SynthesizeOptions {
    voicePath?: string;
    speed?: number;
    pitch?: number;
}

export class KaniTtsClient {
    private serverUrl: string;

    constructor() {
        // Default to the internal Railway URL if available, otherwise localhost or env var
        this.serverUrl = process.env.KANI_TTS_URL || 'http://localhost:8000';
    }

    async synthesize(text: string, options: SynthesizeOptions = {}): Promise<KaniTtsResponse | null> {
        try {
            const formData = new FormData();
            formData.append('text', text);
            if (options.speed) {
                formData.append('speed', options.speed.toString());
            }
            if (options.pitch) {
                formData.append('pitch', options.pitch.toString());
            }

            // Note: In a containerized environment, reading local public files might need adjustment
            // For now, we assume voicePath is relative to the service root or a shared volume
            if (options.voicePath) {
                // If we are passing a file path, we need to read it and append it
                // This logic might need to be adjusted if voice files are stored differently in prod
                try {
                    const fullPath = path.resolve(options.voicePath);
                    const buffer = await fs.readFile(fullPath);
                    const blob = new Blob([buffer], { type: 'audio/wav' });
                    formData.append('voice_wav', blob, path.basename(options.voicePath));
                } catch (e) {
                    console.warn(`[KaniTtsClient] Could not load voice file at ${options.voicePath}:`, e);
                }
            }

            console.log(`[KaniTtsClient] Synthesizing at ${this.serverUrl}...`);
            const response = await fetch(`${this.serverUrl}/synthesize`, {
                method: 'POST',
                body: formData,
            });

            if (!response.ok) {
                throw new Error(`Kani-TTS API error: ${response.status} ${response.statusText}`);
            }

            const data = await response.json() as any;

            if (!data.audio_base64) {
                throw new Error('Kani-TTS response missing audio_base64');
            }

            return {
                audio: Buffer.from(data.audio_base64, 'base64'),
                sampleRate: data.sample_rate,
                format: data.format,
            };
        } catch (error) {
            console.error('[KaniTtsClient] Error:', error);
            return null;
        }
    }
}

export const kaniTtsClient = new KaniTtsClient();
