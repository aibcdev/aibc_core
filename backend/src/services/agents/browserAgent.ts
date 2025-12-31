/**
 * Browser Automation Agent - Playwright Integration
 * Provides browser automation for competitor research, content validation, and market intelligence
 */

import { chromium, Browser, Page, BrowserContext as PlaywrightBrowserContext } from 'playwright';

interface BrowserAgentContext {
  username?: string;
  brandDNA?: any;
  competitorIntelligence?: any[];
  url?: string;
  searchQuery?: string;
  task?: string;
}

interface BrowserResult {
  success: boolean;
  data?: any;
  error?: string;
  screenshots?: string[];
  executionTime?: number;
}

// Browser instance management
let browserInstance: Browser | null = null;
let browserContext: PlaywrightBrowserContext | null = null;

/**
 * Initialize browser (lazy loading)
 */
async function getBrowser(): Promise<Browser> {
  if (!browserInstance) {
    const enableBrowser = process.env.ENABLE_BROWSER_AUTOMATION !== 'false';
    if (!enableBrowser) {
      throw new Error('Browser automation is disabled. Set ENABLE_BROWSER_AUTOMATION=true');
    }

    browserInstance = await chromium.launch({
      headless: true,
      args: ['--no-sandbox', '--disable-setuid-sandbox'],
    });
  }
  return browserInstance;
}

/**
 * Close browser instance
 */
export async function closeBrowser(): Promise<void> {
  if (browserContext) {
    await browserContext.close();
    browserContext = null;
  }
  if (browserInstance) {
    await browserInstance.close();
    browserInstance = null;
  }
}

/**
 * Browser Agent execution
 */
export const browserAgent = {
  /**
   * Execute browser task
   */
  async execute(task: string, context: BrowserAgentContext): Promise<BrowserResult> {
    const startTime = Date.now();
    console.log(`[Browser Agent] Executing task: ${task}`);

    try {
      switch (task) {
        case 'research-competitor':
          return await researchCompetitor(context);
        case 'validate-content':
          return await validateContent(context);
        case 'gather-market-intelligence':
          return await gatherMarketIntelligence(context);
        case 'analyze-competitor-content':
          return await analyzeCompetitorContent(context);
        case 'check-seo-performance':
          return await checkSEOPerformance(context);
        case 'scrape-content':
          return await scrapeContent(context);
        default:
          throw new Error(`Unknown browser task: ${task}`);
      }
    } catch (error: any) {
      console.error(`[Browser Agent] Error executing ${task}:`, error);
      return {
        success: false,
        error: error.message || 'Unknown error',
        executionTime: Date.now() - startTime,
      };
    }
  },
};

/**
 * Research competitor website and content
 */
async function researchCompetitor(context: BrowserAgentContext): Promise<BrowserResult> {
  const startTime = Date.now();
  const { url, competitorIntelligence } = context;

  if (!url) {
    return {
      success: false,
      error: 'URL required for competitor research',
      executionTime: Date.now() - startTime,
    };
  }

  try {
    const browser = await getBrowser();
    const page = await browser.newPage();

    // Set viewport
    await page.setViewportSize({ width: 1920, height: 1080 });

    // Navigate to competitor site
    await page.goto(url, { waitUntil: 'networkidle', timeout: 30000 });

    // Extract key information
    const competitorData = {
      title: await page.title(),
      description: await page.locator('meta[name="description"]').getAttribute('content').catch(() => null),
      headings: await page.locator('h1, h2, h3').allTextContents(),
      content: await page.locator('main, article, .content').first().textContent().catch(() => null),
      links: await page.locator('a[href]').evaluateAll(links =>
        links.slice(0, 20).map(link => ({
          text: link.textContent?.trim(),
          href: link.getAttribute('href'),
        }))
      ),
      images: await page.locator('img[src]').evaluateAll(images =>
        images.slice(0, 10).map(img => ({
          alt: img.getAttribute('alt'),
          src: img.getAttribute('src'),
        }))
      ),
      socialLinks: await page.locator('a[href*="twitter"], a[href*="linkedin"], a[href*="facebook"], a[href*="instagram"]')
        .evaluateAll(links =>
          links.map(link => ({
            platform: link.getAttribute('href')?.match(/(twitter|linkedin|facebook|instagram)/i)?.[1],
            url: link.getAttribute('href'),
          }))
        ),
    };

    // Take screenshot
    const screenshot = await page.screenshot({ fullPage: false }).catch(() => null);

    await page.close();

    return {
      success: true,
      data: {
        url,
        competitorData,
        screenshot: screenshot ? screenshot.toString('base64') : null,
        researchedAt: new Date().toISOString(),
      },
      executionTime: Date.now() - startTime,
    };
  } catch (error: any) {
    return {
      success: false,
      error: `Competitor research failed: ${error.message}`,
      executionTime: Date.now() - startTime,
    };
  }
}

