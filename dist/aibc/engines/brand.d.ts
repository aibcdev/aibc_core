/**
 * Brand Overlay Engine
 *
 * Manages brand overlays and applies them to character outputs.
 * AIBC NEVER modifies Agentwood characters - it wraps them with overlays.
 */
import type { BrandOverlay, CharacterSnapshot } from '../../shared/types.js';
import { createBrandOverlay, INDUSTRY_PRESETS } from '../schemas/overlay.js';
export declare class BrandEngine {
    private overlays;
    /**
     * Register a new brand overlay
     */
    registerOverlay(overlay: BrandOverlay): void;
    /**
     * Get an overlay by ID
     */
    getOverlay(overlayId: string): BrandOverlay | undefined;
    /**
     * Get all overlays for a client
     */
    getClientOverlays(clientId: string): BrandOverlay[];
    /**
     * Create and register a new overlay
     */
    createOverlay(options: Parameters<typeof createBrandOverlay>[0]): BrandOverlay;
    /**
     * Create overlay from industry preset
     */
    createFromPreset(preset: keyof typeof INDUSTRY_PRESETS, options: {
        client_id: string;
        company_description: string;
        target_audience: string[];
        brand_values: string[];
    }): BrandOverlay;
    /**
     * Validate that a character can be used with an overlay
     * Checks domain restrictions and license terms
     */
    validateCompatibility(snapshot: CharacterSnapshot, overlay: BrandOverlay): ValidationResult;
    /**
     * Merge tone adjustments (overlay adjusts character base)
     */
    getMergedTone(snapshot: CharacterSnapshot, overlay: BrandOverlay): ToneSummary;
    /**
     * Extract base tone from character archetype
     */
    private getCharacterBaseTone;
    /**
     * List all registered overlays
     */
    listOverlays(): BrandOverlay[];
    /**
     * Remove an overlay
     */
    removeOverlay(overlayId: string): boolean;
}
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
export declare const brandEngine: BrandEngine;
export default BrandEngine;
//# sourceMappingURL=brand.d.ts.map