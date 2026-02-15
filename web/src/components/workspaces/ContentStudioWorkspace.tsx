/**
 * Content Studio Workspace
 * Editorial calendar, drafts, and asset management
 */

import { useState } from 'react';
import { motion } from 'framer-motion';
import {
    Plus,
    FileText,
    Image,
    Video,
    Edit3,
    Clock,
    Calendar,
    Filter,
    Grid,
    List,
    ExternalLink
} from 'lucide-react';
import { AGENT_CONFIGS } from '../../lib/types/mock-data';

// Mock content items
const CONTENT_ITEMS = [
    {
        id: '1',
        title: 'Why AI Infrastructure Matters in 2026',
        type: 'article' as const,
        platform: 'LinkedIn',
        status: 'draft' as const,
        author: 'sage',
        scheduledDate: null,
        brandScore: null,
        thumbnail: null
    },
    {
        id: '2',
        title: 'NVIDIA GTC Counter-Messaging: Hook #1',
        type: 'post' as const,
        platform: 'X',
        status: 'review' as const,
        author: 'sage',
        scheduledDate: new Date('2026-03-15'),
        brandScore: 72,
        thumbnail: null
    },
    {
        id: '3',
        title: 'Product Demo: AI Accelerator v3',
        type: 'video' as const,
        platform: 'YouTube',
        status: 'approved' as const,
        author: 'sage',
        scheduledDate: new Date('2026-02-01'),
        brandScore: 94,
        thumbnail: null
    },
    {
        id: '4',
        title: 'Enterprise AI: ROI Calculator',
        type: 'article' as const,
        platform: 'Blog',
        status: 'published' as const,
        author: 'sage',
        scheduledDate: new Date('2026-01-05'),
        brandScore: 88,
        thumbnail: null
    },
    {
        id: '5',
        title: 'Q1 2026 Thought Leadership Series',
        type: 'post' as const,
        platform: 'LinkedIn',
        status: 'scheduled' as const,
        author: 'sage',
        scheduledDate: new Date('2026-01-20'),
        brandScore: 85,
        thumbnail: null
    }
];

const typeIcons = {
    article: <FileText className="w-4 h-4" />,
    post: <Edit3 className="w-4 h-4" />,
    video: <Video className="w-4 h-4" />,
    image: <Image className="w-4 h-4" />
};

const statusConfig = {
    draft: { color: 'bg-zinc-500/20 text-zinc-400', label: 'Draft' },
    review: { color: 'bg-amber-500/20 text-amber-400', label: 'In Review' },
    approved: { color: 'bg-emerald-500/20 text-emerald-400', label: 'Approved' },
    scheduled: { color: 'bg-blue-500/20 text-blue-400', label: 'Scheduled' },
    published: { color: 'bg-violet-500/20 text-violet-400', label: 'Published' }
};

function ContentCard({ item }: { item: typeof CONTENT_ITEMS[0] }) {
    const status = statusConfig[item.status];
    const author = AGENT_CONFIGS.find(a => a.id === item.author);

    return (
        <motion.div
            className="p-4 bg-white/5 border border-white/5 rounded-xl hover:border-white/10 transition-colors cursor-pointer group"
            whileHover={{ y: -2 }}
        >
            <div className="flex items-start gap-3">
                <div className="p-2 bg-white/5 rounded-lg text-zinc-400 group-hover:text-white transition-colors">
                    {typeIcons[item.type]}
                </div>
                <div className="flex-1 min-w-0">
                    <h4 className="text-sm font-medium text-white truncate">{item.title}</h4>
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
                <span className={`px-2 py-1 text-[10px] font-medium rounded ${status.color}`}>
                    {status.label}
                </span>
            </div>

            {/* Footer */}
            <div className="flex items-center justify-between mt-4 pt-3 border-t border-white/5">
                <div className="flex items-center gap-2">
                    {author && (
                        <img
                            src={author.avatar}
                            alt={author.name}
                            className="w-5 h-5 rounded-full"
                            title={`Created by ${author.name}`}
                        />
                    )}
                    {item.brandScore && (
                        <div className="flex items-center gap-1">
                            <div className={`w-2 h-2 rounded-full ${item.brandScore >= 80 ? 'bg-emerald-500' : item.brandScore >= 60 ? 'bg-amber-500' : 'bg-rose-500'}`} />
                            <span className="text-[10px] text-zinc-500">{item.brandScore}% brand</span>
                        </div>
                    )}
                </div>
                <button className="opacity-0 group-hover:opacity-100 text-zinc-400 hover:text-white transition-all">
                    <ExternalLink className="w-4 h-4" />
                </button>
            </div>
        </motion.div>
    );
}

