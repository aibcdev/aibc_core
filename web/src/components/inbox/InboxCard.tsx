
import { motion } from 'framer-motion';
import {
    AlertTriangle,
    CheckCircle,
    FileText,
    ShieldAlert,
    Sparkles,
    TrendingUp
} from 'lucide-react';
import type { InboxItem } from '../../lib/types/marketing-os';
import { useMarketingOS } from '../../lib/store';

interface InboxCardProps {
    item: InboxItem;
}

const categoryIcons = {
    market: TrendingUp,
    content: FileText,
    risk: ShieldAlert,
    opportunity: Sparkles,
};

const categoryColors = {
    market: 'text-blue-400 bg-blue-400/10 border-blue-400/20',
    content: 'text-purple-400 bg-purple-400/10 border-purple-400/20',
    risk: 'text-red-400 bg-red-400/10 border-red-400/20',
    opportunity: 'text-emerald-400 bg-emerald-400/10 border-emerald-400/20',
};

export function InboxCard({ item }: InboxCardProps) {
    const resolveInboxItem = useMarketingOS(state => state.resolveInboxItem);
    const Icon = categoryIcons[item.category] || Sparkles;

    const handleAction = (actionType: 'approve' | 'ignore') => {
        if (actionType === 'approve') {
            resolveInboxItem(item.id, 'approved');
        } else {
            resolveInboxItem(item.id, 'archived');
        }
    };

    return (
        <motion.div
            layout
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="group relative bg-[#0a0a0a] border border-white/10 rounded-xl overflow-hidden hover:border-white/20 transition-colors"
        >
            {/* Urgency Indicator */}
            {item.urgency === 'high' && (
                <div className="absolute top-0 right-0 p-2">
                    <div className="flex items-center gap-1.5 px-2 py-1 bg-red-500/10 border border-red-500/20 rounded-full">
                        <AlertTriangle className="w-3 h-3 text-red-500" />
                        <span className="text-[10px] font-medium text-red-400 uppercase tracking-wider">High Urgency</span>
                    </div>
                </div>
            )}

            <div className="p-5">
                {/* Header */}
                <div className="flex items-start gap-4 mb-4">
                    <div className={`p-2.5 rounded-lg border ${categoryColors[item.category]}`}>
                        <Icon className="w-5 h-5" />
                    </div>
                    <div className="flex-1 min-w-0 pr-20">
                        <div className="flex items-baseline gap-2 mb-1">
                            <span className="text-xs font-semibold text-zinc-500 uppercase tracking-wider">
                                {item.agent_id} • {item.category}
                            </span>
                            <span className="text-xs text-zinc-600">
                                {new Date(item.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                            </span>
                        </div>
                        <h3 className="text-lg font-medium text-white leading-tight mb-2">
                            {item.headline}
                        </h3>
                    </div>
                </div>

                {/* Core content grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-5">
                    <div className="p-3 rounded-lg bg-white/5 border border-white/5">
                        <h4 className="text-xs font-semibold text-zinc-400 mb-1.5 uppercase tracking-wider">Why it matters</h4>
                        <p className="text-sm text-zinc-300 leading-relaxed">
                            {item.subheadline}
                        </p>
                    </div>
                    <div className="p-3 rounded-lg bg-emerald-500/5 border border-emerald-500/10">
                        <h4 className="text-xs font-semibold text-emerald-400 mb-1.5 uppercase tracking-wider">Recommendation</h4>
                        <p className="text-sm text-zinc-300 leading-relaxed">
                            {item.recommended_action}
                        </p>
                    </div>
                </div>

                {/* Footer / Actions */}
                <div className="flex items-center justify-between pt-4 border-t border-white/5">
                    {/* Confidence Score */}
                    <div className="flex items-center gap-2">
                        <div className="flex items-center gap-1.5 px-2 py-1 rounded-md bg-white/5 border border-white/10">
                            <div className={`w-1.5 h-1.5 rounded-full ${item.confidence_score > 0.8 ? 'bg-emerald-500' :
                                item.confidence_score > 0.6 ? 'bg-amber-500' : 'bg-red-500'
                                }`} />
                            <span className="text-xs font-mono text-zinc-400">
                                {Math.round(item.confidence_score * 100)}% Confidence
                            </span>
                        </div>
                        {item.related_artifacts.length > 0 && (
                            <div className="flex items-center gap-1.5 px-2 py-1 rounded-md bg-indigo-500/10 border border-indigo-500/20">
                                <FileText className="w-3 h-3 text-indigo-400" />
                                <span className="text-xs text-indigo-300">
                                    {item.related_artifacts.length} Draft{item.related_artifacts.length > 1 ? 's' : ''}
                                </span>
                            </div>
                        )}
                    </div>

                    {/* Action Buttons */}
                    <div className="flex items-center gap-2">
                        {item.actions && item.actions.length > 0 ? (
                            item.actions.map((action, idx) => (
                                <button
                                    key={idx}
                                    onClick={() => handleAction(action.action_type === 'approve' ? 'approve' : 'ignore')} // Simplification for now
                                    className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-colors flex items-center gap-1.5 ${action.action_type === 'approve'
                                        ? 'text-black bg-white hover:bg-zinc-200 shadow-lg shadow-white/5'
                                        : 'text-zinc-400 hover:text-white hover:bg-white/5'
                                        }`}
                                >
                                    {action.action_type === 'approve' && <CheckCircle className="w-3.5 h-3.5" />}
                                    {action.label}
                                </button>
                            ))
                        ) : (
                            // Fallback if no actions defined
                            <>
                                <button
                                    onClick={() => handleAction('ignore')}
                                    className="px-3 py-1.5 text-xs font-medium text-zinc-400 hover:text-white hover:bg-white/5 rounded-lg transition-colors"
                                >
                                    Ignore
                                </button>
                                <button
                                    onClick={() => handleAction('approve')}
                                    className="px-4 py-1.5 text-xs font-medium text-black bg-white hover:bg-zinc-200 rounded-lg transition-colors flex items-center gap-1.5 shadow-lg shadow-white/5"
                                >
                                    <CheckCircle className="w-3.5 h-3.5" />
                                    Approve
                                </button>
                            </>
                        )}
                    </div>
                </div>
            </div>
        </motion.div>
    );
}
