/**
 * AIBC Core Platform - Usage Example
 * 
 * Demonstrates the full flow:
 * 1. Get character from Agentwood
 * 2. Create brand overlay for client
 * 3. Define task
 * 4. Execute with Claude
 * 5. Generate audio
 */
import {
    // Agentwood
    initializeDefaultCharacters,
    getCharacterSnapshot,
    listAvailableArchetypes,
    createCharacterFromArchetype,

    // AIBC
    createBrandOverlayFromPreset,
    createTaskFromTemplate,
    createTaskEngine,
    createAudioPipeline,
    textPipeline,
} from './index.js';

async function main() {
    console.log('='.repeat(60));
    console.log('AIBC Core Platform - Example Execution');
    console.log('='.repeat(60));
    console.log();

    // ----------------------------------------
    // STEP 1: Initialize Agentwood Characters
    // ----------------------------------------
    console.log('1. Initializing Agentwood characters...');
    initializeDefaultCharacters();

    const archetypes = listAvailableArchetypes();
    console.log(`   Loaded ${archetypes.length} archetypes:`);
    archetypes.forEach(a => console.log(`   - ${a.name} (${a.id})`));
    console.log();

    // ----------------------------------------
    // STEP 2: Create character snapshot
    // ----------------------------------------
    console.log('2. Creating character snapshot (Cold Authority)...');
    const character = createCharacterFromArchetype('cold_authority', {
        name: 'Strategic Authority',
    });
    console.log(`   Character ID: ${character.agentwood_character_id}`);
    console.log(`   Archetype: ${character.archetype}`);
    console.log(`   Voice: ${character.voice_profile.voice_id}`);
    console.log();

    // ----------------------------------------
    // STEP 3: Create brand overlay (AIBC)
    // ----------------------------------------
    console.log('3. Creating brand overlay for client...');
    const overlay = createBrandOverlayFromPreset('fintech', {
        client_id: 'client_acme_corp',
        company_description: 'B2B SaaS for CFOs managing cash flow and financial planning',
        target_audience: ['CFO', 'Finance Director', 'VP Finance'],
        brand_values: ['trust', 'precision', 'authority'],
    });
    console.log(`   Overlay ID: ${overlay.overlay_id}`);
    console.log(`   Client: ${overlay.client_id}`);
    console.log(`   Industry preset: fintech`);
    console.log(`   Forbidden phrases: ${overlay.brand_context.forbidden_phrases.join(', ')}`);
    console.log();

    // ----------------------------------------
    // STEP 4: Define task
    // ----------------------------------------
    console.log('4. Creating task (competitor analysis)...');
    const task = createTaskFromTemplate('competitor_analysis', {
        objective: 'Identify positioning gaps between the client and key competitors',
        inputs: {
            competitors: ['Ramp', 'Brex', 'Airbase'],
            market: 'US mid-market SaaS',
            focus_areas: ['pricing strategy', 'feature differentiation', 'brand positioning'],
        },
    });
    console.log(`   Task ID: ${task.task_id}`);
    console.log(`   Type: ${task.task_type}`);
    console.log(`   Outputs: ${task.outputs_required.join(', ')}`);
    console.log();

    // ----------------------------------------
    // STEP 5: Execute task with TaskEngine
    // ----------------------------------------
    console.log('5. Executing task with Claude (mock mode)...');
    const taskEngine = createTaskEngine(); // No API key = mock mode

    const result = await taskEngine.executeTask(character, overlay, task);

    if (result.success && result.output) {
        console.log(`   ✓ Task completed in ${result.duration_ms}ms`);
        console.log(`   Token usage: ${result.usage?.input_tokens} in / ${result.usage?.output_tokens} out`);
        console.log();

        // Validate output
        const validation = textPipeline.validateOutput(result.output, task);
        console.log(`   Validation: ${validation.valid ? '✓ Passed' : '✗ Failed'}`);
        console.log(`   Word count: ${validation.wordCount}`);
        console.log(`   Sections found: ${validation.sectionCount}/${task.outputs_required.length}`);
        console.log();

        // Show formatted output
        console.log('6. Generated content:');
        console.log('-'.repeat(60));
        console.log(result.output.content);
        console.log('-'.repeat(60));
        console.log();
    } else {
        console.log(`   ✗ Task failed: ${result.error}`);
        return;
    }

    // ----------------------------------------
    // STEP 6: Generate audio (stub mode)
    // ----------------------------------------
    console.log('7. Generating audio with Chatterbox (stub mode)...');
    const audioPipeline = createAudioPipeline();

    const audioResult = await audioPipeline.generateAudio(
        result.output!,
        character.voice_profile
    );

    if (audioResult.success) {
        console.log(`   ✓ Audio generated`);
        console.log(`   Duration: ${audioResult.duration_seconds?.toFixed(1)}s`);
        console.log(`   URL: ${audioResult.output?.audio_url}`);
    } else {
        console.log(`   ✗ Audio failed: ${audioResult.error}`);
    }

    console.log();
    console.log('='.repeat(60));
    console.log('Example complete!');
    console.log('='.repeat(60));
}

// Run example
main().catch(console.error);
