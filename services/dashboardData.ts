/**
 * Real-time dashboard data services
 * Fetches actual data from APIs/storage and scan results
 */

export interface AnalyticsData {
  // New dashboard KPIs
  postsThisWeek: number; // Posts created this week
  postsThisWeekChange?: number; // Change vs last week (+/-)
  engagementThisWeek: number; // Engagement metrics this week
  engagementThisWeekChange?: number; // Change vs last week (+/-)
  contentPending: number; // Content items pending review/approval
  newInsights: number; // New insights generated
  newInsightsChange?: number; // Change vs last week (+/-)
  trends: {
    posts: string;
    engagement: string;
    pending: string;
    insights: string;
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
    if (Array.isArray(data.contentIdeas) && data.contentIdeas.length > 0) {
      return data.contentIdeas.length;
    }
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
 * Calculate dashboard KPIs from user activity and content
 */
function calculateDashboardKPIs() {
  try {
    const scanResults = localStorage.getItem('lastScanResults');
    const scanData = scanResults ? JSON.parse(scanResults) : null;
    
    const postsThisWeek = scanData?.extractedContent?.posts?.length || 0;
    const postsThisWeekChange = undefined;
    const engagementThisWeek =
      (scanData?.extractedContent?.posts || []).reduce((sum: number, post: any) => {
        const engagement = post.engagement || {};
        return sum + (engagement.likes || 0) + (engagement.shares || 0) + (engagement.comments || 0);
      }, 0) || 0;
    const engagementThisWeekChange = undefined;
    
    const contentPending = (scanData?.contentIdeas || []).length || 0;
    
    // New insights (from scan results - strategic insights count)
    let newInsights = 0;
    let newInsightsChange: number | undefined = undefined;
    
    if (scanResults) {
      try {
        const data = JSON.parse(scanResults);
        const insights = data.strategicInsights || [];
        newInsights = insights.length;
        
        const previousInsights = parseInt(localStorage.getItem('previousInsightsCount') || '0');
        if (previousInsights > 0) {
          newInsightsChange = newInsights - previousInsights;
        }
        localStorage.setItem('previousInsightsCount', newInsights.toString());
      } catch (e) {
        console.error('Error parsing scan results:', e);
      }
    }
    
    return {
      postsThisWeek,
      postsThisWeekChange,
      engagementThisWeek,
      engagementThisWeekChange,
      contentPending,
      newInsights,
      newInsightsChange,
    };
  } catch (e) {
    console.error('Error calculating dashboard KPIs:', e);
    return {
      postsThisWeek: 0,
      postsThisWeekChange: undefined,
      engagementThisWeek: 0,
      engagementThisWeekChange: undefined,
      contentPending: 0,
      newInsights: 0,
      newInsightsChange: undefined,
    };
  }
}

/**
 * Fetch real analytics data based on scan results
 */
export async function fetchAnalyticsData(): Promise<AnalyticsData> {
  const kpis = calculateDashboardKPIs();
  
  return {
    ...kpis,
    trends: {
      posts: kpis.postsThisWeekChange !== undefined 
        ? (kpis.postsThisWeekChange > 0 ? `+${kpis.postsThisWeekChange}` : `${kpis.postsThisWeekChange}`)
        : '0',
      engagement: kpis.engagementThisWeekChange !== undefined
        ? (kpis.engagementThisWeekChange > 0 ? `+${kpis.engagementThisWeekChange}` : `${kpis.engagementThisWeekChange}`)
        : '0',
      pending: `${kpis.contentPending}`,
      insights: kpis.newInsightsChange !== undefined
        ? (kpis.newInsightsChange > 0 ? `+${kpis.newInsightsChange}` : `${kpis.newInsightsChange}`)
        : '0',
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
  try {
    // Get actual content from production room
    const productionAssets = JSON.parse(localStorage.getItem('productionAssets') || '[]');
    const calendarEvents = JSON.parse(localStorage.getItem('calendarEvents') || '[]');
    const inboxItems = JSON.parse(localStorage.getItem('inboxItems') || '[]');
    
    // Count by status
    const published = productionAssets.filter((a: any) => a.status === 'published' || a.status === 'accepted').length;
    const drafting = productionAssets.filter((a: any) => a.status === 'draft' || a.status === 'drafting').length;
    const scheduled = calendarEvents.length;
    const needsReview = inboxItems.filter((item: any) => item.status === 'pending').length + 
                       productionAssets.filter((a: any) => a.status === 'pending' || a.status === 'review').length;
    
    const total = published + drafting + scheduled + needsReview;
    
    return {
      published,
      drafting,
      scheduled,
      needsReview,
      total: total || 0,
    };
  } catch (e) {
    const suggestions = calculateContentSuggestions();
    return {
      published: 0,
      drafting: 0,
      scheduled: 0,
      needsReview: suggestions,
      total: suggestions,
    };
  }
}
