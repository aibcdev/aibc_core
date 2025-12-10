import React, { useState, useEffect } from 'react';
import { ArrowLeft, ScanLine, Zap, Lock, CheckCircle, AlertCircle, Activity } from 'lucide-react';
import { ViewState, NavProps } from '../types';
import { getUserSubscription, SubscriptionTier, canPerformAction } from '../services/subscriptionService';
import Navigation from './shared/Navigation';
import Footer from './shared/Footer';

interface IngestionProps extends NavProps {
  setUsername: (username: string) => void;
  setScanType?: (type: 'basic' | 'deep') => void;
}

// URL validation function
function isValidURL(input: string): boolean {
  try {
    // Remove @ if present
    const cleaned = input.trim().replace(/^@/, '');
    
    // Check if it's a full URL
    if (cleaned.includes('://') || cleaned.includes('.')) {
      const url = cleaned.startsWith('http') ? cleaned : `https://${cleaned}`;
      new URL(url);
      return true;
    }
    
    // Check if it's a domain (has a dot and valid TLD)
    if (cleaned.includes('.') && cleaned.split('.').length >= 2) {
      const parts = cleaned.split('.');
      const tld = parts[parts.length - 1];
      // Basic TLD check (at least 2 characters)
      if (tld.length >= 2 && /^[a-zA-Z]+$/.test(tld)) {
        return true;
      }
    }
    
    return false;
  } catch {
    return false;
  }
}

// Extract domain/username from URL
function extractDomainFromURL(input: string): string {
  try {
    const cleaned = input.trim().replace(/^@/, '');
    
    if (cleaned.includes('://')) {
      const url = new URL(cleaned);
      return url.hostname.replace('www.', '');
    } else if (cleaned.includes('.')) {
      // Assume it's a domain
      return cleaned.replace('www.', '');
    }
    
    return cleaned;
  } catch {
    return input.trim().replace(/^@/, '');
  }
}

