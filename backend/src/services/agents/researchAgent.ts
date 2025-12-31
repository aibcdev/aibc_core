/**
 * Research Agent
 * Integrates with NewsAPI, Wikipedia, and browser automation for enhanced research
 * CRITICAL: Filters low engagement content and spots competitor big successes
 * Enhanced with browser automation for deep competitor analysis
 * Uses only free APIs - no paid services required
 */

import { generateJSON } from '../llmService';
import { browserAgent } from './browserAgent';
import { analyzeDigitalFootprint, scrapeCompetitorContent, getAnalyticsData } from '../scrapingAPIService';

interface ResearchContext {
  brandName?: string;
  industry?: string;
  competitors?: any[];
  keywords?: string[];
  timeframe?: string;
  website?: string;
}

/**
 * Research Agent implementation
 */
export const researchAgent = {
  /**
   * Execute research task
   */
  async execute(task: string, context: ResearchContext): Promise<any> {
    console.log(`[Research Agent] Executing task: ${task}`);

    switch (task) {
      case 'enhance-competitor-intelligence':
        return await enhanceCompetitorIntelligence(context);
      case 'gather-market-intelligence':
        return await gatherMarketIntelligence(context);
      case 'analyze-trends':
        return await analyzeTrends(context);
      case 'research-brand':
        return await researchBrand(context);
      case 'browser-research':
        return await browserResearch(context);
      case 'analyze-competitor-content':
        return await analyzeCompetitorContent(context);
      case 'gather-market-intelligence-browser':
        return await gatherMarketIntelligenceBrowser(context);
      case 'analyze-digital-footprint':
        return await analyzeDigitalFootprintResearch(context);
      case 'scrape-competitor':
        return await scrapeCompetitorResearch(context);
      case 'get-analytics-data':
        return await getAnalyticsDataResearch(context);
      default:
        throw new Error(`Unknown research task: ${task}`);
    }
  },
};

/**
 * Research brand context using multiple sources
 */
async function researchBrand(context: ResearchContext): Promise<any> {
  const { brandName, industry } = context;
  const results: any = {
    sources: [],
    data: {},
  };

  try {
    // Browser-based search (free, no API key needed)
    if (brandName) {
      try {
        const searchQuery = industry ? `${brandName} ${industry}` : brandName;
        const browserResult = await browserAgent.execute('gather-market-intelligence', {
          searchQuery,
          username: brandName,
        });
        
        if (browserResult.success) {
          results.sources.push('browser-automation');
          results.data.browserSearch = browserResult.data;
        }
      } catch (error: any) {
        console.warn('[Research Agent] Browser search error:', error.message);
      }
    }

    // NewsAPI search
    if (process.env.NEWSAPI_KEY && brandName) {
      try {
        const newsResults = await searchWithNewsAPI(brandName);
        results.sources.push('newsapi');
        results.data.newsapi = newsResults;
      } catch (error: any) {
        console.warn('[Research Agent] NewsAPI error:', error.message);
      }
    }

    // Wikipedia search
    if (brandName) {
      try {
        const wikiResults = await searchWithWikipedia(brandName);
        results.sources.push('wikipedia');
        results.data.wikipedia = wikiResults;
      } catch (error: any) {
        console.warn('[Research Agent] Wikipedia error:', error.message);
      }
    }

    return results;
  } catch (error: any) {
    console.error('[Research Agent] Research brand error:', error);
    throw error;
  }
}

/**
 * Enhance competitor intelligence with external research
 * CRITICAL: Filters low engagement content and spots big engagement successes
 */
async function enhanceCompetitorIntelligence(context: ResearchContext): Promise<any> {
  const { competitors = [] } = context;
  const enhanced: any[] = [];

  for (const competitor of competitors) {
    try {
      const research = await researchBrand({
        brandName: competitor.name,
        industry: competitor.industry,
      });

      // Filter and analyze competitor content for high engagement patterns
      const engagementAnalysis = await analyzeCompetitorEngagement(competitor);

      enhanced.push({
        ...competitor,
        research: research.data,
        engagementAnalysis,
        highEngagementContent: engagementAnalysis.topPerformers || [],
        lowEngagementContent: engagementAnalysis.lowPerformers || [],
        lastUpdated: new Date().toISOString(),
      });
    } catch (error: any) {
      console.warn(`[Research Agent] Failed to research competitor ${competitor.name}:`, error.message);
      enhanced.push(competitor); // Include original if research fails
    }
  }

  return {
    competitors: enhanced,
    totalResearched: enhanced.length,
  };
}

