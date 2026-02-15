
import { createAudioPipeline } from './src/aibc/pipelines/audio.ts';
import type { TextOutput, VoiceProfile } from './src/shared/types.ts';

async function verifyPipeline() {
    console.log('--- Verifying Audio Pipeline ---');

    const pipeline = createAudioPipeline({
        chatterboxEndpoint: 'stub',
        elevenLabsApiKey: 'mock-key' // Should trigger real logic if valid key provided, but fails auth. 
        // We expect errors if we try to call real APIs with mock keys, but that proves routing works.
    });

    const mockTextOutput: TextOutput = {
        character_snapshot_id: 'char-1',
        overlay_id: 'overlay-1',
        task_id: 'task-1',
        timestamp: new Date().toISOString(),
        content: "This is a test verifying the new pipeline logic.",
        sections: {}
    };

    // Test 1: Chatterbox (Stub)
    console.log('\n[Test 1] Testing Chatterbox (Stub)...');
    const chatterboxResult = await pipeline.generateAudio(
        mockTextOutput,
        {
            tts_engine: 'chatterbox',
            voice_id: 'cold_male_01',
            speech_traits: { pace: 'measured', pitch: 'low', energy: 'controlled' }
        }
    );
    console.log('Chatterbox Result:', chatterboxResult.success ? 'SUCCESS' : 'FAILED', chatterboxResult.error || '');

    // Test 2: Fish Speech (Alias for Chatterbox)
    console.log('\n[Test 2] Testing Fish Speech (Alias)...');
    const fishResult = await pipeline.generateAudio(
        mockTextOutput,
        {
            tts_engine: 'fish',
            voice_id: 'fish_voice_01',
            speech_traits: { pace: 'fast', pitch: 'high', energy: 'energetic' }
        }
    );
    console.log('Fish Speech Result:', fishResult.success ? 'SUCCESS' : 'FAILED', fishResult.error || '');

    // Test 3: ElevenLabs (Expect API Error with mock key)
    console.log('\n[Test 3] Testing ElevenLabs routing...');
    const elevenResult = await pipeline.generateAudio(
        mockTextOutput,
        {
            tts_engine: 'elevenlabs',
            voice_id: 'eleven_voice_id',
            speech_traits: { pace: 'measured', pitch: 'medium', energy: 'controlled' }
        }
    );

    // Test 4: Emotion Tags (Fish Speech)
    console.log('\n[Test 4] Testing Emotion Tag Pass-through...');
    const emotionTextOutput: TextOutput = {
        ...mockTextOutput,
        content: "(excited) (whispering) This is a secret excitement."
    };

    // We expect the Chatterbox/Fish provider to receive this text AS IS,
    // because Fish Speech handles the tags.
    const emotionResult = await pipeline.generateAudio(
        emotionTextOutput,
        {
            tts_engine: 'fish',
            voice_id: 'fish_voice_01',
            speech_traits: { pace: 'fast', pitch: 'high', energy: 'energetic' }
        }
    );
    // Since we are in STUB mode, we just check success. 
    // In a real unit test we'd spy on the fetch call. 
    // For now, manual inspection of the log "[Chatterbox] Generating speech..." is enough if we added logging there.
    console.log('Emotion Tag Result:', emotionResult.success ? 'SUCCESS' : 'FAILED');
}

verifyPipeline();
