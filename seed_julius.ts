import { addCogneeMemory } from './web/src/lib/aibc/signals/cognee.js';

const AIBC_BLURB = `
AIBC (Artificial Intelligence Business Corporation) is building the next generation of physical intelligence and autonomous marketing infrastructure. 
The flagship product is the Super Agent Engine, which coordinates a colony of specialized AI agents to automate high-level business logic.
Akeem Ojuko is the Co-founder & Visionary, focusing on strategy and brand equity.
Abiel is the Co-founder & Engineering Lead, focusing on platform architecture and scaling.
Julius is a Co-founder level AI team member driving technical and strategic outcomes.
`;

async function seed() {
    console.log("Seeding Julius's Knowledge Graph...");
    const success = await addCogneeMemory('watchaibc@gmail.com', 'oracle', AIBC_BLURB, 'assistant');
    if (success) {
        console.log("Success: Julius now understands AIBC.");
    } else {
        console.error("Failed to seed memory.");
    }
}

seed();
