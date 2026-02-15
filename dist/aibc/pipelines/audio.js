class ChatterboxClient {
    config;
    constructor(config) {
        this.config = config;
    }
    async generateSpeech(request) {
        // In production, this would call the Chatterbox RunPod endpoint
        // For now, return a stub response
        console.log(`[Chatterbox] Generating speech for voice: ${request.voice_id}`);
        console.log(`[Chatterbox] Text length: ${request.text.length} chars`);
        console.log(`[Chatterbox] Traits: pace=${request.speech_traits.pace}, pitch=${request.speech_traits.pitch}, energy=${request.speech_traits.energy}`);
        // Simulate API call
        if (this.config.endpoint === 'stub') {
            return {
                audio_data: Buffer.from('STUB_AUDIO_DATA'),
                duration_seconds: request.text.length * 0.05, // Rough estimate
                sample_rate: 22050,
            };
        }
        // Real implementation would be:
        // const response = await fetch(this.config.endpoint, {
        //   method: 'POST',
        //   headers: {
        //     'Content-Type': 'application/json',
        //     'Authorization': `Bearer ${this.config.apiKey}`,
        //   },
        //   body: JSON.stringify(request),
        // });
        // return await response.json();
        throw new Error('Chatterbox endpoint not configured');
    }
}
export class AudioPipeline {
    chatterbox;
    storageConfig;
    constructor(options = {}) {
        this.chatterbox = new ChatterboxClient({
            endpoint: options.chatterboxEndpoint ?? 'stub',
            apiKey: options.chatterboxApiKey,
        });
        this.storageConfig = {
            type: options.storage?.type ?? 'local',
            basePath: options.storage?.basePath ?? './audio_output',
            bucket: options.storage?.bucket,
        };
    }
    /**
     * Generate audio from text output
     */
    async generateAudio(textOutput, voiceProfile) {
        try {
            // Prepare text for TTS
            const cleanText = this.prepareTextForTTS(textOutput.content);
            // Generate speech
            const response = await this.chatterbox.generateSpeech({
                text: cleanText,
                voice_id: voiceProfile.voice_id,
                speech_traits: voiceProfile.speech_traits,
            });
            // Store audio
            const audioUrl = await this.storeAudio(response.audio_data, {
                character_snapshot_id: textOutput.character_snapshot_id,
                overlay_id: textOutput.overlay_id,
                task_id: textOutput.task_id,
            });
            const output = {
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
        }
        catch (error) {
            return {
                success: false,
                error: error instanceof Error ? error.message : String(error),
            };
        }
    }
    /**
     * Generate audio for a specific section
     */
    async generateSectionAudio(textOutput, sectionName, voiceProfile) {
        const sectionContent = textOutput.sections[sectionName];
        if (!sectionContent) {
            return {
                success: false,
                error: `Section '${sectionName}' not found in output`,
            };
        }
        const sectionOutput = {
            ...textOutput,
            content: sectionContent,
            sections: { [sectionName]: sectionContent },
        };
        return this.generateAudio(sectionOutput, voiceProfile);
    }
    /**
     * Prepare text for TTS (clean markdown, etc.)
     */
    prepareTextForTTS(text) {
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
    async storeAudio(audioData, metadata) {
        const filename = `${metadata.task_id}_${Date.now()}.wav`;
        if (this.storageConfig.type === 'local') {
            // In production, write to disk
            const path = `${this.storageConfig.basePath}/${filename}`;
            console.log(`[AudioPipeline] Would store audio to: ${path}`);
            return `file://${path}`;
        }
        // For s3/gcs, would upload to bucket
        return `https://${this.storageConfig.bucket}.storage.example.com/${filename}`;
    }
    /**
     * Update Chatterbox endpoint (for switching between self-hosted and RunPod)
     */
    setEndpoint(endpoint, apiKey) {
        this.chatterbox = new ChatterboxClient({ endpoint, apiKey });
    }
}
export function createAudioPipeline(options) {
    return new AudioPipeline(options);
}
export default AudioPipeline;
//# sourceMappingURL=audio.js.map