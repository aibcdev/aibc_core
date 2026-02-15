/**
 * Marketing OS - Action Handlers
 * These functions wire buttons to real state changes
 */

import { useMarketingOS } from './store';
import type { AgentId, CalendarEventType, ArtifactType, ArtifactContent } from './types/marketing-os';

// ============================================================================
// CALENDAR ACTIONS
// ============================================================================

/**
 * Add signal to calendar as event
 */
export function addSignalToCalendar(
    signal: { topic: string; industry: string; tags: string[] },
    eventType: CalendarEventType,
    dateRange: { start: Date; end: Date },
    assignedAgents: AgentId[]
) {
    const store = useMarketingOS.getState();

    // Create calendar event
    const eventId = store.addCalendarEvent({
        type: eventType,
        title: signal.topic,
        description: `Auto-generated from signal: ${signal.topic}`,
        start_date: dateRange.start,
        end_date: dateRange.end,
        priority: 'medium',
        impact: 'medium',
        themes: signal.tags,
        linked_agents: assignedAgents,
        linked_artifacts: [],
        linked_signals: [],
        status: 'upcoming',
        actions: generateActionsForEvent(eventType, assignedAgents)
    });

    // Create tasks for assigned agents
    assignedAgents.forEach(agent => {
        store.addTask({
            title: `Analyze: ${signal.topic}`,
            description: `New calendar event requires analysis`,
            assigned_to: agent,
            created_by: 'system',
            status: 'proposed',
            priority: 'medium',
            calendar_event_id: eventId
        });
    });

    return eventId;
}

function generateActionsForEvent(type: CalendarEventType, agents: AgentId[]) {
    const actions = [];

    if (type === 'competitor') {
        if (agents.includes('vantage')) {
            actions.push({
                action_id: `act-${Math.random().toString(36).substring(7)}`,
                label: 'Create Counter-Campaign',
                icon: 'megaphone',
                agent: 'vantage' as AgentId,
                type: 'create_campaign' as const
            });
        }
        if (agents.includes('sage')) {
            actions.push({
                action_id: `act-${Math.random().toString(36).substring(7)}`,
                label: 'Draft Response Content',
                icon: 'edit-3',
                agent: 'sage' as AgentId,
                type: 'draft_content' as const
            });
        }
    }

    if (type === 'opportunity') {
        actions.push({
            action_id: `act-${Math.random().toString(36).substring(7)}`,
            label: 'Launch Campaign',
            icon: 'play',
            agent: 'vantage' as AgentId,
            type: 'spin_up' as const
        });
    }

    return actions;
}

// ============================================================================
// CAMPAIGN ACTIONS
// ============================================================================

/**
 * Create a new campaign (from wizard or action button)
 */
export function createCampaign(params: {
    name: string;
    description: string;
    startDate: Date;
    endDate: Date;
    calendarEventId?: string;
    signalIds?: string[];
}) {
    const store = useMarketingOS.getState();

    // Create campaign
    const campaignId = store.addCampaign({
        name: params.name,
        description: params.description,
        status: 'proposed',
        start_date: params.startDate,
        end_date: params.endDate,
        artifact_ids: [],
        kpis: [],
        agent_assignments: [
            { agent: 'vantage', role: 'Strategy Lead' },
            { agent: 'sage', role: 'Content Lead' },
            { agent: 'pulse', role: 'Brand Reviewer' }
        ],
        calendar_event_id: params.calendarEventId,
        signal_ids: params.signalIds || []
    });

    // Create tasks for each assigned agent
    store.addTask({
        title: `Define strategy: ${params.name}`,
        description: 'Create campaign hypothesis and timeline',
        assigned_to: 'vantage',
        created_by: 'user',
        status: 'in_progress',
        priority: 'high',
        campaign_id: campaignId,
        calendar_event_id: params.calendarEventId
    });

    store.addTask({
        title: `Draft content: ${params.name}`,
        description: 'Create content artifacts for campaign',
        assigned_to: 'sage',
        created_by: 'vantage',
        status: 'proposed',
        priority: 'high',
        campaign_id: campaignId,
        waiting_on: ['vantage']
    });

    // Request approval
    store.addApproval({
        type: 'campaign',
        item_id: campaignId,
        title: params.name,
        requested_by: 'vantage'
    });

    return campaignId;
}

