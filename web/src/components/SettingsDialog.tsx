import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Key, Save, AlertTriangle, CheckCircle2 } from 'lucide-react';

interface SettingsDialogProps {
    isOpen: boolean;
    onClose: () => void;
}

export function SettingsDialog({ isOpen, onClose }: SettingsDialogProps) {
    const [geminiKey, setGeminiKey] = useState('');
    const [newsKey, setNewsKey] = useState('');
    const [showGemini, setShowGemini] = useState(false);
    const [status, setStatus] = useState<'idle' | 'saving' | 'saved'>('idle');

    // Load existing keys on mount
    useEffect(() => {
        if (isOpen) {
            const storedGemini = localStorage.getItem('gemini_api_key');
            const storedNews = localStorage.getItem('news_api_key'); // Optional
            if (storedGemini) setGeminiKey(storedGemini);
            if (storedNews) setNewsKey(storedNews);
        }
    }, [isOpen]);

    const handleSave = () => {
        setStatus('saving');

        if (geminiKey.trim()) {
            localStorage.setItem('gemini_api_key', geminiKey.trim());
        } else {
            localStorage.removeItem('gemini_api_key');
        }

        if (newsKey.trim()) {
            localStorage.setItem('news_api_key', newsKey.trim()); // Optional: Update .env logic if needed, but localStorage is easier for runtime
        } else {
            localStorage.removeItem('news_api_key');
        }

        // Simulate a brief delay for UX
        setTimeout(() => {
            setStatus('saved');
            setTimeout(() => {
                setStatus('idle');
                onClose();
                // Force a reload to ensure all clients pick up the new key if needed
                // But mostly they read from localStorage on demand, so a soft refresh is okay.
                // For now, let's just close. The user can refresh if they want deep reset.
                window.location.reload();
            }, 800);
        }, 600);
    };

    return (
        <AnimatePresence>
            {isOpen && (
                <>
                    {/* Backdrop */}
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={onClose}
                        className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50"
                    />

                    {/* Dialog */}
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95, y: 20 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.95, y: 20 }}
                        className="fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-md bg-[#0a0a0a] border border-white/10 rounded-xl shadow-2xl z-50 overflow-hidden"
                    >
                        {/* Header */}
                        <div className="p-6 border-b border-white/5 flex items-center justify-between">
                            <h2 className="text-xl font-instrument-serif text-white flex items-center gap-2">
                                <Key className="w-5 h-5 text-emerald-500" />
                                System Configuration
                            </h2>
                            <button
                                onClick={onClose}
                                className="p-2 hover:bg-white/5 rounded-lg text-zinc-400 hover:text-white transition-colors"
                            >
                                <X className="w-5 h-5" />
                            </button>
                        </div>

                        {/* Body */}
                        <div className="p-6 space-y-6">
                            <div className="p-4 bg-amber-500/10 border border-amber-500/20 rounded-lg flex gap-3 text-sm text-amber-200">
                                <AlertTriangle className="w-5 h-5 shrink-0" />
                                <p>API Keys are stored locally in your browser. They are never sent to our servers.</p>
                            </div>

                            <div className="space-y-4">
                                <div>
                                    <label className="block text-sm font-medium text-zinc-300 mb-2">
                                        Google Gemini API Key <span className="text-emerald-500">*</span>
                                    </label>
                                    <div className="relative">
                                        <input
                                            type={showGemini ? "text" : "password"}
                                            value={geminiKey}
                                            onChange={(e) => setGeminiKey(e.target.value)}
                                            placeholder="AIzaSy..."
                                            className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-2.5 text-white focus:outline-none focus:border-emerald-500 transition-colors"
                                        />
                                        <button
                                            type="button"
                                            onClick={() => setShowGemini(!showGemini)}
                                            className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-zinc-500 hover:text-white"
                                        >
                                            {showGemini ? "Hide" : "Show"}
                                        </button>
                                    </div>
                                    <p className="mt-2 text-xs text-zinc-500">
                                        Required for Agent brains. {' '}
                                        <a href="https://aistudio.google.com/app/apikey" target="_blank" rel="noopener noreferrer" className="text-blue-400 hover:underline">
                                            Get a key here
                                        </a>
                                    </p>
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-zinc-300 mb-2">
                                        NewsAPI Key <span className="text-zinc-500">(Optional)</span>
                                    </label>
                                    <input
                                        type="password"
                                        value={newsKey}
                                        onChange={(e) => setNewsKey(e.target.value)}
                                        placeholder="Optionally enable live news..."
                                        className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-2.5 text-white focus:outline-none focus:border-emerald-500 transition-colors"
                                    />
                                    <p className="mt-2 text-xs text-zinc-500">
                                        Enables real-time market signals. Without this, the system uses simulated data. {' '}
                                        <a href="https://newsdata.io/" target="_blank" rel="noopener noreferrer" className="text-blue-400 hover:underline">
                                            Get a free key
                                        </a>
                                    </p>
                                </div>
                            </div>
                        </div>

                        {/* Footer */}
                        <div className="p-6 border-t border-white/5 flex justify-end gap-3">
                            <button
                                onClick={onClose}
                                className="px-4 py-2 text-sm text-zinc-400 hover:text-white hover:bg-white/5 rounded-lg transition-colors"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={handleSave}
                                disabled={!geminiKey.trim() || status !== 'idle'}
                                className={`
                                    flex items-center gap-2 px-6 py-2 rounded-lg text-sm font-medium text-white transition-all
                                    ${status === 'saved' ? 'bg-emerald-500' : 'bg-gradient-to-r from-emerald-600 to-emerald-500 hover:from-emerald-500 hover:to-emerald-400'}
                                    disabled:opacity-50 disabled:cursor-not-allowed
                                `}
                            >
                                {status === 'saving' ? (
                                    <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                ) : status === 'saved' ? (
                                    <CheckCircle2 className="w-4 h-4" />
                                ) : (
                                    <Save className="w-4 h-4" />
                                )}
                                {status === 'saved' ? 'Saved' : 'Save Configuration'}
                            </button>
                        </div>
                    </motion.div>
                </>
            )}
        </AnimatePresence>
    );
}

export default SettingsDialog;
