import React, { useState, useEffect } from 'react';
import { Filter, Plus, FileText, Video, Image as ImageIcon, MoreHorizontal, Clock, Mic2, X, Play, Download, Sparkles, RefreshCw, Linkedin, Instagram, Music, Send, Copy, Edit3, Loader2, ChevronRight, Hash, AtSign, Calendar } from 'lucide-react';
import { generatePodcast } from '../services/podcastClient';
import { addToInbox } from '../services/inboxService';
import { hasEnoughCredits, deductCredits, CREDIT_COSTS } from '../services/subscriptionService';

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
  
  const userTier = 'premium';

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
            generateContentSuggestions(parsed, lastUsername).catch(err => {
              console.error('Error generating suggestions:', err);
            });
          }
        } catch (e) {
          console.error('Error parsing scan results:', e);
        }
      }
    };
    
    loadScanData();
  }, []);

  // Generate personalized content suggestions - SOCIAL FIRST - USING REAL BRAND DATA
  const generateContentSuggestions = async (data: ScanData, user: string | null) => {
    const suggestions: ContentAsset[] = [];
    
    // Get REAL brand data - no fallbacks to generic placeholders
    const themes = data.extractedContent?.content_themes || [];
    const posts = data.extractedContent?.posts || [];
    const brandDNA = data.brandDNA || {};
    const insights = data.strategicInsights || [];
    const corePillars = brandDNA.corePillars || [];
    const voice = brandDNA.voice || {};
    
    // If we have NO real data, don't generate generic suggestions - show message instead
    if (themes.length === 0 && posts.length === 0 && !brandDNA.voice) {
      console.warn('No real brand data available - cannot generate suggestions');
      setAssets([]);
      return;
    }
    
    // Use REAL themes from scan - if empty, extract from posts
    let realThemes = themes;
    if (realThemes.length === 0 && posts.length > 0) {
      // Extract themes from actual post content
      const postText = posts.slice(0, 10).map((p: any) => p.content || '').join(' ');
      // Simple keyword extraction (in production, use LLM)
      const keywords = postText.toLowerCase().match(/\b\w{4,}\b/g) || [];
      const commonWords = keywords.filter((w: string) => !['this', 'that', 'with', 'from', 'your', 'they', 'have', 'been', 'will', 'would'].includes(w));
      realThemes = [...new Set(commonWords.slice(0, 5))];
    }
    
    // Use actual brand name/username instead of generic
    const brandName = user || brandDNA.brandName || 'your brand';
    const mainTheme = realThemes[0] || (posts[0]?.content?.substring(0, 30) || 'your expertise');
    const secondTheme = realThemes[1] || (posts[1]?.content?.substring(0, 30) || mainTheme);
    const thirdTheme = realThemes[2] || (posts[2]?.content?.substring(0, 30) || secondTheme);
    
    // Use actual brand voice/tone for descriptions
    const tone = voice.tone || voice.style || 'professional';
    const style = voice.style || 'authentic';
    
    // === X (TWITTER) ===
    // Use actual post content as inspiration if available
    const xPostInspiration = posts.find((p: any) => p.platform === 'twitter' || p.platform === 'x')?.content?.substring(0, 100) || '';
    
    suggestions.push({
      id: 'x_thread_1',
      title: xPostInspiration ? `Thread: ${xPostInspiration.substring(0, 50)}...` : `Thread: ${mainTheme} - Deep Dive`,
      description: posts.length > 0 
        ? `Expand on your ${tone} take about ${mainTheme} into a thread`
        : `10-tweet thread on ${mainTheme} in your ${tone} voice`,
      platform: 'X',
      status: 'suggested',
      type: 'thread',
      timeAgo: 'AI suggested',
      basedOn: mainTheme
    });
    
    suggestions.push({
      id: 'x_post_1',
      title: posts[0]?.content?.substring(0, 60) || `Hot take: ${secondTheme}`,
      description: posts[0] 
        ? `Refine this ${tone} post for maximum engagement`
        : `${tone} single tweet about ${secondTheme}`,
      platform: 'X',
      status: 'suggested',
      type: 'document',
      timeAgo: 'AI suggested',
      basedOn: secondTheme
    });
    
    // === LINKEDIN ===
    const linkedinPost = posts.find((p: any) => p.platform === 'linkedin')?.content || '';
    
    suggestions.push({
      id: 'linkedin_post_1',
      title: linkedinPost 
        ? `${linkedinPost.substring(0, 50)}...`
        : `${mainTheme}: Insights from ${brandName}`,
      description: linkedinPost
        ? `Refine this ${tone} LinkedIn post for professional audience`
        : `${tone} professional post about ${mainTheme} - personal story format`,
      platform: 'LINKEDIN',
      status: 'suggested',
      type: 'document',
      timeAgo: 'AI suggested',
      basedOn: mainTheme
    });
    
    if (insights.length > 0) {
      suggestions.push({
        id: 'linkedin_post_2',
        title: insights[0].title || `Strategic insight: ${secondTheme}`,
        description: insights[0].description?.substring(0, 80) || `Share your ${tone} perspective on ${secondTheme}`,
        platform: 'LINKEDIN',
        status: 'suggested',
        type: 'document',
        timeAgo: 'Strategic',
        basedOn: insights[0].title || secondTheme
      });
    }
    
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
    if (insights.length > 0) {
      insights.slice(0, 2).forEach((insight: any, idx: number) => {
        if (insight.title) {
          suggestions.push({
            id: `strategic_post_${idx + 1}`,
            title: insight.title,
            description: insight.description?.substring(0, 80) || `Strategic content based on ${brandName}'s insights`,
            platform: idx % 2 === 0 ? 'X' : 'LINKEDIN',
            status: 'suggested',
            type: idx % 2 === 0 ? 'thread' : 'document',
            timeAgo: 'Strategic',
            basedOn: insight.title
          });
        }
      });
    }
    
    // Only set if we have real suggestions (not generic)
    if (suggestions.length > 0) {
      setAssets(suggestions);
    } else {
      console.warn('No valid content suggestions generated - insufficient brand data');
      setAssets([]);
    }
  };

  const regenerateSuggestions = async () => {
    setIsGenerating(true);
    try {
      if (scanData) {
        await generateContentSuggestions(scanData, username);
      }
    } catch (error) {
      console.error('Error regenerating suggestions:', error);
    } finally {
      setIsGenerating(false);
    }
  };

  // Open content creation panel
  const handleStartCreating = async (asset: ContentAsset) => {
    console.log('Start Creating clicked for asset:', asset);
    try {
      // Set selected asset immediately so panel shows
      setSelectedAsset(asset);
      setGeneratedContent('');
      setContentNotes('');
      
      // Generate content asynchronously
      generateContentForPlatform(asset).catch(error => {
        console.error('Error generating content:', error);
        setGeneratedContent('Error generating content. Please try again or use the template below.');
      });
    } catch (error) {
      console.error('Error starting content creation:', error);
      // Still show the panel even if generation fails
      setGeneratedContent('Error generating content. Please try again or use the template below.');
    }
  };

  // Generate platform-specific content - USING REAL BRAND DATA
  const generateContentForPlatform = async (asset: ContentAsset) => {
    setIsCreatingContent(true);
    
    try {
      // Use REAL brand data
      const brandDNA = scanData?.brandDNA || {};
      const voice = brandDNA.voice || {};
      const posts = scanData?.extractedContent?.posts || [];
      const theme = asset.basedOn || 'your expertise';
      const tone = voice.tone || voice.style || 'professional';
      const style = voice.style || 'authentic';
      const vocabulary = voice.vocabulary || [];
      
      // Get actual post examples for this theme/platform
      const relevantPosts = posts.filter((p: any) => 
        p.content?.toLowerCase().includes(theme.toLowerCase()) || 
        p.platform === asset.platform.toLowerCase()
      ).slice(0, 3);
      
      // Call backend API to generate brand-specific content
      const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001';
      const response = await fetch(`${API_BASE_URL}/api/generate/content`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          asset: {
            title: asset.title,
            platform: asset.platform,
            type: asset.type,
            theme: theme
          },
          brandDNA: brandDNA,
          examplePosts: relevantPosts.slice(0, 2).map((p: any) => p.content),
          username: username
        })
      });
      
      let content = '';
      
      if (response.ok) {
        const data = await response.json();
        content = data.content || '';
      } else {
        // Fallback to template but with REAL brand data
        console.warn('Backend generation failed, using template with real data');
        content = generateTemplateContent(asset, theme, tone, style, relevantPosts, username);
      }
      
      setGeneratedContent(content);
    } catch (error) {
      console.error('Error generating content:', error);
      // Fallback to template
      const brandVoice = scanData?.brandDNA?.voice?.tone || 'professional yet approachable';
      const theme = asset.basedOn || 'your expertise';
      setGeneratedContent(generateTemplateContent(asset, theme, brandVoice, 'authentic', [], username));
    } finally {
      setIsCreatingContent(false);
    }
  };
  
  // Generate template content using REAL brand data (fallback)
  const generateTemplateContent = (
    asset: ContentAsset,
    theme: string,
    tone: string,
    style: string,
    examplePosts: any[],
    username: string | null
  ): string => {
    
    let content = '';
    
    switch (asset.platform) {
      case 'X':
        if (asset.type === 'thread') {
          content = `🧵 Thread: ${asset.title}\n\n` +
            `1/ Let's talk about ${theme}.\n\n` +
            `Most people get this wrong. Here's what I've learned after years in the game:\n\n` +
            `2/ The biggest misconception about ${theme} is...\n\n` +
            `[Your insight here]\n\n` +
            `3/ Here's what actually works:\n\n` +
            `• Point 1\n• Point 2\n• Point 3\n\n` +
            `4/ The game-changer nobody talks about:\n\n` +
            `[Your unique perspective]\n\n` +
            `5/ If you take one thing from this thread:\n\n` +
            `[Key takeaway]\n\n` +
            `6/ Want more insights like this?\n\n` +
            `Follow @${username || 'me'} for daily takes on ${theme}.\n\n` +
            `Like this thread? Repost to help others. 🔄`;
        } else {
          content = `Hot take: ${theme} is misunderstood.\n\n` +
            `Here's the truth nobody wants to hear:\n\n` +
            `[Your bold opinion]\n\n` +
            `Agree? Disagree? Let me know 👇`;
        }
        break;
        
      case 'LINKEDIN':
        content = `${asset.title}\n\n` +
          `I've been thinking about ${theme} a lot lately.\n\n` +
          `Here's what most people miss:\n\n` +
          `When I first started, I made every mistake in the book.\n\n` +
          `But then I realized something crucial:\n\n` +
          `[Your key insight]\n\n` +
          `The lesson?\n\n` +
          `→ Point 1\n→ Point 2\n→ Point 3\n\n` +
          `What's your experience with ${theme}?\n\n` +
          `Drop a comment below - I read every single one.\n\n` +
          `#${theme.replace(/\s+/g, '')} #ContentCreation #PersonalBrand`;
        break;
        
      case 'INSTAGRAM':
        if (asset.type === 'reel') {
          content = `🎬 REEL SCRIPT: ${asset.title}\n\n` +
            `[HOOK - 0-3 seconds]\n` +
            `"Stop scrolling if you care about ${theme}"\n\n` +
            `[PROBLEM - 3-10 seconds]\n` +
            `"Most people think... but that's wrong"\n\n` +
            `[SOLUTION - 10-45 seconds]\n` +
            `"Here's what actually works:"\n` +
            `• Point 1 (with text overlay)\n` +
            `• Point 2 (with visual demo)\n` +
            `• Point 3 (quick tip)\n\n` +
            `[CTA - 45-60 seconds]\n` +
            `"Save this for later. Follow for more."\n\n` +
            `---\n` +
            `CAPTION:\n` +
            `${theme} simplified 💡\n\n` +
            `Save this for when you need it ⬇️\n\n` +
            `#${theme.replace(/\s+/g, '')} #Reels #Tips`;
        } else if (asset.type === 'carousel') {
          content = `📱 CAROUSEL: ${asset.title}\n\n` +
            `SLIDE 1 (Cover):\n` +
            `"5 Facts About ${theme}"\n` +
            `[Bold text, eye-catching design]\n\n` +
            `SLIDE 2:\n` +
            `Fact #1: [Your insight]\n\n` +
            `SLIDE 3:\n` +
            `Fact #2: [Your insight]\n\n` +
            `SLIDE 4:\n` +
            `Fact #3: [Your insight]\n\n` +
            `SLIDE 5:\n` +
            `Fact #4: [Your insight]\n\n` +
            `SLIDE 6:\n` +
            `Fact #5: [Your insight]\n\n` +
            `SLIDE 7 (CTA):\n` +
            `"Follow @${username || 'me'} for more"\n\n` +
            `---\n` +
            `CAPTION:\n` +
            `Which fact surprised you most? 🤔\n\n` +
            `Save this post and share with someone who needs it!`;
        } else {
          content = `📸 STORY SERIES: ${asset.title}\n\n` +
            `STORY 1: Hook\n` +
            `"Behind the scenes today..."\n\n` +
            `STORY 2: Context\n` +
            `[Quick video/photo of your process]\n\n` +
            `STORY 3: Interactive\n` +
            `Poll: "Do you struggle with ${theme}?"\n` +
            `Yes / Sometimes\n\n` +
            `STORY 4: Value\n` +
            `"Here's my secret..."\n\n` +
            `STORY 5: CTA\n` +
            `"DM me 'TIPS' for more"`;
        }
        break;
        
      case 'TIKTOK':
        content = `🎵 TIKTOK SCRIPT: ${asset.title}\n\n` +
          `[HOOK - First 1 second]\n` +
          `"POV: You finally understand ${theme}"\n\n` +
          `[SETUP - 1-5 seconds]\n` +
          `Start with relatable situation\n\n` +
          `[CONTENT - 5-45 seconds]\n` +
          `• Key point 1 (with text on screen)\n` +
          `• Key point 2 (demonstrate if possible)\n` +
          `• Key point 3 (quick tip)\n\n` +
          `[PAYOFF - 45-60 seconds]\n` +
          `The revelation/transformation moment\n\n` +
          `---\n` +
          `CAPTION:\n` +
          `${theme} explained in 60 seconds 🔥\n\n` +
          `#${theme.replace(/\s+/g, '')} #LearnOnTikTok #Tips`;
        break;
        
      case 'YOUTUBE':
        content = `🎬 YOUTUBE SCRIPT: ${asset.title}\n\n` +
          `[INTRO - 0:00-0:30]\n` +
          `Hook: "If you've ever wondered about ${theme}, this video is for you."\n` +
          `Promise: "By the end, you'll know exactly..."\n\n` +
          `[CHAPTER 1 - 0:30-3:00]\n` +
          `The Problem\n` +
          `• What most people get wrong\n` +
          `• Why it matters\n\n` +
          `[CHAPTER 2 - 3:00-6:00]\n` +
          `The Solution\n` +
          `• Step-by-step breakdown\n` +
          `• Real examples\n\n` +
          `[CHAPTER 3 - 6:00-9:00]\n` +
          `Advanced Tips\n` +
          `• Pro strategies\n` +
          `• Common mistakes to avoid\n\n` +
          `[OUTRO - 9:00-10:00]\n` +
          `Recap key points\n` +
          `CTA: "Subscribe and hit the bell"\n` +
          `Tease next video\n\n` +
          `---\n` +
          `TITLE OPTIONS:\n` +
          `• ${theme}: The Complete Guide (2024)\n` +
          `• I Wish I Knew This About ${theme} Sooner\n` +
          `• ${theme} Explained in 10 Minutes`;
        break;
        
      case 'PODCAST':
      case 'AUDIO':
        content = `🎙️ PODCAST SCRIPT: ${asset.title}\n\n` +
          `[INTRO - 0:00-0:30]\n` +
          `"Hey everyone, welcome back. Today we're diving into ${theme}..."\n\n` +
          `[MAIN CONTENT - 0:30-4:00]\n` +
          `\n` +
          `Section 1: The Basics\n` +
          `"Let's start with what ${theme} actually means..."\n\n` +
          `Section 2: My Experience\n` +
          `"When I first encountered this, I..."\n\n` +
          `Section 3: Actionable Tips\n` +
          `"Here's what you can do right now..."\n\n` +
          `[OUTRO - 4:00-5:00]\n` +
          `"So to wrap up..."\n` +
          `"If you found this valuable, subscribe..."\n` +
          `"Next episode, we'll cover..."\n\n` +
          `---\n` +
          `EPISODE TITLE: ${theme} - What You Need to Know\n` +
          `DESCRIPTION: In this episode, I break down ${theme}...`;
        break;
        
      default:
        content = `Content for ${asset.title}\n\n[Your content here]`;
    }
    
    return content;
  };

  const handleSaveAsDraft = () => {
    if (selectedAsset) {
      setAssets(assets.map(a => 
        a.id === selectedAsset.id ? { ...a, status: 'draft' as const, timeAgo: 'just now' } : a
      ));
      setSelectedAsset(null);
    }
  };

  const handleScheduleClick = () => {
    // Set default date to tomorrow and time to 9 AM
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    setScheduleDate(tomorrow.toISOString().split('T')[0]);
    setScheduleTime('09:00');
    setShowScheduleModal(true);
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

  const handleCopyContent = () => {
    navigator.clipboard.writeText(generatedContent);
  };

  const handleGeneratePodcast = async () => {
    if (!podcastTopic.trim()) {
      setPodcastError('Please enter a topic');
      return;
    }

    // Check if user has enough credits (but don't deduct yet - will deduct on acceptance)
    const hasCredits = hasEnoughCredits('AUDIO_GENERATION');
    if (!hasCredits) {
      const cost = CREDIT_COSTS.AUDIO_GENERATION;
      setPodcastError(`Insufficient credits. Need ${cost} credits. Please upgrade or purchase credits.`);
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
        // Add to inbox instead of deducting credits immediately
        const content = result.script || `Podcast script for: ${podcastTopic}`;
        const inboxId = addToInbox(
          'audio',
          `Podcast: ${podcastTopic}`,
          `${podcastDuration}-minute ${podcastStyle} podcast episode`,
          content,
          CREDIT_COSTS.AUDIO_GENERATION,
          {
            duration: podcastDuration,
            style: podcastStyle,
            podcastId: result.podcastId,
          }
        );

        setGeneratedPodcast(result);
        setPodcastError(null);
        setShowPodcastModal(false);
        
        // Show success message
        alert(`Podcast generated! Check your Inbox to review and accept (${CREDIT_COSTS.AUDIO_GENERATION} credits will be deducted when you accept).`);
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
    <div className="w-full h-full flex relative">
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
                onClick={() => {
                  setSelectedAsset(null);
                  setIsCreatingContent(false);
                  setGeneratedContent('');
                }}
                className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-white/10 text-white text-sm hover:bg-white/20 transition-all"
              >
                <Plus className="w-4 h-4" />
                New Asset
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
                  <button 
                    onClick={(e) => {
                      e.stopPropagation();
                      // For now, just select the asset to show options in side panel
                      setSelectedAsset(asset);
                      setIsCreatingContent(true);
                    }}
                    className="absolute top-4 right-4 p-2 text-white/20 hover:text-white/60 opacity-0 group-hover:opacity-100 transition-all"
                  >
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
        <div className="fixed top-0 right-0 w-[480px] h-screen bg-[#0A0A0A] border-l border-white/10 flex flex-col animate-in slide-in-from-right duration-300 z-[100]">
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
                {/* Generated Content */}
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <label className="text-xs font-bold text-white/60 uppercase tracking-wider">Generated Content</label>
                    <div className="flex items-center gap-2">
                      {!generatedContent && (
                        <button
                          onClick={() => generateContentForPlatform(selectedAsset)}
                          className="flex items-center gap-1 text-xs text-purple-400 hover:text-purple-300 transition-colors"
                        >
                          <RefreshCw className="w-3 h-3" />
                          Generate
                        </button>
                      )}
                      {generatedContent && (
                        <button 
                          onClick={handleCopyContent}
                          className="flex items-center gap-1 text-xs text-white/40 hover:text-white transition-colors"
                        >
                          <Copy className="w-3 h-3" />
                          Copy
                        </button>
                      )}
                    </div>
                  </div>
                  <textarea
                    value={generatedContent || ''}
                    onChange={(e) => setGeneratedContent(e.target.value)}
                    rows={16}
                    placeholder={generatedContent ? '' : 'Click "Generate" to create content, or start typing...'}
                    className="w-full bg-[#050505] border border-white/10 rounded-xl p-4 text-sm text-white placeholder:text-white/30 focus:border-white/30 focus:outline-none resize-none font-mono leading-relaxed"
                  />
                  {!generatedContent && (
                    <p className="text-xs text-white/40 mt-2">Content will be generated based on your brand voice and the selected asset.</p>
                  )}
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
                Schedule
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
                  <div className="flex items-center gap-3">
                    <button 
                      onClick={() => {
                        // Play podcast preview - would integrate with audio player
                        if (generatedPodcast?.audioUrl) {
                          const audio = new Audio(generatedPodcast.audioUrl);
                          audio.play().catch(err => console.error('Error playing audio:', err));
                        } else {
                          alert('Podcast preview not available');
                        }
                      }}
                      className="flex-1 py-2 bg-purple-500 hover:bg-purple-400 text-black text-xs font-bold rounded-lg flex items-center justify-center gap-2"
                    >
                      <Play className="w-4 h-4" /> Play Preview
                    </button>
                    <button 
                      onClick={() => {
                        // Download podcast
                        if (generatedPodcast?.audioUrl) {
                          const link = document.createElement('a');
                          link.href = generatedPodcast.audioUrl;
                          link.download = `podcast-${Date.now()}.mp3`;
                          link.click();
                        } else {
                          alert('Podcast not available for download');
                        }
                      }}
                      className="px-4 py-2 bg-white/10 hover:bg-white/20 text-white text-xs font-bold rounded-lg flex items-center gap-2"
                    >
                      <Download className="w-4 h-4" />
                    </button>
                  </div>
                </div>
                <div className="bg-white/5 rounded-xl p-4 border border-white/10">
                  <h3 className="text-sm font-bold text-white mb-2">{podcastTopic}</h3>
                  <p className="text-xs text-white/60 mb-4">{generatedPodcast.script?.substring(0, 200)}...</p>
                  <div className="flex gap-2">
                    <button 
                      onClick={() => {
                        // Play podcast preview - would integrate with audio player
                        if (generatedPodcast?.audioUrl) {
                          const audio = new Audio(generatedPodcast.audioUrl);
                          audio.play().catch(err => console.error('Error playing audio:', err));
                        } else {
                          alert('Podcast preview not available');
                        }
                      }}
                      className="flex-1 py-2 bg-purple-500 hover:bg-purple-400 text-black text-xs font-bold rounded-lg flex items-center justify-center gap-2"
                    >
                      <Play className="w-4 h-4" /> Play Preview
                    </button>
                    <button 
                      onClick={() => {
                        // Download podcast
                        if (generatedPodcast?.audioUrl) {
                          const link = document.createElement('a');
                          link.href = generatedPodcast.audioUrl;
                          link.download = `podcast-${Date.now()}.mp3`;
                          link.click();
                        } else {
                          alert('Podcast not available for download');
                        }
                      }}
                      className="px-4 py-2 bg-white/10 hover:bg-white/20 text-white text-xs font-bold rounded-lg flex items-center gap-2"
                    >
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
    </div>
  );
};

export default ProductionRoomView;
