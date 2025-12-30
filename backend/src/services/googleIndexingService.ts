/**
 * Google Indexing Service - Instant URL submission to Google
 * Uses Google Indexing API for immediate indexing
 */

interface IndexingResponse {
  success: boolean;
  url: string;
  error?: string;
}

export class GoogleIndexingService {
  private client: any;
  private initialized: boolean = false;

  constructor() {
    this.initialize();
  }

  /**
   * Initialize Google Indexing API client
   */
  private async initialize(): Promise<void> {
    try {
      // Check if service account key is configured
      if (!process.env.GOOGLE_SERVICE_ACCOUNT_KEY && !process.env.GOOGLE_INDEXING_API_KEY) {
        console.warn('⚠️ Google Indexing API not configured. Set GOOGLE_SERVICE_ACCOUNT_KEY or GOOGLE_INDEXING_API_KEY');
        return;
      }

      // Try to use googleapis if available
      try {
        const { google } = await import('googleapis');
        
        if (process.env.GOOGLE_SERVICE_ACCOUNT_KEY) {
          const auth = new google.auth.GoogleAuth({
            keyFile: process.env.GOOGLE_SERVICE_ACCOUNT_KEY,
            scopes: ['https://www.googleapis.com/auth/indexing'],
          });
          
          this.client = google.indexing({ version: 'v3', auth });
          this.initialized = true;
          console.log('✅ Google Indexing API initialized');
        }
      } catch (error) {
        console.warn('⚠️ googleapis not available, using HTTP API directly');
        this.initialized = false;
      }
    } catch (error) {
      console.error('Error initializing Google Indexing API:', error);
      this.initialized = false;
    }
  }

  /**
   * Submit URL to Google for indexing (RATE-LIMITED for compliance)
   */
  async submitUrl(
    url: string,
    type: 'URL_UPDATED' | 'URL_DELETED' = 'URL_UPDATED'
  ): Promise<IndexingResponse> {
    // Check rate limits first
    const { indexingRateLimiter } = await import('./contentQualityService');
    
    if (!indexingRateLimiter.canSubmit()) {
      return {
        success: false,
        url,
        error: `Rate limit reached. ${indexingRateLimiter.getRemainingDaily()} remaining today, ${indexingRateLimiter.getRemainingHourly()} this hour.`,
      };
    }

    if (!this.initialized && !process.env.GOOGLE_INDEXING_API_KEY) {
      // Fallback: ping Google (but still respect rate limits)
      indexingRateLimiter.recordSubmission();
      return this.pingGoogle(url);
    }

    try {
      if (this.client) {
        // Use googleapis client
      await this.client.urlNotifications.publish({
        requestBody: {
          url,
          type,
        },
      });
      
      indexingRateLimiter.recordSubmission();
      return { success: true, url };
      } else if (process.env.GOOGLE_INDEXING_API_KEY) {
        // Use HTTP API directly
        const response = await fetch('https://indexing.googleapis.com/v3/urlNotifications:publish', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${process.env.GOOGLE_INDEXING_API_KEY}`,
          },
          body: JSON.stringify({
            url,
            type,
          }),
        });

        if (response.ok) {
          return { success: true, url };
        } else {
          const error = await response.text();
          return { success: false, url, error };
        }
      }
    } catch (error: any) {
      console.error(`Google indexing error for ${url}:`, error.message);
      return { success: false, url, error: error.message };
    }

    // Fallback to ping
    return this.pingGoogle(url);
  }

  /**
   * Submit multiple URLs in batch (GOOGLE-COMPLIANT: Rate limited)
   */
  async submitBatch(
    urls: string[],
    type: 'URL_UPDATED' | 'URL_DELETED' = 'URL_UPDATED'
  ): Promise<{ success: number; failed: number; results: IndexingResponse[]; rateLimited: number }> {
    console.log(`📤 Submitting ${urls.length} URLs to Google (rate-limited for compliance)...`);

    // Import rate limiter
    const { indexingRateLimiter } = await import('./contentQualityService');

    // Filter URLs based on rate limits (Google: max 200/day, 20/hour)
    const allowedUrls: string[] = [];
    const rateLimited: string[] = [];

    for (const url of urls) {
      if (indexingRateLimiter.canSubmit()) {
        allowedUrls.push(url);
        indexingRateLimiter.recordSubmission();
      } else {
        rateLimited.push(url);
      }
    }

    if (rateLimited.length > 0) {
      console.log(`⚠️ Rate limited: ${rateLimited.length} URLs deferred (${indexingRateLimiter.getRemainingDaily()} remaining today)`);
    }

    // Process allowed URLs in small batches (max 20 per hour)
    const chunks: string[][] = [];
    const maxPerBatch = 10; // Conservative batch size
    for (let i = 0; i < allowedUrls.length; i += maxPerBatch) {
      chunks.push(allowedUrls.slice(i, i + maxPerBatch));
    }

    const allResults: IndexingResponse[] = [];

    for (let i = 0; i < chunks.length; i++) {
      const chunk = chunks[i];
      
      // Check rate limit before each batch
      if (!indexingRateLimiter.canSubmit()) {
        console.log(`⏸️ Rate limit reached, deferring ${chunks.length - i} batches`);
        break;
      }

      const results = await Promise.allSettled(
        chunk.map(url => this.submitUrl(url, type))
      );

      for (const result of results) {
        if (result.status === 'fulfilled') {
          allResults.push(result.value);
        } else {
          allResults.push({
            success: false,
            url: 'unknown',
            error: result.reason?.message || 'Unknown error',
          });
        }
      }

      // Delay between batches to respect rate limits (1 minute between batches)
      if (i < chunks.length - 1) {
        await new Promise(resolve => setTimeout(resolve, 60000)); // 1 minute delay
      }
    }

    const success = allResults.filter(r => r.success).length;
    const failed = allResults.length - success;

    console.log(`✅ Google indexing: ${success} success, ${failed} failed, ${rateLimited.length} rate-limited`);

    return {
      success,
      failed,
      rateLimited: rateLimited.length,
      results: allResults,
    };
  }

  /**
   * Fallback: Ping Google (less reliable but works without API)
   */
  private async pingGoogle(url: string): Promise<IndexingResponse> {
    try {
      const sitemapUrl = `${process.env.BASE_URL || process.env.FRONTEND_URL || 'https://aibcmedia.com'}/api/sitemap.xml`;
      const pingUrl = `https://www.google.com/ping?sitemap=${encodeURIComponent(sitemapUrl)}`;
      
      await fetch(pingUrl);
      return { success: true, url };
    } catch (error: any) {
      return { success: false, url, error: error.message };
    }
  }

  /**
   * Check if service is available
   */
  isAvailable(): boolean {
    return this.initialized || !!process.env.GOOGLE_INDEXING_API_KEY;
  }
}

// Singleton instance
export const googleIndexing = new GoogleIndexingService();

