/**
 * Marketing OS Core Types
 * These schemas form the data layer for the Marketing Operating System
 */

// ============================================================================
// AGENT TYPES
// ============================================================================


export type AgentId = 'echo' | 'sage' | 'pulse' | 'vantage' | 'atlas' | 'oracle';  // 6 fixed agents

export type AgentCategory = 'intelligence' | 'content' | 'strategy' | 'growth' | 'executive';

export type AgentAutonomy = 'monitor' | 'propose' | 'act';

export interface AgentConfig {
    id: AgentId;
    name: string;
    role: string;
    category: AgentCategory;
    avatar: string;
    color: string;
    aggressionLevel: number;
    criticalityLevel: number;
    autonomyMode: AgentAutonomy;
    focusAreas: string[];
    ignorePatterns: string[];
    interruptFrequency: 'low' | 'medium' | 'high';
}

export interface AgentStatus {
    agentId: AgentId;
    status: 'active' | 'processing' | 'idle' | 'offline';
    currentTask?: string;
    lastActivity: Date;
    pendingReviews: number;
    queuedArtifacts: number;
}


export interface AgentConfidence {
    agentId: AgentId;
    confidence: number;
    lastUpdate: Date;
    reinforcement_events: {
        type: 'approval' | 'success' | 'rejection' | 'failure';
        timestamp: Date;
        delta: number;
    }[];
}

export type SignalSource = 'news' | 'social' | 'competitor_site' | 'internal' | 'manual' | 'rss';

export type SignalClassification = 'competitor_move' | 'market_opportunity' | 'risk' | 'cultural_moment' | 'product_launch';


export interface Signal {
    signal_id: string;
    source: SignalSource;
    topic: string;
    summary: string;
    industry: string;
    confidence: number;         // 0-1
    timestamp: Date;
    tags: string[];
    classification: SignalClassification;
    urgency: Priority;          // Added urgency

    // Linking
    processed: boolean;
    calendar_event_id?: string;
    assigned_agents?: AgentId[];

    // Metadata
    url?: string;
    raw_content?: string;
}

// ============================================================================
// CALENDAR TYPES (OS Spine)
// ============================================================================

export type CalendarEventType =
    | 'competitor'
    | 'campaign'
    | 'content'
    | 'cultural'
    | 'internal'
    | 'opportunity';

export type EventStatus = 'upcoming' | 'active' | 'completed';

export type Priority = 'low' | 'medium' | 'high';

export interface CalendarEvent {
    event_id: string;
    type: CalendarEventType;
    title: string;
    description: string;
    start_date: Date;
    end_date: Date;

    // Impact assessment
    priority: Priority;
    impact: Priority;
    themes: string[];

    // Linking
    linked_agents: AgentId[];
    linked_artifacts: string[];
    linked_signals: string[];

    // Temporal Context (The "Why" it's on the calendar)
    temporal_context?: {
        triggered_by_signal_id?: string;
        related_inbox_item_id?: string;
    };

    // Status
    status: EventStatus;

    // Actions available
    actions: CalendarAction[];
}

export interface CalendarAction {
    action_id: string;
    label: string;
    icon: string;
    agent: AgentId;
    type: 'create_campaign' | 'analyze' | 'draft_content' | 'review' | 'spin_up';
}

// ============================================================================
// ARTIFACT TYPES (Agent Outputs)
// ============================================================================

export type ArtifactType =
    | 'pricing_table'
    | 'competitor_timeline'
    | 'market_map'
    | 'threat_matrix'
    | 'campaign_plan'
    | 'content_draft'
    | 'editorial_calendar'
    | 'content_board'
    | 'hook_library'
    | 'funnel_diagram'
    | 'budget_allocation'
    | 'experiment_card'
    | 'tone_guardrails'
    | 'message_matrix'
    | 'decision_card'
    | 'risk_alert'
    | 'executive_summary';

export type ArtifactStatus = 'draft' | 'review' | 'pending_review' | 'approved' | 'rejected';

export interface Artifact {
    artifact_id: string;
    type: ArtifactType;
    title: string;
    created_by: AgentId;
    created_at: Date;
    updated_at: Date;

    // Pinning (where this artifact lives)
    pinned_to: {
        calendar_event?: string;
        campaign?: string;
        report?: string;
    };
    task_id?: string;
    calendar_event_id?: string;

    // Content (type-specific)
    content: ArtifactContent;

    // Review status
    status: ArtifactStatus;
    review_requested_from?: AgentId;
    review_comments?: string[];
    review_notes?: string;

    // Scoring & Versioning
    brand_score?: number;
    version: number;
    previous_version_id?: string;
}

// Type-specific content structures
export type ArtifactContent =
    | PricingTableContent
    | CampaignPlanContent
    | ContentDraftContent
    | DecisionCardContent
    | GenericArtifactContent;

export interface PricingTableContent {
    type: 'pricing_table';
    competitors: {
        name: string;
        tiers: { name: string; price: string; features: string[] }[];
        lastUpdated: Date;
        change?: 'increased' | 'decreased' | 'new' | 'removed';
    }[];
}

export interface CampaignPlanContent {
    type: 'campaign_plan';
    hypothesis: string;
    timeline: { phase: string; start: Date; end: Date; deliverables: string[] }[];
    budget: { category: string; amount: number }[];
    kpis: { metric: string; target: string }[];
}

export interface ContentDraftContent {
    type: 'content_draft';
    platform: string;
    headline: string;
    body: string;
    cta: string;
    assets: string[];
    scheduled_date?: Date;
}

