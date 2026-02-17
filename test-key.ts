import 'dotenv/config';

async function testGeminiKey() {
    const key = process.env.GEMINI_API_KEY;
    if (!key) {
        console.error("❌ No GEMINI_API_KEY found in .env");
        return;
    }

    console.log(`🔑 Testing Key: ${key.substring(0, 10)}... (Length: ${key.length})`);

    const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${key}`;
    const payload = {
        contents: [{ role: 'user', parts: [{ text: "Hello" }] }]
    };

    try {
        const response = await fetch(url, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload)
        });

        const data = await response.json() as any;

        if (response.ok) {
            console.log("✅ SUCCESS! API Key is working.");
            console.log("Response:", data.candidates?.[0]?.content?.parts?.[0]?.text);
        } else {
            console.error(`❌ FAILED: ${response.status} ${response.statusText}`);
            console.error("Error Details:", JSON.stringify(data, null, 2));
        }
    } catch (error) {
        console.error("Network Error:", error);
    }
}

testGeminiKey();
