
import { motion } from 'framer-motion';
import { Clock, Zap, CheckCircle2, ArrowRight } from 'lucide-react';
import type { Task, TaskPriority } from '../lib/aibc/signals/types';

interface GlobalTaskQueueProps {
    tasks: Task[];
    onSelectTask: (taskId: string) => void;
}

const PRIORITY_STYLES: Record<TaskPriority, string> = {
    critical: 'text-red-400 bg-red-500/10 border-red-500/20',
    high: 'text-orange-400 bg-orange-500/10 border-orange-500/20',
    medium: 'text-blue-400 bg-blue-500/10 border-blue-500/20',
    low: 'text-zinc-400 bg-zinc-500/10 border-zinc-500/20',
};

export function GlobalTaskQueue({ tasks, onSelectTask }: GlobalTaskQueueProps) {
    // Sort by Priority (Critical > High > Medium > Low) then by Impact
    const sortedTasks = [...tasks].sort((a, b) => {
        const priorityOrder: Record<TaskPriority, number> = { critical: 4, high: 3, medium: 2, low: 1 };
        if (priorityOrder[b.priority] !== priorityOrder[a.priority]) {
            return priorityOrder[b.priority] - priorityOrder[a.priority];
        }
        return b.impact_estimate - a.impact_estimate;
    });

    return (
        <div className="bg-[#0d0d12] rounded-2xl border border-white/10 flex flex-col h-full overflow-hidden">
            {/* Header */}
            <div className="p-4 border-b border-white/10 flex items-center justify-between bg-white/5">
                <div className="flex items-center gap-2">
                    <Zap className="w-4 h-4 text-amber-400" />
                    <span className="text-xs font-bold text-white uppercase tracking-wider">Action Required</span>
                </div>
                <div className="flex items-center gap-2">
                    <span className="text-[10px] text-zinc-500 font-mono">
                        {tasks.length} Pending
                    </span>
                </div>
            </div>

            {/* List */}
            <div className="flex-1 overflow-y-auto custom-scrollbar p-2 space-y-2">
                {sortedTasks.length === 0 ? (
                    <div className="flex flex-col items-center justify-center h-full text-zinc-600 space-y-2 opacity-50">
                        <CheckCircle2 className="w-8 h-8" />
                        <span className="text-xs font-medium">All clear</span>
                    </div>
                ) : (
                    sortedTasks.map((task) => (
                        <motion.div
                            key={task.id}
                            initial={{ opacity: 0, x: -10 }}
                            animate={{ opacity: 1, x: 0 }}
                            onClick={() => onSelectTask(task.id)}
                            className="group cursor-pointer p-3 rounded-lg bg-zinc-900/50 hover:bg-white/5 border border-transparent hover:border-white/10 transition-all flex items-start gap-3 relative overflow-hidden"
                        >
                            {/* Left Status Bar */}
                            <div className={`absolute left-0 top-0 bottom-0 w-1 ${PRIORITY_STYLES[task.priority].replace('text-', 'bg-').split(' ')[0]}`} />

                            <div className="flex-1 min-w-0 ml-2">
                                <div className="flex items-center justify-between mb-1">
                                    <span className={`text-[9px] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded border ${PRIORITY_STYLES[task.priority]}`}>
                                        {task.priority}
                                    </span>
                                    <span className="text-[9px] text-zinc-600 font-mono flex items-center gap-1">
                                        <Clock className="w-2.5 h-2.5" />
                                        1h ago
                                    </span>
                                </div>
                                <h4 className="text-xs font-bold text-zinc-200 group-hover:text-white truncate mb-0.5">
                                    {task.title}
                                </h4>
                                <p className="text-[10px] text-zinc-500 truncate">
                                    {task.description}
                                </p>
                            </div>

                            <ArrowRight className="w-3 h-3 text-zinc-700 group-hover:text-zinc-400 self-center opacity-0 group-hover:opacity-100 transition-opacity" />
                        </motion.div>
                    ))
                )}
            </div>

            {/* Footer */}
            <div className="p-2 border-t border-white/5 bg-white/5">
                <button className="w-full py-1.5 text-[10px] text-zinc-500 hover:text-white transition-colors uppercase font-bold tracking-wider hover:bg-white/5 rounded">
                    View All Tasks
                </button>
            </div>
        </div>
    );
}
