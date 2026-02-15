/**
 * Competitor Intelligence Agent - Work Surface
 * Panels: Competitor Matrix, Pricing Timelines, Messaging Diffs, Alert Feed
 * WIRED TO REAL STATE
 */

import { useState } from 'react';
import { motion } from 'framer-motion';
import { AlertTriangle, TrendingDown, TrendingUp, Minus, ExternalLink, Calendar, Zap, ArrowRight } from 'lucide-react';
import { useMarketingOS } from '../../lib/store';
import { addSignalToCalendar, escalateToAgent } from '../../lib/actions';
import type { AgentId } from '../../lib/types/marketing-os';

// Mock competitor data
const COMPETITORS = [
    {
        id: 'nvidia',
        name: 'NVIDIA',
        logo: '🟢',
        pricing: { current: '$3,999', previous: '$3,999', change: null },
        messaging: 'AI-first, performance leadership',
        lastUpdate: '2h ago',
        threat: 'high'
    },
    {
        id: 'intel',
        name: 'Intel',
        logo: '🔵',
        pricing: { current: '$2,199', previous: '$2,599', change: 'down' },
        messaging: 'Value + enterprise trust',
        lastUpdate: '4h ago',
        threat: 'medium'
    },
    {
        id: 'amd',
        name: 'AMD',
        logo: '🔴',
        pricing: { current: '$2,499', previous: '$2,499', change: null },
        messaging: 'Performance per dollar',
        lastUpdate: '1d ago',
        threat: 'medium'
    }
];

interface Alert {
    id: number;
    type: string;
    message: string;
    time: string;
    severity: 'high' | 'medium' | 'low';
    actioned?: boolean;
}

// Competitor row component
function CompetitorRow({ competitor }: { competitor: typeof COMPETITORS[0] }) {
    const threatColors = {
        high: 'text-rose-400 bg-rose-500/10',
        medium: 'text-amber-400 bg-amber-500/10',
        low: 'text-emerald-400 bg-emerald-500/10'
    };

    return (
        <tr className="border-b border-white/5 hover:bg-white/[0.02] transition-colors">
            <td className="py-4 px-4">
                <div className="flex items-center gap-3">
                    <span className="text-2xl">{competitor.logo}</span>
                    <div>
                        <div className="text-sm text-white font-medium">{competitor.name}</div>
                        <div className="text-[10px] text-zinc-500">{competitor.lastUpdate}</div>
                    </div>
                </div>
            </td>
            <td className="py-4 px-4">
                <div className="flex items-center gap-2">
                    <span className="text-white">{competitor.pricing.current}</span>
                    {competitor.pricing.change === 'down' && (
                        <TrendingDown className="w-4 h-4 text-emerald-400" />
                    )}
                    {competitor.pricing.change === 'up' && (
                        <TrendingUp className="w-4 h-4 text-rose-400" />
                    )}
                    {!competitor.pricing.change && (
                        <Minus className="w-4 h-4 text-zinc-500" />
                    )}
                </div>
                {competitor.pricing.change && (
                    <div className="text-[10px] text-zinc-500">was {competitor.pricing.previous}</div>
                )}
            </td>
            <td className="py-4 px-4 text-sm text-zinc-400">{competitor.messaging}</td>
            <td className="py-4 px-4">
                <span className={`px-2 py-1 text-[10px] uppercase font-medium rounded ${threatColors[competitor.threat as keyof typeof threatColors]}`}>
                    {competitor.threat}
                </span>
            </td>
            <td className="py-4 px-4">
                <button className="text-zinc-500 hover:text-white transition-colors">
                    <ExternalLink className="w-4 h-4" />
                </button>
            </td>
        </tr>
    );
}

