/**
 * Growth Strategy Agent - Work Surface
 * Panels: Experiment Backlog, Funnel Maps, Impact Forecasts, Campaign Timelines
 */

import { useState } from 'react';
import { motion } from 'framer-motion';
import { Beaker, TrendingUp, Target, Calendar, Play, Pause, Check } from 'lucide-react';

// Mock experiment data
const EXPERIMENTS = [
    {
        id: 1,
        name: 'NVIDIA Counter-Campaign',
        hypothesis: 'Targeted messaging during GTC will capture 15% of undecided enterprise buyers',
        status: 'proposed',
        impact: 'high',
        confidence: 72,
        timeline: '2 weeks'
    },
    {
        id: 2,
        name: 'LinkedIn Thought Leadership Series',
        hypothesis: 'Weekly AI infrastructure posts will increase inbound leads by 25%',
        status: 'running',
        impact: 'medium',
        confidence: 54,
        timeline: '4 weeks'
    },
    {
        id: 3,
        name: 'Intel Price-Match Response',
        hypothesis: 'Value messaging + free trial will defend 80% of at-risk accounts',
        status: 'completed',
        impact: 'high',
        confidence: 88,
        timeline: '1 week'
    }
];

const CAMPAIGN_METRICS = {
    activeCampaigns: 2,
    totalBudget: '$45,000',
    projectedROI: '3.2x',
    conversionRate: '4.7%'
};

function MetricCard({ label, value, icon: Icon }: { label: string; value: string; icon: React.ElementType }) {
    return (
        <div className="p-4 bg-white/5 rounded-xl">
            <Icon className="w-4 h-4 text-zinc-400 mb-2" />
            <div className="text-xl font-semibold text-white">{value}</div>
            <div className="text-xs text-zinc-500">{label}</div>
        </div>
    );
}

function ExperimentCard({ experiment }: { experiment: typeof EXPERIMENTS[0] }) {
    const statusConfig = {
        proposed: { color: 'bg-blue-500/20 text-blue-400', icon: <Beaker className="w-3 h-3" /> },
        running: { color: 'bg-amber-500/20 text-amber-400', icon: <Play className="w-3 h-3" /> },
        completed: { color: 'bg-emerald-500/20 text-emerald-400', icon: <Check className="w-3 h-3" /> },
        paused: { color: 'bg-zinc-500/20 text-zinc-400', icon: <Pause className="w-3 h-3" /> }
    };

    const status = statusConfig[experiment.status as keyof typeof statusConfig];

    const impactColors = {
        high: 'text-rose-400',
        medium: 'text-amber-400',
        low: 'text-emerald-400'
    };

    return (
        <motion.div
            className="p-4 bg-white/5 rounded-xl border border-white/5 hover:border-white/10 transition-colors"
            whileHover={{ y: -2 }}
        >
            <div className="flex items-start justify-between mb-3">
                <div className="flex-1">
                    <h4 className="text-sm font-medium text-white">{experiment.name}</h4>
                    <p className="text-xs text-zinc-500 mt-1">{experiment.hypothesis}</p>
                </div>
                <span className={`px-2 py-1 text-[10px] font-medium rounded flex items-center gap-1 ${status.color}`}>
                    {status.icon}
                    {experiment.status}
                </span>
            </div>

            <div className="flex items-center gap-4 text-xs">
                <div>
                    <span className="text-zinc-500">Impact: </span>
                    <span className={impactColors[experiment.impact as keyof typeof impactColors]}>{experiment.impact}</span>
                </div>
                <div>
                    <span className="text-zinc-500">Confidence: </span>
                    <span className="text-white">{experiment.confidence}%</span>
                </div>
                <div>
                    <span className="text-zinc-500">Timeline: </span>
                    <span className="text-white">{experiment.timeline}</span>
                </div>
            </div>

            {experiment.status === 'proposed' && (
                <div className="flex items-center gap-2 mt-4">
                    <button className="flex-1 py-2 bg-emerald-600 hover:bg-emerald-500 text-white text-xs rounded-lg transition-colors">
                        Approve & Launch
                    </button>
                    <button className="px-4 py-2 bg-white/10 hover:bg-white/20 text-white text-xs rounded-lg transition-colors">
                        Edit
                    </button>
                </div>
            )}
        </motion.div>
    );
}

export function GrowthWorkSurface() {
    const [activeTab, setActiveTab] = useState<'experiments' | 'metrics'>('experiments');

    return (
        <div className="h-full flex flex-col">
            {/* Tabs */}
            <div className="flex items-center gap-4 p-4 border-b border-white/5">
                <button
                    onClick={() => setActiveTab('experiments')}
                    className={`text-sm font-medium transition-colors flex items-center gap-2 ${activeTab === 'experiments' ? 'text-white' : 'text-zinc-500 hover:text-white'
                        }`}
                >
                    Experiment Backlog
                    <span className="px-1.5 py-0.5 text-[10px] bg-emerald-500/20 text-emerald-400 rounded">
                        {EXPERIMENTS.filter(e => e.status === 'proposed').length}
                    </span>
                </button>
                <button
                    onClick={() => setActiveTab('metrics')}
                    className={`text-sm font-medium transition-colors ${activeTab === 'metrics' ? 'text-white' : 'text-zinc-500 hover:text-white'
                        }`}
                >
                    Campaign Metrics
                </button>
            </div>

            {/* Content */}
            <div className="flex-1 overflow-auto p-4">
                {activeTab === 'experiments' && (
                    <div className="space-y-3">
                        {EXPERIMENTS.map(experiment => (
                            <ExperimentCard key={experiment.id} experiment={experiment} />
                        ))}
                    </div>
                )}

                {activeTab === 'metrics' && (
                    <div className="grid grid-cols-2 gap-4">
                        <MetricCard label="Active Campaigns" value={String(CAMPAIGN_METRICS.activeCampaigns)} icon={Target} />
                        <MetricCard label="Total Budget" value={CAMPAIGN_METRICS.totalBudget} icon={Calendar} />
                        <MetricCard label="Projected ROI" value={CAMPAIGN_METRICS.projectedROI} icon={TrendingUp} />
                        <MetricCard label="Conversion Rate" value={CAMPAIGN_METRICS.conversionRate} icon={Beaker} />
                    </div>
                )}
            </div>
        </div>
    );
}

export default GrowthWorkSurface;
