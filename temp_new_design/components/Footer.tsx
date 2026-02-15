
import React, { useEffect, useState } from 'react';

const Footer: React.FC = () => {
  const [time, setTime] = useState('');

  useEffect(() => {
    const updateClock = () => {
        const now = new Date();
        setTime(now.toLocaleTimeString('en-US', { hour12: false, hour: '2-digit', minute: '2-digit' }));
    };
    updateClock();
    const interval = setInterval(updateClock, 1000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="border-t border-zinc-900 bg-zinc-950 pt-12 pb-6">
        <div className="max-w-[1800px] mx-auto px-6 md:px-12 flex flex-col md:flex-row justify-between items-center gap-6 mb-12">
            {/* Dynamic Info */}
            <div className="flex items-center gap-2 px-4 py-2 rounded-full border border-zinc-800 bg-zinc-900/50 text-zinc-400 text-sm font-mono">
                <span className="text-white">{time}</span>
                <span className="text-zinc-700">|</span>
                <span>Global</span>
            </div>

            {/* Socials */}
            <div className="flex gap-8 text-sm font-medium uppercase tracking-wide text-zinc-500">
                <a href="#" className="hover:text-white transition-colors">Twitter</a>
                <a href="#" className="hover:text-white transition-colors">LinkedIn</a>
                <a href="#" className="hover:text-white transition-colors">Instagram</a>
            </div>
        </div>

        {/* Marquee Text Footer */}
        <div className="relative w-full overflow-hidden select-none opacity-40 hover:opacity-100 transition-opacity duration-500">
            <div className="marquee-container-text">
                <div className="flex items-center whitespace-nowrap">
                    <span className="text-[12vw] leading-none font-instrument-serif text-zinc-800 px-8">AIBC MEDIA ©</span>
                    <span className="text-[12vw] leading-none font-instrument-serif text-zinc-800 px-8">AIBC MEDIA ©</span>
                </div>
                <div className="flex items-center whitespace-nowrap" aria-hidden="true">
                    <span className="text-[12vw] leading-none font-instrument-serif text-zinc-800 px-8">AIBC MEDIA ©</span>
                    <span className="text-[12vw] leading-none font-instrument-serif text-zinc-800 px-8">AIBC MEDIA ©</span>
                </div>
            </div>
        </div>
    </div>
  );
};

export default Footer;