/**
 * Validate content against live web sources
 */
async function validateContent(context: BrowserAgentContext): Promise<BrowserResult> {
  const startTime = Date.now();
  const { url, searchQuery } = context;

  if (!url && !searchQuery) {
    return {
      success: false,
      error: 'URL or search query required for content validation',
      executionTime: Date.now() - startTime,
    };
  }

  try {
    const browser = await getBrowser();
    const page = await browser.newPage();

    if (url) {
      // Validate specific URL
      await page.goto(url, { waitUntil: 'networkidle', timeout: 30000 });
      
      const validation = {
        url,
        isAccessible: true,
        title: await page.title(),
        hasContent: (await page.locator('body').textContent() || '').length > 100,
        loadTime: Date.now() - startTime,
        validatedAt: new Date().toISOString(),
      };

      await page.close();

      return {
        success: true,
        data: validation,
        executionTime: Date.now() - startTime,
      };
    } else if (searchQuery) {
      // Search and validate top results
      await page.goto('https://www.google.com/search?q=' + encodeURIComponent(searchQuery), {
        waitUntil: 'networkidle',
        timeout: 30000,
      });

      const searchResults = await page.locator('div[data-ved] a h3').evaluateAll(headings =>
        headings.slice(0, 5).map(h => h.textContent?.trim()).filter(Boolean)
      );

      await page.close();

      return {
        success: true,
        data: {
          searchQuery,
          topResults: searchResults,
          validatedAt: new Date().toISOString(),
        },
        executionTime: Date.now() - startTime,
      };
    }

    return {
      success: false,
      error: 'Invalid validation request',
      executionTime: Date.now() - startTime,
    };
  } catch (error: any) {
    return {
      success: false,
      error: `Content validation failed: ${error.message}`,
      executionTime: Date.now() - startTime,
    };
  }
}

/**
 * Gather market intelligence from web sources
 */
async function gatherMarketIntelligence(context: BrowserAgentContext): Promise<BrowserResult> {
  const startTime = Date.now();
  const { searchQuery, username, brandDNA } = context;

  if (!searchQuery) {
    return {
      success: false,
      error: 'Search query required for market intelligence',
      executionTime: Date.now() - startTime,
    };
  }

  try {
    const browser = await getBrowser();
    const page = await browser.newPage();

    // Search for market trends
    const searchUrl = `https://www.google.com/search?q=${encodeURIComponent(searchQuery)}`;
    await page.goto(searchUrl, { waitUntil: 'networkidle', timeout: 30000 });

    const intelligence = {
      searchQuery,
      topHeadlines: await page.locator('div[data-ved] a h3').evaluateAll(headings =>
        headings.slice(0, 10).map(h => h.textContent?.trim()).filter(Boolean)
      ),
      relatedSearches: await page.locator('a[data-ved*="related"]').evaluateAll(links =>
        links.slice(0, 5).map(link => link.textContent?.trim()).filter(Boolean)
      ),
      gatheredAt: new Date().toISOString(),
    };

    await page.close();

    return {
      success: true,
      data: intelligence,
      executionTime: Date.now() - startTime,
    };
  } catch (error: any) {
    return {
      success: false,
      error: `Market intelligence gathering failed: ${error.message}`,
      executionTime: Date.now() - startTime,
    };
  }
}

/**
 * Analyze competitor content in detail
 */
async function analyzeCompetitorContent(context: BrowserAgentContext): Promise<BrowserResult> {
  const startTime = Date.now();
  const { url, competitorIntelligence } = context;

  if (!url) {
    return {
      success: false,
      error: 'URL required for competitor content analysis',
      executionTime: Date.now() - startTime,
    };
  }

  try {
    const browser = await getBrowser();
    const page = await browser.newPage();

    await page.goto(url, { waitUntil: 'networkidle', timeout: 30000 });

    // Extract detailed content analysis
    const analysis = {
      url,
      title: await page.title(),
      metaDescription: await page.locator('meta[name="description"]').getAttribute('content').catch(() => null),
      contentStructure: {
        h1Count: (await page.locator('h1').allTextContents()).length,
        h2Count: (await page.locator('h2').allTextContents()).length,
        paragraphCount: (await page.locator('p').allTextContents()).length,
        imageCount: (await page.locator('img').count()),
        linkCount: (await page.locator('a').count()),
      },
      contentThemes: await page.locator('h1, h2, h3').allTextContents(),
      keyPhrases: await extractKeyPhrases(page),
      readability: {
        avgSentenceLength: await calculateAvgSentenceLength(page),
        wordCount: (await page.locator('body').textContent() || '').split(/\s+/).length,
      },
      analyzedAt: new Date().toISOString(),
    };

    await page.close();

    return {
      success: true,
      data: analysis,
      executionTime: Date.now() - startTime,
    };
  } catch (error: any) {
    return {
      success: false,
      error: `Competitor content analysis failed: ${error.message}`,
      executionTime: Date.now() - startTime,
    };
  }
}

