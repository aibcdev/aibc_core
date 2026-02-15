import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Check, Plus, ChevronRight, Info } from 'lucide-react';

// Import Agent Concept Art
import sageBg from '../../assets/agents/agent_sage_concept_1768193799119.png';
import vantageBg from '../../assets/agents/agent_vantage_concept_1768193814155.png';
import oracleBg from '../../assets/agents/agent_oracle_concept_1768193829240.png';
import pulseBg from '../../assets/agents/agent_pulse_concept_1768193845302.png';

export interface AgentOption {
    id: string;
    name: string;
    role: string;
    description: string;
    capabilities: string[];
    price: number;
    image: string;
    color: string;
}

const AGENTS: AgentOption[] = [
    {
        id: 'sage',
        name: 'Sage',
        role: 'Content Strategist',
        description: 'Expert writer for blogs, newsletters, and whitepapers.',
        capabilities: ['Blog Planning', 'SEO Writing', 'Newsletter Drafting'],
        price: 299,
        image: sageBg,
        color: 'emerald'
    },
    {
        id: 'vantage',
        name: 'Vantage',
        role: 'Social Media Manager',
        description: 'Manages trends, drafts posts, and engages community.',
        capabilities: ['Trend Monitoring', 'Social Drafting', 'Community Engagement'],
        price: 299,
        image: vantageBg,
        color: 'blue'
    },
    {
        id: 'oracle',
        name: 'Oracle',
        role: 'Brand Guardian',
        description: 'Ensures voice consistency and brand alignment.',
        capabilities: ['Style Guide Checks', 'Tone Analysis', 'Brand Monitoring'],
        price: 349,
        image: oracleBg,
        color: 'amber'
    },
    {
        id: 'pulse',
        name: 'Pulse',
        role: 'Growth Specialist',
        description: 'Drives outreach and optimizes add copy.',
        capabilities: ['Outreach Emails', 'Ad Copywriting', 'Conversion Optimization'],
        price: 349,
        image: pulseBg,
        color: 'rose'
    }
];

interface AgentSelectionProps {
    onContinue: (selectedAgents: string[]) => void;
}

