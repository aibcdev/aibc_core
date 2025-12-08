import React, { useState } from 'react';
import { ArrowLeft, ScanLine, Zap, Lock } from 'lucide-react';
import { ViewState, NavProps } from '../types';
import { getUserSubscription, SubscriptionTier, canPerformAction } from '../services/subscriptionService';

interface IngestionProps extends NavProps {
  setUsername: (username: string) => void;
  setScanType?: (type: 'basic' | 'deep') => void;
}

const IngestionView: React.FC<IngestionProps> = ({ onNavigate, setUsername, setScanType }) => {
  const [inputVal, setInputVal] = useState('');
  const [isScanning, setIsScanning] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedScanType, setSelectedScanType] = useState<'basic' | 'deep'>('basic');
  const subscription = getUserSubscription();
  const canUseDeepScan = subscription.tier === SubscriptionTier.PRO || subscription.tier === SubscriptionTier.ENTERPRISE;

  const handleNext = async () => {
    if (!inputVal.trim()) return;
    
    // Check if deep scan is selected but user doesn't have access
    if (selectedScanType === 'deep' && !canUseDeepScan) {
      setError('Deep scan is only available for Pro and Enterprise plans. Upgrade to unlock.');
      return;
    }
    
    setIsScanning(true);
    setError(null);
    
    try {
      // Start the digital footprint scan
      const username = inputVal.trim().replace('@', ''); // Remove @ if present
      setUsername(username);
      
      // Store scan type
      if (setScanType) {
        setScanType(selectedScanType);
      }
      localStorage.setItem('lastScanType', selectedScanType);
      
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
                            autoComplete="on"
                            list="username-suggestions"
                         />
                         <datalist id="username-suggestions">
                           <option value="elonmusk">Elon Musk</option>
                           <option value="mrbeast">MrBeast</option>
                           <option value="garyvee">Gary Vaynerchuk</option>
                           <option value="openai">OpenAI</option>
                           <option value="notion">Notion</option>
                           <option value="nike">Nike</option>
                           <option value="lululemon">Lululemon</option>
                           <option value="goodphats">GoodPhats</option>
                           <option value="dipsea">Dipsea</option>
                           <option value="kobobooks">Kobo Books</option>
                           <option value="lairdsuperfood">Laird Superfood</option>
                         </datalist>
                         
                         {/* Enter Badge */}
                         <div className="absolute right-4 top-1/2 -translate-y-1/2 z-20">
                            <span className="text-[10px] font-bold text-white/40 bg-white/5 border border-white/10 px-2 py-1 rounded pointer-events-none">ENTER</span>
                         </div>
                    </div>
                </div>

                {/* Scan Type Selection */}
                <div className="flex gap-3">
                  <button
                    onClick={() => setSelectedScanType('basic')}
                    className={`flex-1 py-3 px-4 rounded-xl border transition-all ${
                      selectedScanType === 'basic'
                        ? 'bg-gradient-to-r from-orange-500/20 to-red-600/20 border-orange-500/50 text-white'
                        : 'bg-white/5 border-white/10 text-white/60 hover:border-white/20'
                    }`}
                  >
                    <div className="flex items-center justify-center gap-2">
                      <ScanLine className="w-4 h-4" />
                      <span className="text-xs font-bold uppercase">Basic Scan</span>
                    </div>
                    <div className="text-[10px] text-white/40 mt-1">Free</div>
                  </button>
                  
                  <button
                    onClick={() => {
                      if (!canUseDeepScan) {
                        setError('Deep scan requires Pro or Enterprise plan. Please upgrade to unlock.');
                        // Navigate to pricing page
                        setTimeout(() => {
                          onNavigate(ViewState.PRICING);
                        }, 2000);
                        return;
                      }
                      setSelectedScanType('deep');
                      setError(null);
                    }}
                    className={`flex-1 py-3 px-4 rounded-xl border transition-all relative ${
                      selectedScanType === 'deep'
                        ? 'bg-gradient-to-r from-purple-500/20 to-pink-600/20 border-purple-500/50 text-white'
                        : canUseDeepScan
                        ? 'bg-white/5 border-white/10 text-white/60 hover:border-white/20'
                        : 'bg-white/5 border-white/10 text-white/30 opacity-50 cursor-not-allowed'
                    }`}
                    disabled={!canUseDeepScan && selectedScanType !== 'deep'}
                  >
                    <div className="flex items-center justify-center gap-2">
                      {!canUseDeepScan && <Lock className="w-3 h-3" />}
                      <Zap className="w-4 h-4" />
                      <span className="text-xs font-bold uppercase">Deep Scan</span>
                    </div>
                    <div className="text-[10px] text-white/40 mt-1">
                      {canUseDeepScan ? 'Premium • Enhanced Analysis' : 'Pro+ Only'}
                    </div>
                  </button>
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