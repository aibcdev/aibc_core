/**
 * Agentwood Character Schema with Zod validation
 */
import { z } from 'zod';
// ============================================
// ZOD SCHEMAS FOR VALIDATION
// ============================================
export const SpeechTraitsSchema = z.object({
    pace: z.enum(['slow', 'measured', 'fast']),
    pitch: z.enum(['low', 'medium', 'high']),
    energy: z.enum(['subdued', 'controlled', 'energetic']),
});
export const VoiceProfileSchema = z.object({
    tts_engine: z.enum(['chatterbox', 'elevenlabs', 'fish']),
    voice_id: z.string().min(1),
    speech_traits: SpeechTraitsSchema,
});
export const PersonaCoreSchema = z.object({
    worldview: z.string().min(1),
    communication_style: z.string().min(1),
    values: z.array(z.string()).min(1),
    strengths: z.array(z.string()).min(1),
    weaknesses: z.array(z.string()),
});
export const LicenseTermsSchema = z.object({
    commercial_use: z.boolean(),
    redistribution: z.boolean(),
    expiry: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Must be YYYY-MM-DD format'),
});
export const CharacterSnapshotSchema = z.object({
    character_snapshot_id: z.string().regex(/^snap_[a-z0-9]+$/, 'Must start with snap_'),
    agentwood_character_id: z.string().regex(/^aw_char_\d+$/, 'Must start with aw_char_'),
    version: z.string().regex(/^v\d+\.\d+$/, 'Must be v{major}.{minor} format'),
    name: z.string().min(1),
    archetype: z.string().min(1),
    persona_core: PersonaCoreSchema,
    voice_profile: VoiceProfileSchema,
    allowed_domains: z.array(z.string()),
    disallowed_domains: z.array(z.string()),
    license_terms: LicenseTermsSchema,
});
// ============================================
// VALIDATION FUNCTIONS
// ============================================
export function validateCharacterSnapshot(data) {
    return CharacterSnapshotSchema.parse(data);
}
export function isValidCharacterSnapshot(data) {
    return CharacterSnapshotSchema.safeParse(data).success;
}
// ============================================
// FACTORY FUNCTIONS
// ============================================
let snapshotCounter = 0;
export function createCharacterSnapshot(options) {
    snapshotCounter++;
    const snapshotId = `snap_${snapshotCounter.toString(36)}${Date.now().toString(36)}`;
    return {
        character_snapshot_id: snapshotId,
        agentwood_character_id: options.agentwood_character_id,
        version: options.version ?? 'v1.0',
        name: options.name,
        archetype: options.archetype,
        persona_core: options.persona_core,
        voice_profile: options.voice_profile,
        allowed_domains: options.allowed_domains ?? [],
        disallowed_domains: options.disallowed_domains ?? [],
        license_terms: {
            commercial_use: options.license_terms?.commercial_use ?? true,
            redistribution: options.license_terms?.redistribution ?? false,
            expiry: options.license_terms?.expiry ?? '2027-01-01',
        },
    };
}
//# sourceMappingURL=character.js.map