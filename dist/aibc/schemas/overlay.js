/**
 * AIBC Brand Overlay Schema
 *
 * THIS is where uniqueness + scalability comes from.
 * Companies feel "trained" without touching the Agentwood character.
 */
import { z } from 'zod';
// ============================================
// ZOD SCHEMAS FOR VALIDATION
// ============================================
export const ToneAdjustmentsSchema = z.object({
    warmth: z.number().min(-3).max(3),
    confidence: z.number().min(-3).max(3),
    formality: z.number().min(-3).max(3),
});
export const BrandContextSchema = z.object({
    company_description: z.string().min(1),
    target_audience: z.array(z.string()).min(1),
    brand_values: z.array(z.string()).min(1),
    forbidden_phrases: z.array(z.string()),
    preferred_phrases: z.array(z.string()),
    tone_adjustments: ToneAdjustmentsSchema,
});
export const StyleConstraintsSchema = z.object({
    sentence_length: z.enum(['short', 'medium', 'long']),
    use_bullets: z.boolean(),
    cta_style: z.enum(['soft_authoritative', 'direct', 'subtle', 'none']),
});
export const ComplianceRulesSchema = z.object({
    no_false_claims: z.boolean(),
    no_financial_promises: z.boolean(),
    custom_rules: z.array(z.string()).optional(),
});
export const BrandOverlaySchema = z.object({
    overlay_id: z.string().regex(/^ovr_[a-z0-9_]+$/, 'Must start with ovr_'),
    client_id: z.string().regex(/^client_[a-z0-9_]+$/, 'Must start with client_'),
    brand_context: BrandContextSchema,
    style_constraints: StyleConstraintsSchema,
    compliance_rules: ComplianceRulesSchema,
});
// ============================================
// VALIDATION FUNCTIONS
// ============================================
export function validateBrandOverlay(data) {
    return BrandOverlaySchema.parse(data);
}
export function isValidBrandOverlay(data) {
    return BrandOverlaySchema.safeParse(data).success;
}
// ============================================
// FACTORY FUNCTIONS
// ============================================
let overlayCounter = 0;
export function createBrandOverlay(options) {
    overlayCounter++;
    const overlayId = `ovr_brand_${overlayCounter}`;
    return {
        overlay_id: overlayId,
        client_id: options.client_id,
        brand_context: {
            company_description: options.company_description,
            target_audience: options.target_audience,
            brand_values: options.brand_values,
            forbidden_phrases: options.forbidden_phrases ?? [],
            preferred_phrases: options.preferred_phrases ?? [],
            tone_adjustments: {
                warmth: options.tone_adjustments?.warmth ?? 0,
                confidence: options.tone_adjustments?.confidence ?? 0,
                formality: options.tone_adjustments?.formality ?? 0,
            },
        },
        style_constraints: {
            sentence_length: options.style_constraints?.sentence_length ?? 'medium',
            use_bullets: options.style_constraints?.use_bullets ?? true,
            cta_style: options.style_constraints?.cta_style ?? 'soft_authoritative',
        },
        compliance_rules: {
            no_false_claims: options.compliance_rules?.no_false_claims ?? true,
            no_financial_promises: options.compliance_rules?.no_financial_promises ?? false,
            custom_rules: options.compliance_rules?.custom_rules,
        },
    };
}
// ============================================
// PRESET OVERLAYS FOR COMMON INDUSTRIES
// ============================================
export const INDUSTRY_PRESETS = {
    b2b_saas: {
        tone_adjustments: { warmth: 0, confidence: 1, formality: 1 },
        style_constraints: { sentence_length: 'medium', use_bullets: true, cta_style: 'soft_authoritative' },
        compliance_rules: { no_false_claims: true, no_financial_promises: true },
        forbidden_phrases: ['game-changing', 'disruptive', 'revolutionary'],
        preferred_phrases: ['scalable', 'enterprise-grade', 'proven'],
    },
    fintech: {
        tone_adjustments: { warmth: -1, confidence: 2, formality: 2 },
        style_constraints: { sentence_length: 'medium', use_bullets: true, cta_style: 'subtle' },
        compliance_rules: { no_false_claims: true, no_financial_promises: true },
        forbidden_phrases: ['guaranteed returns', 'risk-free', 'get rich'],
        preferred_phrases: ['risk-adjusted', 'capital efficiency', 'regulatory compliant'],
    },
    consumer_brand: {
        tone_adjustments: { warmth: 2, confidence: 1, formality: -1 },
        style_constraints: { sentence_length: 'short', use_bullets: false, cta_style: 'direct' },
        compliance_rules: { no_false_claims: true, no_financial_promises: false },
        forbidden_phrases: ['unprecedented', 'one-time offer'],
        preferred_phrases: ['trending', 'fan-favorite', 'community-loved'],
    },
    healthcare: {
        tone_adjustments: { warmth: 1, confidence: 1, formality: 2 },
        style_constraints: { sentence_length: 'medium', use_bullets: true, cta_style: 'subtle' },
        compliance_rules: { no_false_claims: true, no_financial_promises: true, custom_rules: ['No diagnosis claims', 'Include disclaimers'] },
        forbidden_phrases: ['cure', 'guaranteed healing', 'miracle'],
        preferred_phrases: ['clinically studied', 'health-focused', 'wellness-oriented'],
    },
};
export function createBrandOverlayFromPreset(preset, options) {
    const p = INDUSTRY_PRESETS[preset];
    return createBrandOverlay({
        ...options,
        tone_adjustments: p.tone_adjustments,
        style_constraints: p.style_constraints,
        compliance_rules: p.compliance_rules,
        forbidden_phrases: p.forbidden_phrases,
        preferred_phrases: p.preferred_phrases,
    });
}
//# sourceMappingURL=overlay.js.map