/**
 * Brand System Workspace
 * Brand rules, tone guidelines, and consistency tracking
 */

import { useState } from 'react';

import {
    Shield,
    BookOpen,
    Type,
    Check,
    X,
    AlertTriangle,
    Edit2,
    Plus,
    Eye
} from 'lucide-react';

// Mock brand data
const BRAND_VOICE = {
    tone: 'Confident, technical, forward-looking',
    personality: 'Expert advisor, not salesperson',
    avoid: ['Jargon-heavy phrasing', 'Overpromising', 'Generic AI buzzwords']
};

const BRAND_RULES = [
    { id: '1', category: 'Voice', rule: 'Lead with the business outcome, not the feature', active: true },
    { id: '2', category: 'Voice', rule: 'Use "you" more than "we" - customer-centric framing', active: true },
    { id: '3', category: 'Tone', rule: 'Confident but never arrogant', active: true },
    { id: '4', category: 'Tone', rule: 'Technical accuracy over marketing fluff', active: true },
    { id: '5', category: 'Visual', rule: 'Primary gradient: emerald-500 to cyan-500', active: true },
    { id: '6', category: 'Visual', rule: 'Dark mode first, light mode secondary', active: true },
    { id: '7', category: 'DO NOT', rule: 'Never claim to be "the best" or "market leader"', active: true },
    { id: '8', category: 'DO NOT', rule: 'Avoid comparisons that name competitors directly', active: true }
];

const RECENT_CHECKS = [
    { content: 'LinkedIn: Why AI Infrastructure Matters', score: 92, passed: true, issues: [] },
    { content: 'Email: Enterprise Demo Invite', score: 68, passed: false, issues: ['Uses "best-in-class" language', 'Missing customer-centric framing'] },
    { content: 'Blog: Q1 Product Update', score: 88, passed: true, issues: ['Minor: Could lead with outcome more'] }
];

function BrandScoreCard({ title, score }: { title: string; score: number }) {
    const getScoreColor = (s: number) => {
        if (s >= 80) return 'text-emerald-400';
        if (s >= 60) return 'text-amber-400';
        return 'text-rose-400';
    };

    return (
        <div className="p-4 bg-white/5 rounded-xl">
            <div className="text-xs text-zinc-500 mb-2">{title}</div>
            <div className={`text-3xl font-semibold ${getScoreColor(score)}`}>{score}%</div>
        </div>
    );
}

function RuleCard({ rule }: { rule: typeof BRAND_RULES[0] }) {
    const categoryColors: Record<string, string> = {
        Voice: 'bg-blue-500/20 text-blue-400',
        Tone: 'bg-violet-500/20 text-violet-400',
        Visual: 'bg-emerald-500/20 text-emerald-400',
        'DO NOT': 'bg-rose-500/20 text-rose-400'
    };

    return (
        <div className="flex items-center gap-3 p-3 bg-white/5 rounded-lg hover:bg-white/10 transition-colors group">
            <span className={`px-2 py-0.5 text-[10px] font-medium rounded ${categoryColors[rule.category] || 'bg-zinc-500/20 text-zinc-400'}`}>
                {rule.category}
            </span>
            <span className="flex-1 text-sm text-white">{rule.rule}</span>
            <div className="opacity-0 group-hover:opacity-100 flex items-center gap-1 transition-opacity">
                <button className="p-1 hover:bg-white/10 rounded text-zinc-400 hover:text-white">
                    <Edit2 className="w-3 h-3" />
                </button>
            </div>
        </div>
    );
}

function CheckResultCard({ check }: { check: typeof RECENT_CHECKS[0] }) {
    return (
        <div className={`p-4 rounded-xl border ${check.passed ? 'bg-emerald-500/5 border-emerald-500/20' : 'bg-rose-500/5 border-rose-500/20'}`}>
            <div className="flex items-start justify-between mb-2">
                <div className="flex items-center gap-2">
                    {check.passed ? (
                        <Check className="w-4 h-4 text-emerald-400" />
                    ) : (
                        <AlertTriangle className="w-4 h-4 text-rose-400" />
                    )}
                    <span className="text-sm text-white">{check.content}</span>
                </div>
                <span className={`text-lg font-semibold ${check.passed ? 'text-emerald-400' : 'text-rose-400'}`}>
                    {check.score}%
                </span>
            </div>
            {check.issues.length > 0 && (
                <ul className="mt-2 space-y-1 pl-6">
                    {check.issues.map((issue, i) => (
                        <li key={i} className="text-xs text-zinc-400">• {issue}</li>
                    ))}
                </ul>
            )}
        </div>
    );
}

