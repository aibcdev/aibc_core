
import {
    Activity,
    Calendar,
    Users,
    Target,
    Globe
} from 'lucide-react';
import { AgentInbox } from '../inbox/AgentInbox';
import { useMarketingOS } from '../../lib/store';

// Helper for metrics cards
function MetricCard({ title, value, change, icon: Icon, trend }: any) {
    return (
        <div className="p-4 rounded-xl bg-zinc-900 border border-white/5 hover:border-white/10 transition-colors">
            <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium text-zinc-400">{title}</span>
                <Icon className="w-4 h-4 text-zinc-500" />
            </div>
            <div className="flex items-baseline gap-2">
                <span className="text-2xl font-semibold text-white">{value}</span>
                <span className={`text-xs font-medium ${trend === 'up' ? 'text-emerald-400' : 'text-red-400'}`}>
                    {change}
                </span>
            </div>
        </div>
    );
}

export function HeadquartersWorkspace() {
    const tasks = useMarketingOS(state => state.tasks || []);
    const calendarEvents = useMarketingOS(state => state.calendarEvents || []);

    const activeTasks = tasks.filter(t => t.status !== 'done');

    const upcomingEvents = calendarEvents
        .filter(e => e.status === 'active' || e.status === 'upcoming')
        .sort((a, b) => new Date(a.start_date).getTime() - new Date(b.start_date).getTime())
        .slice(0, 5);

    return (
        <div className="h-full flex flex-col gap-6 p-6 overflow-hidden">
            {/* Top Metrics Row */}
            <div className="grid grid-cols-4 gap-4">
                <MetricCard
                    title="Active Campaigns"
                    value="3"
                    change="+1 this week"
                    trend="up"
                    icon={Target}
                />
                <MetricCard
                    title="Brand Sentiment"
                    value="98.2%"
                    change="+2.4%"
                    trend="up"
                    icon={Activity}
                />
                <MetricCard
                    title="Content Velocity"
                    value="12/wk"
                    change="-2 vs target"
                    trend="down"
                    icon={Globe}
                />
                <MetricCard
                    title="Agent Activity"
                    value="142"
                    change="actions today"
                    trend="up"
                    icon={Users}
                />
            </div>

            {/* Main Content Area */}
            <div className="flex-1 min-h-0 grid grid-cols-12 gap-6">
                {/* Left Column: Agent Inbox (The Brain) */}
                <div className="col-span-8 bg-zinc-900/50 border border-white/5 rounded-2xl overflow-hidden flex flex-col p-6">
                    <AgentInbox />
                </div>

                {/* Right Column: Calendar & Shortcuts */}
                <div className="col-span-4 flex flex-col gap-6">
                    {/* Mini Calendar */}
                    <div className="flex-1 bg-zinc-900/50 border border-white/5 rounded-2xl p-6 flex flex-col">
                        <div className="flex items-center justify-between mb-4">
                            <h3 className="font-semibold text-white flex items-center gap-2">
                                <Calendar className="w-4 h-4 text-zinc-400" />
                                Schedule
                            </h3>
                            <button className="text-xs text-zinc-400 hover:text-white">View All</button>
                        </div>

                        <div className="space-y-3">
                            {upcomingEvents.length === 0 ? (
                                <p className="text-sm text-zinc-500 italic p-2">No upcoming events scheduled.</p>
                            ) : (
                                upcomingEvents.map((event) => (
                                    <div key={event.event_id} className="flex items-start gap-3 p-3 rounded-lg bg-white/5 border border-white/5">
                                        <div className="flex flex-col items-center min-w-[3rem]">
                                            <span className="text-xs font-medium text-white">
                                                {new Date(event.start_date).toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' })}
                                            </span>
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <p className="text-sm font-medium text-zinc-200 truncate">{event.title}</p>
                                            <div className="flex items-center gap-2 mt-1">
                                                {event.priority === 'high' && (
                                                    <span className="px-1.5 py-0.5 rounded bg-red-500/10 text-red-400 text-[10px] uppercase font-bold">
                                                        Urgent
                                                    </span>
                                                )}
                                                <span className="text-[10px] text-zinc-500 uppercase">{event.type}</span>
                                            </div>
                                        </div>
                                    </div>
                                ))
                            )}
                        </div>
                    </div>

                    {/* Quick Access / Active Tasks */}
                    <div className="h-1/3 bg-zinc-900/50 border border-white/5 rounded-2xl p-6">
                        <div className="flex items-center justify-between mb-4">
                            <h3 className="font-semibold text-white flex items-center gap-2">
                                <Activity className="w-4 h-4 text-zinc-400" />
                                Live Agents
                            </h3>
                        </div>
                        <div className="space-y-2">
                            {activeTasks.slice(0, 3).map(task => (
                                <div key={task.task_id} className="flex items-center justify-between text-sm">
                                    <div className="flex items-center gap-2">
                                        <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                                        <span className="text-zinc-300 truncate max-w-[150px]">{task.title}</span>
                                    </div>
                                    <span className="text-xs text-zinc-600 uppercase">{task.assigned_to}</span>
                                </div>
                            ))}
                            {activeTasks.length === 0 && (
                                <p className="text-sm text-zinc-500">All systems operational. Agents idle.</p>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
