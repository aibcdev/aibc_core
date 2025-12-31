/**
 * Free Scraping Service
 * Uses only free methods: direct fetch and browser automation (Playwright) as fallback
 * No paid APIs or API keys required
 */

interface ScrapingResult {
  success: boolean;
  data?: any;
  source?: string;
  error?: string;
  executionTime?: number;
}

interface DigitalFootprintData {
  website?: any;
  socialProfiles?: Record<string, any>;
  mentions?: any[];
  backlinks?: any[];
  analytics?: any;
  seo?: any;
}

/**
 * Scrape website content using free methods only
 * Tries direct fetch first, then falls back to browser automation if needed
 */
export async function scrapeWebsite(url: string): Promise<ScrapingResult> {
  const startTime = Date.now();

  // Try direct fetch first (free, works for most sites)
  try {
    const response = await fetch(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
        'Accept-Language': 'en-US,en;q=0.5',
      },
    });
    
    if (response.ok) {
      const html = await response.text();
      return {
        success: true,
        data: { html, url },
        source: 'direct',
        executionTime: Date.now() - startTime,
      };
    }
  } catch (error: any) {
    console.warn('[Scraping API] Direct fetch failed:', error.message);
  }

  // Fallback to browser automation (Playwright) if direct fetch fails
  try {
    const { browserAgent } = await import('./agents/browserAgent');
    const browserResult = await browserAgent.execute('scrape-content', { url });
    
    if (browserResult.success && browserResult.data?.html) {
      return {
        success: true,
        data: { html: browserResult.data.html, url },
        source: 'browser-automation',
        executionTime: Date.now() - startTime,
      };
    }
  } catch (error: any) {
    console.warn('[Scraping API] Browser automation fallback failed:', error.message);
  }

  return {
    success: false,
    error: 'All scraping methods failed',
    executionTime: Date.now() - startTime,
  };
}

/**
 * Analyze digital footprint using multiple sources
 */
export async function analyzeDigitalFootprint(
  brandName: string,
  website?: string
): Promise<DigitalFootprintData> {
  const footprint: DigitalFootprintData = {};

  // Scrape website if provided
  if (website) {
    const websiteResult = await scrapeWebsite(website);
    if (websiteResult.success) {
      footprint.website = websiteResult.data;
    }
  }

  // Search for social profiles using browser automation (free)
  if (brandName) {
    try {
      const { browserAgent } = await import('./agents/browserAgent');
      const searchQuery = `${brandName} site:twitter.com OR site:linkedin.com OR site:instagram.com`;
      const browserResult = await browserAgent.execute('gather-market-intelligence', {
        searchQuery,
        username: brandName,
      });
      
      if (browserResult.success && browserResult.data) {
        // Extract social profiles from browser results
        const results = browserResult.data.results || [];
        footprint.socialProfiles = {
          twitter: results.find((r: any) => r.url?.includes('twitter.com')),
          linkedin: results.find((r: any) => r.url?.includes('linkedin.com')),
          instagram: results.find((r: any) => r.url?.includes('instagram.com')),
        };
      }
    } catch (error: any) {
      console.warn('[Scraping API] Social profile search failed:', error.message);
    }
  }

  // Search for mentions using browser automation (free)
  if (brandName) {
    try {
      const { browserAgent } = await import('./agents/browserAgent');
      const searchQuery = `"${brandName}"`;
      const browserResult = await browserAgent.execute('gather-market-intelligence', {
        searchQuery,
        username: brandName,
      });
      
      if (browserResult.success && browserResult.data) {
        footprint.mentions = (browserResult.data.results || []).slice(0, 10);
      }
    } catch (error: any) {
      console.warn('[Scraping API] Mentions search failed:', error.message);
    }
  }

  // SEO analysis if website provided
  if (website) {
    try {
      const seoResult = await analyzeSEO(website);
      footprint.seo = seoResult;
    } catch (error: any) {
      console.warn('[Scraping API] SEO analysis failed:', error.message);
    }
  }

  return footprint;
}

/**
 * Analyze SEO metrics
 */
async function analyzeSEO(url: string): Promise<any> {
  const websiteResult = await scrapeWebsite(url);
  if (!websiteResult.success || !websiteResult.data?.html) {
    return null;
  }

  // Basic SEO extraction from HTML
  const html = websiteResult.data.html;
  const titleMatch = html.match(/<title[^>]*>([^<]+)<\/title>/i);
  const metaDescMatch = html.match(/<meta[^>]*name=["']description["'][^>]*content=["']([^"']+)["']/i);
  const h1Matches = html.match(/<h1[^>]*>([^<]+)<\/h1>/gi) || [];
  const linkMatches = html.match(/<a[^>]*href=["']([^"']+)["']/gi) || [];

  return {
    title: titleMatch?.[1] || null,
    metaDescription: metaDescMatch?.[1] || null,
    h1Count: h1Matches.length,
    internalLinks: linkMatches.length,
    analyzedAt: new Date().toISOString(),
  };
}

/**
 * Scrape competitor content for analysis
 */
export async function scrapeCompetitorContent(
  competitorUrl: string,
  brandName: string
): Promise<ScrapingResult> {
  const startTime = Date.now();

  const result = await scrapeWebsite(competitorUrl);
  
  if (result.success && result.data?.html) {
    // Extract key content elements
    const html = result.data.html;
    const content = {
      title: html.match(/<title[^>]*>([^<]+)<\/title>/i)?.[1],
      headings: [
        ...(html.match(/<h1[^>]*>([^<]+)<\/h1>/gi) || []),
        ...(html.match(/<h2[^>]*>([^<]+)<\/h2>/gi) || []),
      ].slice(0, 10),
      paragraphs: (html.match(/<p[^>]*>([^<]+)<\/p>/gi) || []).slice(0, 20),
      links: (html.match(/<a[^>]*href=["']([^"']+)["']/gi) || []).slice(0, 30),
    };

    return {
      success: true,
      data: {
        url: competitorUrl,
        content,
        scrapedAt: new Date().toISOString(),
      },
      source: result.source,
      executionTime: Date.now() - startTime,
    };
  }

  return result;
}

/**
 * Get analytics data using scraping
 */
export async function getAnalyticsData(url: string): Promise<ScrapingResult> {
  const startTime = Date.now();

  const result = await scrapeWebsite(url);
  
  if (result.success && result.data?.html) {
    // Extract analytics-related data
    const html = result.data.html;
    const analytics = {
      hasGoogleAnalytics: html.includes('google-analytics.com') || html.includes('gtag'),
      hasFacebookPixel: html.includes('facebook.net') || html.includes('fbq'),
      hasHotjar: html.includes('hotjar.com'),
      scriptCount: (html.match(/<script[^>]*>/gi) || []).length,
      stylesheetCount: (html.match(/<link[^>]*rel=["']stylesheet["']/gi) || []).length,
    };

    return {
      success: true,
      data: analytics,
      source: result.source,
      executionTime: Date.now() - startTime,
    };
  }

  return result;
}

