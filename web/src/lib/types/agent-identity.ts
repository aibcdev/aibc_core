/**
 * Agent Identity Schema
 * Voice-First, Human-First Training Model
 * 
 * Identity = Immutable (locked after upload)
 * Personality = Derived (auto-detected, not editable)
 * Behavior = Adjustable (user-controlled, safe ranges)
 */

// ============================================================================
// IDENTITY LAYER (Immutable)
// ============================================================================

export interface IdentityLayer {
    voice_fingerprint: string;      // Unique hash of voice
    accent_profile: string;         // Auto-detected (e.g., "British", "American-Midwest")
    cadence_profile: string;        // Auto-detected (e.g., "measured", "rapid", "deliberate")
    gender_lock: 'male' | 'female' | 'neutral';
    age_band_lock: 'young' | 'middle' | 'mature';

    // Source tracking
    source_duration_seconds: number;
    source_type: 'podcast' | 'voice_note' | 'call' | 'youtube' | 'video' | 'other';
    locked_at: Date;
}

// ============================================================================
// PERSONALITY LAYER (Derived, Not Editable)
// ============================================================================

export interface PersonalityLayer {
    confidence: number;      // 0-100
    warmth: number;          // 0-100
    assertiveness: number;   // 0-100
    humor: number;           // 0-100
    authority: number;       // 0-100

    // Derived from digital footprint
    topics_lean_into: string[];
    topics_avoid: string[];
    vocabulary_signature: string[];  // Distinctive phrases
    persuasion_style: 'logical' | 'emotional' | 'authority' | 'social_proof';
}

// ============================================================================
// BEHAVIOR LAYER (Editable by User)
// ============================================================================

export type BehaviorLevel = 'low' | 'medium' | 'high';

export interface BehaviorLayer {
    sales_directness: BehaviorLevel;
    conversational_assertiveness: BehaviorLevel;
    humor_level: 'none' | 'subtle' | 'moderate';
    formality: 'casual' | 'neutral' | 'formal';
    risk_tolerance: 'conservative' | 'moderate' | 'bold';
    conversation_style: 'consultative' | 'directive' | 'educational' | 'friendly';
}

// ============================================================================
// AGENT PROFILE (Combined)
// ============================================================================

export type AgentType = 'personal_brand' | 'company_product' | 'sales_growth';

export type AgentRole =
    | 'lead_qualification'
    | 'sales_conversations'
    | 'brand_ambassador'
    | 'content_repurposing'
    | 'customer_education';

export interface AgentProfile {
    id: string;
    name: string;
    type: AgentType;
    role: AgentRole;

    // The 3 Layers
    identity: IdentityLayer;
    personality: PersonalityLayer;
    behavior: BehaviorLayer;

    // Deployment
    deployed_to: ('bland' | 'widget' | 'whatsapp' | 'sms' | 'internal')[];
    created_at: Date;
    updated_at: Date;
}

// ============================================================================
// ONBOARDING STATE
// ============================================================================

export type OnboardingStep = 1 | 2 | 3 | 4 | 5;

export interface OnboardingState {
    current_step: OnboardingStep;

    // Step 1: Agent Type
    agent_type: AgentType | null;

    // Step 2: Voice Upload
    voice_file: File | null;
    voice_duration_seconds: number;
    voice_upload_status: 'idle' | 'uploading' | 'processing' | 'complete' | 'error';

    // Step 3: Digital Footprint
    footprint_links: string[];
    footprint_files: File[];

    // Step 4: Role
    agent_role: AgentRole | null;

    // Step 5: Preview
    preview_samples: {
        greeting: string | null;
        objection: string | null;
        pitch: string | null;
        casual: string | null;
    };

    // Completion
    is_complete: boolean;
}

// ============================================================================
// DEFAULTS
// ============================================================================

export const DEFAULT_BEHAVIOR: BehaviorLayer = {
    sales_directness: 'medium',
    conversational_assertiveness: 'medium',
    humor_level: 'subtle',
    formality: 'neutral',
    risk_tolerance: 'moderate',
    conversation_style: 'consultative'
};

export const INITIAL_ONBOARDING_STATE: OnboardingState = {
    current_step: 1,
    agent_type: null,
    voice_file: null,
    voice_duration_seconds: 0,
    voice_upload_status: 'idle',
    footprint_links: [],
    footprint_files: [],
    agent_role: null,
    preview_samples: {
        greeting: null,
        objection: null,
        pitch: null,
        casual: null
    },
    is_complete: false
};
