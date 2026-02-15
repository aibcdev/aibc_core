/**
 * Reports Workspace
 * Analytics, metrics, and performance dashboards
 */

import { useState } from 'react';
import { motion } from 'framer-motion';
import {
    TrendingUp,
    TrendingDown,
    Calendar,
    Download
} from 'lucide-react';

// Mock metrics
const OVERVIEW_METRICS = [
    { label: 'Total Impressions', value: '2.4M', change: '+12%', trend: 'up', color: 'emerald' },
    { label: 'Engagement Rate', value: '4.8%', change: '+0.6%', trend: 'up', color: 'blue' },
    { label: 'Leads Generated', value: '342', change: '-8%', trend: 'down', color: 'violet' },
    { label: 'Pipeline Value', value: '$890K', change: '+23%', trend: 'up', color: 'amber' }
];

const CHANNEL_METRICS = [
    { channel: 'LinkedIn', impressions: '1.2M', engagement: '5.2%', leads: 156, spend: '$4,200' },
    { channel: 'X (Twitter)', impressions: '680K', engagement: '3.1%', leads: 89, spend: '$1,800' },
    { channel: 'Blog', impressions: '320K', engagement: '8.4%', leads: 67, spend: '$0' },
    { channel: 'Email', impressions: '45K', engagement: '22%', leads: 30, spend: '$500' }
];

const WEEKLY_DATA = [
    { week: 'W1', impressions: 580000, leads: 78 },
    { week: 'W2', impressions: 620000, leads: 92 },
    { week: 'W3', impressions: 710000, leads: 85 },
    { week: 'W4', impressions: 490000, leads: 87 }
];

