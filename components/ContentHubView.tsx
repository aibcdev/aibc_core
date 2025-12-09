import React, { useState, useEffect } from 'react';
import { Filter, RefreshCw, Plus, FileText, Video, Image as ImageIcon, Mic2, Linkedin, Instagram, Music, X, Play, Sparkles, Loader2 } from 'lucide-react';

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
  }, []);

  const loadContent = () => {
    try {
      // Load from Production Room assets
      const productionAssets = JSON.parse(localStorage.getItem('productionAssets') || '[]');
      const lastUsername = localStorage.getItem('lastScannedUsername');
      
      setUsername(lastUsername);
      
      // Also check for suggested content from scan
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
    setTimeout(() => {
      loadContent();
      setIsRegenerating(false);
    }, 1000);
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
            className="flex items-center gap-2 px-4 py-2 bg-purple-500 hover:bg-purple-400 text-white rounded-lg text-sm font-bold transition-colors"
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
                  <span className="px-2 py-1 bg-purple-500/20 text-purple-400 text-[10px] font-bold rounded">
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
                    className="px-3 py-1.5 bg-purple-500 hover:bg-purple-400 text-white text-xs font-bold rounded-lg transition-colors opacity-0 group-hover:opacity-100"
                  >
                    Start Creating
                  </button>
                )}
                {asset.status === 'draft' && (
                  <span className="px-2 py-1 bg-amber-500/20 text-amber-400 text-[10px] font-bold rounded">
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

