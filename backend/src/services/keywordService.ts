/**
 * Keyword Research and Tracking Service
 */

import { Keyword } from '../../../types/seo';

// In-memory storage (will migrate to database)
const keywordsStore: Map<string, Keyword> = new Map();

/**
 * Target keywords for content marketing and video marketing
 */
export const TARGET_KEYWORDS: Array<{
  keyword: string;
  searchVolume?: number;
  competition?: number; // 1-100
  category: string;
}> = [
  // Content Marketing
  { keyword: 'content marketing strategies', searchVolume: 1200, competition: 35, category: 'Content Marketing' },
  { keyword: 'video marketing tips for brands', searchVolume: 800, competition: 25, category: 'Video Marketing' },
  { keyword: 'video ideas for brands', searchVolume: 1600, competition: 30, category: 'Video Marketing' },
  { keyword: 'content calendar templates', searchVolume: 2400, competition: 40, category: 'Content Marketing' },
  { keyword: 'social media content ideas', searchVolume: 3200, competition: 45, category: 'Content Marketing' },
  { keyword: 'brand storytelling examples', searchVolume: 900, competition: 28, category: 'Content Marketing' },
  { keyword: 'video content strategy guide', searchVolume: 1100, competition: 32, category: 'Video Marketing' },
  { keyword: 'content marketing tools', searchVolume: 4900, competition: 50, category: 'Content Marketing' },
  { keyword: 'video editing tips for marketers', searchVolume: 720, competition: 22, category: 'Video Marketing' },
  { keyword: 'instagram video ideas', searchVolume: 1800, competition: 38, category: 'Video Marketing' },
  { keyword: 'tiktok content ideas for brands', searchVolume: 2100, competition: 35, category: 'Video Marketing' },
  { keyword: 'youtube video ideas', searchVolume: 5400, competition: 55, category: 'Video Marketing' },
  { keyword: 'content creation workflow', searchVolume: 590, competition: 20, category: 'Content Marketing' },
  { keyword: 'video script templates', searchVolume: 880, competition: 26, category: 'Video Marketing' },
  { keyword: 'how to create video content', searchVolume: 1400, competition: 30, category: 'Video Marketing' },
  { keyword: 'best video marketing tools', searchVolume: 1900, competition: 42, category: 'Video Marketing' },
  { keyword: 'content marketing best practices', searchVolume: 1600, competition: 38, category: 'Content Marketing' },
  { keyword: 'video marketing for small business', searchVolume: 1300, competition: 28, category: 'Video Marketing' },
  { keyword: 'content marketing case studies', searchVolume: 1200, competition: 32, category: 'Content Marketing' },
  { keyword: 'video production tips', searchVolume: 2100, competition: 40, category: 'Video Marketing' },
];

/**
 * Create or update keyword tracking
 */
export async function trackKeyword(data: Partial<Keyword>): Promise<Keyword> {
  const keyword = data.keyword?.toLowerCase().trim();
  if (!keyword) {
    throw new Error('Keyword is required');
  }

  const existing = keywordsStore.get(keyword);

  if (existing) {
    // Update existing
    const updated: Keyword = {
      ...existing,
      ...data,
      keyword,
      updated_at: new Date().toISOString(),
    };
    keywordsStore.set(keyword, updated);
    return updated;
  } else {
    // Create new
    const newKeyword: Keyword = {
      id: `kw_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      keyword,
      search_volume: data.search_volume,
      competition_score: data.competition_score,
      current_ranking: data.current_ranking,
      target_url: data.target_url,
      status: data.status || 'targeting',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };
    keywordsStore.set(keyword, newKeyword);
    return newKeyword;
  }
}

/**
 * Get keyword by keyword string
 */
export async function getKeyword(keyword: string): Promise<Keyword | null> {
  return keywordsStore.get(keyword.toLowerCase().trim()) || null;
}

/**
 * Get all tracked keywords
 */
export async function getAllKeywords(): Promise<Keyword[]> {
  return Array.from(keywordsStore.values());
}

/**
 * Get keywords by status
 */
export async function getKeywordsByStatus(status: Keyword['status']): Promise<Keyword[]> {
  return Array.from(keywordsStore.values()).filter(k => k.status === status);
}

/**
 * Initialize target keywords
 */
export async function initializeTargetKeywords(): Promise<void> {
  for (const target of TARGET_KEYWORDS) {
    const existing = await getKeyword(target.keyword);
    if (!existing) {
      await trackKeyword({
        keyword: target.keyword,
        search_volume: target.searchVolume,
        competition_score: target.competition,
        status: 'targeting',
      });
    }
  }
}

/**
 * Get next keyword to target (low competition, high volume, not yet published)
 */
export async function getNextKeywordToTarget(): Promise<Keyword | null> {
  const targeting = await getKeywordsByStatus('targeting');
  
  if (targeting.length === 0) {
    // Initialize if empty
    await initializeTargetKeywords();
    return getNextKeywordToTarget();
  }

  // Sort by competition (lowest first) and volume (highest first)
  const sorted = targeting.sort((a, b) => {
    const compA = a.competition_score || 100;
    const compB = b.competition_score || 100;
    if (compA !== compB) return compA - compB;
    
    const volA = a.search_volume || 0;
    const volB = b.search_volume || 0;
    return volB - volA;
  });

  return sorted[0] || null;
}

/**
 * Update keyword ranking
 */
export async function updateKeywordRanking(keyword: string, ranking: number): Promise<Keyword | null> {
  const kw = await getKeyword(keyword);
  if (!kw) return null;

  return await trackKeyword({
    keyword,
    current_ranking: ranking,
    status: ranking <= 10 ? 'ranking' : kw.status,
  });
}

/**
 * Mark keyword as tracked
 */
export async function markKeywordTracked(keyword: string): Promise<Keyword | null> {
  const kw = await getKeyword(keyword);
  if (!kw) return null;

  return await trackKeyword({
    keyword,
    status: 'tracked',
  });
}

