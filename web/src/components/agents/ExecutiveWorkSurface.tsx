/**
 * Executive Briefing Agent - Work Surface
 * Panels: Weekly Summary, Decisions Queue, Risks Dashboard, Metrics Snapshots
 * WIRED TO REAL STATE
 */

import { useState } from 'react';
import { motion } from 'framer-motion';
import { FileText, AlertTriangle, ChevronRight, ThumbsUp, ThumbsDown, Check } from 'lucide-react';
import { useMarketingOS } from '../../lib/store';
import { approveItem, rejectItem } from '../../lib/actions';
import { AGENT_CONFIGS } from '../../lib/types/mock-data';

interface Decision {
    id: string;
    question: string;
    context: string;
    recommendation: string;
    urgency: 'high' | 'medium' | 'low';
    agents: string[];
    status: 'pending' | 'approved' | 'rejected';
}

function DecisionCard({ decision, onApprove, onReject }: {
    decision: Decision;
    onApprove: () => void;
    onReject: () => void;
}) {
    const [isActioned, setIsActioned] = useState(false);

    const urgencyColors = {
        high: 'border-l-rose-500',
        medium: 'border-l-amber-500',
        low: 'border-l-emerald-500'
    };

    const handleApprove = () => {
        setIsActioned(true);
        onApprove();
    };

    const handleReject = () => {
        setIsActioned(true);
        onReject();
    };

    if (isActioned) {
        return (
            <motion.div
                className="p-4 bg-emerald-500/10 rounded-xl border border-emerald-500/20"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
            >
                <div className="flex items-center gap-2 text-emerald-400">
                    <Check className="w-4 h-4" />
                    <span className="text-sm">Decision recorded. Agents notified.</span>
                </div>
            </motion.div>
        );
    }

    return (
        <motion.div
            className={`p-4 bg-white/5 rounded-xl border-l-2 ${urgencyColors[decision.urgency]}`}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
        >
            <div className="flex items-start justify-between mb-3">
                <h4 className="text-sm font-medium text-white">{decision.question}</h4>
                <span className={`px-2 py-0.5 text-[10px] uppercase font-medium rounded ${decision.urgency === 'high' ? 'bg-rose-500/20 text-rose-400' :
                    decision.urgency === 'medium' ? 'bg-amber-500/20 text-amber-400' :
                        'bg-emerald-500/20 text-emerald-400'
                    }`}>
                    {decision.urgency}
                </span>
            </div>

            <p className="text-xs text-zinc-400 mb-3">{decision.context}</p>

            {/* Agents involved */}
            <div className="flex items-center gap-2 mb-3">
                {decision.agents.slice(0, 3).map(agentId => {
                    const agent = AGENT_CONFIGS.find(a => a.id === agentId);
                    return agent ? (
                        <img
                            key={agentId}
                            src={agent.avatar}
                            alt={agent.name}
                            className="w-6 h-6 rounded-full ring-1 ring-zinc-800"
                            title={agent.name}
                        />
                    ) : null;
                })}
            </div>

            <div className="p-3 bg-emerald-500/10 rounded-lg mb-4">
                <div className="text-[10px] text-emerald-400 uppercase tracking-wider mb-1">Recommendation</div>
                <p className="text-sm text-white">{decision.recommendation}</p>
            </div>

            <div className="flex items-center gap-2">
                <button
                    onClick={handleApprove}
                    className="flex items-center gap-1 px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white text-xs rounded-lg transition-colors"
                >
                    <ThumbsUp className="w-3 h-3" /> Approve
                </button>
                <button
                    onClick={handleReject}
                    className="flex items-center gap-1 px-4 py-2 bg-white/10 hover:bg-white/20 text-white text-xs rounded-lg transition-colors"
                >
                    <ThumbsDown className="w-3 h-3" /> Reject
                </button>
                <button className="px-4 py-2 text-zinc-400 hover:text-white text-xs transition-colors">
                    Defer
                </button>
            </div>
        </motion.div>
    );
}

function RiskItem({ risk }: { risk: { id: number; text: string; severity: string; mitigation: string } }) {
    const severityColors: Record<string, string> = {
        high: 'text-rose-400',
        medium: 'text-amber-400',
        low: 'text-emerald-400'
    };

    return (
        <div className="flex items-start gap-3 p-3 bg-white/5 rounded-lg">
            <AlertTriangle className={`w-4 h-4 mt-0.5 ${severityColors[risk.severity] || 'text-zinc-400'}`} />
            <div className="flex-1">
                <p className="text-sm text-white">{risk.text}</p>
                <div className="flex items-center gap-2 mt-1">
                    <span className={`text-[10px] uppercase ${severityColors[risk.severity] || 'text-zinc-400'}`}>
                        {risk.severity}
                    </span>
                    <span className="text-[10px] text-zinc-500">• {risk.mitigation}</span>
                </div>
            </div>
        </div>
    );
}

