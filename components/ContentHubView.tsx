import React, { useState, useEffect } from 'react';
import { Filter, RefreshCw, Plus, FileText, Video, Image as ImageIcon, Mic2, Linkedin, Instagram, Music, X, Play, Sparkles, Loader2, ArrowLeft, ArrowRight, Upload, Calendar, Zap, Wand2, Copy, Check, Edit3, Clock, Send } from 'lucide-react';
import { getScanResults, getDebugEndpoint } from '../services/apiClient';
import { trackApproval, trackEdit, trackDismissal, trackRegeneration, trackScanQuality } from '../services/learningClient';

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
  const [contentTypeFilter, setContentTypeFilter] = useState<'all' | 'text' | 'audio' | 'video'>('all');
  const [username, setUsername] = useState<string | null>(null);
  const [isRegenerating, setIsRegenerating] = useState(false);
  const [regenerationMessage, setRegenerationMessage] = useState('');
  
  // Content Creation Sidebar State
  const [selectedIdea, setSelectedIdea] = useState<ContentAsset | null>(null);
  const [generatedContent, setGeneratedContent] = useState<string>('');
  const [userNotes, setUserNotes] = useState<string>('');
  const [isCopied, setIsCopied] = useState(false);
  const [scheduleDate, setScheduleDate] = useState<string>('');
  
  // Content Creation Wizard State
  const [showCreateWizard, setShowCreateWizard] = useState(false);
  const [wizardStep, setWizardStep] = useState(1); // 1: Choose Type, 2: Add Content Types, 3: Topic & Media, 4: Schedule
  const [wizardMode, setWizardMode] = useState<'automatic' | 'manual' | null>(null);
  const [showGeminiImageGen, setShowGeminiImageGen] = useState(false);
  const [geminiPrompt, setGeminiPrompt] = useState('');
  const [geminiGenerating, setGeminiGenerating] = useState(false);
  const [geminiGeneratedImages, setGeminiGeneratedImages] = useState<string[]>([]);
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
  
  // Generate enterprise-level personalized content for selected idea
  const generateContentTemplate = async (asset: ContentAsset) => {
    // #region agent log
      fetch(getDebugEndpoint(),{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'ContentHubView.tsx:generateContentTemplate',message:'GENERATING CONTENT TEMPLATE',data:{assetTitle:asset.title,assetPlatform:asset.platform,assetTheme:asset.theme,username},timestamp:Date.now(),sessionId:'debug-session',hypothesisId:'H2'})}).catch(()=>{});
    // #endregion
    
    const brandName = username || localStorage.getItem('lastScannedUsername') || 'your brand';
    const theme = asset.theme || asset.basedOn || 'your topic';
    
    // Try to get brand context from scan results
    const lastScanResults = localStorage.getItem('lastScanResults');
    let brandContext: any = null;
    let brandDNA: any = null;
    let competitorIntelligence: any[] = [];
    let extractedContent: any = null;
    
    if (lastScanResults) {
      try {
        const parsed = JSON.parse(lastScanResults);
        brandDNA = parsed.brandDNA || null;
        competitorIntelligence = parsed.competitorIntelligence || [];
        extractedContent = parsed.extractedContent || null;
        
        // #region agent log
        fetch(getDebugEndpoint(),{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'ContentHubView.tsx:generateContentTemplate:BRAND_CONTEXT',message:'Brand context loaded',data:{hasBrandDNA:!!brandDNA,brandDNAKeys:brandDNA?Object.keys(brandDNA):[],hasExtractedContent:!!extractedContent,contentThemes:extractedContent?.content_themes?.length||0,competitorsCount:competitorIntelligence.length},timestamp:Date.now(),sessionId:'debug-session',hypothesisId:'H2'})}).catch(()=>{});
        // #endregion
        
        // Extract brand identity if available
        const brandIdentity = parsed.brandIdentity || null;
        if (brandIdentity) {
          brandContext = {
            name: brandIdentity.name || brandName,
            industry: brandIdentity.industry || brandDNA?.industry,
            niche: brandIdentity.niche || brandDNA?.niche,
            companySize: brandIdentity.companySize || 'medium',
            description: brandIdentity.description || parsed.profile?.bio || '',
            brandVoice: brandDNA?.voice || null,
            themes: extractedContent?.content_themes || brandDNA?.themes || brandDNA?.corePillars || [],
            competitors: competitorIntelligence.map((c: any) => ({
              name: c.name || c.competitor,
              advantage: c.advantage,
              contentStyle: c.contentStyle
            })),
            actualPosts: extractedContent?.posts || []
          };
        } else {
          // Fallback: construct from available data - USE ACTUAL SCAN DATA
          brandContext = {
            name: brandName,
            industry: brandDNA?.industry || 'General',
            niche: brandDNA?.niche,
            companySize: 'medium',
            description: parsed.profile?.bio || brandDNA?.description || '',
            brandVoice: brandDNA?.voice || null,
            themes: extractedContent?.content_themes || brandDNA?.themes || brandDNA?.corePillars || [],
            competitors: competitorIntelligence.map((c: any) => ({
              name: c.name || c.competitor,
              advantage: c.advantage,
              contentStyle: c.contentStyle
            })),
            actualPosts: extractedContent?.posts || []
          };
        }
      } catch (e) {
        console.error('Error parsing scan results for brand context:', e);
        // #region agent log
        fetch(getDebugEndpoint(),{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'ContentHubView.tsx:generateContentTemplate:ERROR',message:'Error parsing scan results',data:{error:String(e)},timestamp:Date.now(),sessionId:'debug-session',hypothesisId:'H2'})}).catch(()=>{});
        // #endregion
      }
    }
    
    // Determine platform
    const platform = asset.platform?.toLowerCase() || 'twitter';
    const isLinkedIn = platform === 'linkedin';
    const isTwitter = platform === 'x' || platform === 'twitter';
    
    // For LinkedIn and Twitter, use the new enterprise-level generator
    if ((isLinkedIn || isTwitter) && brandContext) {
      try {
        // NOTE: Prefer 127.0.0.1 over localhost to avoid IPv6 (::1) resolution issues in browsers.
        const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://127.0.0.1:3001';
        const response = await fetch(`${API_BASE_URL}/api/social/generate`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            platform: isLinkedIn ? 'linkedin' : 'twitter',
            topic: theme,
            format: asset.type === 'thread' ? 'thread' : 'post',
            brandContext,
            competitorInsights: competitorIntelligence.map((c: any) => 
              `${c.name || c.competitor}: ${c.advantage || c.contentStyle || ''}`
            ).join('; ')
          })
        });
        
        if (response.ok) {
          const result = await response.json();
          if (result.content) {
            return result.content;
          }
        }
      } catch (error) {
        console.error('Error generating personalized content:', error);
        // Fall back to template below
      }
    }
    
    // Fallback templates for other platforms or if API fails - USE BRAND-SPECIFIC DATA
    const brandIndustry = brandContext?.industry || brandDNA?.industry || '';
    const brandThemes = brandContext?.themes || brandDNA?.themes || brandDNA?.corePillars || [];
    const primaryTheme = brandThemes[0] || theme;
    const brandDescription = brandContext?.description || brandDNA?.description || '';
    
    // #region agent log - Log actual brand data being used
    const actualBrandData = {
      brandName,
      brandIndustry: brandContext?.industry || brandDNA?.industry || '',
      brandThemes: brandContext?.themes || brandDNA?.themes || brandDNA?.corePillars || [],
      brandDescription: brandContext?.description || brandDNA?.description || '',
      brandVoice: brandContext?.brandVoice || brandDNA?.voice || null,
      actualPostsCount: brandContext?.actualPosts?.length || extractedContent?.posts?.length || 0,
      competitorsCount: competitorIntelligence.length,
      primaryTheme
    };
    fetch(getDebugEndpoint(),{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'ContentHubView.tsx:generateContentTemplate:FALLBACK',message:'Using fallback template with brand data',data:actualBrandData,timestamp:Date.now(),sessionId:'debug-session',hypothesisId:'H2'})}).catch(()=>{});
    // #endregion
    
    // Use actual brand data - if no brand data, show error instead of generic content
    if (!brandDNA && !extractedContent && !brandContext) {
      return `⚠️ Brand data not available. Please run a digital footprint scan first to generate brand-specific content.

For ${brandName}, we need:
- Brand DNA and voice
- Content themes
- Industry context
- Competitor intelligence

Run a scan to unlock personalized content generation.`;
    }
    
    // Extract real brand information
    const realIndustry = brandContext?.industry || brandDNA?.industry || '';
    const realThemes = brandContext?.themes || brandDNA?.themes || brandDNA?.corePillars || [];
    const realPrimaryTheme = realThemes[0] || primaryTheme || 'your expertise';
    const realDescription = brandContext?.description || brandDNA?.description || extractedContent?.profile?.bio || '';
    const realVoice = brandContext?.brandVoice || brandDNA?.voice || {};
    const realPosts = brandContext?.actualPosts || extractedContent?.posts || [];
    
    // Use actual post content as inspiration if available
    const samplePostContent = realPosts.length > 0 ? realPosts[0]?.content?.substring(0, 200) : '';
    
    if (asset.type === 'thread') {
      return `🧵 Thread: ${asset.title || realPrimaryTheme}

1/ ${brandName} here. Let's talk about ${realPrimaryTheme}${realIndustry ? ` in ${realIndustry}` : ''}.

${realDescription ? `${realDescription.substring(0, 100)}... ` : ''}Here's what we've learned:

2/ The biggest misconception about ${realPrimaryTheme} is...

[Your insight based on ${brandName}'s ${realIndustry || 'expertise'}]

3/ Here's what actually works:

• Point 1
• Point 2
• Point 3

4/ The key takeaway:

[Your main insight]

5/ If you found this valuable, follow @${brandName} for more insights.

Like + Repost if this helped! 🔄`;
    } else if (asset.type === 'carousel') {
      return `📸 Carousel: ${asset.title || realPrimaryTheme}

SLIDE 1 (Hook):
"${realPrimaryTheme}${realIndustry ? ` - ${realIndustry}` : ''} - ${brandName}"
[Eye-catching visual related to ${realIndustry || realPrimaryTheme}]

SLIDE 2:
The Problem ${realIndustry ? `in ${realIndustry}` : 'We Solve'}
${realDescription ? `${realDescription.substring(0, 150)}` : `[Describe the pain point ${brandName} addresses]`}

SLIDE 3:
${brandName}'s Solution
${samplePostContent ? `Inspired by: "${samplePostContent}..."` : `[Your approach based on ${realDescription || 'your expertise'}]`}

SLIDE 4-6:
Key Points from ${brandName}
• ${realThemes[0] || realPrimaryTheme} insight
• ${realThemes[1] || 'Industry expertise'} perspective  
• ${realThemes[2] || 'Actionable takeaway'} for your audience

SLIDE 7 (CTA):
Save this for later!
Follow @${brandName} for more ${realPrimaryTheme} insights`;
    } else if (asset.type === 'reel' || asset.type === 'video') {
      const hookText = samplePostContent ? `"${samplePostContent.substring(0, 50)}..."` : `"${brandName} here. Did you know about ${realPrimaryTheme}?"`;
      return `🎬 ${asset.type === 'reel' ? 'Reel' : 'Video'}: ${asset.title || realPrimaryTheme}

HOOK (0-3s):
${hookText}

CONTENT (4-45s):
${realDescription ? `About ${brandName}: ${realDescription.substring(0, 200)}` : `Your main content about ${realPrimaryTheme}`}
${realIndustry ? `\n\nIn ${realIndustry}, ` : ''}${realThemes.length > 0 ? `we focus on ${realThemes.slice(0, 2).join(' and ')}.` : ''}

Key points to cover:
1. ${realThemes[0] || realPrimaryTheme} - ${brandName}'s expertise
2. ${realIndustry || 'Industry'}-specific insights
3. Actionable takeaway for your audience

CTA (45-60s):
"Follow @${brandName} for more ${realPrimaryTheme} content!"

---
Hashtags: #${realPrimaryTheme.replace(/\s+/g, '')} #${brandName.replace(/\s+/g, '')}${realIndustry ? ' #' + realIndustry.replace(/\s+/g, '') : ''}`;
    } else if (asset.type === 'podcast' || asset.type === 'audio') {
      return `🎙️ Podcast Script: ${asset.title || realPrimaryTheme}

INTRO:
"Welcome back to ${brandName}${realIndustry ? ` - your ${realIndustry} experts` : ''}. Today we're diving into ${realPrimaryTheme}${realIndustry ? ` in ${realIndustry}` : ''}..."

SEGMENT 1 (2-3 min):
- ${brandName}'s background: ${realDescription ? realDescription.substring(0, 200) : `Expertise in ${realPrimaryTheme}`}
- Why ${realPrimaryTheme} matters now${realIndustry ? ` in ${realIndustry}` : ''}
${realThemes.length > 0 ? `- Our focus on ${realThemes.slice(0, 2).join(' and ')}` : ''}

SEGMENT 2 (3-5 min):
- ${brandName}'s insights on ${realPrimaryTheme}
${samplePostContent ? `- Real example: "${samplePostContent.substring(0, 150)}..."` : `- Examples from ${realDescription || 'our experience'}`}
${competitorIntelligence.length > 0 ? `- How we compare to competitors in ${realIndustry || 'the market'}` : ''}

SEGMENT 3 (2-3 min):
- Actionable takeaways from ${brandName}
- How to apply ${realPrimaryTheme} insights in ${realIndustry || 'your work'}

OUTRO:
"Thanks for listening to ${brandName}! If you enjoyed this, leave a review and share with someone who needs to hear this."`;
    } else {
      const postContent = samplePostContent ? `Inspired by our recent content: "${samplePostContent.substring(0, 150)}..."\n\n` : '';
      return `📝 ${asset.platform.toUpperCase()} Post: ${asset.title || realPrimaryTheme}

${asset.description || `${brandName} sharing insights about ${realPrimaryTheme}${realIndustry ? ` in ${realIndustry}` : ''}...`}

${postContent}${realDescription ? `About ${brandName}: ${realDescription.substring(0, 200)}` : `Your main content about ${realPrimaryTheme}`}

Key points:
• ${realThemes[0] || realPrimaryTheme} - ${brandName}'s expertise
• ${realIndustry || 'Industry'}-specific perspective
• Actionable takeaway for your audience

---
What do you think? Drop a comment below! 👇

#${realPrimaryTheme.replace(/\s+/g, '')} #${brandName.replace(/\s+/g, '')}${realIndustry ? ' #' + realIndustry.replace(/\s+/g, '') : ''}`;
    }
  };
  
  // Handle selecting an idea for content creation
  const handleSelectIdea = async (asset: ContentAsset) => {
    setSelectedIdea(asset);
    setGeneratedContent('Generating personalized content...');
    setUserNotes('');
    setIsCopied(false);
    setScheduleDate('');
    
    // Generate personalized content
    try {
      const content = await generateContentTemplate(asset);
      setGeneratedContent(content);
    } catch (error) {
      console.error('Error generating content:', error);
      setGeneratedContent('Error generating content. Please try again.');
    }
  };
  
  // Handle copy to clipboard
  const handleCopyContent = async () => {
    const fullContent = userNotes ? `${generatedContent}\n\n---\nNotes: ${userNotes}` : generatedContent;
    try {
      await navigator.clipboard.writeText(fullContent);
      setIsCopied(true);
      setTimeout(() => setIsCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy:', err);
    }
  };
  
  // Handle save as draft
  const handleSaveDraft = () => {
    if (!selectedIdea) return;
    
    const updatedAssets = assets.map(a => 
      a.id === selectedIdea.id ? { ...a, status: 'draft' as const, timeAgo: 'Draft saved' } : a
    );
    setAssets(updatedAssets);
    
    // Save to localStorage
    const drafts = JSON.parse(localStorage.getItem('contentDrafts') || '{}');
    drafts[selectedIdea.id] = {
      content: generatedContent,
      notes: userNotes,
      savedAt: new Date().toISOString()
    };
    localStorage.setItem('contentDrafts', JSON.stringify(drafts));
    
    // Track approval for learning
    const lastScanId = localStorage.getItem('lastScanId');
    const lastUsername = localStorage.getItem('lastScannedUsername');
    if (lastScanId && lastUsername && selectedIdea) {
      trackApproval(
        lastScanId,
        lastUsername,
        selectedIdea.id,
        selectedIdea.title,
        selectedIdea.platform,
        selectedIdea.type
      ).catch(err => console.error('Failed to track approval:', err));
    }
    
    setSelectedIdea(null);
  };
  
  // Handle schedule
  const handleSchedule = () => {
    if (!selectedIdea || !scheduleDate) return;
    
    const updatedAssets = assets.map(a => 
      a.id === selectedIdea.id ? { ...a, status: 'scheduled' as const, timeAgo: `Scheduled: ${new Date(scheduleDate).toLocaleDateString()}` } : a
    );
    setAssets(updatedAssets);
    
    // Save to localStorage
    const scheduled = JSON.parse(localStorage.getItem('scheduledContent') || '{}');
    scheduled[selectedIdea.id] = {
      content: generatedContent,
      notes: userNotes,
      scheduledFor: scheduleDate,
      platform: selectedIdea.platform
    };
    localStorage.setItem('scheduledContent', JSON.stringify(scheduled));
    
    // Track approval for learning (scheduling = approval)
    const lastScanId = localStorage.getItem('lastScanId');
    const lastUsername = localStorage.getItem('lastScannedUsername');
    if (lastScanId && lastUsername && selectedIdea) {
      trackApproval(
        lastScanId,
        lastUsername,
        selectedIdea.id,
        selectedIdea.title,
        selectedIdea.platform,
        selectedIdea.type
      ).catch(err => console.error('Failed to track approval:', err));
    }
    
    setSelectedIdea(null);
  };
  
  const resetWizard = () => {
    setWizardStep(1);
    setWizardMode(null);
    setContentTypes(prev => prev.map(ct => ({ ...ct, count: 0 })));
    setTopicFocus('');
    setUploadedFiles([]);
    setSelectedSchedule('current');
  };
  
  const handleGeminiGenerate = async () => {
    if (!geminiPrompt.trim() || geminiGenerating) return;
    
    setGeminiGenerating(true);
    try {
      // NOTE: Prefer 127.0.0.1 over localhost to avoid IPv6 (::1) resolution issues in browsers.
      const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://127.0.0.1:3001';
      const response = await fetch(`${API_BASE_URL}/api/gemini/generate-image`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          prompt: geminiPrompt,
          size: 'square',
          style: 'photo'
        })
      });
      
      if (response.ok) {
        const result = await response.json();
        if (result.images && Array.isArray(result.images)) {
          setGeminiGeneratedImages(result.images);
        } else if (result.image) {
          setGeminiGeneratedImages([result.image]);
        }
      } else {
        console.error('Failed to generate image');
        alert('Failed to generate image. Please try again.');
      }
    } catch (error) {
      console.error('Error generating image:', error);
      alert('Error generating image. Please try again.');
    } finally {
      setGeminiGenerating(false);
    }
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

  // Load reviewed content from n8n workflows
  useEffect(() => {
    const loadReviewedContent = async () => {
      try {
        // NOTE: Prefer 127.0.0.1 over localhost to avoid IPv6 (::1) resolution issues in browsers.
        const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://127.0.0.1:3001';
        const response = await fetch(`${API_BASE_URL}/api/content-hub/reviewed`);
        
        if (response.ok) {
          const result = await response.json();
          if (result.success && result.items && result.items.length > 0) {
            const reviewedAssets: ContentAsset[] = result.items
              .filter((item: any) => item.status === 'reviewed' || item.status === 'approved')
              .map((item: any) => ({
                id: item.id,
                title: item.content.title || item.content.text?.substring(0, 50) || 'Reviewed Content',
                description: item.content.description || item.content.text,
                platform: item.content.platform || 'twitter',
                status: item.status === 'approved' ? 'scheduled' : 'suggested', // Ready for company review
                type: item.content.type || 'document',
                timeAgo: 'Just now',
                basedOn: 'n8n-workflow-review',
                theme: item.content.theme,
              }));
            
            setAssets(prev => {
              // Merge with existing, avoiding duplicates
              const existingIds = new Set(prev.map(a => a.id));
              const newAssets = reviewedAssets.filter(a => !existingIds.has(a.id));
              return [...newAssets, ...prev];
            });
          }
        }
      } catch (error) {
        console.error('[Content Hub] Error loading reviewed content:', error);
      }
    };

    loadReviewedContent();
    // Poll every 30 seconds for new reviewed content
    const interval = setInterval(loadReviewedContent, 30000);
    
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    loadContent();
    
    // Check for recent strategy updates when component mounts
    // This handles the case where strategy was updated while Content Hub wasn't visible
    const checkRecentStrategyUpdate = () => {
      try {
        const activeStrategy = localStorage.getItem('activeContentStrategy');
        const lastStrategyUpdate = localStorage.getItem('lastStrategyUpdate');
        const lastContentUpdate = localStorage.getItem('lastContentHubUpdate');
        
        // #region agent log
        fetch(getDebugEndpoint(),{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'ContentHubView.tsx:checkRecentStrategyUpdate',message:'CHECKING FOR RECENT STRATEGY UPDATE',data:{hasActiveStrategy:!!activeStrategy,lastStrategyUpdate,lastContentUpdate,timeSinceStrategyUpdate:lastStrategyUpdate ? Date.now() - parseInt(lastStrategyUpdate) : null},timestamp:Date.now(),sessionId:'debug-session',runId:'content-hub-mount',hypothesisId:'H18'})}).catch(()=>{});
        // #endregion
        
        // If there's an active strategy and it was updated recently (within last 5 minutes)
        // and we haven't updated content hub yet, trigger regeneration
        if (activeStrategy && lastStrategyUpdate) {
          const timeSinceUpdate = Date.now() - parseInt(lastStrategyUpdate);
          const lastUpdate = lastContentUpdate ? parseInt(lastContentUpdate) : 0;
          
          // If strategy was updated more recently than content hub was updated
          if (parseInt(lastStrategyUpdate) > lastUpdate && timeSinceUpdate < 5 * 60 * 1000) {
            console.log('🔄 Content Hub: Detected recent strategy update, triggering regeneration');
            // #region agent log
            fetch(getDebugEndpoint(),{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'ContentHubView.tsx:checkRecentStrategyUpdate',message:'TRIGGERING REGENERATION FROM RECENT UPDATE',data:{timeSinceUpdate,lastStrategyUpdate,lastContentUpdate},timestamp:Date.now(),sessionId:'debug-session',runId:'content-hub-mount',hypothesisId:'H18'})}).catch(()=>{});
            // #endregion
            
            // Dispatch a strategy update event to trigger regeneration
            const strategy = JSON.parse(activeStrategy);
            const strategyEvent = new CustomEvent('strategyUpdated', {
              detail: {
                strategy,
                activeStrategy: strategy,
                forceContentRegenerate: true,
                timestamp: parseInt(lastStrategyUpdate),
                source: 'mount-check',
                fromMount: true
              }
            });
            window.dispatchEvent(strategyEvent);
          }
        }
      } catch (e) {
        console.error('Error checking recent strategy update:', e);
      }
    };
    
    // Check for recent updates after a short delay to ensure component is fully mounted
    const checkTimer = setTimeout(checkRecentStrategyUpdate, 500);
    
    // Listen for new scan started - clear all state
    const handleNewScanStarted = (event: CustomEvent) => {
      console.log('🧹 Content Hub: New scan started, clearing all state');
      const { username, isRescan } = event.detail;
      
      // #region agent log - H11: Check if newScanStarted clears assets
      fetch(getDebugEndpoint(),{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'ContentHubView.tsx:handleNewScanStarted',message:'CLEARING ASSETS - NEW SCAN',data:{username,isRescan},timestamp:Date.now(),sessionId:'debug-session',hypothesisId:'H11'})}).catch(()=>{});
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
    
    // Listen for brand assets updates - CRITICAL: Must regenerate content via backend
    const handleBrandAssetsUpdate = async () => {
      console.log('📥 Brand assets updated - regenerating content ideas...');
      setRegenerationMessage('Updating based on brand assets...');
      setIsRegenerating(true);
      
      try {
        // Call backend to regenerate content based on brand assets
        // NOTE: Prefer 127.0.0.1 over localhost to avoid IPv6 (::1) resolution issues in browsers.
        const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://127.0.0.1:3001';
        const cachedResults = localStorage.getItem('lastScanResults');
        const parsed = cachedResults ? JSON.parse(cachedResults) : {};
        const currentUsername = localStorage.getItem('lastScannedUsername');
        
        if (!currentUsername) {
          console.error('⚠️ Content Hub: No username found - cannot regenerate content');
          setIsRegenerating(false);
          return;
        }
        
        // Load brand assets from localStorage
        const brandAssets = {
          materials: JSON.parse(localStorage.getItem('brandMaterials') || '[]'),
          colors: JSON.parse(localStorage.getItem('brandColors') || '[]'),
          fonts: JSON.parse(localStorage.getItem('brandFonts') || '[]'),
          profile: JSON.parse(localStorage.getItem('brandProfile') || '{}'),
          voice: JSON.parse(localStorage.getItem('brandVoice') || '{}'),
          contentPreferences: JSON.parse(localStorage.getItem('contentPreferences') || '{}')
        };
        
        // #region agent log
        fetch(getDebugEndpoint(),{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'ContentHubView.tsx:handleBrandAssetsUpdate',message:'CALLING REGENERATE-CONTENT FOR BRAND ASSETS',data:{hasBrandDNA:!!parsed.brandDNA,hasBrandAssets:!!brandAssets,currentUsername},timestamp:Date.now(),sessionId:'debug-session',runId:'content-hub-brand-assets',hypothesisId:'H20'})}).catch(()=>{});
        // #endregion
        
        const response = await fetch(`${API_BASE_URL}/api/analytics/regenerate-content`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            strategy: { type: 'brand_assets_update', description: 'Brand assets updated' },
            brandDNA: parsed.brandDNA,
            brandAssets: brandAssets, // Include brand assets in request
            competitorIntelligence: parsed.competitorIntelligence,
            currentContentIdeas: parsed.contentIdeas,
            scanUsername: currentUsername
          })
        });
        
        if (response.ok) {
          const result = await response.json();
          if (result.success && result.contentIdeas && Array.isArray(result.contentIdeas)) {
            console.log(`✅ Content Hub: Received ${result.contentIdeas.length} brand-asset-aligned ideas`);
            
            // Update localStorage with new ideas
            parsed.contentIdeas = result.contentIdeas;
            parsed.scanUsername = currentUsername;
            parsed.username = currentUsername;
            parsed.lastBrandAssetsUpdate = Date.now();
            localStorage.setItem('lastScanResults', JSON.stringify(parsed));
            localStorage.setItem('lastContentHubUpdate', Date.now().toString());
            
            // Convert new ideas to assets format
            const newAssets: ContentAsset[] = result.contentIdeas.map((idea: any, index: number) => ({
              id: `brand_assets_${Date.now()}_${index}`,
              title: idea.title || `Brand Asset Idea ${index + 1}`,
              description: idea.description || '',
              platform: (idea.platform || 'twitter').toUpperCase(),
              status: 'suggested',
              type: idea.format === 'video' || idea.format === 'reel' ? 'video' : 
                    idea.format === 'carousel' ? 'carousel' :
                    idea.format === 'thread' ? 'thread' : 'document',
              timeAgo: 'Just now',
              theme: idea.brandAlignment || '',
              basedOn: 'brand-assets'
            }));
            
            // Update UI immediately
            setAssets(newAssets);
            setRegenerationMessage('Content updated based on brand assets!');
          }
        }
      } catch (error) {
        console.error('Error regenerating content for brand assets:', error);
        // Fallback to local enhancement
        await enhanceContentIdeas();
      }
      
      setTimeout(() => setIsRegenerating(false), 1000);
    };
    
    // Listen for competitor added events
    const handleCompetitorAdded = async (event: CustomEvent) => {
      console.log('📥 Content Hub: Competitor added - regenerating content...', event.detail);
      const { competitor } = event.detail;
      setRegenerationMessage(`Adding competitor insights from ${competitor?.name || 'new competitor'}...`);
      setIsRegenerating(true);
      
      try {
        // NOTE: Prefer 127.0.0.1 over localhost to avoid IPv6 (::1) resolution issues in browsers.
        const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://127.0.0.1:3001';
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
    
    // Listen for strategy updates - REAL-TIME SYNC: Force content regeneration via backend
    const handleStrategyUpdate = async (event: CustomEvent) => {
      // #region agent log
      const getDebugEndpoint = () => 'http://127.0.0.1:7242/ingest/62bd50d3-9960-40ff-8da7-b4d57e001c2d';
      fetch(getDebugEndpoint(),{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'ContentHubView.tsx:handleStrategyUpdate',message:'STRATEGY UPDATE EVENT RECEIVED',data:{hasForceRegenerate:!!event.detail.forceContentRegenerate,hasActiveStrategy:!!event.detail.activeStrategy,hasStrategy:!!event.detail.strategy,hasMessages:!!event.detail.messages,messagesCount:event.detail.messages?.length||0,strategyType:event.detail.strategy?.type,source:event.detail.source},timestamp:Date.now(),sessionId:'debug-session',runId:'content-hub-update',hypothesisId:'H17'})}).catch(()=>{});
      // #endregion
      console.log('📥 Content Hub: Strategy updated event received!', event.detail);
      const { forceContentRegenerate, activeStrategy, strategy, messages } = event.detail;
      
      // REAL-TIME SYNC: Always regenerate when strategy changes
      // Even if forceContentRegenerate is false, check if strategy actually changed
      const currentStrategy = localStorage.getItem('activeContentStrategy');
      const newStrategy = strategy || activeStrategy;
      
      // If strategy changed, force regeneration
      if (newStrategy && currentStrategy) {
        try {
          const parsedCurrent = JSON.parse(currentStrategy);
          const strategyChanged = JSON.stringify(parsedCurrent) !== JSON.stringify(newStrategy);
          if (strategyChanged) {
            console.log('🔄 Content Hub: Strategy changed, forcing regeneration');
            // Force regeneration
            event.detail.forceContentRegenerate = true;
          }
        } catch (e) {
          // If can't parse, assume changed
          event.detail.forceContentRegenerate = true;
        }
      }
      
      // CRITICAL: Strategy update event ALWAYS means regenerate - the event itself indicates strategy changed
      // Extract strategy from messages if not provided
      if (!activeStrategy && !strategy && !event.detail.strategy && messages && Array.isArray(messages)) {
        // #region agent log
        fetch(getDebugEndpoint(),{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'ContentHubView.tsx:handleStrategyUpdate',message:'EXTRACTING STRATEGY FROM MESSAGES',data:{messagesCount:messages.length,lastMessageRole:messages[messages.length-1]?.role},timestamp:Date.now(),sessionId:'debug-session',runId:'content-hub-update',hypothesisId:'H17'})}).catch(()=>{});
        // #endregion
        // Get the last user message (most recent user request)
        const userMessages = messages.filter((m: any) => m.role === 'user');
        const lastUserMessage = userMessages[userMessages.length - 1];
        if (lastUserMessage) {
          console.log('📥 Content Hub: Extracting strategy from user message:', lastUserMessage.content.substring(0, 100));
          // Create a strategy object from the user's message
          event.detail.strategy = {
            type: 'user_directed',
            title: lastUserMessage.content.substring(0, 50) + (lastUserMessage.content.length > 50 ? '...' : ''),
            description: lastUserMessage.content,
            fromConversation: true,
            appliedAt: new Date().toISOString()
          };
          // #region agent log
          fetch(getDebugEndpoint(),{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'ContentHubView.tsx:handleStrategyUpdate',message:'STRATEGY EXTRACTED FROM MESSAGE',data:{strategyType:event.detail.strategy.type,strategyTitle:event.detail.strategy.title},timestamp:Date.now(),sessionId:'debug-session',runId:'content-hub-update',hypothesisId:'H17'})}).catch(()=>{});
          // #endregion
        }
      }
      
      // CRITICAL: Strategy update event = ALWAYS regenerate (ignore flags, event itself indicates change)
      const shouldRegenerate = true; // Always regenerate when strategy update event is received
      
      // #region agent log
      fetch(getDebugEndpoint(),{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'ContentHubView.tsx:handleStrategyUpdate',message:'FORCING REGENERATION - strategy update event',data:{hasActiveStrategy:!!activeStrategy,hasStrategy:!!strategy,hasEventStrategy:!!event.detail.strategy,hasMessages:!!messages,messagesCount:messages?.length||0},timestamp:Date.now(),sessionId:'debug-session',runId:'content-hub-update',hypothesisId:'H17'})}).catch(()=>{});
      // #endregion
      
      // If no strategy object but we have messages, create a strategy from the conversation
      if (!activeStrategy && !strategy && !event.detail.strategy && messages && messages.length > 0) {
        // #region agent log
        fetch(getDebugEndpoint(),{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'ContentHubView.tsx:handleStrategyUpdate',message:'CREATING STRATEGY FROM MESSAGES',data:{messagesCount:messages.length,lastMessage:messages[messages.length-1]?.content?.substring(0,100)},timestamp:Date.now(),sessionId:'debug-session',runId:'content-hub-update',hypothesisId:'H17'})}).catch(()=>{});
        // #endregion
        const lastUserMessage = messages.filter((m: any) => m.role === 'user').pop();
        if (lastUserMessage) {
          event.detail.strategy = {
            type: 'user_directed',
            title: lastUserMessage.content.substring(0, 50),
            description: lastUserMessage.content,
            fromConversation: true
          };
          console.log('📝 Content Hub: Created strategy from conversation:', event.detail.strategy);
        }
      }
      
      // If still no strategy, create a default one to ensure regeneration happens
      if (!activeStrategy && !strategy && !event.detail.strategy) {
        // #region agent log
        fetch(getDebugEndpoint(),{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'ContentHubView.tsx:handleStrategyUpdate',message:'CREATING DEFAULT STRATEGY',data:{forceContentRegenerate:shouldRegenerate},timestamp:Date.now(),sessionId:'debug-session',runId:'content-hub-update',hypothesisId:'H17'})}).catch(()=>{});
        // #endregion
        event.detail.strategy = {
          type: 'user_directed',
          title: 'Strategy Update',
          description: 'Content strategy updated',
          fromEvent: true
        };
        console.log('📝 Content Hub: Created default strategy to ensure regeneration');
      }
      
      // Show regeneration indicator immediately
      setRegenerationMessage('Applying strategy update...');
      setIsRegenerating(true);
      
      // Always clear assets immediately for instant feedback
      setAssets([]);
      localStorage.removeItem('productionAssets');
      
      // Get current username to ensure we're matching the right company
      const currentUsername = localStorage.getItem('lastScannedUsername');
      if (!currentUsername) {
        console.error('⚠️ Content Hub: No username found - cannot regenerate content');
        setIsRegenerating(false);
        return;
      }
      
      // REAL-TIME SYNC: Use the strategy from event (may have been extracted from conversation)
      // If no strategy exists but we have messages, create one from the last user message
      let finalStrategy = strategy || activeStrategy || event.detail.strategy;
      
      if (!finalStrategy && messages && Array.isArray(messages) && messages.length > 0) {
        // #region agent log
        fetch(getDebugEndpoint(),{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'ContentHubView.tsx:handleStrategyUpdate',message:'CREATING STRATEGY FROM MESSAGES - FINAL CHECK',data:{messagesCount:messages.length},timestamp:Date.now(),sessionId:'debug-session',runId:'content-hub-update',hypothesisId:'H17'})}).catch(()=>{});
        // #endregion
        const userMessages = messages.filter((m: any) => m.role === 'user');
        const lastUserMessage = userMessages[userMessages.length - 1];
        if (lastUserMessage) {
          finalStrategy = {
            type: 'user_directed',
            title: lastUserMessage.content.substring(0, 50) + (lastUserMessage.content.length > 50 ? '...' : ''),
            description: lastUserMessage.content,
            fromConversation: true,
            appliedAt: new Date().toISOString()
          };
          console.log('📝 Content Hub: Created final strategy from user message:', finalStrategy.title);
        }
      }
      
      // If still no strategy but shouldRegenerate is true, create a default one
      if (!finalStrategy && shouldRegenerate) {
        // #region agent log
        fetch(getDebugEndpoint(),{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'ContentHubView.tsx:handleStrategyUpdate',message:'CREATING DEFAULT STRATEGY FOR REGENERATION',data:{shouldRegenerate},timestamp:Date.now(),sessionId:'debug-session',runId:'content-hub-update',hypothesisId:'H17'})}).catch(()=>{});
        // #endregion
        finalStrategy = {
          type: 'user_directed',
          title: 'Content Strategy Update',
          description: 'Regenerating content based on strategy update',
          fromEvent: true,
          appliedAt: new Date().toISOString()
        };
        console.log('📝 Content Hub: Created default strategy to ensure regeneration');
      }
      
      // #region agent log
      fetch(getDebugEndpoint(),{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'ContentHubView.tsx:handleStrategyUpdate',message:'FINAL STRATEGY CHECK',data:{shouldRegenerate,hasFinalStrategy:!!finalStrategy,strategyType:finalStrategy?.type,strategyTitle:finalStrategy?.title},timestamp:Date.now(),sessionId:'debug-session',runId:'content-hub-update',hypothesisId:'H17'})}).catch(()=>{});
      // #endregion
      
      // CRITICAL: Always regenerate when strategy update event is received (shouldRegenerate is always true now)
      // Even if finalStrategy is not set, we should still regenerate with whatever strategy data we have
      if (shouldRegenerate) {
        console.log('🔄 Content Hub: Force regenerating content from backend based on new strategy');
        // #region agent log - H12: Check if strategy update clears assets
        fetch(getDebugEndpoint(),{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'ContentHubView.tsx:handleStrategyUpdate',message:'CLEARING ASSETS - STRATEGY UPDATE',data:{forceContentRegenerate:shouldRegenerate,hasStrategy:!!finalStrategy,currentUsername},timestamp:Date.now(),sessionId:'debug-session',hypothesisId:'H12'})}).catch(()=>{});
        // #endregion
        
        try {
          // Call backend to regenerate content based on strategy
          // NOTE: Prefer 127.0.0.1 over localhost to avoid IPv6 (::1) resolution issues in browsers.
          const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://127.0.0.1:3001';
          const cachedResults = localStorage.getItem('lastScanResults');
          const parsed = cachedResults ? JSON.parse(cachedResults) : {};
          
          // Validate username match before regenerating
          const cachedUsername = parsed.scanUsername || parsed.username;
          if (cachedUsername && cachedUsername.toLowerCase() !== currentUsername.toLowerCase()) {
            console.error(`⚠️ Content Hub: Username mismatch during strategy update! Current: ${currentUsername}, Cached: ${cachedUsername}`);
            setIsRegenerating(false);
            return;
          }
          
          // REAL-TIME SYNC: Include conversation context if available
          const conversationContext = messages ? messages.map((m: any) => `${m.role}: ${m.content}`).join('\n') : '';
          
          // #region agent log
          fetch(getDebugEndpoint(),{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'ContentHubView.tsx:768',message:'CALLING REGENERATE-CONTENT API',data:{hasStrategy:!!finalStrategy,hasBrandDNA:!!parsed.brandDNA,hasCompetitors:!!parsed.competitorIntelligence,competitorCount:parsed.competitorIntelligence?.length||0,hasConversationContext:!!conversationContext,conversationLength:conversationContext.length,currentUsername},timestamp:Date.now(),sessionId:'debug-session',runId:'content-hub-update',hypothesisId:'H11'})}).catch(()=>{});
          // #endregion
          // Use ONLY brand voice extracted from actual content (from brandDNA) - NOT manual settings
          // Brand voice should come from analyzing their actual posts, like asking ChatGPT "Write a paragraph explaining [COMPANY]"
          // #region agent log
          fetch(getDebugEndpoint(),{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'ContentHubView.tsx:handleStrategyUpdate',message:'USING EXTRACTED BRAND VOICE',data:{hasBrandDNA:!!parsed.brandDNA,hasBrandDNAVoice:!!parsed.brandDNA?.voice,voiceStyle:parsed.brandDNA?.voice?.style,voiceTone:parsed.brandDNA?.voice?.tone},timestamp:Date.now(),sessionId:'debug-session',runId:'content-hub-update',hypothesisId:'H19'})}).catch(()=>{});
          // #endregion
          
          const response = await fetch(`${API_BASE_URL}/api/analytics/regenerate-content`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              strategy: finalStrategy || { type: 'user_directed', title: 'Strategy Update', description: 'Content strategy updated' }, // Ensure strategy is always provided
              brandDNA: parsed.brandDNA, // brandDNA contains voice extracted from actual content
              competitorIntelligence: parsed.competitorIntelligence,
              currentContentIdeas: parsed.contentIdeas,
              scanUsername: currentUsername, // Use current username explicitly
              conversationContext: conversationContext.substring(0, 2000) // Include conversation context
            })
          });
          
          // #region agent log
          fetch(getDebugEndpoint(),{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'ContentHubView.tsx:781',message:'REGENERATE API RESPONSE',data:{ok:response.ok,status:response.status},timestamp:Date.now(),sessionId:'debug-session',runId:'content-hub-update',hypothesisId:'H11'})}).catch(()=>{});
          // #endregion
          
          if (response.ok) {
            const result = await response.json();
            // #region agent log
            fetch(getDebugEndpoint(),{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'ContentHubView.tsx:handleStrategyUpdate',message:'BACKEND RESPONSE RECEIVED',data:{success:result.success,hasContentIdeas:!!result.contentIdeas,contentIdeasCount:result.contentIdeas?.length||0,currentUsername},timestamp:Date.now(),sessionId:'debug-session',runId:'content-hub-update',hypothesisId:'H17'})}).catch(()=>{});
            // #endregion
            if (result.success && result.contentIdeas && Array.isArray(result.contentIdeas)) {
              console.log(`✅ Content Hub: Received ${result.contentIdeas.length} strategy-aligned ideas for ${currentUsername}`);
              
              // Update localStorage with new ideas - REPLACE, don't merge
              // Ensure username is set correctly
              parsed.contentIdeas = result.contentIdeas;
              parsed.scanUsername = currentUsername; // Ensure username is set
              parsed.username = currentUsername; // Also set username field
              parsed.lastStrategyUpdate = Date.now();
              parsed.strategyContext = strategy || activeStrategy;
              localStorage.setItem('lastScanResults', JSON.stringify(parsed));
              
              // Mark that Content Hub was updated (so we don't regenerate again unnecessarily)
              localStorage.setItem('lastContentHubUpdate', Date.now().toString());
              
              // Convert new ideas to assets format immediately
              const newAssets: ContentAsset[] = result.contentIdeas.map((idea: any, index: number) => ({
                id: `strategy_${Date.now()}_${index}`,
                title: idea.title || `Strategy Idea ${index + 1}`,
                description: idea.description || idea.strategyAlignment || '',
                platform: (idea.platform || 'twitter').toUpperCase(),
                status: 'suggested',
                type: idea.format === 'video' || idea.format === 'reel' ? 'video' : 
                      idea.format === 'carousel' ? 'carousel' :
                      idea.format === 'thread' ? 'thread' : 'document',
                timeAgo: 'Just now',
                theme: idea.competitorInspiration || idea.strategyAlignment,
                basedOn: 'strategy-update'
              }));
              
              // Update UI immediately with new assets
              setAssets(newAssets);
              setRegenerationMessage(`✅ ${newAssets.length} new ideas generated`);
              
              // Save to localStorage for persistence
              localStorage.setItem('productionAssets', JSON.stringify(newAssets));
              
              // Dispatch event to notify other components
              window.dispatchEvent(new CustomEvent('contentRegenerated', {
                detail: { 
                  strategy: strategy || activeStrategy,
                  contentCount: result.contentIdeas.length,
                  timestamp: Date.now(),
                  username: currentUsername
                }
              }));
              
              // Force a reload to ensure UI updates
              setTimeout(() => {
                loadContent();
                setIsRegenerating(false);
              }, 500);
            } else {
              console.error('Backend returned success but no content ideas');
              await loadContent();
              setTimeout(() => setIsRegenerating(false), 1000);
            }
          } else {
            const errorText = await response.text();
            console.error('Failed to regenerate content from backend:', response.status, errorText);
            await loadContent();
            setTimeout(() => setIsRegenerating(false), 1000);
          }
        } catch (error) {
          console.error('Error calling regenerate-content:', error);
          // Fallback to local enhancement if backend fails
          await enhanceContentIdeas();
          setTimeout(() => setIsRegenerating(false), 1000);
        }
      }
      // Note: shouldRegenerate is always true when strategy update event is received, so regeneration always happens
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
      const { username, results } = event.detail || {};
      // #region agent log
      fetch(getDebugEndpoint(),{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'ContentHubView.tsx:handleScanComplete',message:'scanComplete EVENT RECEIVED',data:{username,hasResults:!!results,hasContentIdeas:!!results?.contentIdeas,contentIdeasCount:results?.contentIdeas?.length||0,hasExtractedContent:!!results?.extractedContent},timestamp:Date.now(),sessionId:'debug-session',runId:'contenthub-scan-complete',hypothesisId:'H3'})}).catch(()=>{});
      // #endregion
      console.log('📥 Content Hub: Scan completed event received', { username, hasResults: !!results });
      // Always reload when scan completes - even if no contentIdeas, we might have brandDNA/context
      if (results) {
        setUsername(username);
        // Update cache immediately
        const cachedResults = localStorage.getItem('lastScanResults');
        if (cachedResults) {
          try {
            const parsed = JSON.parse(cachedResults);
            // Merge new results
            const updated = {
              ...parsed,
              ...results,
              scanUsername: username,
              username: username,
              timestamp: Date.now(),
              lastUpdated: new Date().toISOString()
            };
            localStorage.setItem('lastScanResults', JSON.stringify(updated));
          } catch (e) {
            console.error('Error updating cache:', e);
          }
        }
      }
      // Reload content to show new scan data
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
    
    // Set up event listeners with explicit logging
    console.log('🔧 Content Hub: Setting up event listeners...');
    
    window.addEventListener('newScanStarted', handleNewScanStarted as EventListener);
    window.addEventListener('brandAssetsUpdated', handleBrandAssetsUpdate);
    
    // CRITICAL: Strategy update listener - must be set up correctly
    const strategyListener = ((event: Event) => {
      // #region agent log
      const getDebugEndpoint = () => 'http://127.0.0.1:7242/ingest/62bd50d3-9960-40ff-8da7-b4d57e001c2d';
      fetch(getDebugEndpoint(),{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'ContentHubView.tsx:strategyListener',message:'EVENT LISTENER FIRED',data:{hasDetail:!!(event as CustomEvent).detail,hasStrategy:!!(event as CustomEvent).detail?.strategy,hasMessages:!!(event as CustomEvent).detail?.messages},timestamp:Date.now(),sessionId:'debug-session',runId:'content-hub-update',hypothesisId:'H10'})}).catch(()=>{});
      // #endregion
      handleStrategyUpdate(event as CustomEvent);
    }) as EventListener;
    window.addEventListener('strategyUpdated', strategyListener);
    // #region agent log
    const getDebugEndpoint = () => 'http://127.0.0.1:7242/ingest/62bd50d3-9960-40ff-8da7-b4d57e001c2d';
    fetch(getDebugEndpoint(),{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'ContentHubView.tsx:928',message:'EVENT LISTENER REGISTERED',data:{},timestamp:Date.now(),sessionId:'debug-session',runId:'content-hub-init',hypothesisId:'H10'})}).catch(()=>{});
    // #endregion
    console.log('✅ Content Hub: strategyUpdated event listener registered');
    
    window.addEventListener('competitorUpdated', handleCompetitorUpdate as EventListener);
    window.addEventListener('competitorAdded', handleCompetitorAdded as EventListener);
    window.addEventListener('scanComplete', handleScanComplete as EventListener);
    window.addEventListener('analyticsUpdated', handleAnalyticsUpdate as EventListener);
    window.addEventListener('dataChanged', handleDataChange as EventListener);
    
    // Test event listener is working
    console.log('✅ Content Hub: All event listeners registered');
    
    // Periodic refresh (every 5 minutes) to check for new data
    const periodicRefresh = setInterval(() => {
      console.log('🔄 Periodic content refresh...');
      enhanceContentIdeas();
    }, 5 * 60 * 1000); // 5 minutes
    
    return () => {
      window.removeEventListener('newScanStarted', handleNewScanStarted as EventListener);
      window.removeEventListener('brandAssetsUpdated', handleBrandAssetsUpdate);
      window.removeEventListener('strategyUpdated', strategyListener);
      window.removeEventListener('competitorUpdated', handleCompetitorUpdate as EventListener);
      window.removeEventListener('competitorAdded', handleCompetitorAdded as EventListener);
      window.removeEventListener('scanComplete', handleScanComplete as EventListener);
      window.removeEventListener('analyticsUpdated', handleAnalyticsUpdate as EventListener);
      window.removeEventListener('dataChanged', handleDataChange as EventListener);
      clearInterval(periodicRefresh);
      if (checkTimer) clearTimeout(checkTimer);
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
    const currentUsername = localStorage.getItem('lastScannedUsername');
    fetch(getDebugEndpoint(),{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'ContentHubView.tsx:loadContent:ENTRY',message:'loadContent START',data:{lastScannedUsername:currentUsername,lastScanId:localStorage.getItem('lastScanId'),hasLastScanResults:!!debugLastScanResults,contentIdeasInCache:debugParsedResults?.contentIdeas?.length||0,cacheKeys:debugParsedResults?Object.keys(debugParsedResults):[],cachedUsername:debugParsedResults?.scanUsername||debugParsedResults?.username},timestamp:Date.now(),sessionId:'debug-session',hypothesisId:'H1-H5'})}).catch(()=>{});
    // #endregion
    
    // CRITICAL: Validate username match BEFORE loading any content
    if (debugLastScanResults && currentUsername) {
      try {
        const parsed = JSON.parse(debugLastScanResults);
        const cachedUsername = parsed.scanUsername || parsed.username;
        if (cachedUsername && cachedUsername.toLowerCase() !== currentUsername.toLowerCase()) {
          console.log(`⚠️ Content Hub: Username mismatch! Current: ${currentUsername}, Cached: ${cachedUsername} - Clearing cache`);
          // Clear cache if username doesn't match
          localStorage.removeItem('lastScanResults');
          localStorage.removeItem('productionAssets');
          setAssets([]);
          return; // Don't load content for wrong company
        }
      } catch (e) {
        console.error('Error validating username:', e);
      }
    }
    
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
          fetch(getDebugEndpoint(),{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'ContentHubView.tsx:360',message:'getScanResults response',data:{lastScanId,success:results.success,hasContentIdeas:!!results.data?.contentIdeas,contentIdeasCount:results.data?.contentIdeas?.length||0},timestamp:Date.now(),sessionId:'debug-session',hypothesisId:'H3'})}).catch(()=>{});
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
        fetch(getDebugEndpoint(),{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'ContentHubView.tsx:loadContent:FALLBACK',message:'Trying localStorage fallback',data:{hasLastScanResults:!!lastScanResults,currentUsername,currentTimestamp},timestamp:Date.now(),sessionId:'debug-session',hypothesisId:'H2'})}).catch(()=>{});
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
            fetch(getDebugEndpoint(),{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'ContentHubView.tsx:loadContent:CACHE_CHECK',message:'Cache validation',data:{currentUsername,cachedUsername,usernameValid,hasContentIdeas:!!parsed.contentIdeas,contentIdeasCount:parsed.contentIdeas?.length||0},timestamp:Date.now(),sessionId:'debug-session',hypothesisId:'H4'})}).catch(()=>{});
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
      
      let extractedContent: any = null;
      if (cachedResults) {
        try {
          const parsedResults = JSON.parse(cachedResults);
          competitorIntelligence = parsedResults.competitorIntelligence || [];
          brandDNA = parsedResults.brandDNA || null;
          extractedContent = parsedResults.extractedContent || null;
        } catch (e) {
          console.error('Error parsing scan results for context:', e);
        }
      }
      
      // Filter out any generic content ideas before enhancement
      // Extract brand name without domain extension (airbnb.com -> airbnb, script.tv -> script)
      const brandNameLower = (lastUsername || '').toLowerCase().replace(/\.(com|net|org|io|co|app|tv)$/i, '').replace(/^www\./, '').replace(/^https?:\/\//, '');
      const brandIndustry = brandDNA?.industry?.toLowerCase() || '';
      const brandThemes = (brandDNA?.themes || brandDNA?.corePillars || extractedContent?.content_themes || []).map((t:any)=>typeof t === 'string' ? t.toLowerCase() : '').filter(Boolean);
      
      const isGenericIdea = (idea: any) => {
        const title = (idea.title || '').toLowerCase();
        const desc = (idea.description || '').toLowerCase();
        const combined = `${title} ${desc}`;
        
        // Generic patterns that indicate placeholder content
        const genericPatterns = [
          'content creation',
          'brand building', 
          'what i\'ve learned',
          'why content creation matters now',
          'content creation explained',
          'you finally get'
        ];
        const hitsGeneric = genericPatterns.some((p) => title.includes(p) || desc.includes(p));
        
        // Check if content confuses brand name with unrelated concepts
        // This is CRITICAL - backend sometimes generates wrong content that confuses brand names
        const wrongConceptPatterns: string[] = [];
        
        // If brand is "script" but NOT in rental/hospitality, filter out rental-related content
        if (brandNameLower === 'script' && !brandIndustry.includes('rental') && !brandIndustry.includes('hospitality') && !brandIndustry.includes('travel')) {
          wrongConceptPatterns.push('script properties', 'script host', 'script stay', 'script booking', 'short-term rental', 'airbnb', 'property host', 'stayed at');
        }
        
        // If brand is "nike" but NOT a game, filter out gaming content
        if (brandNameLower === 'nike' && !brandIndustry.includes('game') && !brandIndustry.includes('gaming') && !brandIndustry.includes('entertainment')) {
          wrongConceptPatterns.push('played nike', 'nike game', 'nike hours', 'gaming nike', 'played for', '1000 hours');
        }
        
        // General wrong concept detection - if content mentions concepts that don't match brand industry
        if (brandIndustry && brandIndustry.length > 0) {
          // If industry is clearly defined, check for obvious mismatches
          if (brandIndustry.includes('sportswear') || brandIndustry.includes('apparel') || brandIndustry.includes('fashion')) {
            // Sportswear brands shouldn't have gaming content
            if (combined.includes('played') && combined.includes('hours') && !combined.includes('sport')) {
              wrongConceptPatterns.push('gaming reference');
            }
          }
        }
        
        const hasWrongConcept = wrongConceptPatterns.some((p) => combined.includes(p));
        const hasBrand = brandNameLower && brandNameLower.length > 2 && (title.includes(brandNameLower) || desc.includes(brandNameLower));
        
        // Filter out if: (generic AND no brand mention) OR (wrong concept for this brand)
        // #region agent log
        if (hasWrongConcept) {
          fetch(getDebugEndpoint(),{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'ContentHubView.tsx:isGenericIdea',message:'FILTERING WRONG CONCEPT',data:{title:idea.title,hasWrongConcept,matchedPatterns:wrongConceptPatterns.filter(p=>combined.includes(p)),brandNameLower,brandIndustry},timestamp:Date.now(),sessionId:'debug-session',hypothesisId:'H5'})}).catch(()=>{});
        }
        // #endregion
        
        return (hitsGeneric && !hasBrand) || hasWrongConcept;
      };
      // Log before filtering
      console.log(`Content Hub: ${contentIdeasFromScan.length} ideas before generic filter`);
      // #region agent log - Log actual content idea titles to see if they're generic
      const firstThreeIdeas = contentIdeasFromScan.slice(0,3).map((i:any)=>({
        title:i.title,
        description:i.description?.substring(0,100),
        platform:i.platform,
        theme:i.theme
      }));
      fetch(getDebugEndpoint(),{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'ContentHubView.tsx:loadContent:BEFORE_FILTER',message:'Before generic filter - INSPECTING ACTUAL IDEAS',data:{countBefore:contentIdeasFromScan.length,firstThreeIdeas,allTitles:contentIdeasFromScan.map((i:any)=>i.title),hasBrandDNA:!!brandDNA,brandIndustry:brandDNA?.industry,brandThemes:brandDNA?.themes||brandDNA?.corePillars},timestamp:Date.now(),sessionId:'debug-session',hypothesisId:'H5'})}).catch(()=>{});
      // #endregion
      contentIdeasFromScan = contentIdeasFromScan.filter((idea) => !isGenericIdea(idea));
      // #region agent log
      fetch(getDebugEndpoint(),{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'ContentHubView.tsx:loadContent:AFTER_FILTER',message:'After generic filter',data:{countAfter:contentIdeasFromScan.length},timestamp:Date.now(),sessionId:'debug-session',hypothesisId:'H5'})}).catch(()=>{});
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
      fetch(getDebugEndpoint(),{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'ContentHubView.tsx:478',message:'contentIdeasFromScan check',data:{contentIdeasCount:contentIdeasFromScan.length,firstIdea:contentIdeasFromScan[0]?.title||'none'},timestamp:Date.now(),sessionId:'debug-session',hypothesisId:'H3'})}).catch(()=>{});
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
        // #region agent log - Log what assets are actually being set and WHY they might be wrong
        const firstAssetDetails = brandSpecificAssets[0] ? {
          title:brandSpecificAssets[0].title,
          description:brandSpecificAssets[0].description?.substring(0,100),
          platform:brandSpecificAssets[0].platform,
          theme:brandSpecificAssets[0].theme
        } : null;
        const brandDataForDebug = {
          username:lastUsername,
          brandNameLower,
          hasBrandDNA:!!brandDNA,
          brandIndustry:brandDNA?.industry,
          brandThemes:brandDNA?.themes||brandDNA?.corePillars,
          extractedContentThemes:extractedContent?.content_themes
        };
        fetch(getDebugEndpoint(),{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'ContentHubView.tsx:524',message:'setAssets CALLED - WHAT IS BEING DISPLAYED vs BRAND DATA',data:{assetCount:brandSpecificAssets.length,firstAssetDetails,allTitles:brandSpecificAssets.map((a:any)=>a.title),brandDataForDebug,contentIdeasSource:'backend'},timestamp:Date.now(),sessionId:'debug-session',hypothesisId:'H3'})}).catch(()=>{});
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
      fetch(getDebugEndpoint(),{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'ContentHubView.tsx:737',message:'CLEARING ASSETS - NO CONTENT IDEAS',data:{reason:'No content ideas from scan'},timestamp:Date.now(),sessionId:'debug-session',hypothesisId:'H9'})}).catch(()=>{});
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
      fetch(getDebugEndpoint(),{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'ContentHubView.tsx:CATCH',message:'CLEARING ASSETS - ERROR',data:{error:String(e)},timestamp:Date.now(),sessionId:'debug-session',hypothesisId:'H10'})}).catch(()=>{});
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
      
      // Track regeneration for learning
      if (lastScanId && lastUsername) {
        trackRegeneration(lastScanId, lastUsername, 'User requested content regeneration').catch(err => 
          console.error('Failed to track regeneration:', err)
        );
      }
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

  // Helper function to categorize content by type
  const getContentCategory = (asset: ContentAsset): 'text' | 'audio' | 'video' => {
    if (asset.type === 'video' || asset.type === 'reel') return 'video';
    if (asset.type === 'podcast' || asset.type === 'audio') return 'audio';
    return 'text'; // document, thread, carousel, image are all text-based
  };

  const filteredAssets = assets.filter(asset => {
    if (statusFilter !== 'all' && asset.status !== statusFilter) return false;
    if (platformFilter && asset.platform.toUpperCase() !== platformFilter.toUpperCase()) return false;
    if (contentTypeFilter !== 'all') {
      const category = getContentCategory(asset);
      if (category !== contentTypeFilter) return false;
    }
    return true;
  });

  // Count assets by content type
  const contentTypeCounts = {
    all: assets.length,
    text: assets.filter(a => getContentCategory(a) === 'text').length,
    audio: assets.filter(a => getContentCategory(a) === 'audio').length,
    video: assets.filter(a => getContentCategory(a) === 'video').length,
  };

  // #region agent log - H6: Check render state
  fetch(getDebugEndpoint(),{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'ContentHubView.tsx:RENDER',message:'Render cycle state',data:{assetsLength:assets.length,filteredAssetsLength:filteredAssets.length,statusFilter,platformFilter,firstAssetStatus:assets[0]?.status||'no-assets',firstAssetPlatform:assets[0]?.platform||'no-assets'},timestamp:Date.now(),sessionId:'debug-session',hypothesisId:'H6'})}).catch(()=>{});
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
        {/* Content Type Filters - PRIMARY FILTER */}
        <div className="flex items-center gap-2 flex-wrap">
          <span className="text-xs text-white/40 font-bold mr-2">TYPE:</span>
          {(['all', 'text', 'audio', 'video'] as const).map(type => (
            <button
              key={type}
              onClick={() => setContentTypeFilter(type)}
              className={`px-4 py-2 rounded-lg text-xs font-bold transition-all flex items-center gap-2 ${
                contentTypeFilter === type
                  ? 'bg-orange-500/20 text-orange-400 border border-orange-500/50'
                  : 'bg-white/5 text-white/40 hover:text-white/60 border border-white/10'
              }`}
            >
              {type === 'text' && <FileText className="w-3 h-3" />}
              {type === 'audio' && <Mic2 className="w-3 h-3" />}
              {type === 'video' && <Video className="w-3 h-3" />}
              {type.toUpperCase()} {type !== 'all' && `(${contentTypeCounts[type]})`}
            </button>
          ))}
        </div>

        {/* Status Filters */}
        <div className="flex items-center gap-2 flex-wrap">
          <span className="text-xs text-white/40 font-bold mr-2">STATUS:</span>
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
                    onClick={(e) => {
                      e.stopPropagation();
                      const category = getContentCategory(asset);
                      // If audio or video, navigate to production room
                      if (category === 'audio' || category === 'video') {
                        // Store the asset info for production room
                        localStorage.setItem('productionRoomRequest', JSON.stringify({
                          type: category,
                          asset: {
                            title: asset.title,
                            description: asset.description,
                            platform: asset.platform,
                            theme: asset.theme
                          },
                          timestamp: Date.now()
                        }));
                        // Navigate to production room
                        window.dispatchEvent(new CustomEvent('navigateToPage', { 
                          detail: { page: 'production' } 
                        }));
                        // Also update URL if using router
                        if (window.location.pathname !== '/productionroom') {
                          window.history.pushState({}, '', '/productionroom');
                          window.dispatchEvent(new PopStateEvent('popstate'));
                        }
                      } else {
                        // Text content - use existing flow
                        handleSelectIdea(asset);
                      }
                    }}
                    className="px-3 py-1.5 bg-orange-500 hover:bg-orange-400 text-white text-xs font-bold rounded-lg transition-colors opacity-0 group-hover:opacity-100"
                  >
                    {getContentCategory(asset) === 'audio' || getContentCategory(asset) === 'video' ? 'Create' : 'Start Creating'}
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
                  
                  {/* Generate with AI (Gemini) */}
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <label className="text-sm font-medium text-white">Generate Images with AI</label>
                      <span className="text-xs text-white/40">Powered by Gemini</span>
                    </div>
                    <button
                      onClick={() => {
                        // Open Gemini image generation modal
                        setShowGeminiImageGen(true);
                      }}
                      className="w-full border-2 border-dashed border-blue-500/30 rounded-xl p-6 text-center bg-blue-500/5 hover:bg-blue-500/10 transition-all group"
                    >
                      <div className="w-12 h-12 mx-auto mb-3 bg-gradient-to-br from-blue-400 via-purple-400 to-pink-500 rounded-lg flex items-center justify-center group-hover:scale-110 transition-transform">
                        <Sparkles className="w-6 h-6 text-white" />
                      </div>
                      <div className="font-medium text-white mb-1">Generate with AI</div>
                      <div className="text-xs text-white/50">Create banners, posters, and graphics</div>
                    </button>
                  </div>
                  
                  {/* Media Upload */}
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <label className="text-sm font-medium text-white">Or use specific images and videos</label>
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
      
      {/* Gemini Image Generation Modal (Blaze AI style) */}
      {showGeminiImageGen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/80 backdrop-blur-sm" onClick={() => { setShowGeminiImageGen(false); setGeminiPrompt(''); setGeminiGeneratedImages([]); }}></div>
          <div className="relative w-full max-w-2xl bg-[#0A0A0A] border border-white/10 rounded-2xl shadow-2xl animate-in zoom-in-95 duration-200 max-h-[90vh] overflow-hidden flex flex-col">
            <div className="p-6 border-b border-white/10">
              <div className="flex items-center justify-between mb-2">
                <h2 className="text-xl font-bold text-white">Generate an Image</h2>
                <button onClick={() => { setShowGeminiImageGen(false); setGeminiPrompt(''); setGeminiGeneratedImages([]); }} className="text-white/40 hover:text-white">
                  <X className="w-5 h-5" />
                </button>
              </div>
              <p className="text-sm text-white/50">Describe the image you want to generate—or try an example</p>
            </div>
            
            <div className="flex-1 overflow-y-auto p-6">
              <div className="mb-6">
                <div className="relative">
                  <input
                    type="text"
                    value={geminiPrompt}
                    onChange={(e) => setGeminiPrompt(e.target.value)}
                    placeholder="Overhead shot of artist's worktable"
                    className="w-full px-4 py-3 bg-[#050505] border border-white/10 rounded-xl text-white placeholder:text-white/30 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20"
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' && geminiPrompt.trim() && !geminiGenerating) {
                        handleGeminiGenerate();
                      }
                    }}
                  />
                  <button
                    onClick={handleGeminiGenerate}
                    disabled={!geminiPrompt.trim() || geminiGenerating}
                    className="absolute right-2 top-1/2 -translate-y-1/2 p-2 bg-blue-500 hover:bg-blue-600 disabled:bg-white/10 disabled:text-white/30 text-white rounded-lg transition-colors"
                  >
                    <Send className="w-4 h-4" />
                  </button>
                </div>
                
                <div className="flex items-center gap-2 mt-3">
                  <button className="px-3 py-1.5 border border-white/10 rounded-lg text-xs text-white/60 hover:border-white/20">
                    Size Square &gt;
                  </button>
                  <button className="px-3 py-1.5 border border-white/10 rounded-lg text-xs text-white/60 hover:border-white/20">
                    Style Photo &gt;
                  </button>
                  <button className="px-3 py-1.5 border border-white/10 rounded-lg text-xs text-white/60 hover:border-white/20">
                    Priority Speed &gt;
                  </button>
                </div>
              </div>
              
              {geminiGenerating && (
                <div className="text-center py-12">
                  <Loader2 className="w-8 h-8 animate-spin text-blue-500 mx-auto mb-4" />
                  <p className="text-white/60">Generating image...</p>
                </div>
              )}
              
              {geminiGeneratedImages.length > 0 && (
                <div>
                  <h3 className="text-sm font-medium text-white/60 mb-3">Generated Images</h3>
                  <div className="grid grid-cols-2 gap-4">
                    {geminiGeneratedImages.map((img, idx) => (
                      <div key={idx} className="relative group">
                        <img src={img} alt={`Generated ${idx + 1}`} className="w-full rounded-lg border border-white/10" />
                        <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity rounded-lg flex items-center justify-center gap-2">
                          <button className="px-3 py-1.5 bg-white/20 text-white rounded text-xs">Use</button>
                          <button className="px-3 py-1.5 bg-white/20 text-white rounded text-xs">Download</button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
              
              {!geminiGenerating && geminiGeneratedImages.length === 0 && (
                <div>
                  <h3 className="text-sm font-medium text-white/60 mb-3">Trending Examples</h3>
                  <div className="grid grid-cols-4 gap-3">
                    {['Happy customer holding a product', 'Overhead shot of artist\'s worktable', 'E-commerce summer sale promotion', 'Happy hour at a restaurant'].map((example, idx) => (
                      <button
                        key={idx}
                        onClick={() => {
                          setGeminiPrompt(example);
                          handleGeminiGenerate();
                        }}
                        className="aspect-square bg-white/5 rounded-lg border border-white/10 hover:border-blue-500/50 transition-colors p-2 text-[10px] text-white/60 text-center"
                      >
                        {example}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
      
      {/* Content Creation Sidebar */}
      {selectedIdea && (
        <div className="fixed inset-y-0 right-0 w-full max-w-md bg-[#0A0A0A] border-l border-white/10 shadow-2xl z-50 flex flex-col animate-in slide-in-from-right duration-300">
          {/* Header */}
          <div className="p-4 border-b border-white/10 flex items-start justify-between">
            <div className="flex items-center gap-3">
              <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                selectedIdea.platform === 'x' ? 'bg-white/10' :
                selectedIdea.platform === 'linkedin' ? 'bg-blue-500/20' :
                selectedIdea.platform === 'instagram' ? 'bg-gradient-to-br from-purple-500/20 to-pink-500/20' :
                selectedIdea.platform === 'tiktok' ? 'bg-white/10' :
                selectedIdea.platform === 'youtube' ? 'bg-red-500/20' :
                'bg-white/10'
              }`}>
                {selectedIdea.platform === 'x' && <span className="font-bold text-white">𝕏</span>}
                {selectedIdea.platform === 'linkedin' && <Linkedin className="w-5 h-5 text-blue-400" />}
                {selectedIdea.platform === 'instagram' && <Instagram className="w-5 h-5 text-pink-400" />}
                {selectedIdea.platform === 'tiktok' && <Music className="w-5 h-5 text-white" />}
                {selectedIdea.platform === 'youtube' && <Play className="w-5 h-5 text-red-500" />}
              </div>
              <div>
                <h2 className="text-lg font-bold text-white">Create Content</h2>
                <p className="text-xs text-white/40">{selectedIdea.platform} • {selectedIdea.type}</p>
              </div>
            </div>
            <button 
              onClick={() => setSelectedIdea(null)}
              className="p-2 hover:bg-white/5 rounded-lg transition-colors"
            >
              <X className="w-5 h-5 text-white/40" />
            </button>
          </div>
          
          {/* Title & Theme */}
          <div className="p-4 border-b border-white/10">
            <h3 className="text-sm font-bold text-white mb-1">{selectedIdea.title}</h3>
            {selectedIdea.theme && (
              <div className="flex items-center gap-1 text-xs text-orange-400">
                <span className="text-orange-400">#</span>
                Based on: {selectedIdea.theme}
              </div>
            )}
          </div>
          
          {/* Generated Content */}
          <div className="flex-1 overflow-y-auto p-4">
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-bold text-white/40 uppercase tracking-wider">GENERATED CONTENT</span>
              <button
                onClick={handleCopyContent}
                className="flex items-center gap-1.5 px-3 py-1.5 bg-white/5 hover:bg-white/10 rounded-lg text-xs text-white/60 hover:text-white transition-colors"
              >
                {isCopied ? <Check className="w-3.5 h-3.5 text-green-400" /> : <Copy className="w-3.5 h-3.5" />}
                {isCopied ? 'Copied!' : 'Copy'}
              </button>
            </div>
            
            <div className="bg-[#111111] border border-white/10 rounded-xl p-4 mb-6">
              <pre className="text-sm text-white/80 whitespace-pre-wrap font-mono leading-relaxed">
                {generatedContent}
              </pre>
            </div>
            
            {/* User Notes */}
            <div className="mb-4">
              <span className="text-xs font-bold text-white/40 uppercase tracking-wider mb-2 block">YOUR NOTES</span>
              <textarea
                value={userNotes}
                onChange={(e) => setUserNotes(e.target.value)}
                placeholder="Add any notes or modifications..."
                className="w-full h-24 px-4 py-3 bg-[#111111] border border-white/10 rounded-xl text-sm text-white placeholder:text-white/30 focus:outline-none focus:border-orange-500/50 resize-none"
              />
            </div>
            
            {/* AI Tips */}
            <div className="bg-orange-500/10 border border-orange-500/20 rounded-xl p-4">
              <div className="flex items-center gap-2 mb-2">
                <Sparkles className="w-4 h-4 text-orange-400" />
                <span className="text-xs font-bold text-orange-400 uppercase">AI TIPS</span>
              </div>
              <ul className="text-xs text-white/60 space-y-1">
                <li>• Copy this template and paste it into your preferred platform</li>
                <li>• Customize the placeholders with your specific insights</li>
                <li>• Add relevant images or media to boost engagement</li>
                <li>• Schedule for optimal posting times</li>
              </ul>
            </div>
          </div>
          
          {/* Footer Actions */}
          <div className="p-4 border-t border-white/10 space-y-3">
            {/* Schedule Date Picker */}
            <div className="flex items-center gap-2">
              <Clock className="w-4 h-4 text-white/40" />
              <input
                type="datetime-local"
                value={scheduleDate}
                onChange={(e) => setScheduleDate(e.target.value)}
                className="flex-1 px-3 py-2 bg-[#111111] border border-white/10 rounded-lg text-sm text-white focus:outline-none focus:border-orange-500/50"
              />
            </div>
            
            <div className="flex items-center gap-2">
              <button
                onClick={() => setSelectedIdea(null)}
                className="flex-1 px-4 py-2.5 border border-white/10 rounded-lg text-white/60 hover:bg-white/5 font-medium transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleSaveDraft}
                className="flex-1 px-4 py-2.5 bg-white/10 hover:bg-white/15 rounded-lg text-white font-medium transition-colors flex items-center justify-center gap-2"
              >
                <Edit3 className="w-4 h-4" />
                Save Draft
              </button>
              <button
                onClick={handleSchedule}
                disabled={!scheduleDate}
                className="flex-1 px-4 py-2.5 bg-orange-500 hover:bg-orange-400 disabled:bg-white/10 disabled:text-white/30 rounded-lg text-white font-medium transition-colors flex items-center justify-center gap-2 disabled:cursor-not-allowed"
              >
                <Send className="w-4 h-4" />
                Schedule
              </button>
            </div>
          </div>
        </div>
      )}
      
      {/* Overlay when sidebar is open */}
      {selectedIdea && (
        <div 
          className="fixed inset-0 bg-black/50 z-40"
          onClick={() => setSelectedIdea(null)}
        />
      )}
    </div>
  );
};

export default ContentHubView;

