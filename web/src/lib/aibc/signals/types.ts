/**
 * AIBC Production Types
 * Aligned with Postgres + Vector Hybrid Schema
 */

// Force module to generate code (prevent empty file elision)
export const TYPES_VERSION = '1.0.0';

// --- DATABASE TYPES ---

export type AgentType =
    | 'competitor_intelligence'
    | 'content_director'
    | 'brand_architect'
    | 'growth_strategy'
    | 'executive_briefing';

export interface AgentRecord {
    id: string;
    brand_id: string;
    type: AgentType;
    name: string;
    role: string;
    baseline_confidence: number;
    current_confidence: number;
    assertiveness: number;
    volatility: number;
    personality_profile: any; // Using existing PersonalityProfile type structure
    created_at: string;
}

export type MemoryType = 'short_term' | 'working' | 'long_term' | 'performance';

export interface MemoryItem {
    id: string;
    agent_id: string;
    type: MemoryType;
    content: string;
    confidence: number;
    metadata?: {
        source_signal_id?: string;
        impact_score?: number;
        [key: string]: any;
    };
    created_at: string;
    expires_at?: string;
    last_accessed_at?: string;
}

export type SignalCategory = 'competitor' | 'trend' | 'brand' | 'opportunity';

export interface Signal {
    id: string;
    brand_id: string;
    source: string;
    category: SignalCategory;
    title: string;
    content: string;
    url?: string;
    confidence: number; // < 0.65 = Log Only
    relevance: number;
    payload?: any;
    created_at: string;
}

export type TaskStatus = 'open' | 'approved' | 'rejected' | 'completed' | 'in_progress';
export type TaskPriority = 'low' | 'medium' | 'high' | 'critical';

export interface Task {
    id: string;
    agent_owner: string; // Agent ID
    title: string;
    description: string;
    status: TaskStatus;
    priority: TaskPriority;
    impact_estimate: number;
    confidence: number;
    metadata?: {
        linked_signal_ids?: string[];
        screenshots?: string[];
        [key: string]: any;
    };
    created_at: string;
    updated_at: string;
}

export interface Decision {
    id: string;
    task_id: string;
    outcome: 'approved' | 'rejected' | 'modified';
    reason: string;
    decided_at: string;
}

export interface ConfidenceEvent {
    id: string;
    agent_id: string;
    delta: number;
    reason: string;
    new_confidence: number;
    created_at: string;
}

// --- APP TYPES ---

export interface DecisionCardProps {
    id: string;
    title: string;
    agentOwner: AgentType;
    recommendation: string;
    impact: number;
    confidence: number;
    priority: TaskPriority;
    onApprove: (id: string) => void;
    onReject: (id: string) => void;
    onModify: (id: string) => void;
}