export interface DecisionCardContent {
    type: 'decision_card';
    question: string;
    context: string;
    options: { label: string; pros: string[]; cons: string[] }[];
    recommendation: string;
    urgency: Priority;
}

export interface GenericArtifactContent {
    type: 'generic';
    data: Record<string, unknown>;
}

// ============================================================================
// COLLABORATION TYPES
// ============================================================================

export type CollaborationRequestType =
    | 'review_request'
    | 'artifact_handoff'
    | 'input_needed'
    | 'risk_flag'
    | 'approval_needed';

export interface CollaborationRequest {
    request_id: string;
    type: CollaborationRequestType;
    from_agent: AgentId;
    to_agent: AgentId;
    artifact_id?: string;
    calendar_event_id?: string;
    message: string;
    status: 'pending' | 'accepted' | 'completed' | 'rejected';
    created_at: Date;
    completed_at?: Date;
}

// ============================================================================
// WORKSPACE TYPES
// ============================================================================

export type WorkspaceId =
    | 'headquarters'
    | 'calendar'
    | 'intelligence'
    | 'campaigns'
    | 'content_studio'
    | 'brand_system'
    | 'reports';

export interface Workspace {
    id: WorkspaceId;
    label: string;
    icon: string;
    description: string;
}

export const WORKSPACES: Workspace[] = [
    { id: 'headquarters', label: 'Headquarters', icon: 'building-2', description: 'Command center overview' },
    { id: 'calendar', label: 'Calendar', icon: 'calendar', description: 'Marketing calendar (OS spine)' },
    { id: 'intelligence', label: 'Intelligence', icon: 'radar', description: 'Market signals and competitor data' },
    { id: 'campaigns', label: 'Campaigns', icon: 'megaphone', description: 'Active and planned campaigns' },
    { id: 'content_studio', label: 'Content Studio', icon: 'edit-3', description: 'Editorial calendar and drafts' },
    { id: 'brand_system', label: 'Brand System', icon: 'shield', description: 'Guidelines and guardrails' },
    { id: 'reports', label: 'Reports', icon: 'bar-chart-2', description: 'Executive briefings' },
];

/**
 * AGENT INBOX TYPES
 * The core decision stream for the user
 */
export type InboxItemCategory = 'market' | 'content' | 'risk' | 'opportunity';
export type InboxItemStatus = 'pending' | 'approved' | 'rejected' | 'scheduled' | 'archived';

export interface InboxItem {
    id: string;
    agent_id: AgentId;
    category: InboxItemCategory;
    headline: string; // "What happened?"
    subheadline: string; // "Why it matters?"
    recommended_action: string; // "What should we do?"
    urgency: Priority;
    confidence_score: number; // 0-1
    status: InboxItemStatus;

    // The "Proof"
    related_artifacts: string[]; // IDs
    related_signals: string[]; // IDs

    // Actions that can be taken directly
    actions: {
        label: string;
        action_type: 'approve' | 'edit' | 'ignore' | 'ask_atlas';
        payload?: any;
    }[];

    created_at: Date;
}

// ============================================================================
// AGENT TASK SYSTEM
// ============================================================================

export type TaskStatus = 'proposed' | 'in_progress' | 'waiting' | 'done' | 'rejected';

export interface AgentTask {
    task_id: string;
    title: string;
    description: string;
    assigned_to: AgentId;
    created_by: AgentId | 'user' | 'system';
    status: TaskStatus;
    priority: Priority;

    // Linking
    calendar_event_id?: string;
    campaign_id?: string;
    signal_id?: string;
    parent_task_id?: string;

    // Timing
    created_at: Date;
    due_date?: Date;
    completed_at?: Date;

    // Output
    artifact_ids: string[];

    // Dependencies
    waiting_on?: AgentId[];
    blocks?: string[];  // task_ids this blocks
}

// ============================================================================
// CAMPAIGN SYSTEM
// ============================================================================

export interface Campaign {
    campaign_id: string;
    name: string;
    description: string;
    status: 'proposed' | 'approved' | 'active' | 'completed' | 'cancelled';

    // Calendar windows
    start_date: Date;
    end_date: Date;

    // Content
    artifact_ids: string[];

    // KPIs
    kpis: { metric: string; target: string; actual?: string }[];

    // Agent assignments
    agent_assignments: { agent: AgentId; role: string }[];

    // Linking
    calendar_event_id?: string;
    signal_ids: string[];
}

// ============================================================================
// APPROVAL QUEUE
// ============================================================================

export interface ApprovalRequest {
    approval_id: string;
    type: 'artifact' | 'campaign' | 'task';
    item_id: string;
    title: string;

    requested_by: AgentId;
    requested_at: Date;

    status: 'pending' | 'approved' | 'rejected';
    reviewed_by?: AgentId | 'user';
    reviewed_at?: Date;
    review_notes?: string;
}

// ============================================================================
// CHAT & COLLABORATION
// ============================================================================

export interface ChatMessage {
    id: string;
    role: 'user' | 'agent' | 'system';
    agent_id?: AgentId; // If role is agent
    content: string;
    timestamp: Date;
    attachments?: {
        type: 'artifact' | 'task' | 'image';
        id: string;
        label: string;
    }[];
}

export interface ChatSession {
    session_id: string;
    participants: AgentId[];
    messages: ChatMessage[];
    status: 'active' | 'archived';
    last_activity: Date;
}
