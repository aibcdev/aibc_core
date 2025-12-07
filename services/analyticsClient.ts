/**
 * Frontend API client for custom analytics reports
 */

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001';

export interface AnalyticsReportRequest {
  dateRange: {
    start: string; // ISO date
    end: string; // ISO date
  };
  parameters: {
    toneTracking?: boolean;
    contentTracking?: boolean;
    engagementMetrics?: boolean;
    brandVoiceMatch?: boolean;
    competitorComparison?: boolean;
    platformBreakdown?: string[];
    customMetrics?: string[];
  };
  brandDNA?: any;
  contentData?: any[];
}

export interface AnalyticsReport {
  success: boolean;
  reportId?: string;
  generatedAt?: string;
  dateRange?: {
    start: string;
    end: string;
  };
  sections?: any;
  error?: string;
}

/**
 * Generate custom analytics report (Business+ tier only)
 */
export async function generateAnalyticsReport(
  request: AnalyticsReportRequest,
  userTier: string = 'business'
): Promise<AnalyticsReport> {
  try {
    const response = await fetch(`${API_BASE_URL}/api/analytics/report`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-User-Tier': userTier
      },
      body: JSON.stringify(request)
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Failed to generate analytics report');
    }

    return await response.json();
  } catch (error: any) {
    console.error('Analytics report generation error:', error);
    throw error;
  }
}

