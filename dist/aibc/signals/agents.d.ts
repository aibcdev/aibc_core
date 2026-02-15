/**
 * AIBC Agent Reasoning with Gemini Flash
 */
import { Signal } from './ingestion';
export type AgentType = 'competitor_intelligence' | 'content_director' | 'brand_architect' | 'growth_strategy' | 'executive_briefing';
export interface AgentOutput {
    agentType: AgentType;
    outputType: 'insight' | 'recommendation' | 'alert' | 'brief';
    title: string;
    content: string;
    confidence: number;
    actions?: string[];
    evidence?: string[];
}
/**
 * Process a signal through an agent using Gemini Flash
 */
export declare function processSignalWithAgent(signal: Signal, agentType: AgentType, brandContext: string, geminiApiKey: string): Promise<AgentOutput | null>;
/**
 * Generate executive brief from agent outputs
 */
export declare function generateExecutiveBrief(outputs: AgentOutput[], geminiApiKey: string): Promise<AgentOutput | null>;
/**
 * Chat with an agent
 */
export declare function chatWithAgent(agentType: AgentType, history: {
    role: 'user' | 'agent';
    content: string;
}[], message: string, brandContext: string, geminiApiKey: string): Promise<string | null>;
//# sourceMappingURL=agents.d.ts.map