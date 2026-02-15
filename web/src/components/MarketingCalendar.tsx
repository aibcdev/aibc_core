/**
 * Marketing Calendar Component
 * The OS spine - strategic memory, not scheduling
 */

import { useState } from 'react';
import { motion } from 'framer-motion';
import {
    ChevronLeft,
    ChevronRight,
    Plus,
    X,
    Play,
    FileText,
    BarChart2
} from 'lucide-react';
import { MOCK_CALENDAR_EVENTS, AGENT_CONFIGS } from '../lib/types/mock-data';
import type { CalendarEvent, CalendarAction } from '../lib/types/marketing-os';

// Event type colors
const EVENT_COLORS: Record<string, { bg: string; border: string; text: string }> = {
    competitor: { bg: 'bg-rose-500/20', border: 'border-rose-500', text: 'text-rose-400' },
    campaign: { bg: 'bg-emerald-500/20', border: 'border-emerald-500', text: 'text-emerald-400' },
    content: { bg: 'bg-violet-500/20', border: 'border-violet-500', text: 'text-violet-400' },
    cultural: { bg: 'bg-amber-500/20', border: 'border-amber-500', text: 'text-amber-400' },
    internal: { bg: 'bg-blue-500/20', border: 'border-blue-500', text: 'text-blue-400' },
    opportunity: { bg: 'bg-cyan-500/20', border: 'border-cyan-500', text: 'text-cyan-400' }
};

// Calendar Day Cell
function CalendarDay({
    date,
    events,
    isCurrentMonth,
    isToday,
    onEventClick
}: {
    date: Date;
    events: CalendarEvent[];
    isCurrentMonth: boolean;
    isToday: boolean;
    onEventClick: (event: CalendarEvent) => void;
}) {
    return (
        <div className={`
            min-h-[100px] p-2 border-r border-b border-white/5
            ${isCurrentMonth ? 'bg-transparent' : 'bg-white/[0.02]'}
        `}>
            <div className={`
                text-sm mb-2 w-7 h-7 flex items-center justify-center rounded-full
                ${isToday ? 'bg-emerald-500 text-white' : isCurrentMonth ? 'text-zinc-400' : 'text-zinc-600'}
            `}>
                {date.getDate()}
            </div>
            <div className="space-y-1">
                {events.slice(0, 2).map(event => {
                    const colors = EVENT_COLORS[event.type] || EVENT_COLORS.internal;
                    return (
                        <button
                            key={event.event_id}
                            onClick={() => onEventClick(event)}
                            className={`
                                w-full text-left px-2 py-1 rounded text-[10px] truncate
                                ${colors.bg} ${colors.text}
                                hover:opacity-80 transition-opacity
                            `}
                        >
                            {event.title}
                        </button>
                    );
                })}
                {events.length > 2 && (
                    <div className="text-[10px] text-zinc-500 px-2">
                        +{events.length - 2} more
                    </div>
                )}
            </div>
        </div>
    );
}

