/**
 * Agent Office Layout
 * Each agent has a 5-panel office layout: Header, Work Surface, Task Board, Noticeboard, Chat
 * WIRED TO REAL STATE
 */

import { useState } from 'react';
import { motion } from 'framer-motion';
import {
    Gauge,
    Zap,
    MessageSquare,
    ChevronDown,
    Send,

} from 'lucide-react';
import type { AgentId, AgentAutonomy } from '../lib/types/marketing-os';
import { AGENT_CONFIGS, AGENT_STATUSES, MOCK_SIGNALS, MOCK_COLLABORATION_REQUESTS } from '../lib/types/mock-data';
import { useMarketingOS } from '../lib/store';

// Import agent-specific work surfaces
import { IntelligenceWorkSurface } from './agents/IntelligenceWorkSurface';
import { ContentWorkSurface } from './agents/ContentWorkSurface';
import { BrandWorkSurface } from './agents/BrandWorkSurface';
import { GrowthWorkSurface } from './agents/GrowthWorkSurface';
import { ExecutiveWorkSurface } from './agents/ExecutiveWorkSurface';

interface AgentOfficeProps {
    agentId: AgentId;
    onClose?: () => void;
}

// Confidence meter component
function ConfidenceMeter({ value }: { value: number }) {
    const getColor = () => {
        if (value >= 0.7) return 'bg-emerald-500';
        if (value >= 0.4) return 'bg-amber-500';
        return 'bg-rose-500';
    };

    return (
        <div className="flex items-center gap-2">
            <Gauge className="w-4 h-4 text-zinc-500" />
            <div className="w-24 h-2 bg-white/10 rounded-full overflow-hidden">
                <div
                    className={`h-full ${getColor()} transition-all duration-500`}
                    style={{ width: `${value * 100}%` }}
                />
            </div>
            <span className="text-xs text-zinc-500">{Math.round(value * 100)}%</span>
        </div>
    );
}

