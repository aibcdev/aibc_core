
import 'dotenv/config';
console.log("Dotenv loaded.");
const dependencies = [
    { name: 'types', path: './web/src/lib/aibc/types.js' },
    { name: 'voice', path: './web/src/lib/aibc/super-agent/voice.js' },
    { name: 'browser', path: './web/src/lib/aibc/super-agent/browser.js' },
    { name: 'social-memory', path: './web/src/lib/aibc/super-agent/social-memory.js' },
    { name: 'sandbox-mock', path: './web/src/lib/aibc/super-agent/sandbox.js' },
    { name: 'orchestrator', path: './web/src/lib/aibc/signals/orchestrator.js' },
    { name: 'bridge', path: './src/aibc/connectors/multi-channel-bridge.js' }
];

for (const dep of dependencies) {
    try {
        console.log(`Attempting to import ${dep.name} from ${dep.path}...`);
        await import(dep.path);
        console.log(`${dep.name} imported successfully.`);
    } catch (e) {
        console.error(`${dep.name} import failed:`, e);
    }
}

console.log("Deep diagnostic complete.");
