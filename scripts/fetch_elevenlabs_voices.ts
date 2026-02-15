

import fs from 'fs';

const API_KEY = 'sk_e8ae2e735b24b6bc31c568ed07b6aa9398c57c5b2cfc6e67';

async function fetchVoices() {
    console.log('Fetching voices from ElevenLabs...');
    try {
        const response = await fetch('https://api.elevenlabs.io/v1/voices', {
            method: 'GET',
            headers: {
                'xi-api-key': API_KEY,
                'Content-Type': 'application/json'
            }
        });

        if (!response.ok) {
            throw new Error(`API Error: ${response.status} ${await response.text()}`);
        }

        const data = await response.json();
        const voices = data.voices;

        console.log(`Successfully fetched ${voices.length} voices.`);

        // Save full dump to analyze tags
        fs.writeFileSync('elevenlabs_voices_dump.json', JSON.stringify(voices, null, 2));
        console.log('Saved to elevenlabs_voices_dump.json');

        // Log a few samples to see structure
        console.log('\nSample Voice Metadata:');
        console.log(JSON.stringify(voices.slice(0, 3), null, 2));

        // Analyze tags
        const allLabels = new Set();
        voices.forEach(v => {
            if (v.labels) {
                Object.keys(v.labels).forEach(k => allLabels.add(`${k}: ${v.labels[k]}`));
            }
        });

        console.log('\nUnique Labels found:');
        console.log(Array.from(allLabels).slice(0, 20)); // Show first 20 variations

    } catch (error) {
        console.error('Failed:', error);
    }
}

fetchVoices();
