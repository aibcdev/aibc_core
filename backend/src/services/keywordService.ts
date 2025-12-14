/**
 * Keyword Research and Tracking Service
 * Uses Supabase for persistent storage, falls back to in-memory if not configured
 */

import { Keyword } from '../types/seo';
import { getSupabaseClient, isSupabaseConfigured } from '../lib/supabase';

// In-memory storage (fallback if Supabase not configured)
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
 * Convert database row to Keyword
 */
function dbRowToKeyword(row: any): Keyword {
  return {
    id: row.id,
    keyword: row.keyword,
    search_volume: row.search_volume,
    competition_score: row.competition_score,
    current_ranking: row.current_ranking,
    target_url: row.target_url,
    status: row.status,
    created_at: row.created_at,
    updated_at: row.updated_at,
  };
}

/**
 * Create or update keyword tracking
 */
export async function trackKeyword(data: Partial<Keyword>): Promise<Keyword> {
  const keyword = data.keyword?.toLowerCase().trim();
  if (!keyword) {
    throw new Error('Keyword is required');
  }

  if (isSupabaseConfigured()) {
    const supabase = getSupabaseClient();
    if (!supabase) throw new Error('Supabase client not available');

    // Check if exists
    const { data: existing } = await supabase
      .from('seo_keywords')
      .select('*')
      .eq('keyword', keyword)
      .single();

    if (existing) {
      // Update existing
      const updateData: any = { ...data, keyword };
      delete updateData.id; // Don't update ID

      const { data: updated, error } = await supabase
        .from('seo_keywords')
        .update(updateData)
        .eq('id', existing.id)
        .select()
        .single();

      if (error) throw new Error(`Failed to update keyword: ${error.message}`);
      return dbRowToKeyword(updated);
    } else {
      // Create new
      const insertData = {
        keyword,
        search_volume: data.search_volume,
        competition_score: data.competition_score,
        current_ranking: data.current_ranking,
        target_url: data.target_url,
        status: data.status || 'targeting',
      };

      const { data: created, error } = await supabase
        .from('seo_keywords')
        .insert(insertData)
        .select()
        .single();

      if (error) throw new Error(`Failed to create keyword: ${error.message}`);
      return dbRowToKeyword(created);
    }
  } else {
    // Fallback to in-memory
    const existing = keywordsStore.get(keyword);

    if (existing) {
      const updated: Keyword = {
        ...existing,
        ...data,
        keyword,
        updated_at: new Date().toISOString(),
      };
      keywordsStore.set(keyword, updated);
      return updated;
    } else {
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
}

/**
 * Get keyword by keyword string
 */
export async function getKeyword(keyword: string): Promise<Keyword | null> {
  const normalized = keyword.toLowerCase().trim();

  if (isSupabaseConfigured()) {
    const supabase = getSupabaseClient();
    if (!supabase) return null;

    const { data, error } = await supabase
      .from('seo_keywords')
      .select('*')
      .eq('keyword', normalized)
      .single();

    if (error || !data) return null;
    return dbRowToKeyword(data);
  } else {
    return keywordsStore.get(normalized) || null;
  }
}

/**
 * Get all tracked keywords
 */
export async function getAllKeywords(): Promise<Keyword[]> {
  if (isSupabaseConfigured()) {
    const supabase = getSupabaseClient();
    if (!supabase) return [];

    const { data, error } = await supabase
      .from('seo_keywords')
      .select('*')
      .order('created_at', { ascending: false });

    if (error || !data) return [];
    return data.map(dbRowToKeyword);
  } else {
    return Array.from(keywordsStore.values());
  }
}

/**
 * Get keywords by status
 */
export async function getKeywordsByStatus(status: Keyword['status']): Promise<Keyword[]> {
  if (isSupabaseConfigured()) {
    const supabase = getSupabaseClient();
    if (!supabase) return [];

    const { data, error } = await supabase
      .from('seo_keywords')
      .select('*')
      .eq('status', status)
      .order('competition_score', { ascending: true })
      .order('search_volume', { ascending: false });

    if (error || !data) return [];
    return data.map(dbRowToKeyword);
  } else {
    return Array.from(keywordsStore.values()).filter(k => k.status === status);
  }
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
