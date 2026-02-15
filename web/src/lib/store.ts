/**
 * Marketing OS - Core State Store
 * Global state management for tasks, artifacts, approvals, and agent sync
 */

import { create } from 'zustand';
import type {
    AgentId,
    CalendarEvent,
    Signal,
    InboxItem,
    InboxItemStatus,
    AgentTask,
    // TaskStatus, // Not explicitly used as type name in store interface but used in implementation? No, just AgentTask.
    Artifact,
    Campaign,
    ApprovalRequest,
    ChatSession,
    ChatMessage,
    AgentConfidence
} from './types/marketing-os';

export type { AgentTask, TaskStatus, InboxItem, Artifact, Campaign, ApprovalRequest } from './types/marketing-os';

// ============================================================================
// GLOBAL STORE INTERFACE
// ============================================================================

interface MarketingOSState {
    // Tasks
    tasks: AgentTask[];
    addTask: (task: Omit<AgentTask, 'task_id' | 'created_at' | 'artifact_ids'>) => string;
    updateTask: (task_id: string, updates: Partial<AgentTask>) => void;

    // Artifacts
    artifacts: Artifact[];
    addArtifact: (artifact: Omit<Artifact, 'artifact_id' | 'created_at' | 'updated_at' | 'version'>) => string;
    updateArtifact: (artifact_id: string, updates: Partial<Artifact>) => void;

    // Campaigns
    campaigns: Campaign[];
    addCampaign: (campaign: Omit<Campaign, 'campaign_id'>) => string;

    // Approvals
    approvals: ApprovalRequest[];
    addApproval: (approval: Omit<ApprovalRequest, 'approval_id' | 'requested_at' | 'status'>) => string;
    resolveApproval: (approval_id: string, approved: boolean, notes?: string) => void;

    // Inbox (The Brain)
    inboxItems: InboxItem[];
    addToInbox: (item: Omit<InboxItem, 'id' | 'created_at'>) => string;
    resolveInboxItem: (id: string, status: InboxItemStatus) => void;

    // Agent Confidence
    agentConfidence: Record<AgentId, AgentConfidence>;
    reinforceConfidence: (agent_id: AgentId, delta: number, type: 'approval' | 'success' | 'rejection' | 'failure') => void;

    // Calendar Events (mutable now)
    calendarEvents: CalendarEvent[];
    addCalendarEvent: (event: Omit<CalendarEvent, 'event_id'>) => string;

    // Signals
    signals: Signal[];
    addSignal: (signal: Omit<Signal, 'signal_id' | 'processed'>) => string;
    processSignal: (signal_id: string, calendar_event_id: string, assigned_agents: AgentId[]) => void;

    // Chat
    chatSessions: Record<string, ChatSession>;
    activeSessionId: string | null;
    createChatSession: (agentIds: AgentId[]) => string;
    sendMessage: (sessionId: string, content: string, role: 'user' | 'agent', agentId?: AgentId) => void;

    // Internal Actions (Command Processing)
    processAgentCommand: (sessionId: string, command: string) => void;
}

const generateId = () => Math.random().toString(36).substring(2, 15);

