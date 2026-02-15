/**
 * Audio Output Pipeline - Chatterbox TTS Integration
 *
 * Flow:
 * 1. Claude Opus generates structured text
 * 2. Text passed to Chatterbox TTS using voice_profile
 * 3. Audio stored with full metadata
 */
import type { VoiceProfile, AudioOutput, TextOutput } from '../../shared/types.js';
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
export declare class AudioPipeline {
    private chatterbox;
    private storageConfig;
    constructor(options?: {
        chatterboxEndpoint?: string;
        chatterboxApiKey?: string;
        storage?: Partial<AudioStorageConfig>;
    });
    /**
     * Generate audio from text output
     */
    generateAudio(textOutput: TextOutput, voiceProfile: VoiceProfile): Promise<AudioGenerationResult>;
    /**
     * Generate audio for a specific section
     */
    generateSectionAudio(textOutput: TextOutput, sectionName: string, voiceProfile: VoiceProfile): Promise<AudioGenerationResult>;
    /**
     * Prepare text for TTS (clean markdown, etc.)
     */
    private prepareTextForTTS;
    /**
     * Store audio file and return URL
     */
    private storeAudio;
    /**
     * Update Chatterbox endpoint (for switching between self-hosted and RunPod)
     */
    setEndpoint(endpoint: string, apiKey?: string): void;
}
export interface AudioPipelineOptions {
    chatterboxEndpoint?: string;
    chatterboxApiKey?: string;
    storage?: Partial<AudioStorageConfig>;
}
export declare function createAudioPipeline(options?: AudioPipelineOptions): AudioPipeline;
export default AudioPipeline;
//# sourceMappingURL=audio.d.ts.map