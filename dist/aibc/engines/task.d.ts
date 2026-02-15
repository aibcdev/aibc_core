/**
 * Task Execution Engine
 *
 * Orchestrates the execution of tasks using characters, overlays, and prompts.
 * Integrates with Google Gemini API for text generation.
 */
import type { CharacterSnapshot, BrandOverlay, TaskDefinition, TextOutput } from '../../shared/types.js';
import { PromptGenerator } from './prompt.js';
import { BrandEngine } from './brand.js';
export interface TaskExecutionResult {
    success: boolean;
    output?: TextOutput;
    error?: string;
    usage?: {
        input_tokens: number;
        output_tokens: number;
    };
    duration_ms: number;
}
export declare class TaskEngine {
    private promptGenerator;
    private brandEngine;
    private geminiClient;
    private model;
    constructor(options?: {
        apiKey?: string;
        model?: string;
    });
    /**
     * Execute a task with character, overlay, and task definition
     */
    executeTask(snapshot: CharacterSnapshot, overlay: BrandOverlay, task: TaskDefinition): Promise<TaskExecutionResult>;
    /**
     * Calculate max tokens based on task constraints
     */
    private calculateMaxTokens;
    /**
     * Parse output into sections based on required outputs
     */
    private parseOutputSections;
    /**
     * Set Gemini model
     */
    setModel(model: string): void;
    /**
     * Get the brand engine for overlay management
     */
    getBrandEngine(): BrandEngine;
    /**
     * Get the prompt generator for inspection
     */
    getPromptGenerator(): PromptGenerator;
}
export declare function createTaskEngine(options?: {
    apiKey?: string;
    model?: string;
}): TaskEngine;
export default TaskEngine;
//# sourceMappingURL=task.d.ts.map