export const useMarketingOS = create<MarketingOSState>((set, get) => ({
    // Initial state
    tasks: [],
    artifacts: [],
    campaigns: [],
    approvals: [],
    calendarEvents: [],
    signals: [],
    agentConfidence: {
        echo: { agentId: 'echo', confidence: 74, lastUpdate: new Date(), reinforcement_events: [] },
        sage: { agentId: 'sage', confidence: 68, lastUpdate: new Date(), reinforcement_events: [] },
        pulse: { agentId: 'pulse', confidence: 82, lastUpdate: new Date(), reinforcement_events: [] },
        vantage: { agentId: 'vantage', confidence: 71, lastUpdate: new Date(), reinforcement_events: [] },
        atlas: { agentId: 'atlas', confidence: 79, lastUpdate: new Date(), reinforcement_events: [] },
        oracle: { agentId: 'oracle', confidence: 85, lastUpdate: new Date(), reinforcement_events: [] },
    },
    chatSessions: {},
    activeSessionId: null,

    // Task actions
    addTask: (task) => {
        const task_id = generateId();
        const newTask: AgentTask = {
            ...task,
            task_id,
            created_at: new Date(),
            artifact_ids: []
        };
        set((state) => ({ tasks: [...state.tasks, newTask] }));

        // AGENT SYNC: Trigger orchestration
        orchestrateSideEffects('task_created', newTask);

        return task_id;
    },

    updateTask: (task_id, updates) => {
        set((state) => ({
            tasks: state.tasks.map(t =>
                t.task_id === task_id ? { ...t, ...updates } : t
            )
        }));
    },

    // Artifact actions
    addArtifact: (artifact) => {
        const artifact_id = generateId();
        const now = new Date();
        const newArtifact: Artifact = {
            ...artifact,
            artifact_id,
            created_at: now,
            updated_at: now,
            version: 1
        };
        set((state) => ({ artifacts: [...state.artifacts, newArtifact] }));
        return artifact_id;
    },

    updateArtifact: (artifact_id, updates) => {
        set((state) => ({
            artifacts: state.artifacts.map(a =>
                a.artifact_id === artifact_id
                    ? { ...a, ...updates, updated_at: new Date(), version: a.version + 1 }
                    : a
            )
        }));
    },

    // Campaign actions
    addCampaign: (campaign) => {
        const campaign_id = generateId();
        set((state) => ({ campaigns: [...state.campaigns, { ...campaign, campaign_id }] }));
        return campaign_id;
    },

    // Approval actions
    addApproval: (approval) => {
        const approval_id = generateId();
        const newApproval: ApprovalRequest = {
            ...approval,
            approval_id,
            requested_at: new Date(),
            status: 'pending'
        };
        set((state) => ({ approvals: [...state.approvals, newApproval] }));
        return approval_id;
    },

    resolveApproval: (approval_id, approved, notes) => {
        const approval = get().approvals.find(a => a.approval_id === approval_id);
        if (!approval) return;

        set((state) => ({
            approvals: state.approvals.map(a =>
                a.approval_id === approval_id
                    ? { ...a, status: approved ? 'approved' : 'rejected', reviewed_at: new Date(), review_notes: notes }
                    : a
            )
        }));

        // CONFIDENCE: Reinforce or decay based on approval
        const agentId = approval.requested_by;
        get().reinforceConfidence(agentId, approved ? 3 : -5, approved ? 'approval' : 'rejection');
    },

    // Inbox actions
    inboxItems: [], // Initialize empty
    addToInbox: (item) => {
        const id = generateId();
        const newItem: InboxItem = {
            ...item,
            id,
            created_at: new Date()
        };
        set((state) => ({ inboxItems: [newItem, ...state.inboxItems] }));
        return id;
    },

    resolveInboxItem: (id, status) => {
        const item = get().inboxItems.find(i => i.id === id);
        if (!item) return;

        set((state) => ({
            inboxItems: state.inboxItems.map(i =>
                i.id === id ? { ...i, status } : i
            )
        }));

        // ORCHESTRATION: Trigger next steps based on decision
        orchestrateSideEffects('inbox_resolved', { item, status });
    },

    // Confidence actions
    reinforceConfidence: (agent_id, delta, type) => {
        set((state) => {
            const current = state.agentConfidence[agent_id];
            const newConfidence = Math.max(0, Math.min(100, current.confidence + delta));
            return {
                agentConfidence: {
                    ...state.agentConfidence,
                    [agent_id]: {
                        ...current,
                        confidence: newConfidence,
                        last_update: new Date(),
                        reinforcement_events: [
                            ...current.reinforcement_events.slice(-20),  // Keep last 20
                            { type, timestamp: new Date(), delta }
                        ]
                    }
                }
            };
        });
    },

    // Calendar actions
    addCalendarEvent: (event) => {
        const event_id = generateId();
        set((state) => ({
            calendarEvents: [...state.calendarEvents, { ...event, event_id }]
        }));
        return event_id;
    },

    // Signal actions
    addSignal: (signal) => {
        const signal_id = generateId();
        const newSignal = { ...signal, signal_id, processed: false };
        set((state) => ({
            signals: [...state.signals, newSignal]
        }));

        // ECHO START: Trigger orchestration
        orchestrateSideEffects('signal_detected', newSignal);

        return signal_id;
    },

    processSignal: (signal_id, calendar_event_id, assigned_agents) => {
        set((state) => ({
            signals: state.signals.map(s =>
                s.signal_id === signal_id
                    ? { ...s, processed: true, calendar_event_id, assigned_agents }
                    : s
            )
        }));
    },

    // Chat actions
    createChatSession: (agentIds) => {
        const id = generateId();
        const newSession: ChatSession = {
            session_id: id,
            participants: agentIds,
            messages: [],
            status: 'active',
            last_activity: new Date()
        };
        set((state) => ({
            chatSessions: { ...state.chatSessions, [id]: newSession },
            activeSessionId: id
        }));
        return id;
    },

    sendMessage: (sessionId, content, role, agentId) => {
        set((state) => {
            const session = state.chatSessions[sessionId];
            if (!session) return state;

            const newMessage: ChatMessage = {
                id: generateId(),
                role,
                agent_id: agentId,
                content,
                timestamp: new Date()
            };

            return {
                chatSessions: {
                    ...state.chatSessions,
                    [sessionId]: {
                        ...session,
                        messages: [...session.messages, newMessage],
                        last_activity: new Date()
                    }
                }
            };
        });

        // Trigger AI reasoning if user sent message
        if (role === 'user') {
            get().processAgentCommand(sessionId, content);
        }
    },

    processAgentCommand: async (sessionId, command) => {
        const store = get();
        const session = store.chatSessions[sessionId];
        if (!session) return;

        // Simulate thinking delay
        setTimeout(async () => {
            const lowerCmd = command.toLowerCase();
            const participatingAgent = session.participants[0] || 'atlas';

            // SCENARIO 1: IMAGE GENERATION
            if (lowerCmd.includes('image') || lowerCmd.includes('picture') || lowerCmd.includes('generate')) {
                store.addArtifact({
                    type: 'content_draft',
                    title: `Generated Image Request: ${command.substring(0, 20)}...`,
                    content: {
                        type: 'generic', // Placeholder for image content type
                        data: {
                            prompt: command,
                            status: 'generating',
                            url: 'https://placehold.co/600x400?text=Generating+Image...'
                        }
                    },
                    created_by: participatingAgent,
                    status: 'draft',
                    pinned_to: {}
                });

                store.sendMessage(sessionId, `I've started generating that image for you. It will be ready shortly.`, 'agent', participatingAgent);
                return;
            }

            // SCENARIO 2: VIDEO / AUDIO (Production Request)
            if (lowerCmd.includes('video') || lowerCmd.includes('audio') || lowerCmd.includes('clip')) {
                const taskId = store.addTask({
                    title: 'Production Request: Audio/Video Generation',
                    description: `User requested: "${command}". Forwarded to production team for high-quality generation.`,
                    assigned_to: participatingAgent,
                    created_by: 'system',
                    status: 'waiting', // Waiting on human/team
                    priority: 'high'
                });

                store.sendMessage(sessionId, `I've forwarded your request to the production team. Ticket #${taskId} created. They will notify you when the asset is ready for review.`, 'agent', participatingAgent);
                return;
            }

            // SCENARIO 3: DRAFTING TEXT
            if (lowerCmd.includes('draft') || lowerCmd.includes('write') || lowerCmd.includes('post')) {
                store.addArtifact({
                    type: 'content_draft',
                    title: `Draft: ${command.substring(0, 20)}...`,
                    content: {
                        type: 'content_draft',
                        platform: 'General',
                        headline: 'Draft Content',
                        body: `Here is a draft based on your request:\n\n"${command}"\n\n(AI would expand this section with real Gemini generation)`,
                        cta: 'Learn More',
                        assets: []
                    },
                    created_by: participatingAgent,
                    status: 'draft',
                    pinned_to: {}
                });

                store.sendMessage(sessionId, `I've drafted that for you. check the artifacts panel.`, 'agent', participatingAgent);
                return;
            }

            // FALLBACK: Generic Chat
            store.sendMessage(sessionId, `I understand. You said: "${command}". How else can I assist?`, 'agent', participatingAgent);

        }, 1500);
    }
}));