/**
 * Analyze competitor content to identify high vs low engagement patterns
 * CRITICAL: Filters out low engagement content and spots big successes
 */
async function analyzeCompetitorEngagement(competitor: any): Promise<any> {
  try {
    const allContent = [
      ...(competitor.topViralContent || []),
      ...(competitor.recentContent || []),
      ...(competitor.contentExamples || []),
    ];

    if (allContent.length === 0) {
      return {
        topPerformers: [],
        lowPerformers: [],
        engagementPatterns: {},
        successFactors: [],
      };
    }

    // Calculate engagement thresholds
    const engagementScores = allContent.map((content: any) => {
      const engagement = content.estimatedEngagement || content.engagement || 0;
      const likes = content.likes || 0;
      const shares = content.shares || 0;
      const comments = content.comments || 0;
      const views = content.views || 0;
      
      // Calculate engagement rate
      const totalEngagement = likes + shares + comments;
      const engagementRate = views > 0 ? (totalEngagement / views) * 100 : 0;
      
      return {
        content,
        engagementScore: totalEngagement,
        engagementRate,
        totalEngagement,
      };
    });

    // Sort by engagement
    engagementScores.sort((a, b) => b.engagementScore - a.engagementScore);

    // Identify top 20% as high performers
    const top20Percent = Math.max(1, Math.floor(engagementScores.length * 0.2));
    const topPerformers = engagementScores.slice(0, top20Percent).map(s => s.content);

    // Identify bottom 30% as low performers (to filter out)
    const bottom30Percent = Math.max(1, Math.floor(engagementScores.length * 0.3));
    const lowPerformers = engagementScores.slice(-bottom30Percent).map(s => s.content);

    // Analyze success factors from top performers
    const successFactors = await extractSuccessFactors(topPerformers);

    // Identify engagement patterns
    const engagementPatterns = {
      averageEngagement: engagementScores.reduce((sum, s) => sum + s.engagementScore, 0) / engagementScores.length,
      topEngagement: engagementScores[0]?.engagementScore || 0,
      lowEngagement: engagementScores[engagementScores.length - 1]?.engagementScore || 0,
      engagementRate: engagementScores.reduce((sum, s) => sum + s.engagementRate, 0) / engagementScores.length,
    };

    return {
      topPerformers,
      lowPerformers,
      engagementPatterns,
      successFactors,
      totalAnalyzed: allContent.length,
    };
  } catch (error: any) {
    console.error('[Research Agent] Engagement analysis error:', error);
    return {
      topPerformers: [],
      lowPerformers: [],
      engagementPatterns: {},
      successFactors: [],
    };
  }
}

/**
 * Extract success factors from top-performing competitor content
 */
async function extractSuccessFactors(topPerformers: any[]): Promise<string[]> {
  if (topPerformers.length === 0) {
    return [];
  }

  try {
    const prompt = `Analyze these top-performing competitor content pieces and identify what makes them successful:

Top Performers:
${JSON.stringify(topPerformers.slice(0, 10), null, 2)}

Identify:
1. Common themes and topics
2. Content formats that work
3. Hooks and opening strategies
4. Engagement techniques
5. Visual/structural patterns
6. Timing and frequency patterns

Return JSON with:
- successFactors: string[] (key factors that drive engagement)
- patterns: string[] (recurring patterns)
- recommendations: string[] (how to replicate success)`;

    const systemPrompt = 'You are an expert content analyst. Identify what makes content go viral.';

    const result = await generateJSON<any>(prompt, systemPrompt, { tier: 'deep' });

    return result.successFactors || [];
  } catch (error: any) {
    console.error('[Research Agent] Success factor extraction error:', error);
    // Fallback: extract from data directly
    const factors: string[] = [];
    topPerformers.forEach((content: any) => {
      if (content.whyItWorked) {
        factors.push(content.whyItWorked);
      }
    });
    return [...new Set(factors)].slice(0, 10);
  }
}

/**
 * Gather market intelligence
 */
