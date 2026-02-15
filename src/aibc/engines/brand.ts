/**
 * Brand Overlay Engine
 * 
 * Manages brand overlays and applies them to character outputs.
 * AIBC NEVER modifies Agentwood characters - it wraps them with overlays.
 */
import type { BrandOverlay, CharacterSnapshot } from '../../shared/types.js';
import { createBrandOverlay, createBrandOverlayFromPreset, INDUSTRY_PRESETS } from '../schemas/overlay.js';

// ============================================
// BRAND ENGINE CLASS
// ============================================

export class BrandEngine {
    private overlays: Map<string, BrandOverlay> = new Map();

    /**
     * Register a new brand overlay
     */
    registerOverlay(overlay: BrandOverlay): void {
        this.overlays.set(overlay.overlay_id, overlay);
    }

    /**
     * Get an overlay by ID
     */
    getOverlay(overlayId: string): BrandOverlay | undefined {
        return this.overlays.get(overlayId);
    }

    /**
     * Get all overlays for a client
     */
    getClientOverlays(clientId: string): BrandOverlay[] {
        return Array.from(this.overlays.values()).filter(o => o.client_id === clientId);
    }

    /**
     * Create and register a new overlay
     */
    createOverlay(options: Parameters<typeof createBrandOverlay>[0]): BrandOverlay {
        const overlay = createBrandOverlay(options);
        this.registerOverlay(overlay);
        return overlay;
    }

    /**
     * Create overlay from industry preset
     */
    createFromPreset(
        preset: keyof typeof INDUSTRY_PRESETS,
        options: {
            client_id: string;
            company_description: string;
            target_audience: string[];
            brand_values: string[];
        }
    ): BrandOverlay {
        const overlay = createBrandOverlayFromPreset(preset, options);
        this.registerOverlay(overlay);
        return overlay;
    }

    /**
     * Validate that a character can be used with an overlay
     * Checks domain restrictions and license terms
     */
    validateCompatibility(snapshot: CharacterSnapshot, overlay: BrandOverlay): ValidationResult {
        const issues: string[] = [];

        // Check if character license allows commercial use
        if (!snapshot.license_terms.commercial_use) {
            issues.push('Character license does not allow commercial use');
        }

        // Check license expiry
        const expiryDate = new Date(snapshot.license_terms.expiry);
        if (expiryDate < new Date()) {
            issues.push('Character license has expired');
        }

        // This is a soft check - we don't enforce domain restrictions strictly
        // but we flag potential mismatches
        const hasRelevantDomain = snapshot.allowed_domains.some(domain => {
            const overlayText = [
                overlay.brand_context.company_description,
                ...overlay.brand_context.target_audience,
                ...overlay.brand_context.brand_values,
            ].join(' ').toLowerCase();
            return overlayText.includes(domain.toLowerCase());
        });

        if (!hasRelevantDomain && snapshot.allowed_domains.length > 0) {
            issues.push(`Character may not be optimal for this brand context. Allowed domains: ${snapshot.allowed_domains.join(', ')}`);
        }

        return {
            valid: issues.length === 0 || (issues.length === 1 && issues[0].includes('may not be optimal')),
            issues,
            warnings: issues.filter(i => i.includes('may not be optimal')),
            errors: issues.filter(i => !i.includes('may not be optimal')),
        };
    }

    /**
     * Merge tone adjustments (overlay adjusts character base)
     */
    getMergedTone(snapshot: CharacterSnapshot, overlay: BrandOverlay): ToneSummary {
        const base = this.getCharacterBaseTone(snapshot);
        const adj = overlay.brand_context.tone_adjustments;

        return {
            warmth: Math.max(-3, Math.min(3, base.warmth + adj.warmth)),
            confidence: Math.max(-3, Math.min(3, base.confidence + adj.confidence)),
            formality: Math.max(-3, Math.min(3, base.formality + adj.formality)),
        };
    }

    /**
     * Extract base tone from character archetype
     */
    private getCharacterBaseTone(snapshot: CharacterSnapshot): ToneSummary {
        // Map known archetypes to base tones
        const archetypeTones: Record<string, ToneSummary> = {
            cold_authority: { warmth: -2, confidence: 3, formality: 2 },
            warm_mentor: { warmth: 3, confidence: 1, formality: 0 },
            provocateur: { warmth: -1, confidence: 2, formality: -1 },
            analyst: { warmth: -1, confidence: 2, formality: 2 },
            visionary: { warmth: 1, confidence: 2, formality: 1 },
            pragmatist: { warmth: 0, confidence: 2, formality: 1 },
            storyteller: { warmth: 2, confidence: 1, formality: 0 },
            technical_expert: { warmth: -1, confidence: 2, formality: 2 },
            diplomatic: { warmth: 2, confidence: 1, formality: 2 },
            creative_maverick: { warmth: 1, confidence: 2, formality: -2 },
        };

        return archetypeTones[snapshot.archetype] ?? { warmth: 0, confidence: 0, formality: 0 };
    }

    /**
     * List all registered overlays
     */
    listOverlays(): BrandOverlay[] {
        return Array.from(this.overlays.values());
    }

    /**
     * Remove an overlay
     */
    removeOverlay(overlayId: string): boolean {
        return this.overlays.delete(overlayId);
    }
}

// ============================================
// TYPES
// ============================================

interface ValidationResult {
    valid: boolean;
    issues: string[];
    warnings: string[];
    errors: string[];
}

interface ToneSummary {
    warmth: number;
    confidence: number;
    formality: number;
}

// Export singleton instance
export const brandEngine = new BrandEngine();
export default BrandEngine;
