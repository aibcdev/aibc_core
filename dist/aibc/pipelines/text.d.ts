/**
 * Text Output Pipeline
 *
 * Handles formatting and storage of text outputs.
 */
import type { TextOutput, TaskDefinition } from '../../shared/types.js';
export interface FormatOptions {
    format: 'markdown' | 'html' | 'plain';
    includeMetadata: boolean;
}
export declare class TextPipeline {
    /**
     * Format output for delivery
     */
    format(output: TextOutput, options?: FormatOptions): string;
    /**
     * Extract specific sections from output
     */
    getSections(output: TextOutput): Record<string, string>;
    /**
     * Get a specific section
     */
    getSection(output: TextOutput, sectionName: string): string | undefined;
    /**
     * Simple markdown to HTML conversion
     */
    private markdownToHtml;
    /**
     * Strip markdown formatting
     */
    private stripMarkdown;
    /**
     * Format metadata header
     */
    private formatMetadata;
    /**
     * Validate output meets task constraints
     */
    validateOutput(output: TextOutput, task: TaskDefinition): ValidationResult;
}
interface ValidationResult {
    valid: boolean;
    issues: string[];
    wordCount: number;
    sectionCount: number;
}
export declare const textPipeline: TextPipeline;
export default TextPipeline;
//# sourceMappingURL=text.d.ts.map