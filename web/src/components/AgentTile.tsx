import { motion } from 'framer-motion';

// Status types for agents
export type AgentStatus = 'active' | 'processing' | 'idle' | 'offline';

export interface AgentTask {
    id: string;
    command: string;
    status: 'pending' | 'processing' | 'completed';
    eta: string;
    progress: number;
    result?: string;
    createdAt: Date;
}

export interface AgentData {
    id: string;
    name: string;
    role: string;
    avatar: string;
    status: AgentStatus;
    currentTask?: string;
    category: 'intelligence' | 'content' | 'strategy' | 'growth';
}

interface AgentTileProps {
    agent: AgentData;
    isSelected: boolean;
    onClick: () => void;
}

const statusColors: Record<AgentStatus, string> = {
    active: 'bg-emerald-500',
    processing: 'bg-amber-500',
    idle: 'bg-blue-500',
    offline: 'bg-zinc-500'
};

const statusLabels: Record<AgentStatus, string> = {
    active: 'Active',
    processing: 'Processing...',
    idle: 'Idle',
    offline: 'Offline'
};

export function AgentTile({ agent, isSelected, onClick }: AgentTileProps) {
    return (
        <motion.div
            onClick={onClick}
            className={`
                relative p-4 rounded-2xl cursor-pointer transition-all duration-300
                ${isSelected
                    ? 'bg-white/10 ring-2 ring-white/20'
                    : 'bg-white/5 hover:bg-white/10'
                }
            `}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            layout
        >
            {/* Status indicator dot */}
            <div className="absolute top-3 right-3">
                <div className={`w-2.5 h-2.5 rounded-full ${statusColors[agent.status]} ring-2 ring-black`}>
                    {agent.status === 'processing' && (
                        <div className={`absolute inset-0 rounded-full ${statusColors[agent.status]} animate-ping opacity-75`} />
                    )}
                </div>
            </div>

            {/* Agent Avatar */}
            <div className="flex items-center gap-3 mb-3">
                <div className="relative">
                    <img
                        src={agent.avatar}
                        alt={agent.name}
                        className="w-12 h-12 rounded-full object-cover ring-2 ring-white/10"
                    />
                </div>
                <div>
                    <h3 className="text-white font-semibold text-sm">{agent.name}</h3>
                    <p className="text-zinc-500 text-xs">{agent.role}</p>
                </div>
            </div>

            {/* Current Task Preview */}
            {agent.currentTask && (
                <div className="mt-2 pt-3 border-t border-white/5">
                    <div className="flex items-center gap-2 text-xs text-zinc-400">
                        <div className={`w-1.5 h-1.5 rounded-full ${statusColors[agent.status]}`} />
                        <span className="truncate">{agent.currentTask}</span>
                    </div>
                </div>
            )}

            {/* Status label on hover */}
            <div className="absolute bottom-3 right-3 opacity-0 group-hover:opacity-100 transition-opacity">
                <span className="text-[10px] text-zinc-500 uppercase tracking-wider">
                    {statusLabels[agent.status]}
                </span>
            </div>
        </motion.div>
    );
}

export default AgentTile;
