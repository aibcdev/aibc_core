/**
 * Mock Data for Marketing OS
 * Provides realistic sample data for development and demo purposes
 */

import type {
    Signal,
    CalendarEvent,

    AgentConfig,
    AgentStatus,
    CollaborationRequest
} from './marketing-os';

// ============================================================================
// AGENT CONFIGURATIONS
// ============================================================================

export const AGENT_CONFIGS: AgentConfig[] = [
    {
        id: 'echo',
        name: 'Echo',
        role: 'Competitor Intelligence',
        category: 'intelligence',
        avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200&h=200&fit=crop&crop=face',
        color: '#3B82F6', // blue
        aggressionLevel: 75,
        criticalityLevel: 60,
        autonomyMode: 'propose',
        focusAreas: ['Pricing changes', 'Product launches', 'Hiring signals', 'Funding rounds'],
        ignorePatterns: ['Minor PR', 'Social spam'],
        interruptFrequency: 'medium'
    },
    {
        id: 'sage',
        name: 'Sage',
        role: 'Content Director',
        category: 'content',
        avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200&h=200&fit=crop&crop=face',
        color: '#8B5CF6', // violet
        aggressionLevel: 50,
        criticalityLevel: 70,
        autonomyMode: 'act',
        focusAreas: ['Thought leadership', 'Product marketing', 'Customer stories'],
        ignorePatterns: ['Off-brand topics'],
        interruptFrequency: 'low'
    },
    {
        id: 'pulse',
        name: 'Pulse',
        role: 'Brand Architect',
        category: 'strategy',
        avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=200&h=200&fit=crop&crop=face',
        color: '#F59E0B', // amber
        aggressionLevel: 40,
        criticalityLevel: 90,
        autonomyMode: 'monitor',
        focusAreas: ['Tone consistency', 'Visual identity', 'Messaging alignment'],
        ignorePatterns: [],
        interruptFrequency: 'high'
    },
    {
        id: 'vantage',
        name: 'Vantage',
        role: 'Growth Strategist',
        category: 'growth',
        avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=200&h=200&fit=crop&crop=face',
        color: '#10B981', // emerald
        aggressionLevel: 85,
        criticalityLevel: 50,
        autonomyMode: 'propose',
        focusAreas: ['Funnel optimization', 'Campaign ROI', 'Growth experiments'],
        ignorePatterns: ['Vanity metrics'],
        interruptFrequency: 'medium'
    },
    {
        id: 'oracle',
        name: 'Oracle',
        role: 'Executive Briefing',
        category: 'executive',
        avatar: 'https://images.unsplash.com/photo-1560250097-0b93528c311a?w=200&h=200&fit=crop&crop=face',
        color: '#EF4444', // red
        aggressionLevel: 30,
        criticalityLevel: 95,
        autonomyMode: 'monitor',
        focusAreas: ['Decision memos', 'Risk summaries', 'Weekly briefings'],
        ignorePatterns: ['Tactical details'],
        interruptFrequency: 'low'
    }
];

export const AGENT_STATUSES: AgentStatus[] = [
    {
        agentId: 'echo',
        status: 'active',
        currentTask: 'Monitoring NVIDIA GTC announcements',
        lastActivity: new Date(),
        pendingReviews: 0,
        queuedArtifacts: 2
    },
    {
        agentId: 'sage',
        status: 'processing',
        currentTask: 'Drafting counter-campaign content',
        lastActivity: new Date(Date.now() - 300000),
        pendingReviews: 1,
        queuedArtifacts: 5
    },
    {
        agentId: 'pulse',
        status: 'active',
        currentTask: 'Reviewing campaign messaging',
        lastActivity: new Date(Date.now() - 120000),
        pendingReviews: 3,
        queuedArtifacts: 0
    },
    {
        agentId: 'vantage',
        status: 'processing',
        currentTask: 'Modeling growth hypothesis',
        lastActivity: new Date(Date.now() - 600000),
        pendingReviews: 0,
        queuedArtifacts: 1
    },
    {
        agentId: 'oracle',
        status: 'idle',
        lastActivity: new Date(Date.now() - 3600000),
        pendingReviews: 2,
        queuedArtifacts: 0
    }
];

// ============================================================================
// SIGNALS
// ============================================================================

export const MOCK_SIGNALS: Signal[] = [
    {
        signal_id: 'sig-001',
        source: 'news',
        topic: 'NVIDIA announces GTC 2026 for March 18-21',
        summary: 'NVIDIA\'s flagship GPU Technology Conference will showcase next-gen AI hardware.',
        industry: 'AI Hardware',
        confidence: 0.95,
        timestamp: new Date('2026-01-10'),
        tags: ['competitor', 'event', 'high-impact', 'AI'],
        classification: 'competitor_move',
        urgency: 'high',
        processed: true,
        calendar_event_id: 'evt-001',
        assigned_agents: ['echo', 'vantage']
    },
    {
        signal_id: 'sig-002',
        source: 'rss',
        topic: 'Intel cuts enterprise GPU pricing by 15%',
        summary: 'Aggressive pricing move targets AI infrastructure market.',
        industry: 'AI Hardware',
        confidence: 0.88,
        timestamp: new Date('2026-01-09'),
        tags: ['competitor', 'pricing', 'opportunity'],
        classification: 'market_opportunity',
        urgency: 'medium',
        processed: true,
        calendar_event_id: 'evt-002',
        assigned_agents: ['echo', 'vantage', 'sage']
    },
    {
        signal_id: 'sig-003',
        source: 'social',
        topic: 'AI regulation bill introduced in Senate',
        summary: 'New legislation may require AI transparency disclosures for enterprise tools.',
        industry: 'AI Technology',
        confidence: 0.72,
        timestamp: new Date('2026-01-11'),
        tags: ['regulatory', 'risk', 'compliance'],
        classification: 'risk',
        urgency: 'high',
        processed: false,
        assigned_agents: ['pulse']
    }
];

