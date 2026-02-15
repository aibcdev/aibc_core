/**
 * Agentwood Archetypes - Pre-built character personas
 *
 * These are the 10-30 high-quality archetypes that power AIBC.
 * Each archetype can be used by hundreds of clients with different overlays.
 */
import type { PersonaCore, VoiceProfile, CharacterSnapshot } from '../../shared/types.js';
export interface ArchetypeDefinition {
    id: string;
    name: string;
    description: string;
    persona_core: PersonaCore;
    default_voice: VoiceProfile;
    recommended_domains: string[];
    not_suitable_for: string[];
}
export declare const ARCHETYPES: Record<string, ArchetypeDefinition>;
export declare function getArchetype(id: string): ArchetypeDefinition | undefined;
export declare function listArchetypes(): ArchetypeDefinition[];
export declare function findArchetypesByDomain(domain: string): ArchetypeDefinition[];
/**
 * Create a character snapshot from an archetype
 */
export declare function createCharacterFromArchetype(archetypeId: string, options?: {
    characterId?: string;
    name?: string;
    voiceOverride?: VoiceProfile;
    additionalDomains?: string[];
    disallowedDomains?: string[];
}): CharacterSnapshot;
export default ARCHETYPES;
//# sourceMappingURL=index.d.ts.map