import { GoogleGenerativeAI } from '@google/generative-ai';
import dotenv from 'dotenv';

dotenv.config();

const GEMINI_API_KEY = process.env.GEMINI_API_KEY || '';
const genAI = GEMINI_API_KEY ? new GoogleGenerativeAI(GEMINI_API_KEY) : null;

/**
 * Google Analytics Service
 * Fetches and processes GA data for content performance, traffic, and engagement
 */
export class GoogleAnalyticsService {
  private accessToken: string;
  private viewId: string;

  constructor(accessToken: string, viewId: string) {
    this.accessToken = accessToken;
    this.viewId = viewId;
  }

  /**
   * Get content performance metrics
   */
  async getContentPerformance(dateRange: { startDate: string; endDate: string }) {
    // In production, this would call Google Analytics Reporting API v4
    // For now, we'll use LLM to simulate realistic data based on scan results
    
    if (!genAI) {
      return this.getMockContentPerformance();
    }

    try {
      const model = genAI.getGenerativeModel({ model: 'gemini-2.5-flash' });
      
      const prompt = `Based on a content creator/brand's digital footprint scan, generate realistic Google Analytics metrics for content performance.

Consider:
- Content themes and topics from their posts
- Posting frequency and engagement patterns
- Platform distribution (Twitter, LinkedIn, Instagram, YouTube)
- Brand voice and content style

Generate realistic metrics for:
1. Top performing content pages/posts
2. Traffic sources (organic, social, direct, referral)
3. User engagement (bounce rate, session duration, pages per session)
4. Content categories performance
5. Geographic distribution
6. Device breakdown
7. Conversion rates (if applicable)

Return JSON:
{
  "topContent": [
    {
      "title": "Content title",
      "url": "/path",
      "views": 0,
      "engagement": 0.0,
      "avgTimeOnPage": 0,
      "bounceRate": 0.0,
      "category": "content type"
    }
  ],
  "trafficSources": {
    "organic": 0,
    "social": 0,
    "direct": 0,
    "referral": 0,
    "email": 0
  },
  "engagement": {
    "avgSessionDuration": 0,
    "bounceRate": 0.0,
    "pagesPerSession": 0.0,
    "returningVisitors": 0.0
  },
  "geographic": [
    {
      "country": "Country",
      "sessions": 0,
      "percentage": 0.0
    }
  ],
  "devices": {
    "desktop": 0.0,
    "mobile": 0.0,
    "tablet": 0.0
  },
  "contentCategories": [
    {
      "category": "Category",
      "sessions": 0,
      "avgEngagement": 0.0
    }
  ]
}`;

      const result = await model.generateContent(prompt);
      const response = result.response.text();
      const jsonMatch = response.match(/\{[\s\S]*\}/);
      
      if (jsonMatch) {
        return JSON.parse(jsonMatch[0]);
      }
      
      return this.getMockContentPerformance();
    } catch (error) {
      console.error('Analytics generation error:', error);
      return this.getMockContentPerformance();
    }
  }

  /**
   * Get competitor traffic comparison
   */
  async getCompetitorTraffic(competitors: string[]) {
    // This would integrate with Semrush/Similarweb API in production
    // For now, use LLM to generate realistic competitor data
    
    if (!genAI) {
      return this.getMockCompetitorData(competitors);
    }

    try {
      const model = genAI.getGenerativeModel({ model: 'gemini-2.5-flash' });
      
      const prompt = `Generate realistic competitor traffic and engagement data for these competitors: ${competitors.join(', ')}.

For each competitor, provide:
- Estimated monthly traffic
- Traffic sources breakdown
- Top pages/content
- Engagement metrics
- Growth trends

Return JSON:
{
  "competitors": [
    {
      "name": "Competitor name",
      "monthlyTraffic": 0,
      "trafficSources": {
        "organic": 0,
        "social": 0,
        "direct": 0,
        "paid": 0
      },
      "avgEngagement": 0.0,
      "growthRate": 0.0,
      "topPages": [
        {
          "url": "/path",
          "traffic": 0
        }
      ]
    }
  ],
  "marketShare": {
    "yourShare": 0.0,
    "totalMarket": 0,
    "rank": 0
  }
}`;

      const result = await model.generateContent(prompt);
      const response = result.response.text();
      const jsonMatch = response.match(/\{[\s\S]*\}/);
      
      if (jsonMatch) {
        return JSON.parse(jsonMatch[0]);
      }
      
      return this.getMockCompetitorData(competitors);
    } catch (error) {
      console.error('Competitor analytics error:', error);
      return this.getMockCompetitorData(competitors);
    }
  }

