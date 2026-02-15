import { motion } from 'framer-motion';
import type { AgentData } from './AgentTile';

interface AgentSidebarProps {
    agents: AgentData[];
    selectedAgent: AgentData | null;
    onAgentSelect: (agent: AgentData) => void;
    activeCategory: string | null;
    onCategorySelect: (category: string | null) => void;
}

const CATEGORIES = [
    { id: 'intelligence', label: 'Intelligence', color: 'bg-blue-500' },
    { id: 'content', label: 'Content', color: 'bg-violet-500' },
    { id: 'strategy', label: 'Strategy', color: 'bg-amber-500' },
    { id: 'growth', label: 'Growth', color: 'bg-emerald-500' }
];

const statusColors = {
    active: 'bg-emerald-500',
    processing: 'bg-amber-500',
    idle: 'bg-blue-500',
    offline: 'bg-zinc-500'
};

export function AgentSidebar({
    agents,
    selectedAgent,
    onAgentSelect,
    activeCategory,
    onCategorySelect
}: AgentSidebarProps) {
    return (
        <div className="w-64 border-l border-white/5 bg-black/20 flex flex-col">
            {/* Header */}
            <div className="p-4 border-b border-white/5">
                <h2 className="text-xs font-bold text-zinc-400 uppercase tracking-wider">Agents</h2>
            </div>

            {/* Categories */}
            <div className="flex-1 overflow-y-auto p-2">
                {CATEGORIES.map(category => {
                    const categoryAgents = agents.filter(a => a.category === category.id);
                    const activeCount = categoryAgents.filter(a => a.status === 'active' || a.status === 'processing').length;
                    const isActive = activeCategory === category.id;

                    return (
                        <div key={category.id} className="mb-4">
                            {/* Category Header */}
                            <button
                                onClick={() => onCategorySelect(isActive ? null : category.id)}
                                className={`
                                    w-full flex items-center justify-between p-3 rounded-xl
                                    transition-colors duration-200
                                    ${isActive ? 'bg-white/10' : 'hover:bg-white/5'}
                                `}
                            >
                                <div className="flex items-center gap-2">
                                    <div className={`w-2 h-2 rounded-full ${category.color}`} />
                                    <span className="text-sm font-medium text-white">{category.label}</span>
                                </div>
                                <span className="text-xs text-zinc-500">
                                    {activeCount}/{categoryAgents.length}
                                </span>
                            </button>

                            {/* Agent List */}
                            <motion.div
                                initial={false}
                                animate={{ height: isActive || !activeCategory ? 'auto' : 0, opacity: isActive || !activeCategory ? 1 : 0 }}
                                className="overflow-hidden"
                            >
                                <div className="mt-1 space-y-1 pl-4">
                                    {categoryAgents.map(agent => (
                                        <button
                                            key={agent.id}
                                            onClick={() => onAgentSelect(agent)}
                                            className={`
                                                w-full flex items-center gap-3 p-2 rounded-lg
                                                transition-colors duration-150
                                                ${selectedAgent?.id === agent.id
                                                    ? 'bg-white/10 ring-1 ring-white/20'
                                                    : 'hover:bg-white/5'
                                                }
                                            `}
                                        >
                                            <div className="relative">
                                                <img
                                                    src={agent.avatar}
                                                    alt={agent.name}
                                                    className="w-8 h-8 rounded-full object-cover"
                                                />
                                                <div className={`
                                                    absolute -bottom-0.5 -right-0.5 
                                                    w-3 h-3 rounded-full border-2 border-black
                                                    ${statusColors[agent.status]}
                                                `} />
                                            </div>
                                            <div className="flex-1 text-left">
                                                <div className="text-sm text-white">{agent.name}</div>
                                                <div className="text-xs text-zinc-500 truncate">
                                                    {agent.currentTask || 'Idle'}
                                                </div>
                                            </div>
                                        </button>
                                    ))}
                                </div>
                            </motion.div>
                        </div>
                    );
                })}
            </div>

            {/* Footer */}
            <div className="p-4 border-t border-white/5">
                <button className="w-full py-2 px-4 rounded-xl bg-white/5 hover:bg-white/10 text-sm text-zinc-400 transition-colors">
                    + Add Agent
                </button>
            </div>
        </div>
    );
}

export default AgentSidebar;
