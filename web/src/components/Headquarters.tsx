/**
 * Headquarters Dashboard
 * The command center overview - NOT an empty dashboard
 */

import { motion } from 'framer-motion';
import {

    AlertTriangle,
    Calendar,
    Users,
    FileText,
    ChevronRight,
    Clock,
    Zap,
    Target
} from 'lucide-react';
import { MOCK_KPIS, WHAT_CHANGED, MOCK_CALENDAR_EVENTS, AGENT_STATUSES, AGENT_CONFIGS } from '../lib/types/mock-data';
import type { CalendarEvent } from '../lib/types/marketing-os';

// KPI Card Component
function KPICard({
    label,
    value,
    trend,
    icon: Icon,
    color
}: {
    label: string;
    value: string | number;
    trend?: string;
    icon: React.ElementType;
    color: string;
}) {
    return (
        <div className="bg-zinc-900/50 border border-white/5 rounded-xl p-4 hover:border-white/10 transition-colors">
            <div className="flex items-start justify-between mb-3">
                <div className={`p-2 rounded-lg ${color}`}>
                    <Icon className="w-4 h-4 text-white" />
                </div>
                {trend && (
                    <span className={`text-xs font-medium ${trend.startsWith('+') ? 'text-emerald-400' : 'text-rose-400'}`}>
                        {trend}
                    </span>
                )}
            </div>
            <div className="text-2xl font-semibold text-white mb-1">{value}</div>
            <div className="text-xs text-zinc-500">{label}</div>
        </div>
    );
}

// Activity Item Component
function ActivityItem({
    text,
    time,
    type,
    agent
}: {
    text: string;
    time: string;
    type: string;
    agent: string;
}) {
    const agentConfig = AGENT_CONFIGS.find(a => a.id === agent);
    const typeColors: Record<string, string> = {
        signal: 'bg-blue-500',
        artifact: 'bg-violet-500',
        proposal: 'bg-emerald-500',
        calendar: 'bg-amber-500'
    };

    return (
        <div className="flex items-start gap-3 py-3 border-b border-white/5 last:border-0">
            <div className={`mt-1 w-2 h-2 rounded-full ${typeColors[type] || 'bg-zinc-500'}`} />
            <div className="flex-1 min-w-0">
                <p className="text-sm text-zinc-300">{text}</p>
                <div className="flex items-center gap-2 mt-1">
                    <span className="text-[10px] text-zinc-500">{time}</span>
                    {agentConfig && (
                        <span className="text-[10px] text-zinc-600">• {agentConfig.name}</span>
                    )}
                </div>
            </div>
        </div>
    );
}

