/**
 * AIBC Signal Storage Service (Supabase)
 */
import { SupabaseClient } from '@supabase/supabase-js';
import { Signal } from './ingestion';
import { AgentOutput, AgentType } from './agents';
export declare function getSupabaseClient(): SupabaseClient | null;
/**
 * Save signals to Supabase
 */
export declare function saveSignals(signals: Signal[]): Promise<void>;
/**
 * Fetch recent signals for dashboard
 */
export declare function fetchRecentSignals(limit?: number): Promise<any[]>;
/**
 * Save agent outputs to Supabase
 */
export declare function saveAgentOutputs(outputs: AgentOutput[]): Promise<void>;
/**
 * Fetch recent structured outputs for dashboard
 */
export declare function fetchStructuredOutputs(limit?: number): Promise<any[]>;
/**
 * Save executive brief
 */
export declare function saveExecutiveBrief(brandId: string, brief: AgentOutput): Promise<void>;
/**
 * Fetch chat history for an agent
 */
export declare function fetchChatHistory(agentType: AgentType): Promise<any[]>;
/**
 * Save a chat message
 */
export declare function saveChatMessage(agentType: AgentType, role: 'user' | 'agent', content: string): Promise<void>;
/**
 * Initialize Default Agents (Helper to ensure agents table is populated)
 */
export declare function ensureAgentsExist(brandId: string): Promise<void>;
/**
 * Create a default brand if none exists (For MVP)
 */
export declare function ensureDefaultBrand(): Promise<string | null>;
//# sourceMappingURL=storage.d.ts.map