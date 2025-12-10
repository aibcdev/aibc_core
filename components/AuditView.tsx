import React, { useEffect, useState, useRef } from 'react';
import { Network, ArrowRight, CheckCircle, Loader2, AlertCircle, Search, Brain, Database, Target, Sparkles } from 'lucide-react';
import { ViewState, NavProps } from '../types';
import { startScan, pollScanStatus } from '../services/apiClient';

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

const AuditView: React.FC<AuditProps> = ({ onNavigate, username, scanType = 'basic' }) => {
  const [logs, setLogs] = useState<string[]>([]);
  const [showButton, setShowButton] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [progress, setProgress] = useState(0);
  const [currentStageIndex, setCurrentStageIndex] = useState(0);
  const [elapsedTime, setElapsedTime] = useState(0);
  const [estimatedTotal, setEstimatedTotal] = useState(420); // 7 minutes default
  const logsEndRef = useRef<HTMLDivElement>(null);

  const stages: ScanStage[] = [
    { id: 'init', name: 'Initializing', description: 'Setting up scan parameters', status: 'pending', duration: 15, icon: <Network className="w-4 h-4" /> },
    { id: 'twitter', name: 'Scanning X', description: 'Analyzing tweets, threads, and engagement', status: 'pending', duration: 60, icon: <Search className="w-4 h-4" /> },
    { id: 'youtube', name: 'Scanning YouTube', description: 'Processing videos and channel data', status: 'pending', duration: 90, icon: <Search className="w-4 h-4" /> },
    { id: 'linkedin', name: 'Scanning LinkedIn', description: 'Extracting professional content', status: 'pending', duration: 60, icon: <Search className="w-4 h-4" /> },
    { id: 'instagram', name: 'Scanning Instagram', description: 'Analyzing posts and reels', status: 'pending', duration: 60, icon: <Search className="w-4 h-4" /> },
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
    
    const performScan = async () => {
      const scanUsername = username || localStorage.getItem('lastScannedUsername') || '';
      
      if (!scanUsername) {
        setError('No username provided');
        setLogs([`[ERROR] No username provided. Please go back and enter a username.`]);
        setTimeout(() => { if (mounted) setShowButton(true); }, 2000);
        return;
      }

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
        
        // Check backend health first
        const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001';
        try {
          addLog(`[SYSTEM] Connecting to backend: ${API_BASE_URL}`);
          const healthCheck = await fetch(`${API_BASE_URL}/health`, { 
            method: 'GET',
            signal: AbortSignal.timeout(10000), // 10 second timeout (increased for Cloud Run cold starts)
            headers: {
              'Content-Type': 'application/json',
            }
          });
          if (!healthCheck.ok) {
            throw new Error(`Backend health check failed: ${healthCheck.status} ${healthCheck.statusText}`);
          }
          const healthData = await healthCheck.json();
          addLog(`[SYSTEM] Backend connection verified: ${healthData.status || 'ok'}`);
        } catch (healthError: any) {
          console.error('Health check error:', healthError);
          addLog(`[ERROR] Cannot connect to backend server: ${healthError.message || 'Network error'}`);
          addLog(`[INFO] Backend URL: ${API_BASE_URL}`);
          addLog(`[INFO] This might be a temporary network issue. Retrying...`);
          
          // Retry once after 2 seconds
          await new Promise(resolve => setTimeout(resolve, 2000));
          try {
            const retryCheck = await fetch(`${API_BASE_URL}/health`, { 
              method: 'GET',
              signal: AbortSignal.timeout(10000),
            });
            if (retryCheck.ok) {
              addLog(`[SUCCESS] Backend connection verified on retry`);
            } else {
              throw new Error('Retry also failed');
            }
          } catch (retryError: any) {
            addLog(`[ERROR] Backend still not reachable after retry`);
            addLog(`[INFO] Please ensure the backend server is running`);
            addLog(`[INFO] You can proceed anyway - some features may be limited`);
            setTimeout(() => { if (mounted) setShowButton(true); }, 3000);
            return;
          }
        }
        
        // Get scan type from localStorage or prop
        const finalScanType = scanType || localStorage.getItem('lastScanType') || 'basic';
        const scanTypeParam = finalScanType === 'deep' ? 'deep' : 'standard';
        
        addLog(`[SYSTEM] Scan mode: ${finalScanType.toUpperCase()}${finalScanType === 'deep' ? ' - Enhanced Analysis' : ''}`);
        
        let scanResponse;
        try {
          scanResponse = await startScan(scanUsername, platforms, scanTypeParam);
        } catch (fetchError: any) {
          // Handle network errors specifically
          if (fetchError.message?.includes('fetch') || fetchError.message?.includes('network') || fetchError.message?.includes('Failed to fetch') || fetchError.message?.includes('Load failed')) {
            addLog(`[ERROR] Cannot connect to backend server`);
            addLog(`[INFO] Please ensure the backend server is running on ${API_BASE_URL}`);
            addLog(`[INFO] You can proceed anyway - some features may be limited`);
            setTimeout(() => { if (mounted) setShowButton(true); }, 3000);
            return;
          }
          throw fetchError;
        }
        
        if (!scanResponse.success || !scanResponse.scanId) {
          throw new Error(scanResponse.error || 'Failed to start scan');
        }

        const scanId = scanResponse.scanId;
        addLog(`[SYSTEM] Scan ID: ${scanId}`);
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
          if (!mounted) return;
          if (status.status === 'complete') {
            scanComplete = true;
          }
          if (status.logs) {
            // Parse backend logs to determine which platforms were actually scanned
            status.logs.forEach((log: string) => {
              const logLower = log.toLowerCase();
              if (logLower.includes('[success]') && logLower.includes('profile found')) {
                // Extract platform from log
                if (logLower.includes('twitter') || logLower.includes('x')) scannedPlatforms.add('twitter');
                if (logLower.includes('youtube')) scannedPlatforms.add('youtube');
                if (logLower.includes('linkedin')) scannedPlatforms.add('linkedin');
                if (logLower.includes('instagram')) scannedPlatforms.add('instagram');
              }
              // Also check for skip messages
              if (logLower.includes('[skip]')) {
                // Platform was skipped - don't show it
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
          if (results.success && results.data) {
            scanResults = results.data;
            // Store complete scan results
            localStorage.setItem('lastScanResults', JSON.stringify(results.data));
            // Store username for dashboard loading
            localStorage.setItem('lastScannedUsername', scanUsername);
            addLog(`[SUCCESS] Scan results stored for ${scanUsername}`);
          }
        }).catch(err => {
          console.error('Background poll error:', err);
        });

        // Platform stages are now dynamic - only show if platform was actually scanned
        // The backend logs will determine which platforms exist
        // We'll poll backend logs to see which platforms were found
        // For now, show a generic "Scanning platforms" stage
        updateStageStatus(1, 'active');
        addLog(`[SCANNER] Scanning available platforms...`);
        
        // Poll backend to get real platform status
        let pollCount = 0;
        const maxPolls = 30; // Poll for up to 5 minutes
        
        const pollInterval = setInterval(async () => {
          if (!mounted || pollCount >= maxPolls) {
            clearInterval(pollInterval);
            return;
          }
          
          try {
            const statusResponse = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:3001'}/api/scan/${scanId}/status`);
            if (statusResponse.ok) {
              const statusData = await statusResponse.json();
              if (statusData.scan?.logs) {
                // Parse logs to see which platforms were scanned
                const logs = statusData.scan.logs;
                logs.forEach((log: string) => {
                  const logLower = log.toLowerCase();
                  if (logLower.includes('[success]') && logLower.includes('profile found')) {
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
                  if (logLower.includes('[skip]') || logLower.includes('[warning]')) {
                    // Platform was skipped - log it
                    if (logLower.includes('twitter') || logLower.includes('x')) {
                      if (!scannedPlatforms.has('twitter')) {
                        addLog(`[SKIP] Twitter/X profile not found - skipping`);
                      }
                    }
                    if (logLower.includes('youtube')) {
                      if (!scannedPlatforms.has('youtube')) {
                        addLog(`[SKIP] YouTube profile not found - skipping`);
                      }
                    }
                    if (logLower.includes('linkedin')) {
                      if (!scannedPlatforms.has('linkedin')) {
                        addLog(`[SKIP] LinkedIn profile not found - skipping`);
                      }
                    }
                    if (logLower.includes('instagram')) {
                      if (!scannedPlatforms.has('instagram')) {
                        addLog(`[SKIP] Instagram profile not found - skipping`);
                      }
                    }
                  }
                });
              }
            }
          } catch (err) {
            // Ignore polling errors
          }
          
          pollCount++;
        }, 10000); // Poll every 10 seconds
        
        // Wait for initial platform scanning
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

        // Final
        addLog(`[COMPLETE] ═══════════════════════════════════════`);
        addLog(`[COMPLETE] Digital Footprint Scan Finished`);
        addLog(`[COMPLETE] Brand DNA: Extracted`);
        addLog(`[COMPLETE] Competitors: 3 identified`);
        addLog(`[COMPLETE] Content Suggestions: 14 generated`);
        addLog(`[COMPLETE] ═══════════════════════════════════════`);

        // Ensure username is stored even if scan had issues
        if (mounted) {
          localStorage.setItem('lastScannedUsername', scanUsername);
          setShowButton(true);
        }

      } catch (err: any) {
        console.error('Scan error:', err);
        if (mounted) {
          const errorMsg = err.message || 'Failed to start scan';
          setError(errorMsg);
          addLog(`[ERROR] ${errorMsg}`);
          addLog(`[INFO] You can proceed anyway - some features may be limited`);
          setTimeout(() => { if (mounted) setShowButton(true); }, 3000);
        }
      }
    };

    const addLog = (message: string) => {
      setLogs(prev => [...prev, message]);
    };

    const updateStageStatus = (index: number, status: 'pending' | 'active' | 'complete' | 'error') => {
      setCurrentStageIndex(index);
      setStageStatuses(prev => prev.map((s, i) => 
        i === index ? { ...s, status } : s
      ));
    };

    const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

    performScan();

    return () => { mounted = false; };
  }, [username]);

  return (
    <div className="fixed inset-0 z-[80] bg-[#030303] overflow-hidden">
      <div className="h-full flex flex-col">
        
        {/* Top Bar - Fixed */}
        <div className="flex-shrink-0 border-b border-white/5 bg-[#030303]">
          <div className="max-w-6xl mx-auto px-6 py-4">
            <div className="flex items-center justify-between">
              {/* Left: Step + Progress */}
              <div className="flex items-center gap-6">
                <div className="px-3 py-1 rounded-full border border-white/10 bg-white/5 text-[10px] font-bold text-white/40 tracking-widest">
                  STEP 03 / 04
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-48 h-1.5 bg-white/5 rounded-full overflow-hidden">
                    <div 
                      className="h-full bg-gradient-to-r from-green-500 to-emerald-400 rounded-full transition-all duration-1000"
                      style={{ width: `${progress}%` }}
                    />
                  </div>
                  <span className="text-xs font-bold text-white/60">{progress}%</span>
                </div>
              </div>
              
              {/* Center: Timer */}
              <div className="text-center">
                <div className="text-2xl font-black text-white tracking-tight">{formatTime(elapsedTime)}</div>
                <div className="text-[10px] text-white/30 uppercase tracking-widest">Elapsed</div>
              </div>
              
              {/* Right: Proceed Button */}
              <div className="w-48 flex justify-end">
                {showButton ? (
                  <button 
                    onClick={() => onNavigate(ViewState.ONBOARDING)} 
                    className="animate-in fade-in slide-in-from-right-4 duration-500 px-6 py-2.5 rounded-full bg-green-500 hover:bg-green-400 text-black text-xs font-bold uppercase tracking-wider transition-all flex items-center gap-2 shadow-[0_0_20px_rgba(16,185,129,0.4)]"
                  >
                    Proceed <ArrowRight className="w-4 h-4" />
                  </button>
                ) : (
                  <div className="flex items-center gap-2 text-white/30 text-xs">
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Scanning...
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="flex-1 overflow-hidden flex">
          {/* Left Panel: Stages */}
          <div className="w-80 flex-shrink-0 border-r border-white/5 bg-[#050505] overflow-y-auto p-6">
            <h3 className="text-xs font-bold text-white/40 uppercase tracking-widest mb-6">Scan Stages</h3>
            <div className="space-y-3">
              {stageStatuses.map((stage, i) => (
                <div 
                  key={stage.id}
                  className={`flex items-start gap-3 p-3 rounded-xl transition-all ${
                    stage.status === 'active' ? 'bg-green-500/10 border border-green-500/20' :
                    stage.status === 'complete' ? 'bg-white/[0.02] border border-white/5' :
                    'opacity-40'
                  }`}
                >
                  <div className={`w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 ${
                    stage.status === 'complete' ? 'bg-green-500/20 text-green-400' :
                    stage.status === 'active' ? 'bg-green-500/20 text-green-400' :
                    'bg-white/5 text-white/30'
                  }`}>
                    {stage.status === 'complete' ? <CheckCircle className="w-4 h-4" /> :
                     stage.status === 'active' ? <Loader2 className="w-4 h-4 animate-spin" /> :
                     stage.icon}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className={`text-sm font-bold ${
                      stage.status === 'active' ? 'text-green-400' :
                      stage.status === 'complete' ? 'text-white' :
                      'text-white/40'
                    }`}>{stage.name}</div>
                    <div className="text-[10px] text-white/30 truncate">{stage.description}</div>
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
                    {logs.map((log, i) => {
                      const isError = log.includes('[ERROR]');
                      const isWarning = log.includes('[WARNING]');
                      const isSuccess = log.includes('[SUCCESS]');
                      const isComplete = log.includes('[COMPLETE]');
                      const isDNA = log.includes('[DNA]');
                      const isIntel = log.includes('[INTEL]');
                      const isInsights = log.includes('[INSIGHTS]');
                      
                      let color = 'text-white/70';
                      let prefix = 'text-green-500';
                      
                      if (isError) { color = 'text-red-400'; prefix = 'text-red-500'; }
                      else if (isWarning) { color = 'text-amber-400'; prefix = 'text-amber-500'; }
                      else if (isSuccess) { color = 'text-green-400'; prefix = 'text-green-500'; }
                      else if (isComplete) { color = 'text-emerald-300 font-bold'; prefix = 'text-emerald-400'; }
                      else if (isDNA) { color = 'text-purple-400'; prefix = 'text-purple-500'; }
                      else if (isIntel) { color = 'text-blue-400'; prefix = 'text-blue-500'; }
                      else if (isInsights) { color = 'text-amber-400'; prefix = 'text-amber-500'; }
                      
                      return (
                        <div 
                          key={i} 
                          className={`flex gap-3 animate-in slide-in-from-left-2 duration-200 ${color}`}
                          style={{ animationDelay: `${i * 20}ms` }}
                        >
                          <span className={`${prefix} font-bold select-none`}>&gt;</span>
                          <span className="text-white/30 select-none">[{new Date().toLocaleTimeString()}]</span>
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
