/**
 * Voice Profile Schema and utilities
 */
import { z } from 'zod';
import type { VoiceProfile, SpeechTraits } from '../../shared/types.js';

// Pre-defined voice profiles for Chatterbox
// Custom voice seeds from slackvoices
export const CHATTERBOX_VOICES = {
    Female1: {
        tts_engine: 'chatterbox' as const,
        voice_id: 'Female1',
        speech_traits: { pace: 'measured' as const, pitch: 'medium' as const, energy: 'controlled' as const },
    },
    Female2: {
        tts_engine: 'chatterbox' as const,
        voice_id: 'Female2',
        speech_traits: { pace: 'measured' as const, pitch: 'medium' as const, energy: 'controlled' as const },
    },
    Female3: {
        tts_engine: 'chatterbox' as const,
        voice_id: 'Female3',
        speech_traits: { pace: 'measured' as const, pitch: 'medium' as const, energy: 'controlled' as const },
    },
    Female4: {
        tts_engine: 'chatterbox' as const,
        voice_id: 'Female4',
        speech_traits: { pace: 'measured' as const, pitch: 'medium' as const, energy: 'controlled' as const },
    },
    Female5: {
        tts_engine: 'chatterbox' as const,
        voice_id: 'Female5',
        speech_traits: { pace: 'measured' as const, pitch: 'medium' as const, energy: 'controlled' as const },
    },
    Female6: {
        tts_engine: 'chatterbox' as const,
        voice_id: 'Female6',
        speech_traits: { pace: 'measured' as const, pitch: 'medium' as const, energy: 'controlled' as const },
    },
    Male1: {
        tts_engine: 'chatterbox' as const,
        voice_id: 'Male1',
        speech_traits: { pace: 'measured' as const, pitch: 'medium' as const, energy: 'controlled' as const },
    },
    Male2: {
        tts_engine: 'chatterbox' as const,
        voice_id: 'Male2',
        speech_traits: { pace: 'measured' as const, pitch: 'medium' as const, energy: 'controlled' as const },
    },
    Male3: {
        tts_engine: 'chatterbox' as const,
        voice_id: 'Male3',
        speech_traits: { pace: 'measured' as const, pitch: 'medium' as const, energy: 'controlled' as const },
    },
    Male4: {
        tts_engine: 'chatterbox' as const,
        voice_id: 'Male4',
        speech_traits: { pace: 'measured' as const, pitch: 'medium' as const, energy: 'controlled' as const },
    },
    Male5: {
        tts_engine: 'chatterbox' as const,
        voice_id: 'Male5',
        speech_traits: { pace: 'measured' as const, pitch: 'medium' as const, energy: 'controlled' as const },
    },
} satisfies Record<string, VoiceProfile>;

export type ChatterboxVoiceId = keyof typeof CHATTERBOX_VOICES;

export function getVoiceProfile(voiceId: ChatterboxVoiceId): VoiceProfile {
    return CHATTERBOX_VOICES[voiceId];
}

export function createCustomVoiceProfile(
    voiceId: string,
    traits: Partial<SpeechTraits> = {},
    engine: 'chatterbox' | 'elevenlabs' | 'fish' = 'chatterbox'
): VoiceProfile {
    return {
        tts_engine: engine,
        voice_id: voiceId,
        speech_traits: {
            pace: traits.pace ?? 'measured',
            pitch: traits.pitch ?? 'medium',
            energy: traits.energy ?? 'controlled',
        },
    };
}
