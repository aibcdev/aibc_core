
import 'dotenv/config';

async function verifyProductionReady() {
    console.log("🔍 Verifying Production Readiness...");

    const PORT = process.env.PORT || 3000;
    const baseUrl = `http://localhost:${PORT}`;

    // 1. Check Root Healthcheck
    try {
        console.log(`Checking Root Healthcheck: ${baseUrl}/`);
        const res = await fetch(`${baseUrl}/`);
        const data = await res.json() as any;
        if (res.ok && data.status === 'ok') {
            console.log("✅ Root healthcheck passed.");
        } else {
            console.error("❌ Root healthcheck failed:", data);
        }
    } catch (e) {
        console.error("❌ Could not connect to bridge server. Is it running?");
    }

    // 2. Check Slack Events Healthcheck
    try {
        console.log(`Checking Slack Events Healthcheck: ${baseUrl}/slack/events`);
        const res = await fetch(`${baseUrl}/slack/events`);
        const data = await res.json() as any;
        if (res.ok && data.status === 'listening') {
            console.log("✅ Slack events healthcheck passed.");
        } else {
            console.error("❌ Slack events healthcheck failed:", data);
        }
    } catch (e) {
        console.error("❌ Could not connect to slack events endpoint.");
    }

    // 3. Environment Variables
    const requiredEnv = [
        'SLACK_BOT_TOKEN',
        'SLACK_SIGNING_SECRET',
        'GEMINI_API_KEY',
    ];

    for (const env of requiredEnv) {
        if (process.env[env]) {
            console.log(`✅ ${env} is present.`);
        } else {
            console.warn(`⚠️ ${env} is missing in local .env! (Critical for production)`);
        }
    }

    console.log("\nVerification Complete.");
}

verifyProductionReady();