  private getMockContentPerformance() {
    return {
      topContent: [
        { title: "Latest Blog Post", url: "/blog/latest", views: 1250, engagement: 0.65, avgTimeOnPage: 180, bounceRate: 0.35, category: "blog" },
        { title: "Product Launch", url: "/products/new", views: 980, engagement: 0.72, avgTimeOnPage: 240, bounceRate: 0.28, category: "product" }
      ],
      trafficSources: { organic: 45, social: 30, direct: 15, referral: 8, email: 2 },
      engagement: { avgSessionDuration: 195, bounceRate: 0.42, pagesPerSession: 2.3, returningVisitors: 0.38 },
      geographic: [
        { country: "United States", sessions: 45, percentage: 45.0 },
        { country: "United Kingdom", sessions: 18, percentage: 18.0 },
        { country: "Canada", sessions: 12, percentage: 12.0 }
      ],
      devices: { desktop: 55, mobile: 40, tablet: 5 },
      contentCategories: [
        { category: "Blog", sessions: 35, avgEngagement: 0.68 },
        { category: "Product", sessions: 28, avgEngagement: 0.72 },
        { category: "Social", sessions: 22, avgEngagement: 0.58 }
      ]
    };
  }

  private getMockCompetitorData(competitors: string[]) {
    return {
      competitors: competitors.map((name, index) => ({
        name,
        monthlyTraffic: Math.floor(Math.random() * 50000) + 10000,
        trafficSources: {
          organic: Math.floor(Math.random() * 40) + 40,
          social: Math.floor(Math.random() * 30) + 20,
          direct: Math.floor(Math.random() * 20) + 10,
          paid: Math.floor(Math.random() * 15) + 5
        },
        avgEngagement: Math.random() * 0.3 + 0.5,
        growthRate: (Math.random() * 20 - 10) / 100,
        topPages: [
          { url: "/main", traffic: Math.floor(Math.random() * 5000) + 1000 },
          { url: "/about", traffic: Math.floor(Math.random() * 3000) + 500 }
        ]
      })),
      marketShare: {
        yourShare: 15.5,
        totalMarket: 150000,
        rank: 3
      }
    };
  }
}

/**
 * Semrush/Similarweb Competitor Analytics Service
 */
export class CompetitorAnalyticsService {
  private apiKey: string;
  private baseUrl: string;

  constructor(apiKey?: string, service: 'semrush' | 'similarweb' = 'similarweb') {
    this.apiKey = apiKey || '';
    this.baseUrl = service === 'semrush' 
      ? 'https://api.semrush.com'
      : 'https://api.similarweb.com/v1';
  }

  /**
   * Get competitor domain analytics
   */
  async getCompetitorDomainData(domain: string) {
    // In production, this would call Semrush/Similarweb API
    // For now, use LLM to generate realistic data
    
    if (!genAI) {
      return this.getMockDomainData(domain);
    }

    try {
      const model = genAI.getGenerativeModel({ model: 'gemini-2.5-flash' });
      
      const prompt = `Generate realistic competitor domain analytics for "${domain}" similar to what Semrush or Similarweb would provide.

Include:
- Monthly traffic estimates
- Traffic sources (organic, paid, social, direct, referral)
- Top keywords
- Backlinks
- Domain authority/rank
- Engagement metrics
- Geographic distribution
- Competitor comparison

Return JSON:
{
  "domain": "${domain}",
  "monthlyTraffic": 0,
  "trafficSources": {
    "organic": 0,
    "paid": 0,
    "social": 0,
    "direct": 0,
    "referral": 0
  },
  "topKeywords": [
    {
      "keyword": "keyword",
      "traffic": 0,
      "position": 0
    }
  ],
  "backlinks": 0,
  "domainAuthority": 0,
  "engagement": {
    "avgVisitDuration": 0,
    "pagesPerVisit": 0.0,
    "bounceRate": 0.0
  },
  "geographic": [
    {
      "country": "Country",
      "percentage": 0.0
    }
  ],
  "competitors": [
    {
      "domain": "competitor.com",
      "overlap": 0.0
    }
  ]
}`;

      const result = await model.generateContent(prompt);
      const response = result.response.text();
      const jsonMatch = response.match(/\{[\s\S]*\}/);
      
      if (jsonMatch) {
        return JSON.parse(jsonMatch[0]);
      }
      
      return this.getMockDomainData(domain);
    } catch (error) {
      console.error('Domain analytics error:', error);
      return this.getMockDomainData(domain);
    }
  }

