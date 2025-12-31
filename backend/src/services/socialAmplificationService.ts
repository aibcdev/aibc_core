/**
 * Social Amplification Service - Auto-post to multiple platforms
 * Amplifies every post across social media and content platforms
 */

import { BlogPost } from '../types/seo';

function getBaseURL(): string {
  return process.env.BASE_URL || process.env.FRONTEND_URL || 'https://aibcmedia.com';
}

export class SocialAmplificationService {
  /**
   * Amplify a post across all platforms
   */
  async amplifyPost(post: BlogPost): Promise<void> {
    const url = `${getBaseURL()}/blog/${post.slug}`;
    const message = this.createSocialMessage(post);

    console.log(`📢 Amplifying post: ${post.title}`);

    // Post to all platforms in parallel (don't wait for all)
    Promise.allSettled([
      this.pingSearchEngines(url),
      this.submitToRSS(post),
      // Social platforms (if APIs configured)
      ...(process.env.TWITTER_API_KEY ? [this.postToTwitter(message, url)] : []),
      ...(process.env.LINKEDIN_ACCESS_TOKEN ? [this.postToLinkedIn(message, url)] : []),
      ...(process.env.REDDIT_CLIENT_ID ? [this.postToReddit(post)] : []),
      ...(process.env.MEDIUM_ACCESS_TOKEN ? [this.postToMedium(post)] : []),
      ...(process.env.DEVTO_API_KEY ? [this.postToDevTo(post)] : []),
    ]).catch(err => {
      console.error('Error in social amplification:', err);
    });
  }

  /**
   * Create social media message
   */
  private createSocialMessage(post: BlogPost): string {
    const excerpt = post.excerpt || post.meta_description || post.title;
    const truncated = excerpt.length > 200 ? excerpt.substring(0, 197) + '...' : excerpt;
    return `${post.title}\n\n${truncated}\n\nRead more: ${getBaseURL()}/blog/${post.slug}`;
  }

  /**
   * Ping search engines
   */
  private async pingSearchEngines(url: string): Promise<void> {
    const sitemapUrl = `${getBaseURL()}/api/sitemap.xml`;
    const engines = [
      `https://www.google.com/ping?sitemap=${encodeURIComponent(sitemapUrl)}`,
      `https://www.bing.com/ping?sitemap=${encodeURIComponent(sitemapUrl)}`,
    ];

    await Promise.allSettled(
      engines.map(engineUrl => 
        fetch(engineUrl).catch(err => {
          console.warn(`Ping failed for ${engineUrl}:`, err);
        })
      )
    );
  }

  /**
   * Submit to RSS aggregators
   */
  private async submitToRSS(post: BlogPost): Promise<void> {
    const rssUrl = `${getBaseURL()}/api/blog/rss`;
    const aggregators = [
      'https://pingomatic.com/ping/',
      'https://rpc.pingomatic.com/',
      'https://blogsearch.google.com/ping',
    ];

    await Promise.allSettled(
      aggregators.map(aggregator =>
        fetch(aggregator, {
          method: 'POST',
          headers: { 'Content-Type': 'application/xml' },
          body: `<methodCall><methodName>weblogUpdates.ping</methodName><params><param><value>${post.title}</value></param><param><value>${getBaseURL()}/blog/${post.slug}</value></param></params></methodCall>`,
        }).catch(err => {
          console.warn(`RSS ping failed for ${aggregator}:`, err);
        })
      )
    );
  }

  /**
   * Post to Twitter/X
   */
  private async postToTwitter(message: string, url: string): Promise<void> {
    if (!process.env.TWITTER_API_KEY) return;

    try {
      // Twitter API v2 integration
      // Would need Twitter API client library
      console.log('🐦 Twitter post (API not implemented, would post here)');
    } catch (error) {
      console.error('Twitter post error:', error);
    }
  }

  /**
   * Post to LinkedIn
   */
  private async postToLinkedIn(message: string, url: string): Promise<void> {
    if (!process.env.LINKEDIN_ACCESS_TOKEN) return;

    try {
      // LinkedIn API integration
      console.log('💼 LinkedIn post (API not implemented, would post here)');
    } catch (error) {
      console.error('LinkedIn post error:', error);
    }
  }

  /**
   * Post to Reddit
   */
  private async postToReddit(post: BlogPost): Promise<void> {
    if (!process.env.REDDIT_CLIENT_ID) return;

    try {
      // Find relevant subreddits
      const subreddits = this.findRelevantSubreddits(post);
      
      for (const subreddit of subreddits.slice(0, 3)) { // Limit to 3 subreddits
        // Reddit API integration
        console.log(`📱 Reddit post to r/${subreddit} (API not implemented)`);
      }
    } catch (error) {
      console.error('Reddit post error:', error);
    }
  }

  /**
   * Post to Medium
   */
  private async postToMedium(post: BlogPost): Promise<void> {
    if (!process.env.MEDIUM_ACCESS_TOKEN) return;

    try {
      // Medium API - cross-post article
      console.log('📝 Medium cross-post (API not implemented)');
    } catch (error) {
      console.error('Medium post error:', error);
    }
  }

  /**
   * Post to Dev.to
   */
  private async postToDevTo(post: BlogPost): Promise<void> {
    if (!process.env.DEVTO_API_KEY) return;

    try {
      // Dev.to API
      console.log('💻 Dev.to cross-post (API not implemented)');
    } catch (error) {
      console.error('Dev.to post error:', error);
    }
  }

  /**
   * Find relevant subreddits for a post
   */
  private findRelevantSubreddits(post: BlogPost): string[] {
    const subreddits: string[] = [];
    
    // Based on category and tags
    if (post.category?.toLowerCase().includes('marketing')) {
      subreddits.push('marketing', 'digital_marketing', 'content_marketing');
    }
    if (post.category?.toLowerCase().includes('ai')) {
      subreddits.push('artificial', 'MachineLearning', 'ChatGPT');
    }
    if (post.tags?.some(t => t.toLowerCase().includes('content'))) {
      subreddits.push('content_marketing', 'blogging');
    }
    if (post.tags?.some(t => t.toLowerCase().includes('seo'))) {
      subreddits.push('SEO', 'digital_marketing');
    }

    return [...new Set(subreddits)]; // Remove duplicates
  }
}

// Singleton instance
export const socialAmplifier = new SocialAmplificationService();




