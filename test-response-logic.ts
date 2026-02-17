import 'dotenv/config';
import { runAutonomousLoop } from './web/src/lib/aibc/signals/orchestrator.js';

async function testResponseLogic() {
    const GEMINI_API_KEY = process.env.GEMINI_API_KEY || '';
    if (!GEMINI_API_KEY) {
        console.error("❌ GEMINI_API_KEY missing");
        process.exit(1);
    }

    console.log("=== VERIFYING JULIUS RESPONSE LOGIC ===\n");

    const scenarios = [
        {
            name: "Scenario 1: Explicit Mention",
            objective: "Hi Julius, what do you think of the new design?",
            isMention: true,
            expectResponse: true
        },
        {
            name: "Scenario 2: Active Thread (No tag)",
            objective: "I agree with Julius, the latency is a bit high.",
            isMention: false,
            expectResponse: true
        },
        {
            name: "Scenario 3: Irrelevant Channel Noise (No tag)",
            objective: "What's everyone having for lunch?",
            isMention: false,
            expectResponse: false // Expect [skip_response]
        },
        {
            name: "Scenario 4: Name addressed directly (No tag)",
            objective: "Julius what do think about the world cup this summer",
            isMention: true, // In reality, the bridge will now set this to true
            expectResponse: true
        }
    ];

    for (const scenario of scenarios) {
        console.log(`\n🏃 Running: ${scenario.name}`);
        console.log(`   Message: "${scenario.objective}" (isMention: ${scenario.isMention})`);

        try {
            const result = await runAutonomousLoop(
                'oracle',
                scenario.objective,
                'General Marketing Assistant',
                GEMINI_API_KEY,
                'test-user',
                'test-channel-logic-test', // Unique channel to test memory/thread association
                5, // maxSteps
                scenario.isMention,
                process.env.SLACK_BOT_TOKEN
            );

            if (result.success) {
                const output = result.finalOutput;
                const skipped = output.includes("[skip_response]");

                console.log(`   Result: ${skipped ? "[SKIP]" : "[RESPONDED]"}`);
                console.log(`   Output: "${output.substring(0, 100)}${output.length > 100 ? '...' : ''}"`);

                if (scenario.expectResponse && skipped) {
                    console.error(`   ❌ FAILED: Expected response, but Julius skipped.`);
                } else if (!scenario.expectResponse && !skipped) {
                    console.error(`   ❌ FAILED: Expected skip, but Julius responded.`);
                } else {
                    console.log(`   ✅ PASSED`);
                }
            } else {
                console.error(`   ❌ ERROR: ${result.error}`);
            }
        } catch (e: any) {
            console.error(`   ❌ Pipeline Error: ${e.message}`);
        }
    }

    console.log("\n=== VERIFICATION COMPLETE ===");
}

testResponseLogic();
