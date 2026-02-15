import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { AgentTile } from './AgentTile';
import type { AgentData } from './AgentTile';
import { AgentSidebar } from './AgentSidebar';
import { AgentTheater } from './AgentTheater';

// Mock agent data
const AGENTS: AgentData[] = [
    {
        id: 'echo',
        name: 'Echo',
        role: 'Competitor Intelligence',
        avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200&h=200&fit=crop&crop=face',
        status: 'active',
        currentTask: 'Monitoring competitor pricing changes...',
        category: 'intelligence'
    },
    {
        id: 'sage',
        name: 'Sage',
        role: 'Content Director',
        avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200&h=200&fit=crop&crop=face',
        status: 'processing',
        currentTask: 'Drafting LinkedIn article on AI trends...',
        category: 'content'
    },
    {
        id: 'pulse',
        name: 'Pulse',
        role: 'Brand Architect',
        avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=200&h=200&fit=crop&crop=face',
        status: 'active',
        currentTask: 'Analyzing brand consistency score...',
        category: 'strategy'
    },
    {
        id: 'vantage',
        name: 'Vantage',
        role: 'Growth Strategist',
        avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=200&h=200&fit=crop&crop=face',
        status: 'idle',
        category: 'growth'
    },
    {
        id: 'nexus',
        name: 'Nexus',
        role: 'Data Analyst',
        avatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=200&h=200&fit=crop&crop=face',
        status: 'processing',
        currentTask: 'Processing Q1 market signals...',
        category: 'intelligence'
    },
    {
        id: 'aria',
        name: 'Aria',
        role: 'Video Producer',
        avatar: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=200&h=200&fit=crop&crop=face',
        status: 'idle',
        category: 'content'
    }
];

interface AgentRoomGridProps {
    onAgentSelect: (agent: AgentData | null) => void;
    selectedAgent: AgentData | null;
}

export function AgentRoomGrid({ onAgentSelect, selectedAgent }: AgentRoomGridProps) {
    const [activeCategory, setActiveCategory] = useState<string | null>(null);

    const filteredAgents = activeCategory
        ? AGENTS.filter(a => a.category === activeCategory)
        : AGENTS;

    return (
        <div className="flex h-full">
            {/* Main Grid Area */}
            <div className="flex-1 p-6 overflow-auto">
                {/* Header */}
                <div className="mb-8">
                    <h1 className="text-2xl font-instrument-serif text-white mb-2">Agent Office</h1>
                    <p className="text-zinc-500 text-sm">
                        {AGENTS.filter(a => a.status === 'active').length} agents active •
                        {AGENTS.filter(a => a.status === 'processing').length} processing
                    </p>
                </div>

                {/* Grid Layout */}
                <div className="grid grid-cols-3 gap-4 mb-8">
                    {filteredAgents.slice(0, 2).map(agent => (
                        <AgentTile
                            key={agent.id}
                            agent={agent}
                            isSelected={selectedAgent?.id === agent.id}
                            onClick={() => onAgentSelect(agent)}
                        />
                    ))}

                    {/* Theater/Focus Area - spans 2 columns when agent is selected */}
                    <AnimatePresence mode="wait">
                        {selectedAgent ? (
                            <motion.div
                                key="theater"
                                initial={{ opacity: 0, scale: 0.95 }}
                                animate={{ opacity: 1, scale: 1 }}
                                exit={{ opacity: 0, scale: 0.95 }}
                                className="col-span-2 row-span-2"
                            >
                                <AgentTheater
                                    agent={selectedAgent}
                                    onClose={() => onAgentSelect(null)}
                                />
                            </motion.div>
                        ) : (
                            <motion.div
                                key="empty-theater"
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                exit={{ opacity: 0 }}
                                className="col-span-2 row-span-2 rounded-2xl bg-white/5 border border-dashed border-white/10 flex items-center justify-center"
                            >
                                <div className="text-center p-8">
                                    <div className="w-16 h-16 rounded-full bg-white/5 flex items-center justify-center mx-auto mb-4">
                                        <span className="text-2xl">👆</span>
                                    </div>
                                    <p className="text-zinc-500 text-sm">Select an agent to start a conversation</p>
                                </div>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>

                {/* Bottom row of agents */}
                <div className="grid grid-cols-4 gap-4">
                    {filteredAgents.slice(2).map(agent => (
                        <AgentTile
                            key={agent.id}
                            agent={agent}
                            isSelected={selectedAgent?.id === agent.id}
                            onClick={() => onAgentSelect(agent)}
                        />
                    ))}
                </div>
            </div>

            {/* Right Sidebar */}
            <AgentSidebar
                agents={AGENTS}
                selectedAgent={selectedAgent}
                onAgentSelect={onAgentSelect}
                activeCategory={activeCategory}
                onCategorySelect={setActiveCategory}
            />
        </div>
    );
}

export default AgentRoomGrid;
