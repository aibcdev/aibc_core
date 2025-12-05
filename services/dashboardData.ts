/**
 * Real-time dashboard data services
 * Fetches actual data from APIs/storage and scan results
 */

export interface AnalyticsData {
  contentCreated: number; // Total content suggested/created from footprint
  contentPublished: number; // Content published
  contentScheduled: number; // Content scheduled for future
  brandVoiceMatch: number; // Percentage match to brand voice (0-100)
  trends: {
    created: string;
    published: string;
    scheduled: string;
    voiceMatch: string;
  };
}

export interface CalendarEvent {
  id: string;
  title: string;
  type: 'blog' | 'social' | 'email' | 'video' | 'pr';
  startDay: number;
  span: number;
  color: string;
  assignedUsers: number;
}

export interface CompetitorData {
  name: string;
  category: string;
  share: string;
  trend: 'up' | 'down';
  strategy: string;
  frequency: string;
  ourEdge: string;
  theirEdge: string;
  color: 'blue' | 'purple' | 'orange';
}

/**
 * Calculate content suggestions count from scan data
 * Social-first: X, LinkedIn, Instagram, TikTok, Audio, YouTube
 */
function calculateContentSuggestions(): number {
  try {
    const scanResults = localStorage.getItem('lastScanResults');
    if (!scanResults) return 0;
    
    const data = JSON.parse(scanResults);
    const themes = data.extractedContent?.content_themes || [];
    const pillars = data.brandDNA?.corePillars || [];
    const insights = data.strategicInsights || [];
    
    if (themes.length === 0) return 0;
    
    // Social-first content breakdown:
    // X (Twitter): 2 posts (thread + hot take)
    // LinkedIn: 2 posts
    // Instagram: 3 posts (reel + carousel + story)
    // TikTok: 3 videos
    // Audio: 2 (podcast + voice note)
    // YouTube: 1 (if pillars exist)
    // Strategic: 1 (if insights exist)
    
    const xCount = 2;
    const linkedinCount = 2;
    const instagramCount = 3;
    const tiktokCount = 3;
    const audioCount = 2;
    const youtubeCount = pillars.length > 0 ? 1 : 0;
    const strategicCount = insights.length > 0 ? 1 : 0;
    
    return xCount + linkedinCount + instagramCount + tiktokCount + audioCount + youtubeCount + strategicCount;
  } catch (e) {
    return 0;
  }
}

/**
 * Calculate brand voice match from scan data
 */
function calculateBrandVoiceMatch(): number {
  try {
    const scanResults = localStorage.getItem('lastScanResults');
    if (!scanResults) return 0;
    
    const data = JSON.parse(scanResults);
    // Use extraction confidence as a proxy for brand voice match
    const confidence = data.extractedContent?.extraction_confidence || 0;
    return Math.round(confidence * 100);
  } catch (e) {
    return 0;
  }
}

/**
 * Fetch real analytics data based on scan results
 */
export async function fetchAnalyticsData(): Promise<AnalyticsData> {
  const contentCreated = calculateContentSuggestions();
  const brandVoiceMatch = calculateBrandVoiceMatch();
  
  // Published/Scheduled would come from actual content tracking
  // For now, these start at 0 until user actually publishes content
  const contentPublished = 0;
  const contentScheduled = 0;
  
  return {
    contentCreated,
    contentPublished,
    contentScheduled,
    brandVoiceMatch,
    trends: {
      created: contentCreated > 0 ? `+${contentCreated}` : '0',
      published: '0',
      scheduled: '0',
      voiceMatch: brandVoiceMatch > 0 ? `${brandVoiceMatch}%` : '0%',
    },
  };
}

/**
 * Fetch calendar events based on suggested content
 */
export async function fetchCalendarEvents(): Promise<CalendarEvent[]> {
  try {
    const scanResults = localStorage.getItem('lastScanResults');
    if (!scanResults) return [];
    
    const data = JSON.parse(scanResults);
    const themes = data.extractedContent?.content_themes || [];
    
    if (themes.length === 0) return [];
    
    // Generate suggested calendar events based on themes
    const events: CalendarEvent[] = [];
    const today = new Date().getDay();
    
    themes.slice(0, 3).forEach((theme: string, index: number) => {
      events.push({
        id: `suggested_${index}`,
        title: `${theme} - Content`,
        type: index === 0 ? 'video' : index === 1 ? 'social' : 'blog',
        startDay: (today + index + 1) % 7,
        span: 1,
        color: index === 0 ? '#10B981' : index === 1 ? '#8B5CF6' : '#F59E0B',
        assignedUsers: 1
      });
    });
    
    return events;
  } catch (e) {
    return [];
  }
}

/**
 * Fetch real competitor data
 */
export async function fetchCompetitors(): Promise<CompetitorData[]> {
  // Returns empty - competitors are shown from scan results
  return [];
}

/**
 * Fetch real content pipeline data based on scan suggestions
 */
export async function fetchContentPipeline(): Promise<{
  published: number;
  drafting: number;
  scheduled: number;
  needsReview: number;
  total: number;
}> {
  const suggestions = calculateContentSuggestions();
  
  return {
    published: 0,
    drafting: 0,
    scheduled: 0,
    needsReview: suggestions, // All suggested content needs review
    total: suggestions,
  };
}
