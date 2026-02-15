/**
 * Audio Output Pipeline - Multi-Engine TTS Integration
 * Supports:
 * 1. Chatterbox (Fish Speech) - Self-hosted/RunPod
 * 2. ElevenLabs - Managed API
 */
import type { VoiceProfile, AudioOutput, TextOutput, SpeechTraits } from '../../shared/types.js';

// ============================================
// PROVIDER INTERFACES
// ============================================

export interface TTSRequest {
    text: string;
    voice_id: string;
    speech_traits: SpeechTraits;
}

export interface TTSResponse {
    audio_data: Buffer;
    duration_seconds: number;
    sample_rate: number;
    mime_type: string;
}

export interface TTSProvider {
    name: string;
    generateSpeech(request: TTSRequest): Promise<TTSResponse>;
}

// ============================================
// 1. ELEVENLABS PROVIDER
// ============================================

export class ElevenLabsProvider implements TTSProvider {
    name = 'elevenlabs';
    private apiKey: string;
    private baseUrl = 'https://api.elevenlabs.io/v1';

    constructor(apiKey?: string) {
        this.apiKey = apiKey || process.env.ELEVENLABS_API_KEY || '';
    }

    async generateSpeech(request: TTSRequest): Promise<TTSResponse> {
        if (!this.apiKey) {
            throw new Error('ElevenLabs API key not configured');
        }

        console.log(`[ElevenLabs] Generating speech for voice: ${request.voice_id}`);

        // Map abstract traits to ElevenLabs stability/similarity settings
        const stability = request.speech_traits.pace === 'measured' ? 0.5 :
            request.speech_traits.pace === 'slow' ? 0.8 : 0.3;

        const similarity = request.speech_traits.energy === 'controlled' ? 0.75 :
            request.speech_traits.energy === 'subdued' ? 0.9 : 0.5;

        try {
            const response = await fetch(`${this.baseUrl}/text-to-speech/${request.voice_id}`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'xi-api-key': this.apiKey,
                },
                body: JSON.stringify({
                    text: request.text,
                    model_id: 'eleven_monolingual_v1', // Default model, allows upgrades
                    voice_settings: {
                        stability,
                        similarity_boost: similarity,
                    }
                }),
            });

            if (!response.ok) {
                const errorText = await response.text();
                throw new Error(`ElevenLabs API Error: ${response.status} ${errorText}`);
            }

            const arrayBuffer = await response.arrayBuffer();
            const audioData = Buffer.from(arrayBuffer);

            return {
                audio_data: audioData,
                duration_seconds: audioData.length / 44100 / 2, // Rough estimate for MP3/PCM
                sample_rate: 44100, // ElevenLabs default
                mime_type: 'audio/mpeg'
            };

        } catch (error) {
            console.error('[ElevenLabs] Generation failed:', error);
            throw error;
        }
    }
}

// ============================================
// 2. CHATTERBOX (FISH SPEECH) PROVIDER
// ============================================

export class ChatterboxProvider implements TTSProvider {
    name = 'chatterbox';
    private endpoint: string;
    private apiKey?: string;

    constructor(endpoint: string, apiKey?: string) {
        this.endpoint = endpoint;
        this.apiKey = apiKey;
    }

    async generateSpeech(request: TTSRequest): Promise<TTSResponse> {
        console.log(`[Chatterbox] Generating speech for voice: ${request.voice_id}`);

        // STUB MODE: If explicit stub endpoint or no endpoint
        if (this.endpoint === 'stub' || !this.endpoint) {
            console.log(`[Chatterbox] STUB MODE: Returning simulated audio`);
            return {
                audio_data: Buffer.from('STUB_CHATTERBOX_AUDIO_DATA'),
                duration_seconds: request.text.length * 0.05,
                sample_rate: 44100,
                mime_type: 'audio/wav'
            };
        }

        // REAL MODE: Call Fish Speech API (RunPod/Local)
        // Adjust payload to match typical Fish Speech / OpenAI compatible endpoints
        try {
            const response = await fetch(`${this.endpoint}/v1/audio/speech`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    ...(this.apiKey ? { 'Authorization': `Bearer ${this.apiKey}` } : {})
                },
                body: JSON.stringify({
                    input: request.text,
                    voice: request.voice_id,
                    speed: request.speech_traits.pace === 'fast' ? 1.2 :
                        request.speech_traits.pace === 'slow' ? 0.8 : 1.0,
                    response_format: 'wav'
                })
            });

            if (!response.ok) {
                throw new Error(`Chatterbox API Error: ${response.status}`);
            }

            const arrayBuffer = await response.arrayBuffer();
            return {
                audio_data: Buffer.from(arrayBuffer),
                duration_seconds: 0, // Should calculate from buffer header if possible
                sample_rate: 32000, // Common for VITS/FishAudio. If mismatch, audio will pitch shift. 
                mime_type: 'audio/wav'
            };

        } catch (error) {
            console.error('[Chatterbox] Generation failed:', error);
            throw error;
        }
    }
}

// ============================================
// AUDIO PIPELINE CLASS
// ============================================

