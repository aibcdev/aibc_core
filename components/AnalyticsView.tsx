import React, { useState, useEffect } from 'react';
import { Loader2, AlertCircle, ArrowRight, Instagram, Facebook, Linkedin, Mail, FileText, Music, Check, TrendingUp, Sparkles } from 'lucide-react';

interface PlatformData {
  platform: string;
  performance: number; // percentage change
  whatsWorking: string[];
  areasForImprovement: string[];
  icon: React.ReactNode;
  iconColor: string;
}

interface AnalyticsData {
  platforms: PlatformData[];
  isLoading: boolean;
  error?: string;
}

interface CompetitiveComparison {
  companyMetrics: {
    estimatedEngagementRate: string;
    postingFrequency: string;
    topPlatform: string;
    contentStrength: string;
  };
  competitorComparison: Array<{
    competitor: string;
    engagementComparison: string;
    frequencyComparison: string;
    platformOverlap: string[];
    theyWinAt: string;
    youWinAt: string;
  }>;
  overallRanking: {
    position: number;
    totalCompetitors: number;
    trend: string;
  };
  recommendations: string[];
}

// Platform definitions for integration cards
const platformsToShow = [
  { id: 'x', name: 'X / Twitter', icon: <span className="text-xl font-bold text-white">𝕏</span>, bgColor: 'bg-black' },
  { id: 'linkedin', name: 'LinkedIn', icon: <Linkedin className="w-6 h-6 text-white" />, bgColor: 'bg-blue-600' },
  { id: 'instagram', name: 'Instagram', icon: <Instagram className="w-6 h-6 text-white" />, bgColor: 'bg-gradient-to-br from-purple-500 via-pink-500 to-orange-500' },
  { id: 'facebook', name: 'Facebook', icon: <Facebook className="w-6 h-6 text-white" />, bgColor: 'bg-blue-500' },
  { id: 'tiktok', name: 'TikTok', icon: <Music className="w-6 h-6 text-white" />, bgColor: 'bg-black' },
  { id: 'youtube', name: 'YouTube', icon: <span className="text-xl font-bold text-white">▶</span>, bgColor: 'bg-red-600' },
];

