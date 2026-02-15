
const basePath = './web/src/lib/aibc/super-agent/';
const deps = [
    'sandbox',
    'browser',
    'social-memory'
];

for (const dep of deps) {
    try {
        console.log(`Testing import of ./web/src/lib/aibc/super-agent/${dep}...`);
        await import(`${basePath}${dep}.js`);
        console.log(`${dep} success.`);
    } catch (e) {
        console.error(`${dep} failed:`, e);
    }
}

console.log("Super-agent diagnostic complete.");
