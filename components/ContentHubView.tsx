import React, { useState, useEffect } from 'react';
import { Filter, RefreshCw, Plus, FileText, Video, Image as ImageIcon, Mic2, Linkedin, Instagram, Music, X, Play, Sparkles, Loader2 } from 'lucide-react';
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

const ContentHubView: React.FC = () => {
  const [assets, setAssets] = useState<ContentAsset[]>([]);
  const [statusFilter, setStatusFilter] = useState<'all' | 'suggested' | 'draft' | 'scheduled' | 'published'>('all');
  const [platformFilter, setPlatformFilter] = useState<string | null>(null);
  const [username, setUsername] = useState<string | null>(null);
  const [isRegenerating, setIsRegenerating] = useState(false);

  useEffect(() => {
    loadContent();
    
    // Listen for new scan started - clear all state
    const handleNewScanStarted = (event: CustomEvent) => {
      console.log('🧹 Content Hub: New scan started, clearing all state');
      const { username } = event.detail;
      
      // Clear all content hub state
      setAssets([]);
      setUsername(null);
      
      // Clear localStorage cache
      localStorage.removeItem('lastScanResults');
      
      // Reload content for new scan
      setTimeout(() => {
        loadContent();
      }, 500);
    };
    
    // Listen for brand assets updates
    const handleBrandAssetsUpdate = () => {
      console.log('📥 Brand assets updated - enhancing content ideas...');
      enhanceContentIdeas();
    };
    
    // Listen for strategy updates
    const handleStrategyUpdate = (event: CustomEvent) => {
      console.log('📥 Strategy updated - regenerating content ideas...', event.detail);
      enhanceContentIdeas();
    };
    
    // Listen for competitor updates
    const handleCompetitorUpdate = (event: CustomEvent) => {
      console.log('📥 Competitor updated - updating content ideas...', event.detail);
      enhanceContentIdeas();
    };
    
    // Listen for scan completion
    const handleScanComplete = () => {
      console.log('📥 Scan completed - reloading content...');
      loadContent();
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
    window.addEventListener('scanComplete', handleScanComplete);
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
      window.removeEventListener('scanComplete', handleScanComplete);
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
    try {
      // Load brand assets for context
      const brandMaterials = JSON.parse(localStorage.getItem('brandMaterials') || '[]');
      const brandProfile = JSON.parse(localStorage.getItem('brandProfile') || 'null');
      const brandVoice = JSON.parse(localStorage.getItem('brandVoice') || 'null');
      const brandColors = JSON.parse(localStorage.getItem('brandColors') || '[]');
      const brandFonts = JSON.parse(localStorage.getItem('brandFonts') || '[]');
      
      // Load from Production Room assets first
      const productionAssets = JSON.parse(localStorage.getItem('productionAssets') || '[]');
      const lastUsername = localStorage.getItem('lastScannedUsername');
      
      setUsername(lastUsername);
      
      // Try to load actual content ideas from scan results
      const lastScanId = localStorage.getItem('lastScanId');
      let contentIdeasFromScan: any[] = [];
      
      if (lastScanId) {
        try {
          const results = await getScanResults(lastScanId);
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
        
        if (lastScanResults) {
          try {
            const parsed = JSON.parse(lastScanResults);
            const cachedUsername = parsed.scanUsername || parsed.username;
            const cachedTimestamp = parsed.timestamp || parsed.scanTimestamp;
            
            // Validate username and timestamp
            const usernameValid = currentUsername && cachedUsername && 
              currentUsername.toLowerCase() === cachedUsername.toLowerCase();
            const timestampValid = currentTimestamp && cachedTimestamp && 
              (parseInt(currentTimestamp) - parseInt(cachedTimestamp)) < 3600000;
            
            if (usernameValid && timestampValid && parsed.contentIdeas && Array.isArray(parsed.contentIdeas)) {
              contentIdeasFromScan = parsed.contentIdeas;
            } else {
              console.log('⚠️ Content Hub: Cache invalid - not loading content ideas');
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
        
        // Merge with existing production assets (prioritize brand-specific)
        const existingNonSuggested = productionAssets.filter((a: ContentAsset) => a.status !== 'suggested');
        const newAssets = [...brandSpecificAssets, ...existingNonSuggested];
        setAssets(newAssets);
        localStorage.setItem('productionAssets', JSON.stringify(newAssets));
        
        // Dispatch event to notify other components that content hub was updated
        console.log('📡 Content Hub: Dispatching contentHubUpdated event');
        window.dispatchEvent(new CustomEvent('contentHubUpdated', {
          detail: {
            assets: newAssets,
            contentIdeas: contentIdeasFromScan,
            timestamp: Date.now(),
            source: 'ContentHubView'
          }
        }));
        return;
      }
      
      // Fallback: Use themes to generate suggestions if no content ideas available
      const lastScanResults = localStorage.getItem('lastScanResults');
      if (lastScanResults) {
        const parsed = JSON.parse(lastScanResults);
        const themes = parsed.extractedContent?.content_themes || [];
        
        if (productionAssets.length === 0 && themes.length > 0) {
          // Generate initial suggestions if none exist
          const suggestions = generateInitialSuggestions(themes, lastUsername);
          setAssets(suggestions);
          localStorage.setItem('productionAssets', JSON.stringify(suggestions));
        } else {
          setAssets(productionAssets);
        }
      } else {
        setAssets(productionAssets);
      }
    } catch (e) {
      console.error('Error loading content:', e);
      setAssets([]);
    }
  };

  const generateInitialSuggestions = (themes: string[], user: string | null): ContentAsset[] => {
    const suggestions: ContentAsset[] = [];
    const mainTheme = themes[0] || 'your niche';
    const secondTheme = themes[1] || mainTheme;
    const thirdTheme = themes[2] || secondTheme;

    // X content
    suggestions.push({
      id: 'x_thread_1',
      title: `Thread: Why ${mainTheme} matters now`,
      description: `10-tweet thread breaking down ${mainTheme.toLowerCase()} with your hot takes`,
      platform: 'X',
      status: 'suggested',
      type: 'thread',
      timeAgo: 'AI suggested',
      basedOn: mainTheme,
      theme: mainTheme
    });

    suggestions.push({
      id: 'x_post_1',
      title: `Hot take on ${secondTheme}`,
      description: `Single tweet with a bold opinion - drives replies`,
      platform: 'X',
      status: 'suggested',
      type: 'document',
      timeAgo: 'AI suggested',
      basedOn: secondTheme,
      theme: secondTheme
    });

    // LinkedIn
    suggestions.push({
      id: 'linkedin_post_1',
      title: `${mainTheme}: What I've learned`,
      description: `Personal story + lesson format - high engagement`,
      platform: 'LINKEDIN',
      status: 'suggested',
      type: 'document',
      timeAgo: 'AI suggested',
      basedOn: mainTheme,
      theme: mainTheme
    });

    // Instagram
    suggestions.push({
      id: 'instagram_reel_1',
      title: `60s Reel: ${mainTheme} explained`,
      description: `Quick-hit Reel with text overlays and trending audio`,
      platform: 'INSTAGRAM',
      status: 'suggested',
      type: 'reel',
      timeAgo: 'AI suggested',
      basedOn: mainTheme,
      theme: mainTheme
    });

    // TikTok
    suggestions.push({
      id: 'tiktok_video_1',
      title: `POV: You finally get ${mainTheme}`,
      description: `Trendy format, 30-60 seconds, casual tone`,
      platform: 'TIKTOK',
      status: 'suggested',
      type: 'video',
      timeAgo: 'AI suggested',
      basedOn: mainTheme,
      theme: mainTheme
    });

    // Podcast
    suggestions.push({
      id: 'podcast_1',
      title: `Deep dive: ${mainTheme}`,
      description: `15-minute podcast episode exploring ${mainTheme.toLowerCase()}`,
      platform: 'PODCAST',
      status: 'suggested',
      type: 'podcast',
      timeAgo: 'AI suggested',
      basedOn: mainTheme,
      theme: mainTheme
    });

    return suggestions;
  };

  const handleRegenerate = async () => {
    setIsRegenerating(true);
    // Reload content suggestions
    await loadContent();
    setIsRegenerating(false);
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
    <div className="max-w-[1600px] mx-auto p-6 animate-in fade-in slide-in-from-bottom-2 duration-500">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-3xl font-black uppercase tracking-tighter text-white mb-2">CONTENT HUB</h1>
          <p className="text-white/40 text-sm">
            Content for {username ? `@${username}` : 'your brand'} • {assets.length} pieces
          </p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={handleRegenerate}
            disabled={isRegenerating}
            className="flex items-center gap-2 px-4 py-2 bg-white/5 border border-white/10 rounded-lg text-sm font-medium text-white hover:bg-white/10 transition-colors disabled:opacity-50"
          >
            <RefreshCw className={`w-4 h-4 ${isRegenerating ? 'animate-spin' : ''}`} />
            Regenerate
          </button>
          <button 
            onClick={() => {
              // Navigate to Production Room for podcast generation
              const event = new CustomEvent('navigateToPage', { detail: { page: 'production' } });
              window.dispatchEvent(event);
            }}
            className="flex items-center gap-2 px-4 py-2 bg-orange-500 hover:bg-orange-400 text-white rounded-lg text-sm font-bold transition-colors"
          >
            <Mic2 className="w-4 h-4" />
            Generate Podcast
          </button>
          <button 
            onClick={() => {
              // Navigate to Production Room to create new asset
              const event = new CustomEvent('navigateToPage', { detail: { page: 'production' } });
              window.dispatchEvent(event);
            }}
            className="flex items-center gap-2 px-4 py-2 bg-white/5 border border-white/10 rounded-lg text-sm font-medium text-white hover:bg-white/10 transition-colors"
          >
            <Plus className="w-4 h-4" />
            New Asset
          </button>
        </div>
      </div>

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
    </div>
  );
};

export default ContentHubView;

