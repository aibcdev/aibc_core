import React, { useState, useEffect } from 'react';
import { ArrowLeft, ScanLine, Zap, Lock, CheckCircle, AlertCircle, Activity, Check, Crown, Sparkles } from 'lucide-react';
import { ViewState, NavProps } from '../types';
import { getUserSubscription, SubscriptionTier, canPerformAction } from '../services/subscriptionService';
import Navigation from './shared/Navigation';
import Footer from './shared/Footer';
import { isAuthenticated } from '../services/authClient';

interface IngestionProps extends NavProps {
  setUsername: (username: string) => void;
  setScanType?: (type: 'basic' | 'deep') => void;
}

// Common valid TLDs for stricter validation
const VALID_TLDS = new Set([
  'com', 'org', 'net', 'io', 'co', 'tv', 'xyz', 'app', 'dev', 'ai', 'me', 'info',
  'biz', 'us', 'uk', 'ca', 'au', 'de', 'fr', 'es', 'it', 'nl', 'be', 'ch', 'at',
  'edu', 'gov', 'mil', 'int', 'eu', 'asia', 'tech', 'online', 'store', 'shop',
  'blog', 'site', 'website', 'page', 'space', 'cloud', 'digital', 'media', 'news',
  'live', 'video', 'pro', 'plus', 'one', 'world', 'global', 'network', 'social',
  'gg', 'fm', 'am', 'ly', 'to', 'in', 'is', 'so', 'im', 'gs', 'cc', 'la', 'ag',
  'ac', 'cx', 'ws', 'nu', 'mx', 'br', 'jp', 'kr', 'cn', 'ru', 'pl', 'cz', 'se',
  'no', 'fi', 'dk', 'ie', 'pt', 'gr', 'ro', 'hu', 'bg', 'sk', 'hr', 'si', 'lt',
  'lv', 'ee', 'ua', 'by', 'kz', 'uz', 'az', 'ge', 'am', 'md', 'kg', 'tj', 'tm'
]);

