/**
 * Agent Task Board Component
 * Kanban-style board: Proposed → In Progress → Waiting → Done
 */

import { motion } from 'framer-motion';
import { CheckCircle2, Clock, Loader2, AlertCircle, ChevronRight } from 'lucide-react';
import { useMarketingOS, type AgentTask, type TaskStatus } from '../../lib/store';
import { AGENT_CONFIGS } from '../../lib/types/mock-data';
import type { AgentId } from '../../lib/types/marketing-os';

interface TaskBoardProps {
    agentId: AgentId;
}

const STATUS_CONFIG: Record<TaskStatus, { label: string; color: string; icon: React.ReactNode }> = {
    proposed: {
        label: 'Proposed',
        color: 'border-blue-500',
        icon: <AlertCircle className="w-3 h-3 text-blue-400" />
    },
    in_progress: {
        label: 'In Progress',
        color: 'border-amber-500',
        icon: <Loader2 className="w-3 h-3 text-amber-400 animate-spin" />
    },
    waiting: {
        label: 'Waiting',
        color: 'border-violet-500',
        icon: <Clock className="w-3 h-3 text-violet-400" />
    },
    done: {
        label: 'Done',
        color: 'border-emerald-500',
        icon: <CheckCircle2 className="w-3 h-3 text-emerald-400" />
    },
    rejected: {
        label: 'Rejected',
        color: 'border-rose-500',
        icon: <AlertCircle className="w-3 h-3 text-rose-400" />
    }
};

function TaskCard({ task }: { task: AgentTask }) {
    const config = STATUS_CONFIG[task.status];
    const creator = task.created_by === 'user' || task.created_by === 'system'
        ? null
        : AGENT_CONFIGS.find(a => a.id === task.created_by);

    const priorityColors: Record<string, string> = {
        high: 'bg-rose-500/20 text-rose-400',
        medium: 'bg-amber-500/20 text-amber-400',
        low: 'bg-emerald-500/20 text-emerald-400'
    };

    return (
        <motion.div
            layout
            className={`p-3 bg-white/5 rounded-lg border-l-2 ${config.color} hover:bg-white/10 transition-colors cursor-pointer`}
            whileHover={{ x: 2 }}
        >
            <div className="flex items-start justify-between mb-2">
                <h4 className="text-sm text-white font-medium line-clamp-2">{task.title}</h4>
                <span className={`px-1.5 py-0.5 text-[9px] uppercase rounded ${priorityColors[task.priority]}`}>
                    {task.priority}
                </span>
            </div>

            {task.description && (
                <p className="text-xs text-zinc-500 line-clamp-2 mb-2">{task.description}</p>
            )}

            <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                    {config.icon}
                    <span className="text-[10px] text-zinc-500">{config.label}</span>
                </div>

                {creator && (
                    <div className="flex items-center gap-1">
                        <ChevronRight className="w-3 h-3 text-zinc-600" />
                        <img
                            src={creator.avatar}
                            alt={creator.name}
                            className="w-4 h-4 rounded-full"
                            title={`From ${creator.name}`}
                        />
                    </div>
                )}
            </div>

            {task.waiting_on && task.waiting_on.length > 0 && (
                <div className="mt-2 pt-2 border-t border-white/5">
                    <span className="text-[9px] text-violet-400">
                        Waiting on: {task.waiting_on.join(', ')}
                    </span>
                </div>
            )}
        </motion.div>
    );
}

function TaskColumn({ status, tasks }: { status: TaskStatus; tasks: AgentTask[] }) {
    const config = STATUS_CONFIG[status];

    return (
        <div className="flex-1 min-w-[200px]">
            <div className="flex items-center gap-2 mb-3 px-2">
                {config.icon}
                <span className="text-xs font-medium text-zinc-400">{config.label}</span>
                <span className="px-1.5 py-0.5 text-[10px] bg-white/10 text-zinc-500 rounded">
                    {tasks.length}
                </span>
            </div>

            <div className="space-y-2 min-h-[100px]">
                {tasks.map(task => (
                    <TaskCard key={task.task_id} task={task} />
                ))}

                {tasks.length === 0 && (
                    <div className="p-4 border border-dashed border-white/10 rounded-lg text-center">
                        <p className="text-[10px] text-zinc-600">No tasks</p>
                    </div>
                )}
            </div>
        </div>
    );
}

export function TaskBoard({ agentId }: TaskBoardProps) {
    const { tasks } = useMarketingOS();

    // Filter tasks for this agent
    const agentTasks = tasks.filter(t => t.assigned_to === agentId);

    // Group by status
    const tasksByStatus: Record<TaskStatus, AgentTask[]> = {
        proposed: agentTasks.filter(t => t.status === 'proposed'),
        in_progress: agentTasks.filter(t => t.status === 'in_progress'),
        waiting: agentTasks.filter(t => t.status === 'waiting'),
        done: agentTasks.filter(t => t.status === 'done'),
        rejected: agentTasks.filter(t => t.status === 'rejected')
    };

    return (
        <div className="h-full flex flex-col">
            <div className="flex items-center justify-between p-4 border-b border-white/5">
                <h3 className="text-sm font-medium text-white">Task Board</h3>
                <span className="text-[10px] text-zinc-500">
                    {agentTasks.length} total • {tasksByStatus.in_progress.length} in progress
                </span>
            </div>

            <div className="flex-1 overflow-x-auto p-4">
                <div className="flex gap-4 min-w-max">
                    <TaskColumn status="proposed" tasks={tasksByStatus.proposed} />
                    <TaskColumn status="in_progress" tasks={tasksByStatus.in_progress} />
                    <TaskColumn status="waiting" tasks={tasksByStatus.waiting} />
                    <TaskColumn status="done" tasks={tasksByStatus.done} />
                </div>
            </div>
        </div>
    );
}

export default TaskBoard;
