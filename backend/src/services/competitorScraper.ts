/**
 * Competitor Content Scraper Service
 * Scrapes competitor content every 24 hours and updates calendar
 */

import { Browser } from 'playwright';

interface CompetitorPost {
  id: string;
  platform: string;
  content: string;
  timestamp: number;
  url: string;
  engagement?: {
    likes: number;
    shares: number;
    comments: number;
  };
}

interface CompetitorData {
  name: string;
  username: string;
  platforms: string[];
  lastScraped?: number;
  posts: CompetitorPost[];
}

/**
 * Scrape competitor content from platforms
 */
export async function scrapeCompetitorContent(
  browser: Browser,
  competitor: CompetitorData
): Promise<CompetitorPost[]> {
  const posts: CompetitorPost[] = [];
  const now = Date.now();
  const twentyFourHoursAgo = now - (24 * 60 * 60 * 1000);
  
  try {
    for (const platform of competitor.platforms) {
      try {
        const page = await browser.newPage();
        await page.setViewportSize({ width: 1920, height: 1080 });
        
        let url = '';
        if (platform === 'twitter' || platform === 'x') {
          url = `https://twitter.com/${competitor.username}`;
        } else if (platform === 'instagram') {
          url = `https://instagram.com/${competitor.username}`;
        } else if (platform === 'linkedin') {
          url = `https://linkedin.com/in/${competitor.username}`;
        } else if (platform === 'tiktok') {
          url = `https://tiktok.com/@${competitor.username}`;
        }
        
        if (!url) continue;
        
        await page.goto(url, { waitUntil: 'networkidle', timeout: 30000 });
        await page.waitForTimeout(2000);
        
        // Extract posts from last 24 hours
        const platformPosts = await page.evaluate((platformName, username) => {
          const results: any[] = [];
          const now = Date.now();
          const oneDayAgo = now - (24 * 60 * 60 * 1000);
          
          // Platform-specific extraction logic
          if (platformName === 'twitter' || platformName === 'x') {
            const tweetElements = document.querySelectorAll('article[data-testid="tweet"]');
            tweetElements.forEach((el, idx) => {
              if (idx >= 10) return; // Limit to 10 most recent
              
              const textEl = el.querySelector('[data-testid="tweetText"]');
              const timeEl = el.querySelector('time');
              const linkEl = el.querySelector('a[href*="/status/"]');
              
              if (textEl && timeEl) {
                const text = textEl.textContent || '';
                const timeStr = timeEl.getAttribute('datetime');
                const postTime = timeStr ? new Date(timeStr).getTime() : now;
                
                if (postTime >= oneDayAgo) {
                  const link = linkEl ? linkEl.getAttribute('href') : '';
                  const fullUrl = link ? `https://twitter.com${link}` : '';
                  
                  // Extract engagement
                  const likeEl = el.querySelector('[data-testid="like"]');
                  const retweetEl = el.querySelector('[data-testid="retweet"]');
                  const replyEl = el.querySelector('[data-testid="reply"]');
                  
                  results.push({
                    id: `twitter_${idx}_${postTime}`,
                    platform: 'twitter',
                    content: text,
                    timestamp: postTime,
                    url: fullUrl,
                    engagement: {
                      likes: parseInt(likeEl?.textContent?.replace(/[^\d]/g, '') || '0'),
                      shares: parseInt(retweetEl?.textContent?.replace(/[^\d]/g, '') || '0'),
                      comments: parseInt(replyEl?.textContent?.replace(/[^\d]/g, '') || '0')
                    }
                  });
                }
              }
            });
          } else if (platformName === 'linkedin') {
            const postElements = document.querySelectorAll('.feed-shared-update-v2');
            postElements.forEach((el, idx) => {
              if (idx >= 10) return;
              
              const textEl = el.querySelector('.feed-shared-text');
              const timeEl = el.querySelector('time');
              const linkEl = el.querySelector('a[href*="/activity-"]');
              
              if (textEl && timeEl) {
                const text = textEl.textContent || '';
                const timeStr = timeEl.getAttribute('datetime');
                const postTime = timeStr ? new Date(timeStr).getTime() : now;
                
                if (postTime >= oneDayAgo) {
                  const link = linkEl ? linkEl.getAttribute('href') : '';
                  const fullUrl = link ? `https://linkedin.com${link}` : '';
                  
                  results.push({
                    id: `linkedin_${idx}_${postTime}`,
                    platform: 'linkedin',
                    content: text,
                    timestamp: postTime,
                    url: fullUrl
                  });
                }
              }
            });
          }
          // Add more platform-specific extraction as needed
          
          return results;
        }, platform, competitor.username);
        
        posts.push(...platformPosts);
        await page.close();
      } catch (error) {
        console.error(`Error scraping ${platform} for ${competitor.name}:`, error);
      }
    }
  } catch (error) {
    console.error(`Error scraping competitor ${competitor.name}:`, error);
  }
  
  return posts;
}

/**
 * Update calendar with competitor posts
 */
export function updateCalendarWithCompetitorPosts(posts: CompetitorPost[], competitorName: string) {
  try {
    const calendarEvents = JSON.parse(localStorage.getItem('calendarEvents') || '[]');
    
    posts.forEach(post => {
      const eventDate = new Date(post.timestamp);
      const event = {
        id: `competitor_${post.id}`,
        date: eventDate.toISOString(),
        time: eventDate.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }),
        title: `${competitorName} - ${post.platform}`,
        description: post.content.substring(0, 200),
        type: 'social' as const,
        platform: post.platform,
        status: 'published' as const,
        createdAt: new Date().toISOString(),
        deadline: eventDate.toISOString(),
        url: post.url,
        isCompetitor: true,
        competitorName
      };
      
      // Remove existing event if any
      const filtered = calendarEvents.filter((e: any) => e.id !== event.id);
      filtered.push(event);
      calendarEvents.length = 0;
      calendarEvents.push(...filtered);
    });
    
    localStorage.setItem('calendarEvents', JSON.stringify(calendarEvents));
  } catch (error) {
    console.error('Error updating calendar with competitor posts:', error);
  }
}

/**
 * Schedule competitor scraping every 24 hours
 */
export function scheduleCompetitorScraping(competitors: CompetitorData[], browser: Browser) {
  // Run immediately
  scrapeAllCompetitors(competitors, browser);
  
  // Then run every 24 hours
  setInterval(() => {
    scrapeAllCompetitors(competitors, browser);
  }, 24 * 60 * 60 * 1000);
}

async function scrapeAllCompetitors(competitors: CompetitorData[], browser: Browser) {
  for (const competitor of competitors) {
    try {
      const posts = await scrapeCompetitorContent(browser, competitor);
      if (posts.length > 0) {
        updateCalendarWithCompetitorPosts(posts, competitor.name);
        console.log(`✅ Scraped ${posts.length} posts from ${competitor.name}`);
      }
    } catch (error) {
      console.error(`Error scraping ${competitor.name}:`, error);
    }
  }
}

