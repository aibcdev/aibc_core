console.log("Start import...");
try {
    await import('./src/aibc/connectors/bridge-server.ts');
    console.log("Import success");
} catch (e) {
    console.error("Import failed:", e);
}