// ============================================================================
// AGENT ORCHESTRATION (The "Brain" Logic)
// ============================================================================

// ============================================================================
// AGENT ORCHESTRATION (The "Brain" Logic)
// ============================================================================

export function orchestrateSideEffects(
    type: 'signal_detected' | 'inbox_resolved' | 'task_created',
    payload: any
) {
    const store = useMarketingOS.getState();

    // ------------------------------------------------------------------------
    // STEP 1: Echo Detects Signal -> Atlas Analyzes (Inbox Item: Signal Review)
    // ------------------------------------------------------------------------
    if (type === 'signal_detected') {
        const signal = payload as Signal;

        // In a real system, Atlas would analyze here.
        // For now, we assume Atlas has analyzed it and deemed it worthy of Inbox.

        store.addToInbox({
            agent_id: 'echo',
            category: 'market',
            headline: `Signal: ${signal.topic}`,
            subheadline: `Echo detected activity from ${signal.source}. Atlas recommends analysis.`,
            recommended_action: 'Review signal and authorize strategy development.',
            urgency: signal.urgency || 'medium',
            confidence_score: signal.confidence || 0.85,
            status: 'pending',
            related_signals: [signal.signal_id],
            related_artifacts: [],
            actions: [
                { label: 'Authorize Strategy', action_type: 'approve' },
                { label: 'Ignore', action_type: 'ignore' }
            ]
        });
    }

    // ------------------------------------------------------------------------
    // STEP 2: User Authorizes Signal -> Atlas Creates Strategy (Inbox Item: Strategy Review)
    // ------------------------------------------------------------------------
    if (type === 'inbox_resolved') {
        const { item, status } = payload as { item: InboxItem, status: InboxItemStatus };

        // If User approved an 'echo' signal -> Atlas creates Strategy
        if (status === 'approved' && item.agent_id === 'echo') {
            setTimeout(() => {
                // 1. Create Strategy Artifact (Mock Atlas Work)
                const strategyId = store.addArtifact({
                    type: 'campaign_plan',
                    title: `Strategy: Response to ${item.headline}`,
                    content: {
                        type: 'campaign_plan',
                        hypothesis: `Leverage ${item.headline} to position brand as leader.`,
                        timeline: [{ phase: 'Response', start: new Date(), end: new Date(), deliverables: ['Social Post'] }],
                        budget: [{ category: 'Organic', amount: 0 }],
                        kpis: [{ metric: 'Engagement', target: 'High' }]
                    },
                    created_by: 'atlas',
                    status: 'draft',
                    brand_score: 0,
                    pinned_to: {}
                });

                // 2. Add to Inbox
                store.addToInbox({
                    agent_id: 'atlas',
                    category: 'opportunity',
                    headline: 'Growth Strategy Ready',
                    subheadline: 'Atlas has developed a response plan.',
                    recommended_action: 'Approve strategy to generate content drafts.',
                    urgency: 'high',
                    confidence_score: 0.92,
                    status: 'pending',
                    related_artifacts: [strategyId],
                    related_signals: item.related_signals || [],
                    actions: [
                        { label: 'Generate Content', action_type: 'approve' },
                        { label: 'Edit Strategy', action_type: 'edit' },
                        { label: 'Reject', action_type: 'ignore' }
                    ]
                });
            }, 1000); // Simulate "Thinking"
        }

        // --------------------------------------------------------------------
        // STEP 3: User Approves Strategy -> Sage Creates Content (Inbox Item: Content Review)
        // --------------------------------------------------------------------
        if (status === 'approved' && item.agent_id === 'atlas') {
            setTimeout(() => {
                // 1. Sage Generates Content (Mock Sage Work)
                const draftId = store.addArtifact({
                    type: 'content_draft',
                    title: `LinkedIn Post: ${item.headline}`,
                    content: {
                        type: 'content_draft',
                        platform: 'LinkedIn',
                        headline: `Response to ${item.headline}`,
                        body: "The market is shifting. We've seen this before...\n\n(Sage would generate full copy here based on strategy.)",
                        cta: 'Learn More',
                        assets: []
                    },
                    created_by: 'sage',
                    status: 'review',
                    pinned_to: {}
                });

                // 2. Add to Inbox
                store.addToInbox({
                    agent_id: 'sage',
                    category: 'content',
                    headline: 'Content Drafts Ready',
                    subheadline: 'Sage has produced content based on the approved strategy.',
                    recommended_action: 'Review and Publish.',
                    urgency: 'medium',
                    confidence_score: 0.88,
                    status: 'pending',
                    related_artifacts: [draftId],
                    related_signals: item.related_signals || [],
                    actions: [
                        { label: 'Publish', action_type: 'approve' },
                        { label: 'Edit', action_type: 'edit' },
                        { label: 'Reject', action_type: 'ignore' }
                    ]
                });
            }, 1500);
        }

        // --------------------------------------------------------------------
        // STEP 4: User Approves Content -> Pulse Distributes (Done)
        // --------------------------------------------------------------------
        if (status === 'approved' && item.agent_id === 'sage') {
            // Pulse takes over.
            // In real app, this would hit the API.
            console.log('Pulse Agent: Distributing content...', item.related_artifacts);

            // Optional: Notify user of success via "Vantage" briefing later?
            // For now, just mark item approved (done).
        }
    }
}
