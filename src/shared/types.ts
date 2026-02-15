/**
 * Shared types for AIBC/Agentwood platform
 */

// ============================================
// AGENTWOOD TYPES (Character IP)
// ============================================

export interface PersonaCore {
    worldview: string;
    communication_style: string;
    values: string[];
    strengths: string[];
    weaknesses: string[];
}

export interface SpeechTraits {
    pace: 'slow' | 'measured' | 'fast';
    pitch: 'low' | 'medium' | 'high';
    energy: 'subdued' | 'controlled' | 'energetic';
}

export interface VoiceProfile {
    tts_engine: 'chatterbox' | 'elevenlabs' | 'fish';
    voice_id: string;
    speech_traits: SpeechTraits;
}

export interface LicenseTerms {
    commercial_use: boolean;
    redistribution: boolean;
    expiry: string; // ISO date
}

export interface CharacterSnapshot {
    character_snapshot_id: string;
    agentwood_character_id: string;
    version: string;
    name: string;
    archetype: string;
    persona_core: PersonaCore;
    voice_profile: VoiceProfile;
    allowed_domains: string[];
    disallowed_domains: string[];
    license_terms: LicenseTerms;
}

// ============================================
// AIBC TYPES (Marketing Platform)
// ============================================

export interface ToneAdjustments {
    warmth: number;      // -3 to +3
    confidence: number;  // -3 to +3
    formality: number;   // -3 to +3
}

export interface BrandContext {
    company_description: string;
    target_audience: string[];
    brand_values: string[];
    forbidden_phrases: string[];
    preferred_phrases: string[];
    tone_adjustments: ToneAdjustments;
}

export interface StyleConstraints {
    sentence_length: 'short' | 'medium' | 'long';
    use_bullets: boolean;
    cta_style: 'soft_authoritative' | 'direct' | 'subtle' | 'none';
}

export interface ComplianceRules {
    no_false_claims: boolean;
    no_financial_promises: boolean;
    custom_rules?: string[];
}

export interface BrandOverlay {
    overlay_id: string;
    client_id: string;
    brand_context: BrandContext;
    style_constraints: StyleConstraints;
    compliance_rules: ComplianceRules;
}

export interface TaskConstraints {
    max_words?: number;
    avoid_jargon?: boolean;
    format?: string;
}

export interface TaskDefinition {
    task_id: string;
    task_type: string;
    objective: string;
    inputs: Record<string, unknown>;
    outputs_required: string[];
    constraints: TaskConstraints;
}

// ============================================
// OUTPUT TYPES
// ============================================

export interface AudioOutput {
    character_snapshot_id: string;
    overlay_id: string;
    task_id: string;
    timestamp: string;
    audio_url: string;
    voice_profile: VoiceProfile;
}

export interface TextOutput {
    character_snapshot_id: string;
    overlay_id: string;
    task_id: string;
    timestamp: string;
    content: string;
    sections: Record<string, string>;
}