async function gatherMarketIntelligence(context: ResearchContext): Promise<any> {
  const { industry, brandName } = context;
  const intelligence: any = {
    industry: industry,
    trends: [],
    news: [],
    competitors: [],
  };

  try {
    // Search for industry trends
    if (industry) {
      const trendKeywords = [`${industry} trends`, `${industry} market`, `${industry} news`];
      
      for (const keyword of trendKeywords) {
        try {
          const trends = await analyzeTrends({ keywords: [keyword], timeframe: '30d' });
          intelligence.trends.push(...(trends.trends || []));
        } catch (error: any) {
          console.warn(`[Research Agent] Trend analysis failed for ${keyword}:`, error.message);
        }
      }
    }

    // Get recent news
    if (brandName || industry) {
      try {
        const news = await searchWithNewsAPI(brandName || industry || '');
        intelligence.news = news.articles || [];
      } catch (error: any) {
        console.warn('[Research Agent] News search failed:', error.message);
      }
    }

    return intelligence;
  } catch (error: any) {
    console.error('[Research Agent] Market intelligence error:', error);
    throw error;
  }
}

/**
 * Analyze trends using browser automation (free)
 */
async function analyzeTrends(context: ResearchContext): Promise<any> {
  const { keywords = [], timeframe = '7d' } = context;
  const trends: any[] = [];

  for (const keyword of keywords) {
    try {
      // Use browser automation for search (free, no API key needed)
      const browserResult = await browserAgent.execute('gather-market-intelligence', {
        searchQuery: keyword,
      });
      
      if (browserResult.success) {
        trends.push({
          keyword,
          results: browserResult.data?.results || [],
          timeframe,
          source: 'browser-automation',
        });
      }
    } catch (error: any) {
      console.warn(`[Research Agent] Trend analysis failed for ${keyword}:`, error.message);
    }
  }

  return { trends };
}

/**
 * Search using NewsAPI
 */
async function searchWithNewsAPI(query: string): Promise<any> {
  const apiKey = process.env.NEWSAPI_KEY;
  if (!apiKey) {
    throw new Error('NewsAPI key not configured');
  }

  const url = `https://newsapi.org/v2/everything?q=${encodeURIComponent(query)}&sortBy=publishedAt&apiKey=${apiKey}`;

  const response = await fetch(url);
  if (!response.ok) {
    throw new Error(`NewsAPI request failed: ${response.statusText}`);
  }

  return await response.json() as any;
}

/**
 * Search using Wikipedia
 */
async function searchWithWikipedia(query: string): Promise<any> {
  const searchUrl = `https://en.wikipedia.org/api/rest_v1/page/summary/${encodeURIComponent(query)}`;

  try {
    const response = await fetch(searchUrl);
    if (!response.ok) {
      // Wikipedia might not have the page, return empty
      return { title: query, extract: '', url: '' };
    }

    const data = await response.json() as any;
    return {
      title: data.title,
      extract: data.extract,
      url: data.content_urls?.desktop?.page || '',
    };
  } catch (error: any) {
    console.warn('[Research Agent] Wikipedia search failed:', error.message);
    return { title: query, extract: '', url: '' };
  }
}

/**
 * Search using Apify (if configured)
 */
async function searchWithApify(actorId: string, input: any): Promise<any> {
  const apiKey = process.env.APIFY_API_KEY;
  if (!apiKey) {
    throw new Error('Apify API key not configured');
  }

  const url = `https://api.apify.com/v2/acts/${actorId}/run-sync-get-dataset-items?token=${apiKey}`;

  const response = await fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ input }),
  });

  if (!response.ok) {
    throw new Error(`Apify request failed: ${response.statusText}`);
  }

  return await response.json() as any;
}

/**
 * Use browser automation for deep research
 */
async function browserResearch(context: ResearchContext): Promise<any> {
  const { brandName, keywords } = context;

  if (!brandName && !keywords?.length) {
    throw new Error('Brand name or keywords required for browser research');
  }

  try {
    const searchQuery = keywords?.join(' ') || brandName || '';
    const browserResult = await browserAgent.execute('gather-market-intelligence', {
      searchQuery,
      username: brandName,
    });

    if (!browserResult.success) {
      throw new Error(browserResult.error || 'Browser research failed');
    }

    return {
      success: true,
      data: {
        browserResearch: browserResult.data,
        sources: ['browser-automation'],
      },
      researchedAt: new Date().toISOString(),
    };
  } catch (error: any) {
    console.error('[Research Agent] Browser research error:', error);
    throw error;
  }
}

/**
 * Analyze competitor content using browser automation
 */
