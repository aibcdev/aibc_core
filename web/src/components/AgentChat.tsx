import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Send } from 'lucide-react';
import { useMarketingOS } from '../lib/store';
import type { AgentId } from '../lib/types/marketing-os';

interface AgentChatProps {
    agentId: AgentId; // Changed from agentName to ID for store lookup
    agentName: string;
    agentAvatar: string;
    sessionId: string; // Required now
}

export function AgentChat({ agentId: _agentId, agentName, agentAvatar, sessionId }: AgentChatProps) {
    const store = useMarketingOS();
    const session = store.chatSessions[sessionId];
    const messages = session?.messages || [];

    const [input, setInput] = useState('');
    const [isTyping, setIsTyping] = useState(false); // Can be driven by agent status later
    const messagesEndRef = useRef<HTMLDivElement>(null);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages]);

    const handleSend = () => {
        if (!input.trim()) return;

        // Optimistic update handled by store immediately
        store.sendMessage(sessionId, input, 'user');
        setInput('');

        // Simple typing simulation for now (store handles real response async)
        setIsTyping(true);
        setTimeout(() => setIsTyping(false), 2000);
    };

    const formatTime = (date: Date) => {
        return new Date(date).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
    };

    return (
        <div className="flex flex-col h-full">
            {/* Messages Area */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
                <AnimatePresence mode="popLayout">
                    {messages.map(message => (
                        <motion.div
                            key={message.id}
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0 }}
                            className={`flex gap-3 ${message.role === 'user' ? 'flex-row-reverse' : ''}`}
                        >
                            {message.role === 'agent' && (
                                <img
                                    src={agentAvatar}
                                    alt={agentName}
                                    className="w-8 h-8 rounded-full object-cover flex-shrink-0"
                                />
                            )}
                            <div className={`
                                max-w-[80%] rounded-2xl px-4 py-3
                                ${message.role === 'user'
                                    ? 'bg-emerald-600 text-white'
                                    : 'bg-white/10 text-zinc-200'
                                }
                            `}>
                                <p className="text-sm leading-relaxed whitespace-pre-wrap">{message.content}</p>
                                <p className={`text-[10px] mt-1 ${message.role === 'user' ? 'text-emerald-200' : 'text-zinc-500'}`}>
                                    {formatTime(message.timestamp)}
                                </p>
                            </div>
                        </motion.div>
                    ))}
                </AnimatePresence>

                {/* Typing Indicator */}
                <AnimatePresence>
                    {isTyping && (
                        <motion.div
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0 }}
                            className="flex items-center gap-3"
                        >
                            <img
                                src={agentAvatar}
                                alt={agentName}
                                className="w-8 h-8 rounded-full object-cover"
                            />
                            <div className="bg-white/10 rounded-2xl px-4 py-3">
                                <div className="flex gap-1">
                                    <span className="w-2 h-2 bg-zinc-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                                    <span className="w-2 h-2 bg-zinc-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                                    <span className="w-2 h-2 bg-zinc-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                                </div>
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>

                <div ref={messagesEndRef} />
            </div>

            {/* Input Area */}
            <div className="p-4 border-t border-white/5">
                <div className="flex items-center gap-2">
                    <input
                        type="text"
                        value={input}
                        onChange={(e) => setInput(e.target.value)}
                        onKeyDown={(e) => e.key === 'Enter' && handleSend()}
                        placeholder={`Message ${agentName}...`}
                        className="flex-1 bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm text-white placeholder:text-zinc-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/50"
                    />
                    <button
                        onClick={handleSend}
                        disabled={!input.trim()}
                        className="p-3 rounded-xl bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                    >
                        <Send className="w-5 h-5 text-white" />
                    </button>
                </div>
            </div>
        </div>
    );
}

export default AgentChat;