// ============================================================================
// AGENT TASK ACTIONS
// ============================================================================

/**
 * Escalate signal to specific agent
 */
export function escalateToAgent(
    fromAgent: AgentId,
    toAgent: AgentId,
    context: { title: string; description: string; signalId?: string; calendarEventId?: string }
) {
    const store = useMarketingOS.getState();

    return store.addTask({
        title: context.title,
        description: context.description,
        assigned_to: toAgent,
        created_by: fromAgent,
        status: 'proposed',
        priority: 'medium',
        signal_id: context.signalId,
        calendar_event_id: context.calendarEventId
    });
}

/**
 * Request content from Sage
 */
export function requestContent(
    calendarEventId: string,
    angle: string
) {
    const store = useMarketingOS.getState();

    return store.addTask({
        title: `Create content: ${angle}`,
        description: `Content request for calendar event`,
        assigned_to: 'sage',
        created_by: 'user',
        status: 'in_progress',
        priority: 'high',
        calendar_event_id: calendarEventId
    });
}

// ============================================================================
// APPROVAL ACTIONS
// ============================================================================

import { agentMemory } from './memory';

/**
 * Approve an artifact/campaign/task
 * This reinforces agent confidence
 */
export async function approveItem(approvalId: string, notes?: string) {
    const store = useMarketingOS.getState();
    store.resolveApproval(approvalId, true, notes);

    const approval = store.approvals.find(a => a.approval_id === approvalId);
    if (approval) {
        // Mark related artifact as approved
        if (approval.type === 'artifact') {
            const artifact = store.artifacts.find(a => a.artifact_id === approval.item_id);
            if (artifact) {
                store.updateArtifact(approval.item_id, { status: 'approved' });

                // MEMORY: Learn from this success
                // We stringify the content to store it semantically
                const memoryContent = typeof artifact.content === 'string'
                    ? artifact.content
                    : JSON.stringify(artifact.content);

                await agentMemory.store(
                    `Successful ${artifact.type}: ${memoryContent}`,
                    'content_pattern',
                    { artifactId: artifact.artifact_id, agent: artifact.created_by }
                );
            }
        }

        // Trigger Oracle to prepare summary
        store.addTask({
            title: `Summarize: ${approval.title} approved`,
            description: 'Prepare executive update on this approval',
            assigned_to: 'oracle',
            created_by: 'system',
            status: 'proposed',
            priority: 'low'
        });
    }
}

/**
 * Reject an artifact/campaign/task
 * This decays agent confidence
 */
export function rejectItem(approvalId: string, notes: string) {
    const store = useMarketingOS.getState();
    store.resolveApproval(approvalId, false, notes);

    const approval = store.approvals.find(a => a.approval_id === approvalId);
    if (approval) {
        // Mark artifact as rejected
        if (approval.type === 'artifact') {
            store.updateArtifact(approval.item_id, { status: 'rejected', review_notes: notes });
        }

        // Create revision task
        store.addTask({
            title: `Revise: ${approval.title}`,
            description: `Feedback: ${notes}`,
            assigned_to: approval.requested_by,
            created_by: 'user',
            status: 'in_progress',
            priority: 'high'
        });
    }
}

// ============================================================================
// ARTIFACT ACTIONS
// ============================================================================

/**
 * Create artifact and request brand review
 */
export function createArtifact(params: {
    type: string;
    title: string;
    content: unknown;
    createdBy: AgentId;
    taskId?: string;
    calendarEventId?: string;
}) {
    const store = useMarketingOS.getState();

    const artifactId = store.addArtifact({
        type: params.type as ArtifactType,
        title: params.title,
        content: params.content as ArtifactContent,
        created_by: params.createdBy,
        status: 'pending_review',
        task_id: params.taskId,
        calendar_event_id: params.calendarEventId,
        pinned_to: {}
    });

    // Auto-request brand review from Pulse
    store.addApproval({
        type: 'artifact',
        item_id: artifactId,
        title: params.title,
        requested_by: params.createdBy
    });

    return artifactId;
}
