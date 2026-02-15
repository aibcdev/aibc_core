import { createCharacterFromArchetype, ARCHETYPES, listArchetypes } from './archetypes/index.js';
import { validateCharacterSnapshot } from './schemas/character.js';
// ============================================
// CHARACTER REGISTRY
// ============================================
class CharacterRegistry {
    characters = new Map();
    /**
     * Register a character
     */
    register(character) {
        // Validate before registering
        validateCharacterSnapshot(character);
        this.characters.set(character.agentwood_character_id, character);
    }
    /**
     * Get a character by ID
     */
    get(characterId) {
        return this.characters.get(characterId);
    }
    /**
     * List all characters
     */
    list() {
        return Array.from(this.characters.values());
    }
    /**
     * Create a licensed snapshot for AIBC
     * This is the key export function - creates a read-only copy
     */
    createSnapshot(characterId) {
        const character = this.characters.get(characterId);
        if (!character)
            return undefined;
        // Create a frozen copy for licensing
        const snapshot = {
            ...character,
            character_snapshot_id: `snap_${Date.now().toString(36)}`,
        };
        return Object.freeze(snapshot);
    }
}
// ============================================
// EXPORT API
// ============================================
export const characterRegistry = new CharacterRegistry();
// Pre-register characters from all archetypes
export function initializeDefaultCharacters() {
    for (const archetype of listArchetypes()) {
        const character = createCharacterFromArchetype(archetype.id);
        characterRegistry.register(character);
    }
}
// Export functions
export function getCharacterSnapshot(characterId) {
    return characterRegistry.createSnapshot(characterId);
}
export function listAvailableCharacters() {
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
//# sourceMappingURL=export.js.map