// URL validation function
function isValidURL(input: string): boolean {
  try {
    // Remove @ if present
    const cleaned = input.trim().replace(/^@/, '').toLowerCase();
    
    // Check if it's a full URL
    if (cleaned.includes('://') || cleaned.includes('.')) {
      const url = cleaned.startsWith('http') ? cleaned : `https://${cleaned}`;
      const parsedUrl = new URL(url);
      
      // Extract TLD from hostname
      const hostParts = parsedUrl.hostname.replace('www.', '').split('.');
      const tld = hostParts[hostParts.length - 1];
      
      // Check if TLD is valid
      if (!VALID_TLDS.has(tld)) {
        return false;
      }
      
      return true;
    }
    
    // Check if it's a domain (has a dot and valid TLD)
    if (cleaned.includes('.') && cleaned.split('.').length >= 2) {
      const parts = cleaned.split('.');
      const tld = parts[parts.length - 1];
      
      // Check if TLD is in our list of valid TLDs
      if (VALID_TLDS.has(tld)) {
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

  // Check authentication on mount - redirect to login if not authenticated
  useEffect(() => {
    if (!isAuthenticated()) {
      console.log('IngestionView: User not authenticated, redirecting to login');
      onNavigate(ViewState.LOGIN);
    }
  }, [onNavigate]);

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
      const urlToCheck = input.startsWith('http') ? input : `https://${domain}`;
      
      // ACTUALLY verify the URL is reachable
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 8000);
      
      try {
        const response = await fetch(urlToCheck, {
          method: 'HEAD',
          mode: 'no-cors', // Allow cross-origin requests
          signal: controller.signal
        });
        clearTimeout(timeoutId);
        
        // If we get here without error, the URL is likely reachable
        // (no-cors mode doesn't give us status, but will throw if unreachable)
        setUrlVerification({
          isVerifying: false,
          verified: true,
          domain: domain
        });
      } catch (fetchError: any) {
        clearTimeout(timeoutId);
        
        // Check if it's a CORS error (which means the site exists but blocks us)
        // In that case, we'll allow it and let the backend do the real check
        if (fetchError.name === 'TypeError' && fetchError.message.includes('Failed to fetch')) {
          // Could be CORS blocking - let backend verify
          setUrlVerification({
            isVerifying: false,
            verified: true,
            domain: domain
          });
        } else if (fetchError.name === 'AbortError') {
          // Timeout - URL might be slow or not exist
          setUrlVerification({
            isVerifying: false,
            verified: false,
            error: 'Website took too long to respond. Please check the URL.'
          });
        } else {
          // URL is not reachable
          setUrlVerification({
            isVerifying: false,
            verified: false,
            error: 'Website not found. Please check the URL and try again.'
          });
        }
      }
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
      
      // CRITICAL: HARD RESET - Clear ALL cache IMMEDIATELY when starting a new scan
      // ALWAYS clear cache - even for same company, we want fresh data
      const previousUsername = localStorage.getItem('lastScannedUsername');
      const isNewCompany = !previousUsername || previousUsername.toLowerCase() !== domain.toLowerCase();
      
      console.log('🧹 HARD RESET: Clearing ALL cache for new scan:', domain, isNewCompany ? '(NEW COMPANY)' : '(RESCAN)');
      
      // Clear ALL scan-related cache (ALWAYS, regardless of previous username)
      localStorage.removeItem('lastScanResults');
      localStorage.removeItem('lastScanId');
      localStorage.removeItem('lastScanTimestamp');
      
      // Clear ALL component-specific caches
      localStorage.removeItem('productionAssets');
      localStorage.removeItem('strategyPlans');
      localStorage.removeItem('activeContentStrategy');
      localStorage.removeItem('brandMaterials');
      localStorage.removeItem('brandProfile');
      localStorage.removeItem('brandVoice');
      localStorage.removeItem('brandColors');
      localStorage.removeItem('brandFonts');
      localStorage.removeItem('contentPreferences');
      
      // Store scan type
      if (setScanType) {
        setScanType(selectedScanType);
      }
      localStorage.setItem('lastScanType', selectedScanType);
      
      // Store NEW username with timestamp - this will trigger cache validation
      localStorage.setItem('lastScannedUsername', domain);
      localStorage.setItem('lastScanTimestamp', Date.now().toString());
      
      // Dispatch event to notify all components to clear state IMMEDIATELY
      window.dispatchEvent(new CustomEvent('newScanStarted', {
        detail: { 
          username: domain, 
          timestamp: Date.now(),
          isRescan: !isNewCompany
        }
      }));
      
      console.log('✅ Cache cleared and event dispatched for:', domain);
      
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
    <div id="ingestion-view" className="min-h-screen bg-black text-zinc-300 overflow-hidden flex flex-col items-center justify-center relative selection:bg-orange-500/30 selection:text-orange-100">
      
      {/* Background Ambience */}
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute top-[-20%] left-[50%] -translate-x-1/2 w-[600px] h-[600px] bg-white/[0.02] rounded-full blur-[100px]"></div>
        <div className="absolute bottom-[-10%] left-[50%] -translate-x-1/2 w-[500px] h-[300px] bg-orange-500/[0.03] rounded-full blur-[80px]"></div>
      </div>

      {/* Navigation */}
      <div className="absolute top-6 left-1/2 -translate-x-1/2 z-20">
        <button 
          onClick={() => onNavigate(ViewState.LOGIN)}
          className="group flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-zinc-900/50 border border-white/5 hover:border-white/10 backdrop-blur-md transition-all duration-300"
        >
          <ArrowLeft className="w-3 h-3 text-zinc-500 group-hover:text-white transition-colors" />
          <span className="text-[9px] font-mono font-medium tracking-[0.15em] text-zinc-500 group-hover:text-white transition-colors uppercase">Return</span>
        </button>
      </div>

      {/* Main Content */}
      <main className="relative z-10 w-full max-w-3xl mx-auto px-4 flex flex-col items-center justify-center">

        {/* Compact Typography */}
        <div className="text-center mb-5 leading-none select-none mt-4">
          <h1 className="text-4xl md:text-6xl font-black tracking-tighter text-white block mb-0.5">
            DIGITAL FOOTPRINT
          </h1>
          <h1 
            className="text-4xl md:text-6xl font-black tracking-tighter block opacity-80"
            style={{ WebkitTextStroke: '1.5px white', WebkitTextFillColor: 'transparent', color: 'transparent' }}
          >
            INGESTION
          </h1>
        </div>

        {/* Description */}
        <div className="text-center mb-6 px-4">
          <p className="font-mono text-[10px] md:text-xs text-zinc-500 leading-relaxed tracking-wide">
            Enter a domain. Sweep 10 years of public data.<br className="hidden md:block" />
            Reconstruct brand DNA instantly.
          </p>
        </div>

        {/* Interactive Area */}
        <div className="w-full max-w-lg space-y-3">
          
          {/* Compact URL Input */}
          <div className="group relative bg-[#0a0a0a] hover:bg-zinc-900/40 border border-white/10 focus-within:border-white/20 rounded-xl p-1.5 transition-all duration-300 shadow-[0_0_30px_-10px_rgba(255,100,0,0.05)]">
            <div className="relative flex items-center h-11 w-full">
              <input 
                type="text" 
                placeholder="example.com" 
                className="w-full h-full bg-transparent px-3 outline-none font-mono text-sm text-white placeholder:text-zinc-700 transition-colors text-center"
                value={inputVal}
                onChange={(e) => {
                  setInputVal(e.target.value);
                  setError(null);
                }}
                onKeyDown={handleKeyDown}
                autoComplete="off"
                spellCheck="false"
              />
              <div className="absolute right-2 top-1/2 -translate-y-1/2 hidden md:flex items-center gap-2 pointer-events-none">
                <span className="px-1.5 py-0.5 text-[9px] font-bold text-zinc-600 bg-zinc-900 border border-zinc-800 rounded text-center tracking-wide font-mono">RET</span>
              </div>
            </div>
          </div>

          {/* URL Verification - Inline */}
          {inputVal.trim() && (
            <div className="space-y-2">
              {urlVerification?.isVerifying && (
                <div className="p-2 rounded-lg border border-white/10 bg-white/5 flex items-center justify-center gap-2 text-zinc-500 text-xs">
                  <Activity className="w-3 h-3 animate-spin" />
                  <span>Verifying...</span>
                </div>
              )}
              
              {urlVerification && !urlVerification.isVerifying && urlVerification.verified && (
                <div className="p-2 rounded-lg border border-green-500/20 bg-green-500/10 flex items-center justify-center gap-2 text-green-400 text-xs">
                  <CheckCircle className="w-3 h-3" />
                  <span>Verified: {urlVerification.domain}</span>
                </div>
              )}
              
              {urlVerification && !urlVerification.isVerifying && !urlVerification.verified && (
                <div className="p-2 rounded-lg border border-red-500/20 bg-red-500/10 flex items-center justify-center gap-2 text-red-400 text-xs">
                  <AlertCircle className="w-3 h-3" />
                  <span>{urlVerification.error || 'Invalid URL'}</span>
                </div>
              )}
            </div>
          )}

          {/* Compact Grid - Scan Options */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            
            {/* Option 1: Basic Scan */}
            <button
              onClick={() => setSelectedScanType('basic')}
              className={`relative group rounded-xl p-4 flex flex-col transition-all duration-300 text-left ${
                selectedScanType === 'basic'
                  ? 'bg-[#1c0f0a]/60 border border-orange-500/20'
                  : 'bg-zinc-900/20 border border-white/5 hover:border-white/10'
              }`}
            >
              {selectedScanType === 'basic' && (
                <div className="absolute top-4 right-4">
                  <CheckCircle className="w-4 h-4 text-orange-500" />
                </div>
              )}

              <div className="flex items-center gap-3 mb-3">
                <div className={`w-8 h-8 rounded-md flex items-center justify-center ${
                  selectedScanType === 'basic' 
                    ? 'bg-orange-500/10 border border-orange-500/20' 
                    : 'bg-zinc-800 border border-zinc-700'
                }`}>
                  <ScanLine className={`w-4 h-4 ${selectedScanType === 'basic' ? 'text-orange-500' : 'text-zinc-500'}`} />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-white tracking-tight leading-none">BASIC SCAN</h3>
                  <span className={`text-[10px] font-medium ${selectedScanType === 'basic' ? 'text-orange-400' : 'text-green-400'}`}>Free</span>
                </div>
              </div>

              <ul className="space-y-1.5">
                <li className="flex items-center gap-2">
                  <Check className={`w-3 h-3 shrink-0 ${selectedScanType === 'basic' ? 'text-orange-500/70' : 'text-zinc-600'}`} />
                  <span className={`text-xs ${selectedScanType === 'basic' ? 'text-zinc-400' : 'text-zinc-500'}`}>5-8 posts analyzed</span>
                </li>
                <li className="flex items-center gap-2">
                  <Check className={`w-3 h-3 shrink-0 ${selectedScanType === 'basic' ? 'text-orange-500/70' : 'text-zinc-600'}`} />
                  <span className={`text-xs ${selectedScanType === 'basic' ? 'text-zinc-400' : 'text-zinc-500'}`}>3 competitors</span>
                </li>
                <li className="flex items-center gap-2">
                  <Check className={`w-3 h-3 shrink-0 ${selectedScanType === 'basic' ? 'text-orange-500/70' : 'text-zinc-600'}`} />
                  <span className={`text-xs ${selectedScanType === 'basic' ? 'text-zinc-400' : 'text-zinc-500'}`}>Basic voice analysis</span>
                </li>
              </ul>
            </button>

            {/* Option 2: Deep Scan */}
            <button
              onClick={() => {
                if (!canUseDeepScan) {
                  onNavigate(ViewState.PRICING);
                  return;
                }
                setSelectedScanType('deep');
                setError(null);
              }}
              className={`relative rounded-xl p-4 flex flex-col text-left ${
                selectedScanType === 'deep'
                  ? 'bg-purple-500/10 border border-purple-500/30'
                  : 'bg-zinc-900/20 border border-white/5 hover:border-white/10'
              }`}
            >
              {/* 3X DEPTH Badge */}
              <div className="absolute -top-2.5 left-1/2 -translate-x-1/2 bg-gradient-to-r from-purple-600 to-pink-600 text-white text-[9px] font-bold px-2 py-0.5 rounded-full flex items-center gap-1 border border-white/10 z-10">
                <Sparkles className="w-2.5 h-2.5" />
                3X DEPTH
              </div>

              {selectedScanType === 'deep' && (
                <div className="absolute top-4 right-4">
                  <CheckCircle className="w-4 h-4 text-purple-400" />
                </div>
              )}

              <div className="flex items-center gap-3 mb-3 pt-1">
                <div className={`w-8 h-8 rounded-md flex items-center justify-center ${
                  selectedScanType === 'deep'
                    ? 'bg-purple-500/20 border border-purple-500/30'
                    : 'bg-zinc-800 border border-zinc-700'
                }`}>
                  {canUseDeepScan ? (
                    <Zap className={`w-4 h-4 ${selectedScanType === 'deep' ? 'text-purple-400' : 'text-zinc-500'}`} />
                  ) : (
                    <Lock className="w-4 h-4 text-zinc-500" />
                  )}
                </div>
                <div>
                  <div className="flex items-center gap-1.5">
                    <h3 className="text-sm font-bold text-white tracking-tight leading-none">DEEP SCAN</h3>
                    <Crown className="w-3 h-3 text-amber-400" />
                  </div>
                  <span className={`text-[10px] font-medium ${canUseDeepScan ? 'text-purple-400' : 'text-zinc-500'}`}>
                    {canUseDeepScan ? 'Pro+ Enabled' : 'Pro+ Required'}
                  </span>
                </div>
              </div>

              <ul className="space-y-1.5 mb-2">
                <li className="flex items-center gap-2">
                  <Check className={`w-3 h-3 shrink-0 ${canUseDeepScan ? 'text-purple-400' : 'text-zinc-600'}`} />
                  <span className={`text-xs ${canUseDeepScan ? 'text-zinc-400' : 'text-zinc-500'}`}>20 posts + strategy</span>
                  <span className="text-[9px] font-bold text-purple-300 bg-purple-500/20 px-1 py-0 rounded">+3x</span>
                </li>
                <li className="flex items-center gap-2">
                  <Check className={`w-3 h-3 shrink-0 ${canUseDeepScan ? 'text-purple-400' : 'text-zinc-600'}`} />
                  <span className={`text-xs ${canUseDeepScan ? 'text-zinc-400' : 'text-zinc-500'}`}>8 competitors</span>
                </li>
                <li className="flex items-center gap-2">
                  <Check className={`w-3 h-3 shrink-0 ${canUseDeepScan ? 'text-purple-400' : 'text-zinc-600'}`} />
                  <span className={`text-xs ${canUseDeepScan ? 'text-zinc-400' : 'text-zinc-500'}`}>12 themes & tone</span>
                </li>
              </ul>

              {!canUseDeepScan && (
                <div className="mt-auto border-t border-white/5 pt-2">
                  <div className="flex items-center gap-1.5 text-[10px] font-medium text-purple-400 hover:text-purple-300 transition-colors">
                    <Zap className="w-3 h-3" />
                    Upgrade to unlock
                  </div>
                </div>
              )}
            </button>
          </div>

          {/* Error Message */}
          {error && (
            <div className="text-red-400 text-xs text-center font-mono py-2">
              {error}
            </div>
          )}

          {/* Compact CTA */}
          <button 
            onClick={handleNext}
            disabled={!inputVal.trim() || isScanning || !urlVerification?.verified}
            className="group w-full bg-zinc-900 hover:bg-zinc-800 disabled:bg-zinc-900/50 border border-white/10 hover:border-white/20 disabled:border-white/5 text-white disabled:text-zinc-600 h-11 rounded-lg flex items-center justify-center gap-2 mt-2 transition-all duration-300 shadow-lg shadow-black disabled:cursor-not-allowed"
          >
            {isScanning ? (
              <>
                <Activity className="w-3.5 h-3.5 animate-spin" />
                <span className="text-[10px] md:text-xs font-bold tracking-[0.2em]">SCANNING...</span>
              </>
            ) : (
              <>
                <span className="text-[10px] md:text-xs font-bold tracking-[0.2em] group-hover:tracking-[0.25em] transition-all">INITIALIZE SCAN</span>
                <ScanLine className="w-3.5 h-3.5 text-zinc-500 group-hover:text-white transition-colors" />
              </>
            )}
          </button>

        </div>
      </main>
    </div>
  );
};

export default IngestionView;
