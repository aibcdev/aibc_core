// Pre-defined voice profiles for Chatterbox
export const CHATTERBOX_VOICES = {
    // Authority voices
    cold_male_01: {
        tts_engine: 'chatterbox',
        voice_id: 'cold_male_01',
        speech_traits: { pace: 'measured', pitch: 'low', energy: 'controlled' },
    },
    cold_female_01: {
        tts_engine: 'chatterbox',
        voice_id: 'cold_female_01',
        speech_traits: { pace: 'measured', pitch: 'medium', energy: 'controlled' },
    },
    // Warm/Mentor voices
    warm_male_01: {
        tts_engine: 'chatterbox',
        voice_id: 'warm_male_01',
        speech_traits: { pace: 'measured', pitch: 'medium', energy: 'energetic' },
    },
    warm_female_01: {
        tts_engine: 'chatterbox',
        voice_id: 'warm_female_01',
        speech_traits: { pace: 'measured', pitch: 'medium', energy: 'energetic' },
    },
    // Analyst voices
    analytical_male_01: {
        tts_engine: 'chatterbox',
        voice_id: 'analytical_male_01',
        speech_traits: { pace: 'slow', pitch: 'low', energy: 'subdued' },
    },
    analytical_female_01: {
        tts_engine: 'chatterbox',
        voice_id: 'analytical_female_01',
        speech_traits: { pace: 'slow', pitch: 'medium', energy: 'subdued' },
    },
    // Energetic/Provocateur voices
    energetic_male_01: {
        tts_engine: 'chatterbox',
        voice_id: 'energetic_male_01',
        speech_traits: { pace: 'fast', pitch: 'high', energy: 'energetic' },
    },
    energetic_female_01: {
        tts_engine: 'chatterbox',
        voice_id: 'energetic_female_01',
        speech_traits: { pace: 'fast', pitch: 'high', energy: 'energetic' },
    },
};
export function getVoiceProfile(voiceId) {
    return CHATTERBOX_VOICES[voiceId];
}
export function createCustomVoiceProfile(voiceId, traits = {}, engine = 'chatterbox') {
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
//# sourceMappingURL=voice.js.map