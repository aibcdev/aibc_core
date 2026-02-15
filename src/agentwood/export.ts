/**
 * Agentwood Character Export API
 * 
 * Provides licensed snapshots of characters to AIBC.
 */
import type { CharacterSnapshot } from '../shared/types.js';
import { createCharacterFromArchetype, ARCHETYPES, listArchetypes } from './archetypes/index.js';
import { validateCharacterSnapshot } from './schemas/character.js';

// ============================================
// CHARACTER REGISTRY
// ============================================

class CharacterRegistry {
    private characters: Map<string, CharacterSnapshot> = new Map();

    /**
     * Register a character
     */
    register(character: CharacterSnapshot): void {
        // Validate before registering
        validateCharacterSnapshot(character);
        this.characters.set(character.agentwood_character_id, character);
    }

    /**
     * Get a character by ID
     */
    get(characterId: string): CharacterSnapshot | undefined {
        return this.characters.get(characterId);
    }

    /**
     * List all characters
     */
    list(): CharacterSnapshot[] {
        return Array.from(this.characters.values());
    }

    /**
     * Create a licensed snapshot for AIBC
     * This is the key export function - creates a read-only copy
     */
    createSnapshot(characterId: string): CharacterSnapshot | undefined {
        const character = this.characters.get(characterId);
        if (!character) return undefined;

        // Create a frozen copy for licensing
        const snapshot: CharacterSnapshot = {
            ...character,
            character_snapshot_id: `snap_${Date.now().toString(36)}`,
        };

        return Object.freeze(snapshot) as CharacterSnapshot;
    }
}

// ============================================
// EXPORT API
// ============================================

export const characterRegistry = new CharacterRegistry();

// Pre-register characters from all archetypes
export function initializeDefaultCharacters(): void {
    for (const archetype of listArchetypes()) {
        const character = createCharacterFromArchetype(archetype.id);
        characterRegistry.register(character);
    }
}

// Export functions
export function getCharacterSnapshot(characterId: string): CharacterSnapshot | undefined {
    return characterRegistry.createSnapshot(characterId);
}

export function listAvailableCharacters(): Array<{ id: string; name: string; archetype: string }> {
    return characterRegistry.list().map(c => ({
        id: c.agentwood_character_id,
        name: c.name,
        archetype: c.archetype,
    }));
}

export function listAvailableArchetypes() {
    return listArchetypes();
}

// Re-exports
export { ARCHETYPES, createCharacterFromArchetype };
export * from './schemas/character.js';
export * from './schemas/voice.js';
