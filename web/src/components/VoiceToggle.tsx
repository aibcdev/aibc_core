import React, { useState, useEffect } from 'react';

export default function VoiceToggle() {
    const [voiceEnabled, setVoiceEnabled] = useState(true);

    useEffect(() => {
        const saved = localStorage.getItem('aibc_voice_enabled');
        if (saved !== null) {
            setVoiceEnabled(saved === 'true');
        }
    }, []);

    const handleToggle = () => {
        const newState = !voiceEnabled;
        setVoiceEnabled(newState);
        localStorage.setItem('aibc_voice_enabled', String(newState));
        console.log(`[Dashboard] Voice output ${newState ? 'ENABLED' : 'DISABLED'}`);
    };

    return (
        <div className="flex items-center gap-4 p-4 bg-[#0A0A0A]/50 backdrop-blur-md border border-white/5 shadow-neo rounded-xl">
            <div className="flex flex-col gap-1">
                <span className="text-[10px] font-mono font-bold text-white uppercase tracking-widest">
                    Agent Voice Notes
                </span>
                <span className="text-[8px] font-mono text-white/40 uppercase tracking-widest">
                    {voiceEnabled ? 'Human-like responses enabled' : 'Text-only responses'}
                </span>
            </div>

            <button
                onClick={handleToggle}
                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none ${voiceEnabled ? 'bg-[#FF5E1E]' : 'bg-neutral-800'
                    }`}
            >
                <span
                    className={`${voiceEnabled ? 'translate-x-6' : 'translate-x-1'
                        } inline-block h-4 w-4 transform rounded-full bg-white transition-transform`}
                />
            </button>
        </div>
    );
}