// Aggression slider
function AggressionSlider({ value, onChange }: { value: number; onChange: (v: number) => void }) {
    return (
        <div className="space-y-2">
            <div className="flex justify-between text-[10px] text-zinc-500">
                <span>Passive</span>
                <span>Aggressive</span>
            </div>
            <input
                type="range"
                min="0"
                max="100"
                value={value}
                onChange={(e) => onChange(parseInt(e.target.value))}
                className="w-full h-1 bg-white/10 rounded-full appearance-none cursor-pointer
                           [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-3 [&::-webkit-slider-thumb]:h-3 
                           [&::-webkit-slider-thumb]:bg-emerald-500 [&::-webkit-slider-thumb]:rounded-full"
            />
        </div>
    );
}

// Autonomy toggle
function AutonomyToggle({ value, onChange }: { value: AgentAutonomy; onChange: (v: AgentAutonomy) => void }) {
    const modes: AgentAutonomy[] = ['monitor', 'propose', 'act'];

    return (
        <div className="flex rounded-lg bg-white/5 p-1">
            {modes.map(mode => (
                <button
                    key={mode}
                    onClick={() => onChange(mode)}
                    className={`
                        flex-1 px-3 py-1.5 text-[10px] font-medium uppercase tracking-wider rounded-md transition-all
                        ${value === mode
                            ? 'bg-emerald-600 text-white'
                            : 'text-zinc-500 hover:text-white'
                        }
                    `}
                >
                    {mode}
                </button>
            ))}
        </div>
    );
}

// Panel A: Agent Header / Brief
function AgentHeader({
    agentId,
    aggression,
    onAggressionChange,
    autonomy,
    onAutonomyChange
}: {
    agentId: AgentId;
    aggression: number;
    onAggressionChange: (v: number) => void;
    autonomy: AgentAutonomy;
    onAutonomyChange: (v: AgentAutonomy) => void;
}) {
    const agent = AGENT_CONFIGS.find(a => a.id === agentId);
    const status = AGENT_STATUSES.find(s => s.agentId === agentId);

    // Get real confidence from store
    const { agentConfidence } = useMarketingOS();
    const confidence = (agentConfidence[agentId]?.confidence || 74) / 100;

    if (!agent) return null;

    const statusColors = {
        active: 'bg-emerald-500',
        processing: 'bg-amber-500',
        idle: 'bg-blue-500',
        offline: 'bg-zinc-500'
    };

    return (
        <div className="bg-zinc-900/50 border border-white/5 rounded-xl p-5">
            {/* Agent Identity */}
            <div className="flex items-start gap-4 mb-6">
                <div className="relative">
                    <img
                        src={agent.avatar}
                        alt={agent.name}
                        className="w-14 h-14 rounded-xl object-cover"
                    />
                    <div className={`absolute -bottom-1 -right-1 w-4 h-4 rounded-full border-2 border-zinc-900 ${statusColors[status?.status || 'offline']}`} />
                </div>
                <div className="flex-1">
                    <h2 className="text-xl font-semibold text-white">{agent.name}</h2>
                    <p className="text-sm text-zinc-500">{agent.role}</p>
                    {status?.currentTask && (
                        <p className="text-xs text-emerald-400 mt-1">{status.currentTask}</p>
                    )}
                </div>
            </div>

            {/* Divider */}
            <div className="border-t border-white/5 my-4" />

            {/* Confidence */}
            <div className="mb-4">
                <div className="text-[10px] text-zinc-500 uppercase tracking-wider mb-2">Confidence</div>
                <ConfidenceMeter value={confidence} />
            </div>

            {/* Aggression */}
            <div className="mb-4">
                <div className="text-[10px] text-zinc-500 uppercase tracking-wider mb-2">Aggression</div>
                <AggressionSlider value={aggression} onChange={onAggressionChange} />
            </div>

            {/* Autonomy Mode */}
            <div>
                <div className="text-[10px] text-zinc-500 uppercase tracking-wider mb-2">Autonomy</div>
                <AutonomyToggle value={autonomy} onChange={onAutonomyChange} />
            </div>
        </div>
    );
}

// Panel C: Noticeboard (Signals + Calendar + Requests)
function Noticeboard({ agentId }: { agentId: AgentId }) {
    const agentSignals = MOCK_SIGNALS.filter(s => s.assigned_agents?.includes(agentId));
    const agentRequests = MOCK_COLLABORATION_REQUESTS.filter(
        r => r.to_agent === agentId && r.status === 'pending'
    );

    return (
        <div className="bg-zinc-900/50 border border-white/5 rounded-xl h-full flex flex-col">
            <div className="p-4 border-b border-white/5">
                <h3 className="text-xs font-bold text-zinc-400 uppercase tracking-wider">Noticeboard</h3>
            </div>

            <div className="flex-1 overflow-y-auto p-3 space-y-3">
                {/* Signals */}
                {agentSignals.length > 0 && (
                    <div>
                        <div className="text-[10px] text-zinc-500 uppercase tracking-wider mb-2 flex items-center gap-1">
                            <Zap className="w-3 h-3" /> Signals
                        </div>
                        {agentSignals.map(signal => (
                            <div
                                key={signal.signal_id}
                                className="p-3 bg-white/5 rounded-lg mb-2 hover:bg-white/10 cursor-pointer transition-colors"
                            >
                                <p className="text-sm text-white">{signal.topic}</p>
                                <div className="flex items-center gap-2 mt-1">
                                    <span className="text-[10px] text-zinc-500">{signal.source}</span>
                                    <span className="text-[10px] text-emerald-400">{Math.round(signal.confidence * 100)}% conf</span>
                                </div>
                            </div>
                        ))}
                    </div>
                )}

                {/* Collaboration Requests */}
                {agentRequests.length > 0 && (
                    <div>
                        <div className="text-[10px] text-zinc-500 uppercase tracking-wider mb-2">Requests</div>
                        {agentRequests.map(request => {
                            const fromAgent = AGENT_CONFIGS.find(a => a.id === request.from_agent);
                            return (
                                <div
                                    key={request.request_id}
                                    className="p-3 bg-amber-500/10 border border-amber-500/20 rounded-lg mb-2"
                                >
                                    <div className="flex items-center gap-2 mb-1">
                                        <img src={fromAgent?.avatar} className="w-5 h-5 rounded-full" />
                                        <span className="text-xs text-amber-400">{fromAgent?.name}</span>
                                    </div>
                                    <p className="text-sm text-white">{request.message}</p>
                                </div>
                            );
                        })}
                    </div>
                )}

                {agentSignals.length === 0 && agentRequests.length === 0 && (
                    <div className="text-center py-8 text-zinc-600 text-sm">
                        No new signals or requests
                    </div>
                )}
            </div>
        </div>
    );
}

// Panel D: Chat (Secondary, Collapsible) - WIRED TO GEMINI
function ChatPanel({ agentId }: { agentId: AgentId }) {
    const [isExpanded, setIsExpanded] = useState(false);
    const [message, setMessage] = useState('');
    const [messages, setMessages] = useState<Array<{ role: 'user' | 'agent'; text: string }>>([]);
    const [isLoading, setIsLoading] = useState(false);
    const agent = AGENT_CONFIGS.find(a => a.id === agentId);

    const handleSend = async () => {
        if (!message.trim() || isLoading) return;

        const userMessage = message.trim();
        setMessage('');
        setMessages(prev => [...prev, { role: 'user', text: userMessage }]);
        setIsLoading(true);

        try {
            // Dynamic import to avoid bundle bloat
            const { callGemini } = await import('../lib/gemini');
            const response = await callGemini(agentId as 'echo' | 'sage' | 'pulse' | 'vantage' | 'oracle', userMessage);
            setMessages(prev => [...prev, { role: 'agent', text: response }]);
        } catch (error) {
            setMessages(prev => [...prev, {
                role: 'agent',
                text: `Error: ${error instanceof Error ? error.message : 'Failed to connect to Gemini'}`
            }]);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="bg-zinc-900/50 border border-white/5 rounded-xl">
            {/* Header */}
            <button
                onClick={() => setIsExpanded(!isExpanded)}
                className="w-full p-3 flex items-center justify-between hover:bg-white/5 transition-colors"
            >
                <div className="flex items-center gap-2 text-zinc-400">
                    <MessageSquare className="w-4 h-4" />
                    <span className="text-xs font-medium">Chat with {agent?.name}</span>
                </div>
                <ChevronDown className={`w-4 h-4 text-zinc-500 transition-transform ${isExpanded ? 'rotate-180' : ''}`} />
            </button>

            {/* Expanded Chat */}
            {isExpanded && (
                <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    className="border-t border-white/5"
                >
                    <div className="p-3 space-y-3 max-h-64 overflow-y-auto">
                        {messages.length === 0 && (
                            <div className="text-center text-xs text-zinc-600 py-4">
                                Chat is secondary. Use work surface for artifacts.
                            </div>
                        )}
                        {messages.map((msg, i) => (
                            <div key={i} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                                <div className={`max-w-[80%] p-2 rounded-lg text-sm ${msg.role === 'user'
                                    ? 'bg-emerald-600 text-white'
                                    : 'bg-white/10 text-zinc-300'
                                    }`}>
                                    {msg.text}
                                </div>
                            </div>
                        ))}
                        {isLoading && (
                            <div className="flex justify-start">
                                <div className="bg-white/10 p-2 rounded-lg text-sm text-zinc-400 animate-pulse">
                                    {agent?.name} is thinking...
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Input */}
                    <div className="p-3 border-t border-white/5">
                        <div className="flex gap-2">
                            <input
                                type="text"
                                value={message}
                                onChange={(e) => setMessage(e.target.value)}
                                onKeyDown={(e) => e.key === 'Enter' && handleSend()}
                                placeholder="Send a command..."
                                disabled={isLoading}
                                className="flex-1 bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-sm text-white placeholder:text-zinc-600 focus:outline-none focus:border-white/20 disabled:opacity-50"
                            />
                            <button
                                onClick={handleSend}
                                disabled={isLoading}
                                className="p-2 bg-emerald-600 hover:bg-emerald-500 rounded-lg transition-colors disabled:opacity-50"
                            >
                                <Send className="w-4 h-4 text-white" />
                            </button>
                        </div>
                    </div>
                </motion.div>
            )}
        </div>
    );
}

// Get the appropriate work surface for the agent
function getWorkSurface(agentId: AgentId) {
    switch (agentId) {
        case 'echo':
            return <IntelligenceWorkSurface />;
        case 'sage':
            return <ContentWorkSurface />;
        case 'pulse':
            return <BrandWorkSurface />;
        case 'vantage':
            return <GrowthWorkSurface />;
        case 'oracle':
            return <ExecutiveWorkSurface />;
        default:
            return <div className="text-zinc-500">Unknown agent</div>;
    }
}

// Main Agent Office Component
export function AgentOffice({ agentId }: AgentOfficeProps) {
    const [aggression, setAggression] = useState(50);
    const [autonomy, setAutonomy] = useState<AgentAutonomy>('propose');

    const agent = AGENT_CONFIGS.find(a => a.id === agentId);
    if (!agent) return null;

    return (
        <div className="h-full p-6 flex flex-col gap-4">
            {/* Office Title */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-instrument-serif text-white">{agent.name}'s Office</h1>
                    <p className="text-sm text-zinc-500">{agent.role}</p>
                </div>
            </div>

            {/* 4-Panel Layout */}
            <div className="flex-1 grid grid-cols-12 gap-4 min-h-0">
                {/* Left Column: Agent Brief */}
                <div className="col-span-3 flex flex-col gap-4">
                    <AgentHeader
                        agentId={agentId}
                        aggression={aggression}
                        onAggressionChange={setAggression}
                        autonomy={autonomy}
                        onAutonomyChange={setAutonomy}
                    />
                    <ChatPanel agentId={agentId} />
                </div>

                {/* Center: Work Surface (PRIMARY) */}
                <div className="col-span-6 bg-zinc-900/50 border border-white/5 rounded-xl overflow-hidden">
                    {getWorkSurface(agentId)}
                </div>

                {/* Right Column: Noticeboard */}
                <div className="col-span-3">
                    <Noticeboard agentId={agentId} />
                </div>
            </div>
        </div>
    );
}

export default AgentOffice;
