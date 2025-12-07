import React, { useState } from 'react';
import { ArrowLeft, ScanLine } from 'lucide-react';
import { ViewState, NavProps } from '../types';
import { scanBrandFootprint } from '../services/footprintScanner';

interface IngestionProps extends NavProps {
  setUsername: (username: string) => void;
}

const IngestionView: React.FC<IngestionProps> = ({ onNavigate, setUsername }) => {
  const [inputVal, setInputVal] = useState('');
  const [isScanning, setIsScanning] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleNext = async () => {
    if (!inputVal.trim()) return;
    
    setIsScanning(true);
    setError(null);
    
    try {
      // Start the digital footprint scan
      const username = inputVal.trim().replace('@', ''); // Remove @ if present
      setUsername(username);
      
      // Store in localStorage for persistence
      localStorage.setItem('lastScannedUsername', username);
      
      // Navigate to audit view - scan will start there
      onNavigate(ViewState.AUDIT);
    } catch (err: any) {
      setError(err.message || 'Failed to start scan');
      setIsScanning(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleNext();
    }
  };

  return (
    <div id="ingestion-view" className="fixed inset-0 z-[70] overflow-y-auto bg-black">
      {/* Subtle Orange Glow Background */}
      <div 
        className="absolute inset-0"
        style={{
          background: 'radial-gradient(ellipse at center, rgba(251, 146, 60, 0.15) 0%, rgba(234, 88, 12, 0.08) 40%, transparent 70%)'
        }}
      ></div>
      <div className="absolute inset-0 bg-[#050505] opacity-80"></div>
      
      <div className="min-h-screen flex flex-col items-center justify-center p-6 relative z-10">
        
        {/* Top Nav */}
        <div className="absolute top-12 left-0 right-0 flex flex-col items-center gap-6 z-20">
          <div className="px-4 py-1.5 rounded-full border border-white/20 bg-white/10 backdrop-blur-sm text-[10px] font-mono text-white tracking-widest">
            STEP 02 / 04
          </div>
          
          <button 
            onClick={() => onNavigate(ViewState.LOGIN)} 
            className="group flex items-center gap-2 text-[10px] font-bold tracking-widest text-white/80 hover:text-white transition-colors uppercase backdrop-blur-sm bg-white/5 px-3 py-1.5 rounded-full border border-white/10"
          >
            <ArrowLeft className="w-3 h-3 transition-transform group-hover:-translate-x-1" /> Return
          </button>
        </div>

        {/* Content Center */}
        <div className="w-full max-w-2xl flex flex-col items-center mt-12 relative z-10">
            
            {/* Headers */}
            <h1 className="text-5xl md:text-7xl font-sans font-black tracking-tighter text-white mb-2 text-center uppercase leading-none">
                DIGITAL FOOTPRINT
            </h1>
            <h2 className="text-5xl md:text-7xl font-sans font-black tracking-tighter mb-10 text-center uppercase leading-none" style={{ WebkitTextStroke: '2px rgba(255,255,255,0.8)', WebkitTextFillColor: 'transparent', color: 'transparent' }}>
                INGESTION
            </h2>

            {/* Description */}
            <p className="font-mono text-xs md:text-sm text-white/60 text-center max-w-lg leading-relaxed mb-16">
                Enter primary domain or handle. Our Agentic System will sweep 10 years of public data to reconstruct your brand DNA.
            </p>

            {/* Input Group */}
            <div className="w-full max-w-lg space-y-8">
                <div className="relative group">
                    {/* Subtle Orange Glow */}
                    <div className="absolute -inset-0.5 bg-gradient-to-r from-orange-500/30 to-red-600/30 rounded-xl opacity-40 blur group-hover:opacity-70 transition duration-500"></div>
                    
                    <div className="relative bg-[#0A0A0A]/90 backdrop-blur-sm rounded-xl border border-white/10 flex items-center h-20 px-4 transition-colors focus-within:border-orange-500/30 shadow-2xl">
                         <input 
                            type="text" 
                            placeholder="@USERNAME" 
                            className="w-full bg-transparent text-center font-mono text-2xl text-white placeholder:text-white/30 focus:outline-none uppercase tracking-widest caret-orange-500 z-10"
                            value={inputVal}
                            onChange={(e) => setInputVal(e.target.value)}
                            onKeyDown={handleKeyDown}
                         />
                         
                         {/* Enter Badge */}
                         <div className="absolute right-4 top-1/2 -translate-y-1/2 z-20">
                            <span className="text-[10px] font-bold text-white/40 bg-white/5 border border-white/10 px-2 py-1 rounded pointer-events-none">ENTER</span>
                         </div>
                    </div>
                </div>

                {/* Error Message */}
                {error && (
                  <div className="text-red-400 text-xs text-center font-mono">
                    {error}
                  </div>
                )}

                {/* Action Button */}
                <button 
                  onClick={handleNext} 
                  className="w-full h-14 bg-gradient-to-r from-orange-500/80 to-red-600/80 hover:from-orange-500 hover:to-red-600 disabled:from-white/10 disabled:to-white/5 disabled:cursor-not-allowed text-white font-bold tracking-[0.2em] text-xs uppercase rounded-xl flex items-center justify-center gap-3 transition-all hover:scale-[1.02] active:scale-[0.98] shadow-xl shadow-orange-500/20 disabled:shadow-none border border-white/10"
                  disabled={!inputVal.trim() || isScanning}
                >
                    {isScanning ? (
                      <>
                        <span className="animate-spin">⏳</span> Scanning...
                      </>
                    ) : (
                      <>
                        Scan Digital Footprint <ScanLine className="w-4 h-4" />
                      </>
                    )}
                </button>
            </div>
        </div>
      </div>
    </div>
  );
};

export default IngestionView;