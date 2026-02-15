
import fs from 'fs';
import path from 'path';

// NATIVE FETCH (Node 18+)
// No import needed

const API_KEY = 'sk_e8ae2e735b24b6bc31c568ed07b6aa9398c57c5b2cfc6e67';
const OUTPUT_DIR = './training_data';

// Target Diversity Quotas
const TARGET_COUNT = 30;
const TEXT_TO_SPEAK = "In the end, it’s not the years in your life that count. It’s the life in your years. We must strive to be better than we were yesterday, embracing every challenge as a new adventure.";

interface Voice {
    voice_id: string;
    name: string;
    labels?: {
        accent?: string;
        age?: string;
        gender?: string;
        use_case?: string;
        descriptive?: string;
    };
    preview_url?: string;
}

async function main() {
    if (!fs.existsSync(OUTPUT_DIR)) {
        fs.mkdirSync(OUTPUT_DIR);
    }

    console.log('1. Fetching available voices...');
    const allVoices = await fetchVoices();
    console.log(`-> Found ${allVoices.length} total voices.`);

    console.log('2. Curating diverse selection...');
    const selectedVoices = curationLogic(allVoices);

    console.log('3. Starting Generation Loop...');
    console.log(`-> Generating clips for ${selectedVoices.length} voices.`);

    // Save manifest of selected voices
    fs.writeFileSync(
        path.join(OUTPUT_DIR, 'manifest.json'),
        JSON.stringify(selectedVoices, null, 2)
    );

    for (const [index, voice] of selectedVoices.entries()) {
        console.log(`[${index + 1}/${selectedVoices.length}] Generating for: ${voice.name} (${voice.voice_id})`);
        try {
            await generateClip(voice);
        } catch (err) {
            console.error(`Failed to generate for ${voice.name}:`, err);
        }
    }

    console.log('\nDone! Check ./training_data folder.');
}

async function fetchVoices(): Promise<Voice[]> {
    const response = await fetch('https://api.elevenlabs.io/v1/voices', {
        headers: {
            'xi-api-key': API_KEY,
            'Content-Type': 'application/json'
        }
    });
    const data = await response.json() as any;
    return data.voices;
}

function curationLogic(voices: Voice[]): Voice[] {
    const selected: Voice[] = [];
    const usedIds = new Set<string>();

    const add = (v: Voice) => {
        if (!usedIds.has(v.voice_id)) {
            selected.push(v);
            usedIds.add(v.voice_id);
        }
    };

    // Helper filters
    const filterBy = (fn: (v: Voice) => boolean) => voices.filter(fn);

    // 1. SPECIALS (Fantasy / Character / Narrative) - Aim for 5
    const characters = filterBy(v =>
        v.labels?.use_case === 'characters_animation' ||
        v.labels?.use_case === 'narrative_story' ||
        v.labels?.descriptive === 'intense'
    );
    characters.slice(0, 6).forEach(add);

    // 2. OLDER VOICES (Wisdom / Villain potential) - Aim for 5
    const old = filterBy(v => v.labels?.age === 'old' || v.labels?.descriptive === 'raspy' || v.labels?.descriptive === 'deep');
    old.slice(0, 5).forEach(add);

    // 3. ACCENTS (British / Australian) - Aim for 8 (4 each)
    const british = filterBy(v => v.labels?.accent === 'british');
    british.slice(0, 4).forEach(add);

    const aussie = filterBy(v => v.labels?.accent === 'australian');
    aussie.slice(0, 4).forEach(add);

    // 4. GENERAL DIVERSITY (Young/Middle-Aged, Male/Female) - Fill rest
    const remainingNeeded = TARGET_COUNT - selected.length;

    // Shuffle remaining voices
    const pool = voices.filter(v => !usedIds.has(v.voice_id));
    const shuffled = pool.sort(() => 0.5 - Math.random());

    shuffled.slice(0, remainingNeeded).forEach(add);

    return selected;
}

async function generateClip(voice: Voice) {
    const response = await fetch(`https://api.elevenlabs.io/v1/text-to-speech/${voice.voice_id}`, {
        method: 'POST',
        headers: {
            'xi-api-key': API_KEY,
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            text: TEXT_TO_SPEAK,
            model_id: "eleven_monolingual_v1",
            voice_settings: {
                stability: 0.5,
                similarity_boost: 0.75
            }
        })
    });

    if (!response.ok) {
        throw new Error(`API Error ${response.status}: ${await response.text()}`);
    }

    const buffer = await response.arrayBuffer();
    // Sanitize filename
    const safeName = voice.name.replace(/[^a-z0-9]/gi, '_').toLowerCase();
    const filePath = path.join(OUTPUT_DIR, `${safeName}_${voice.voice_id}.mp3`);

    fs.writeFileSync(filePath, Buffer.from(buffer));
    console.log(`-> Saved: ${filePath}`);
}

main();