// Calendar Event Preview
function CalendarEventPreview({ event }: { event: CalendarEvent }) {
    const typeColors: Record<string, string> = {
        competitor: 'border-l-rose-500',
        campaign: 'border-l-emerald-500',
        content: 'border-l-violet-500',
        cultural: 'border-l-amber-500',
        internal: 'border-l-blue-500',
        opportunity: 'border-l-cyan-500'
    };

    const priorityBadge = event.priority === 'high'
        ? 'bg-rose-500/20 text-rose-400'
        : event.priority === 'medium'
            ? 'bg-amber-500/20 text-amber-400'
            : 'bg-zinc-500/20 text-zinc-400';

    return (
        <motion.div
            className={`bg-zinc-900/50 border border-white/5 border-l-2 ${typeColors[event.type]} rounded-lg p-4 hover:bg-zinc-900 transition-colors cursor-pointer`}
            whileHover={{ x: 4 }}
        >
            <div className="flex items-start justify-between mb-2">
                <div className="flex-1">
                    <h4 className="text-sm font-medium text-white">{event.title}</h4>
                    <p className="text-xs text-zinc-500 mt-0.5">
                        {event.start_date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                        {event.end_date > event.start_date && ` - ${event.end_date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}`}
                    </p>
                </div>
                <span className={`px-2 py-0.5 rounded text-[10px] font-medium uppercase ${priorityBadge}`}>
                    {event.priority}
                </span>
            </div>
            <div className="flex items-center gap-2 mt-3">
                {event.linked_agents.slice(0, 3).map(agentId => {
                    const agent = AGENT_CONFIGS.find(a => a.id === agentId);
                    return agent ? (
                        <img
                            key={agentId}
                            src={agent.avatar}
                            alt={agent.name}
                            className="w-5 h-5 rounded-full ring-2 ring-zinc-900"
                        />
                    ) : null;
                })}
                {event.linked_agents.length > 3 && (
                    <span className="text-[10px] text-zinc-500">+{event.linked_agents.length - 3}</span>
                )}
            </div>
        </motion.div>
    );
}

// Agent Status Card
function AgentStatusCard({ agentId }: { agentId: string }) {
    const agent = AGENT_CONFIGS.find(a => a.id === agentId);
    const status = AGENT_STATUSES.find(s => s.agentId === agentId);
    if (!agent || !status) return null;

    const statusColors = {
        active: 'bg-emerald-500',
        processing: 'bg-amber-500',
        idle: 'bg-blue-500',
        offline: 'bg-zinc-500'
    };

    return (
        <div className="flex items-center gap-3 p-3 bg-zinc-900/30 rounded-xl hover:bg-zinc-900/50 transition-colors">
            <div className="relative">
                <img src={agent.avatar} alt={agent.name} className="w-10 h-10 rounded-full" />
                <div className={`absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full border-2 border-[#0d0d0d] ${statusColors[status.status]}`} />
            </div>
            <div className="flex-1 min-w-0">
                <div className="text-sm font-medium text-white">{agent.name}</div>
                <div className="text-xs text-zinc-500 truncate">{status.currentTask || 'Idle'}</div>
            </div>
            {status.queuedArtifacts > 0 && (
                <span className="px-2 py-0.5 bg-violet-500/20 text-violet-400 text-[10px] rounded">
                    {status.queuedArtifacts} artifacts
                </span>
            )}
        </div>
    );
}

export function Headquarters() {
    const upcomingEvents = MOCK_CALENDAR_EVENTS
        .filter(e => e.status === 'upcoming')
        .sort((a, b) => a.start_date.getTime() - b.start_date.getTime())
        .slice(0, 4);

    return (
        <div className="h-full overflow-y-auto p-6">
            {/* Header */}
            <div className="mb-8">
                <h1 className="text-2xl font-instrument-serif text-white mb-2">Headquarters</h1>
                <p className="text-sm text-zinc-500">Your marketing department at a glance</p>
            </div>

            {/* KPI Grid */}
            <div className="grid grid-cols-4 gap-4 mb-8">
                <KPICard
                    label="Signals Today"
                    value={MOCK_KPIS.signalsToday}
                    trend={MOCK_KPIS.signalsTrend}
                    icon={Zap}
                    color="bg-blue-600"
                />
                <KPICard
                    label="Active Agents"
                    value={`${MOCK_KPIS.activeAgents}/${MOCK_KPIS.totalAgents}`}
                    icon={Users}
                    color="bg-emerald-600"
                />
                <KPICard
                    label="Pending Reviews"
                    value={MOCK_KPIS.pendingReviews}
                    icon={FileText}
                    color="bg-violet-600"
                />
                <KPICard
                    label="Risk Alerts"
                    value={MOCK_KPIS.riskAlerts}
                    icon={AlertTriangle}
                    color="bg-rose-600"
                />
            </div>

            <div className="grid grid-cols-12 gap-6">
                {/* Left Column: Activity + Agents */}
                <div className="col-span-5 space-y-6">
                    {/* What Changed */}
                    <div className="bg-zinc-900/30 border border-white/5 rounded-xl p-5">
                        <div className="flex items-center justify-between mb-4">
                            <h2 className="text-sm font-semibold text-white flex items-center gap-2">
                                <Clock className="w-4 h-4 text-zinc-400" />
                                What Changed
                            </h2>
                            <span className="text-[10px] text-zinc-500 uppercase tracking-wider">Last 24h</span>
                        </div>
                        <div>
                            {WHAT_CHANGED.map((item, i) => (
                                <ActivityItem key={i} {...item} />
                            ))}
                        </div>
                    </div>

                    {/* Agent Status */}
                    <div className="bg-zinc-900/30 border border-white/5 rounded-xl p-5">
                        <div className="flex items-center justify-between mb-4">
                            <h2 className="text-sm font-semibold text-white flex items-center gap-2">
                                <Users className="w-4 h-4 text-zinc-400" />
                                Agent Status
                            </h2>
                        </div>
                        <div className="space-y-2">
                            {AGENT_CONFIGS.map(agent => (
                                <AgentStatusCard key={agent.id} agentId={agent.id} />
                            ))}
                        </div>
                    </div>
                </div>

                {/* Right Column: Calendar + Campaigns */}
                <div className="col-span-7 space-y-6">
                    {/* Upcoming Events */}
                    <div className="bg-zinc-900/30 border border-white/5 rounded-xl p-5">
                        <div className="flex items-center justify-between mb-4">
                            <h2 className="text-sm font-semibold text-white flex items-center gap-2">
                                <Calendar className="w-4 h-4 text-zinc-400" />
                                Upcoming Events
                            </h2>
                            <button className="text-xs text-emerald-400 hover:text-emerald-300 flex items-center gap-1">
                                View Calendar <ChevronRight className="w-3 h-3" />
                            </button>
                        </div>
                        <div className="grid grid-cols-2 gap-3">
                            {upcomingEvents.map(event => (
                                <CalendarEventPreview key={event.event_id} event={event} />
                            ))}
                        </div>
                    </div>

                    {/* Active Campaigns */}
                    <div className="bg-zinc-900/30 border border-white/5 rounded-xl p-5">
                        <div className="flex items-center justify-between mb-4">
                            <h2 className="text-sm font-semibold text-white flex items-center gap-2">
                                <Target className="w-4 h-4 text-zinc-400" />
                                Active Campaigns
                            </h2>
                        </div>
                        <div className="text-center py-8 text-zinc-500">
                            <p className="text-sm">No active campaigns</p>
                            <button className="mt-2 px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white text-xs rounded-lg transition-colors">
                                Create Campaign
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default Headquarters;
