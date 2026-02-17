import 'dotenv/config';

async function diagnose() {
    const token = process.env.SLACK_BOT_TOKEN;
    if (!token) {
        console.error("❌ No SLACK_BOT_TOKEN found in .env");
        return;
    }

    console.log(`\n🔍 Diagnosing Token: ${token.substring(0, 10)}... (Safe View)`);

    try {
        // 1. Check Auth & Scopes
        console.log("👉 Checking 'auth.test' to see active scopes...");
        const authRes = await fetch('https://slack.com/api/auth.test', {
            method: 'POST',
            headers: { 'Authorization': `Bearer ${token}` }
        });

        if (!authRes.ok) {
            console.error(`❌ HTTP Error: ${authRes.status}`);
            return;
        }

        const authData = await authRes.json() as any;

        // Slack returns scopes in the headers usually, but for bot tokens, we might need to check the response metadata usually found in headers 'x-oauth-scopes'
        const scopes = authRes.headers.get('x-oauth-scopes');
        console.log(`\n🎫  **ACTIVE SCOPES**: ${scopes || "Unknown (Check headers)"}`);
        console.log(`🤖  Bot Identity: ${authData.user} (${authData.user_id})`);

        if (!authData.ok) {
            console.error(`❌ Auth Failed: ${authData.error}`);
            return;
        }

        // 2. Check Channels
        console.log("\n👉 Testing 'conversations.list'...");
        const listRes = await fetch('https://slack.com/api/conversations.list?types=public_channel,private_channel', {
            headers: { 'Authorization': `Bearer ${token}` }
        });

        const listData = await listRes.json() as any;

        if (listData.ok) {
            console.log(`✅  SUCCESS! Found ${listData.channels.length} channels.`);
        } else {
            console.error(`❌  FAILED: ${listData.error}`);
            if (listData.error === 'missing_scope') {
                console.log(`    -> You are missing 'channels:read' or 'groups:read' or 'im:read'`);
            }
        }

    } catch (error) {
        console.error("Diagnostic failed:", error);
    }
}

diagnose();