import { useMarketingOS } from '../../lib/store';

// ... other imports

export function ContentStudioWorkspace() {
    const { artifacts } = useMarketingOS();
    const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
    const [activeFilter, setActiveFilter] = useState<'all' | 'draft' | 'review' | 'approved' | 'scheduled' | 'published'>('all');

    // Convert store artifacts to display items
    const storeItems = artifacts
        .filter(a => a.type === 'content_draft' || a.type === 'campaign_plan') // simplified filtering
        .map(a => ({
            id: a.artifact_id,
            title: a.title,
            type: (a.type === 'campaign_plan' ? 'article' : 'post') as any, // mapping for display
            platform: 'Blog',
            status: 'draft' as const,
            author: a.agent_id || 'sage',
            scheduledDate: new Date(),
            brandScore: Math.round(a.confidence_score * 100),
            thumbnail: null
        }));

    const allContent = [...storeItems, ...CONTENT_ITEMS];

    const filteredContent = activeFilter === 'all'
        ? allContent
        : allContent.filter(c => c.status === activeFilter);

    const stats = {
        drafts: allContent.filter(c => c.status === 'draft').length,
        inReview: allContent.filter(c => c.status === 'review').length,
        scheduled: allContent.filter(c => c.status === 'scheduled').length
    };

    return (
        <div className="h-full flex flex-col">
            {/* Header */}
            <div className="p-6 border-b border-white/5">
                <div className="flex items-center justify-between mb-4">
                    <div>
                        <h1 className="text-2xl font-instrument-serif text-white">Content Studio</h1>
                        <p className="text-sm text-zinc-500 mt-1">Drafts, assets, and editorial calendar</p>
                    </div>
                    <button className="flex items-center gap-2 px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white text-sm rounded-lg transition-colors">
                        <Plus className="w-4 h-4" /> New Draft
                    </button>
                </div>

                {/* Stats */}
                <div className="flex items-center gap-6 mb-4">
                    <div className="flex items-center gap-2">
                        <Edit3 className="w-4 h-4 text-zinc-400" />
                        <span className="text-sm text-zinc-400">{stats.drafts} drafts</span>
                    </div>
                    <div className="flex items-center gap-2">
                        <Clock className="w-4 h-4 text-amber-400" />
                        <span className="text-sm text-zinc-400">{stats.inReview} in review</span>
                    </div>
                    <div className="flex items-center gap-2">
                        <Calendar className="w-4 h-4 text-blue-400" />
                        <span className="text-sm text-zinc-400">{stats.scheduled} scheduled</span>
                    </div>
                </div>

                {/* Filters and View Toggle */}
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        <Filter className="w-4 h-4 text-zinc-500" />
                        {(['all', 'draft', 'review', 'approved', 'scheduled', 'published'] as const).map(filter => (
                            <button
                                key={filter}
                                onClick={() => setActiveFilter(filter)}
                                className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-colors capitalize ${activeFilter === filter
                                    ? 'bg-white/10 text-white'
                                    : 'text-zinc-500 hover:text-white'
                                    }`}
                            >
                                {filter}
                            </button>
                        ))}
                    </div>
                    <div className="flex items-center gap-1 bg-white/5 rounded-lg p-1">
                        <button
                            onClick={() => setViewMode('grid')}
                            className={`p-1.5 rounded ${viewMode === 'grid' ? 'bg-white/10 text-white' : 'text-zinc-500'}`}
                        >
                            <Grid className="w-4 h-4" />
                        </button>
                        <button
                            onClick={() => setViewMode('list')}
                            className={`p-1.5 rounded ${viewMode === 'list' ? 'bg-white/10 text-white' : 'text-zinc-500'}`}
                        >
                            <List className="w-4 h-4" />
                        </button>
                    </div>
                </div>
            </div>

            {/* Content Grid */}
            <div className="flex-1 overflow-y-auto p-6">
                <div className={viewMode === 'grid' ? 'grid grid-cols-3 gap-4' : 'space-y-3'}>
                    {filteredContent.map(item => (
                        <ContentCard key={item.id} item={item} />
                    ))}
                </div>

                {/* Create New Card */}
                <button className="w-full mt-4 p-6 border border-dashed border-white/10 rounded-xl text-sm text-zinc-500 hover:text-white hover:border-white/20 transition-colors flex items-center justify-center gap-2">
                    <Plus className="w-4 h-4" /> Create New Content
                </button>
            </div>
        </div>
    );
}

export default ContentStudioWorkspace;
