import React from 'react';
import { motion } from 'framer-motion';
import {
    CheckCircle,
    XCircle,
    Edit3,
    AlertTriangle,
    TrendingUp,
    Shield,
    Zap,
    FileText,
    ArrowRight
} from 'lucide-react';
import type { AgentType } from '../lib/aibc/signals/types';

interface DecisionCardProps {
    id: string;
    title: string;
    description: string;
    agentOwner: AgentType;
    recommendation: string;
    impact: number; // 0-100
    confidence: number; // 0-100
    priority: 'low' | 'medium' | 'high' | 'critical';
    status: 'open' | 'approved' | 'rejected' | 'completed';
    onApprove: (id: string) => void;
    onReject: (id: string) => void;
    onModify: (id: string) => void;
}

const AGENT_CONFIG: Record<AgentType, { color: string; icon: React.ElementType; label: string }> = {
    competitor_intelligence: { color: 'blue', icon: Shield, label: 'Competitor Intel' },
    content_director: { color: 'purple', icon: FileText, label: 'Content Director' },
    brand_architect: { color: 'indigo', icon: Shield, label: 'Brand Architect' },
    growth_strategy: { color: 'green', icon: TrendingUp, label: 'Growth Strategy' },
    executive_briefing: { color: 'gray', icon: Zap, label: 'Executive Briefing' },
};

export function DecisionCard({
    id,
    title,
    description,
    agentOwner,
    recommendation,
    impact,
    confidence,
    priority,
    onApprove,
    onReject,
    onModify
}: DecisionCardProps) {
    const agent = AGENT_CONFIG[agentOwner] || AGENT_CONFIG.competitor_intelligence;

    // Dynamic styles based on priority/confidence
    const isCritical = priority === 'critical';
    const borderColor = isCritical ? 'border-red-500/50' : 'border-white/5';

    return (
        <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className={`group relative bg-black/40 backdrop-blur-md border ${borderColor} rounded-xl p-5 hover:border-white/10 transition-all duration-300 shadow-xl`}
        >
            {/* Header: Agent Identity & Priority */}
            <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                    <div className={`p-2 rounded-lg bg-${agent.color}-500/10 border border-${agent.color}-500/20`}>
                        <agent.icon className={`w-4 h-4 text-${agent.color}-400`} />
                    </div>
                    <div>
                        <div className={`text-xs font-mono uppercase tracking-wider text-${agent.color}-400 mb-0.5`}>
                            {agent.label}
                        </div>
                        <h3 className="text-sm font-semibold text-white group-hover:text-blue-200 transition-colors">
                            {title}
                        </h3>
                    </div>
                </div>

                {isCritical && (
                    <div className="flex items-center gap-1.5 px-2 py-1 bg-red-500/10 border border-red-500/20 rounded text-xs font-medium text-red-400 animate-pulse">
                        <AlertTriangle className="w-3 h-3" />
                        CRITICAL
                    </div>
                )}
            </div>

            {/* Core Recommendation */}
            <div className="mb-5 pl-3 border-l-2 border-white/10">
                <p className="text-gray-300 text-sm leading-relaxed mb-2">
                    {description}
                </p>
                <div className="text-white font-medium text-sm flex items-start gap-2">
                    <ArrowRight className="w-4 h-4 mt-0.5 text-blue-400 shrink-0" />
                    <span>Rec: {recommendation}</span>
                </div>
            </div>

            {/* Metrics Grid */}
            <div className="grid grid-cols-2 gap-2 mb-6 text-xs">
                <div className="bg-white/5 rounded-lg p-2.5 border border-white/5">
                    <div className="text-gray-500 mb-1 flex items-center gap-1">
                        Confidence
                        {confidence < 70 && <AlertTriangle className="w-3 h-3 text-amber-500" />}
                    </div>
                    <div className="flex items-end gap-1.5">
                        <span className={`text-lg font-mono font-medium ${confidence > 80 ? 'text-green-400' : 'text-amber-400'}`}>
                            {confidence}%
                        </span>
                        <div className="h-1.5 flex-1 bg-white/10 rounded-full mb-1.5 overflow-hidden">
                            <div
                                className={`h-full rounded-full ${confidence > 80 ? 'bg-green-500' : 'bg-amber-500'}`}
                                style={{ width: `${confidence}%` }}
                            />
                        </div>
                    </div>
                </div>

                <div className="bg-white/5 rounded-lg p-2.5 border border-white/5">
                    <div className="text-gray-500 mb-1">Business Impact</div>
                    <div className="flex items-end gap-1.5">
                        <span className="text-lg font-mono font-medium text-blue-400">
                            {impact}/10
                        </span>
                        <div className="h-1.5 flex-1 bg-white/10 rounded-full mb-1.5 overflow-hidden">
                            <div
                                className="h-full rounded-full bg-blue-500"
                                style={{ width: `${impact * 10}%` }}
                            />
                        </div>
                    </div>
                </div>
            </div>

            {/* Actions Footer */}
            <div className="flex items-center gap-2 pt-2 border-t border-white/5">
                <button
                    onClick={() => onApprove(id)}
                    className="flex-1 flex items-center justify-center gap-2 py-2 px-3 bg-green-500/10 hover:bg-green-500/20 text-green-400 rounded-lg text-xs font-medium transition-all group/btn border border-transparent hover:border-green-500/30"
                >
                    <CheckCircle className="w-3.5 h-3.5" />
                    Approve
                </button>

                <button
                    onClick={() => onModify(id)}
                    className="flex-1 flex items-center justify-center gap-2 py-2 px-3 bg-blue-500/10 hover:bg-blue-500/20 text-blue-400 rounded-lg text-xs font-medium transition-all group/btn border border-transparent hover:border-blue-500/30"
                >
                    <Edit3 className="w-3.5 h-3.5" />
                    Modify
                </button>

                <button
                    onClick={() => onReject(id)}
                    className="px-3 py-2 bg-white/5 hover:bg-white/10 text-gray-400 hover:text-red-400 rounded-lg transition-colors border border-transparent hover:border-red-500/20"
                    title="Reject"
                >
                    <XCircle className="w-4 h-4" />
                </button>
            </div>

            {/* Ambient Background Glow for high priority */}
            {isCritical && (
                <div className="absolute inset-0 bg-red-500/5 rounded-xl pointer-events-none animate-pulse" />
            )}
        </motion.div>
    );
}
