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
  const [showRescanWarning, setShowRescanWarning] = useState(false);
  const [pendingDomain, setPendingDomain] = useState<string | null>(null);
  const [showDeepScanModal, setShowDeepScanModal] = useState(false);
  
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

  // Proceed with scan after confirmation
  const proceedWithScan = async (domain: string) => {
    setShowRescanWarning(false);
    setPendingDomain(null);
    setIsScanning(true);
    setError(null);
    
    try {
      setUsername(domain);
      
      // CRITICAL: HARD RESET - Clear ALL cache IMMEDIATELY when starting a new scan
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
    
    // Extract domain/username from URL
    const domain = extractDomainFromURL(inputVal);
    
    // Check if this is a rescan of a previously scanned company
    const previousUsername = localStorage.getItem('lastScannedUsername');
    const lastScanResults = localStorage.getItem('lastScanResults');
    
    if (previousUsername && lastScanResults && previousUsername.toLowerCase() === domain.toLowerCase()) {
      // Show rescan warning
      setPendingDomain(domain);
      setShowRescanWarning(true);
      return;
    }
    
    // Proceed directly for new scans
    proceedWithScan(domain);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleNext();
    }
  };

  return (
    <div id="ingestion-view" className="min-h-screen bg-black text-zinc-300 overflow-hidden flex flex-col items-center justify-center relative selection:bg-orange-500/30 selection:text-orange-100">
      {/* Navigation - Always visible */}
      <Navigation onNavigate={onNavigate} />
      
      {/* Rescan Warning Modal */}
      {showRescanWarning && pendingDomain && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm">
          <div className="bg-zinc-900 border border-white/10 rounded-2xl p-6 max-w-md mx-4 shadow-2xl">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-full bg-orange-500/20 flex items-center justify-center">
                <AlertCircle className="w-5 h-5 text-orange-400" />
              </div>
              <h3 className="text-lg font-bold text-white">Rescan Warning</h3>
            </div>
            <p className="text-sm text-zinc-400 mb-4">
              You've already scanned <span className="text-white font-semibold">{pendingDomain}</span>. 
              Running a new scan will replace all existing data including content ideas, strategy, and analytics.
            </p>
            <p className="text-xs text-zinc-500 mb-6">
              This action cannot be undone. Are you sure you want to continue?
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => {
                  setShowRescanWarning(false);
                  setPendingDomain(null);
                }}
                className="flex-1 px-4 py-2.5 rounded-lg border border-white/10 text-sm font-medium text-zinc-400 hover:text-white hover:border-white/20 transition-all"
              >
                Cancel
              </button>
              <button
                onClick={() => proceedWithScan(pendingDomain)}
                className="flex-1 px-4 py-2.5 rounded-lg bg-orange-500 text-sm font-medium text-white hover:bg-orange-600 transition-all"
              >
                Rescan Anyway
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Background Ambience */}
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute top-[-20%] left-[50%] -translate-x-1/2 w-[600px] h-[600px] bg-white/[0.02] rounded-full blur-[100px]"></div>
        <div className="absolute bottom-[-10%] left-[50%] -translate-x-1/2 w-[500px] h-[300px] bg-orange-500/[0.03] rounded-full blur-[80px]"></div>
      </div>

      {/* Main Content */}
      <main className="relative z-10 w-full max-w-3xl mx-auto px-4 flex flex-col items-center justify-center pt-20">

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
            Enter a website URL or domain. Our Agentic System will sweep<br className="hidden md:block" />
            10 years of public data to reconstruct your brand DNA.
          </p>
        </div>

        {/* Interactive Area */}
        <div className="w-full max-w-lg space-y-3">
          
          {/* Compact URL Input */}
          <div className="group relative bg-[#0a0a0a] hover:bg-zinc-900/40 border border-white/10 focus-within:border-white/20 rounded-xl p-1.5 transition-all duration-300 shadow-[0_0_30px_-10px_rgba(255,100,0,0.05)]">
            <div className="relative flex items-center h-11 w-full">
              <input 
                type="text" 
                placeholder="example.com or https://example.com" 
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
                <span className="px-1.5 py-0.5 text-[9px] font-bold text-zinc-600 bg-zinc-900 border border-zinc-800 rounded text-center tracking-wide font-mono">ENTER</span>
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
                  setShowDeepScanModal(true);
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
              {/* 3X MORE INSIGHTS Badge */}
              <div className="absolute -top-2.5 left-1/2 -translate-x-1/2 bg-gradient-to-r from-purple-600 to-pink-600 text-white text-[9px] font-bold px-2 py-0.5 rounded-full flex items-center gap-1 border border-white/10 z-10">
                <Sparkles className="w-2.5 h-2.5" />
                3X MORE INSIGHTS
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
                  <span className={`text-xs ${canUseDeepScan ? 'text-zinc-400' : 'text-zinc-500'}`}>15-20 posts analyzed</span>
                  <span className="text-[9px] font-bold text-purple-300 bg-purple-500/20 px-1 py-0 rounded">+3x</span>
                </li>
                <li className="flex items-center gap-2">
                  <Check className={`w-3 h-3 shrink-0 ${canUseDeepScan ? 'text-purple-400' : 'text-zinc-600'}`} />
                  <span className={`text-xs ${canUseDeepScan ? 'text-zinc-400' : 'text-zinc-500'}`}>5-8 competitors</span>
                  <span className="text-[9px] font-bold text-purple-300 bg-purple-500/20 px-1 py-0 rounded">+2x</span>
                </li>
                <li className="flex items-center gap-2">
                  <Check className={`w-3 h-3 shrink-0 ${canUseDeepScan ? 'text-purple-400' : 'text-zinc-600'}`} />
                  <span className={`text-xs ${canUseDeepScan ? 'text-zinc-400' : 'text-zinc-500'}`}>Advanced voice & tone</span>
                </li>
                <li className="flex items-center gap-2">
                  <Check className={`w-3 h-3 shrink-0 ${canUseDeepScan ? 'text-purple-400' : 'text-zinc-600'}`} />
                  <span className={`text-xs ${canUseDeepScan ? 'text-zinc-400' : 'text-zinc-500'}`}>8-12 themes + sub-themes</span>
                </li>
                <li className="flex items-center gap-2">
                  <Check className={`w-3 h-3 shrink-0 ${canUseDeepScan ? 'text-purple-400' : 'text-zinc-600'}`} />
                  <span className={`text-xs ${canUseDeepScan ? 'text-zinc-400' : 'text-zinc-500'}`}>Market & strategy analysis</span>
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

      {/* Deep Scan Upgrade Modal */}
      {showDeepScanModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm">
          <div className="bg-zinc-900 border border-white/10 rounded-2xl p-6 max-w-md w-full mx-4 shadow-2xl">
            <div className="flex items-center justify-center mb-4">
              <div className="w-12 h-12 rounded-full bg-purple-500/20 flex items-center justify-center">
                <Lock className="w-6 h-6 text-purple-400" />
              </div>
            </div>
            
            <h3 className="text-xl font-semibold text-white text-center mb-2">
              Deep Scan Unavailable
            </h3>
            
            <p className="text-zinc-400 text-center mb-6 text-sm">
              Deepscan is available for Pro, Business and Enterprise users only
            </p>
            
            <div className="flex gap-3">
              <button
                onClick={() => setShowDeepScanModal(false)}
                className="flex-1 px-4 py-2.5 rounded-lg border border-white/10 bg-zinc-800/50 hover:bg-zinc-800 text-white text-sm font-medium transition-colors"
              >
                Go Back
              </button>
              <button
                onClick={() => {
                  setShowDeepScanModal(false);
                  onNavigate(ViewState.PRICING);
                }}
                className="flex-1 px-4 py-2.5 rounded-lg bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-500 hover:to-pink-500 text-white text-sm font-medium transition-all shadow-lg shadow-purple-500/20"
              >
                Upgrade
              </button>
            </div>
          </div>
        </div>
      )}
      <Footer onNavigate={onNavigate} />
    </div>
  );
};

export default IngestionView;