export interface AudioGenerationResult {
    success: boolean;
    output?: AudioOutput;
    audioBuffer?: Buffer;
    duration_seconds?: number;
    error?: string;
}

export interface AudioStorageConfig {
    type: 'local' | 's3' | 'gcs';
    basePath: string;
    bucket?: string;
}

export interface AudioPipelineOptions {
    chatterboxEndpoint?: string;
    chatterboxApiKey?: string;
    elevenLabsApiKey?: string;
    storage?: Partial<AudioStorageConfig>;
}

export class AudioPipeline {
    private providers: Record<string, TTSProvider>;
    private storageConfig: AudioStorageConfig;

    constructor(options: AudioPipelineOptions = {}) {
        // Initialize providers
        this.providers = {
            chatterbox: new ChatterboxProvider(
                options.chatterboxEndpoint ?? 'stub',
                options.chatterboxApiKey
            ),
            fish: new ChatterboxProvider( // Alias for fish speech
                options.chatterboxEndpoint ?? 'stub',
                options.chatterboxApiKey
            ),
            elevenlabs: new ElevenLabsProvider(options.elevenLabsApiKey)
        };

        // Initialize storage config
        this.storageConfig = {
            type: options.storage?.type ?? 'local',
            basePath: options.storage?.basePath ?? './audio_output',
            bucket: options.storage?.bucket,
        };
    }

    /**
     * Generate audio from text output
     */
    async generateAudio(
        textOutput: TextOutput,
        voiceProfile: VoiceProfile
    ): Promise<AudioGenerationResult> {
        try {
            // 1. Select Provider
            const engineKey = voiceProfile.tts_engine.toLowerCase();
            const provider = this.providers[engineKey] || this.providers['chatterbox']; // Default to chatterbox

            if (!provider) {
                throw new Error(`No TTS provider found for engine: ${voiceProfile.tts_engine}`);
            }

            // 2. Prepare text
            const cleanText = this.prepareTextForTTS(textOutput.content);

            // 3. Generate speech
            const response = await provider.generateSpeech({
                text: cleanText,
                voice_id: voiceProfile.voice_id,
                speech_traits: voiceProfile.speech_traits,
            });

            // 4. Store audio
            const audioUrl = await this.storeAudio(response.audio_data, {
                character_snapshot_id: textOutput.character_snapshot_id,
                overlay_id: textOutput.overlay_id,
                task_id: textOutput.task_id,
                extension: response.mime_type === 'audio/mpeg' ? 'mp3' : 'wav'
            });

            const output: AudioOutput = {
                character_snapshot_id: textOutput.character_snapshot_id,
                overlay_id: textOutput.overlay_id,
                task_id: textOutput.task_id,
                timestamp: new Date().toISOString(),
                audio_url: audioUrl,
                voice_profile: voiceProfile,
            };

            return {
                success: true,
                output,
                audioBuffer: response.audio_data,
                duration_seconds: response.duration_seconds,
            };
        } catch (error) {
            return {
                success: false,
                error: error instanceof Error ? error.message : String(error),
            };
        }
    }

    /**
     * Generate audio for a specific section
     */
    async generateSectionAudio(
        textOutput: TextOutput,
        sectionName: string,
        voiceProfile: VoiceProfile
    ): Promise<AudioGenerationResult> {
        const sectionContent = textOutput.sections[sectionName];
        if (!sectionContent) {
            return {
                success: false,
                error: `Section '${sectionName}' not found in output`,
            };
        }

        const sectionOutput: TextOutput = {
            ...textOutput,
            content: sectionContent,
            sections: { [sectionName]: sectionContent },
        };

        return this.generateAudio(sectionOutput, voiceProfile);
    }

    /**
     * Prepare text for TTS (clean markdown, etc.)
     */
    private prepareTextForTTS(text: string): string {
        return text
            // Remove markdown headers
            .replace(/^#{1,6}\s/gm, '')
            // Remove bold/italic markers
            .replace(/\*\*(.*?)\*\*/g, '$1')
            .replace(/\*(.*?)\*/g, '$1')
            // Convert bullet points to spoken form
            .replace(/^\-\s/gm, '')
            .replace(/^\d+\.\s/gm, '')
            // Remove extra whitespace
            .replace(/\n{3,}/g, '\n\n')
            .trim();
    }

    /**
     * Store audio file and return URL
     */
    private async storeAudio(
        audioData: Buffer,
        metadata: { character_snapshot_id: string; overlay_id: string; task_id: string, extension: string }
    ): Promise<string> {
        const filename = `${metadata.task_id}_${Date.now()}.${metadata.extension}`;

        if (this.storageConfig.type === 'local') {
            // In production, write to disk
            // For now, we simulate the path
            const path = `${this.storageConfig.basePath}/${filename}`;
            console.log(`[AudioPipeline] Would store audio to: ${path}`);
            return `file://${path}`;
        }

        // For s3/gcs, would upload to bucket
        return `https://${this.storageConfig.bucket}.storage.example.com/${filename}`;
    }
}

export function createAudioPipeline(options?: AudioPipelineOptions): AudioPipeline {
    return new AudioPipeline(options);
}

export default AudioPipeline;
