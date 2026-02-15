/**
 * Intelligence Workspace
 * Live signal feed with filtering and actions
 */

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Rss,
    Filter,
    Calendar,
    ArrowRight,
    AlertTriangle,
    TrendingUp,
    Globe,
    RefreshCw,
    Search,
    Zap
} from 'lucide-react';

import { addSignalToCalendar, escalateToAgent } from '../../lib/actions';
import { fetchNewsSignals } from '../../lib/aibc/signals/ingestion';
import type { AgentId, Signal } from '../../lib/types/marketing-os';

const CATEGORIES = ['all', 'competitor_move', 'market_opportunity', 'risk', 'pricing', 'event', 'noise'];

interface SignalCardProps {
    signal: Signal;
    onAction: (type: 'calendar' | 'escalate', agent?: AgentId) => void;
}

function SignalCard({ signal, onAction }: SignalCardProps) {
    const [actioned, setActioned] = useState(false);

    // Map classification to urgency color
    const getUrgencyColor = (s: Signal) => {
        if (s.classification === 'risk' || s.classification === 'competitor_move') return 'border-l-rose-500 bg-rose-500/5';
        if (s.classification === 'market_opportunity') return 'border-l-emerald-500 bg-emerald-500/5';
        return 'border-l-amber-500 bg-amber-500/5';
    };

    const categoryIcons: Record<string, React.ReactNode> = {
        competitor_move: <TrendingUp className="w-4 h-4" />,
        market_opportunity: <Globe className="w-4 h-4" />,
        risk: <AlertTriangle className="w-4 h-4" />,
        cultural_moment: <Zap className="w-4 h-4" />,
        pricing: <TrendingUp className="w-4 h-4" />,
        event: <Calendar className="w-4 h-4" />
    };

    if (actioned) {
        return (
            <motion.div
                className="p-4 bg-emerald-500/10 border border-emerald-500/20 rounded-xl"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
            >
                <div className="flex items-center gap-2 text-emerald-400">
                    <Zap className="w-4 h-4" />
                    <span className="text-sm">Signal processed. Task created.</span>
                </div>
            </motion.div>
        );
    }

    return (
        <motion.div
            className={`p-4 border-l-2 rounded-xl ${getUrgencyColor(signal)}`}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            whileHover={{ x: 2 }}
        >
            <div className="flex items-start justify-between mb-3">
                <div className="flex items-start gap-3">
                    <div className="p-2 rounded-lg bg-white/5 text-zinc-400">
                        {categoryIcons[signal.classification as string] || <Globe className="w-4 h-4" />}
                    </div>
                    <div>
                        <h4 className="text-sm font-medium text-white">{signal.topic}</h4>
                        <div className="flex items-center gap-2 mt-1">
                            <span className="text-[10px] text-zinc-500 uppercase">{signal.source}</span>
                            <span className="text-[10px] text-zinc-600">•</span>
                            <span className="text-[10px] text-zinc-500">
                                {new Date(signal.timestamp).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                            </span>
                        </div>
                    </div>
                </div>
                <div className="text-right">
                    <div className="text-lg font-semibold text-white">{Math.round(signal.confidence * 100)}%</div>
                    <div className="text-[10px] text-zinc-500">confidence</div>
                </div>
            </div>

            {/* Tags */}
            <div className="flex flex-wrap gap-1 mb-3">
                {signal.tags.map(tag => (
                    <span key={tag} className="px-2 py-0.5 bg-white/5 text-[10px] text-zinc-400 rounded">
                        {tag}
                    </span>
                ))}
            </div>

            {/* Actions */}
            <div className="flex items-center gap-2">
                <button
                    onClick={() => { setActioned(true); onAction('calendar'); }}
                    className="flex items-center gap-1 px-3 py-1.5 bg-white/10 hover:bg-white/20 text-xs text-white rounded-lg transition-colors"
                >
                    <Calendar className="w-3 h-3" /> Add to Calendar
                </button>
                <button
                    onClick={() => { setActioned(true); onAction('escalate', 'vantage'); }}
                    className="flex items-center gap-1 px-3 py-1.5 bg-white/10 hover:bg-white/20 text-xs text-white rounded-lg transition-colors"
                >
                    <ArrowRight className="w-3 h-3" /> Escalate to Strategy
                </button>
                <button
                    onClick={() => { setActioned(true); onAction('escalate', 'sage'); }}
                    className="flex items-center gap-1 px-3 py-1.5 bg-white/10 hover:bg-white/20 text-xs text-white rounded-lg transition-colors"
                >
                    <ArrowRight className="w-3 h-3" /> Request Content
                </button>
            </div>
        </motion.div>
    );
}

export function IntelligenceWorkspace() {
    const [activeCategory, setActiveCategory] = useState('all');
    const [searchQuery, setSearchQuery] = useState('');
    const [isRefreshing, setIsRefreshing] = useState(false);
    const [signals, setSignals] = useState<Signal[]>([]);

    // Load signals on mount
    useEffect(() => {
        loadSignals();
    }, []);

    const loadSignals = async () => {
        setIsRefreshing(true);
        const newSignals = await fetchNewsSignals();
        setSignals(newSignals);
        setIsRefreshing(false);
    };

    const filteredSignals = signals.filter(signal => {
        const matchesCategory = activeCategory === 'all' || signal.classification === activeCategory;
        const matchesSearch = signal.topic.toLowerCase().includes(searchQuery.toLowerCase()) ||
            signal.tags.some(t => t.toLowerCase().includes(searchQuery.toLowerCase()));
        return matchesCategory && matchesSearch;
    });

    const handleRefresh = () => {
        loadSignals();
    };

    const handleSignalAction = (signal: Signal, type: 'calendar' | 'escalate', agent?: AgentId) => {
        if (type === 'calendar') {
            addSignalToCalendar(
                { topic: signal.topic, industry: signal.industry, tags: signal.tags },
                signal.classification === 'competitor_move' ? 'competitor' : 'opportunity',
                { start: new Date(), end: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000) },
                ['echo', 'vantage']
            );
        } else if (type === 'escalate' && agent) {
            escalateToAgent('echo', agent, {
                title: `Signal: ${signal.topic}`,
                description: `Source: ${signal.source}. Category: ${signal.classification}. Confidence: ${Math.round(signal.confidence * 100)}%`
            });
        }
    };

    return (
        <div className="h-full flex flex-col">
            {/* Header */}
            <div className="p-6 border-b border-white/5">
                <div className="flex items-center justify-between mb-4">
                    <div>
                        <h1 className="text-2xl font-instrument-serif text-white">Intelligence</h1>
                        <p className="text-sm text-zinc-500 mt-1">Live market signals and competitor monitoring</p>
                    </div>
                    <div className="flex items-center gap-3">
                        <button
                            onClick={handleRefresh}
                            className={`p-2 bg-white/5 hover:bg-white/10 rounded-lg transition-colors ${isRefreshing ? 'animate-spin' : ''}`}
                        >
                            <RefreshCw className="w-4 h-4 text-zinc-400" />
                        </button>
                        <div className="flex items-center gap-2 px-3 py-2 bg-white/5 rounded-lg">
                            <Rss className="w-4 h-4 text-emerald-400" />
                            <span className="text-sm text-zinc-400">{signals.length} signals</span>
                        </div>
                    </div>
                </div>

                {/* Search and Filters */}
                <div className="flex items-center gap-4">
                    <div className="flex-1 relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500" />
                        <input
                            type="text"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            placeholder="Search signals..."
                            className="w-full pl-10 pr-4 py-2 bg-white/5 border border-white/10 rounded-lg text-sm text-white placeholder:text-zinc-600 focus:outline-none focus:border-white/20"
                        />
                    </div>
                    <div className="flex items-center gap-2">
                        <Filter className="w-4 h-4 text-zinc-500" />
                        {CATEGORIES.map(cat => (
                            <button
                                key={cat}
                                onClick={() => setActiveCategory(cat)}
                                className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-colors capitalize ${activeCategory === cat
                                    ? 'bg-emerald-600 text-white'
                                    : 'bg-white/5 text-zinc-400 hover:text-white'
                                    }`}
                            >
                                {cat.replace('_', ' ')}
                            </button>
                        ))}
                    </div>
                </div>
            </div>

            {/* Signal List */}
            <div className="flex-1 overflow-y-auto p-6">
                <AnimatePresence mode="popLayout">
                    <div className="space-y-4">
                        {filteredSignals.map(signal => (
                            <SignalCard
                                key={signal.signal_id}
                                signal={signal}
                                onAction={(type, agent) => handleSignalAction(signal, type, agent)}
                            />
                        ))}
                    </div>
                </AnimatePresence>

                {filteredSignals.length === 0 && (
                    <div className="text-center py-12">
                        <Globe className="w-12 h-12 text-zinc-600 mx-auto mb-4" />
                        <p className="text-zinc-500">{isRefreshing ? 'Loading signals...' : 'No signals match your filters'}</p>
                    </div>
                )}
            </div>
        </div>
    );
}

export default IntelligenceWorkspace;
