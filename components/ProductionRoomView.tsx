import React, { useState, useEffect } from 'react';
import { Filter, Plus, FileText, Video, Image as ImageIcon, MoreHorizontal, Clock, Mic2, X, Play, Download, Sparkles, RefreshCw, Linkedin, Instagram, Music, Send, Copy, Edit3, Loader2, ChevronRight, Hash, AtSign, Calendar } from 'lucide-react';
import { generatePodcast } from '../services/podcastClient';
import { generateImageForContent } from '../services/imageGenerationClient';
import { generateBrandVoiceContent } from '../services/contentGenerationClient';
import { checkFeatureAccess, useCredits, getCreditBalance, type UserTier } from '../services/creditClient';
import UpgradePrompt from './UpgradePrompt';

interface ContentAsset {
  id: string;
  title: string;
  description?: string;
  platform: string;
  status: 'published' | 'draft' | 'scheduled' | 'suggested';
  type: 'document' | 'video' | 'image' | 'podcast' | 'thread' | 'reel' | 'carousel' | 'audio';
  timeAgo: string;
  basedOn?: string;
}

interface ScanData {
  brandDNA?: any;
  extractedContent?: any;
  strategicInsights?: any[];
  competitorIntelligence?: any[];
}

const ProductionRoomView: React.FC = () => {
  const [assets, setAssets] = useState<ContentAsset[]>([]);
  const [scanData, setScanData] = useState<ScanData | null>(null);
  const [username, setUsername] = useState<string | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [statusFilter, setStatusFilter] = useState<'all' | 'suggested' | 'draft' | 'scheduled' | 'published'>('all');
  const [platformFilter, setPlatformFilter] = useState<string | null>(null);

  // Content Creation Panel
  const [selectedAsset, setSelectedAsset] = useState<ContentAsset | null>(null);
  const [isCreatingContent, setIsCreatingContent] = useState(false);
  const [generatedContent, setGeneratedContent] = useState<string>('');
  const [contentNotes, setContentNotes] = useState('');
  const [generatedImage, setGeneratedImage] = useState<string | null>(null);
  const [isGeneratingImage, setIsGeneratingImage] = useState(false);

  // Podcast Generation State
  const [showPodcastModal, setShowPodcastModal] = useState(false);
  const [podcastTopic, setPodcastTopic] = useState('');
  const [podcastDuration, setPodcastDuration] = useState(3);
  const [podcastStyle, setPodcastStyle] = useState<'conversational' | 'narrative' | 'educational' | 'entertaining'>('conversational');
  const [isGeneratingPodcast, setIsGeneratingPodcast] = useState(false);
  const [generatedPodcast, setGeneratedPodcast] = useState<any>(null);
  const [podcastError, setPodcastError] = useState<string | null>(null);
  
  // Schedule Modal State
  const [showScheduleModal, setShowScheduleModal] = useState(false);
  const [scheduleDate, setScheduleDate] = useState('');
  const [scheduleTime, setScheduleTime] = useState('');
  
  // Request Modal State (for video/audio)
  const [showRequestModal, setShowRequestModal] = useState(false);
  
  // New Content Modal State
  const [showNewContentModal, setShowNewContentModal] = useState(false);
  const [newContent, setNewContent] = useState({
    title: '',
    platform: 'X',
    type: 'post',
    description: ''
  });
  
  const [userTier, setUserTier] = useState<UserTier>('free');
  const [creditBalance, setCreditBalance] = useState(0);
  const [featureAccess, setFeatureAccess] = useState<Record<string, boolean>>({});
  const [upgradePrompt, setUpgradePrompt] = useState<{
    feature: string;
    requiredTier: UserTier;
    creditsRequired?: number;
    creditsAvailable?: number;
  } | null>(null);
  
  // Load user tier and credits
  useEffect(() => {
    const storedTier = localStorage.getItem('userTier') as UserTier || 'free';
    setUserTier(storedTier);
    
    const userId = localStorage.getItem('userId') || 'anonymous';
    const balance = getCreditBalance(userId, storedTier);
    setCreditBalance(balance.credits);
    
    // Check access for key features
    Promise.all([
      checkFeatureAccess('content.video', storedTier),
      checkFeatureAccess('content.audio', storedTier),
      checkFeatureAccess('content.podcast', storedTier),
      checkFeatureAccess('content.image', storedTier)
    ]).then(results => {
      const access: Record<string, boolean> = {};
      results.forEach(result => {
        access[result.feature] = result.allowed;
      });
      setFeatureAccess(access);
    });
  }, []);

  useEffect(() => {
    const loadScanData = () => {
      const lastScanResults = localStorage.getItem('lastScanResults');
      const lastUsername = localStorage.getItem('lastScannedUsername');
      
      if (lastScanResults) {
        try {
          const parsed = JSON.parse(lastScanResults);
          setScanData(parsed);
          setUsername(lastUsername);
          
          if (parsed.brandDNA || parsed.extractedContent) {
            generateContentSuggestions(parsed, lastUsername);
          }
        } catch (e) {
          console.error('Error parsing scan results:', e);
        }
      }
    };
    
    loadScanData();
  }, []);

  // Generate personalized content suggestions - SOCIAL FIRST
  const generateContentSuggestions = (data: ScanData, user: string | null) => {
    const suggestions: ContentAsset[] = [];
    const themes = data.extractedContent?.content_themes || [];
    const corePillars = data.brandDNA?.corePillars || [];
    const insights = data.strategicInsights || [];
    
    const mainTheme = themes[0] || 'your niche';
    const secondTheme = themes[1] || mainTheme;
    const thirdTheme = themes[2] || secondTheme;
    
    // === X (TWITTER) ===
    suggestions.push({
      id: 'x_thread_1',
      title: `Thread: Why ${mainTheme} matters now`,
      description: `10-tweet thread breaking down ${mainTheme.toLowerCase()} with your hot takes`,
      platform: 'X',
      status: 'suggested',
      type: 'thread',
      timeAgo: 'AI suggested',
      basedOn: mainTheme
    });
    
    suggestions.push({
      id: 'x_post_1',
      title: `Hot take on ${secondTheme}`,
      description: `Single tweet with a bold opinion - drives replies`,
      platform: 'X',
      status: 'suggested',
      type: 'document',
      timeAgo: 'AI suggested',
      basedOn: secondTheme
    });
    
    // === LINKEDIN ===
    suggestions.push({
      id: 'linkedin_post_1',
      title: `${mainTheme}: What I've learned`,
      description: `Personal story + lesson format - high engagement`,
      platform: 'LINKEDIN',
      status: 'suggested',
      type: 'document',
      timeAgo: 'AI suggested',
      basedOn: mainTheme
    });
    
    suggestions.push({
      id: 'linkedin_post_2',
      title: `Unpopular opinion: ${secondTheme}`,
      description: `Contrarian take that sparks comments`,
      platform: 'LINKEDIN',
      status: 'suggested',
      type: 'document',
      timeAgo: 'AI suggested',
      basedOn: secondTheme
    });
    
    // === INSTAGRAM ===
    suggestions.push({
      id: 'instagram_reel_1',
      title: `60s Reel: ${mainTheme} explained`,
      description: `Quick-hit Reel with text overlays and trending audio`,
      platform: 'INSTAGRAM',
      status: 'suggested',
      type: 'reel',
      timeAgo: 'AI suggested',
      basedOn: mainTheme
    });
    
    suggestions.push({
      id: 'instagram_carousel_1',
      title: `5 facts about ${secondTheme}`,
      description: `Carousel - swipeable slides, save-worthy content`,
      platform: 'INSTAGRAM',
      status: 'suggested',
      type: 'carousel',
      timeAgo: 'AI suggested',
      basedOn: secondTheme
    });
    
    suggestions.push({
      id: 'instagram_story_1',
      title: `Behind the scenes: ${thirdTheme}`,
      description: `Story series - raw, authentic, interactive polls`,
      platform: 'INSTAGRAM',
      status: 'suggested',
      type: 'image',
      timeAgo: 'AI suggested',
      basedOn: thirdTheme
    });
    
    // === TIKTOK ===
    suggestions.push({
      id: 'tiktok_video_1',
      title: `POV: You finally get ${mainTheme}`,
      description: `Trendy format, 30-60 seconds, casual tone`,
      platform: 'TIKTOK',
      status: 'suggested',
      type: 'video',
      timeAgo: 'AI suggested',
      basedOn: mainTheme
    });
    
    suggestions.push({
      id: 'tiktok_video_2',
      title: `Replying to comment: ${thirdTheme}`,
      description: `Reply/stitch format - addresses common questions`,
      platform: 'TIKTOK',
      status: 'suggested',
      type: 'video',
      timeAgo: 'AI suggested',
      basedOn: thirdTheme
    });
    
    suggestions.push({
      id: 'tiktok_video_3',
      title: `3 things about ${secondTheme} nobody tells you`,
      description: `Listicle format - high completion rate`,
      platform: 'TIKTOK',
      status: 'suggested',
      type: 'video',
      timeAgo: 'AI suggested',
      basedOn: secondTheme
    });
    
    // === AUDIO ===
    suggestions.push({
      id: 'podcast_episode_1',
      title: `Podcast: ${mainTheme} deep dive`,
      description: `5-min episode - repurpose into clips for all platforms`,
      platform: 'PODCAST',
      status: 'suggested',
      type: 'podcast',
      timeAgo: 'AI suggested',
      basedOn: mainTheme
    });
    
    suggestions.push({
      id: 'audio_clip_1',
      title: `Voice note: ${secondTheme} thoughts`,
      description: `2-min clip for X Spaces or LinkedIn Audio`,
      platform: 'AUDIO',
      status: 'suggested',
      type: 'audio',
      timeAgo: 'AI suggested',
      basedOn: secondTheme
    });
    
    // === YOUTUBE (if pillars suggest long-form) ===
    if (corePillars.length > 0) {
      suggestions.push({
        id: 'youtube_video_1',
        title: `${corePillars[0]} - Complete Guide`,
        description: `8-12 min - chop into Shorts/Reels/TikToks`,
        platform: 'YOUTUBE',
        status: 'suggested',
        type: 'video',
        timeAgo: 'AI suggested',
        basedOn: corePillars[0]
      });
    }
    
    // === STRATEGIC (from insights) ===
    if (insights.length > 0 && insights[0].title) {
      suggestions.push({
        id: 'strategic_post_1',
        title: `${insights[0].title}`,
        description: insights[0].description?.substring(0, 50) || 'Based on your strategic insight',
        platform: 'X',
        status: 'suggested',
        type: 'thread',
        timeAgo: 'Strategic',
        basedOn: 'AI Insight'
      });
    }
    
    setAssets(suggestions);
  };

  const regenerateSuggestions = () => {
    setIsGenerating(true);
    setTimeout(() => {
      if (scanData) {
        generateContentSuggestions(scanData, username);
      }
      setIsGenerating(false);
    }, 1000);
  };

  // Open content creation panel
  const handleStartCreating = (asset: ContentAsset) => {
    setSelectedAsset(asset);
    setGeneratedContent('');
    setContentNotes('');
    setGeneratedImage(null);
    setIsGeneratingImage(false);
    generateContentForPlatform(asset);
  };

  // Generate platform-specific content using brand voice
  const generateContentForPlatform = async (asset: ContentAsset) => {
    setIsCreatingContent(true);
    
    // Ensure scanData is loaded
    if (!scanData) {
      const lastScanResults = localStorage.getItem('lastScanResults');
      if (lastScanResults) {
        try {
          const parsed = JSON.parse(lastScanResults);
          setScanData({
            brandDNA: parsed.brandDNA || {},
            extractedContent: parsed.extractedContent || {},
            strategicInsights: parsed.strategicInsights || [],
            competitorIntelligence: parsed.competitorIntelligence || []
          });
        } catch (e) {
          console.error('Error parsing scan data:', e);
        }
      }
    }
    
    const theme = asset.basedOn || asset.title || 'your expertise';
    const contentType = asset.type || 'post';
    
    // Use current scanData or reload from localStorage
    const currentScanData = scanData || (() => {
      const lastScanResults = localStorage.getItem('lastScanResults');
      if (lastScanResults) {
        try {
          return JSON.parse(lastScanResults);
        } catch (e) {
          return null;
        }
      }
      return null;
    })();
    
    let generatedText = '';
    
    try {
      // Use brand voice API to generate authentic content
      const result = await generateBrandVoiceContent({
        platform: asset.platform,
        contentType: contentType,
        topic: theme,
        brandDNA: currentScanData?.brandDNA || {},
        extractedContent: currentScanData?.extractedContent || {}
      });
      
      if (result.success && result.content) {
        generatedText = result.content;
        setGeneratedContent(generatedText);
      } else {
        // Fallback to basic content if API fails
        generatedText = `Content about ${theme}\n\n[Content generation failed. Please try again.]`;
        setGeneratedContent(generatedText);
        console.error('Content generation error:', result.error);
      }
    } catch (error: any) {
      console.error('Content generation error:', error);
      // Fallback content
      generatedText = `Content about ${theme}\n\n[Error generating content. Please try again.]`;
      setGeneratedContent(generatedText);
    }
    
    setIsCreatingContent(false);
    
    // Generate image for social platforms that require images
    const platformsNeedingImages = ['INSTAGRAM', 'TIKTOK', 'LINKEDIN', 'X'];
    if (platformsNeedingImages.includes(asset.platform) && generatedText) {
      setIsGeneratingImage(true);
      setGeneratedImage(null);
      
      try {
        const imageResult = await generateImageForContent({
          content: generatedText.substring(0, 500), // Use first 500 chars for image prompt
          platform: asset.platform.toLowerCase() as any,
          brandDNA: scanData?.brandDNA
        });
        
        if (imageResult.success && imageResult.imageUrl) {
          setGeneratedImage(imageResult.imageUrl);
        }
      } catch (error) {
        console.error('Failed to generate image:', error);
      } finally {
        setIsGeneratingImage(false);
      }
    }
  };

  const handleSaveAsDraft = () => {
    if (selectedAsset) {
      setAssets(assets.map(a => 
        a.id === selectedAsset.id ? { ...a, status: 'draft' as const, timeAgo: 'just now' } : a
      ));
      setSelectedAsset(null);
    }
  };

  const handleScheduleClick = async () => {
    // Check if this is video or audio content - show request modal instead
    if (selectedAsset && (selectedAsset.type === 'video' || selectedAsset.type === 'audio' || selectedAsset.type === 'podcast')) {
      // Check feature access first
      const feature = selectedAsset.type === 'video' ? 'content.video' : 
                     selectedAsset.type === 'podcast' ? 'content.podcast' : 'content.audio';
      
      const access = await checkFeatureAccess(feature, userTier);
      if (!access.allowed) {
        // Determine required tier
        let requiredTier: UserTier = 'premium';
        const featureStr = String(feature);
        if (featureStr === 'content.video' || featureStr === 'content.audio' || featureStr === 'content.podcast') {
          requiredTier = 'premium';
        } else if (featureStr === 'content.image') {
          requiredTier = 'pro';
        } else if (featureStr.includes('custom') || featureStr.includes('deep')) {
          requiredTier = 'business';
        }
        
        setUpgradePrompt({
          feature,
          requiredTier,
          creditsRequired: access.creditsRequired,
          creditsAvailable: access.creditsAvailable
        });
        return;
      }
      
      // Check credits
      if (access.creditsRequired && creditBalance < access.creditsRequired) {
        setUpgradePrompt({
          feature,
          requiredTier: userTier, // Same tier, just need credits
          creditsRequired: access.creditsRequired,
          creditsAvailable: creditBalance
        });
        return;
      }
      
      setShowRequestModal(true);
      return;
    }
    
    // For other content types, show schedule modal
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    setScheduleDate(tomorrow.toISOString().split('T')[0]);
    setScheduleTime('09:00');
    setShowScheduleModal(true);
  };

  const handleConfirmRequest = async () => {
    if (!selectedAsset) return;
    
    // Determine feature and deduct credits
    const feature = selectedAsset.type === 'video' ? 'content.video' : 
                   selectedAsset.type === 'podcast' ? 'content.podcast' : 'content.audio';
    
    const creditResult = await useCredits(feature, userTier);
    if (!creditResult.success) {
      alert(creditResult.error || 'Failed to process request');
      return;
    }
    
    // Update credit balance
    setCreditBalance(creditResult.newBalance);
    
    // Calculate 72 hours from now
    const estimatedReadyAt = new Date();
    estimatedReadyAt.setHours(estimatedReadyAt.getHours() + 72);
    
    // Create request object
    const request = {
      id: `req-${Date.now()}`,
      type: (selectedAsset.type === 'video' || selectedAsset.type === 'podcast') ? 'video' as const : 'audio' as const,
      title: selectedAsset.title,
      description: selectedAsset.description || generatedContent.substring(0, 200) || 'Video/Audio content request',
      status: 'pending' as const,
      requestedAt: new Date().toISOString(),
      estimatedReadyAt: estimatedReadyAt.toISOString(),
      draftsRemaining: 3,
      revisions: [],
      content: undefined // Will be populated when ready
    };
    
    // Save to localStorage
    const existingRequests = JSON.parse(localStorage.getItem('videoAudioRequests') || '[]');
    existingRequests.push(request);
    localStorage.setItem('videoAudioRequests', JSON.stringify(existingRequests));
    
    // Update asset status
    setAssets(assets.map(a => 
      a.id === selectedAsset.id ? { 
        ...a, 
        status: 'scheduled' as const, 
        timeAgo: 'Requested - check Inbox' 
      } : a
    ));
    
    setShowRequestModal(false);
    setSelectedAsset(null);
    
    // Trigger custom event for Inbox to update (same-tab)
    window.dispatchEvent(new CustomEvent('videoAudioRequestAdded'));
    
    // Also update localStorage to trigger storage event (for cross-tab)
    const currentValue = localStorage.getItem('videoAudioRequests');
    localStorage.setItem('videoAudioRequests', currentValue || '[]');
  };

  const handleConfirmSchedule = () => {
    if (!scheduleDate || !scheduleTime || !selectedAsset) return;
    
    // Combine date and time
    const scheduledDateTime = new Date(`${scheduleDate}T${scheduleTime}`);
    const formattedDate = scheduledDateTime.toLocaleDateString('en-US', { 
      month: 'short', 
      day: 'numeric', 
      year: 'numeric',
      hour: 'numeric',
      minute: '2-digit'
    });
    
    // Update asset status to scheduled
    setAssets(assets.map(a => 
      a.id === selectedAsset.id ? { 
        ...a, 
        status: 'scheduled' as const, 
        timeAgo: `Scheduled for ${formattedDate}` 
      } : a
    ));
    
    // TODO: Add to calendar events (integrate with CalendarView)
    // For now, we'll store in localStorage
    const calendarEvents = JSON.parse(localStorage.getItem('calendarEvents') || '[]');
    calendarEvents.push({
      id: `scheduled-${selectedAsset.id}-${Date.now()}`,
      title: selectedAsset.title,
      description: selectedAsset.description || generatedContent.substring(0, 100),
      date: scheduleDate,
      time: scheduleTime,
      platform: selectedAsset.platform,
      type: selectedAsset.type,
      status: 'Scheduled',
      createdAt: new Date().toISOString()
    });
    localStorage.setItem('calendarEvents', JSON.stringify(calendarEvents));
    
    setShowScheduleModal(false);
    setSelectedAsset(null);
  };

  const handleCreateNewContent = () => {
    if (!newContent.title.trim()) return;
    
    // Create new content asset
    const newAsset: ContentAsset = {
      id: `manual-${Date.now()}`,
      title: newContent.title,
      description: newContent.description,
      platform: newContent.platform,
      type: newContent.type as any,
      status: 'draft',
      timeAgo: 'just now'
    };
    
    // Add to assets
    setAssets([newAsset, ...assets]);
    
    // Reset form and close modal
    setNewContent({
      title: '',
      platform: 'X',
      type: 'post',
      description: ''
    });
    setShowNewContentModal(false);
    
    // Open content creation panel for the new asset
    setSelectedAsset(newAsset);
    generateContentForPlatform(newAsset);
  };

  const handleCopyContent = () => {
    navigator.clipboard.writeText(generatedContent);
  };

  const handleGeneratePodcast = async () => {
    if (!podcastTopic.trim()) {
      setPodcastError('Please enter a topic');
      return;
    }

    setIsGeneratingPodcast(true);
    setPodcastError(null);

    try {
      const brandDNA = scanData?.brandDNA || null;

      const result = await generatePodcast({
        topic: podcastTopic,
        duration: podcastDuration,
        brandVoice: brandDNA,
        style: podcastStyle,
        includeMusic: false
      }, userTier);

      if (result.success) {
        setGeneratedPodcast(result);
        setAssets([...assets, {
          id: result.podcastId || `podcast_${Date.now()}`,
          title: podcastTopic,
          platform: 'PODCAST',
          status: 'draft',
          type: 'podcast',
          timeAgo: 'just now'
        }]);
      } else {
        setPodcastError(result.error || 'Failed to generate podcast');
      }
    } catch (error: any) {
      setPodcastError(error.message || 'Failed to generate podcast');
    } finally {
      setIsGeneratingPodcast(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'published': return 'bg-green-500/20 border-green-500/50 text-green-400';
      case 'scheduled': return 'bg-blue-500/20 border-blue-500/50 text-blue-400';
      case 'draft': return 'bg-amber-500/20 border-amber-500/50 text-amber-400';
      case 'suggested': return 'bg-purple-500/20 border-purple-500/50 text-purple-400';
      default: return 'bg-white/10 border-white/20 text-white/70';
    }
  };

  const getPlatformIcon = (platform: string) => {
    switch (platform) {
      case 'X': return <span className="text-lg">𝕏</span>;
      case 'LINKEDIN': return <Linkedin className="w-5 h-5" />;
      case 'INSTAGRAM': return <Instagram className="w-5 h-5" />;
      case 'TIKTOK': return <span className="text-lg font-bold">♪</span>;
      case 'YOUTUBE': return <Play className="w-5 h-5" />;
      case 'PODCAST': return <Mic2 className="w-5 h-5" />;
      case 'AUDIO': return <Music className="w-5 h-5" />;
      default: return <FileText className="w-5 h-5" />;
    }
  };

  const getPlatformColor = (platform: string) => {
    switch (platform) {
      case 'X': return 'bg-white/10 text-white';
      case 'LINKEDIN': return 'bg-blue-500/20 text-blue-400';
      case 'INSTAGRAM': return 'bg-gradient-to-br from-purple-500/20 to-pink-500/20 text-pink-400';
      case 'TIKTOK': return 'bg-black text-white border border-white/20';
      case 'YOUTUBE': return 'bg-red-500/20 text-red-400';
      case 'PODCAST': return 'bg-purple-500/20 text-purple-400';
      case 'AUDIO': return 'bg-orange-500/20 text-orange-400';
      default: return 'bg-white/10 text-white/60';
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'video': case 'reel': return <Video className="w-4 h-4" />;
      case 'image': case 'carousel': return <ImageIcon className="w-4 h-4" />;
      case 'podcast': case 'audio': return <Mic2 className="w-4 h-4" />;
      case 'thread': return <FileText className="w-4 h-4" />;
      default: return <FileText className="w-4 h-4" />;
    }
  };

  // Filter assets by status and platform
  const filteredAssets = assets.filter(a => {
    const statusMatch = statusFilter === 'all' || a.status === statusFilter;
    const platformMatch = !platformFilter || a.platform === platformFilter;
    return statusMatch && platformMatch;
  });

  const noScanData = !scanData || (!scanData.brandDNA && !scanData.extractedContent);

  // Platform counts for filters
  const platformCounts = assets.reduce((acc, a) => {
    acc[a.platform] = (acc[a.platform] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  const platformOrder = ['X', 'LINKEDIN', 'INSTAGRAM', 'TIKTOK', 'PODCAST', 'AUDIO', 'YOUTUBE'];

  return (
    <div className="h-full flex">
      {/* Main Content Area */}
      <div className={`flex-1 overflow-y-auto p-8 transition-all duration-300 ${selectedAsset ? 'mr-[480px]' : ''}`}>
        <div className="max-w-6xl mx-auto animate-in fade-in slide-in-from-bottom-2 duration-500">
          {/* Header */}
          <div className="flex items-center justify-between mb-8">
            <div>
              <h1 className="text-4xl font-black tracking-tight text-white mb-1">CONTENT HUB</h1>
              <p className="text-white/40 text-sm">
                {username ? `Content for @${username} • ${filteredAssets.length} pieces` : 'Social-first content from your digital footprint'}
              </p>
            </div>
            <div className="flex items-center gap-3">
              <button 
                onClick={regenerateSuggestions}
                disabled={isGenerating || noScanData}
                className="flex items-center gap-2 px-4 py-2.5 rounded-xl border border-white/10 text-sm text-white/60 hover:text-white hover:bg-white/5 transition-all disabled:opacity-50"
              >
                <RefreshCw className={`w-4 h-4 ${isGenerating ? 'animate-spin' : ''}`} />
                Regenerate
              </button>
              <button 
                onClick={() => setShowPodcastModal(true)}
                className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-purple-500/20 border border-purple-500/30 text-purple-400 text-sm hover:bg-purple-500/30 transition-all"
              >
                <Mic2 className="w-4 h-4" />
                Generate Podcast
              </button>
              <button 
                onClick={() => setShowNewContentModal(true)}
                className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-white/10 text-white text-sm hover:bg-white/20 transition-all"
              >
                <Plus className="w-4 h-4" />
                New Content
              </button>
            </div>
          </div>

          {/* Status Filter Tabs */}
          <div className="flex gap-2 mb-4">
            {(['all', 'suggested', 'draft', 'scheduled', 'published'] as const).map(f => (
              <button
                key={f}
                onClick={() => setStatusFilter(f)}
                className={`px-4 py-2 rounded-lg text-xs font-medium uppercase tracking-wider transition-all ${
                  statusFilter === f 
                    ? 'bg-white/10 text-white border border-white/20' 
                    : 'text-white/40 hover:text-white/60'
                }`}
              >
                {f} {f !== 'all' && `(${assets.filter(a => a.status === f).length})`}
              </button>
            ))}
          </div>

          {/* Platform Filters */}
          {!noScanData && (
            <div className="flex gap-2 mb-6 overflow-x-auto pb-2">
              <button
                onClick={() => setPlatformFilter(null)}
                className={`flex items-center gap-2 px-3 py-1.5 rounded-full text-xs border transition-all ${
                  !platformFilter 
                    ? 'bg-white/10 text-white border-white/20' 
                    : 'text-white/40 border-white/5 hover:border-white/10'
                }`}
              >
                All
              </button>
              {platformOrder.map(platform => {
                const count = platformCounts[platform] || 0;
                if (count === 0) return null;
                return (
                  <button
                    key={platform}
                    onClick={() => setPlatformFilter(platformFilter === platform ? null : platform)}
                    className={`flex items-center gap-2 px-3 py-1.5 rounded-full text-xs border transition-all ${
                      platformFilter === platform
                        ? `${getPlatformColor(platform)} border-current`
                        : 'text-white/40 border-white/5 hover:border-white/10'
                    }`}
                  >
                    {getPlatformIcon(platform)}
                    <span>{platform}</span>
                    <span className="opacity-60">({count})</span>
                  </button>
                );
              })}
            </div>
          )}

          {/* No Scan Data State */}
          {noScanData ? (
            <div className="text-center py-20">
              <Sparkles className="w-16 h-16 text-white/20 mx-auto mb-4" />
              <h2 className="text-xl font-bold text-white mb-2">No Digital Footprint Data</h2>
              <p className="text-white/40 text-sm mb-6 max-w-md mx-auto">
                Run a scan to get personalized content ideas for X, LinkedIn, Instagram, TikTok, and more.
              </p>
              <button 
                onClick={() => window.location.hash = '#ingestion'}
                className="px-6 py-3 bg-green-500 hover:bg-green-400 text-black font-bold text-sm rounded-xl transition-colors"
              >
                Start Scan
              </button>
            </div>
          ) : (
            /* Content Grid */
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredAssets.map((asset) => (
                <div
                  key={asset.id}
                  className={`group bg-[#0A0A0A] border rounded-2xl p-5 transition-all relative cursor-pointer ${
                    selectedAsset?.id === asset.id 
                      ? 'border-green-500/50 ring-1 ring-green-500/20' 
                      : 'border-white/10 hover:border-white/20'
                  }`}
                  onClick={() => handleStartCreating(asset)}
                >
                  {/* Platform Icon */}
                  <div className={`w-12 h-12 rounded-xl flex items-center justify-center mb-4 ${getPlatformColor(asset.platform)}`}>
                    {getPlatformIcon(asset.platform)}
                  </div>

                  {/* More Options */}
                  <button className="absolute top-4 right-4 p-2 text-white/20 hover:text-white/60 opacity-0 group-hover:opacity-100 transition-all">
                    <MoreHorizontal className="w-5 h-5" />
                  </button>

                  {/* Content */}
                  <h3 className="text-base font-bold text-white mb-1 pr-8 line-clamp-2">{asset.title}</h3>
                  {asset.description && (
                    <p className="text-xs text-white/40 mb-3 line-clamp-2">{asset.description}</p>
                  )}
                  
                  {/* Type + Platform Tags */}
                  <div className="flex items-center gap-2 mb-3">
                    <span className="flex items-center gap-1 text-[10px] text-white/30 uppercase">
                      {getTypeIcon(asset.type)}
                      {asset.type}
                    </span>
                    <span className="text-white/20">•</span>
                    <span className="text-[10px] text-white/30 uppercase">{asset.platform}</span>
                  </div>
                  
                  {/* Based On Tag */}
                  {asset.basedOn && (
                    <div className="text-[10px] text-purple-400/60 mb-3">
                      Theme: {asset.basedOn}
                    </div>
                  )}

                  {/* Footer */}
                  <div className="flex items-center justify-between">
                    <span className={`px-2.5 py-1 rounded-lg border text-[10px] font-bold uppercase ${getStatusColor(asset.status)}`}>
                      {asset.status === 'suggested' ? 'AI SUGGESTED' : asset.status.toUpperCase()}
                    </span>
                    <div className="flex items-center gap-2 text-white/30 text-xs">
                      <Clock className="w-3 h-3" />
                      {asset.timeAgo}
                    </div>
                  </div>
                  
                  {/* Action Button */}
                  {asset.status === 'suggested' && (
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleStartCreating(asset);
                      }}
                      className="mt-4 w-full py-2 bg-purple-500/10 hover:bg-purple-500/20 border border-purple-500/20 rounded-lg text-purple-400 text-xs font-medium transition-colors flex items-center justify-center gap-2"
                    >
                      Start Creating <ChevronRight className="w-3 h-3" />
                    </button>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Content Creation Side Panel */}
      {selectedAsset && (
        <div className="fixed top-0 right-0 w-[480px] h-full bg-[#0A0A0A] border-l border-white/10 flex flex-col animate-in slide-in-from-right duration-300 z-50">
          {/* Panel Header */}
          <div className="flex-shrink-0 p-6 border-b border-white/10">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${getPlatformColor(selectedAsset.platform)}`}>
                  {getPlatformIcon(selectedAsset.platform)}
                </div>
                <div>
                  <h3 className="text-lg font-bold text-white">Create Content</h3>
                  <p className="text-xs text-white/40">{selectedAsset.platform} • {selectedAsset.type}</p>
                </div>
              </div>
              <button 
                onClick={() => setSelectedAsset(null)}
                className="p-2 text-white/40 hover:text-white transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <h4 className="text-sm font-medium text-white/80">{selectedAsset.title}</h4>
            {selectedAsset.basedOn && (
              <div className="flex items-center gap-2 mt-2">
                <Hash className="w-3 h-3 text-purple-400" />
                <span className="text-xs text-purple-400">Based on: {selectedAsset.basedOn}</span>
              </div>
            )}
          </div>

          {/* Panel Content */}
          <div className="flex-1 overflow-y-auto p-6">
            {isCreatingContent ? (
              <div className="flex flex-col items-center justify-center h-full">
                <Loader2 className="w-8 h-8 text-purple-400 animate-spin mb-4" />
                <p className="text-white/60 text-sm">Generating {selectedAsset.platform} content...</p>
                <p className="text-white/30 text-xs mt-1">Using your brand voice</p>
              </div>
            ) : (
              <div className="space-y-4">
                {/* Generated Image (for social platforms) */}
                {(['INSTAGRAM', 'TIKTOK', 'LINKEDIN', 'X'].includes(selectedAsset.platform)) && (
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <label className="text-xs font-bold text-white/60 uppercase tracking-wider">Generated Image</label>
                      {isGeneratingImage && (
                        <Loader2 className="w-3 h-3 text-purple-400 animate-spin" />
                      )}
                    </div>
                    {isGeneratingImage ? (
                      <div className="w-full aspect-square bg-[#050505] border border-white/10 rounded-xl flex items-center justify-center">
                        <div className="text-center">
                          <Loader2 className="w-8 h-8 text-purple-400 animate-spin mx-auto mb-2" />
                          <p className="text-xs text-white/40">Generating image...</p>
                        </div>
                      </div>
                    ) : generatedImage ? (
                      <div className="w-full bg-[#050505] border border-white/10 rounded-xl overflow-hidden">
                        <img 
                          src={generatedImage} 
                          alt="Generated content image" 
                          className="w-full h-auto object-cover"
                        />
                        <div className="p-3 flex items-center justify-between bg-[#050505] border-t border-white/10">
                          <span className="text-xs text-white/40">AI Generated Image</span>
                          <button
                            onClick={() => {
                              const link = document.createElement('a');
                              link.href = generatedImage;
                              link.download = `${selectedAsset.title.replace(/\s+/g, '-')}.jpg`;
                              link.click();
                            }}
                            className="text-xs text-purple-400 hover:text-purple-300 transition-colors flex items-center gap-1"
                          >
                            <Download className="w-3 h-3" />
                            Download
                          </button>
                        </div>
                      </div>
                    ) : (
                      <div className="w-full aspect-square bg-[#050505] border border-dashed border-white/10 rounded-xl flex items-center justify-center">
                        <div className="text-center">
                          <ImageIcon className="w-8 h-8 text-white/20 mx-auto mb-2" />
                          <p className="text-xs text-white/40">Image will be generated</p>
                        </div>
                      </div>
                    )}
                  </div>
                )}

                {/* Generated Content */}
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <label className="text-xs font-bold text-white/60 uppercase tracking-wider">Generated Content</label>
                    <button 
                      onClick={handleCopyContent}
                      className="flex items-center gap-1 text-xs text-white/40 hover:text-white transition-colors"
                    >
                      <Copy className="w-3 h-3" />
                      Copy
                    </button>
                  </div>
                  <textarea
                    value={generatedContent}
                    onChange={(e) => setGeneratedContent(e.target.value)}
                    rows={16}
                    className="w-full bg-[#050505] border border-white/10 rounded-xl p-4 text-sm text-white placeholder:text-white/30 focus:border-white/30 focus:outline-none resize-none font-mono leading-relaxed"
                  />
                </div>

                {/* Notes */}
                <div>
                  <label className="block text-xs font-bold text-white/60 uppercase tracking-wider mb-2">Your Notes</label>
                  <textarea
                    value={contentNotes}
                    onChange={(e) => setContentNotes(e.target.value)}
                    rows={3}
                    placeholder="Add any notes or modifications..."
                    className="w-full bg-[#050505] border border-white/10 rounded-xl p-4 text-sm text-white placeholder:text-white/30 focus:border-white/30 focus:outline-none resize-none"
                  />
                </div>

                {/* Platform Tips */}
                <div className="bg-white/[0.02] border border-white/5 rounded-xl p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <Sparkles className="w-4 h-4 text-amber-400" />
                    <span className="text-xs font-bold text-white/60 uppercase tracking-wider">{selectedAsset.platform} Tips</span>
                  </div>
                  <ul className="space-y-1.5 text-xs text-white/40">
                    {selectedAsset.platform === 'X' && (
                      <>
                        <li>• Keep tweets under 280 characters</li>
                        <li>• Use 1-2 relevant hashtags max</li>
                        <li>• Post during peak hours (9am, 12pm, 5pm)</li>
                      </>
                    )}
                    {selectedAsset.platform === 'LINKEDIN' && (
                      <>
                        <li>• First line is crucial - make it hook</li>
                        <li>• Use line breaks for readability</li>
                        <li>• Best times: Tue-Thu, 8-10am</li>
                      </>
                    )}
                    {selectedAsset.platform === 'INSTAGRAM' && (
                      <>
                        <li>• Reels get 2x more reach than posts</li>
                        <li>• Use 3-5 relevant hashtags</li>
                        <li>• Post consistently at same times</li>
                      </>
                    )}
                    {selectedAsset.platform === 'TIKTOK' && (
                      <>
                        <li>• Hook viewers in first 1-3 seconds</li>
                        <li>• Use trending sounds when relevant</li>
                        <li>• Post 1-3 times daily for growth</li>
                      </>
                    )}
                    {selectedAsset.platform === 'YOUTUBE' && (
                      <>
                        <li>• Title + thumbnail = 80% of success</li>
                        <li>• First 30 seconds must hook viewer</li>
                        <li>• 8-12 min is optimal for watch time</li>
                      </>
                    )}
                    {(selectedAsset.platform === 'PODCAST' || selectedAsset.platform === 'AUDIO') && (
                      <>
                        <li>• Start with a compelling hook</li>
                        <li>• Keep intros under 30 seconds</li>
                        <li>• Repurpose clips for other platforms</li>
                      </>
                    )}
                  </ul>
                </div>
              </div>
            )}
          </div>

          {/* Panel Footer */}
          <div className="flex-shrink-0 p-6 border-t border-white/10">
            <div className="flex gap-3">
              <button
                onClick={() => setSelectedAsset(null)}
                className="flex-1 py-3 bg-white/5 hover:bg-white/10 text-white/60 text-sm font-medium rounded-xl transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleSaveAsDraft}
                className="flex-1 py-3 bg-amber-500/20 hover:bg-amber-500/30 text-amber-400 text-sm font-medium rounded-xl transition-colors flex items-center justify-center gap-2"
              >
                <Edit3 className="w-4 h-4" />
                Save Draft
              </button>
              <button
                onClick={handleScheduleClick}
                className="flex-1 py-3 bg-green-500 hover:bg-green-400 text-black text-sm font-bold rounded-xl transition-colors flex items-center justify-center gap-2"
              >
                <Send className="w-4 h-4" />
                {selectedAsset && (selectedAsset.type === 'video' || selectedAsset.type === 'audio' || selectedAsset.type === 'podcast') ? 'Request' : 'Schedule'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Podcast Generation Modal */}
      {showPodcastModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={() => setShowPodcastModal(false)}></div>
          <div className="relative w-full max-w-lg bg-[#0A0A0A] border border-white/10 rounded-2xl p-6 shadow-2xl animate-in zoom-in-95 duration-200">
            <button 
              onClick={() => setShowPodcastModal(false)} 
              className="absolute top-4 right-4 text-white/40 hover:text-white transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
            
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 rounded-xl bg-purple-500/20 flex items-center justify-center">
                <Mic2 className="w-5 h-5 text-purple-400" />
              </div>
              <div>
                <h2 className="text-lg font-bold text-white">Generate Podcast</h2>
                <p className="text-xs text-white/40">AI-powered podcast in your voice</p>
              </div>
            </div>

            {generatedPodcast ? (
              <div className="space-y-4">
                <div className="bg-white/5 rounded-xl p-4 border border-white/10">
                  <h3 className="text-sm font-bold text-white mb-2">{podcastTopic}</h3>
                  <p className="text-xs text-white/60 mb-4">{generatedPodcast.script?.substring(0, 200)}...</p>
                  <div className="flex gap-2">
                    <button className="flex-1 py-2 bg-purple-500 hover:bg-purple-400 text-black text-xs font-bold rounded-lg flex items-center justify-center gap-2">
                      <Play className="w-4 h-4" /> Play Preview
                    </button>
                    <button className="px-4 py-2 bg-white/10 hover:bg-white/20 text-white text-xs font-bold rounded-lg flex items-center gap-2">
                      <Download className="w-4 h-4" />
                    </button>
                  </div>
                </div>
                <button
                  onClick={() => {
                    setGeneratedPodcast(null);
                    setPodcastTopic('');
                  }}
                  className="w-full py-2 text-white/60 hover:text-white text-xs"
                >
                  Generate Another
                </button>
              </div>
            ) : (
              <div className="space-y-4">
                <div>
                  <label className="block text-xs font-bold text-white/60 uppercase tracking-wider mb-2">Topic</label>
                  <input
                    type="text"
                    value={podcastTopic}
                    onChange={(e) => setPodcastTopic(e.target.value)}
                    placeholder="e.g., My take on the latest trends"
                    className="w-full bg-[#050505] border border-white/10 rounded-lg p-3 text-sm text-white placeholder:text-white/30 focus:border-white/30 focus:outline-none"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-white/60 uppercase tracking-wider mb-2">Duration</label>
                    <select
                      value={podcastDuration}
                      onChange={(e) => setPodcastDuration(Number(e.target.value))}
                      className="w-full bg-[#050505] border border-white/10 rounded-lg p-3 text-sm text-white focus:border-white/30 focus:outline-none appearance-none"
                    >
                      <option value={2}>2 minutes</option>
                      <option value={3}>3 minutes</option>
                      <option value={5}>5 minutes</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-white/60 uppercase tracking-wider mb-2">Style</label>
                    <select
                      value={podcastStyle}
                      onChange={(e) => setPodcastStyle(e.target.value as any)}
                      className="w-full bg-[#050505] border border-white/10 rounded-lg p-3 text-sm text-white focus:border-white/30 focus:outline-none appearance-none"
                    >
                      <option value="conversational">Conversational</option>
                      <option value="narrative">Narrative</option>
                      <option value="educational">Educational</option>
                      <option value="entertaining">Entertaining</option>
                    </select>
                  </div>
                </div>

                {podcastError && (
                  <div className="text-red-400 text-xs bg-red-500/10 border border-red-500/20 rounded-lg p-3">
                    {podcastError}
                  </div>
                )}

                <button
                  onClick={handleGeneratePodcast}
                  disabled={isGeneratingPodcast}
                  className="w-full py-3 bg-purple-500 hover:bg-purple-400 disabled:opacity-50 text-black text-sm font-bold rounded-xl transition-colors flex items-center justify-center gap-2"
                >
                  {isGeneratingPodcast ? (
                    <>
                      <RefreshCw className="w-4 h-4 animate-spin" />
                      Generating...
                    </>
                  ) : (
                    <>
                      <Sparkles className="w-4 h-4" />
                      Generate Podcast
                    </>
                  )}
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Request Modal (for video/audio) */}
      {showRequestModal && selectedAsset && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={() => setShowRequestModal(false)}></div>
          <div className="relative w-full max-w-md bg-[#0A0A0A] border border-white/10 rounded-2xl p-6 shadow-2xl animate-in zoom-in-95 duration-200">
            <button 
              onClick={() => setShowRequestModal(false)} 
              className="absolute top-4 right-4 text-white/40 hover:text-white transition-colors"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="mb-6">
              <h2 className="text-xl font-bold text-white mb-2">Request {selectedAsset.type === 'video' ? 'Video' : 'Audio'} Generation</h2>
              <p className="text-sm text-white/60">
                Your {selectedAsset.type === 'video' ? 'video' : 'audio'} will be curated and ready within 72 hours.
              </p>
            </div>

            <div className="bg-white/5 rounded-lg p-4 mb-6">
              <div className="flex items-start gap-3">
                <Clock className="w-5 h-5 text-yellow-400 mt-0.5" />
                <div>
                  <div className="text-sm font-bold text-white mb-1">Processing Time</div>
                  <div className="text-xs text-white/60">
                    Your content will be ready within 72 hours. Check your Inbox once it's ready.
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-white/5 rounded-lg p-4 mb-6">
              <div className="flex items-start gap-3">
                <RefreshCw className="w-5 h-5 text-green-400 mt-0.5" />
                <div>
                  <div className="text-sm font-bold text-white mb-1">Revisions Available</div>
                  <div className="text-xs text-white/60">
                    You have 3 drafts/changes available to refine your content.
                  </div>
                </div>
              </div>
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => setShowRequestModal(false)}
                className="flex-1 py-3 bg-white/5 hover:bg-white/10 text-white/60 text-sm font-medium rounded-xl transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleConfirmRequest}
                className="flex-1 py-3 bg-green-500 hover:bg-green-400 text-black text-sm font-bold rounded-xl transition-colors flex items-center justify-center gap-2"
              >
                <Send className="w-4 h-4" />
                Request {selectedAsset.type === 'video' ? 'Video' : 'Audio'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Schedule Modal */}
      {showScheduleModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={() => setShowScheduleModal(false)}></div>
          <div className="relative w-full max-w-md bg-[#0A0A0A] border border-white/10 rounded-2xl p-6 shadow-2xl animate-in zoom-in-95 duration-200">
            <button 
              onClick={() => setShowScheduleModal(false)} 
              className="absolute top-4 right-4 text-white/40 hover:text-white transition-colors"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="mb-6">
              <h2 className="text-xl font-bold text-white mb-2">Schedule Content</h2>
              <p className="text-sm text-white/60">Choose when to publish this content</p>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-white/60 uppercase tracking-wider mb-2">
                  Date
                </label>
                <div className="relative">
                  <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/40" />
                  <input
                    type="date"
                    value={scheduleDate}
                    onChange={(e) => setScheduleDate(e.target.value)}
                    min={new Date().toISOString().split('T')[0]}
                    className="w-full bg-[#050505] border border-white/10 rounded-lg pl-10 pr-4 py-3 text-sm text-white focus:border-white/30 focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-white/60 uppercase tracking-wider mb-2">
                  Time
                </label>
                <div className="relative">
                  <Clock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/40" />
                  <input
                    type="time"
                    value={scheduleTime}
                    onChange={(e) => setScheduleTime(e.target.value)}
                    className="w-full bg-[#050505] border border-white/10 rounded-lg pl-10 pr-4 py-3 text-sm text-white focus:border-white/30 focus:outline-none"
                  />
                </div>
              </div>

              {selectedAsset && (
                <div className="bg-white/5 border border-white/10 rounded-lg p-3">
                  <div className="text-xs text-white/40 mb-1">Content</div>
                  <div className="text-sm font-medium text-white">{selectedAsset.title}</div>
                  <div className="text-xs text-white/60 mt-1">{selectedAsset.platform}</div>
                </div>
              )}
            </div>

            <div className="flex gap-3 mt-6">
              <button
                onClick={() => setShowScheduleModal(false)}
                className="flex-1 py-3 bg-white/5 hover:bg-white/10 text-white/60 text-sm font-medium rounded-xl transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleConfirmSchedule}
                disabled={!scheduleDate || !scheduleTime}
                className="flex-1 py-3 bg-green-500 hover:bg-green-400 disabled:bg-white/10 disabled:text-white/30 disabled:cursor-not-allowed text-black text-sm font-bold rounded-xl transition-colors flex items-center justify-center gap-2"
              >
                <Calendar className="w-4 h-4" />
                Schedule
              </button>
            </div>
          </div>
        </div>
      )}

      {/* New Content Modal */}
      {showNewContentModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={() => setShowNewContentModal(false)}></div>
          <div className="relative w-full max-w-lg bg-[#0A0A0A] border border-white/10 rounded-2xl p-6 shadow-2xl animate-in zoom-in-95 duration-200">
            <button 
              onClick={() => setShowNewContentModal(false)} 
              className="absolute top-4 right-4 text-white/40 hover:text-white transition-colors"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="mb-6">
              <h2 className="text-xl font-bold text-white mb-2">Create New Content</h2>
              <p className="text-sm text-white/60">Manually create content for any platform</p>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-white/60 uppercase tracking-wider mb-2">
                  Title *
                </label>
                <input
                  type="text"
                  value={newContent.title}
                  onChange={(e) => setNewContent({ ...newContent, title: e.target.value })}
                  placeholder="e.g., My thoughts on AI content"
                  className="w-full bg-[#050505] border border-white/10 rounded-lg px-4 py-3 text-sm text-white placeholder:text-white/30 focus:border-white/30 focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-white/60 uppercase tracking-wider mb-2">
                    Platform *
                  </label>
                  <select
                    value={newContent.platform}
                    onChange={(e) => setNewContent({ ...newContent, platform: e.target.value })}
                    className="w-full bg-[#050505] border border-white/10 rounded-lg px-4 py-3 text-sm text-white focus:border-white/30 focus:outline-none appearance-none"
                  >
                    <option value="X">X (Twitter)</option>
                    <option value="LINKEDIN">LinkedIn</option>
                    <option value="INSTAGRAM">Instagram</option>
                    <option value="TIKTOK">TikTok</option>
                    <option value="YOUTUBE">YouTube</option>
                    <option value="AUDIO">Audio</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-white/60 uppercase tracking-wider mb-2">
                    Type *
                  </label>
                  <select
                    value={newContent.type}
                    onChange={(e) => setNewContent({ ...newContent, type: e.target.value })}
                    className="w-full bg-[#050505] border border-white/10 rounded-lg px-4 py-3 text-sm text-white focus:border-white/30 focus:outline-none appearance-none"
                  >
                    <option value="post">Post</option>
                    <option value="thread">Thread</option>
                    <option value="reel">Reel</option>
                    <option value="carousel">Carousel</option>
                    <option value="video">Video</option>
                    <option value="audio">Audio</option>
                    <option value="document">Document</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-white/60 uppercase tracking-wider mb-2">
                  Description (Optional)
                </label>
                <textarea
                  value={newContent.description}
                  onChange={(e) => setNewContent({ ...newContent, description: e.target.value })}
                  placeholder="Brief description or notes..."
                  rows={3}
                  className="w-full bg-[#050505] border border-white/10 rounded-lg px-4 py-3 text-sm text-white placeholder:text-white/30 focus:border-white/30 focus:outline-none resize-none"
                />
              </div>
            </div>

            <div className="flex gap-3 mt-6">
              <button
                onClick={() => {
                  setShowNewContentModal(false);
                  setNewContent({
                    title: '',
                    platform: 'X',
                    type: 'post',
                    description: ''
                  });
                }}
                className="flex-1 py-3 bg-white/5 hover:bg-white/10 text-white/60 text-sm font-medium rounded-xl transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleCreateNewContent}
                disabled={!newContent.title.trim()}
                className="flex-1 py-3 bg-green-500 hover:bg-green-400 disabled:bg-white/10 disabled:text-white/30 disabled:cursor-not-allowed text-black text-sm font-bold rounded-xl transition-colors flex items-center justify-center gap-2"
              >
                <Plus className="w-4 h-4" />
                Create Content
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Upgrade Prompt */}
      {upgradePrompt && (
        <UpgradePrompt
          feature={upgradePrompt.feature}
          requiredTier={upgradePrompt.requiredTier}
          currentTier={userTier}
          creditsRequired={upgradePrompt.creditsRequired}
          creditsAvailable={upgradePrompt.creditsAvailable}
          onClose={() => setUpgradePrompt(null)}
          onUpgrade={() => {
            window.location.href = '#pricing';
          }}
        />
      )}
    </div>
  );
};

export default ProductionRoomView;