export function AgentSelection({ onContinue }: AgentSelectionProps) {
    const [selectedAgents, setSelectedAgents] = useState<string[]>([]);
    const [focusedAgentId, setFocusedAgentId] = useState<string | null>(null);

    const toggleAgent = (id: string) => {
        setSelectedAgents(prev =>
            prev.includes(id) ? prev.filter(a => a !== id) : [...prev, id]
        );
    };

    const totalPrice = selectedAgents.reduce((sum, id) => {
        const agent = AGENTS.find(a => a.id === id);
        return sum + (agent?.price || 0);
    }, 0);

    const focusedAgent = AGENTS.find(a => a.id === focusedAgentId);

    return (
        <div className="h-full flex flex-col">
            {/* Header */}
            <div className="text-center mb-8">
                <h2 className="text-3xl font-bold text-white mb-2">Build Your AI Team</h2>
                <p className="text-zinc-400">Select the specialized agents you need to power your marketing.</p>
            </div>

            {/* Carousel / Grid */}
            <div className="flex-1 overflow-x-auto pb-8 custom-scrollbar">
                <div className="flex gap-6 px-8 min-w-max mx-auto justify-center">
                    {/* Agent Cards */}
                    {AGENTS.map((agent) => {
                        const isSelected = selectedAgents.includes(agent.id);

                        return (
                            <motion.div
                                key={agent.id}
                                className={`
                                    relative w-[280px] h-[420px] rounded-2xl overflow-hidden cursor-pointer
                                    border-2 transition-all duration-300 group
                                    ${isSelected
                                        ? `border-${agent.color}-500 shadow-[0_0_30px_rgba(0,0,0,0.3)]`
                                        : 'border-white/10 hover:border-white/30'
                                    }
                                `}
                                onClick={() => toggleAgent(agent.id)}
                                onMouseEnter={() => setFocusedAgentId(agent.id)}
                                onMouseLeave={() => setFocusedAgentId(null)}
                                whileHover={{ scale: 1.02 }}
                            >
                                {/* Background Image */}
                                <div className="absolute inset-0">
                                    <img
                                        src={agent.image}
                                        alt={agent.name}
                                        className="w-full h-full object-cover opacity-60 group-hover:opacity-40 transition-opacity duration-500"
                                    />
                                    <div className="absolute inset-0 bg-gradient-to-t from-zinc-950 via-zinc-950/80 to-transparent" />
                                </div>

                                {/* Content */}
                                <div className="absolute inset-0 p-6 flex flex-col justify-end">
                                    {/* Selection Checkbox */}
                                    <div className={`
                                        absolute top-4 right-4 w-8 h-8 rounded-full flex items-center justify-center
                                        transition-colors duration-300
                                        ${isSelected ? `bg-${agent.color}-500 text-white` : 'bg-white/10 text-transparent border border-white/20'}
                                    `}>
                                        <Check className="w-5 h-5" />
                                    </div>

                                    <div className={`text-${agent.color}-400 text-sm font-medium tracking-wider uppercase mb-1`}>
                                        {agent.role}
                                    </div>
                                    <h3 className="text-2xl font-bold text-white mb-2">{agent.name}</h3>
                                    <p className="text-zinc-400 text-sm mb-4 line-clamp-3">
                                        {agent.description}
                                    </p>

                                    {/* Capabilities Mini-list */}
                                    <div className="space-y-1 mb-4">
                                        {agent.capabilities.map((cap, i) => (
                                            <div key={i} className="flex items-center gap-2 text-xs text-zinc-300">
                                                <div className={`w-1 h-1 rounded-full bg-${agent.color}-500`} />
                                                {cap}
                                            </div>
                                        ))}
                                    </div>

                                    <div className="flex items-center justify-between pt-4 border-t border-white/10">
                                        <div className="text-lg font-bold text-white">${agent.price}<span className="text-xs text-zinc-500 font-normal">/mo</span></div>
                                        <span className={`text-xs ${isSelected ? 'text-white' : 'text-zinc-500'} transition-colors`}>
                                            {isSelected ? 'Selected' : 'Click to Add'}
                                        </span>
                                    </div>
                                </div>
                            </motion.div>
                        );
                    })}

                    {/* Custom Agent Card */}
                    <motion.div
                        className="relative w-[280px] h-[420px] rounded-2xl overflow-hidden cursor-pointer
                                   border-2 border-dashed border-white/10 hover:border-white/30
                                   flex flex-col items-center justify-center gap-4 bg-white/5 hover:bg-white/10 transition-all"
                        whileHover={{ scale: 1.02 }}
                    >
                        <div className="w-16 h-16 rounded-full bg-white/5 flex items-center justify-center">
                            <Plus className="w-8 h-8 text-zinc-400" />
                        </div>
                        <div className="text-center px-6">
                            <h3 className="text-xl font-bold text-white mb-1">Custom Agent</h3>
                            <p className="text-sm text-zinc-500">Need specific capabilities? Build a custom agent.</p>
                        </div>
                        <button className="px-4 py-2 rounded-lg bg-white/10 hover:bg-white/20 text-sm font-medium transition-colors">
                            Contact Sales
                        </button>
                    </motion.div>
                </div>
            </div>

            {/* Bottom Bar */}
            <div className="mt-auto pt-6 border-t border-white/10 flex items-center justify-between">
                <div className="flex items-center gap-4">
                    <div className="text-sm text-zinc-400">
                        Total Monthly: <span className="text-xl font-bold text-white ml-2">${totalPrice}</span>
                    </div>
                    {selectedAgents.length > 0 && (
                        <div className="px-3 py-1 rounded-full bg-white/10 text-white text-xs">
                            {selectedAgents.length} Agents Selected
                        </div>
                    )}
                </div>

                <button
                    onClick={() => onContinue(selectedAgents)}
                    disabled={selectedAgents.length === 0}
                    className="flex items-center gap-2 px-8 py-3 rounded-xl bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 disabled:cursor-not-allowed transition-all font-medium text-white"
                >
                    Continue <ChevronRight className="w-5 h-5" />
                </button>
            </div>
        </div>
    );
}