const AnalyticsView: React.FC = () => {
  const [analytics, setAnalytics] = useState<AnalyticsData>({ platforms: [], isLoading: true });
  const [userName, setUserName] = useState<string>('');
  const [competitiveData, setCompetitiveData] = useState<CompetitiveComparison | null>(null);
  const [loadingCompetitive, setLoadingCompetitive] = useState(false);
  const [connectedIntegrations, setConnectedIntegrations] = useState<string[]>([]);

  // Load connected integrations from localStorage
  useEffect(() => {
    const loadIntegrations = () => {
      try {
        const stored = localStorage.getItem('integrations');
        if (stored) {
          const parsed = JSON.parse(stored);
          const connected = parsed.filter((i: any) => i.connected).map((i: any) => i.id);
          setConnectedIntegrations(connected);
        }
      } catch (e) {
        console.error('Error loading integrations:', e);
      }
    };
    loadIntegrations();
    
    // Listen for integration changes
    const handleStorageChange = () => loadIntegrations();
    window.addEventListener('storage', handleStorageChange);
    window.addEventListener('integrationChanged', handleStorageChange);
    return () => {
      window.removeEventListener('storage', handleStorageChange);
      window.removeEventListener('integrationChanged', handleStorageChange);
    };
  }, []);

  // Handle integrate button - navigate to integrations page
  const handleIntegrate = (platformId: string) => {
    window.dispatchEvent(new CustomEvent('navigateToPage', { detail: { page: 'integrations', highlightPlatform: platformId } }));
  };

  // Handle disconnect
  const handleDisconnect = (platformId: string) => {
    try {
      const stored = localStorage.getItem('integrations');
      if (stored) {
        const parsed = JSON.parse(stored);
        const updated = parsed.map((i: any) => 
          i.id === platformId ? { ...i, connected: false, handle: undefined } : i
        );
        localStorage.setItem('integrations', JSON.stringify(updated));
        setConnectedIntegrations(prev => prev.filter(id => id !== platformId));
        window.dispatchEvent(new CustomEvent('integrationChanged'));
      }
    } catch (e) {
      console.error('Error disconnecting:', e);
    }
  };

  // #region agent log
  useEffect(() => {
    fetch('http://127.0.0.1:7242/ingest/62bd50d3-9960-40ff-8da7-b4d57e001c2d',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'AnalyticsView.tsx:42',message:'AnalyticsView MOUNT',data:{analyticsLoading:analytics.isLoading,platformsCount:analytics.platforms.length,hasCompetitiveData:!!competitiveData},timestamp:Date.now(),sessionId:'debug-session',hypothesisId:'H6'})}).catch(()=>{});
  }, []);
  // #endregion

  useEffect(() => {
    // Get user name from localStorage
    const userStr = localStorage.getItem('user');
    if (userStr) {
      try {
        const user = JSON.parse(userStr);
        setUserName(user.name || user.email?.split('@')[0] || 'there');
      } catch (e) {
        setUserName('there');
      }
    } else {
      setUserName('there');
    }

    loadAnalyticsData();
    loadCompetitiveComparison();
    
    // Listen for new scan started - clear all state
    const handleNewScanStarted = (event: CustomEvent) => {
      console.log('🧹 Analytics: New scan started, clearing all state');
      const { isRescan } = event.detail;
      
      // Clear all analytics state
      setAnalytics({ platforms: [], isLoading: true });
      
      // Clear ALL localStorage cache (comprehensive)
      localStorage.removeItem('lastScanResults');
      localStorage.removeItem('lastScanId');
      localStorage.removeItem('lastScanTimestamp');
      
      console.log('✅ Analytics: All cache cleared for', isRescan ? 'rescan' : 'new scan');
      
      // Reload analytics for new scan
      setTimeout(() => {
        loadAnalyticsData();
      }, 500);
    };
    
    // Listen for scan completion - reload data
    const handleScanComplete = () => {
      console.log('📥 Analytics: Scan completed - reloading data...');
      loadAnalyticsData();
    };
    
    // Listen for strategy updates - regenerate insights based on new strategy
    const handleStrategyUpdate = (event: CustomEvent) => {
      console.log('📥 Analytics: Strategy updated - regenerating insights...', event.detail);
      loadAnalyticsData();
    };
    
    // Listen for competitor updates - update analytics
    const handleCompetitorUpdate = (event: CustomEvent) => {
      console.log('📥 Analytics: Competitor updated - refreshing...', event.detail);
      loadAnalyticsData();
    };
    
    // Listen for brand assets updates - may affect recommendations
    const handleBrandAssetsUpdate = () => {
      console.log('📥 Analytics: Brand assets updated - refreshing insights...');
      loadAnalyticsData();
    };
    
    // Listen for any data change
    const handleDataChange = (event: CustomEvent) => {
      console.log('📥 Analytics: Data changed - refreshing...', event.detail?.eventType);
      loadAnalyticsData();
    };
    
    window.addEventListener('newScanStarted', handleNewScanStarted as EventListener);
    window.addEventListener('scanComplete', handleScanComplete);
    window.addEventListener('strategyUpdated', handleStrategyUpdate as EventListener);
    window.addEventListener('competitorUpdated', handleCompetitorUpdate as EventListener);
    window.addEventListener('brandAssetsUpdated', handleBrandAssetsUpdate);
    window.addEventListener('dataChanged', handleDataChange as EventListener);
    
    return () => {
      window.removeEventListener('newScanStarted', handleNewScanStarted as EventListener);
      window.removeEventListener('scanComplete', handleScanComplete);
      window.removeEventListener('strategyUpdated', handleStrategyUpdate as EventListener);
      window.removeEventListener('competitorUpdated', handleCompetitorUpdate as EventListener);
      window.removeEventListener('brandAssetsUpdated', handleBrandAssetsUpdate);
      window.removeEventListener('dataChanged', handleDataChange as EventListener);
    };
  }, []);

  const loadAnalyticsData = async () => {
    // #region agent log
    fetch('http://127.0.0.1:7242/ingest/62bd50d3-9960-40ff-8da7-b4d57e001c2d',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'AnalyticsView.tsx:139',message:'loadAnalyticsData ENTRY',data:{hasLastScanResults:!!localStorage.getItem('lastScanResults'),lastScannedUsername:localStorage.getItem('lastScannedUsername')},timestamp:Date.now(),sessionId:'debug-session',hypothesisId:'H6'})}).catch(()=>{});
    // #endregion
    try {
      setAnalytics({ platforms: [], isLoading: true });

      // Get scan data
      const lastScanResults = localStorage.getItem('lastScanResults');
      const lastUsername = localStorage.getItem('lastScannedUsername');
      const lastTimestamp = localStorage.getItem('lastScanTimestamp');
      
      // Validate cache
      if (lastScanResults && lastUsername && lastTimestamp) {
        try {
          const parsed = JSON.parse(lastScanResults);
          const cachedUsername = parsed.scanUsername || parsed.username;
          const cachedTimestamp = parsed.timestamp || parsed.scanTimestamp;
          
          const usernameValid = cachedUsername && cachedUsername.toLowerCase() === lastUsername.toLowerCase();
          const timestampValid = cachedTimestamp && (parseInt(lastTimestamp) - parseInt(cachedTimestamp)) < 3600000;
          
          if (!usernameValid || !timestampValid) {
            console.log('⚠️ Analytics: Cache invalid - clearing');
            setAnalytics({ 
              platforms: [],
              isLoading: false, 
              error: 'Cache expired. Run a new scan.' 
            });
            return;
          }
        } catch (e) {
          console.error('Error validating cache:', e);
        }
      }
      
      if (!lastScanResults || !lastUsername) {
        // Try to generate insights from any available scan data
        const scanData = lastScanResults ? JSON.parse(lastScanResults) : null;
        if (scanData && scanData.extractedContent) {
          const platforms = ['twitter', 'linkedin', 'instagram', 'facebook', 'tiktok'];
          const platformData = generateInsightsFromData(
            { posts: scanData.extractedContent.posts || [], totalEngagement: 0, avgEngagement: 0 },
            scanData.competitorIntelligence || [],
            platforms
          );
          setAnalytics({
            platforms: platformData,
            isLoading: false
          });
        } else {
          setAnalytics({ 
            platforms: [],
            isLoading: false, 
            error: 'No scan data available. Run a digital footprint scan first.' 
          });
        }
        return;
      }

      const scanData = JSON.parse(lastScanResults);
      const competitors = scanData.competitorIntelligence || [];

      // Determine platforms from scan data or use defaults
      const platforms = ['twitter', 'linkedin', 'instagram', 'facebook', 'tiktok'];
      
      // Prepare competitor data for scraping
      const competitorData = competitors.slice(0, 5).map((c: any) => ({
        name: c.name || 'Competitor',
        username: c.xHandle || c.linkedinUrl?.split('/').pop() || c.instagramHandle || '',
        platforms: platforms
      })).filter((c: any) => c.username);

      // Try to call backend to scrape last 7 days of content
      const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001';
      
      try {
        // #region agent log
        fetch('http://127.0.0.1:7242/ingest/62bd50d3-9960-40ff-8da7-b4d57e001c2d',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'AnalyticsView.tsx:216',message:'Calling analytics API',data:{url:`${API_BASE_URL}/api/analytics/last7days`,lastUsername},timestamp:Date.now(),sessionId:'debug-session',hypothesisId:'H6'})}).catch(()=>{});
        // #endregion
        const response = await fetch(`${API_BASE_URL}/api/analytics/last7days`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            companyUsername: lastUsername,
            companyPlatforms: platforms,
            competitors: competitorData
          })
        });
        // #region agent log
        fetch('http://127.0.0.1:7242/ingest/62bd50d3-9960-40ff-8da7-b4d57e001c2d',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'AnalyticsView.tsx:230',message:'Analytics API response',data:{ok:response.ok,status:response.status},timestamp:Date.now(),sessionId:'debug-session',hypothesisId:'H6'})}).catch(()=>{});
        // #endregion

        if (response.ok) {
          const result = await response.json();
          
          if (result.success && result.data) {
            const { company, competitors: compData, insights } = result.data;
            
            // Generate platform-specific insights using AI
            const platformData = await generatePlatformInsights(company, compData, platforms);
            
            setAnalytics({
              platforms: platformData,
              isLoading: false
            });
            return;
          }
        }
      } catch (apiError) {
        // #region agent log
        fetch('http://127.0.0.1:7242/ingest/62bd50d3-9960-40ff-8da7-b4d57e001c2d',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'AnalyticsView.tsx:250',message:'Analytics API FAILED',data:{error:String(apiError)},timestamp:Date.now(),sessionId:'debug-session',hypothesisId:'H6'})}).catch(()=>{});
        // #endregion
        console.warn('Analytics API call failed, using scan data:', apiError);
      }

      // Fallback: Generate insights from existing scan data
      // #region agent log
      fetch('http://127.0.0.1:7242/ingest/62bd50d3-9960-40ff-8da7-b4d57e001c2d',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'AnalyticsView.tsx:258',message:'Fallback generateInsightsFromData',data:{hasScanData:!!scanData,postsCount:scanData?.extractedContent?.posts?.length||0,competitorsCount:competitors.length},timestamp:Date.now(),sessionId:'debug-session',hypothesisId:'H6'})}).catch(()=>{});
      // #endregion
      const platformData = generateInsightsFromData(
        { posts: scanData.extractedContent?.posts || [], totalEngagement: 0, avgEngagement: 0 },
        competitors,
        platforms
      );
      
      setAnalytics({
        platforms: platformData,
        isLoading: false
      });
      
      // Dispatch event to notify other components
      console.log('📡 Analytics: Dispatching analyticsUpdated event');
      window.dispatchEvent(new CustomEvent('analyticsUpdated', {
        detail: {
          platforms: platformData,
          timestamp: Date.now(),
          source: 'AnalyticsView'
        }
      }));
    } catch (error: any) {
      console.error('Error loading analytics:', error);
      
      // Try to generate from any available scan data
      const lastScanResults = localStorage.getItem('lastScanResults');
      if (lastScanResults) {
        try {
          const scanData = JSON.parse(lastScanResults);
          const platforms = ['twitter', 'linkedin', 'instagram', 'facebook', 'tiktok'];
          const platformData = generateInsightsFromData(
            { posts: scanData.extractedContent?.posts || [], totalEngagement: 0, avgEngagement: 0 },
            scanData.competitorIntelligence || [],
            platforms
          );
          setAnalytics({
            platforms: platformData,
            isLoading: false,
            error: platformData.length === 0 ? 'No platform data found. Run a new scan for insights.' : undefined
          });
        } catch (e) {
          // NO MOCK DATA - show empty state with clear message
          setAnalytics({
            platforms: [],
            isLoading: false,
            error: 'Unable to load analytics. Run a digital footprint scan first.'
          });
        }
      } else {
        // NO MOCK DATA - clear message to run scan
        setAnalytics({
          platforms: [],
          isLoading: false,
          error: 'No scan data available. Run a digital footprint scan to see your analytics.'
        });
      }
    }
  };

  const loadCompetitiveComparison = async () => {
    try {
      setLoadingCompetitive(true);
      
      const lastScanResults = localStorage.getItem('lastScanResults');
      const lastUsername = localStorage.getItem('lastScannedUsername');
      
      if (!lastScanResults || !lastUsername) {
        setLoadingCompetitive(false);
        return;
      }
      
      const scanData = JSON.parse(lastScanResults);
      const competitors = scanData.competitorIntelligence || [];
      
      if (competitors.length === 0) {
        setLoadingCompetitive(false);
        return;
      }
      
      const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001';
      
      const response = await fetch(`${API_BASE_URL}/api/analytics/competitive-comparison`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          company: {
            name: lastUsername,
            username: lastUsername,
            postCount: scanData.extractedContent?.posts?.length || 0,
            platforms: Object.keys(scanData.socialLinks || {})
          },
          competitors: competitors.slice(0, 5)
        })
      });
      
      if (response.ok) {
        const result = await response.json();
        if (result.success && result.comparison) {
          setCompetitiveData(result.comparison);
        }
      }
    } catch (error) {
      console.error('Error loading competitive comparison:', error);
    } finally {
      setLoadingCompetitive(false);
    }
  };

  const generatePlatformInsights = async (company: any, competitors: any[], platforms: string[]): Promise<PlatformData[]> => {
    // Use LLM to analyze content and generate insights
    const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001';
    
    try {
      const response = await fetch(`${API_BASE_URL}/api/analytics/platform-insights`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          company,
          competitors,
          platforms
        })
      });

      if (response.ok) {
        const result = await response.json();
        if (result.success && result.platforms) {
          return result.platforms;
        }
      }
    } catch (error) {
      console.error('Error generating platform insights:', error);
    }

    // Fallback: generate insights from scraped data
    return generateInsightsFromData(company, competitors, platforms);
  };

  const generateInsightsFromData = (company: any, competitors: any[], platforms: string[]): PlatformData[] => {
    // Get actual scan data to generate brand-specific insights
    const lastScanResults = localStorage.getItem('lastScanResults');
    const scanData = lastScanResults ? JSON.parse(lastScanResults) : null;
    
    const brandDNA = scanData?.brandDNA || {};
    const extractedContent = scanData?.extractedContent || {};
    const posts = extractedContent.posts || [];
    const themes = extractedContent.content_themes || [];
    const voice = brandDNA.voice || {};
    
    const platformMap: Record<string, { name: string; icon: React.ReactNode; color: string }> = {
      instagram: { name: 'Instagram', icon: <Instagram className="w-5 h-5" />, color: 'bg-gradient-to-br from-orange-500 to-pink-500' },
      facebook: { name: 'Facebook', icon: <Facebook className="w-5 h-5" />, color: 'bg-blue-600' },
      linkedin: { name: 'LinkedIn', icon: <Linkedin className="w-5 h-5" />, color: 'bg-blue-700' },
      twitter: { name: 'Twitter', icon: <Linkedin className="w-5 h-5" />, color: 'bg-black' },
      tiktok: { name: 'TikTok', icon: <Music className="w-5 h-5" />, color: 'bg-black' },
      blog: { name: 'Blog', icon: <FileText className="w-5 h-5" />, color: 'bg-green-600' },
      email: { name: 'Email', icon: <Mail className="w-5 h-5" />, color: 'bg-black' },
    };

    return platforms.map(platform => {
      const platformInfo = platformMap[platform] || { name: platform, icon: <FileText className="w-5 h-5" />, color: 'bg-gray-600' };
      
      // Calculate performance based on actual engagement if available
      // NO FAKE DATA - only use real metrics or show 0
      let performance = 0;
      if (company?.totalEngagement && company?.avgEngagement) {
        // Estimate performance based on engagement metrics
        performance = Math.min(30, Math.max(1, Math.floor(company.avgEngagement / 100)));
      } else if (posts.length > 0) {
        // Calculate from actual posts engagement
        const platformPosts = posts.filter((p: any) => p.platform === platform);
        if (platformPosts.length > 0) {
          const totalEngagement = platformPosts.reduce((sum: number, p: any) => {
            const likes = p.engagement?.likes || 0;
            const comments = p.engagement?.comments || 0;
            const shares = p.engagement?.shares || 0;
            return sum + likes + comments + shares;
          }, 0);
          performance = Math.min(30, Math.max(0, Math.floor(totalEngagement / platformPosts.length / 100)));
        }
      }
      // NO RANDOM FALLBACK - if no data, performance stays at 0
      
      // Generate brand-specific insights based on actual content
      const whatsWorking = generateBrandSpecificWhatsWorking(platform, posts, themes, voice, brandDNA);
      const areasForImprovement = generateBrandSpecificImprovements(platform, posts, themes, voice, competitors, brandDNA);

      return {
        platform: platformInfo.name,
        performance,
        whatsWorking,
        areasForImprovement,
        icon: platformInfo.icon,
        iconColor: platformInfo.color
      };
    });
  };

  const generateBrandSpecificWhatsWorking = (platform: string, posts: any[], themes: string[], voice: any, brandDNA?: any): string[] => {
    const insights: string[] = [];
    const brandName = localStorage.getItem('lastScannedUsername')?.replace(/^https?:\/\//, '').replace(/^www\./, '').split('.')[0] || '';
    const industry = brandDNA?.industry || '';
    const primaryTheme = themes[0] || brandDNA?.themes?.[0] || brandDNA?.corePillars?.[0] || '';
    
    // Analyze actual content patterns
    if (posts.length > 0) {
      const avgLength = posts.reduce((sum, p) => sum + (p.content?.length || 0), 0) / posts.length;
      const platformPosts = posts.filter((p: any) => p.platform === platform);
      
      if (platform === 'instagram' || platform === 'tiktok') {
        if (avgLength < 200) insights.push('Short, punchy captions');
        if (primaryTheme) insights.push(`Focus on ${primaryTheme} content`);
        if (voice?.tone === 'casual' || voice?.formality === 'casual') insights.push('Authentic, casual tone');
        if (platformPosts.some((p: any) => p.media_urls?.length > 0)) insights.push('Strong visual content');
      } else if (platform === 'linkedin' || platform === 'twitter') {
        if (avgLength > 500) insights.push('In-depth, value-driven posts');
        if (primaryTheme) insights.push(`${primaryTheme} expertise and insights`);
        if (voice?.style === 'professional' || voice?.formality === 'professional') insights.push('Professional, authoritative voice');
        if (platformPosts.some((p: any) => p.content?.includes('?'))) insights.push('Engaging question-driven content');
      }
    } else if (primaryTheme || industry) {
      // Even without posts, use brand DNA
      if (primaryTheme) insights.push(`Focus on ${primaryTheme} content`);
      if (industry) insights.push(`${industry} industry expertise`);
      if (brandDNA?.voice?.tones?.[0]) insights.push(`${brandDNA.voice.tones[0]} brand voice`);
    }
    
    // Add platform-specific defaults only if we don't have enough brand-specific insights
    if (insights.length < 3) {
      const defaults = getWhatsWorking(platform);
      defaults.forEach(defaultInsight => {
        if (insights.length < 3 && !insights.includes(defaultInsight)) {
          insights.push(defaultInsight);
        }
      });
    }
    
    return insights.slice(0, 3);
  };

  const generateBrandSpecificImprovements = (platform: string, posts: any[], themes: string[], voice: any, competitors: any[], brandDNA?: any): string[] => {
    const improvements: string[] = [];
    const brandName = localStorage.getItem('lastScannedUsername')?.replace(/^https?:\/\//, '').replace(/^www\./, '').split('.')[0] || '';
    const industry = brandDNA?.industry || '';
    const primaryTheme = themes[0] || brandDNA?.themes?.[0] || brandDNA?.corePillars?.[0] || '';
    
    // Analyze gaps based on actual content
    if (posts.length === 0) {
      improvements.push('Start posting regularly');
      if (primaryTheme) improvements.push(`Establish ${primaryTheme} content themes`);
      else improvements.push('Establish content themes');
    } else {
      const platformPosts = posts.filter((p: any) => p.platform === platform);
      if (platformPosts.length < 3) improvements.push('Increase posting frequency on this platform');
      
      const avgLength = posts.reduce((sum, p) => sum + (p.content?.length || 0), 0) / posts.length;
      if (platform === 'linkedin' && avgLength < 300) improvements.push('Create longer, more detailed posts');
      if (platform === 'instagram' && avgLength > 500) improvements.push('Shorten captions for better engagement');
      
      // Check for video content
      const hasVideo = posts.some((p: any) => p.platform === 'youtube' || p.media_urls?.some((url: string) => url.includes('video')));
      if (!hasVideo && (platform === 'instagram' || platform === 'tiktok')) {
        improvements.push('Add video content to increase engagement');
      }
    }
    
    // Compare with competitors if available
    if (competitors.length > 0) {
      const topCompetitor = competitors[0];
      if (topCompetitor.primaryVector) {
        improvements.push(`Match ${topCompetitor.name}'s ${topCompetitor.primaryVector} strategy`);
      }
      if (topCompetitor.theirAdvantage) {
        improvements.push(`Address ${topCompetitor.name}'s advantage: ${topCompetitor.theirAdvantage.substring(0, 50)}...`);
      }
    }
    
    // Industry-specific improvements
    if (industry) {
      if (industry.toLowerCase().includes('web3') || industry.toLowerCase().includes('crypto')) {
        improvements.push('Leverage Web3 community engagement strategies');
      } else if (industry.toLowerCase().includes('travel')) {
        improvements.push('Showcase unique travel experiences');
      } else if (industry.toLowerCase().includes('tech') || industry.toLowerCase().includes('ai')) {
        improvements.push('Share technical insights and use cases');
      }
    }
    
    // Add platform-specific defaults only if we don't have enough brand-specific improvements
    if (improvements.length < 3) {
      const defaults = getAreasForImprovement(platform);
      defaults.forEach(defaultImprovement => {
        if (improvements.length < 3 && !improvements.includes(defaultImprovement)) {
          improvements.push(defaultImprovement);
        }
      });
    }
    
    return improvements.slice(0, 3);
  };

  const getWhatsWorking = (platform: string): string[] => {
    const insights: Record<string, string[]> = {
      instagram: ['Captions with local expertise', 'Videos in social posts', 'Specific hashtags'],
      facebook: ['Longer stories with emotional connection', 'Community-focused posts'],
      linkedin: ['Share expert-led, insight-rich content', 'Videos in social posts'],
      twitter: ['Short, punchy insights', 'Thread engagement', 'Timely responses'],
      tiktok: ['Raw, unpolished videos', 'Trending audio', '"Before/after" moments'],
      blog: ['Strong hook in the first 2-3 sentences', 'Clear subheadings', 'Expert quotes'],
      email: ['Short subject lines', 'Intros based on user behavior', 'One primary CTA'],
    };
    return insights[platform] || ['Engaging content', 'Consistent posting', 'Audience interaction'];
  };

  const getAreasForImprovement = (platform: string): string[] => {
    const improvements: Record<string, string[]> = {
      instagram: ['More focus on pain points', 'Better images', 'Shorter text overlays'],
      facebook: ['Outdated creative', 'Respond faster', 'Shorten long paragraphs'],
      linkedin: ['Overly promotional', 'Diversify post formats', 'Improve consistency'],
      twitter: ['Increase posting frequency', 'Better use of visuals', 'More engagement'],
      tiktok: ['Improve lighting and audio', 'Stronger hooks', 'Overly polished content'],
      blog: ['SEO structure', 'Overly dense paragraphs', 'Improve internal linking'],
      email: ['More focus on pain points', 'Better images', 'Shorter text overlays'],
    };
    return improvements[platform] || ['Increase engagement', 'Better visuals', 'More consistent posting'];
  };

  // NO MOCK DATA - Only generate from real scan data or show empty state
  const generateEmptyPlatformData = (): PlatformData[] => {
    // Return empty array - we don't want to show fake data
    return [];
  };

  return (
    <div className="min-h-screen bg-[#050505]">
      <div className="max-w-7xl mx-auto px-6 py-8">
        {/* Welcome Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-black uppercase tracking-tighter text-white mb-2">
            Analytics
          </h1>
          <p className="text-white/40 text-sm">Performance insights across all platforms</p>
        </div>

        {/* Loading State */}
        {analytics.isLoading && (
          <div className="flex items-center justify-center py-20">
            <Loader2 className="w-8 h-8 text-white/40 animate-spin" />
          </div>
        )}

        {/* Error State */}
        {analytics.error && !analytics.isLoading && (
          <div className="bg-amber-500/10 border border-amber-500/20 rounded-xl p-4 mb-6">
            <div className="flex items-center gap-3">
              <AlertCircle className="w-5 h-5 text-amber-400" />
              <p className="text-sm text-white/70">{analytics.error}</p>
            </div>
          </div>
        )}

        {/* Platform Integration Cards */}
        {!analytics.isLoading && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
            {platformsToShow.map((platform, index) => {
              const isConnected = connectedIntegrations.includes(platform.id);
              return (
                <div key={index} className="bg-[#0A0A0A] border border-white/10 rounded-xl p-6 hover:border-white/20 transition-all">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-3">
                      <div className={`w-12 h-12 ${platform.bgColor} rounded-lg flex items-center justify-center`}>
                        {platform.icon}
                      </div>
                      <div>
                        <h3 className="text-sm font-bold text-white">{platform.name}</h3>
                        {isConnected ? (
                          <div className="flex items-center gap-1 text-green-400 text-xs">
                            <Check className="w-3 h-3" />
                            <span>Connected</span>
                          </div>
                        ) : (
                          <span className="text-xs text-white/40">Not connected</span>
                        )}
                      </div>
                    </div>
                  </div>
                  
                  {isConnected ? (
                    <div className="space-y-3">
                      <div className="bg-white/5 rounded-lg p-3">
                        <p className="text-xs text-white/50 mb-2">Analytics coming soon</p>
                        <p className="text-[10px] text-white/30">Real-time data will appear here once the {platform.name} API is fully connected.</p>
                      </div>
                      <button
                        onClick={() => handleDisconnect(platform.id)}
                        className="w-full px-4 py-2 bg-red-500/10 border border-red-500/20 rounded-lg text-xs font-medium text-red-400 hover:bg-red-500/20 transition-colors"
                      >
                        Disconnect
                      </button>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      <p className="text-xs text-white/50">
                        Connect your {platform.name} account to see real analytics, performance metrics, and AI-powered insights.
                      </p>
                      <button
                        onClick={() => handleIntegrate(platform.id)}
                        className="w-full px-4 py-2 bg-orange-500 hover:bg-orange-400 rounded-lg text-xs font-bold text-white transition-colors flex items-center justify-center gap-2"
                      >
                        <ArrowRight className="w-3 h-3" />
                        Integrate {platform.name}
                      </button>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}

        {/* Competitive Comparison Section */}
        {competitiveData && (
          <div className="mt-8">
            <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-blue-400" />
              Competitive Analysis
            </h2>
            
            {/* Your Metrics vs Market */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
              <div className="bg-[#0A0A0A] border border-white/10 rounded-xl p-4">
                <p className="text-xs text-white/40 uppercase mb-1">Engagement Rate</p>
                <p className="text-2xl font-bold text-green-400">{competitiveData.companyMetrics?.estimatedEngagementRate || 'N/A'}</p>
              </div>
              <div className="bg-[#0A0A0A] border border-white/10 rounded-xl p-4">
                <p className="text-xs text-white/40 uppercase mb-1">Posting Frequency</p>
                <p className="text-2xl font-bold text-white">{competitiveData.companyMetrics?.postingFrequency || 'N/A'}</p>
              </div>
              <div className="bg-[#0A0A0A] border border-white/10 rounded-xl p-4">
                <p className="text-xs text-white/40 uppercase mb-1">Top Platform</p>
                <p className="text-2xl font-bold text-blue-400">{competitiveData.companyMetrics?.topPlatform || 'N/A'}</p>
              </div>
              <div className="bg-[#0A0A0A] border border-white/10 rounded-xl p-4">
                <p className="text-xs text-white/40 uppercase mb-1">Market Rank</p>
                <p className="text-2xl font-bold text-amber-400">
                  #{competitiveData.overallRanking?.position || '?'} of {competitiveData.overallRanking?.totalCompetitors || '?'}
                </p>
              </div>
            </div>
            
            {/* Competitor Comparison Table */}
            {competitiveData.competitorComparison && competitiveData.competitorComparison.length > 0 && (
              <div className="bg-[#0A0A0A] border border-white/10 rounded-xl overflow-hidden mb-6">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-white/10">
                      <th className="text-left text-xs text-white/40 uppercase p-4">Competitor</th>
                      <th className="text-left text-xs text-white/40 uppercase p-4">Engagement vs You</th>
                      <th className="text-left text-xs text-white/40 uppercase p-4">They Win At</th>
                      <th className="text-left text-xs text-white/40 uppercase p-4">You Win At</th>
                    </tr>
                  </thead>
                  <tbody>
                    {competitiveData.competitorComparison.map((comp, idx) => (
                      <tr key={idx} className="border-b border-white/5">
                        <td className="p-4 text-white font-medium">{comp.competitor}</td>
                        <td className="p-4">
                          <span className={`text-sm font-bold ${comp.engagementComparison?.startsWith('+') ? 'text-green-400' : comp.engagementComparison?.startsWith('-') ? 'text-red-400' : 'text-white/60'}`}>
                            {comp.engagementComparison || 'N/A'}
                          </span>
                        </td>
                        <td className="p-4 text-sm text-red-400/80">{comp.theyWinAt || 'N/A'}</td>
                        <td className="p-4 text-sm text-green-400/80">{comp.youWinAt || 'N/A'}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
            
            {/* AI Recommendations */}
            {competitiveData.recommendations && competitiveData.recommendations.length > 0 && (
              <div className="bg-[#0A0A0A] border border-white/10 rounded-xl p-6">
                <h3 className="text-sm font-bold text-white mb-3 flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-amber-400" />
                  AI Recommendations
                </h3>
                <ul className="space-y-2">
                  {competitiveData.recommendations.map((rec, idx) => (
                    <li key={idx} className="flex items-start gap-2 text-sm text-white/70">
                      <Check className="w-4 h-4 text-green-400 mt-0.5 flex-shrink-0" />
                      {rec}
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        )}
        
        {/* Loading Competitive Data */}
        {loadingCompetitive && (
          <div className="mt-8 flex items-center justify-center py-8">
            <Loader2 className="w-6 h-6 text-white/40 animate-spin mr-2" />
            <span className="text-white/40 text-sm">Loading competitive analysis...</span>
          </div>
        )}

        {/* Strategic Recommendations Section */}
        {!analytics.isLoading && analytics.platforms.length > 0 && !competitiveData && (
          <div className="mt-8">
            <h2 className="text-xl font-bold text-white mb-4">Strategic Recommendations</h2>
            <div className="bg-[#0A0A0A] border border-white/10 rounded-xl p-6">
              <p className="text-sm text-white/70 leading-relaxed">
                Based on your performance across all platforms, focus on increasing video content production 
                and improving engagement rates through more personalized messaging. Consider A/B testing 
                different content formats to identify what resonates best with your audience.
              </p>
            </div>
          </div>
        )}

        {/* Empty State */}
        {!analytics.isLoading && analytics.platforms.length === 0 && !analytics.error && (
          <div className="text-center py-20">
            <p className="text-white/60 mb-4">No platform data available</p>
            <p className="text-sm text-white/40">Run a digital footprint scan to see your analytics</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default AnalyticsView;
