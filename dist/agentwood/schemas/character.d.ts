/**
 * Agentwood Character Schema with Zod validation
 */
import { z } from 'zod';
import type { CharacterSnapshot, PersonaCore, VoiceProfile, LicenseTerms } from '../../shared/types.js';
export declare const SpeechTraitsSchema: z.ZodObject<{
    pace: z.ZodEnum<["slow", "measured", "fast"]>;
    pitch: z.ZodEnum<["low", "medium", "high"]>;
    energy: z.ZodEnum<["subdued", "controlled", "energetic"]>;
}, "strip", z.ZodTypeAny, {
    pace: "slow" | "measured" | "fast";
    pitch: "low" | "medium" | "high";
    energy: "subdued" | "controlled" | "energetic";
}, {
    pace: "slow" | "measured" | "fast";
    pitch: "low" | "medium" | "high";
    energy: "subdued" | "controlled" | "energetic";
}>;
export declare const VoiceProfileSchema: z.ZodObject<{
    tts_engine: z.ZodEnum<["chatterbox", "elevenlabs", "fish"]>;
    voice_id: z.ZodString;
    speech_traits: z.ZodObject<{
        pace: z.ZodEnum<["slow", "measured", "fast"]>;
        pitch: z.ZodEnum<["low", "medium", "high"]>;
        energy: z.ZodEnum<["subdued", "controlled", "energetic"]>;
    }, "strip", z.ZodTypeAny, {
        pace: "slow" | "measured" | "fast";
        pitch: "low" | "medium" | "high";
        energy: "subdued" | "controlled" | "energetic";
    }, {
        pace: "slow" | "measured" | "fast";
        pitch: "low" | "medium" | "high";
        energy: "subdued" | "controlled" | "energetic";
    }>;
}, "strip", z.ZodTypeAny, {
    tts_engine: "chatterbox" | "elevenlabs" | "fish";
    voice_id: string;
    speech_traits: {
        pace: "slow" | "measured" | "fast";
        pitch: "low" | "medium" | "high";
        energy: "subdued" | "controlled" | "energetic";
    };
}, {
    tts_engine: "chatterbox" | "elevenlabs" | "fish";
    voice_id: string;
    speech_traits: {
        pace: "slow" | "measured" | "fast";
        pitch: "low" | "medium" | "high";
        energy: "subdued" | "controlled" | "energetic";
    };
}>;
export declare const PersonaCoreSchema: z.ZodObject<{
    worldview: z.ZodString;
    communication_style: z.ZodString;
    values: z.ZodArray<z.ZodString, "many">;
    strengths: z.ZodArray<z.ZodString, "many">;
    weaknesses: z.ZodArray<z.ZodString, "many">;
}, "strip", z.ZodTypeAny, {
    values: string[];
    worldview: string;
    communication_style: string;
    strengths: string[];
    weaknesses: string[];
}, {
    values: string[];
    worldview: string;
    communication_style: string;
    strengths: string[];
    weaknesses: string[];
}>;
export declare const LicenseTermsSchema: z.ZodObject<{
    commercial_use: z.ZodBoolean;
    redistribution: z.ZodBoolean;
    expiry: z.ZodString;
}, "strip", z.ZodTypeAny, {
    commercial_use: boolean;
    redistribution: boolean;
    expiry: string;
}, {
    commercial_use: boolean;
    redistribution: boolean;
    expiry: string;
}>;
export declare const CharacterSnapshotSchema: z.ZodObject<{
    character_snapshot_id: z.ZodString;
    agentwood_character_id: z.ZodString;
    version: z.ZodString;
    name: z.ZodString;
    archetype: z.ZodString;
    persona_core: z.ZodObject<{
        worldview: z.ZodString;
        communication_style: z.ZodString;
        values: z.ZodArray<z.ZodString, "many">;
        strengths: z.ZodArray<z.ZodString, "many">;
        weaknesses: z.ZodArray<z.ZodString, "many">;
    }, "strip", z.ZodTypeAny, {
        values: string[];
        worldview: string;
        communication_style: string;
        strengths: string[];
        weaknesses: string[];
    }, {
        values: string[];
        worldview: string;
        communication_style: string;
        strengths: string[];
        weaknesses: string[];
    }>;
    voice_profile: z.ZodObject<{
        tts_engine: z.ZodEnum<["chatterbox", "elevenlabs", "fish"]>;
        voice_id: z.ZodString;
        speech_traits: z.ZodObject<{
            pace: z.ZodEnum<["slow", "measured", "fast"]>;
            pitch: z.ZodEnum<["low", "medium", "high"]>;
            energy: z.ZodEnum<["subdued", "controlled", "energetic"]>;
        }, "strip", z.ZodTypeAny, {
            pace: "slow" | "measured" | "fast";
            pitch: "low" | "medium" | "high";
            energy: "subdued" | "controlled" | "energetic";
        }, {
            pace: "slow" | "measured" | "fast";
            pitch: "low" | "medium" | "high";
            energy: "subdued" | "controlled" | "energetic";
        }>;
    }, "strip", z.ZodTypeAny, {
        tts_engine: "chatterbox" | "elevenlabs" | "fish";
        voice_id: string;
        speech_traits: {
            pace: "slow" | "measured" | "fast";
            pitch: "low" | "medium" | "high";
            energy: "subdued" | "controlled" | "energetic";
        };
    }, {
        tts_engine: "chatterbox" | "elevenlabs" | "fish";
        voice_id: string;
        speech_traits: {
            pace: "slow" | "measured" | "fast";
            pitch: "low" | "medium" | "high";
            energy: "subdued" | "controlled" | "energetic";
        };
    }>;
    allowed_domains: z.ZodArray<z.ZodString, "many">;
    disallowed_domains: z.ZodArray<z.ZodString, "many">;
    license_terms: z.ZodObject<{
        commercial_use: z.ZodBoolean;
        redistribution: z.ZodBoolean;
        expiry: z.ZodString;
    }, "strip", z.ZodTypeAny, {
        commercial_use: boolean;
        redistribution: boolean;
        expiry: string;
    }, {
        commercial_use: boolean;
        redistribution: boolean;
        expiry: string;
    }>;
}, "strip", z.ZodTypeAny, {
    character_snapshot_id: string;
    agentwood_character_id: string;
    version: string;
    name: string;
    archetype: string;
    persona_core: {
        values: string[];
        worldview: string;
        communication_style: string;
        strengths: string[];
        weaknesses: string[];
    };
    voice_profile: {
        tts_engine: "chatterbox" | "elevenlabs" | "fish";
        voice_id: string;
        speech_traits: {
            pace: "slow" | "measured" | "fast";
            pitch: "low" | "medium" | "high";
            energy: "subdued" | "controlled" | "energetic";
        };
    };
    allowed_domains: string[];
    disallowed_domains: string[];
    license_terms: {
        commercial_use: boolean;
        redistribution: boolean;
        expiry: string;
    };
}, {
    character_snapshot_id: string;
    agentwood_character_id: string;
    version: string;
    name: string;
    archetype: string;
    persona_core: {
        values: string[];
        worldview: string;
        communication_style: string;
        strengths: string[];
        weaknesses: string[];
    };
    voice_profile: {
        tts_engine: "chatterbox" | "elevenlabs" | "fish";
        voice_id: string;
        speech_traits: {
            pace: "slow" | "measured" | "fast";
            pitch: "low" | "medium" | "high";
            energy: "subdued" | "controlled" | "energetic";
        };
    };
    allowed_domains: string[];
    disallowed_domains: string[];
    license_terms: {
        commercial_use: boolean;
        redistribution: boolean;
        expiry: string;
    };
}>;
export declare function validateCharacterSnapshot(data: unknown): CharacterSnapshot;
export declare function isValidCharacterSnapshot(data: unknown): data is CharacterSnapshot;
export declare function createCharacterSnapshot(options: {
    agentwood_character_id: string;
    name: string;
    archetype: string;
    persona_core: PersonaCore;
    voice_profile: VoiceProfile;
    allowed_domains?: string[];
    disallowed_domains?: string[];
    license_terms?: Partial<LicenseTerms>;
    version?: string;
}): CharacterSnapshot;
//# sourceMappingURL=character.d.ts.map