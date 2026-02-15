/**
 * Campaigns Workspace
 * Active and proposed campaigns with KPIs
 */

import { useState } from 'react';
import { motion } from 'framer-motion';
import {
    Plus,
    Play,
    Pause,
    CheckCircle,
    Clock,
    TrendingUp,
    Target,
    Calendar,
    Users,
    BarChart2
} from 'lucide-react';
import { useMarketingOS } from '../../lib/store';
import { AGENT_CONFIGS } from '../../lib/types/mock-data';

// Mock campaigns (would come from store)
const MOCK_CAMPAIGNS = [
    {
        id: '1',
        name: 'NVIDIA GTC Counter-Campaign',
        status: 'active' as const,
        startDate: new Date('2026-03-10'),
        endDate: new Date('2026-03-25'),
        budget: '$15,000',
        spent: '$4,200',
        agents: ['vantage', 'sage', 'pulse'],
        kpis: [
            { metric: 'Impressions', target: '500K', actual: '180K', progress: 36 },
            { metric: 'Leads', target: '150', actual: '42', progress: 28 },
            { metric: 'Engagement', target: '5%', actual: '4.2%', progress: 84 }
        ]
    },
    {
        id: '2',
        name: 'Enterprise AI Thought Leadership',
        status: 'proposed' as const,
        startDate: new Date('2026-02-01'),
        endDate: new Date('2026-03-15'),
        budget: '$8,000',
        spent: '$0',
        agents: ['sage', 'pulse'],
        kpis: [
            { metric: 'LinkedIn Reach', target: '100K', actual: '-', progress: 0 },
            { metric: 'Downloads', target: '500', actual: '-', progress: 0 }
        ]
    },
    {
        id: '3',
        name: 'Intel Price Response',
        status: 'completed' as const,
        startDate: new Date('2025-12-15'),
        endDate: new Date('2026-01-05'),
        budget: '$5,000',
        spent: '$4,800',
        agents: ['echo', 'vantage'],
        kpis: [
            { metric: 'Accounts Retained', target: '10', actual: '9', progress: 90 },
            { metric: 'ROI', target: '3x', actual: '3.2x', progress: 100 }
        ]
    }
];

