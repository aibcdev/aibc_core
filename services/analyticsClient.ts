const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001';

export interface AnalyticsDashboardData {
  contentPerformance: {
    topContent: Array<{
      title: string;
      url: string;
      views: number;
      engagement: number;
      avgTimeOnPage: number;
      bounceRate: number;
      category: string;
    }>;
    trafficSources: {
      organic: number;
      social: number;
      direct: number;
      referral: number;
      email: number;
    };
    engagement: {
      avgSessionDuration: number;
      bounceRate: number;
      pagesPerSession: number;
      returningVisitors: number;
    };
    geographic: Array<{
      country: string;
      sessions: number;
      percentage: number;
    }>;
    devices: {
      desktop: number;
      mobile: number;
      tablet: number;
    };
    contentCategories: Array<{
      category: string;
      sessions: number;
      avgEngagement: number;
    }>;
  };
  competitorData: {
    competitors: Array<{
      name: string;
      monthlyTraffic: number;
      trafficSources: any;
      avgEngagement: number;
      growthRate: number;
      topPages: Array<{ url: string; traffic: number }>;
    }>;
    marketShare: Array<{
      domain: string;
      share: number;
      rank: number;
    }>;
    totalMarketTraffic: number;
  };
  marketShare: {
    yourShare: number;
    totalMarket: number;
    rank: number;
    competitors: Array<{
      domain: string;
      share: number;
      rank: number;
    }>;
  };
  engagement: {
    score: number;
    metrics: any;
    comparison: {
      yourScore: number;
      competitorAvg: number;
      difference: number;
      trend: string;
    };
  };
  insights: Array<{
    type: string;
    title: string;
    description: string;
    impact: string;
    effort: string;
  }>;
}

/**
 * Get comprehensive dashboard analytics
 */
export async function getDashboardAnalytics(
  competitors: string[] = [],
  brandDNA?: any,
  dateRange?: { startDate: string; endDate: string }
): Promise<{ success: boolean; data?: AnalyticsDashboardData; error?: string }> {
  try {
    // Get competitors from localStorage if not provided
    const storedCompetitors = JSON.parse(localStorage.getItem('competitors') || '[]');
    const competitorList = competitors.length > 0 ? competitors : storedCompetitors.map((c: any) => c.name || c.domain);
    
    // Get brand DNA from scan results if not provided
    const scanResults = localStorage.getItem('lastScanResults');
    const brandDNAData = brandDNA || (scanResults ? JSON.parse(scanResults).brandDNA : null);
    
    const response = await fetch(`${API_URL}/api/analytics/dashboard`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        dateRange: dateRange || { startDate: '30daysAgo', endDate: 'today' },
        competitors: competitorList,
        brandDNA: brandDNAData,
        // In production, these would come from user settings/integrations
        gaAccessToken: localStorage.getItem('gaAccessToken') || undefined,
        gaViewId: localStorage.getItem('gaViewId') || undefined,
        competitorApiKey: localStorage.getItem('competitorApiKey') || undefined
      }),
    });

    if (!response.ok) {
      const error = await response.json();
      return {
        success: false,
        error: error.error || 'Failed to fetch analytics'
      };
    }

    const data = await response.json();
    return data;
  } catch (error: any) {
    console.error('Analytics fetch error:', error);
    return {
      success: false,
      error: error.message || 'Network error while fetching analytics'
    };
  }
}

/**
 * Get competitor analytics comparison
 */
export async function getCompetitorAnalytics(
  competitors: string[]
): Promise<{ success: boolean; data?: any; error?: string }> {
  try {
    const response = await fetch(`${API_URL}/api/analytics/competitors`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        competitors,
        competitorApiKey: localStorage.getItem('competitorApiKey') || undefined
      }),
    });

    if (!response.ok) {
      const error = await response.json();
      return {
        success: false,
        error: error.error || 'Failed to fetch competitor analytics'
      };
    }

    const data = await response.json();
    return data;
  } catch (error: any) {
    console.error('Competitor analytics error:', error);
    return {
      success: false,
      error: error.message || 'Network error while fetching competitor analytics'
    };
  }
}

/**
 * Generate custom analytics report (Business+ tier)
 */
export async function generateCustomReport(params: {
  dateRange: { start: string; end: string };
  parameters: any;
}): Promise<{ success: boolean; report?: any; error?: string }> {
  try {
    const scanResults = localStorage.getItem('lastScanResults');
    const brandDNA = scanResults ? JSON.parse(scanResults).brandDNA : null;
    const contentData = scanResults ? JSON.parse(scanResults).extractedContent : null;
    
    const response = await fetch(`${API_URL}/api/analytics/report`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-user-tier': 'business+' // In production, get from auth
      },
      body: JSON.stringify({
        ...params,
        brandDNA,
        contentData
      }),
    });

    if (!response.ok) {
      const error = await response.json();
      return {
        success: false,
        error: error.error || 'Failed to generate report'
      };
    }

    const data = await response.json();
    return data;
  } catch (error: any) {
    console.error('Report generation error:', error);
    return {
      success: false,
      error: error.message || 'Network error while generating report'
    };
  }
}