// Alert item component with action buttons
function AlertItem({
    alert,
    onAddToCalendar,
    onEscalate
}: {
    alert: Alert;
    onAddToCalendar: () => void;
    onEscalate: (agent: AgentId) => void;
}) {
    const [actioned, setActioned] = useState(alert.actioned || false);

    const severityColors = {
        high: 'border-l-rose-500 bg-rose-500/5',
        medium: 'border-l-amber-500 bg-amber-500/5',
        low: 'border-l-emerald-500 bg-emerald-500/5'
    };

    if (actioned) {
        return (
            <motion.div
                className="p-3 border-l-2 border-l-emerald-500 bg-emerald-500/5 rounded-r-lg"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
            >
                <div className="flex items-center gap-2 text-emerald-400 text-sm">
                    <Zap className="w-4 h-4" />
                    Task created. Agent assigned.
                </div>
            </motion.div>
        );
    }

    return (
        <motion.div
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            className={`p-3 border-l-2 rounded-r-lg ${severityColors[alert.severity]}`}
        >
            <div className="flex items-start gap-2 mb-2">
                <AlertTriangle className={`w-4 h-4 mt-0.5 ${alert.severity === 'high' ? 'text-rose-400' :
                    alert.severity === 'medium' ? 'text-amber-400' : 'text-emerald-400'
                    }`} />
                <div className="flex-1">
                    <p className="text-sm text-white">{alert.message}</p>
                    <div className="flex items-center gap-2 mt-1">
                        <span className="text-[10px] text-zinc-500">{alert.type}</span>
                        <span className="text-[10px] text-zinc-600">•</span>
                        <span className="text-[10px] text-zinc-500">{alert.time}</span>
                    </div>
                </div>
            </div>

            {/* Action buttons */}
            <div className="flex items-center gap-2 mt-3 pl-6">
                <button
                    onClick={() => { setActioned(true); onAddToCalendar(); }}
                    className="flex items-center gap-1 px-2 py-1 bg-white/10 hover:bg-white/20 text-xs text-white rounded transition-colors"
                >
                    <Calendar className="w-3 h-3" /> Add to Calendar
                </button>
                <button
                    onClick={() => { setActioned(true); onEscalate('vantage'); }}
                    className="flex items-center gap-1 px-2 py-1 bg-white/10 hover:bg-white/20 text-xs text-white rounded transition-colors"
                >
                    <ArrowRight className="w-3 h-3" /> Escalate to Vantage
                </button>
                <button
                    onClick={() => { setActioned(true); onEscalate('sage'); }}
                    className="flex items-center gap-1 px-2 py-1 bg-white/10 hover:bg-white/20 text-xs text-white rounded transition-colors"
                >
                    <ArrowRight className="w-3 h-3" /> Request Content
                </button>
            </div>
        </motion.div>
    );
}

export function IntelligenceWorkSurface() {
    const [activeTab, setActiveTab] = useState<'matrix' | 'alerts'>('matrix');
    const { signals } = useMarketingOS();

    // Combine store signals with default alerts
    const ALERTS: Alert[] = [
        { id: 1, type: 'pricing', message: 'Intel cut enterprise GPU pricing by 15%', time: '4h ago', severity: 'high' },
        { id: 2, type: 'event', message: 'NVIDIA GTC announced for March 18-21', time: '2d ago', severity: 'medium' },
        { id: 3, type: 'messaging', message: 'AMD launched new "AI Ready" campaign', time: '3d ago', severity: 'low' }
    ];

    const handleAddToCalendar = (alert: Alert) => {
        addSignalToCalendar(
            { topic: alert.message, industry: 'Tech', tags: [alert.type] },
            'competitor',
            { start: new Date(), end: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000) },
            ['echo', 'vantage']
        );
    };

    const handleEscalate = (alert: Alert, toAgent: AgentId) => {
        escalateToAgent('echo', toAgent, {
            title: `Signal: ${alert.message}`,
            description: `Escalated from Intelligence: ${alert.type} alert`
        });
    };

    return (
        <div className="h-full flex flex-col">
            {/* Tabs */}
            <div className="flex items-center gap-4 p-4 border-b border-white/5">
                <button
                    onClick={() => setActiveTab('matrix')}
                    className={`text-sm font-medium transition-colors ${activeTab === 'matrix' ? 'text-white' : 'text-zinc-500 hover:text-white'
                        }`}
                >
                    Competitor Matrix
                </button>
                <button
                    onClick={() => setActiveTab('alerts')}
                    className={`text-sm font-medium transition-colors flex items-center gap-2 ${activeTab === 'alerts' ? 'text-white' : 'text-zinc-500 hover:text-white'
                        }`}
                >
                    Alerts
                    <span className="px-1.5 py-0.5 text-[10px] bg-rose-500/20 text-rose-400 rounded">
                        {ALERTS.filter(a => a.severity === 'high').length + signals.filter(s => !s.processed).length}
                    </span>
                </button>
            </div>

            {/* Content */}
            <div className="flex-1 overflow-auto">
                {activeTab === 'matrix' && (
                    <table className="w-full">
                        <thead>
                            <tr className="border-b border-white/10">
                                <th className="text-left text-[10px] text-zinc-500 uppercase tracking-wider py-3 px-4">Company</th>
                                <th className="text-left text-[10px] text-zinc-500 uppercase tracking-wider py-3 px-4">Pricing</th>
                                <th className="text-left text-[10px] text-zinc-500 uppercase tracking-wider py-3 px-4">Messaging</th>
                                <th className="text-left text-[10px] text-zinc-500 uppercase tracking-wider py-3 px-4">Threat</th>
                                <th className="w-12"></th>
                            </tr>
                        </thead>
                        <tbody>
                            {COMPETITORS.map(competitor => (
                                <CompetitorRow key={competitor.id} competitor={competitor} />
                            ))}
                        </tbody>
                    </table>
                )}

                {activeTab === 'alerts' && (
                    <div className="p-4 space-y-3">
                        {ALERTS.map(alert => (
                            <AlertItem
                                key={alert.id}
                                alert={alert}
                                onAddToCalendar={() => handleAddToCalendar(alert)}
                                onEscalate={(agent) => handleEscalate(alert, agent)}
                            />
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}

export default IntelligenceWorkSurface;
