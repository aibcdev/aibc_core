/**
 * Agentwood Character Export API
 *
 * Provides licensed snapshots of characters to AIBC.
 */
import type { CharacterSnapshot } from '../shared/types.js';
import { createCharacterFromArchetype, ARCHETYPES } from './archetypes/index.js';
declare class CharacterRegistry {
    private characters;
    /**
     * Register a character
     */
    register(character: CharacterSnapshot): void;
    /**
     * Get a character by ID
     */
    get(characterId: string): CharacterSnapshot | undefined;
    /**
     * List all characters
     */
    list(): CharacterSnapshot[];
    /**
     * Create a licensed snapshot for AIBC
     * This is the key export function - creates a read-only copy
     */
    createSnapshot(characterId: string): CharacterSnapshot | undefined;
}
export declare const characterRegistry: CharacterRegistry;
export declare function initializeDefaultCharacters(): void;
export declare function getCharacterSnapshot(characterId: string): CharacterSnapshot | undefined;
export declare function listAvailableCharacters(): Array<{
    id: string;
    name: string;
    archetype: string;
}>;
export declare function listAvailableArchetypes(): import("./archetypes/index.js").ArchetypeDefinition[];
export { ARCHETYPES, createCharacterFromArchetype };
export * from './schemas/character.js';
export * from './schemas/voice.js';
//# sourceMappingURL=export.d.ts.map