export function ExecutiveWorkSurface() {
    const [activeTab, setActiveTab] = useState<'decisions' | 'summary' | 'risks'>('decisions');
    const { approvals, tasks, agentConfidence } = useMarketingOS();

    // Convert approvals to decisions format for display
    const pendingApprovals = approvals.filter(a => a.status === 'pending');

    // Generate decisions from store or use defaults
    const decisions: Decision[] = pendingApprovals.length > 0
        ? pendingApprovals.map(a => ({
            id: a.approval_id,
            question: `Approve: ${a.title}?`,
            context: `${a.type} from ${a.requested_by}`,
            recommendation: 'Review and approve if aligned with strategy',
            urgency: 'medium' as const,
            agents: [a.requested_by],
            status: a.status
        }))
        : [
            {
                id: 'demo-1',
                question: 'Approve NVIDIA GTC Counter-Campaign?',
                context: 'Growth Strategy Agent proposes $15,000 targeted campaign during GTC week.',
                recommendation: 'Approve with reduced initial spend ($8,000) to test messaging.',
                urgency: 'high' as const,
                agents: ['vantage', 'sage'],
                status: 'pending' as const
            },
            {
                id: 'demo-2',
                question: 'Respond to Intel pricing change?',
                context: 'Intel cut enterprise GPU pricing by 15%. 3 accounts flagged as at-risk.',
                recommendation: 'Deploy value messaging + schedule account review calls.',
                urgency: 'high' as const,
                agents: ['echo', 'vantage'],
                status: 'pending' as const
            }
        ];

    const RISKS = [
        { id: 1, text: 'NVIDIA GTC may overshadow product launch timing', severity: 'medium', mitigation: 'Move launch date' },
        { id: 2, text: 'Brand consistency score dropped to 87%', severity: 'low', mitigation: 'Pulse reviewing' },
        { id: 3, text: 'Intel pricing pressure on 3 enterprise accounts', severity: 'high', mitigation: 'Account outreach scheduled' }
    ];

    // Build dynamic weekly summary from store state
    const taskCounts = {
        proposed: tasks.filter(t => t.status === 'proposed').length,
        in_progress: tasks.filter(t => t.status === 'in_progress').length,
        done: tasks.filter(t => t.status === 'done').length
    };

    const confidenceSummary = Object.values(agentConfidence)
        .map(c => `${c.agentId}: ${c.confidence}%`)
        .join(', ');

    const WEEKLY_SUMMARY = [
        `${tasks.length} total tasks tracked (${taskCounts.in_progress} in progress)`,
        `${pendingApprovals.length} items pending approval`,
        `Agent confidence: ${confidenceSummary || 'Loading...'}`,
        'Intel pricing change triggers opportunity response',
        'NVIDIA GTC counter-campaign proposed and pending approval'
    ];

    const handleApprove = (decisionId: string) => {
        // Find matching approval and resolve it
        const approval = approvals.find(a => a.approval_id === decisionId);
        if (approval) {
            approveItem(decisionId, 'Approved by user');
        }
    };

    const handleReject = (decisionId: string) => {
        const approval = approvals.find(a => a.approval_id === decisionId);
        if (approval) {
            rejectItem(decisionId, 'Rejected by user - needs revision');
        }
    };

    return (
        <div className="h-full flex flex-col">
            {/* Tabs */}
            <div className="flex items-center gap-4 p-4 border-b border-white/5">
                <button
                    onClick={() => setActiveTab('decisions')}
                    className={`text-sm font-medium transition-colors flex items-center gap-2 ${activeTab === 'decisions' ? 'text-white' : 'text-zinc-500 hover:text-white'
                        }`}
                >
                    Decisions
                    <span className="px-1.5 py-0.5 text-[10px] bg-rose-500/20 text-rose-400 rounded">
                        {decisions.filter(d => d.status === 'pending').length}
                    </span>
                </button>
                <button
                    onClick={() => setActiveTab('summary')}
                    className={`text-sm font-medium transition-colors ${activeTab === 'summary' ? 'text-white' : 'text-zinc-500 hover:text-white'
                        }`}
                >
                    Weekly Summary
                </button>
                <button
                    onClick={() => setActiveTab('risks')}
                    className={`text-sm font-medium transition-colors flex items-center gap-2 ${activeTab === 'risks' ? 'text-white' : 'text-zinc-500 hover:text-white'
                        }`}
                >
                    Risks
                    <span className="px-1.5 py-0.5 text-[10px] bg-amber-500/20 text-amber-400 rounded">
                        {RISKS.filter(r => r.severity === 'high').length}
                    </span>
                </button>
            </div>

            {/* Content */}
            <div className="flex-1 overflow-auto p-4">
                {activeTab === 'decisions' && (
                    <div className="space-y-4">
                        {decisions.map(decision => (
                            <DecisionCard
                                key={decision.id}
                                decision={decision}
                                onApprove={() => handleApprove(decision.id)}
                                onReject={() => handleReject(decision.id)}
                            />
                        ))}
                    </div>
                )}

                {activeTab === 'summary' && (
                    <div className="space-y-3">
                        <div className="p-4 bg-white/5 rounded-xl">
                            <div className="flex items-center gap-2 mb-4">
                                <FileText className="w-4 h-4 text-zinc-400" />
                                <h4 className="text-sm font-medium text-white">This Week</h4>
                            </div>
                            <ul className="space-y-2">
                                {WEEKLY_SUMMARY.map((item, i) => (
                                    <li key={i} className="flex items-start gap-2 text-sm text-zinc-300">
                                        <ChevronRight className="w-4 h-4 text-zinc-500 mt-0.5 flex-shrink-0" />
                                        {item}
                                    </li>
                                ))}
                            </ul>
                        </div>
                    </div>
                )}

                {activeTab === 'risks' && (
                    <div className="space-y-3">
                        {RISKS.map(risk => (
                            <RiskItem key={risk.id} risk={risk} />
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}

export default ExecutiveWorkSurface;
