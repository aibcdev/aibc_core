import { useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Inbox, Filter, RefreshCw } from 'lucide-react';
import { useMarketingOS } from '../../lib/store';
import { InboxCard } from './InboxCard';


export function AgentInbox() {
    const inboxItems = useMarketingOS(state => state.inboxItems || []);
    const addToInbox = useMarketingOS(state => state.addToInbox);

    // Filter for only active items (pending)
    const activeItems = inboxItems.filter(item => item.status === 'pending');

    const initialized = useRef(false);

    // Init with some demo data if empty (for verification)
    useEffect(() => {
        if (!initialized.current && inboxItems.length === 0) {
            initialized.current = true;

            // Simulate an incoming market signal
            setTimeout(() => {
                addToInbox({
                    agent_id: 'echo',
                    category: 'market',
                    headline: 'NVIDIA announced GTC keynote focus on inference optimization',
                    subheadline: 'Competitors are positioning cost-efficiency narratives aggressively.',
                    recommended_action: 'Publish response post emphasizing our own inference benchmarks within 48h.',
                    urgency: 'medium',
                    confidence_score: 0.92,
                    status: 'pending',
                    related_artifacts: [],
                    related_signals: [],
                    actions: [
                        { label: 'View Draft', action_type: 'edit' },
                        { label: 'Approve', action_type: 'approve' }
                    ]
                });
            }, 1000);

            // Simulate a content opportunity
            setTimeout(() => {
                addToInbox({
                    agent_id: 'vantage',
                    category: 'opportunity',
                    headline: 'Viral trend detected: "AI fatigue" in enterprise',
                    subheadline: 'Sentiment analysis shows growing skepticism of "magic" AI claims.',
                    recommended_action: 'Launch "Real World AI" campaign focusing on tangible ROI case studies.',
                    urgency: 'high',
                    confidence_score: 0.88,
                    status: 'pending',
                    related_artifacts: [],
                    related_signals: [],
                    actions: [
                        { label: 'Create Campaign', action_type: 'approve' }
                    ]
                });
            }, 2500);
        }
    }, [inboxItems.length, addToInbox]);

    return (
        <div className="h-full flex flex-col">
            {/* Inbox Header */}
            <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-3">
                    <div className="p-2 rounded-lg bg-white/5 border border-white/10">
                        <Inbox className="w-5 h-5 text-white" />
                    </div>
                    <div>
                        <h2 className="text-xl font-semibold text-white">Agent Inbox</h2>
                        <p className="text-sm text-zinc-500">{activeItems.length} items requiring attention</p>
                    </div>
                </div>

                <div className="flex items-center gap-2">
                    <button className="p-2 text-zinc-400 hover:text-white hover:bg-white/5 rounded-lg transition-colors">
                        <Filter className="w-5 h-5" />
                    </button>
                    <button className="p-2 text-zinc-400 hover:text-white hover:bg-white/5 rounded-lg transition-colors">
                        <RefreshCw className="w-5 h-5" />
                    </button>
                </div>
            </div>

            {/* Inbox Stream */}
            <div className="flex-1 overflow-y-auto pr-2 space-y-4 scrollbar-thin scrollbar-thumb-zinc-800 scrollbar-track-transparent">
                <AnimatePresence mode="popLayout">
                    {activeItems.length === 0 ? (
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            className="flex flex-col items-center justify-center py-20 text-zinc-500"
                        >
                            <Inbox className="w-12 h-12 mb-4 opacity-20" />
                            <p>You're all caught up!</p>
                        </motion.div>
                    ) : (
                        activeItems.map(item => (
                            <InboxCard key={item.id} item={item} />
                        ))
                    )}
                </AnimatePresence>
            </div>
        </div>
    );
}