// Event Detail Modal
function EventModal({
    event,
    onClose,
    onAction
}: {
    event: CalendarEvent;
    onClose: () => void;
    onAction: (action: CalendarAction) => void;
}) {
    const colors = EVENT_COLORS[event.type] || EVENT_COLORS.internal;

    const actionIcons: Record<string, React.ReactNode> = {
        create_campaign: <Play className="w-4 h-4" />,
        draft_content: <FileText className="w-4 h-4" />,
        analyze: <BarChart2 className="w-4 h-4" />,
        review: <FileText className="w-4 h-4" />,
        spin_up: <Play className="w-4 h-4" />
    };

    return (
        <>
            {/* Backdrop */}
            <div
                className="fixed inset-0 bg-black/60 z-50"
                onClick={onClose}
            />

            {/* Modal */}
            <motion.div
                initial={{ opacity: 0, scale: 0.95, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95, y: 20 }}
                className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-50 w-[500px] max-w-[90vw]"
            >
                <div className="bg-zinc-900 border border-white/10 rounded-2xl overflow-hidden shadow-2xl">
                    {/* Header */}
                    <div className={`px-6 py-4 border-b border-white/5 ${colors.bg}`}>
                        <div className="flex items-start justify-between">
                            <div>
                                <span className={`text-[10px] uppercase tracking-wider ${colors.text}`}>
                                    {event.type}
                                </span>
                                <h2 className="text-xl font-semibold text-white mt-1">{event.title}</h2>
                                <p className="text-sm text-zinc-400 mt-1">
                                    {event.start_date.toLocaleDateString('en-US', {
                                        weekday: 'long',
                                        month: 'long',
                                        day: 'numeric',
                                        year: 'numeric'
                                    })}
                                    {event.end_date > event.start_date && (
                                        <> — {event.end_date.toLocaleDateString('en-US', { month: 'long', day: 'numeric' })}</>
                                    )}
                                </p>
                            </div>
                            <button
                                onClick={onClose}
                                className="p-2 hover:bg-white/10 rounded-lg transition-colors"
                            >
                                <X className="w-5 h-5 text-zinc-400" />
                            </button>
                        </div>
                    </div>

                    {/* Content */}
                    <div className="p-6">
                        {/* Description */}
                        <p className="text-sm text-zinc-300 mb-6">{event.description}</p>

                        {/* Themes */}
                        <div className="mb-6">
                            <h3 className="text-[10px] uppercase tracking-wider text-zinc-500 mb-2">Themes</h3>
                            <div className="flex flex-wrap gap-2">
                                {event.themes.map(theme => (
                                    <span key={theme} className="px-2 py-1 bg-white/5 text-xs text-zinc-300 rounded">
                                        {theme}
                                    </span>
                                ))}
                            </div>
                        </div>

                        {/* Assigned Agents */}
                        <div className="mb-6">
                            <h3 className="text-[10px] uppercase tracking-wider text-zinc-500 mb-2">Assigned Agents</h3>
                            <div className="flex items-center gap-3">
                                {event.linked_agents.map(agentId => {
                                    const agent = AGENT_CONFIGS.find(a => a.id === agentId);
                                    return agent ? (
                                        <div key={agentId} className="flex items-center gap-2">
                                            <img src={agent.avatar} alt={agent.name} className="w-8 h-8 rounded-full" />
                                            <div>
                                                <div className="text-sm text-white">{agent.name}</div>
                                                <div className="text-[10px] text-zinc-500">{agent.role}</div>
                                            </div>
                                        </div>
                                    ) : null;
                                })}
                            </div>
                        </div>

                        {/* Actions */}
                        <div>
                            <h3 className="text-[10px] uppercase tracking-wider text-zinc-500 mb-3">Available Actions</h3>
                            <div className="space-y-2">
                                {event.actions.map(action => {
                                    const agent = AGENT_CONFIGS.find(a => a.id === action.agent);
                                    return (
                                        <button
                                            key={action.action_id}
                                            onClick={() => onAction(action)}
                                            className="w-full flex items-center gap-3 p-3 bg-white/5 hover:bg-white/10 rounded-xl transition-colors text-left"
                                        >
                                            <div className="w-10 h-10 rounded-lg bg-emerald-500/20 flex items-center justify-center text-emerald-400">
                                                {actionIcons[action.type] || <Play className="w-4 h-4" />}
                                            </div>
                                            <div className="flex-1">
                                                <div className="text-sm text-white">{action.label}</div>
                                                <div className="text-[10px] text-zinc-500">
                                                    Assigned to {agent?.name || 'Agent'}
                                                </div>
                                            </div>
                                        </button>
                                    );
                                })}
                            </div>
                        </div>
                    </div>
                </div>
            </motion.div>
        </>
    );
}

