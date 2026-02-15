/**
 * Brand Architect Agent - Work Surface
 * Panels: Brand Rules, Tone Checker, Messaging Approval, Consistency Score
 */

import { useState } from 'react';
import { motion } from 'framer-motion';
import { Shield, Check, X, AlertTriangle, ThumbsUp, ThumbsDown } from 'lucide-react';

// Mock brand data
const BRAND_RULES = [
    { id: 1, category: 'Tone', rule: 'Always authoritative but never arrogant', active: true },
    { id: 2, category: 'Tone', rule: 'Technical depth is preferred over simplification', active: true },
    { id: 3, category: 'Language', rule: 'Use US English spelling', active: true },
    { id: 4, category: 'Language', rule: 'Avoid superlatives (best, fastest, #1)', active: true },
    { id: 5, category: 'Messaging', rule: 'Lead with customer outcomes, not features', active: true },
];

const APPROVAL_QUEUE = [
    {
        id: 1,
        content: 'Our AI accelerators are the fastest in the industry, delivering 10x performance gains.',
        source: 'Content Director',
        issues: ['Contains superlative "fastest"', 'Feature-focused instead of outcome-focused'],
        status: 'pending'
    },
    {
        id: 2,
        content: 'Enterprise teams choose our platform because it reduces time-to-value by 60%.',
        source: 'Growth Strategy',
        issues: [],
        status: 'approved'
    }
];

const CONSISTENCY_SCORE = 87;

function RuleCard({ rule }: { rule: typeof BRAND_RULES[0] }) {
    const [active, setActive] = useState(rule.active);

    return (
        <div className="flex items-center gap-3 p-3 bg-white/5 rounded-lg">
            <button
                onClick={() => setActive(!active)}
                className={`w-5 h-5 rounded flex items-center justify-center transition-colors ${active ? 'bg-emerald-600' : 'bg-white/10'
                    }`}
            >
                {active && <Check className="w-3 h-3 text-white" />}
            </button>
            <div className="flex-1">
                <span className="text-[10px] text-zinc-500 uppercase">{rule.category}</span>
                <p className="text-sm text-white">{rule.rule}</p>
            </div>
        </div>
    );
}

function ApprovalCard({ item }: { item: typeof APPROVAL_QUEUE[0] }) {
    return (
        <motion.div
            className={`p-4 rounded-xl border ${item.issues.length > 0
                    ? 'bg-amber-500/5 border-amber-500/20'
                    : 'bg-emerald-500/5 border-emerald-500/20'
                }`}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
        >
            <div className="flex items-start gap-3 mb-3">
                {item.issues.length > 0 ? (
                    <AlertTriangle className="w-5 h-5 text-amber-400 mt-0.5" />
                ) : (
                    <Check className="w-5 h-5 text-emerald-400 mt-0.5" />
                )}
                <div className="flex-1">
                    <p className="text-sm text-white">"{item.content}"</p>
                    <span className="text-[10px] text-zinc-500 mt-1 block">From: {item.source}</span>
                </div>
            </div>

            {item.issues.length > 0 && (
                <div className="mb-3 pl-8">
                    {item.issues.map((issue, i) => (
                        <div key={i} className="text-xs text-amber-400 flex items-center gap-1">
                            <X className="w-3 h-3" /> {issue}
                        </div>
                    ))}
                </div>
            )}

            {item.status === 'pending' && (
                <div className="flex items-center gap-2 pl-8">
                    <button className="flex items-center gap-1 px-3 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white text-xs rounded-lg transition-colors">
                        <ThumbsUp className="w-3 h-3" /> Approve
                    </button>
                    <button className="flex items-center gap-1 px-3 py-1.5 bg-white/10 hover:bg-white/20 text-white text-xs rounded-lg transition-colors">
                        <ThumbsDown className="w-3 h-3" /> Reject
                    </button>
                    <button className="px-3 py-1.5 text-zinc-400 hover:text-white text-xs transition-colors">
                        Suggest Rewrite
                    </button>
                </div>
            )}
        </motion.div>
    );
}

export function BrandWorkSurface() {
    const [activeTab, setActiveTab] = useState<'rules' | 'approvals'>('approvals');

    return (
        <div className="h-full flex flex-col">
            {/* Header with Consistency Score */}
            <div className="p-4 border-b border-white/5 flex items-center justify-between">
                <div className="flex items-center gap-4">
                    <button
                        onClick={() => setActiveTab('approvals')}
                        className={`text-sm font-medium transition-colors flex items-center gap-2 ${activeTab === 'approvals' ? 'text-white' : 'text-zinc-500 hover:text-white'
                            }`}
                    >
                        Approval Queue
                        <span className="px-1.5 py-0.5 text-[10px] bg-amber-500/20 text-amber-400 rounded">
                            {APPROVAL_QUEUE.filter(i => i.status === 'pending').length}
                        </span>
                    </button>
                    <button
                        onClick={() => setActiveTab('rules')}
                        className={`text-sm font-medium transition-colors ${activeTab === 'rules' ? 'text-white' : 'text-zinc-500 hover:text-white'
                            }`}
                    >
                        Brand Rules
                    </button>
                </div>

                {/* Consistency Score */}
                <div className="flex items-center gap-3">
                    <Shield className="w-4 h-4 text-emerald-400" />
                    <div>
                        <div className="text-xs text-zinc-500">Consistency</div>
                        <div className="text-lg font-semibold text-white">{CONSISTENCY_SCORE}%</div>
                    </div>
                </div>
            </div>

            {/* Content */}
            <div className="flex-1 overflow-auto p-4">
                {activeTab === 'approvals' && (
                    <div className="space-y-3">
                        {APPROVAL_QUEUE.map(item => (
                            <ApprovalCard key={item.id} item={item} />
                        ))}
                    </div>
                )}

                {activeTab === 'rules' && (
                    <div className="space-y-2">
                        {BRAND_RULES.map(rule => (
                            <RuleCard key={rule.id} rule={rule} />
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}

export default BrandWorkSurface;