// ============================================================================
// CALENDAR EVENTS
// ============================================================================

export const MOCK_CALENDAR_EVENTS: CalendarEvent[] = [
    {
        event_id: 'evt-001',
        type: 'competitor',
        title: 'NVIDIA GTC 2026',
        description: 'NVIDIA\'s GPU Technology Conference - major announcements expected including next-gen AI chips.',
        start_date: new Date('2026-03-18'),
        end_date: new Date('2026-03-21'),
        priority: 'high',
        impact: 'high',
        themes: ['AI Hardware', 'GPU', 'Enterprise AI'],
        linked_agents: ['echo', 'vantage', 'sage'],
        linked_artifacts: ['art-001', 'art-002'],
        linked_signals: ['sig-001'],
        status: 'upcoming',
        actions: [
            { action_id: 'act-001', label: 'Create Counter-Campaign', icon: 'megaphone', agent: 'vantage', type: 'create_campaign' },
            { action_id: 'act-002', label: 'Draft Response Content', icon: 'edit-3', agent: 'sage', type: 'draft_content' },
            { action_id: 'act-003', label: 'Analyze Competitive Impact', icon: 'bar-chart-2', agent: 'echo', type: 'analyze' }
        ]
    },
    {
        event_id: 'evt-002',
        type: 'opportunity',
        title: 'Intel Pricing Response Window',
        description: 'Intel has cut pricing - opportunity for counter-messaging.',
        start_date: new Date('2026-01-15'),
        end_date: new Date('2026-01-22'),
        priority: 'high',
        impact: 'medium',
        themes: ['Pricing', 'Competitive', 'Messaging'],
        linked_agents: ['echo', 'vantage'],
        linked_artifacts: ['art-003'],
        linked_signals: ['sig-002'],
        status: 'upcoming',
        actions: [
            { action_id: 'act-004', label: 'Launch Comparison Campaign', icon: 'megaphone', agent: 'vantage', type: 'spin_up' }
        ]
    },
    {
        event_id: 'evt-003',
        type: 'content',
        title: 'Q1 Thought Leadership Series',
        description: 'Planned content series on AI infrastructure best practices.',
        start_date: new Date('2026-01-20'),
        end_date: new Date('2026-02-28'),
        priority: 'medium',
        impact: 'medium',
        themes: ['Content', 'Thought Leadership', 'AI'],
        linked_agents: ['sage', 'pulse'],
        linked_artifacts: [],
        linked_signals: [],
        status: 'upcoming',
        actions: [
            { action_id: 'act-005', label: 'Generate Content Calendar', icon: 'calendar', agent: 'sage', type: 'draft_content' }
        ]
    },
    {
        event_id: 'evt-004',
        type: 'campaign',
        title: 'Product Launch: AI Accelerator v3',
        description: 'Major product launch with full marketing campaign.',
        start_date: new Date('2026-02-01'),
        end_date: new Date('2026-02-01'),
        priority: 'high',
        impact: 'high',
        themes: ['Product Launch', 'Campaign', 'AI Hardware'],
        linked_agents: ['sage', 'pulse', 'vantage'],
        linked_artifacts: [],
        linked_signals: [],
        status: 'upcoming',
        actions: [
            { action_id: 'act-006', label: 'Review Launch Messaging', icon: 'shield', agent: 'pulse', type: 'review' },
            { action_id: 'act-007', label: 'Finalize Campaign Assets', icon: 'edit-3', agent: 'sage', type: 'draft_content' }
        ]
    }
];

// ============================================================================
// COLLABORATION REQUESTS
// ============================================================================

export const MOCK_COLLABORATION_REQUESTS: CollaborationRequest[] = [
    {
        request_id: 'collab-001',
        type: 'review_request',
        from_agent: 'sage',
        to_agent: 'pulse',
        artifact_id: 'art-002',
        message: 'Please review campaign messaging for brand consistency before launch.',
        status: 'pending',
        created_at: new Date(Date.now() - 3600000)
    },
    {
        request_id: 'collab-002',
        type: 'artifact_handoff',
        from_agent: 'echo',
        to_agent: 'vantage',
        artifact_id: 'art-003',
        calendar_event_id: 'evt-002',
        message: 'Pricing analysis complete. Ready for campaign hypothesis.',
        status: 'accepted',
        created_at: new Date(Date.now() - 7200000)
    },
    {
        request_id: 'collab-003',
        type: 'input_needed',
        from_agent: 'vantage',
        to_agent: 'sage',
        calendar_event_id: 'evt-001',
        message: 'Need content angles for NVIDIA counter-campaign. 3 hooks minimum.',
        status: 'pending',
        created_at: new Date(Date.now() - 1800000)
    }
];

// ============================================================================
// KPI DATA (for Headquarters)
// ============================================================================

export const MOCK_KPIS = {
    signalsToday: 12,
    signalsTrend: '+3',
    activeAgents: 3,
    totalAgents: 4,
    pendingReviews: 4,
    upcomingEvents: 8,
    artifactsThisWeek: 15,
    riskAlerts: 1
};

export const WHAT_CHANGED = [
    { time: '2h ago', text: 'Echo detected Intel pricing change', type: 'signal', agent: 'echo' },
    { time: '4h ago', text: 'Sage completed 3 LinkedIn drafts', type: 'artifact', agent: 'sage' },
    { time: '6h ago', text: 'Vantage proposed counter-campaign', type: 'proposal', agent: 'vantage' },
    { time: '1d ago', text: 'NVIDIA GTC added to calendar', type: 'calendar', agent: 'echo' }
];