// Main Calendar Component
export function MarketingCalendar() {
    const [currentDate, setCurrentDate] = useState(new Date());
    const [selectedEvent, setSelectedEvent] = useState<CalendarEvent | null>(null);

    // Generate calendar days
    const generateCalendarDays = () => {
        const year = currentDate.getFullYear();
        const month = currentDate.getMonth();

        const firstDay = new Date(year, month, 1);


        const startDate = new Date(firstDay);
        startDate.setDate(startDate.getDate() - firstDay.getDay());

        const days: Date[] = [];
        const current = new Date(startDate);

        while (days.length < 42) {
            days.push(new Date(current));
            current.setDate(current.getDate() + 1);
        }

        return days;
    };

    const days = generateCalendarDays();
    const today = new Date();

    const getEventsForDay = (date: Date): CalendarEvent[] => {
        return MOCK_CALENDAR_EVENTS.filter(event => {
            const eventStart = new Date(event.start_date);
            const eventEnd = new Date(event.end_date);
            eventStart.setHours(0, 0, 0, 0);
            eventEnd.setHours(23, 59, 59, 999);
            const checkDate = new Date(date);
            checkDate.setHours(12, 0, 0, 0);
            return checkDate >= eventStart && checkDate <= eventEnd;
        });
    };

    const handlePreviousMonth = () => {
        setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1));
    };

    const handleNextMonth = () => {
        setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1));
    };

    const handleAction = (action: CalendarAction) => {
        if (!selectedEvent) return;

        // Import actions dynamically to avoid circular deps
        import('../lib/actions').then(({ createCampaign, requestContent, escalateToAgent }) => {
            switch (action.type) {
                case 'create_campaign':
                    createCampaign({
                        name: `${selectedEvent.title} Counter-Campaign`,
                        description: `Campaign in response to: ${selectedEvent.description}`,
                        startDate: selectedEvent.start_date,
                        endDate: selectedEvent.end_date,
                        calendarEventId: selectedEvent.event_id,
                        signalIds: selectedEvent.linked_signals
                    });
                    break;

                case 'draft_content':
                    requestContent(selectedEvent.event_id, selectedEvent.title);
                    break;

                case 'analyze':
                    escalateToAgent('echo', 'vantage', {
                        title: `Analyze: ${selectedEvent.title}`,
                        description: `Deep analysis requested for this event`,
                        calendarEventId: selectedEvent.event_id
                    });
                    break;

                case 'spin_up':
                    createCampaign({
                        name: `${selectedEvent.title} Campaign`,
                        description: `Launch campaign for: ${selectedEvent.title}`,
                        startDate: selectedEvent.start_date,
                        endDate: selectedEvent.end_date,
                        calendarEventId: selectedEvent.event_id
                    });
                    break;
            }
        });

        setSelectedEvent(null);
    };

    return (
        <div className="h-full flex flex-col">
            {/* Header */}
            <div className="flex items-center justify-between p-6 border-b border-white/5">
                <div>
                    <h1 className="text-2xl font-instrument-serif text-white">Marketing Calendar</h1>
                    <p className="text-sm text-zinc-500 mt-1">Strategic memory and coordination</p>
                </div>
                <div className="flex items-center gap-4">
                    {/* Month Navigation */}
                    <div className="flex items-center gap-2">
                        <button
                            onClick={handlePreviousMonth}
                            className="p-2 hover:bg-white/10 rounded-lg transition-colors"
                        >
                            <ChevronLeft className="w-5 h-5 text-zinc-400" />
                        </button>
                        <span className="text-white font-medium min-w-[140px] text-center">
                            {currentDate.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
                        </span>
                        <button
                            onClick={handleNextMonth}
                            className="p-2 hover:bg-white/10 rounded-lg transition-colors"
                        >
                            <ChevronRight className="w-5 h-5 text-zinc-400" />
                        </button>
                    </div>

                    {/* Add Event */}
                    <button className="flex items-center gap-2 px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white text-sm rounded-lg transition-colors">
                        <Plus className="w-4 h-4" />
                        Add Event
                    </button>
                </div>
            </div>

            {/* Legend */}
            <div className="flex items-center gap-4 px-6 py-3 border-b border-white/5 bg-white/[0.02]">
                {Object.entries(EVENT_COLORS).map(([type, colors]) => (
                    <div key={type} className="flex items-center gap-2">
                        <div className={`w-3 h-3 rounded ${colors.bg} ${colors.border} border`} />
                        <span className="text-[10px] text-zinc-500 capitalize">{type}</span>
                    </div>
                ))}
            </div>

            {/* Calendar Grid */}
            <div className="flex-1 overflow-auto">
                {/* Day Headers */}
                <div className="grid grid-cols-7 border-b border-white/5">
                    {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
                        <div key={day} className="p-3 text-center text-xs font-medium text-zinc-500 uppercase tracking-wider">
                            {day}
                        </div>
                    ))}
                </div>

                {/* Days Grid */}
                <div className="grid grid-cols-7">
                    {days.map((date, i) => (
                        <CalendarDay
                            key={i}
                            date={date}
                            events={getEventsForDay(date)}
                            isCurrentMonth={date.getMonth() === currentDate.getMonth()}
                            isToday={
                                date.getDate() === today.getDate() &&
                                date.getMonth() === today.getMonth() &&
                                date.getFullYear() === today.getFullYear()
                            }
                            onEventClick={setSelectedEvent}
                        />
                    ))}
                </div>
            </div>

            {/* Event Modal */}
            {selectedEvent && (
                <EventModal
                    event={selectedEvent}
                    onClose={() => setSelectedEvent(null)}
                    onAction={handleAction}
                />
            )}
        </div>
    );
}

export default MarketingCalendar;