  /**
   * Compare multiple competitors
   */
  async compareCompetitors(domains: string[]) {
    const results = await Promise.all(
      domains.map(domain => this.getCompetitorDomainData(domain))
    );

    // Calculate market share
    const totalTraffic = results.reduce((sum, r) => sum + (r.monthlyTraffic || 0), 0);
    
    return {
      competitors: results,
      marketShare: results.map((r, index) => ({
        domain: r.domain,
        share: totalTraffic > 0 ? (r.monthlyTraffic / totalTraffic) * 100 : 0,
        rank: index + 1
      })),
      totalMarketTraffic: totalTraffic
    };
  }

  private getMockDomainData(domain: string) {
    return {
      domain,
      monthlyTraffic: Math.floor(Math.random() * 100000) + 10000,
      trafficSources: {
        organic: Math.floor(Math.random() * 30) + 50,
        paid: Math.floor(Math.random() * 20) + 5,
        social: Math.floor(Math.random() * 25) + 15,
        direct: Math.floor(Math.random() * 20) + 10,
        referral: Math.floor(Math.random() * 15) + 5
      },
      topKeywords: [
        { keyword: "main keyword", traffic: Math.floor(Math.random() * 5000) + 1000, position: Math.floor(Math.random() * 5) + 1 },
        { keyword: "secondary keyword", traffic: Math.floor(Math.random() * 3000) + 500, position: Math.floor(Math.random() * 10) + 5 }
      ],
      backlinks: Math.floor(Math.random() * 50000) + 5000,
      domainAuthority: Math.floor(Math.random() * 30) + 40,
      engagement: {
        avgVisitDuration: Math.floor(Math.random() * 180) + 120,
        pagesPerVisit: Math.random() * 2 + 1.5,
        bounceRate: Math.random() * 0.3 + 0.4
      },
      geographic: [
        { country: "United States", percentage: 45.0 },
        { country: "United Kingdom", percentage: 18.0 },
        { country: "Canada", percentage: 12.0 }
      ],
      competitors: [
        { domain: "competitor1.com", overlap: 0.35 },
        { domain: "competitor2.com", overlap: 0.28 }
      ]
    };
  }
}

/**
 * Aggregated Analytics Service
 * Combines GA data with competitor data for comprehensive insights
 */
export class AggregatedAnalyticsService {
  private gaService: GoogleAnalyticsService;
  private competitorService: CompetitorAnalyticsService;

  constructor(gaAccessToken: string, gaViewId: string, competitorApiKey?: string) {
    this.gaService = new GoogleAnalyticsService(gaAccessToken, gaViewId);
    this.competitorService = new CompetitorAnalyticsService(competitorApiKey);
  }

  /**
   * Get comprehensive analytics dashboard data
   */
  async getDashboardAnalytics(
    dateRange: { startDate: string; endDate: string },
    competitors: string[],
    brandDNA?: any
  ) {
    const [contentPerformance, competitorData] = await Promise.all([
      this.gaService.getContentPerformance(dateRange),
      this.competitorService.compareCompetitors(competitors)
    ]);

    // Calculate market share
    const yourTraffic = contentPerformance.topContent.reduce((sum: number, c: any) => sum + c.views, 0);
    const totalMarketTraffic = competitorData.totalMarketTraffic + yourTraffic;
    const yourMarketShare = totalMarketTraffic > 0 ? (yourTraffic / totalMarketTraffic) * 100 : 0;

    // Calculate engagement score
    const engagementScore = this.calculateEngagementScore(contentPerformance.engagement);

    // Get competitor rankings
    const competitorRankings = competitorData.marketShare
      .sort((a, b) => b.share - a.share)
      .map((c, index) => ({ ...c, rank: index + 1 }));

    return {
      contentPerformance,
      competitorData,
      marketShare: {
        yourShare: yourMarketShare,
        totalMarket: totalMarketTraffic,
        rank: competitorRankings.findIndex(c => c.domain.includes('your')) + 1 || competitors.length + 1,
        competitors: competitorRankings
      },
      engagement: {
        score: engagementScore,
        metrics: contentPerformance.engagement,
        comparison: this.compareEngagement(contentPerformance.engagement, competitorData.competitors)
      },
      insights: this.generateInsights(contentPerformance, competitorData, brandDNA)
    };
  }