async function analyzeCompetitorContent(context: ResearchContext): Promise<any> {
  const { competitors = [] } = context;
  const analyzed: any[] = [];

  for (const competitor of competitors) {
    try {
      // Get competitor website URL
      const competitorUrl = competitor.website || competitor.url;
      if (!competitorUrl) {
        console.warn(`[Research Agent] No URL for competitor ${competitor.name}, skipping browser analysis`);
        analyzed.push(competitor);
        continue;
      }

      // Use browser agent to analyze competitor content
      const browserResult = await browserAgent.execute('analyze-competitor-content', {
        url: competitorUrl,
        competitorIntelligence: [competitor],
      });

      if (browserResult.success) {
        analyzed.push({
          ...competitor,
          browserAnalysis: browserResult.data,
          analyzedAt: new Date().toISOString(),
        });
      } else {
        analyzed.push(competitor); // Include original if analysis fails
      }
    } catch (error: any) {
      console.warn(`[Research Agent] Browser analysis failed for ${competitor.name}:`, error.message);
      analyzed.push(competitor); // Include original if analysis fails
    }
  }

  return {
    competitors: analyzed,
    totalAnalyzed: analyzed.length,
    browserAnalysisUsed: true,
  };
}

/**
 * Gather market intelligence using browser automation
 */
async function gatherMarketIntelligenceBrowser(context: ResearchContext): Promise<any> {
  const { brandName, industry, keywords } = context;

  const searchQueries = [
    brandName ? `${brandName} ${industry || ''}`.trim() : null,
    industry ? `${industry} trends 2025` : null,
    keywords?.join(' ') || null,
  ].filter(Boolean) as string[];

  const results: any[] = [];

  for (const query of searchQueries) {
    try {
      const browserResult = await browserAgent.execute('gather-market-intelligence', {
        searchQuery: query,
        username: brandName,
      });

      if (browserResult.success) {
        results.push({
          query,
          data: browserResult.data,
        });
      }
    } catch (error: any) {
      console.warn(`[Research Agent] Market intelligence gathering failed for "${query}":`, error.message);
    }
  }

  return {
    success: true,
    data: {
      marketIntelligence: results,
      sources: ['browser-automation'],
    },
    gatheredAt: new Date().toISOString(),
  };
}

/**
 * Analyze digital footprint using scraping APIs
 */
async function analyzeDigitalFootprintResearch(context: ResearchContext): Promise<any> {
  const { brandName } = context;

  if (!brandName) {
    throw new Error('Brand name required for digital footprint analysis');
  }

  try {
    const footprint = await analyzeDigitalFootprint(brandName);
    
    return {
      success: true,
      data: footprint,
      analyzedAt: new Date().toISOString(),
    };
  } catch (error: any) {
    console.error('[Research Agent] Digital footprint analysis error:', error);
    throw error;
  }
}

/**
 * Scrape competitor content using scraping APIs
 */
async function scrapeCompetitorResearch(context: ResearchContext): Promise<any> {
  const { competitors = [] } = context;
  const scraped: any[] = [];

  for (const competitor of competitors) {
    try {
      const competitorUrl = competitor.website || competitor.url;
      if (!competitorUrl) {
        continue;
      }

      const result = await scrapeCompetitorContent(competitorUrl, competitor.name || '');
      
      if (result.success) {
        scraped.push({
          ...competitor,
          scrapedContent: result.data,
          scrapedAt: new Date().toISOString(),
        });
      }
    } catch (error: any) {
      console.warn(`[Research Agent] Scraping failed for ${competitor.name}:`, error.message);
    }
  }

  return {
    success: true,
    competitors: scraped,
    totalScraped: scraped.length,
  };
}

/**
 * Get analytics data using scraping APIs
 */
async function getAnalyticsDataResearch(context: ResearchContext): Promise<any> {
  const { brandName } = context;

  if (!brandName) {
    throw new Error('Brand name required for analytics data');
  }

  try {
    // Try to get website URL from context or search
    let websiteUrl = context.website;
    
    if (!websiteUrl) {
      // Search for brand website using browser automation (free)
      try {
        const searchQuery = `${brandName} official website`;
        const browserResult = await browserAgent.execute('gather-market-intelligence', {
          searchQuery,
          username: brandName,
        });
        
        if (browserResult.success && browserResult.data?.results?.length > 0) {
          websiteUrl = browserResult.data.results[0].url;
        }
      } catch (error: any) {
        console.warn('[Research Agent] Website search failed:', error.message);
      }
    }

    if (websiteUrl) {
      const analyticsResult = await getAnalyticsData(websiteUrl);
      
      return {
        success: true,
        data: analyticsResult.data,
        source: analyticsResult.source,
        analyzedAt: new Date().toISOString(),
      };
    }

    return {
      success: false,
      error: 'Could not determine website URL',
    };
  } catch (error: any) {
    console.error('[Research Agent] Analytics data error:', error);
    throw error;
  }
}