export function BrandSystemWorkspace() {
    const [activeTab, setActiveTab] = useState<'rules' | 'checks' | 'voice'>('rules');

    const overallScore = Math.round(RECENT_CHECKS.reduce((sum, c) => sum + c.score, 0) / RECENT_CHECKS.length);

    return (
        <div className="h-full flex flex-col">
            {/* Header */}
            <div className="p-6 border-b border-white/5">
                <div className="flex items-center justify-between mb-4">
                    <div>
                        <h1 className="text-2xl font-instrument-serif text-white">Brand System</h1>
                        <p className="text-sm text-zinc-500 mt-1">Voice, tone, and consistency guidelines</p>
                    </div>
                    <button className="flex items-center gap-2 px-4 py-2 bg-white/10 hover:bg-white/20 text-white text-sm rounded-lg transition-colors">
                        <Eye className="w-4 h-4" /> Preview Guidelines
                    </button>
                </div>

                {/* Score Cards */}
                <div className="grid grid-cols-4 gap-4 mb-4">
                    <BrandScoreCard title="Overall Consistency" score={overallScore} />
                    <BrandScoreCard title="Voice Alignment" score={88} />
                    <BrandScoreCard title="Tone Check" score={82} />
                    <BrandScoreCard title="Visual Match" score={95} />
                </div>

                {/* Tabs */}
                <div className="flex items-center gap-2">
                    {([
                        { key: 'rules', icon: <Shield className="w-4 h-4" />, label: 'Brand Rules' },
                        { key: 'checks', icon: <Check className="w-4 h-4" />, label: 'Recent Checks' },
                        { key: 'voice', icon: <BookOpen className="w-4 h-4" />, label: 'Voice & Tone' }
                    ] as const).map(tab => (
                        <button
                            key={tab.key}
                            onClick={() => setActiveTab(tab.key)}
                            className={`flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-lg transition-colors ${activeTab === tab.key
                                ? 'bg-white/10 text-white'
                                : 'text-zinc-500 hover:text-white'
                                }`}
                        >
                            {tab.icon} {tab.label}
                        </button>
                    ))}
                </div>
            </div>

            {/* Content */}
            <div className="flex-1 overflow-y-auto p-6">
                {activeTab === 'rules' && (
                    <div className="space-y-2">
                        {BRAND_RULES.map(rule => (
                            <RuleCard key={rule.id} rule={rule} />
                        ))}
                        <button className="w-full p-3 border border-dashed border-white/10 rounded-lg text-sm text-zinc-500 hover:text-white hover:border-white/20 transition-colors flex items-center justify-center gap-2">
                            <Plus className="w-4 h-4" /> Add Rule
                        </button>
                    </div>
                )}

                {activeTab === 'checks' && (
                    <div className="space-y-4">
                        {RECENT_CHECKS.map((check, i) => (
                            <CheckResultCard key={i} check={check} />
                        ))}
                    </div>
                )}

                {activeTab === 'voice' && (
                    <div className="space-y-6">
                        <div className="p-5 bg-white/5 rounded-xl">
                            <div className="flex items-center gap-2 mb-3">
                                <Type className="w-4 h-4 text-blue-400" />
                                <h3 className="text-sm font-medium text-white">Brand Tone</h3>
                            </div>
                            <p className="text-sm text-zinc-300">{BRAND_VOICE.tone}</p>
                        </div>

                        <div className="p-5 bg-white/5 rounded-xl">
                            <div className="flex items-center gap-2 mb-3">
                                <BookOpen className="w-4 h-4 text-violet-400" />
                                <h3 className="text-sm font-medium text-white">Brand Personality</h3>
                            </div>
                            <p className="text-sm text-zinc-300">{BRAND_VOICE.personality}</p>
                        </div>

                        <div className="p-5 bg-rose-500/5 border border-rose-500/20 rounded-xl">
                            <div className="flex items-center gap-2 mb-3">
                                <X className="w-4 h-4 text-rose-400" />
                                <h3 className="text-sm font-medium text-white">Things to Avoid</h3>
                            </div>
                            <ul className="space-y-2">
                                {BRAND_VOICE.avoid.map((item, i) => (
                                    <li key={i} className="text-sm text-zinc-300 flex items-center gap-2">
                                        <span className="w-1.5 h-1.5 bg-rose-500 rounded-full" />
                                        {item}
                                    </li>
                                ))}
                            </ul>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}

export default BrandSystemWorkspace;
