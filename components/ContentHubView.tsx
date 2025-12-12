import React, { useState, useEffect } from 'react';
import { Filter, RefreshCw, Plus, FileText, Video, Image as ImageIcon, Mic2, Linkedin, Instagram, Music, X, Play, Sparkles, Loader2, ArrowLeft, ArrowRight, Upload, Calendar, Zap, Wand2 } from 'lucide-react';
import { getScanResults } from '../services/apiClient';

interface ContentAsset {
  id: string;
  title: string;
  description?: string;
  platform: string;
  status: 'published' | 'draft' | 'scheduled' | 'suggested';
  type: 'document' | 'video' | 'image' | 'podcast' | 'thread' | 'reel' | 'carousel' | 'audio';
  timeAgo: string;
  basedOn?: string;
  theme?: string;
}

interface ContentTypeCount {
  id: string;
  name: string;
  icon: React.ReactNode;
  count: number;
  platforms?: string[];
}

const ContentHubView: React.FC = () => {
  const [assets, setAssets] = useState<ContentAsset[]>([]);
  const [statusFilter, setStatusFilter] = useState<'all' | 'suggested' | 'draft' | 'scheduled' | 'published'>('all');
  const [platformFilter, setPlatformFilter] = useState<string | null>(null);
  const [username, setUsername] = useState<string | null>(null);
  const [isRegenerating, setIsRegenerating] = useState(false);
  const [regenerationMessage, setRegenerationMessage] = useState('');
  
  // Content Creation Wizard State
  const [showCreateWizard, setShowCreateWizard] = useState(false);
  const [wizardStep, setWizardStep] = useState(1); // 1: Choose Type, 2: Add Content Types, 3: Topic & Media, 4: Schedule
  const [wizardMode, setWizardMode] = useState<'automatic' | 'manual' | null>(null);
  const [contentTypes, setContentTypes] = useState<ContentTypeCount[]>([
    { id: 'cross-posts', name: 'Cross Posts', icon: <div className="flex -space-x-1"><Instagram className="w-3 h-3 text-pink-400" /><span className="text-[10px] font-bold">𝕏</span><Linkedin className="w-3 h-3 text-blue-400" /></div>, count: 0, platforms: ['instagram', 'x', 'linkedin'] },
    { id: 'video-cross', name: 'Video Cross Posts', icon: <div className="flex -space-x-1"><Instagram className="w-3 h-3 text-pink-400" /><Play className="w-3 h-3 text-red-500" /></div>, count: 0, platforms: ['instagram', 'youtube'] },
    { id: 'instagram-posts', name: 'Instagram Posts', icon: <Instagram className="w-4 h-4 text-pink-400" />, count: 0, platforms: ['instagram'] },
    { id: 'instagram-stories', name: 'Instagram Stories', icon: <Instagram className="w-4 h-4 text-pink-400" />, count: 0, platforms: ['instagram'] },
    { id: 'instagram-reels', name: 'Instagram Reels', icon: <Instagram className="w-4 h-4 text-pink-400" />, count: 0, platforms: ['instagram'] },
    { id: 'youtube-shorts', name: 'YouTube Shorts', icon: <Play className="w-4 h-4 text-red-500" />, count: 0, platforms: ['youtube'] },
    { id: 'tiktok-posts', name: 'TikTok Posts', icon: <Music className="w-4 h-4 text-white" />, count: 0, platforms: ['tiktok'] },
    { id: 'facebook-posts', name: 'Facebook Posts', icon: <span className="text-blue-500 font-bold">f</span>, count: 0, platforms: ['facebook'] },
    { id: 'linkedin-posts', name: 'LinkedIn Posts', icon: <Linkedin className="w-4 h-4 text-blue-400" />, count: 0, platforms: ['linkedin'] },
    { id: 'x-posts', name: 'X/Twitter Posts', icon: <span className="font-bold text-white">𝕏</span>, count: 0, platforms: ['x'] },
    { id: 'blog-posts', name: 'WordPress Blog Posts', icon: <FileText className="w-4 h-4 text-blue-400" />, count: 0, platforms: ['wordpress'] },
    { id: 'emails', name: 'Emails', icon: <span className="text-amber-400">✉</span>, count: 0, platforms: ['email'] },
  ]);
  const [topicFocus, setTopicFocus] = useState('');
  const [uploadedFiles, setUploadedFiles] = useState<File[]>([]);
  const [selectedSchedule, setSelectedSchedule] = useState<'current' | 'next'>('current');
  const [isGenerating, setIsGenerating] = useState(false);
  
  // Get current and next week dates
  const getWeekDates = (weeksFromNow: number) => {
    const now = new Date();
    const startOfWeek = new Date(now);
    startOfWeek.setDate(now.getDate() - now.getDay() + (weeksFromNow * 7));
    const endOfWeek = new Date(startOfWeek);
    endOfWeek.setDate(startOfWeek.getDate() + 6);
    return {
      start: startOfWeek.toLocaleDateString('en-US', { month: 'long', day: 'numeric' }),
      end: endOfWeek.toLocaleDateString('en-US', { day: 'numeric' })
    };
  };
  
  const currentWeek = getWeekDates(0);
  const nextWeek = getWeekDates(1);
  
  const updateContentTypeCount = (id: string, delta: number) => {
    setContentTypes(prev => prev.map(ct => 
      ct.id === id ? { ...ct, count: Math.max(0, ct.count + delta) } : ct
    ));
  };
  
  const totalContentCount = contentTypes.reduce((sum, ct) => sum + ct.count, 0);
  
  const resetWizard = () => {
    setWizardStep(1);
    setWizardMode(null);
    setContentTypes(prev => prev.map(ct => ({ ...ct, count: 0 })));
    setTopicFocus('');
    setUploadedFiles([]);
    setSelectedSchedule('current');
  };
  
  const handleGenerateContent = async () => {
    setIsGenerating(true);
    
    // Generate content based on selections
    const newAssets: ContentAsset[] = [];
    const brandDNA = JSON.parse(localStorage.getItem('lastScanResults') || '{}')?.brandDNA;
    
    for (const contentType of contentTypes.filter(ct => ct.count > 0)) {
      for (let i = 0; i < contentType.count; i++) {
        const platform = contentType.platforms?.[0] || 'general';
        newAssets.push({
          id: `gen_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
          title: topicFocus 
            ? `${topicFocus} - ${contentType.name} #${i + 1}`
            : `${brandDNA?.name || 'Brand'} ${contentType.name} #${i + 1}`,
          description: `AI-generated ${contentType.name.toLowerCase()} ${topicFocus ? `about ${topicFocus}` : 'for your brand'}`,
          platform: platform.toUpperCase(),
          status: 'draft',
          type: contentType.id.includes('video') || contentType.id.includes('reel') || contentType.id.includes('short') ? 'video' : 'document',
          timeAgo: 'Just now',
          theme: topicFocus || undefined
        });
      }
    }
    
    // Simulate generation delay
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    // Add to assets
    setAssets(prev => [...newAssets, ...prev]);
    
    // Save to localStorage
    const existingAssets = JSON.parse(localStorage.getItem('productionAssets') || '[]');
    localStorage.setItem('productionAssets', JSON.stringify([...newAssets, ...existingAssets]));
    
    setIsGenerating(false);
    setShowCreateWizard(false);
    resetWizard();
    
    // Dispatch notification
    window.dispatchEvent(new CustomEvent('contentGenerated', { detail: { count: newAssets.length } }));
  };

  useEffect(() => {
    loadContent();
    
    // Listen for new scan started - clear all state
    const handleNewScanStarted = (event: CustomEvent) => {
      console.log('🧹 Content Hub: New scan started, clearing all state');
      const { username, isRescan } = event.detail;
      
      // #region agent log - H11: Check if newScanStarted clears assets
      fetch('http://127.0.0.1:7242/ingest/62bd50d3-9960-40ff-8da7-b4d57e001c2d',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'ContentHubView.tsx:handleNewScanStarted',message:'CLEARING ASSETS - NEW SCAN',data:{username,isRescan},timestamp:Date.now(),sessionId:'debug-session',hypothesisId:'H11'})}).catch(()=>{});
      // #endregion
      
      // Clear all content hub state
      setAssets([]);
      setUsername(null);
      
      // Clear ALL localStorage cache (comprehensive)
      localStorage.removeItem('lastScanResults');
      localStorage.removeItem('lastScanId');
      localStorage.removeItem('lastScanTimestamp');
      localStorage.removeItem('productionAssets');
      
      console.log('✅ Content Hub: All cache cleared for', isRescan ? 'rescan' : 'new scan');
      
      // Reload content for new scan
      setTimeout(() => {
        loadContent();
      }, 500);
    };
    
    // Listen for brand assets updates
    const handleBrandAssetsUpdate = () => {
      console.log('📥 Brand assets updated - enhancing content ideas...');
      setRegenerationMessage('Updating based on brand assets...');
      setIsRegenerating(true);
      enhanceContentIdeas().then(() => {
        setTimeout(() => setIsRegenerating(false), 1000);
      });
    };
    
    // Listen for competitor added events
    const handleCompetitorAdded = async (event: CustomEvent) => {
      console.log('📥 Content Hub: Competitor added - regenerating content...', event.detail);
      const { competitor } = event.detail;
      setRegenerationMessage(`Adding competitor insights from ${competitor?.name || 'new competitor'}...`);
      setIsRegenerating(true);
      
      try {
        const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001';
        const cachedResults = localStorage.getItem('lastScanResults');
        const parsed = cachedResults ? JSON.parse(cachedResults) : {};
        
        const response = await fetch(`${API_BASE_URL}/api/analytics/regenerate-content`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            strategy: `Incorporate competitor analysis for ${competitor?.name}`,
            brandDNA: parsed.brandDNA,
            competitorIntelligence: parsed.competitorIntelligence,
            currentContentIdeas: parsed.contentIdeas,
            scanUsername: localStorage.getItem('lastScannedUsername')
          })
        });
        
        if (response.ok) {
          const result = await response.json();
          if (result.success && result.contentIdeas) {
            parsed.contentIdeas = result.contentIdeas;
            localStorage.setItem('lastScanResults', JSON.stringify(parsed));
            await loadContent();
          }
        }
      } catch (error) {
        console.error('Error regenerating for competitor:', error);
        await enhanceContentIdeas();
      }
      
      setTimeout(() => setIsRegenerating(false), 1000);
    };
    
    // Listen for strategy updates - CRITICAL: Force content regeneration via backend
    const handleStrategyUpdate = async (event: CustomEvent) => {
      console.log('📥 Strategy updated - regenerating content ideas...', event.detail);
      const { forceContentRegenerate, activeStrategy, strategy } = event.detail;
      
      // Show regeneration indicator
      setRegenerationMessage('Applying strategy update...');
      setIsRegenerating(true);
      
      if (forceContentRegenerate && (activeStrategy || strategy)) {
        console.log('🔄 Content Hub: Force regenerating content from backend based on new strategy');
        // #region agent log - H12: Check if strategy update clears assets
        fetch('http://127.0.0.1:7242/ingest/62bd50d3-9960-40ff-8da7-b4d57e001c2d',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'ContentHubView.tsx:handleStrategyUpdate',message:'CLEARING ASSETS - STRATEGY UPDATE',data:{forceContentRegenerate,hasStrategy:!!(activeStrategy||strategy)},timestamp:Date.now(),sessionId:'debug-session',hypothesisId:'H12'})}).catch(()=>{});
        // #endregion
        // Clear current assets first
        setAssets([]);
        localStorage.removeItem('productionAssets');
        
        try {
          // Call backend to regenerate content based on strategy
          const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001';
          const cachedResults = localStorage.getItem('lastScanResults');
          const parsed = cachedResults ? JSON.parse(cachedResults) : {};
          
          const response = await fetch(`${API_BASE_URL}/api/analytics/regenerate-content`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              strategy: strategy || activeStrategy,
              brandDNA: parsed.brandDNA,
              competitorIntelligence: parsed.competitorIntelligence,
              currentContentIdeas: parsed.contentIdeas,
              scanUsername: localStorage.getItem('lastScannedUsername')
            })
          });
          
          if (response.ok) {
            const result = await response.json();
            if (result.success && result.contentIdeas) {
              console.log(`✅ Content Hub: Received ${result.contentIdeas.length} strategy-aligned ideas`);
              
              // Update localStorage with new ideas
              parsed.contentIdeas = result.contentIdeas;
              parsed.lastStrategyUpdate = Date.now();
              localStorage.setItem('lastScanResults', JSON.stringify(parsed));
              
              // Update UI
              await loadContent();
            }
          } else {
            console.error('Failed to regenerate content from backend');
            await loadContent();
          }
        } catch (error) {
          console.error('Error calling regenerate-content:', error);
          await loadContent();
        }
        
        // Also enhance with strategy context
        await enhanceContentIdeas();
        setTimeout(() => setIsRegenerating(false), 1000);
      } else {
        await enhanceContentIdeas();
        setTimeout(() => setIsRegenerating(false), 1000);
      }
    };
    
    // Listen for competitor updates
    const handleCompetitorUpdate = async (event: CustomEvent) => {
      console.log('📥 Competitor updated - updating content ideas...', event.detail);
      setRegenerationMessage('Updating for competitor changes...');
      setIsRegenerating(true);
      await enhanceContentIdeas();
      setTimeout(() => setIsRegenerating(false), 1000);
    };
    
    // Listen for scan completion - only reload if we have data
    const handleScanComplete = (event: CustomEvent) => {
      const { results } = event.detail || {};
      console.log('📥 Scan completed event received', { hasResults: !!results });
      // Only reload if scan actually has results - don't clear existing content
      if (results && (results.contentIdeas?.length > 0 || results.extractedContent)) {
        console.log('📥 Scan has new content - reloading...');
        loadContent();
      } else {
        console.log('📥 Scan has no new content - keeping existing');
      }
    };
    
    // Listen for analytics updates - may affect content recommendations
    const handleAnalyticsUpdate = (event: CustomEvent) => {
      console.log('📥 Content Hub: Analytics updated - adjusting content ideas...', event.detail);
      enhanceContentIdeas();
    };
    
    // Listen for any data change
    const handleDataChange = (event: CustomEvent) => {
      console.log('📥 Content Hub: Data changed - refreshing...', event.detail?.eventType);
      loadContent();
    };
    
    window.addEventListener('newScanStarted', handleNewScanStarted as EventListener);
    window.addEventListener('brandAssetsUpdated', handleBrandAssetsUpdate);
    window.addEventListener('strategyUpdated', handleStrategyUpdate as EventListener);
    window.addEventListener('competitorUpdated', handleCompetitorUpdate as EventListener);
    window.addEventListener('competitorAdded', handleCompetitorAdded as EventListener);
    window.addEventListener('scanComplete', handleScanComplete as EventListener);
    window.addEventListener('analyticsUpdated', handleAnalyticsUpdate as EventListener);
    window.addEventListener('dataChanged', handleDataChange as EventListener);
    
    // Periodic refresh (every 5 minutes) to check for new data
    const periodicRefresh = setInterval(() => {
      console.log('🔄 Periodic content refresh...');
      enhanceContentIdeas();
    }, 5 * 60 * 1000); // 5 minutes
    
    return () => {
      window.removeEventListener('newScanStarted', handleNewScanStarted as EventListener);
      window.removeEventListener('brandAssetsUpdated', handleBrandAssetsUpdate);
      window.removeEventListener('strategyUpdated', handleStrategyUpdate as EventListener);
      window.removeEventListener('competitorUpdated', handleCompetitorUpdate as EventListener);
      window.removeEventListener('competitorAdded', handleCompetitorAdded as EventListener);
      window.removeEventListener('scanComplete', handleScanComplete as EventListener);
      window.removeEventListener('analyticsUpdated', handleAnalyticsUpdate as EventListener);
      window.removeEventListener('dataChanged', handleDataChange as EventListener);
      clearInterval(periodicRefresh);
    };
  }, []);

  const enhanceContentIdeas = async () => {
    try {
      const cachedScanResults = localStorage.getItem('lastScanResults');
      const currentUsername = localStorage.getItem('lastScannedUsername');
      const currentTimestamp = localStorage.getItem('lastScanTimestamp');
      
      if (!cachedScanResults) return;
      
      const parsed = JSON.parse(cachedScanResults);
      const cachedUsername = parsed.scanUsername || parsed.username;
      const cachedTimestamp = parsed.timestamp || parsed.scanTimestamp;
      
      // Validate username and timestamp
      const usernameValid = currentUsername && cachedUsername && 
        currentUsername.toLowerCase() === cachedUsername.toLowerCase();
      const timestampValid = currentTimestamp && cachedTimestamp && 
        (parseInt(currentTimestamp) - parseInt(cachedTimestamp)) < 3600000;
      
      if (!usernameValid || !timestampValid) {
        console.log('⚠️ Content Hub: Cache invalid - skipping enhancement');
        return;
      }
      
      let contentIdeas = parsed.contentIdeas || [];
      
      if (contentIdeas.length === 0) return;
      
      // Load context
      const brandMaterials = JSON.parse(localStorage.getItem('brandMaterials') || '[]');
      const brandProfile = JSON.parse(localStorage.getItem('brandProfile') || 'null');
      const brandVoice = JSON.parse(localStorage.getItem('brandVoice') || 'null');
      const brandColors = JSON.parse(localStorage.getItem('brandColors') || '[]');
      const brandFonts = JSON.parse(localStorage.getItem('brandFonts') || '[]');
      const activeStrategy = JSON.parse(localStorage.getItem('activeContentStrategy') || 'null');
      const competitorIntelligence = parsed.competitorIntelligence || [];
      const brandDNA = parsed.brandDNA || null;
      
      // Enhance content ideas with new context
      const enhancedIdeas = await enhanceContentIdeasWithContext(contentIdeas, {
        brandMaterials,
        brandProfile,
        brandVoice,
        brandColors,
        brandFonts,
        activeStrategy,
        competitorIntelligence,
        brandDNA
      });
      
      // Update content ideas
      if (enhancedIdeas.length > 0) {
        const updatedAssets = enhancedIdeas.map((idea: any, index: number) => {
          const platformMap: Record<string, string> = {
            'twitter': 'X', 'x': 'X', 'linkedin': 'LINKEDIN', 'instagram': 'INSTAGRAM',
            'tiktok': 'TIKTOK', 'youtube': 'YOUTUBE', 'podcast': 'PODCAST', 'facebook': 'FACEBOOK'
          };
          const formatMap: Record<string, string> = {
            'post': 'document', 'thread': 'thread', 'video': 'video', 'carousel': 'carousel',
            'reel': 'reel', 'podcast': 'podcast', 'audio': 'audio'
          };
          
          return {
            id: `content_idea_${index}`,
            title: idea.title || 'Untitled Content',
            description: idea.description || '',
            platform: platformMap[idea.platform?.toLowerCase() || 'twitter'] || 'X',
            status: 'suggested' as const,
            type: (formatMap[idea.format?.toLowerCase() || 'post'] || 'document') as any,
            timeAgo: 'AI suggested',
            basedOn: idea.theme || '',
            theme: idea.theme
          };
        });
        
        setAssets(updatedAssets);
        
        // Update cache
        parsed.contentIdeas = enhancedIdeas;
        localStorage.setItem('lastScanResults', JSON.stringify(parsed));
      }
    } catch (e) {
      console.error('Error enhancing content ideas:', e);
    }
  };

  const enhanceContentIdeasWithContext = async (
    contentIdeas: any[],
    context: {
      brandMaterials?: any[];
      brandProfile?: any;
      brandVoice?: any;
      brandColors?: any[];
      brandFonts?: any[];
      activeStrategy?: any;
      competitorIntelligence?: any[];
      brandDNA?: any;
    }
  ): Promise<any[]> => {
    if (!contentIdeas || contentIdeas.length === 0) return contentIdeas;
    
    // Enhance ideas based on context
    const enhanced = contentIdeas.map((idea: any) => {
      const enhanced = { ...idea };
      
      // Enhance with strategy context
      if (context.activeStrategy) {
        if (context.activeStrategy.type === 'competitor_focus' && context.competitorIntelligence) {
          const competitorName = context.activeStrategy.title.replace('Focus on ', '');
          enhanced.description = `${enhanced.description} (Tailored to compete with ${competitorName})`;
        } else if (context.activeStrategy.type === 'brand_building') {
          enhanced.description = `${enhanced.description} (Focusing on brand building and thought leadership)`;
        }
      }
      
      // Enhance with competitor context
      if (context.competitorIntelligence && context.competitorIntelligence.length > 0) {
        const topCompetitor = context.competitorIntelligence[0];
        if (topCompetitor.advantage) {
          enhanced.description = `${enhanced.description} (Addressing competitor advantage: ${topCompetitor.advantage})`;
        }
      }
      
      // Enhance with brand DNA context
      if (context.brandDNA) {
        const themes = context.brandDNA.themes || context.brandDNA.corePillars || [];
        if (themes.length > 0 && !enhanced.theme) {
          enhanced.theme = themes[0];
        }
      }
      
      // Enhance with brand assets context
      if (context.brandMaterials && context.brandMaterials.length > 0) {
        const hasVideoAssets = context.brandMaterials.some((m: any) => m.type === 'video');
        const hasImageAssets = context.brandMaterials.some((m: any) => m.type === 'image' || m.type === 'logo');
        
        if (hasVideoAssets && enhanced.format === 'video') {
          enhanced.description = `${enhanced.description} (Can use brand video assets)`;
        }
        if (hasImageAssets && (enhanced.format === 'carousel' || enhanced.format === 'post')) {
          enhanced.description = `${enhanced.description} (Can use brand image assets)`;
        }
      }
      
      return enhanced;
    });
    
    return enhanced;
  };

  const loadContent = async () => {
    // #region agent log
    const debugLastScanResults = localStorage.getItem('lastScanResults');
    let debugParsedResults: any = null;
    try { debugParsedResults = debugLastScanResults ? JSON.parse(debugLastScanResults) : null; } catch(e) {}
    fetch('http://127.0.0.1:7242/ingest/62bd50d3-9960-40ff-8da7-b4d57e001c2d',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'ContentHubView.tsx:loadContent:ENTRY',message:'loadContent START',data:{lastScannedUsername:localStorage.getItem('lastScannedUsername'),lastScanId:localStorage.getItem('lastScanId'),hasLastScanResults:!!debugLastScanResults,contentIdeasInCache:debugParsedResults?.contentIdeas?.length||0,cacheKeys:debugParsedResults?Object.keys(debugParsedResults):[]},timestamp:Date.now(),sessionId:'debug-session',hypothesisId:'H1-H5'})}).catch(()=>{});
    // #endregion
    try {
      // Load brand assets for context
      const brandMaterials = JSON.parse(localStorage.getItem('brandMaterials') || '[]');
      const brandProfile = JSON.parse(localStorage.getItem('brandProfile') || 'null');
      const brandVoice = JSON.parse(localStorage.getItem('brandVoice') || 'null');
      const brandColors = JSON.parse(localStorage.getItem('brandColors') || '[]');
      const brandFonts = JSON.parse(localStorage.getItem('brandFonts') || '[]');

      // Load from Production Room assets first - BUT filter out generic suggestions
      const rawProductionAssets = JSON.parse(localStorage.getItem('productionAssets') || '[]');
      const lastUsername = localStorage.getItem('lastScannedUsername');
      
      // CRITICAL: Filter out generic suggestions that match the old template pattern
      const productionAssets = rawProductionAssets.filter((asset: ContentAsset) => {
        if (!asset.title) return false;
        const titleLower = asset.title.toLowerCase();
        const descLower = (asset.description || '').toLowerCase();

        // Hard filter for legacy generic templates (always remove)
        const genericPatterns = [
          'content creation',
          'brand building',
          'what i\'ve learned',
          'why content creation matters now',
          'hot take on',
          'content creation explained',
          'you finally get',
          'deep dive:',
          'pov:'
        ];

        const isGeneric = genericPatterns.some((p) => titleLower.includes(p) || descLower.includes(p));
        return !isGeneric;
      });
      
      setUsername(lastUsername);
      
      // Try to load actual content ideas from scan results
      const lastScanId = localStorage.getItem('lastScanId');
      let contentIdeasFromScan: any[] = [];
      
      if (lastScanId) {
        try {
          const results = await getScanResults(lastScanId);
          // #region agent log
          fetch('http://127.0.0.1:7242/ingest/62bd50d3-9960-40ff-8da7-b4d57e001c2d',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'ContentHubView.tsx:360',message:'getScanResults response',data:{lastScanId,success:results.success,hasContentIdeas:!!results.data?.contentIdeas,contentIdeasCount:results.data?.contentIdeas?.length||0},timestamp:Date.now(),sessionId:'debug-session',hypothesisId:'H3'})}).catch(()=>{});
          // #endregion
          if (results.success && results.data?.contentIdeas && Array.isArray(results.data.contentIdeas)) {
            contentIdeasFromScan = results.data.contentIdeas;
          }
        } catch (e) {
          console.error('Error fetching scan results:', e);
        }
      }
      
      // Fallback to localStorage scan results - WITH VALIDATION
      if (contentIdeasFromScan.length === 0) {
        const lastScanResults = localStorage.getItem('lastScanResults');
        const currentUsername = localStorage.getItem('lastScannedUsername');
        const currentTimestamp = localStorage.getItem('lastScanTimestamp');
        
        // #region agent log
        fetch('http://127.0.0.1:7242/ingest/62bd50d3-9960-40ff-8da7-b4d57e001c2d',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'ContentHubView.tsx:loadContent:FALLBACK',message:'Trying localStorage fallback',data:{hasLastScanResults:!!lastScanResults,currentUsername,currentTimestamp},timestamp:Date.now(),sessionId:'debug-session',hypothesisId:'H2'})}).catch(()=>{});
        // #endregion
        
        if (lastScanResults) {
          try {
            const parsed = JSON.parse(lastScanResults);
            const cachedUsername = parsed.scanUsername || parsed.username;
            const cachedTimestamp = parsed.timestamp || parsed.scanTimestamp;
            
            // Validate username only - timestamp validation was too strict
            const usernameValid = currentUsername && cachedUsername && 
              currentUsername.toLowerCase() === cachedUsername.toLowerCase();
            
            // #region agent log
            fetch('http://127.0.0.1:7242/ingest/62bd50d3-9960-40ff-8da7-b4d57e001c2d',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'ContentHubView.tsx:loadContent:CACHE_CHECK',message:'Cache validation',data:{currentUsername,cachedUsername,usernameValid,hasContentIdeas:!!parsed.contentIdeas,contentIdeasCount:parsed.contentIdeas?.length||0},timestamp:Date.now(),sessionId:'debug-session',hypothesisId:'H4'})}).catch(()=>{});
            // #endregion
            
            if (usernameValid && parsed.contentIdeas && Array.isArray(parsed.contentIdeas)) {
              console.log(`✅ Content Hub: Loading ${parsed.contentIdeas.length} ideas from cache for ${cachedUsername}`);
              contentIdeasFromScan = parsed.contentIdeas;
            } else {
              console.log('⚠️ Content Hub: Cache invalid - username mismatch or no content ideas', { currentUsername, cachedUsername, hasIdeas: !!parsed.contentIdeas });
            }
          } catch (e) {
            console.error('Error parsing scan results:', e);
          }
        }
      }
      
      // Load additional context for enhancement - WITH VALIDATION
      const activeStrategy = JSON.parse(localStorage.getItem('activeContentStrategy') || 'null');
      const cachedResults = localStorage.getItem('lastScanResults');
      const currentUsername = localStorage.getItem('lastScannedUsername');
      const currentTimestamp = localStorage.getItem('lastScanTimestamp');
      
      let competitorIntelligence: any[] = [];
      let brandDNA: any = null;
      
      // Validate cache before using
      if (cachedResults && currentUsername && currentTimestamp) {
        try {
          const parsed = JSON.parse(cachedResults);
          const cachedUsername = parsed.scanUsername || parsed.username;
          const cachedTimestamp = parsed.timestamp || parsed.scanTimestamp;
          
          const usernameValid = cachedUsername && cachedUsername.toLowerCase() === currentUsername.toLowerCase();
          const timestampValid = cachedTimestamp && (parseInt(currentTimestamp) - parseInt(cachedTimestamp)) < 3600000;
          
          if (usernameValid && timestampValid) {
            competitorIntelligence = parsed.competitorIntelligence || [];
            brandDNA = parsed.brandDNA || null;
          }
        } catch (e) {
          console.error('Error validating cache:', e);
        }
      }
      
      if (cachedResults) {
        try {
          const parsedResults = JSON.parse(cachedResults);
          competitorIntelligence = parsedResults.competitorIntelligence || [];
          brandDNA = parsedResults.brandDNA || null;
        } catch (e) {
          console.error('Error parsing scan results for context:', e);
        }
      }
      
      // Filter out any generic content ideas before enhancement
      // Extract brand name without domain extension (airbnb.com -> airbnb)
      const brandNameLower = (lastUsername || '').toLowerCase().replace(/\.(com|net|org|io|co|app)$/i, '').replace(/^www\./, '');
      const isGenericIdea = (idea: any) => {
        const title = (idea.title || '').toLowerCase();
        const desc = (idea.description || '').toLowerCase();
        const genericPatterns = [
          'content creation',
          'brand building', 
          'what i\'ve learned',
          'why content creation matters now',
          'content creation explained',
          'you finally get'
        ];
        // Only filter if it matches generic patterns AND doesn't mention the brand at all
        const hitsGeneric = genericPatterns.some((p) => title.includes(p) || desc.includes(p));
        const hasBrand = brandNameLower && (title.includes(brandNameLower) || desc.includes(brandNameLower));
        // Only filter out truly generic content - keep anything that mentions the brand
        return hitsGeneric && !hasBrand;
      };
      // Log before filtering
      console.log(`Content Hub: ${contentIdeasFromScan.length} ideas before generic filter`);
      // #region agent log
      fetch('http://127.0.0.1:7242/ingest/62bd50d3-9960-40ff-8da7-b4d57e001c2d',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'ContentHubView.tsx:loadContent:BEFORE_FILTER',message:'Before generic filter',data:{countBefore:contentIdeasFromScan.length,firstThreeTitles:contentIdeasFromScan.slice(0,3).map((i:any)=>i.title)},timestamp:Date.now(),sessionId:'debug-session',hypothesisId:'H5'})}).catch(()=>{});
      // #endregion
      contentIdeasFromScan = contentIdeasFromScan.filter((idea) => !isGenericIdea(idea));
      // #region agent log
      fetch('http://127.0.0.1:7242/ingest/62bd50d3-9960-40ff-8da7-b4d57e001c2d',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'ContentHubView.tsx:loadContent:AFTER_FILTER',message:'After generic filter',data:{countAfter:contentIdeasFromScan.length},timestamp:Date.now(),sessionId:'debug-session',hypothesisId:'H5'})}).catch(()=>{});
      // #endregion
      console.log(`Content Hub: ${contentIdeasFromScan.length} ideas after generic filter`);
      
      // Enhance content ideas with brand assets, strategy, and competitor context
      const enhancedIdeas = await enhanceContentIdeasWithContext(contentIdeasFromScan, {
        brandMaterials,
        brandProfile,
        brandVoice,
        brandColors,
        brandFonts,
        activeStrategy,
        competitorIntelligence,
        brandDNA
      });
      
      if (enhancedIdeas.length > 0) {
        contentIdeasFromScan = enhancedIdeas;
      }
      
      // Convert content ideas to ContentAsset format
      // #region agent log
      fetch('http://127.0.0.1:7242/ingest/62bd50d3-9960-40ff-8da7-b4d57e001c2d',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'ContentHubView.tsx:478',message:'contentIdeasFromScan check',data:{contentIdeasCount:contentIdeasFromScan.length,firstIdea:contentIdeasFromScan[0]?.title||'none'},timestamp:Date.now(),sessionId:'debug-session',hypothesisId:'H3'})}).catch(()=>{});
      // #endregion
      if (contentIdeasFromScan.length > 0) {
        const brandSpecificAssets = contentIdeasFromScan.map((idea: any, index: number) => {
          // Map platform names
          const platformMap: Record<string, string> = {
            'twitter': 'X',
            'x': 'X',
            'linkedin': 'LINKEDIN',
            'instagram': 'INSTAGRAM',
            'tiktok': 'TIKTOK',
            'youtube': 'YOUTUBE',
            'podcast': 'PODCAST',
            'facebook': 'FACEBOOK'
          };
          
          // Map format types
          const formatMap: Record<string, string> = {
            'post': 'document',
            'thread': 'thread',
            'video': 'video',
            'carousel': 'carousel',
            'reel': 'reel',
            'podcast': 'podcast',
            'audio': 'audio'
          };
          
          const platform = platformMap[idea.platform?.toLowerCase() || 'twitter'] || 'X';
          const type = formatMap[idea.format?.toLowerCase() || 'post'] || 'document';
          
          return {
            id: `content_idea_${index}`,
            title: idea.title || 'Untitled Content',
            description: idea.description || '',
            platform: platform,
            status: 'suggested' as const,
            type: type as any,
            timeAgo: 'AI suggested',
            basedOn: idea.theme || '',
            theme: idea.theme || ''
          };
        });
        
        // ONLY use brand-specific assets from backend - DO NOT merge with old productionAssets
        // This ensures we never show generic suggestions
        setAssets(brandSpecificAssets);
        // #region agent log
        fetch('http://127.0.0.1:7242/ingest/62bd50d3-9960-40ff-8da7-b4d57e001c2d',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'ContentHubView.tsx:524',message:'setAssets CALLED',data:{assetCount:brandSpecificAssets.length,firstAssetTitle:brandSpecificAssets[0]?.title||'none'},timestamp:Date.now(),sessionId:'debug-session',hypothesisId:'H3'})}).catch(()=>{});
        // #endregion
        localStorage.setItem('productionAssets', JSON.stringify(brandSpecificAssets));
        
        // Dispatch event to notify other components that content hub was updated
        console.log('📡 Content Hub: Dispatching contentHubUpdated event');
        window.dispatchEvent(new CustomEvent('contentHubUpdated', {
          detail: {
            assets: brandSpecificAssets,
            contentIdeas: contentIdeasFromScan,
            timestamp: Date.now(),
            source: 'ContentHubView'
          }
        }));
        return;
      }
      
      // CRITICAL: NEVER use generic fallback suggestions - only show real content ideas from backend
      // If no content ideas available, show empty state or wait for scan to complete
      console.warn('⚠️ Content Hub: No content ideas from scan - clearing ALL assets including old productionAssets');
      
      // #region agent log - H9: Check if clearing path is reached
      fetch('http://127.0.0.1:7242/ingest/62bd50d3-9960-40ff-8da7-b4d57e001c2d',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'ContentHubView.tsx:737',message:'CLEARING ASSETS - NO CONTENT IDEAS',data:{reason:'No content ideas from scan'},timestamp:Date.now(),sessionId:'debug-session',hypothesisId:'H9'})}).catch(()=>{});
      // #endregion
      
      // Clear ALL assets - including any old generic suggestions in productionAssets
      setAssets([]);
      localStorage.removeItem('productionAssets');
      
      // Also clear any generic suggestions that might be in productionAssets
      const oldProductionAssets = JSON.parse(localStorage.getItem('productionAssets') || '[]');
      if (oldProductionAssets.length > 0) {
        console.warn('⚠️ Content Hub: Found old productionAssets, clearing them');
        localStorage.removeItem('productionAssets');
      }
    } catch (e) {
      console.error('Error loading content:', e);
      // #region agent log - H10: Check if error path is reached
      fetch('http://127.0.0.1:7242/ingest/62bd50d3-9960-40ff-8da7-b4d57e001c2d',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'ContentHubView.tsx:CATCH',message:'CLEARING ASSETS - ERROR',data:{error:String(e)},timestamp:Date.now(),sessionId:'debug-session',hypothesisId:'H10'})}).catch(()=>{});
      // #endregion
      setAssets([]);
    }
  };

  const handleRegenerate = async () => {
    try {
    setIsRegenerating(true);
      
      // Force-fetch latest scan results to refresh cache before reloading
      const lastScanId = localStorage.getItem('lastScanId');
      const lastUsername = localStorage.getItem('lastScannedUsername');
      if (lastScanId) {
        try {
          const latest = await getScanResults(lastScanId);
          if (latest.success && latest.data) {
            const payload = {
              ...latest.data,
              scanId: lastScanId,
              scanUsername: lastUsername || latest.data?.extractedContent?.username || '',
              timestamp: Date.now()
            };
            localStorage.setItem('lastScanResults', JSON.stringify(payload));
            if (lastUsername) localStorage.setItem('lastScannedUsername', lastUsername);
            localStorage.setItem('lastScanTimestamp', Date.now().toString());
            console.log('✅ Content Hub: Refreshed cache from latest scan results');
          }
        } catch (e) {
          console.warn('Content Hub: Refresh fetch failed, falling back to cached data', e);
        }
      } else {
        console.warn('Content Hub: No lastScanId found; running cached refresh only');
      }

    await loadContent();
    } finally {
    setIsRegenerating(false);
    }
  };

  const getPlatformIcon = (platform: string) => {
    switch (platform.toUpperCase()) {
      case 'X': return <X className="w-4 h-4" />;
      case 'LINKEDIN': return <Linkedin className="w-4 h-4" />;
      case 'INSTAGRAM': return <Instagram className="w-4 h-4" />;
      case 'TIKTOK': return <Music className="w-4 h-4" />;
      case 'PODCAST': return <Mic2 className="w-4 h-4" />;
      case 'YOUTUBE': return <Play className="w-4 h-4" />;
      default: return <FileText className="w-4 h-4" />;
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'video': return <Video className="w-4 h-4" />;
      case 'image': return <ImageIcon className="w-4 h-4" />;
      case 'document': return <FileText className="w-4 h-4" />;
      case 'podcast': return <Mic2 className="w-4 h-4" />;
      case 'thread': return <FileText className="w-4 h-4" />;
      case 'reel': return <Video className="w-4 h-4" />;
      case 'carousel': return <ImageIcon className="w-4 h-4" />;
      case 'audio': return <Music className="w-4 h-4" />;
      default: return <FileText className="w-4 h-4" />;
    }
  };

  const filteredAssets = assets.filter(asset => {
    if (statusFilter !== 'all' && asset.status !== statusFilter) return false;
    if (platformFilter && asset.platform.toUpperCase() !== platformFilter.toUpperCase()) return false;
    return true;
  });

  // #region agent log - H6: Check render state
  fetch('http://127.0.0.1:7242/ingest/62bd50d3-9960-40ff-8da7-b4d57e001c2d',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'ContentHubView.tsx:RENDER',message:'Render cycle state',data:{assetsLength:assets.length,filteredAssetsLength:filteredAssets.length,statusFilter,platformFilter,firstAssetStatus:assets[0]?.status||'no-assets',firstAssetPlatform:assets[0]?.platform||'no-assets'},timestamp:Date.now(),sessionId:'debug-session',hypothesisId:'H6'})}).catch(()=>{});
  // #endregion

  const statusCounts = {
    all: assets.length,
    suggested: assets.filter(a => a.status === 'suggested').length,
    draft: assets.filter(a => a.status === 'draft').length,
    scheduled: assets.filter(a => a.status === 'scheduled').length,
    published: assets.filter(a => a.status === 'published').length,
  };

  const platformCounts: Record<string, number> = {};
  assets.forEach(asset => {
    const platform = asset.platform.toUpperCase();
    platformCounts[platform] = (platformCounts[platform] || 0) + 1;
  });

  return (
    <div className="max-w-[1600px] mx-auto p-4 sm:p-6 animate-in fade-in slide-in-from-bottom-2 duration-500">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl sm:text-3xl font-black uppercase tracking-tighter text-white mb-1 sm:mb-2">CONTENT HUB</h1>
          <p className="text-white/40 text-xs sm:text-sm">
            Content for {username ? `@${username}` : 'your brand'} • {assets.length} pieces
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2 sm:gap-3">
          <button
            onClick={handleRegenerate}
            disabled={isRegenerating}
            className="flex items-center gap-2 px-3 sm:px-4 py-2 bg-white/5 border border-white/10 rounded-lg text-xs sm:text-sm font-medium text-white hover:bg-white/10 transition-colors disabled:opacity-50"
          >
            <RefreshCw className={`w-4 h-4 ${isRegenerating ? 'animate-spin' : ''}`} />
            <span className="hidden sm:inline">Regenerate</span>
          </button>
          <button 
            onClick={() => {
              // Navigate to Production Room for podcast generation
              const event = new CustomEvent('navigateToPage', { detail: { page: 'production' } });
              window.dispatchEvent(event);
            }}
            className="flex items-center gap-2 px-3 sm:px-4 py-2 bg-orange-500 hover:bg-orange-400 text-white rounded-lg text-xs sm:text-sm font-bold transition-colors"
          >
            <Mic2 className="w-4 h-4" />
            <span className="hidden sm:inline">Podcast</span>
          </button>
          <button 
            onClick={() => {
              resetWizard();
              setShowCreateWizard(true);
            }}
            className="flex items-center gap-2 px-3 sm:px-4 py-2 bg-blue-500 hover:bg-blue-400 text-white rounded-lg text-xs sm:text-sm font-bold transition-colors"
          >
            <Plus className="w-4 h-4" />
            <span className="hidden sm:inline">Create</span>
          </button>
        </div>
      </div>

      {/* Dynamic Regeneration Indicator */}
      {isRegenerating && regenerationMessage && (
        <div className="mb-6 p-4 bg-gradient-to-r from-orange-500/10 to-purple-500/10 border border-orange-500/30 rounded-xl animate-pulse">
          <div className="flex items-center gap-3">
            <Loader2 className="w-5 h-5 text-orange-400 animate-spin" />
            <div>
              <p className="text-sm font-bold text-white">Updating Content Hub</p>
              <p className="text-xs text-white/60">{regenerationMessage}</p>
            </div>
          </div>
        </div>
      )}

      {/* Filters */}
      <div className="space-y-4 mb-6">
        {/* Status Filters */}
        <div className="flex items-center gap-2 flex-wrap">
          {(['all', 'suggested', 'draft', 'scheduled', 'published'] as const).map(status => (
            <button
              key={status}
              onClick={() => setStatusFilter(status)}
              className={`px-4 py-2 rounded-lg text-xs font-bold transition-all ${
                statusFilter === status
                  ? 'bg-white/10 text-white'
                  : 'bg-white/5 text-white/40 hover:text-white/60'
              }`}
            >
              {status.toUpperCase()} {status !== 'all' && `(${statusCounts[status]})`}
            </button>
          ))}
        </div>

        {/* Platform Filters */}
        <div className="flex items-center gap-2 flex-wrap">
          <button
            onClick={() => setPlatformFilter(null)}
            className={`w-10 h-10 rounded-full flex items-center justify-center text-xs font-bold transition-all ${
              !platformFilter
                ? 'bg-white/10 text-white'
                : 'bg-white/5 text-white/40 hover:text-white/60'
            }`}
          >
            All
          </button>
          {['X', 'LINKEDIN', 'INSTAGRAM', 'TIKTOK', 'PODCAST', 'AUDIO', 'YOUTUBE'].map(platform => (
            <button
              key={platform}
              onClick={() => setPlatformFilter(platformFilter === platform ? null : platform)}
              className={`flex items-center gap-2 px-3 py-2 rounded-full text-xs font-bold transition-all ${
                platformFilter === platform
                  ? 'bg-white/10 text-white'
                  : 'bg-white/5 text-white/40 hover:text-white/60'
              }`}
            >
              {getPlatformIcon(platform)}
              {platform} {platformCounts[platform] ? `(${platformCounts[platform]})` : '(0)'}
            </button>
          ))}
        </div>
      </div>

      {/* Content Grid */}
      {filteredAssets.length === 0 ? (
        <div className="text-center py-20">
          <Sparkles className="w-16 h-16 text-white/20 mx-auto mb-4" />
          <p className="text-white/40 text-lg mb-2">No content yet</p>
          <p className="text-white/20 text-sm">Run a digital footprint scan to generate AI content suggestions</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredAssets.map((asset) => (
            <div
              key={asset.id}
              className="bg-[#0A0A0A] border border-white/10 rounded-xl p-5 hover:border-white/20 transition-all cursor-pointer group"
            >
              <div className="flex items-start justify-between mb-3">
                <div className="w-10 h-10 rounded-lg bg-white/5 border border-white/10 flex items-center justify-center">
                  {getPlatformIcon(asset.platform)}
                </div>
                {asset.status === 'suggested' && (
                  <span className="px-2 py-1 bg-orange-500/20 text-orange-400 text-[10px] font-bold rounded">
                    AI SUGGESTED
                  </span>
                )}
              </div>
              
              <h3 className="text-sm font-bold text-white mb-2 line-clamp-2">{asset.title}</h3>
              <p className="text-xs text-white/40 mb-3 line-clamp-2">{asset.description}</p>
              
              <div className="flex items-center gap-2 mb-3">
                <span className="text-[10px] text-white/30 uppercase">
                  {asset.type.toUpperCase()} • {asset.platform}
                </span>
              </div>
              
              {asset.theme && (
                <div className="mb-3">
                  <span className="text-[10px] text-white/40">{asset.theme}</span>
                </div>
              )}
              
              <div className="flex items-center justify-between">
                <span className="text-[10px] text-white/30">{asset.timeAgo}</span>
                {asset.status === 'suggested' && (
                  <button 
                    onClick={() => {
                      // Navigate to Production Room with this asset selected
                      const event = new CustomEvent('navigateToPage', { detail: { page: 'production', assetId: asset.id } });
                      window.dispatchEvent(event);
                    }}
                    className="px-3 py-1.5 bg-orange-500 hover:bg-orange-400 text-white text-xs font-bold rounded-lg transition-colors opacity-0 group-hover:opacity-100"
                  >
                    Start Creating
                  </button>
                )}
                {asset.status === 'draft' && (
                  <span className="px-2 py-1 bg-orange-500/20 text-orange-400 text-[10px] font-bold rounded">
                    DRAFT
                  </span>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
      
      {/* Content Creation Wizard Modal */}
      {showCreateWizard && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/80 backdrop-blur-sm" onClick={() => { setShowCreateWizard(false); resetWizard(); }}></div>
          <div className="relative w-full max-w-lg bg-[#0A0A0A] border border-white/10 rounded-2xl shadow-2xl animate-in zoom-in-95 duration-200 max-h-[90vh] overflow-hidden flex flex-col">
            
            {/* Step 1: Create Content - Choose Type */}
            {wizardStep === 1 && (
              <div className="p-6">
                <h2 className="text-xl font-bold text-white mb-6">Create Content</h2>
                
                <div className="space-y-4">
                  {/* Automatic Generation */}
                  <button
                    onClick={() => { setWizardMode('automatic'); setWizardStep(2); }}
                    className="w-full p-4 border border-white/10 rounded-xl hover:border-orange-500/50 hover:bg-orange-500/5 transition-all text-left flex items-center justify-between group"
                  >
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-pink-500 rounded-xl flex items-center justify-center">
                        <Zap className="w-6 h-6 text-white" />
                      </div>
                      <div>
                        <div className="font-bold text-white">Automatic Generation</div>
                        <div className="text-sm text-white/50">Let AI create & design multiple pieces of content</div>
                      </div>
                    </div>
                    <div className="px-4 py-2 bg-orange-500 text-white rounded-lg text-sm font-medium opacity-0 group-hover:opacity-100 transition-opacity flex items-center gap-1">
                      Create <ArrowRight className="w-4 h-4" />
                    </div>
                  </button>
                  
                  {/* Manual Wizard */}
                  <button
                    onClick={() => { setWizardMode('manual'); setWizardStep(2); }}
                    className="w-full p-4 border border-white/10 rounded-xl hover:border-white/30 hover:bg-white/5 transition-all text-left flex items-center justify-between group"
                  >
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 bg-white/10 rounded-xl flex items-center justify-center">
                        <Wand2 className="w-6 h-6 text-white/60" />
                      </div>
                      <div>
                        <div className="font-bold text-white">Manual Wizards</div>
                        <div className="text-sm text-white/50">Use wizard to generate a single piece of content.</div>
                      </div>
                    </div>
                    <div className="px-4 py-2 border border-white/20 text-white rounded-lg text-sm font-medium opacity-0 group-hover:opacity-100 transition-opacity flex items-center gap-1">
                      Create <ArrowRight className="w-4 h-4" />
                    </div>
                  </button>
                </div>
              </div>
            )}
            
            {/* Step 2: Add More Content - Pick Types */}
            {wizardStep === 2 && (
              <div className="flex flex-col h-full">
                <div className="p-6 border-b border-white/10">
                  <div className="flex items-center gap-3 mb-2">
                    <button onClick={() => setWizardStep(1)} className="text-white/40 hover:text-white">
                      <ArrowLeft className="w-5 h-5" />
                    </button>
                    <h2 className="text-xl font-bold text-white">Add More Content</h2>
                  </div>
                  <p className="text-sm text-white/50 ml-8">Pick what you want AI to create for you.</p>
                </div>
                
                <div className="flex-1 overflow-y-auto p-6">
                  <div className="flex items-center justify-between text-sm text-white/40 mb-3">
                    <span>Type</span>
                    <span>Add</span>
                  </div>
                  
                  <div className="border border-white/10 rounded-xl divide-y divide-white/10">
                    {contentTypes.map((ct) => (
                      <div key={ct.id} className="flex items-center justify-between p-4">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 bg-white/10 rounded-lg flex items-center justify-center text-white/60">
                            {ct.icon}
                          </div>
                          <span className="font-medium text-white">{ct.name}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => updateContentTypeCount(ct.id, -1)}
                            className="w-8 h-8 border border-white/20 rounded-lg flex items-center justify-center text-orange-400 hover:bg-white/5"
                          >
                            −
                          </button>
                          <span className="w-10 text-center font-medium text-white">{ct.count}</span>
                          <button
                            onClick={() => updateContentTypeCount(ct.id, 1)}
                            className="w-8 h-8 border border-white/20 rounded-lg flex items-center justify-center text-orange-400 hover:bg-white/5"
                          >
                            +
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
                
                <div className="p-4 border-t border-white/10 flex items-center justify-between">
                  <button onClick={() => setWizardStep(1)} className="px-4 py-2 text-white/60 hover:bg-white/5 rounded-lg">
                    Back
                  </button>
                  <button 
                    onClick={() => setWizardStep(3)}
                    disabled={totalContentCount === 0}
                    className="px-6 py-2 bg-orange-500 hover:bg-orange-600 text-white rounded-lg font-medium disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                  >
                    Next <ArrowRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            )}
            
            {/* Step 3: Add Topic & Media */}
            {wizardStep === 3 && (
              <div className="flex flex-col h-full">
                <div className="p-6 border-b border-white/10">
                  <div className="flex items-center gap-3 mb-2">
                    <button onClick={() => setWizardStep(2)} className="text-white/40 hover:text-white">
                      <ArrowLeft className="w-5 h-5" />
                    </button>
                    <h2 className="text-xl font-bold text-white">Add Topic & Media</h2>
                  </div>
                </div>
                
                <div className="flex-1 overflow-y-auto p-6 space-y-6">
                  {/* Topic Focus */}
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <label className="text-sm font-medium text-white">Focus content on a single topic</label>
                      <span className="text-xs text-white/40">Optional</span>
                    </div>
                    <input
                      type="text"
                      value={topicFocus}
                      onChange={(e) => setTopicFocus(e.target.value)}
                      placeholder="e.g., video platforms in ai"
                      className="w-full px-4 py-3 bg-[#050505] border border-orange-500/50 rounded-xl text-white placeholder:text-white/30 focus:outline-none focus:border-orange-500 focus:ring-2 focus:ring-orange-500/20"
                    />
                  </div>
                  
                  {/* Media Upload */}
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <label className="text-sm font-medium text-white">Use specific images and videos</label>
                      <span className="text-xs text-white/40">Optional</span>
                    </div>
                    <div className="border-2 border-dashed border-orange-500/30 rounded-xl p-8 text-center bg-orange-500/5">
                      <div className="w-12 h-12 mx-auto mb-3 bg-gradient-to-br from-orange-400 via-pink-400 to-purple-500 rounded-lg flex items-center justify-center">
                        <ImageIcon className="w-6 h-6 text-white" />
                      </div>
                      <label className="cursor-pointer">
                        <span className="inline-flex items-center gap-2 px-4 py-2 bg-white/10 border border-white/20 rounded-lg text-sm font-medium text-white hover:bg-white/20">
                          <Upload className="w-4 h-4" />
                          Choose Files
                        </span>
                        <input type="file" multiple accept="image/*,video/*" className="hidden" onChange={(e) => setUploadedFiles(Array.from(e.target.files || []))} />
                      </label>
                      <p className="text-xs text-white/40 mt-3">Supports png, jpg, jpeg, mp4, mpeg, avi</p>
                    </div>
                    {uploadedFiles.length > 0 && (
                      <div className="mt-2 text-sm text-white/60">{uploadedFiles.length} file(s) selected</div>
                    )}
                  </div>
                  
                  {/* Note */}
                  <div className="flex items-start gap-3 p-4 bg-white/5 border border-white/10 rounded-xl">
                    <span className="text-white/40">💡</span>
                    <div>
                      <div className="font-medium text-white text-sm">Please note</div>
                      <div className="text-xs text-white/50">Recently added Brand Kit images and video require a few minutes to process before AI can automatically use them.</div>
                    </div>
                  </div>
                </div>
                
                <div className="p-4 border-t border-white/10 flex items-center justify-between">
                  <button onClick={() => setWizardStep(2)} className="px-4 py-2 text-white/60 hover:bg-white/5 rounded-lg">
                    Back
                  </button>
                  <div className="flex items-center gap-2">
                    <button 
                      onClick={() => setWizardStep(4)}
                      className="px-4 py-2 text-white/60 hover:bg-white/5 rounded-lg"
                    >
                      Skip
                    </button>
                    <button 
                      onClick={() => setWizardStep(4)}
                      className="px-6 py-2 bg-orange-500 hover:bg-orange-600 text-white rounded-lg font-medium flex items-center gap-2"
                    >
                      Next <ArrowRight className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            )}
            
            {/* Step 4: Set Schedule */}
            {wizardStep === 4 && (
              <div className="flex flex-col h-full">
                <div className="p-6 border-b border-white/10">
                  <div className="flex items-center gap-3 mb-2">
                    <button onClick={() => setWizardStep(3)} className="text-white/40 hover:text-white">
                      <ArrowLeft className="w-5 h-5" />
                    </button>
                    <h2 className="text-xl font-bold text-white">Set Schedule</h2>
                  </div>
                  <p className="text-sm text-white/50 ml-8">When should the new content be scheduled?</p>
                </div>
                
                <div className="flex-1 p-6 space-y-3">
                  {/* Current Week */}
                  <button
                    onClick={() => setSelectedSchedule('current')}
                    className={`w-full p-4 border rounded-xl text-left flex items-center justify-between transition-all ${
                      selectedSchedule === 'current' 
                        ? 'border-orange-500/50 bg-orange-500/10' 
                        : 'border-white/10 hover:border-white/20'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${
                        selectedSchedule === 'current' ? 'border-orange-500' : 'border-white/30'
                      }`}>
                        {selectedSchedule === 'current' && <div className="w-2.5 h-2.5 bg-orange-500 rounded-full" />}
                      </div>
                      <span className="font-medium text-white">{currentWeek.start}-{currentWeek.end}</span>
                    </div>
                    <span className="text-sm text-white/50">Current Week</span>
                  </button>
                  
                  {/* Next Week */}
                  <button
                    onClick={() => setSelectedSchedule('next')}
                    className={`w-full p-4 border rounded-xl text-left flex items-center justify-between transition-all ${
                      selectedSchedule === 'next' 
                        ? 'border-orange-500/50 bg-orange-500/10' 
                        : 'border-white/10 hover:border-white/20'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${
                        selectedSchedule === 'next' ? 'border-orange-500' : 'border-white/30'
                      }`}>
                        {selectedSchedule === 'next' && <div className="w-2.5 h-2.5 bg-orange-500 rounded-full" />}
                      </div>
                      <span className="font-medium text-white">{nextWeek.start}-{nextWeek.end}</span>
                    </div>
                    <span className="text-sm text-white/50">Next Week</span>
                  </button>
                </div>
                
                <div className="p-4 border-t border-white/10 flex items-center justify-between">
                  <button onClick={() => setWizardStep(3)} className="px-4 py-2 text-white/60 hover:bg-white/5 rounded-lg">
                    Back
                  </button>
                  <button 
                    onClick={handleGenerateContent}
                    disabled={isGenerating}
                    className="px-6 py-2 bg-orange-500 hover:bg-orange-600 text-white rounded-lg font-medium disabled:opacity-50 flex items-center gap-2"
                  >
                    {isGenerating ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" />
                        Generating...
                      </>
                    ) : (
                      <>
                        Generate Content
                      </>
                    )}
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default ContentHubView;