/**
 * Check SEO performance metrics
 */
async function checkSEOPerformance(context: BrowserAgentContext): Promise<BrowserResult> {
  const startTime = Date.now();
  const { url } = context;

  if (!url) {
    return {
      success: false,
      error: 'URL required for SEO performance check',
      executionTime: Date.now() - startTime,
    };
  }

  try {
    const browser = await getBrowser();
    const page = await browser.newPage();

    await page.goto(url, { waitUntil: 'networkidle', timeout: 30000 });

    const seoMetrics = {
      url,
      title: await page.title(),
      titleLength: (await page.title()).length,
      hasMetaDescription: !!(await page.locator('meta[name="description"]').getAttribute('content').catch(() => null)),
      metaDescriptionLength: (await page.locator('meta[name="description"]').getAttribute('content').catch(() => '') || '').length,
      hasH1: (await page.locator('h1').count()) > 0,
      h1Text: await page.locator('h1').first().textContent().catch(() => null),
      hasCanonical: !!(await page.locator('link[rel="canonical"]').getAttribute('href').catch(() => null)),
      hasOpenGraph: !!(await page.locator('meta[property^="og:"]').count() > 0),
      hasTwitterCard: !!(await page.locator('meta[name^="twitter:"]').count() > 0),
      imageAltTags: await page.locator('img').evaluateAll(images =>
        images.map(img => ({
          hasAlt: !!img.getAttribute('alt'),
          alt: img.getAttribute('alt'),
        }))
      ),
      checkedAt: new Date().toISOString(),
    };

    await page.close();

    return {
      success: true,
      data: seoMetrics,
      executionTime: Date.now() - startTime,
    };
  } catch (error: any) {
    return {
      success: false,
      error: `SEO performance check failed: ${error.message}`,
      executionTime: Date.now() - startTime,
    };
  }
}

/**
 * Scrape content from a URL
 */
async function scrapeContent(context: BrowserAgentContext): Promise<BrowserResult> {
  const startTime = Date.now();
  const { url } = context;

  if (!url) {
    return {
      success: false,
      error: 'URL required for content scraping',
      executionTime: Date.now() - startTime,
    };
  }

  try {
    const browser = await getBrowser();
    const page = await browser.newPage();

    await page.goto(url, { waitUntil: 'networkidle', timeout: 30000 });

    const scrapedContent = {
      url,
      title: await page.title(),
      text: await page.locator('body').textContent(),
      html: await page.content(),
      links: await page.locator('a[href]').evaluateAll(links =>
        links.map(link => ({
          text: link.textContent?.trim(),
          href: link.getAttribute('href'),
        }))
      ),
      images: await page.locator('img[src]').evaluateAll(images =>
        images.map(img => ({
          alt: img.getAttribute('alt'),
          src: img.getAttribute('src'),
        }))
      ),
      scrapedAt: new Date().toISOString(),
    };

    await page.close();

    return {
      success: true,
      data: scrapedContent,
      executionTime: Date.now() - startTime,
    };
  } catch (error: any) {
    return {
      success: false,
      error: `Content scraping failed: ${error.message}`,
      executionTime: Date.now() - startTime,
    };
  }
}

/**
 * Helper: Extract key phrases from page
 */
async function extractKeyPhrases(page: Page): Promise<string[]> {
  const text = await page.locator('body').textContent() || '';
  const words = text.toLowerCase().match(/\b\w{4,}\b/g) || [];
  const wordFreq = new Map<string, number>();

  words.forEach(word => {
    wordFreq.set(word, (wordFreq.get(word) || 0) + 1);
  });

  return Array.from(wordFreq.entries())
    .sort((a, b) => b[1] - a[1])
    .slice(0, 20)
    .map(([word]) => word);
}

/**
 * Helper: Calculate average sentence length
 */
async function calculateAvgSentenceLength(page: Page): Promise<number> {
  const text = await page.locator('body').textContent() || '';
  const sentences = text.split(/[.!?]+/).filter(s => s.trim().length > 0);
  if (sentences.length === 0) return 0;

  const totalWords = sentences.reduce((sum, s) => sum + s.split(/\s+/).length, 0);
  return Math.round(totalWords / sentences.length);
}

