/**
 * AIBC Brand Overlay Schema
 *
 * THIS is where uniqueness + scalability comes from.
 * Companies feel "trained" without touching the Agentwood character.
 */
import { z } from 'zod';
import type { BrandOverlay, StyleConstraints, ComplianceRules, ToneAdjustments } from '../../shared/types.js';
export declare const ToneAdjustmentsSchema: z.ZodObject<{
    warmth: z.ZodNumber;
    confidence: z.ZodNumber;
    formality: z.ZodNumber;
}, "strip", z.ZodTypeAny, {
    warmth: number;
    confidence: number;
    formality: number;
}, {
    warmth: number;
    confidence: number;
    formality: number;
}>;
export declare const BrandContextSchema: z.ZodObject<{
    company_description: z.ZodString;
    target_audience: z.ZodArray<z.ZodString, "many">;
    brand_values: z.ZodArray<z.ZodString, "many">;
    forbidden_phrases: z.ZodArray<z.ZodString, "many">;
    preferred_phrases: z.ZodArray<z.ZodString, "many">;
    tone_adjustments: z.ZodObject<{
        warmth: z.ZodNumber;
        confidence: z.ZodNumber;
        formality: z.ZodNumber;
    }, "strip", z.ZodTypeAny, {
        warmth: number;
        confidence: number;
        formality: number;
    }, {
        warmth: number;
        confidence: number;
        formality: number;
    }>;
}, "strip", z.ZodTypeAny, {
    company_description: string;
    target_audience: string[];
    brand_values: string[];
    forbidden_phrases: string[];
    preferred_phrases: string[];
    tone_adjustments: {
        warmth: number;
        confidence: number;
        formality: number;
    };
}, {
    company_description: string;
    target_audience: string[];
    brand_values: string[];
    forbidden_phrases: string[];
    preferred_phrases: string[];
    tone_adjustments: {
        warmth: number;
        confidence: number;
        formality: number;
    };
}>;
export declare const StyleConstraintsSchema: z.ZodObject<{
    sentence_length: z.ZodEnum<["short", "medium", "long"]>;
    use_bullets: z.ZodBoolean;
    cta_style: z.ZodEnum<["soft_authoritative", "direct", "subtle", "none"]>;
}, "strip", z.ZodTypeAny, {
    sentence_length: "medium" | "short" | "long";
    use_bullets: boolean;
    cta_style: "soft_authoritative" | "direct" | "subtle" | "none";
}, {
    sentence_length: "medium" | "short" | "long";
    use_bullets: boolean;
    cta_style: "soft_authoritative" | "direct" | "subtle" | "none";
}>;
export declare const ComplianceRulesSchema: z.ZodObject<{
    no_false_claims: z.ZodBoolean;
    no_financial_promises: z.ZodBoolean;
    custom_rules: z.ZodOptional<z.ZodArray<z.ZodString, "many">>;
}, "strip", z.ZodTypeAny, {
    no_false_claims: boolean;
    no_financial_promises: boolean;
    custom_rules?: string[] | undefined;
}, {
    no_false_claims: boolean;
    no_financial_promises: boolean;
    custom_rules?: string[] | undefined;
}>;
export declare const BrandOverlaySchema: z.ZodObject<{
    overlay_id: z.ZodString;
    client_id: z.ZodString;
    brand_context: z.ZodObject<{
        company_description: z.ZodString;
        target_audience: z.ZodArray<z.ZodString, "many">;
        brand_values: z.ZodArray<z.ZodString, "many">;
        forbidden_phrases: z.ZodArray<z.ZodString, "many">;
        preferred_phrases: z.ZodArray<z.ZodString, "many">;
        tone_adjustments: z.ZodObject<{
            warmth: z.ZodNumber;
            confidence: z.ZodNumber;
            formality: z.ZodNumber;
        }, "strip", z.ZodTypeAny, {
            warmth: number;
            confidence: number;
            formality: number;
        }, {
            warmth: number;
            confidence: number;
            formality: number;
        }>;
    }, "strip", z.ZodTypeAny, {
        company_description: string;
        target_audience: string[];
        brand_values: string[];
        forbidden_phrases: string[];
        preferred_phrases: string[];
        tone_adjustments: {
            warmth: number;
            confidence: number;
            formality: number;
        };
    }, {
        company_description: string;
        target_audience: string[];
        brand_values: string[];
        forbidden_phrases: string[];
        preferred_phrases: string[];
        tone_adjustments: {
            warmth: number;
            confidence: number;
            formality: number;
        };
    }>;
    style_constraints: z.ZodObject<{
        sentence_length: z.ZodEnum<["short", "medium", "long"]>;
        use_bullets: z.ZodBoolean;
        cta_style: z.ZodEnum<["soft_authoritative", "direct", "subtle", "none"]>;
    }, "strip", z.ZodTypeAny, {
        sentence_length: "medium" | "short" | "long";
        use_bullets: boolean;
        cta_style: "soft_authoritative" | "direct" | "subtle" | "none";
    }, {
        sentence_length: "medium" | "short" | "long";
        use_bullets: boolean;
        cta_style: "soft_authoritative" | "direct" | "subtle" | "none";
    }>;
    compliance_rules: z.ZodObject<{
        no_false_claims: z.ZodBoolean;
        no_financial_promises: z.ZodBoolean;
        custom_rules: z.ZodOptional<z.ZodArray<z.ZodString, "many">>;
    }, "strip", z.ZodTypeAny, {
        no_false_claims: boolean;
        no_financial_promises: boolean;
        custom_rules?: string[] | undefined;
    }, {
        no_false_claims: boolean;
        no_financial_promises: boolean;
        custom_rules?: string[] | undefined;
    }>;
}, "strip", z.ZodTypeAny, {
    overlay_id: string;
    client_id: string;
    brand_context: {
        company_description: string;
        target_audience: string[];
        brand_values: string[];
        forbidden_phrases: string[];
        preferred_phrases: string[];
        tone_adjustments: {
            warmth: number;
            confidence: number;
            formality: number;
        };
    };
    style_constraints: {
        sentence_length: "medium" | "short" | "long";
        use_bullets: boolean;
        cta_style: "soft_authoritative" | "direct" | "subtle" | "none";
    };
    compliance_rules: {
        no_false_claims: boolean;
        no_financial_promises: boolean;
        custom_rules?: string[] | undefined;
    };
}, {
    overlay_id: string;
    client_id: string;
    brand_context: {
        company_description: string;
        target_audience: string[];
        brand_values: string[];
        forbidden_phrases: string[];
        preferred_phrases: string[];
        tone_adjustments: {
            warmth: number;
            confidence: number;
            formality: number;
        };
    };
    style_constraints: {
        sentence_length: "medium" | "short" | "long";
        use_bullets: boolean;
        cta_style: "soft_authoritative" | "direct" | "subtle" | "none";
    };
    compliance_rules: {
        no_false_claims: boolean;
        no_financial_promises: boolean;
        custom_rules?: string[] | undefined;
    };
}>;
export declare function validateBrandOverlay(data: unknown): BrandOverlay;
export declare function isValidBrandOverlay(data: unknown): data is BrandOverlay;
export declare function createBrandOverlay(options: {
    client_id: string;
    company_description: string;
    target_audience: string[];
    brand_values: string[];
    forbidden_phrases?: string[];
    preferred_phrases?: string[];
    tone_adjustments?: Partial<ToneAdjustments>;
    style_constraints?: Partial<StyleConstraints>;
    compliance_rules?: Partial<ComplianceRules>;
}): BrandOverlay;
export declare const INDUSTRY_PRESETS: {
    b2b_saas: {
        tone_adjustments: {
            warmth: number;
            confidence: number;
            formality: number;
        };
        style_constraints: {
            sentence_length: "medium";
            use_bullets: boolean;
            cta_style: "soft_authoritative";
        };
        compliance_rules: {
            no_false_claims: boolean;
            no_financial_promises: boolean;
        };
        forbidden_phrases: string[];
        preferred_phrases: string[];
    };
    fintech: {
        tone_adjustments: {
            warmth: number;
            confidence: number;
            formality: number;
        };
        style_constraints: {
            sentence_length: "medium";
            use_bullets: boolean;
            cta_style: "subtle";
        };
        compliance_rules: {
            no_false_claims: boolean;
            no_financial_promises: boolean;
        };
        forbidden_phrases: string[];
        preferred_phrases: string[];
    };
    consumer_brand: {
        tone_adjustments: {
            warmth: number;
            confidence: number;
            formality: number;
        };
        style_constraints: {
            sentence_length: "short";
            use_bullets: boolean;
            cta_style: "direct";
        };
        compliance_rules: {
            no_false_claims: boolean;
            no_financial_promises: boolean;
        };
        forbidden_phrases: string[];
        preferred_phrases: string[];
    };
    healthcare: {
        tone_adjustments: {
            warmth: number;
            confidence: number;
            formality: number;
        };
        style_constraints: {
            sentence_length: "medium";
            use_bullets: boolean;
            cta_style: "subtle";
        };
        compliance_rules: {
            no_false_claims: boolean;
            no_financial_promises: boolean;
            custom_rules: string[];
        };
        forbidden_phrases: string[];
        preferred_phrases: string[];
    };
};
export declare function createBrandOverlayFromPreset(preset: keyof typeof INDUSTRY_PRESETS, options: {
    client_id: string;
    company_description: string;
    target_audience: string[];
    brand_values: string[];
}): BrandOverlay;
//# sourceMappingURL=overlay.d.ts.map