function MetricCard({ metric }: { metric: typeof OVERVIEW_METRICS[0] }) {
    const colorClasses = {
        emerald: 'text-emerald-400 bg-emerald-500/10',
        blue: 'text-blue-400 bg-blue-500/10',
        violet: 'text-violet-400 bg-violet-500/10',
        amber: 'text-amber-400 bg-amber-500/10'
    };

    return (
        <motion.div
            className="p-5 bg-white/5 rounded-xl"
            whileHover={{ y: -2 }}
        >
            <div className="flex items-start justify-between mb-3">
                <span className="text-xs text-zinc-500">{metric.label}</span>
                <span className={`flex items-center gap-1 text-xs ${metric.trend === 'up' ? 'text-emerald-400' : 'text-rose-400'}`}>
                    {metric.trend === 'up' ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
                    {metric.change}
                </span>
            </div>
            <div className={`text-3xl font-semibold ${colorClasses[metric.color as keyof typeof colorClasses].split(' ')[0]}`}>
                {metric.value}
            </div>
        </motion.div>
    );
}

function SimpleBarChart({ data }: { data: typeof WEEKLY_DATA }) {
    const maxValue = Math.max(...data.map(d => d.impressions));

    return (
        <div className="flex items-end gap-4 h-40">
            {data.map((item, i) => (
                <div key={i} className="flex-1 flex flex-col items-center gap-2">
                    <motion.div
                        className="w-full bg-emerald-500/20 rounded-t-lg"
                        style={{ height: `${(item.impressions / maxValue) * 100}%` }}
                        initial={{ height: 0 }}
                        animate={{ height: `${(item.impressions / maxValue) * 100}%` }}
                        transition={{ delay: i * 0.1 }}
                    >
                        <div className="w-full h-full bg-gradient-to-t from-emerald-500/40 to-emerald-500/10 rounded-t-lg" />
                    </motion.div>
                    <span className="text-xs text-zinc-500">{item.week}</span>
                </div>
            ))}
        </div>
    );
}

export function ReportsWorkspace() {
    const [dateRange, setDateRange] = useState('30d');

    return (
        <div className="h-full flex flex-col">
            {/* Header */}
            <div className="p-6 border-b border-white/5">
                <div className="flex items-center justify-between mb-4">
                    <div>
                        <h1 className="text-2xl font-instrument-serif text-white">Reports</h1>
                        <p className="text-sm text-zinc-500 mt-1">Performance analytics and insights</p>
                    </div>
                    <div className="flex items-center gap-3">
                        <div className="flex items-center gap-2 px-3 py-2 bg-white/5 rounded-lg">
                            <Calendar className="w-4 h-4 text-zinc-400" />
                            <select
                                value={dateRange}
                                onChange={(e) => setDateRange(e.target.value)}
                                className="bg-transparent text-sm text-white border-none focus:outline-none cursor-pointer"
                            >
                                <option value="7d">Last 7 days</option>
                                <option value="30d">Last 30 days</option>
                                <option value="90d">Last 90 days</option>
                                <option value="ytd">Year to date</option>
                            </select>
                        </div>
                        <button className="flex items-center gap-2 px-4 py-2 bg-white/10 hover:bg-white/20 text-white text-sm rounded-lg transition-colors">
                            <Download className="w-4 h-4" /> Export
                        </button>
                    </div>
                </div>
            </div>

            {/* Content */}
            <div className="flex-1 overflow-y-auto p-6 space-y-6">
                {/* Overview Cards */}
                <div>
                    <h3 className="text-sm font-medium text-zinc-400 mb-4">Overview</h3>
                    <div className="grid grid-cols-4 gap-4">
                        {OVERVIEW_METRICS.map((metric, i) => (
                            <MetricCard key={i} metric={metric} />
                        ))}
                    </div>
                </div>

                {/* Weekly Trend */}
                <div className="p-5 bg-white/5 rounded-xl">
                    <div className="flex items-center justify-between mb-6">
                        <h3 className="text-sm font-medium text-white">Weekly Impressions</h3>
                        <div className="flex items-center gap-4 text-xs text-zinc-500">
                            <span className="flex items-center gap-1">
                                <span className="w-2 h-2 bg-emerald-500 rounded-full" /> Impressions
                            </span>
                        </div>
                    </div>
                    <SimpleBarChart data={WEEKLY_DATA} />
                </div>

                {/* Channel Breakdown */}
                <div className="p-5 bg-white/5 rounded-xl">
                    <h3 className="text-sm font-medium text-white mb-4">Channel Performance</h3>
                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead>
                                <tr className="border-b border-white/10">
                                    <th className="text-left text-xs text-zinc-500 font-medium py-3 px-4">Channel</th>
                                    <th className="text-right text-xs text-zinc-500 font-medium py-3 px-4">Impressions</th>
                                    <th className="text-right text-xs text-zinc-500 font-medium py-3 px-4">Engagement</th>
                                    <th className="text-right text-xs text-zinc-500 font-medium py-3 px-4">Leads</th>
                                    <th className="text-right text-xs text-zinc-500 font-medium py-3 px-4">Spend</th>
                                </tr>
                            </thead>
                            <tbody>
                                {CHANNEL_METRICS.map((channel, i) => (
                                    <tr key={i} className="border-b border-white/5 hover:bg-white/5 transition-colors">
                                        <td className="py-3 px-4 text-sm text-white font-medium">{channel.channel}</td>
                                        <td className="py-3 px-4 text-sm text-zinc-300 text-right">{channel.impressions}</td>
                                        <td className="py-3 px-4 text-sm text-zinc-300 text-right">{channel.engagement}</td>
                                        <td className="py-3 px-4 text-sm text-zinc-300 text-right">{channel.leads}</td>
                                        <td className="py-3 px-4 text-sm text-zinc-300 text-right">{channel.spend}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>

                {/* AI Insights */}
                <div className="p-5 bg-gradient-to-r from-emerald-500/10 to-cyan-500/10 border border-emerald-500/20 rounded-xl">
                    <h3 className="text-sm font-medium text-white mb-3">AI Insights</h3>
                    <ul className="space-y-2 text-sm text-zinc-300">
                        <li>• LinkedIn engagement spiked 18% after switching to customer-outcome headlines</li>
                        <li>• Email open rates improved when sent Tuesday 10am vs Thursday 2pm</li>
                        <li>• Blog posts with technical depth outperform general content by 2.5x in leads</li>
                    </ul>
                </div>
            </div>
        </div>
    );
}

export default ReportsWorkspace;