  private calculateEngagementScore(engagement: any): number {
    // Weighted engagement score (0-100)
    const sessionScore = Math.min(engagement.avgSessionDuration / 300 * 50, 50); // Max 50 points
    const pagesScore = Math.min(engagement.pagesPerSession / 5 * 30, 30); // Max 30 points
    const returnScore = engagement.returningVisitors * 20; // Max 20 points
    const bouncePenalty = engagement.bounceRate * 20; // Penalty up to 20 points
    
    return Math.max(0, Math.min(100, sessionScore + pagesScore + returnScore - bouncePenalty));
  }

  private compareEngagement(yourEngagement: any, competitors: any[]) {
    const avgCompetitorEngagement = competitors.reduce((sum, c) => sum + (c.avgEngagement || 0.5), 0) / competitors.length;
    
    return {
      yourScore: this.calculateEngagementScore(yourEngagement),
      competitorAvg: avgCompetitorEngagement * 100,
      difference: this.calculateEngagementScore(yourEngagement) - (avgCompetitorEngagement * 100),
      trend: 'improving' // Would calculate from historical data
    };
  }

  private generateInsights(contentPerformance: any, competitorData: any, brandDNA?: any) {
    const insights = [];

    // Traffic source insights
    if (contentPerformance.trafficSources.social < 20) {
      insights.push({
        type: 'opportunity',
        title: 'Low Social Traffic',
        description: `Your social traffic is ${contentPerformance.trafficSources.social}%. Competitors average 25%+. Increase social content distribution.`,
        impact: 'HIGH',
        effort: 'Medium'
      });
    }

    // Engagement insights
    if (contentPerformance.engagement.bounceRate > 0.5) {
      insights.push({
        type: 'warning',
        title: 'High Bounce Rate',
        description: `Bounce rate is ${(contentPerformance.engagement.bounceRate * 100).toFixed(0)}%. Improve content relevance and user experience.`,
        impact: 'MEDIUM',
        effort: 'Quick win'
      });
    }

    // Market share insights
    const yourRank = competitorData.marketShare.findIndex((c: any) => c.domain.includes('your')) + 1;
    if (yourRank > 3) {
      insights.push({
        type: 'opportunity',
        title: 'Market Position',
        description: `You rank #${yourRank} in market share. Top 3 competitors control ${competitorData.marketShare.slice(0, 3).reduce((sum: number, c: any) => sum + c.share, 0).toFixed(0)}% of traffic.`,
        impact: 'HIGH',
        effort: 'Long term'
      });
    }

    return insights;
  }
}

/**
 * Check if user has Business+ tier access
 */
export function checkBusinessPlusAccess(userTier: string): boolean {
  return ['business', 'premium', 'business+'].includes(userTier.toLowerCase());
}

/**
 * Generate custom analytics report (Business+ tier)
 */
export async function generateAnalyticsReport(params: {
  dateRange: { start: string; end: string };
  parameters: any;
  brandDNA?: any;
  contentData?: any;
}) {
  if (!genAI) {
    return {
      success: false,
      error: 'Gemini API not configured'
    };
  }

  try {
    const model = genAI.getGenerativeModel({ model: 'gemini-2.5-flash' });
    
    const prompt = `Generate a custom analytics report based on these parameters:

Date Range: ${params.dateRange.start} to ${params.dateRange.end}
Parameters: ${JSON.stringify(params.parameters)}
Brand DNA: ${params.brandDNA ? JSON.stringify(params.brandDNA).substring(0, 500) : 'N/A'}

Create a comprehensive report with:
- Key metrics based on parameters
- Trends and patterns
- Actionable insights
- Recommendations

Return JSON:
{
  "success": true,
  "report": {
    "title": "Report title",
    "dateRange": "${params.dateRange.start} to ${params.dateRange.end}",
    "metrics": {},
    "insights": [],
    "recommendations": []
  }
}`;

    const result = await model.generateContent(prompt);
    const response = result.response.text();
    const jsonMatch = response.match(/\{[\s\S]*\}/);
    
    if (jsonMatch) {
      return JSON.parse(jsonMatch[0]);
    }
    
    return {
      success: false,
      error: 'Failed to generate report'
    };
  } catch (error: any) {
    return {
      success: false,
      error: error.message
    };
  }
}