function CampaignCard({ campaign }: { campaign: typeof MOCK_CAMPAIGNS[0] }) {
    const statusConfig = {
        active: { color: 'bg-emerald-500/20 text-emerald-400', icon: <Play className="w-3 h-3" /> },
        proposed: { color: 'bg-blue-500/20 text-blue-400', icon: <Clock className="w-3 h-3" /> },
        completed: { color: 'bg-zinc-500/20 text-zinc-400', icon: <CheckCircle className="w-3 h-3" /> },
        paused: { color: 'bg-amber-500/20 text-amber-400', icon: <Pause className="w-3 h-3" /> }
    };

    const status = statusConfig[campaign.status];

    return (
        <motion.div
            className="p-5 bg-white/5 border border-white/5 rounded-xl hover:border-white/10 transition-colors"
            whileHover={{ y: -2 }}
        >
            <div className="flex items-start justify-between mb-4">
                <div>
                    <h3 className="text-lg font-medium text-white">{campaign.name}</h3>
                    <div className="flex items-center gap-2 mt-1">
                        <Calendar className="w-3 h-3 text-zinc-500" />
                        <span className="text-xs text-zinc-500">
                            {campaign.startDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })} - {campaign.endDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                        </span>
                    </div>
                </div>
                <span className={`flex items-center gap-1 px-2 py-1 text-[10px] font-medium uppercase rounded ${status.color}`}>
                    {status.icon} {campaign.status}
                </span>
            </div>

            {/* Budget */}
            <div className="grid grid-cols-2 gap-4 mb-4">
                <div className="p-3 bg-white/5 rounded-lg">
                    <div className="text-[10px] text-zinc-500 uppercase mb-1">Budget</div>
                    <div className="text-lg font-semibold text-white">{campaign.budget}</div>
                </div>
                <div className="p-3 bg-white/5 rounded-lg">
                    <div className="text-[10px] text-zinc-500 uppercase mb-1">Spent</div>
                    <div className="text-lg font-semibold text-emerald-400">{campaign.spent}</div>
                </div>
            </div>

            {/* KPIs */}
            <div className="space-y-2 mb-4">
                {campaign.kpis.map((kpi, i) => (
                    <div key={i} className="flex items-center gap-3">
                        <div className="flex-1">
                            <div className="flex justify-between text-xs mb-1">
                                <span className="text-zinc-400">{kpi.metric}</span>
                                <span className="text-white">{kpi.actual} / {kpi.target}</span>
                            </div>
                            <div className="h-1.5 bg-white/10 rounded-full overflow-hidden">
                                <div
                                    className="h-full bg-emerald-500 transition-all"
                                    style={{ width: `${kpi.progress}%` }}
                                />
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            {/* Agents */}
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-1">
                    <Users className="w-3 h-3 text-zinc-500" />
                    <span className="text-[10px] text-zinc-500">Assigned:</span>
                    <div className="flex -space-x-2">
                        {campaign.agents.map(agentId => {
                            const agent = AGENT_CONFIGS.find(a => a.id === agentId);
                            return agent ? (
                                <img
                                    key={agentId}
                                    src={agent.avatar}
                                    alt={agent.name}
                                    className="w-6 h-6 rounded-full ring-2 ring-zinc-900"
                                    title={agent.name}
                                />
                            ) : null;
                        })}
                    </div>
                </div>
                {campaign.status === 'proposed' && (
                    <button className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white text-xs rounded-lg transition-colors">
                        Approve & Launch
                    </button>
                )}
            </div>
        </motion.div>
    );
}

export function CampaignsWorkspace() {
    const [activeTab, setActiveTab] = useState<'all' | 'active' | 'proposed' | 'completed'>('all');
    const { } = useMarketingOS();

    const allCampaigns = MOCK_CAMPAIGNS;
    const filteredCampaigns = activeTab === 'all'
        ? allCampaigns
        : allCampaigns.filter(c => c.status === activeTab);

    const stats = {
        active: allCampaigns.filter(c => c.status === 'active').length,
        proposed: allCampaigns.filter(c => c.status === 'proposed').length,
        totalBudget: '$28,000',
        avgROI: '2.8x'
    };

    return (
        <div className="h-full flex flex-col">
            {/* Header */}
            <div className="p-6 border-b border-white/5">
                <div className="flex items-center justify-between mb-4">
                    <div>
                        <h1 className="text-2xl font-instrument-serif text-white">Campaigns</h1>
                        <p className="text-sm text-zinc-500 mt-1">Active and planned marketing campaigns</p>
                    </div>
                    <button className="flex items-center gap-2 px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white text-sm rounded-lg transition-colors">
                        <Plus className="w-4 h-4" /> New Campaign
                    </button>
                </div>

                {/* Stats */}
                <div className="grid grid-cols-4 gap-4 mb-4">
                    <div className="p-4 bg-white/5 rounded-xl">
                        <Target className="w-4 h-4 text-emerald-400 mb-2" />
                        <div className="text-2xl font-semibold text-white">{stats.active}</div>
                        <div className="text-xs text-zinc-500">Active</div>
                    </div>
                    <div className="p-4 bg-white/5 rounded-xl">
                        <Clock className="w-4 h-4 text-blue-400 mb-2" />
                        <div className="text-2xl font-semibold text-white">{stats.proposed}</div>
                        <div className="text-xs text-zinc-500">Proposed</div>
                    </div>
                    <div className="p-4 bg-white/5 rounded-xl">
                        <BarChart2 className="w-4 h-4 text-violet-400 mb-2" />
                        <div className="text-2xl font-semibold text-white">{stats.totalBudget}</div>
                        <div className="text-xs text-zinc-500">Total Budget</div>
                    </div>
                    <div className="p-4 bg-white/5 rounded-xl">
                        <TrendingUp className="w-4 h-4 text-amber-400 mb-2" />
                        <div className="text-2xl font-semibold text-white">{stats.avgROI}</div>
                        <div className="text-xs text-zinc-500">Avg ROI</div>
                    </div>
                </div>

                {/* Tabs */}
                <div className="flex items-center gap-2">
                    {(['all', 'active', 'proposed', 'completed'] as const).map(tab => (
                        <button
                            key={tab}
                            onClick={() => setActiveTab(tab)}
                            className={`px-4 py-2 text-sm font-medium rounded-lg transition-colors capitalize ${activeTab === tab
                                ? 'bg-white/10 text-white'
                                : 'text-zinc-500 hover:text-white'
                                }`}
                        >
                            {tab}
                        </button>
                    ))}
                </div>
            </div>

            {/* Campaign Grid */}
            <div className="flex-1 overflow-y-auto p-6">
                <div className="grid grid-cols-2 gap-4">
                    {filteredCampaigns.map(campaign => (
                        <CampaignCard key={campaign.id} campaign={campaign} />
                    ))}
                </div>
            </div>
        </div>
    );
}

export default CampaignsWorkspace;
