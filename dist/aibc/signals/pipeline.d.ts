/**
 * AIBC Signal Pipeline Orchestrator
 * Coordinates signal ingestion → routing → agent processing → output
 */
import { AgentOutput } from './agents';
export interface PipelineConfig {
    newsApiKey?: string;
    geminiApiKey: string;
    brandContext: string;
    subreddits?: string[];
    newsQueries?: string[];
}
export interface PipelineResult {
    signalsProcessed: number;
    outputs: AgentOutput[];
    executiveBrief: AgentOutput | null;
    errors: string[];
}
/**
 * Run the full signal pipeline
 */
export declare function runSignalPipeline(config: PipelineConfig): Promise<PipelineResult>;
/**
 * Quick test function
 */
export declare function testPipeline(geminiApiKey: string): Promise<void>;
//# sourceMappingURL=pipeline.d.ts.map