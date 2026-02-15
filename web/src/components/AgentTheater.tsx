import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { X, Clock, CheckCircle, Loader2, ChevronRight } from 'lucide-react';
import type { AgentData } from './AgentTile';
import { AgentChat } from './AgentChat';
import { useMarketingOS } from '../lib/store';
import type { AgentTask } from '../lib/types/marketing-os';

interface AgentTheaterProps {
    agent: AgentData;
    onClose: () => void;
}

export function AgentTheater({ agent, onClose }: AgentTheaterProps) {
    const store = useMarketingOS();
    const [sessionId, setSessionId] = useState<string | null>(null);
    const [selectedTask, setSelectedTask] = useState<AgentTask | null>(null);

    // Filter tasks for this agent
    const agentTasks = store.tasks.filter(t => t.assigned_to === agent.id);

    // Initialize Chat Session
    useEffect(() => {
        // Create a new session or find existing (simplified for now: always create/get)
        const id = store.createChatSession([agent.id as import('../lib/types/marketing-os').AgentId]);
        setSessionId(id);

        // Initial greeting
        store.sendMessage(
            id,
            `Hello! I'm ${agent.name}. I'm synced with the Marketing OS. Asking me to "draft content" or "analyze signals" will now trigger real workflows.`,
            'agent',
            agent.id as import('../lib/types/marketing-os').AgentId
        );
    }, [agent.id]);

    const statusIcons = {
        waiting: <Clock className="w-4 h-4 text-zinc-500" />,
        in_progress: <Loader2 className="w-4 h-4 text-amber-500 animate-spin" />,
        done: <CheckCircle className="w-4 h-4 text-emerald-500" />,
        proposed: <Clock className="w-4 h-4 text-zinc-400" />,
        rejected: <X className="w-4 h-4 text-red-500" />
    };

    return (
        <motion.div
            className="h-full rounded-2xl bg-zinc-900/50 border border-white/10 overflow-hidden flex flex-col"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
        >
            {/* Header */}
            <div className="flex items-center justify-between p-4 border-b border-white/5 bg-black/20">
                <div className="flex items-center gap-3">
                    <img
                        src={agent.avatar}
                        alt={agent.name}
                        className="w-10 h-10 rounded-full object-cover ring-2 ring-emerald-500/30"
                    />
                    <div>
                        <h2 className="text-white font-semibold">{agent.name}</h2>
                        <p className="text-xs text-zinc-500">{agent.role}</p>
                    </div>
                </div>
                <button
                    onClick={onClose}
                    className="p-2 rounded-lg hover:bg-white/10 transition-colors"
                >
                    <X className="w-5 h-5 text-zinc-400" />
                </button>
            </div>

            {/* Main Content */}
            <div className="flex-1 flex overflow-hidden">
                {/* Chat Section */}
                <div className="flex-1 border-r border-white/5">
                    {sessionId && (
                        <AgentChat
                            agentId={agent.id as import('../lib/types/marketing-os').AgentId}
                            agentName={agent.name}
                            agentAvatar={agent.avatar}
                            sessionId={sessionId}
                        />
                    )}
                </div>

                {/* Intelligence Stream (TASKS) */}
                <div className="w-80 flex flex-col bg-black/20">
                    <div className="p-4 border-b border-white/5">
                        <h3 className="text-xs font-bold text-zinc-400 uppercase tracking-wider">Active Tasks</h3>
                    </div>

                    <div className="flex-1 overflow-y-auto p-3 space-y-2">
                        {agentTasks.length === 0 ? (
                            <div className="p-4 text-center text-zinc-500 text-xs italic">
                                No active tasks for {agent.name}.
                            </div>
                        ) : (
                            agentTasks.map(task => (
                                <motion.button
                                    key={task.task_id}
                                    onClick={() => setSelectedTask(task)}
                                    className={`
                                        w-full text-left p-3 rounded-xl transition-colors
                                        ${selectedTask?.task_id === task.task_id
                                            ? 'bg-white/10 ring-1 ring-white/20'
                                            : 'bg-white/5 hover:bg-white/10'
                                        }
                                    `}
                                    initial={{ opacity: 0, x: 20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                >
                                    <div className="flex items-start gap-2">
                                        {statusIcons[task.status]}
                                        <div className="flex-1 min-w-0">
                                            <p className="text-sm text-white truncate">{task.title}</p>
                                            <div className="flex items-center gap-2 mt-1">
                                                <span className={`text-[10px] font-mono ${task.status === 'done' ? 'text-emerald-400' :
                                                    task.status === 'in_progress' ? 'text-amber-400' :
                                                        'text-zinc-500'
                                                    }`}>
                                                    {task.status.replace('_', ' ').toUpperCase()}
                                                </span>
                                            </div>
                                        </div>
                                        <ChevronRight className="w-4 h-4 text-zinc-600" />
                                    </div>
                                </motion.button>
                            ))
                        )}
                    </div>

                    {/* Task Detail Panel */}
                    {selectedTask && (
                        <motion.div
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="p-4 border-t border-white/5 bg-white/5"
                        >
                            <div className="flex items-center justify-between mb-2">
                                <span className="text-xs text-zinc-400">Task Details</span>
                                <button
                                    onClick={() => setSelectedTask(null)}
                                    className="text-zinc-500 hover:text-white"
                                >
                                    <X className="w-3 h-3" />
                                </button>
                            </div>
                            <p className="text-sm text-white mb-2">{selectedTask.description}</p>
                            <p className="text-[10px] text-zinc-500 mt-2">
                                Created {new Date(selectedTask.created_at).toLocaleTimeString()}
                            </p>
                        </motion.div>
                    )}
                </div>
            </div>
        </motion.div>
    );
}

export default AgentTheater;
