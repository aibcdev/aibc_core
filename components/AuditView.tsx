import React, { useEffect, useState, useRef } from 'react';
import { Network, ArrowRight, CheckCircle, Loader2, AlertCircle, Search, Brain, Database, Target, Sparkles } from 'lucide-react';
import { ViewState, NavProps } from '../types';
import { startScan, pollScanStatus, checkBackendHealth, getScanStatus, getDebugEndpoint } from '../services/apiClient';
import Navigation from './shared/Navigation';

interface AuditProps extends NavProps {
  username: string;
  scanType?: 'basic' | 'deep';
}

interface ScanStage {
  id: string;
  name: string;
  description: string;
  status: 'pending' | 'active' | 'complete' | 'error';
  duration: number; // seconds
  icon: React.ReactNode;
}

interface LogEntry {
  message: string;
  timestamp: string;
}

const AuditView: React.FC<AuditProps> = ({ onNavigate, username, scanType = 'basic' }) => {
  const [logs, setLogs] = useState<LogEntry[]>([]);
  const [showButton, setShowButton] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [progress, setProgress] = useState(0);
  const [currentStageIndex, setCurrentStageIndex] = useState(0);
  const [elapsedTime, setElapsedTime] = useState(0);
  const [estimatedTotal, setEstimatedTotal] = useState(420); // 7 minutes default
  const logsEndRef = useRef<HTMLDivElement>(null);
  const scanStartTime = useRef<number>(Date.now());
  const scanStartedRef = useRef(false);

  const stages: ScanStage[] = [
    { id: 'init', name: 'Initializing', description: 'Setting up scan parameters', status: 'pending', duration: 15, icon: <Network className="w-4 h-4" /> },
    { id: 'twitter', name: 'Scanning X', description: 'Analyzing tweets, threads, and engagement', status: 'pending', duration: 60, icon: <Search className="w-4 h-4" /> },
    { id: 'youtube', name: 'Scanning YouTube', description: 'Processing videos and channel data', status: 'pending', duration: 90, icon: <Search className="w-4 h-4" /> },
    { id: 'linkedin', name: 'Scanning LinkedIn', description: 'Extracting professional content', status: 'pending', duration: 60, icon: <Search className="w-4 h-4" /> },
    { id: 'instagram', name: 'Scanning Instagram', description: 'Analyzing posts and reels', status: 'pending', duration: 60, icon: <Search className="w-4 h-4" /> },
    { id: 'tiktok', name: 'Scanning TikTok', description: 'Analyzing videos and trends', status: 'pending', duration: 60, icon: <Search className="w-4 h-4" /> },
    { id: 'aggregate', name: 'Aggregating Data', description: 'Combining all platform data', status: 'pending', duration: 30, icon: <Database className="w-4 h-4" /> },
    { id: 'brandDNA', name: 'Extracting Brand DNA', description: 'Identifying voice, tone, and patterns', status: 'pending', duration: 45, icon: <Brain className="w-4 h-4" /> },
    { id: 'competitors', name: 'Competitor Analysis', description: 'Researching market position', status: 'pending', duration: 45, icon: <Target className="w-4 h-4" /> },
    { id: 'insights', name: 'Generating Insights', description: 'Creating strategic recommendations', status: 'pending', duration: 30, icon: <Sparkles className="w-4 h-4" /> },
  ];

  const [stageStatuses, setStageStatuses] = useState<ScanStage[]>(stages);

  // Auto-scroll logs
  useEffect(() => {
    logsEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [logs]);

  // Timer
  useEffect(() => {
    const timer = setInterval(() => {
      setElapsedTime(prev => prev + 1);
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  useEffect(() => {
    let mounted = true;
    
    // CRITICAL: Reset scanStartedRef when component mounts or username changes
    // This ensures a new scan can start even if the component was previously mounted
    // Also check if username changed - if so, definitely reset to allow new scan
    const currentUsername = username || localStorage.getItem('lastScannedUsername') || '';
    const lastUsername = localStorage.getItem('lastScanUsernameForRef') || '';
    const usernameChanged = currentUsername && currentUsername !== lastUsername;
    
    if (usernameChanged || !scanStartedRef.current) {
      scanStartedRef.current = false;
      if (currentUsername) {
        localStorage.setItem('lastScanUsernameForRef', currentUsername);
      }
      // #region agent log
      fetch(getDebugEndpoint(),{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'AuditView.tsx:useEffect',message:'RESET scanStartedRef',data:{username,currentUsername,lastUsername,usernameChanged,previousValue:scanStartedRef.current},timestamp:Date.now(),sessionId:'debug-session',runId:'scan-init',hypothesisId:'H19'})}).catch(()=>{});
      // #endregion
    } else {
      // #region agent log
      fetch(getDebugEndpoint(),{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'AuditView.tsx:useEffect',message:'KEEPING scanStartedRef',data:{username,currentUsername,lastUsername,scanStartedRefValue:scanStartedRef.current},timestamp:Date.now(),sessionId:'debug-session',runId:'scan-init',hypothesisId:'H19'})}).catch(()=>{});
      // #endregion
    }
    
    const performScan = async () => {
      // CRITICAL: Also check if username changed - if so, allow scan even if ref is true
      const performScanUsername = username || localStorage.getItem('lastScannedUsername') || '';
      const refUsername = localStorage.getItem('lastScanUsernameForRef') || '';
      const shouldAllowScan = !scanStartedRef.current || (performScanUsername && performScanUsername !== refUsername);
      
      if (!shouldAllowScan) {
        // #region agent log
        fetch(getDebugEndpoint(),{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'AuditView.tsx:performScan',message:'performScan SKIPPED (already started)',data:{usernameProp:username,performScanUsername,refUsername,scanStartedRefValue:scanStartedRef.current,shouldAllowScan},timestamp:Date.now(),sessionId:'debug-session',runId:'scan-init',hypothesisId:'H7'})}).catch(()=>{});
        // #endregion
        return;
      }
      scanStartedRef.current = true;
      if (performScanUsername) {
        localStorage.setItem('lastScanUsernameForRef', performScanUsername);
      }
      // #region agent log
      fetch(getDebugEndpoint(),{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'AuditView.tsx:performScan',message:'SET scanStartedRef to true',data:{usernameProp:username,performScanUsername},timestamp:Date.now(),sessionId:'debug-session',runId:'scan-init',hypothesisId:'H19'})}).catch(()=>{});
      // #endregion

      const scanUsername = username || localStorage.getItem('lastScannedUsername') || '';
      
      // #region agent log
      const logData = {location:'AuditView.tsx:73',message:'performScan STARTED',data:{scanUsername,hasUsername:!!scanUsername,usernameProp:username},timestamp:Date.now(),sessionId:'debug-session',runId:'scan-init',hypothesisId:'H1'};
      console.log('[DEBUG]', logData);
      fetch(getDebugEndpoint(),{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify(logData)}).catch((e)=>console.warn('[DEBUG] Log fetch failed:',e));
      // #endregion
      
      if (!scanUsername) {
        // #region agent log
        fetch(getDebugEndpoint(),{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'AuditView.tsx:79',message:'performScan ERROR - no username',data:{username,lastScannedUsername:localStorage.getItem('lastScannedUsername')},timestamp:Date.now(),sessionId:'debug-session',runId:'scan-init',hypothesisId:'H6'})}).catch(()=>{});
        // #endregion
        setError('No username provided');
        setLogs([`[ERROR] No username provided. Please go back and enter a username.`]);
        setTimeout(() => { if (mounted) setShowButton(true); }, 2000);
        return;
      }
      
      // CRITICAL: HARD RESET - Clear ALL cache IMMEDIATELY when starting new scan
      // ALWAYS clear cache - even for same company, we want fresh data
      console.log('🧹 HARD RESET: Clearing ALL cache before starting new scan for:', scanUsername);
      
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
      
      // Update username and timestamp
      localStorage.setItem('lastScannedUsername', scanUsername);
      localStorage.setItem('lastScanTimestamp', Date.now().toString());
      
      // Dispatch event to notify all components to clear state IMMEDIATELY
      // NOTE: We already cleared localStorage above, so we don't need clearAll here
      // The dashboard will ignore this event since clearAll is not set
      window.dispatchEvent(new CustomEvent('newScanStarted', {
        detail: { username: scanUsername, timestamp: Date.now(), clearAll: false, isRescan: false }
      }));
      
      console.log('✅ HARD RESET complete - all cache cleared for:', scanUsername);

      // Calculate estimated time (5-10 minutes)
      const totalEstimate = stages.reduce((sum, s) => sum + s.duration, 0);
      setEstimatedTotal(totalEstimate);

      try {
        // Stage 1: Initializing
        updateStageStatus(0, 'active');
        addLog(`[SYSTEM] Initializing Digital Footprint Scanner...`);
        addLog(`[SYSTEM] Target: ${scanUsername}`);
        await delay(2000);
        addLog(`[SYSTEM] Platforms: twitter, youtube, linkedin, instagram`);
        await delay(1500);
        addLog(`[SYSTEM] Scan Type: standard`);
        await delay(1500);

        const platforms = ['twitter', 'youtube', 'linkedin', 'instagram'];
        
        addLog(`[SYSTEM] Connecting to backend services...`);
        
        // Check backend health first with timeout
        // NOTE: Prefer 127.0.0.1 over localhost to avoid IPv6 (::1) resolution issues in browsers.
        const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://127.0.0.1:3001';
        addLog(`[SYSTEM] Connecting to backend: ${API_BASE_URL}`);
        
        // Add timeout wrapper for health check with instrumentation
        // #region agent log
        fetch(getDebugEndpoint(),{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'AuditView.tsx:158',message:'BEFORE HEALTH CHECK',data:{scanUsername,API_BASE_URL},timestamp:Date.now(),sessionId:'debug-session',runId:'scan-init',hypothesisId:'H1'})}).catch(()=>{});
        // #endregion
        
        const healthCheckStartTime = Date.now();
        const healthCheckPromise = checkBackendHealth().then(result => {
          // #region agent log
          fetch(getDebugEndpoint(),{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'AuditView.tsx:162',message:'HEALTH CHECK RESOLVED',data:{healthy:result.healthy,message:result.message,elapsed:Date.now()-healthCheckStartTime},timestamp:Date.now(),sessionId:'debug-session',runId:'scan-init',hypothesisId:'H1'})}).catch(()=>{});
          // #endregion
          return result;
        }).catch(err => {
          // #region agent log
          fetch(getDebugEndpoint(),{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'AuditView.tsx:166',message:'HEALTH CHECK ERROR',data:{error:err?.message,elapsed:Date.now()-healthCheckStartTime},timestamp:Date.now(),sessionId:'debug-session',runId:'scan-init',hypothesisId:'H2'})}).catch(()=>{});
          // #endregion
          return { healthy: false, message: err?.message || 'Health check failed' };
        });
        
        const timeoutPromise = new Promise<{ healthy: boolean; message?: string }>((resolve) => {
          setTimeout(() => {
            // #region agent log
            fetch(getDebugEndpoint(),{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'AuditView.tsx:172',message:'HEALTH CHECK TIMEOUT',data:{elapsed:Date.now()-healthCheckStartTime},timestamp:Date.now(),sessionId:'debug-session',runId:'scan-init',hypothesisId:'H1'})}).catch(()=>{});
            // #endregion
            resolve({ healthy: false, message: 'Health check timed out after 6 seconds' });
          }, 6000);
        });
        
        // #region agent log
        fetch(getDebugEndpoint(),{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'AuditView.tsx:177',message:'AWAITING HEALTH CHECK RACE',data:{},timestamp:Date.now(),sessionId:'debug-session',runId:'scan-init',hypothesisId:'H1'})}).catch(()=>{});
        // #endregion
        
        const healthCheck = await Promise.race([healthCheckPromise, timeoutPromise]);
        
        // #region agent log
        fetch(getDebugEndpoint(),{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'AuditView.tsx:182',message:'HEALTH CHECK RACE COMPLETE',data:{healthy:healthCheck.healthy,message:healthCheck.message,elapsed:Date.now()-healthCheckStartTime},timestamp:Date.now(),sessionId:'debug-session',runId:'scan-init',hypothesisId:'H1'})}).catch(()=>{});
        // #endregion
        
        if (!healthCheck.healthy) {
          addLog(`[WARNING] Backend health check: ${healthCheck.message || 'Network error'}`);
          addLog(`[WARNING] Backend URL: ${API_BASE_URL}`);
          addLog(`[WARNING] Continuing scan attempt, but backend connection may fail...`);
          // Don't return - continue with scan attempt (it will fail if backend is down)
        } else {
          addLog(`[SYSTEM] Backend connection verified`);
        }
        
        // Get scan type from localStorage or prop (MUST be declared before use in logs)
        const finalScanType = scanType || localStorage.getItem('lastScanType') || 'basic';
        const scanTypeParam = finalScanType === 'deep' ? 'deep' : 'standard';
        
        // #region agent log
        fetch(getDebugEndpoint(),{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'AuditView.tsx:194',message:'BEFORE START SCAN API CALL',data:{scanUsername,platforms:platforms.length,scanTypeParam},timestamp:Date.now(),sessionId:'debug-session',runId:'scan-init',hypothesisId:'H2'})}).catch(()=>{});
        // #endregion
        
        addLog(`[SYSTEM] Scan mode: ${finalScanType.toUpperCase()}${finalScanType === 'deep' ? ' - Enhanced Analysis' : ''}`);
        
        let scanResponse: any = null;
        let backendDownTimeout: NodeJS.Timeout | null = null;
        const startScanStartTime = Date.now();
        try {
          // #region agent log
          fetch(getDebugEndpoint(),{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'AuditView.tsx:200',message:'CALLING startScan API',data:{scanUsername,platforms:platforms.length,scanTypeParam},timestamp:Date.now(),sessionId:'debug-session',runId:'scan-init',hypothesisId:'H2'})}).catch(()=>{});
          // #endregion
          scanResponse = await startScan(scanUsername, platforms, scanTypeParam);
          // #region agent log
          fetch(getDebugEndpoint(),{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'AuditView.tsx:203',message:'startScan API RETURNED',data:{success:scanResponse?.success,hasScanId:!!scanResponse?.scanId,elapsed:Date.now()-startScanStartTime},timestamp:Date.now(),sessionId:'debug-session',runId:'scan-init',hypothesisId:'H2'})}).catch(()=>{});
          // #endregion
        } catch (fetchError: any) {
          // #region agent log
          fetch(getDebugEndpoint(),{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'AuditView.tsx:206',message:'startScan API ERROR',data:{error:fetchError?.message,errorName:fetchError?.name,elapsed:Date.now()-startScanStartTime},timestamp:Date.now(),sessionId:'debug-session',runId:'scan-init',hypothesisId:'H3'})}).catch(()=>{});
          // #endregion
          // Handle network errors specifically - catch ALL backend connection errors
          const errorMsg = (fetchError?.message || '').toLowerCase();
          const errorName = fetchError?.name || '';
          
          // Check for any backend connection error indicators
          const isBackendError = 
            errorMsg.includes('fetch') || 
            errorMsg.includes('network') || 
            errorMsg.includes('failed to fetch') || 
            errorMsg.includes('load failed') ||
            errorMsg.includes('cannot connect') ||
            errorMsg.includes('backend server') ||
            errorMsg.includes('connection') ||
            errorName === 'TypeError' || 
            errorName === 'NetworkError' ||
            errorName === 'AbortError';
          
          if (isBackendError) {
            addLog(`[ERROR] Cannot connect to backend server`);
            addLog(`[ERROR] Please ensure the backend server is running on ${API_BASE_URL}`);
            addLog(`[ERROR] Start the backend with: cd backend && npm run dev`);
            addLog(`[ERROR] Scan cannot proceed without backend connection.`);
            // Do NOT enable PROCEED button - scan must complete successfully
            // #region agent log
            fetch(getDebugEndpoint(),{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'AuditView.tsx:backendDown',message:'BACKEND DOWN - NOT ENABLING PROCEED',data:{mounted,errorMsg,errorName},timestamp:Date.now(),sessionId:'debug-session',runId:'scan-init',hypothesisId:'H3'})}).catch(()=>{});
            // #endregion
            // Do NOT return - let the error propagate so user sees the error
            // The scan will fail and user will understand they need to start backend
            throw fetchError;
          }
          throw fetchError;
        }
        
        if (!scanResponse || !scanResponse.success || !scanResponse.scanId) {
          // #region agent log
          fetch(getDebugEndpoint(),{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'AuditView.tsx:scanResponseInvalid',message:'SCAN RESPONSE INVALID',data:{hasResponse:!!scanResponse,success:scanResponse?.success,hasScanId:!!scanResponse?.scanId,error:scanResponse?.error},timestamp:Date.now(),sessionId:'debug-session',runId:'scan-init',hypothesisId:'H4'})}).catch(()=>{});
          // #endregion
          addLog(`[ERROR] Failed to start scan: ${scanResponse?.error || 'Unknown error'}`);
          addLog(`[ERROR] Scan cannot proceed without a valid scan ID.`);
          // Do NOT enable PROCEED button - scan must complete successfully
          // Throw error so it's caught by outer catch block
          throw new Error(scanResponse?.error || 'Failed to start scan - no scan ID received');
        }

        const scanId = scanResponse.scanId;
        addLog(`[SYSTEM] Scan ID: ${scanId}`);
        // Persist scanId immediately so Dashboard can recover even if user navigates away early
        localStorage.setItem('lastScanId', scanId);
        // #region agent log
        fetch(getDebugEndpoint(),{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'AuditView.tsx:scanId',message:'Stored lastScanId immediately',data:{scanUsername,scanId},timestamp:Date.now(),sessionId:'debug-session',runId:'scan-init',hypothesisId:'H7'})}).catch(()=>{});
        // #endregion
        await delay(1000);
        updateStageStatus(0, 'complete');
        setProgress(5);

        // Start polling but also show progressive UI
        let scanComplete = false;
        let scanResults: any = null;

        // Track which platforms were actually scanned (from backend logs)
        const scannedPlatforms = new Set<string>();
        
        // Background poll - use REAL backend logs
        pollScanStatus(scanId, (status) => {
          // #region agent log
          fetch(getDebugEndpoint(),{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'AuditView.tsx:262',message:'POLL CALLBACK FIRED',data:{scanId,status:status?.status,progress:status?.progress,logsCount:status?.logs?.length||0,mounted},timestamp:Date.now(),sessionId:'debug-session',runId:'poll-callback',hypothesisId:'H11'})}).catch(()=>{});
          // #endregion
          if (!mounted) return;
          if (status.status === 'complete') {
            // #region agent log
            fetch(getDebugEndpoint(),{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'AuditView.tsx:264',message:'SCAN COMPLETE DETECTED IN CALLBACK',data:{scanId},timestamp:Date.now(),sessionId:'debug-session',runId:'poll-callback',hypothesisId:'H11'})}).catch(()=>{});
            // #endregion
            scanComplete = true;
          }
          if (status.logs) {
            // Parse backend logs to determine which platforms were actually scanned
            status.logs.forEach((log: string) => {
              const logLower = log.toLowerCase();
              if (logLower.includes('[success]') && logLower.includes('profile found')) {
                // Extract platform from log
                if (logLower.includes('twitter') || logLower.includes('x')) {
                  if (!scannedPlatforms.has('twitter')) {
                    scannedPlatforms.add('twitter');
                    addLog(`[SUCCESS] Twitter/X profile found and scanned`);
                  }
                }
                if (logLower.includes('youtube')) {
                  if (!scannedPlatforms.has('youtube')) {
                    scannedPlatforms.add('youtube');
                    addLog(`[SUCCESS] YouTube profile found and scanned`);
                  }
                }
                if (logLower.includes('linkedin')) {
                  if (!scannedPlatforms.has('linkedin')) {
                    scannedPlatforms.add('linkedin');
                    addLog(`[SUCCESS] LinkedIn profile found and scanned`);
                  }
                }
                if (logLower.includes('instagram')) {
                  if (!scannedPlatforms.has('instagram')) {
                    scannedPlatforms.add('instagram');
                    addLog(`[SUCCESS] Instagram profile found and scanned`);
                  }
                }
              }
              // Also check for skip messages
              if (logLower.includes('[skip]') || logLower.includes('[warning]')) {
                // Platform was skipped - log it
                if ((logLower.includes('twitter') || logLower.includes('x')) && !scannedPlatforms.has('twitter')) {
                  addLog(`[SKIP] Twitter/X profile not found - skipping`);
                }
                if (logLower.includes('youtube') && !scannedPlatforms.has('youtube')) {
                  addLog(`[SKIP] YouTube profile not found - skipping`);
                }
                if (logLower.includes('linkedin') && !scannedPlatforms.has('linkedin')) {
                  addLog(`[SKIP] LinkedIn profile not found - skipping`);
                }
                if (logLower.includes('instagram') && !scannedPlatforms.has('instagram')) {
                  addLog(`[SKIP] Instagram profile not found - skipping`);
                }
              }
            });
            
            // Update stages based on actual platforms scanned
            if (scannedPlatforms.size > 0) {
              setStageStatuses(prevStages => {
                return prevStages.map(stage => {
                  // Skip platform stages that weren't actually scanned
                  if (stage.id === 'twitter' && !scannedPlatforms.has('twitter')) {
                    return { ...stage, status: 'error' as const };
                  }
                  if (stage.id === 'youtube' && !scannedPlatforms.has('youtube')) {
                    return { ...stage, status: 'error' as const };
                  }
                  if (stage.id === 'linkedin' && !scannedPlatforms.has('linkedin')) {
                    return { ...stage, status: 'error' as const };
                  }
                  if (stage.id === 'instagram' && !scannedPlatforms.has('instagram')) {
                    return { ...stage, status: 'error' as const };
                  }
                  return stage;
                });
              });
            }
          }
        }).then(results => {
          // #region agent log
          fetch(getDebugEndpoint(),{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'AuditView.tsx:338',message:'POLL PROMISE RESOLVED',data:{scanId,success:results.success,hasData:!!results.data,dataKeys:results.data?Object.keys(results.data):[],mounted},timestamp:Date.now(),sessionId:'debug-session',runId:'poll-resolve',hypothesisId:'H11'})}).catch(()=>{});
          // #endregion
          if (results.success && results.data) {
            scanResults = results.data;
            // Store complete scan results with username for validation
            // Store results with timestamp for cache validation
            const scanResultsWithUsername = {
              ...results.data,
              scanUsername: scanUsername,
              username: scanUsername,
              timestamp: Date.now(),
              scanTimestamp: Date.now(),
              lastUpdated: new Date().toISOString()
            };
            try {
              localStorage.setItem('lastScanResults', JSON.stringify(scanResultsWithUsername));
              // #region agent log
              fetch(getDebugEndpoint(),{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'AuditView.tsx:272',message:'localStorage WRITE - lastScanResults',data:{scanUsername,hasResults:!!scanResultsWithUsername,resultsSize:JSON.stringify(scanResultsWithUsername).length},timestamp:Date.now(),sessionId:'debug-session',runId:'scan-complete',hypothesisId:'H5'})}).catch(()=>{});
              // #endregion
              // Store username, scan ID, and timestamp for dashboard loading
              // CRITICAL: Update timestamp to match the completion time, not the start time
              // This ensures timestamp validation in dashboard works correctly
              const completionTimestamp = Date.now().toString();
              localStorage.setItem('lastScannedUsername', scanUsername);
              localStorage.setItem('lastScanTimestamp', completionTimestamp);
              if (scanId) {
                localStorage.setItem('lastScanId', scanId);
              }
              // #region agent log
              fetch(getDebugEndpoint(),{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'AuditView.tsx:293',message:'localStorage TIMESTAMP UPDATED',data:{scanUsername,completionTimestamp,cachedTimestamp:scanResultsWithUsername.timestamp},timestamp:Date.now(),sessionId:'debug-session',runId:'scan-complete',hypothesisId:'H5'})}).catch((e)=>console.warn('[DEBUG] Log fetch failed:',e));
              // #endregion
              // #region agent log
              fetch(getDebugEndpoint(),{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'AuditView.tsx:279',message:'localStorage WRITE - all keys',data:{scanUsername,scanId,timestamp:Date.now().toString()},timestamp:Date.now(),sessionId:'debug-session',runId:'scan-complete',hypothesisId:'H5'})}).catch(()=>{});
              // #endregion
              addLog(`[SUCCESS] Scan results stored for ${scanUsername}`);
            } catch (storageError: any) {
              // #region agent log
              fetch(getDebugEndpoint(),{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'AuditView.tsx:283',message:'localStorage WRITE ERROR',data:{error:storageError?.message||'unknown',scanUsername},timestamp:Date.now(),sessionId:'debug-session',runId:'scan-complete',hypothesisId:'H5'})}).catch(()=>{});
              // #endregion
              console.error('Failed to store scan results:', storageError);
              addLog(`[WARNING] Failed to store scan results: ${storageError.message}`);
            }
            
            // Dispatch event to notify dashboard of new scan completion
            // #region agent log
            fetch(getDebugEndpoint(),{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'AuditView.tsx:287',message:'DISPATCHING scanComplete EVENT',data:{scanUsername,scanId,hasBrandDNA:!!scanResultsWithUsername.brandDNA,brandDNAKeys:scanResultsWithUsername.brandDNA?Object.keys(scanResultsWithUsername.brandDNA):[],hasInsights:!!scanResultsWithUsername.strategicInsights,insightsCount:scanResultsWithUsername.strategicInsights?.length||0,hasCompetitors:!!scanResultsWithUsername.competitorIntelligence,competitorsCount:scanResultsWithUsername.competitorIntelligence?.length||0,resultKeys:Object.keys(scanResultsWithUsername)},timestamp:Date.now(),sessionId:'debug-session',runId:'scan-complete',hypothesisId:'H1'})}).catch(()=>{});
            // #endregion
            const event = new CustomEvent('scanComplete', {
              detail: {
                username: scanUsername,
                scanId: scanId,
                results: scanResultsWithUsername
              }
            });
            window.dispatchEvent(event);
            console.log('📢 Dispatched scanComplete event for:', scanUsername);
            // Only allow proceeding AFTER we have real results stored/dispatched
            if (mounted) {
              setShowButton(true);
              // #region agent log
              fetch(getDebugEndpoint(),{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'AuditView.tsx:scanComplete',message:'Proceed ENABLED (real results ready)',data:{scanUsername,scanId},timestamp:Date.now(),sessionId:'debug-session',runId:'scan-complete',hypothesisId:'H7'})}).catch(()=>{});
              // #endregion
            }
          } else {
            // Scan completed but no results - do NOT enable PROCEED button
            // User must wait for scan to complete successfully
            addLog(`[WARNING] Scan completed but no results available. Please wait for scan to complete.`);
            // Do NOT enable proceed button - scan must complete successfully
          }
        }).catch(err => {
          // #region agent log
          fetch(getDebugEndpoint(),{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'AuditView.tsx:292',message:'pollScanStatus ERROR',data:{error:err?.message||'unknown',scanId},timestamp:Date.now(),sessionId:'debug-session',runId:'scan-poll',hypothesisId:'H4'})}).catch(()=>{});
          // #endregion
          console.error('Background poll error:', err);
          addLog(`[ERROR] Scan encountered an error: ${err.message}`);
          addLog(`[ERROR] Scan must complete successfully before proceeding. Please try again.`);
          // Do NOT enable proceed button on error - scan must complete successfully
        });
        
        // REMOVED: Safety timeout that enables proceed button
        // PROCEED button should ONLY appear when scan completes successfully with results
        
        // REMOVED: Do not enable PROCEED button when backend is down
        // User must wait for scan to complete successfully - no shortcuts
        // If backend is down, scan will fail and user will see error message
        // PROCEED button should ONLY appear when scan completes successfully with results
        
        // Cleanup on unmount
        return () => {
          // No timeouts to clear - we removed the safety timeouts
        };

        // Platform stages are now dynamic - only show if platform was actually scanned
        // The backend logs will determine which platforms exist
        // pollScanStatus callback above handles all log parsing and platform detection
        updateStageStatus(1, 'active');
        addLog(`[SCANNER] Scanning available platforms...`);
        
        // Wait for initial platform scanning (pollScanStatus handles the actual polling)
        await delay(20000);
        updateStageStatus(1, 'complete');
        setProgress(40);

        // Stage 6: Aggregating
        updateStageStatus(5, 'active');
        addLog(`[ANALYSIS] Aggregating cross-platform data...`);
        await delay(4000);
        addLog(`[ANALYSIS] Normalizing engagement metrics...`);
        await delay(3000);
        addLog(`[ANALYSIS] Building unified content profile...`);
        await delay(4000);
        addLog(`[SUCCESS] Data aggregation complete`);
        updateStageStatus(5, 'complete');
        setProgress(78);

        // Stage 7: Brand DNA
        updateStageStatus(6, 'active');
        addLog(`[DNA] Extracting brand voice patterns...`);
        await delay(5000);
        addLog(`[DNA] Analyzing tone and writing style...`);
        await delay(4000);
        addLog(`[DNA] Identifying core content pillars...`);
        await delay(4000);
        addLog(`[DNA] Mapping brand archetype...`);
        await delay(4000);
        addLog(`[SUCCESS] Brand DNA extraction complete`);
        updateStageStatus(6, 'complete');
        setProgress(88);

        // Stage 8: Competitor Analysis
        updateStageStatus(7, 'active');
        addLog(`[INTEL] Identifying market competitors...`);
        await delay(4000);
        addLog(`[INTEL] Analyzing competitor content strategies...`);
        await delay(5000);
        addLog(`[INTEL] Calculating market positioning...`);
        await delay(4000);
        addLog(`[INTEL] Identifying competitive advantages...`);
        await delay(3000);
        addLog(`[SUCCESS] Competitor intelligence gathered - 3 key competitors identified`);
        updateStageStatus(7, 'complete');
        setProgress(95);

        // Stage 9: Generating Insights
        updateStageStatus(8, 'active');
        addLog(`[INSIGHTS] Generating strategic recommendations...`);
        await delay(4000);
        addLog(`[INSIGHTS] Creating content suggestions...`);
        await delay(3000);
        addLog(`[INSIGHTS] Finalizing audit report...`);
        await delay(3000);
        addLog(`[SUCCESS] Strategic insights generated`);
        updateStageStatus(8, 'complete');
        setProgress(100);

        // UI stages finished, but do NOT allow Proceed until backend confirms completion and results are stored.
        // CRITICAL: Do NOT enable PROCEED button here - wait for scanComplete event with real results
        addLog(`[SYSTEM] UI stages complete. Waiting for backend scan completion...`);
        // #region agent log
        fetch(getDebugEndpoint(),{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'AuditView.tsx:uiComplete',message:'UI stages complete (waiting for backend)',data:{scanUsername,lastScanId:localStorage.getItem('lastScanId')},timestamp:Date.now(),sessionId:'debug-session',runId:'scan-ui',hypothesisId:'H7'})}).catch(()=>{});
        // #endregion
        // DO NOT set showButton here - it will be set only when scanComplete event fires with real results

      } catch (err: any) {
        console.error('Scan error:', err);
        if (mounted) {
          const errorMsg = err.message || 'Failed to start scan';
          setError(errorMsg);
          addLog(`[ERROR] ${errorMsg}`);
          addLog(`[ERROR] Scan cannot proceed without backend connection.`);
          addLog(`[ERROR] Please ensure the backend server is running on http://localhost:3001`);
          addLog(`[ERROR] Start the backend with: cd backend && npm run dev`);
          // Do NOT enable proceed button on error - scan must complete successfully
          // #region agent log
          fetch(getDebugEndpoint(),{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'AuditView.tsx:outerCatch',message:'OUTER CATCH - NOT ENABLING PROCEED',data:{mounted,errorMsg},timestamp:Date.now(),sessionId:'debug-session',runId:'scan-error',hypothesisId:'H6'})}).catch(()=>{});
          // #endregion
        }
      }
    };

    const addLog = (message: string) => {
      // Use time relative to scan start, not current wall-clock time
      const now = new Date();
      const timestamp = now.toLocaleTimeString('en-US', { 
        hour: '2-digit', 
        minute: '2-digit', 
        second: '2-digit',
        hour12: false 
      });
      setLogs(prev => [...prev, { message, timestamp }]);
    };

    const updateStageStatus = (index: number, status: 'pending' | 'active' | 'complete' | 'error') => {
      setCurrentStageIndex(index);
      setStageStatuses(prev => prev.map((s, i) => 
        i === index ? { ...s, status } : s
      ));
    };

    const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

    performScan();

    return () => { 
      // #region agent log
      fetch(getDebugEndpoint(),{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'AuditView.tsx:cleanup',message:'useEffect CLEANUP',data:{mounted,username},timestamp:Date.now(),sessionId:'debug-session',runId:'scan-cleanup',hypothesisId:'H2'})}).catch(()=>{});
      // #endregion
      mounted = false;
      // CRITICAL: Reset scanStartedRef on cleanup so new scans can start
      scanStartedRef.current = false;
      // #region agent log
      fetch(getDebugEndpoint(),{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'AuditView.tsx:cleanup',message:'RESET scanStartedRef on cleanup',data:{username},timestamp:Date.now(),sessionId:'debug-session',runId:'scan-cleanup',hypothesisId:'H19'})}).catch(()=>{});
      // #endregion
      // pollScanStatus handles its own cleanup, no manual interval needed
    };
  }, [username]);

  return (
    <div className="fixed inset-0 z-[80] bg-[#030303] overflow-hidden">
      {/* Navigation - Always visible */}
      <Navigation onNavigate={onNavigate} />
      
      <div className="h-full flex flex-col pt-16">
        
        {/* Top Bar - Fixed - Mobile Optimized */}
        <div className="flex-shrink-0 border-b border-white/5 bg-[#030303]">
          <div className="max-w-6xl mx-auto px-4 md:px-6 py-3 md:py-4">
            {/* Mobile: Stack vertically, Desktop: Horizontal */}
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3 md:gap-0">
              {/* Top row on mobile: Step + Timer */}
              <div className="flex items-center justify-between md:justify-start md:gap-6">
                <div className="px-2 md:px-3 py-1 rounded-full border border-white/10 bg-white/5 text-[10px] font-bold text-white/40 tracking-widest">
                  STEP 03 / 04
                </div>
                {/* Timer - visible on mobile in top row */}
                <div className="text-center md:hidden">
                  <div className="text-xl font-black text-white tracking-tight">{formatTime(elapsedTime)}</div>
                  <div className="text-[8px] text-white/30 uppercase tracking-widest">Elapsed</div>
                </div>
                {/* Desktop progress bar */}
                <div className="hidden md:flex items-center gap-3">
                  <div className="w-48 h-1.5 bg-white/5 rounded-full overflow-hidden">
                    <div 
                      className="h-full bg-gradient-to-r from-green-500 to-emerald-400 rounded-full transition-all duration-1000"
                      style={{ width: `${progress}%` }}
                    />
                  </div>
                  <span className="text-xs font-bold text-white/60">{progress}%</span>
                </div>
              </div>
              
              {/* Mobile progress bar - full width */}
              <div className="md:hidden flex items-center gap-2">
                <div className="flex-1 h-2 bg-white/5 rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-gradient-to-r from-green-500 to-emerald-400 rounded-full transition-all duration-1000"
                    style={{ width: `${progress}%` }}
                  />
                </div>
                <span className="text-xs font-bold text-white/60 w-10">{progress}%</span>
              </div>
              
              {/* Center: Timer - Desktop only */}
              <div className="hidden md:block text-center">
                <div className="text-2xl font-black text-white tracking-tight">{formatTime(elapsedTime)}</div>
                <div className="text-[10px] text-white/30 uppercase tracking-widest">Elapsed</div>
              </div>
              
              {/* Right: Proceed Button - Full width on mobile */}
              <div className="md:w-48 flex justify-center md:justify-end">
                {showButton ? (
                  <button 
                    onClick={() => {
                      // #region agent log
                      fetch(getDebugEndpoint(),{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'AuditView.tsx:ProceedClick',message:'Proceed CLICKED',data:{target:'DASHBOARD'},timestamp:Date.now(),sessionId:'debug-session',runId:'scan-ui',hypothesisId:'H7'})}).catch(()=>{});
                      // #endregion
                      onNavigate(ViewState.DASHBOARD);
                    }} 
                    className="w-full md:w-auto animate-in fade-in slide-in-from-right-4 duration-500 px-6 py-3 md:py-2.5 rounded-full bg-green-500 hover:bg-green-400 text-black text-xs font-bold uppercase tracking-wider transition-all flex items-center justify-center gap-2 shadow-[0_0_20px_rgba(16,185,129,0.4)]"
                  >
                    Proceed <ArrowRight className="w-4 h-4" />
                  </button>
                ) : (
                  <div className="flex items-center gap-2 text-white/30 text-xs py-2">
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Scanning in progress...
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Main Content - Mobile: Stack, Desktop: Side by side */}
        <div className="flex-1 overflow-hidden flex flex-col md:flex-row">
          {/* Left Panel: Stages - Horizontal scroll on mobile */}
          <div className="flex-shrink-0 md:w-80 border-b md:border-b-0 md:border-r border-white/5 bg-[#050505] overflow-x-auto md:overflow-y-auto p-4 md:p-6">
            <h3 className="text-xs font-bold text-white/40 uppercase tracking-widest mb-4 md:mb-6">Scan Stages</h3>
            {/* Mobile: horizontal scroll, Desktop: vertical list */}
            <div className="flex md:flex-col gap-2 md:gap-3 min-w-max md:min-w-0">
              {stageStatuses.map((stage, i) => (
                <div 
                  key={stage.id}
                  className={`flex items-center md:items-start gap-2 md:gap-3 p-2 md:p-3 rounded-xl transition-all flex-shrink-0 ${
                    stage.status === 'active' ? 'bg-green-500/10 border border-green-500/20' :
                    stage.status === 'complete' ? 'bg-white/[0.02] border border-white/5' :
                    'opacity-40'
                  }`}
                >
                  <div className={`w-7 h-7 md:w-8 md:h-8 rounded-lg flex items-center justify-center flex-shrink-0 ${
                    stage.status === 'complete' ? 'bg-green-500/20 text-green-400' :
                    stage.status === 'active' ? 'bg-green-500/20 text-green-400' :
                    'bg-white/5 text-white/30'
                  }`}>
                    {stage.status === 'complete' ? <CheckCircle className="w-3 h-3 md:w-4 md:h-4" /> :
                     stage.status === 'active' ? <Loader2 className="w-3 h-3 md:w-4 md:h-4 animate-spin" /> :
                     stage.icon}
                  </div>
                  <div className="min-w-0">
                    <div className={`text-xs md:text-sm font-bold whitespace-nowrap md:whitespace-normal ${
                      stage.status === 'active' ? 'text-green-400' :
                      stage.status === 'complete' ? 'text-white' :
                      'text-white/40'
                    }`}>{stage.name}</div>
                    <div className="hidden md:block text-[10px] text-white/30 truncate">{stage.description}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Right Panel: Terminal */}
          <div className="flex-1 flex flex-col overflow-hidden">
            {/* Header */}
            <div className="flex-shrink-0 p-6 pb-0">
              <div className="flex items-center gap-4 mb-2">
                <div className="relative">
                  <Network className="w-8 h-8 text-white" />
                  <div className="absolute -bottom-1 -right-1 w-3 h-3 bg-green-500 rounded-full animate-pulse" />
                </div>
                <div>
                  <h2 className="text-3xl font-black tracking-tight text-white uppercase">
                    Forensic Digital Audit
                  </h2>
                  <p className="text-xs text-white/40">
                    Deep scanning {username || 'target'} across all platforms
                  </p>
                </div>
              </div>
            </div>

            {/* Terminal */}
            <div className="flex-1 overflow-hidden p-6 pt-4">
              <div className="h-full bg-[#080808] rounded-xl border border-white/10 overflow-hidden flex flex-col">
                {/* Terminal Header */}
                <div className="flex-shrink-0 px-4 py-2 border-b border-white/5 flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-red-500/60" />
                  <div className="w-3 h-3 rounded-full bg-yellow-500/60" />
                  <div className="w-3 h-3 rounded-full bg-green-500/60" />
                  <span className="ml-4 text-[10px] text-white/30 font-mono">audit-terminal — {logs.length} events</span>
                </div>
                
                {/* Terminal Content */}
                <div className="flex-1 overflow-y-auto p-4 font-mono text-xs">
                  <div className="space-y-2">
                    {logs.map((logEntry, i) => {
                      const log = logEntry.message;
                      const isError = log.includes('[ERROR]');
                      const isWarning = log.includes('[WARNING]');
                      const isSuccess = log.includes('[SUCCESS]');
                      const isComplete = log.includes('[COMPLETE]');
                      const isDNA = log.includes('[DNA]');
                      const isIntel = log.includes('[INTEL]');
                      const isInsights = log.includes('[INSIGHTS]');
                      const isSkip = log.includes('[SKIP]');
                      
                      let color = 'text-white/70';
                      let prefix = 'text-green-500';
                      
                      if (isError) { color = 'text-red-400'; prefix = 'text-red-500'; }
                      else if (isWarning) { color = 'text-amber-400'; prefix = 'text-amber-500'; }
                      else if (isSuccess) { color = 'text-green-400'; prefix = 'text-green-500'; }
                      else if (isComplete) { color = 'text-emerald-300 font-bold'; prefix = 'text-emerald-400'; }
                      else if (isDNA) { color = 'text-purple-400'; prefix = 'text-purple-500'; }
                      else if (isIntel) { color = 'text-blue-400'; prefix = 'text-blue-500'; }
                      else if (isInsights) { color = 'text-amber-400'; prefix = 'text-amber-500'; }
                      else if (isSkip) { color = 'text-white/40'; prefix = 'text-white/30'; }
                      
                      return (
                        <div 
                          key={i} 
                          className={`flex gap-3 animate-in slide-in-from-left-2 duration-200 ${color}`}
                          style={{ animationDelay: `${i * 20}ms` }}
                        >
                          <span className={`${prefix} font-bold select-none`}>&gt;</span>
                          <span className="text-white/30 select-none">[{logEntry.timestamp}]</span>
                          <span className="flex-1">{log}</span>
                        </div>
                      );
                    })}
                    
                    {!showButton && (
                      <div className="flex gap-3 pt-2">
                        <span className="text-green-500 font-bold">&gt;</span>
                        <span className="animate-pulse text-green-500">█</span>
                      </div>
                    )}
                    <div ref={logsEndRef} />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Error Banner */}
        {error && (
          <div className="absolute bottom-4 left-1/2 -translate-x-1/2 bg-red-500/10 border border-red-500/30 rounded-xl px-6 py-3 animate-in fade-in slide-in-from-bottom-4">
            <div className="flex items-center gap-3">
              <AlertCircle className="w-5 h-5 text-red-400" />
              <span className="text-red-300 text-sm">{error}</span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AuditView;
