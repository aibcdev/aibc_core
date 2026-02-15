/**
 * Content Director Agent - Work Surface
 * Panels: Editorial Calendar, Draft Workspace, Asset List, Channel Distribution
 */

import { useState } from 'react';
import { motion } from 'framer-motion';
import { FileText, Video, Calendar, Edit3, Check, Clock } from 'lucide-react';

// Mock content data
const CONTENT_ITEMS = [
    {
        id: 1,
        title: 'Why AI Infrastructure Matters in 2026',
        type: 'article',
        platform: 'LinkedIn',
        status: 'draft',
        scheduledDate: null,
        author: 'Sage'
    },
    {
        id: 2,
        title: 'NVIDIA GTC Counter-Campaign Hook #1',
        type: 'post',
        platform: 'X',
        status: 'review',
        scheduledDate: new Date('2026-03-15'),
        author: 'Sage'
    },
    {
        id: 3,
        title: 'Product Demo: AI Accelerator v3',
        type: 'video',
        platform: 'YouTube',
        status: 'approved',
        scheduledDate: new Date('2026-02-01'),
        author: 'Sage'
    }
];

const HOOKS = [
    { id: 1, text: 'Built for what NVIDIA won\'t say.', used: 2 },
    { id: 2, text: 'The enterprise AI race isn\'t about speed. It\'s about trust.', used: 5 },
    { id: 3, text: 'When every GPU vendor sounds the same, look at the fine print.', used: 0 }
];

function ContentCard({ item }: { item: typeof CONTENT_ITEMS[0] }) {
    const typeIcons = {
        article: <FileText className="w-4 h-4" />,
        post: <Edit3 className="w-4 h-4" />,
        video: <Video className="w-4 h-4" />
    };

    const statusColors = {
        draft: 'bg-zinc-500/20 text-zinc-400',
        review: 'bg-amber-500/20 text-amber-400',
        approved: 'bg-emerald-500/20 text-emerald-400'
    };

    const statusIcons = {
        draft: <Edit3 className="w-3 h-3" />,
        review: <Clock className="w-3 h-3" />,
        approved: <Check className="w-3 h-3" />
    };

    return (
        <motion.div
            className="p-4 bg-white/5 rounded-xl hover:bg-white/10 transition-colors cursor-pointer group"
            whileHover={{ y: -2 }}
        >
            <div className="flex items-start gap-3">
                <div className="p-2 bg-white/5 rounded-lg text-zinc-400 group-hover:text-white transition-colors">
                    {typeIcons[item.type as keyof typeof typeIcons]}
                </div>
                <div className="flex-1 min-w-0">
                    <h4 className="text-sm text-white font-medium truncate">{item.title}</h4>
                    <div className="flex items-center gap-2 mt-1">
                        <span className="text-[10px] text-zinc-500">{item.platform}</span>
                        {item.scheduledDate && (
                            <>
                                <span className="text-[10px] text-zinc-600">•</span>
                                <span className="text-[10px] text-zinc-500 flex items-center gap-1">
                                    <Calendar className="w-3 h-3" />
                                    {item.scheduledDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                                </span>
                            </>
                        )}
                    </div>
                </div>
                <span className={`px-2 py-1 text-[10px] font-medium rounded flex items-center gap-1 ${statusColors[item.status as keyof typeof statusColors]}`}>
                    {statusIcons[item.status as keyof typeof statusIcons]}
                    {item.status}
                </span>
            </div>
        </motion.div>
    );
}

function HookCard({ hook }: { hook: typeof HOOKS[0] }) {
    return (
        <div className="p-3 bg-white/5 rounded-lg border border-white/5 hover:border-white/10 transition-colors">
            <p className="text-sm text-white italic">"{hook.text}"</p>
            <div className="flex items-center justify-between mt-2">
                <span className="text-[10px] text-zinc-500">Used {hook.used}x</span>
                <button className="text-[10px] text-emerald-400 hover:text-emerald-300">Copy</button>
            </div>
        </div>
    );
}

export function ContentWorkSurface() {
    const [activeTab, setActiveTab] = useState<'drafts' | 'hooks'>('drafts');

    return (
        <div className="h-full flex flex-col">
            {/* Tabs */}
            <div className="flex items-center gap-4 p-4 border-b border-white/5">
                <button
                    onClick={() => setActiveTab('drafts')}
                    className={`text-sm font-medium transition-colors flex items-center gap-2 ${activeTab === 'drafts' ? 'text-white' : 'text-zinc-500 hover:text-white'
                        }`}
                >
                    Content Queue
                    <span className="px-1.5 py-0.5 text-[10px] bg-violet-500/20 text-violet-400 rounded">{CONTENT_ITEMS.length}</span>
                </button>
                <button
                    onClick={() => setActiveTab('hooks')}
                    className={`text-sm font-medium transition-colors ${activeTab === 'hooks' ? 'text-white' : 'text-zinc-500 hover:text-white'
                        }`}
                >
                    Hook Library
                </button>
            </div>

            {/* Content */}
            <div className="flex-1 overflow-auto p-4">
                {activeTab === 'drafts' && (
                    <div className="space-y-3">
                        {CONTENT_ITEMS.map(item => (
                            <ContentCard key={item.id} item={item} />
                        ))}
                        <button className="w-full p-4 border border-dashed border-white/10 rounded-xl text-sm text-zinc-500 hover:text-white hover:border-white/20 transition-colors">
                            + Create New Draft
                        </button>
                    </div>
                )}

                {activeTab === 'hooks' && (
                    <div className="space-y-3">
                        {HOOKS.map(hook => (
                            <HookCard key={hook.id} hook={hook} />
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}

export default ContentWorkSurface;
