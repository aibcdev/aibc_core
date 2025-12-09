/**
 * Real-time dashboard data services
 * Fetches actual data from APIs/storage and scan results
 */

export interface AnalyticsData {
  contentCreated: number; // Total content suggested/created from footprint
  contentPublished: number; // Content published
  contentScheduled: number; // Content scheduled for future
  brandVoiceMatch: number; // Percentage match to brand voice (0-100)
  // System metrics
  avgCompletionTime?: string; // Average time to complete workflows (e.g., "4.2h")
  avgCompletionTimeChange?: number; // Percentage change (e.g., -12)
  avgCompletionTimePercent?: number; // For progress bar (0-100)
  activeWorkflows?: number; // Number of active workflows
  activeWorkflowsChange?: number; // Change in active workflows
  globalAssetVelocity?: string; // Asset velocity metric (e.g., "85.4")
  globalAssetVelocityChange?: number; // Percentage change
  globalAssetVelocityPercent?: number; // For progress bar
  aiComputeEfficiency?: string; // AI efficiency percentage (e.g., "99.9%")
  aiComputeEfficiencyChange?: number; // Percentage change
  aiComputeEfficiencyPercent?: number; // For progress bar
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
 * Calculate system metrics from user activity
 */
function calculateSystemMetrics() {
  try {
    // Get user activity from localStorage
    const userId = localStorage.getItem('userId') || 'default';
    const activityKey = `user_activity_${userId}`;
    const activityData = localStorage.getItem(activityKey);
    
    if (!activityData) {
      // Return N/A values if no data
      return {
        avgCompletionTime: 'N/A',
        avgCompletionTimeChange: undefined,
        avgCompletionTimePercent: 0,
        activeWorkflows: 0,
        activeWorkflowsChange: undefined,
        globalAssetVelocity: 'N/A',
        globalAssetVelocityChange: undefined,
        globalAssetVelocityPercent: 0,
        aiComputeEfficiency: 'N/A',
        aiComputeEfficiencyChange: undefined,
        aiComputeEfficiencyPercent: 0,
      };
    }
    
    const activity = JSON.parse(activityData);
    const workflows = activity.workflows || [];
    const completedWorkflows = workflows.filter((w: any) => w.status === 'completed');
    
    // Calculate average completion time
    let avgCompletionTime = 'N/A';
    let avgCompletionTimeChange: number | undefined = undefined;
    let avgCompletionTimePercent = 0;
    
    if (completedWorkflows.length > 0) {
      const totalMinutes = completedWorkflows.reduce((sum: number, w: any) => {
        if (w.startTime && w.endTime) {
          const start = new Date(w.startTime).getTime();
          const end = new Date(w.endTime).getTime();
          return sum + (end - start) / (1000 * 60); // Convert to minutes
        }
        return sum;
      }, 0);
      
      const avgMinutes = totalMinutes / completedWorkflows.length;
      const hours = Math.floor(avgMinutes / 60);
      const mins = Math.round(avgMinutes % 60);
      avgCompletionTime = `${hours}.${Math.floor(mins / 6)}h`; // Round to 0.1h
      
      // Calculate change (simplified - compare to previous period)
      const previousAvg = activity.previousAvgCompletionTime || avgMinutes;
      avgCompletionTimeChange = Math.round(((avgMinutes - previousAvg) / previousAvg) * 100);
      avgCompletionTimePercent = Math.min((avgMinutes / 480) * 100, 100); // 8h = 100%
    }
    
    // Active workflows
    const activeWorkflows = workflows.filter((w: any) => w.status === 'active' || w.status === 'in_progress').length;
    const previousActive = activity.previousActiveWorkflows || 0;
    const activeWorkflowsChange = activeWorkflows - previousActive;
    
    // Global asset velocity (simplified calculation)
    const assets = activity.assets || [];
    const velocity = assets.length > 0 ? (assets.length / (completedWorkflows.length || 1)).toFixed(1) : '0';
    const globalAssetVelocity = velocity;
    const previousVelocity = parseFloat(activity.previousVelocity || '0');
    const globalAssetVelocityChange = previousVelocity > 0 
      ? Math.round(((parseFloat(velocity) - previousVelocity) / previousVelocity) * 100)
      : undefined;
    const globalAssetVelocityPercent = Math.min((parseFloat(velocity) / 100) * 100, 100);
    
    // AI compute efficiency (simplified - based on successful generations)
    const aiGenerations = activity.aiGenerations || [];
    const successful = aiGenerations.filter((g: any) => g.success).length;
    const total = aiGenerations.length || 1;
    const efficiency = (successful / total) * 100;
    const aiComputeEfficiency = `${efficiency.toFixed(1)}%`;
    const previousEfficiency = activity.previousEfficiency || efficiency;
    const aiComputeEfficiencyChange = Math.round(efficiency - previousEfficiency);
    const aiComputeEfficiencyPercent = efficiency;
    
    return {
      avgCompletionTime,
      avgCompletionTimeChange,
      avgCompletionTimePercent,
      activeWorkflows,
      activeWorkflowsChange,
      globalAssetVelocity,
      globalAssetVelocityChange,
      globalAssetVelocityPercent,
      aiComputeEfficiency,
      aiComputeEfficiencyChange,
      aiComputeEfficiencyPercent,
    };
  } catch (e) {
    console.error('Error calculating system metrics:', e);
    return {
      avgCompletionTime: 'N/A',
      avgCompletionTimeChange: undefined,
      avgCompletionTimePercent: 0,
      activeWorkflows: 0,
      activeWorkflowsChange: undefined,
      globalAssetVelocity: 'N/A',
      globalAssetVelocityChange: undefined,
      globalAssetVelocityPercent: 0,
      aiComputeEfficiency: 'N/A',
      aiComputeEfficiencyChange: undefined,
      aiComputeEfficiencyPercent: 0,
    };
  }
}

/**
 * Fetch real analytics data based on scan results
 */
export async function fetchAnalyticsData(): Promise<AnalyticsData> {
  const contentCreated = calculateContentSuggestions();
  const brandVoiceMatch = calculateBrandVoiceMatch();
  const systemMetrics = calculateSystemMetrics();
  
  // Published/Scheduled would come from actual content tracking
  // For now, these start at 0 until user actually publishes content
  const contentPublished = 0;
  const contentScheduled = 0;
  
  return {
    contentCreated,
    contentPublished,
    contentScheduled,
    brandVoiceMatch,
    ...systemMetrics,
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
