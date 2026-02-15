/**
 * Claude Opus Prompt Generator
 *
 * Four-layer prompt architecture:
 * 1. System Prompt (static) - Core AI behavior rules
 * 2. Character Context (from snapshot) - Persona, values, style
 * 3. Brand Overlay (dynamic, per client) - Company tone, forbidden phrases
 * 4. Task Prompt (per job) - Specific deliverables and constraints
 */
import type { CharacterSnapshot, BrandOverlay, TaskDefinition } from '../../shared/types.js';
export declare class PromptGenerator {
    /**
     * Build the static system prompt
     */
    buildSystemPrompt(): string;
    /**
     * Build character context from snapshot
     */
    buildCharacterContext(snapshot: CharacterSnapshot): string;
    /**
     * Build brand overlay prompt (dynamic, per client)
     */
    buildBrandOverlay(overlay: BrandOverlay): string;
    /**
     * Build task prompt (final injection)
     */
    buildTaskPrompt(task: TaskDefinition): string;
    /**
     * Compose all prompts into a message array for Claude API
     */
    compose(snapshot: CharacterSnapshot, overlay: BrandOverlay, task: TaskDefinition): Array<{
        role: 'system' | 'user';
        content: string;
    }>;
    /**
     * Compose all prompts into a single combined prompt (for simpler APIs)
     */
    composeSingle(snapshot: CharacterSnapshot, overlay: BrandOverlay, task: TaskDefinition): {
        system: string;
        user: string;
    };
}
export declare const promptGenerator: PromptGenerator;
export default PromptGenerator;
//# sourceMappingURL=prompt.d.ts.map