
const basePath = './web/src/lib/aibc/signals/';
const deps = [
    'ingestion',
    'agents',
    'storage',
    'memory',
    'connectors'
];

for (const dep of deps) {
    try {
        console.log(`Testing import of ./web/src/lib/aibc/signals/${dep}...`);
        await import(`${basePath}${dep}.js`);
        console.log(`${dep} success.`);
    } catch (e) {
        console.error(`${dep} failed:`, e);
    }
}

console.log("Orchestrator sub-diagnostic complete.");