const IngestionView: React.FC<IngestionProps> = ({ onNavigate, setUsername, setScanType }) => {
  const [inputVal, setInputVal] = useState('');
  const [isScanning, setIsScanning] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedScanType, setSelectedScanType] = useState<'basic' | 'deep'>('basic');
  const [urlVerification, setUrlVerification] = useState<{
    isVerifying: boolean;
    verified: boolean;
    domain?: string;
    error?: string;
  } | null>(null);
  
  const subscription = getUserSubscription();
  const canUseDeepScan = subscription.tier === SubscriptionTier.PRO || subscription.tier === SubscriptionTier.ENTERPRISE;

  // Verify URL when input changes
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      if (inputVal.trim()) {
        const isValid = isValidURL(inputVal);
        if (isValid) {
          verifyURL(inputVal);
        } else {
          setUrlVerification(null);
        }
      } else {
        setUrlVerification(null);
      }
    }, 500); // Debounce 500ms

    return () => clearTimeout(timeoutId);
  }, [inputVal]);

  const verifyURL = async (input: string) => {
    setUrlVerification({ isVerifying: true, verified: false });
    
    try {
      const domain = extractDomainFromURL(input);
      
      // Simulate verification (in production, this would call an API)
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      setUrlVerification({
        isVerifying: false,
        verified: true,
        domain: domain
      });
    } catch (err: any) {
      setUrlVerification({
        isVerifying: false,
        verified: false,
        error: err.message || 'Could not verify URL'
      });
    }
  };

  const handleNext = async () => {
    if (!inputVal.trim()) return;
    
    // Validate URL
    if (!isValidURL(inputVal)) {
      setError('Please enter a valid URL or domain (e.g., example.com, twitter.com/username)');
      return;
    }
    
    // Check if URL is verified
    if (!urlVerification?.verified) {
      setError('Please wait for URL verification to complete');
      return;
    }
    
    // Check if deep scan is selected but user doesn't have access
    if (selectedScanType === 'deep' && !canUseDeepScan) {
      setError('Deep scan is only available for Pro and Enterprise plans. Upgrade to unlock.');
      return;
    }
    
    setIsScanning(true);
    setError(null);
    
    try {
      // Extract domain/username from URL
      const domain = extractDomainFromURL(inputVal);
      setUsername(domain);
      
      // Store scan type
      if (setScanType) {
        setScanType(selectedScanType);
      }
      localStorage.setItem('lastScanType', selectedScanType);
      
      // Store in localStorage for persistence
      localStorage.setItem('lastScannedUsername', domain);
      
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
    <div id="ingestion-view" className="min-h-screen bg-[#050505] text-white">
      <Navigation onNavigate={onNavigate} />
      <div className="fixed inset-0 z-[70] overflow-y-auto bg-black">
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
                Enter a website URL or domain. Our Agentic System will sweep 10 years of public data to reconstruct your brand DNA.
            </p>

            {/* Input Group */}
            <div className="w-full max-w-lg space-y-4">
                <div className="relative group">
                    {/* Subtle Orange Glow */}
                    <div className="absolute -inset-0.5 bg-gradient-to-r from-orange-500/30 to-red-600/30 rounded-xl opacity-40 blur group-hover:opacity-70 transition duration-500"></div>
                    
                    <div className="relative bg-[#0A0A0A]/90 backdrop-blur-sm rounded-xl border border-white/10 flex items-center h-20 px-4 transition-colors focus-within:border-orange-500/30 shadow-2xl">
                         <input 
                            type="text" 
                            placeholder="example.com or https://example.com" 
                            className="w-full bg-transparent text-center font-mono text-lg text-white placeholder:text-white/30 focus:outline-none tracking-wide caret-orange-500 z-10"
                            value={inputVal}
                            onChange={(e) => {
                              setInputVal(e.target.value);
                              setError(null);
                            }}
                            onKeyDown={handleKeyDown}
                            autoComplete="on"
                         />
                         
                         {/* Enter Badge */}
                         <div className="absolute right-4 top-1/2 -translate-y-1/2 z-20">
                            <span className="text-[10px] font-bold text-white/40 bg-white/5 border border-white/10 px-2 py-1 rounded pointer-events-none">ENTER</span>
                         </div>
                    </div>
                </div>

                {/* URL Verification Modal */}
                {inputVal.trim() && (
                  <div className="mt-2">
                    {urlVerification?.isVerifying && (
                      <div className="p-3 rounded-lg border border-white/10 bg-white/5 flex items-center gap-2 text-white/60 text-sm">
                        <Activity className="w-4 h-4 animate-spin" />
                        <span>Verifying URL...</span>
                      </div>
                    )}
                    
                    {urlVerification && !urlVerification.isVerifying && (
                      <div className={`p-3 rounded-lg border ${
                        urlVerification.verified 
                          ? 'bg-green-500/10 border-green-500/20' 
                          : 'bg-red-500/10 border-red-500/20'
                      }`}>
                        {urlVerification.verified ? (
                          <div className="flex items-center gap-3">
                            <CheckCircle className="w-5 h-5 text-green-400 flex-shrink-0" />
                            <div className="flex-1">
                              <p className="text-sm font-bold text-white">URL Verified</p>
                              <p className="text-xs text-white/60 mt-0.5">Scanning: {urlVerification.domain}</p>
                            </div>
                          </div>
                        ) : (
                          <div className="flex items-center gap-2 text-red-300 text-sm">
                            <AlertCircle className="w-4 h-4 flex-shrink-0" />
                            <span>{urlVerification.error || 'Invalid URL. Please enter a valid website URL or domain.'}</span>
                          </div>
                        )}
                      </div>
                    )}
                    
                    {!isValidURL(inputVal) && inputVal.trim().length > 0 && !urlVerification && (
                      <div className="p-3 rounded-lg border border-amber-500/20 bg-amber-500/10">
                        <div className="flex items-center gap-2 text-amber-300 text-sm">
                          <AlertCircle className="w-4 h-4 flex-shrink-0" />
                          <span>Please enter a valid URL or domain (e.g., example.com, twitter.com/username)</span>
                        </div>
                      </div>
                    )}
                  </div>
                )}

                {/* Scan Type Selection */}
                <div className="flex gap-3 mt-6">
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
                  disabled={!inputVal.trim() || isScanning || !urlVerification?.verified}
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
      <Footer />
    </div>
  );
};

export default IngestionView;
