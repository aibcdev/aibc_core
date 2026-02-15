import type { VoiceProfile, SpeechTraits } from '../../shared/types.js';
export declare const CHATTERBOX_VOICES: {
    cold_male_01: {
        tts_engine: "chatterbox";
        voice_id: string;
        speech_traits: {
            pace: "measured";
            pitch: "low";
            energy: "controlled";
        };
    };
    cold_female_01: {
        tts_engine: "chatterbox";
        voice_id: string;
        speech_traits: {
            pace: "measured";
            pitch: "medium";
            energy: "controlled";
        };
    };
    warm_male_01: {
        tts_engine: "chatterbox";
        voice_id: string;
        speech_traits: {
            pace: "measured";
            pitch: "medium";
            energy: "energetic";
        };
    };
    warm_female_01: {
        tts_engine: "chatterbox";
        voice_id: string;
        speech_traits: {
            pace: "measured";
            pitch: "medium";
            energy: "energetic";
        };
    };
    analytical_male_01: {
        tts_engine: "chatterbox";
        voice_id: string;
        speech_traits: {
            pace: "slow";
            pitch: "low";
            energy: "subdued";
        };
    };
    analytical_female_01: {
        tts_engine: "chatterbox";
        voice_id: string;
        speech_traits: {
            pace: "slow";
            pitch: "medium";
            energy: "subdued";
        };
    };
    energetic_male_01: {
        tts_engine: "chatterbox";
        voice_id: string;
        speech_traits: {
            pace: "fast";
            pitch: "high";
            energy: "energetic";
        };
    };
    energetic_female_01: {
        tts_engine: "chatterbox";
        voice_id: string;
        speech_traits: {
            pace: "fast";
            pitch: "high";
            energy: "energetic";
        };
    };
};
export type ChatterboxVoiceId = keyof typeof CHATTERBOX_VOICES;
export declare function getVoiceProfile(voiceId: ChatterboxVoiceId): VoiceProfile;
export declare function createCustomVoiceProfile(voiceId: string, traits?: Partial<SpeechTraits>, engine?: 'chatterbox' | 'elevenlabs' | 'fish'): VoiceProfile;
//# sourceMappingURL=voice.d.ts.map