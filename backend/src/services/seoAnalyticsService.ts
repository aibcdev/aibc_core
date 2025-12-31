/**
 * SEO Analytics Service - Track rankings, traffic, and performance
 * Uses Supabase for persistent storage, falls back to in-memory if not configured
 */

import { ContentPerformance, BlogPost } from '../types/seo';
import { listBlogPosts, getBlogPostById } from './seoContentService';
import { getSupabaseClient, isSupabaseConfigured } from '../lib/supabase';

// In-memory storage (fallback if Supabase not configured)
const performanceStore: Map<string, ContentPerformance> = new Map();
const performanceByPostId: Map<string, ContentPerformance[]> = new Map();

/**
 * Convert database row to ContentPerformance
 */
function dbRowToPerformance(row: any): ContentPerformance {
  return {
    id: row.id,
    post_id: row.post_id,
    date: row.date,
    organic_views: row.organic_views || 0,
    organic_clicks: row.organic_clicks || 0,
    avg_position: row.avg_position,
    impressions: row.impressions || 0,
    created_at: row.created_at,
    updated_at: row.updated_at,
  };
}

/**
 * Record content performance metrics
 */
export async function recordPerformance(
  postId: string,
  metrics: Partial<ContentPerformance>
): Promise<ContentPerformance> {
  const date = metrics.date || new Date().toISOString().split('T')[0];

  if (isSupabaseConfigured()) {
    const supabase = getSupabaseClient();
    if (!supabase) throw new Error('Supabase client not available');

    // Check if exists
    const { data: existing } = await supabase
      .from('seo_content_performance')
      .select('*')
      .eq('post_id', postId)
      .eq('date', date)
      .single();

    const perfData = {
      post_id: postId,
      date,
      organic_views: metrics.organic_views ?? existing?.organic_views ?? 0,
      organic_clicks: metrics.organic_clicks ?? existing?.organic_clicks ?? 0,
      avg_position: metrics.avg_position ?? existing?.avg_position ?? null,
      impressions: metrics.impressions ?? existing?.impressions ?? 0,
    };

    if (existing) {
      // Update existing
      const { data: updated, error } = await supabase
        .from('seo_content_performance')
        .update(perfData)
        .eq('id', existing.id)
        .select()
        .single();

      if (error) throw new Error(`Failed to update performance: ${error.message}`);
      return dbRowToPerformance(updated);
    } else {
      // Create new
      const { data: created, error } = await supabase
        .from('seo_content_performance')
        .insert(perfData)
        .select()
        .single();

      if (error) throw new Error(`Failed to create performance: ${error.message}`);
      return dbRowToPerformance(created);
    }
  } else {
    // Fallback to in-memory
    const key = `${postId}_${date}`;
    const existing = performanceStore.get(key);
    const existingArray = performanceByPostId.get(postId) || [];

    if (existing) {
      const updated: ContentPerformance = {
        id: existing.id,
        post_id: existing.post_id,
        date,
        organic_views: metrics.organic_views !== undefined ? metrics.organic_views : existing.organic_views,
        organic_clicks: metrics.organic_clicks !== undefined ? metrics.organic_clicks : existing.organic_clicks,
        avg_position: metrics.avg_position !== undefined ? metrics.avg_position : existing.avg_position,
        impressions: metrics.impressions !== undefined ? metrics.impressions : existing.impressions,
        created_at: existing.created_at,
        updated_at: new Date().toISOString(),
      };
      const index = existingArray.findIndex(p => p.id === existing.id);
      if (index !== -1) {
        existingArray[index] = updated;
      } else {
        existingArray.push(updated);
      }
      performanceStore.set(key, updated);
      performanceByPostId.set(postId, existingArray);
      return updated;
    } else {
      const performance: ContentPerformance = {
        id: `perf_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        post_id: postId,
        date,
        organic_views: metrics.organic_views || 0,
        organic_clicks: metrics.organic_clicks || 0,
        avg_position: metrics.avg_position,
        impressions: metrics.impressions || 0,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };
      
      existingArray.push(performance);
      performanceStore.set(key, performance);
      performanceByPostId.set(postId, existingArray);
      return performance;
    }
  }
}

/**
 * Get performance for a post
 */
export async function getPostPerformance(postId: string, days: number = 30): Promise<ContentPerformance[]> {
  if (isSupabaseConfigured()) {
    const supabase = getSupabaseClient();
    if (!supabase) return [];

    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - days);
    const cutoffDateStr = cutoffDate.toISOString().split('T')[0];

    const { data, error } = await supabase
      .from('seo_content_performance')
      .select('*')
      .eq('post_id', postId)
      .gte('date', cutoffDateStr)
      .order('date', { ascending: false });

    if (error || !data) return [];
    return data.map(dbRowToPerformance);
  } else {
    // Fallback to in-memory
    const performances = performanceByPostId.get(postId) || [];
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - days);

    return performances
      .filter(p => new Date(p.date) >= cutoffDate)
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  }
}

/**
 * Get aggregate analytics
 */
export async function getAggregateAnalytics(days: number = 30): Promise<{
  totalViews: number;
  totalClicks: number;
  averagePosition: number;
  totalImpressions: number;
  topPerformingPosts: Array<{ postId: string; views: number; clicks: number }>;
}> {
  const allPosts = await listBlogPosts({ status: 'published', limit: 1000 });
  const cutoffDate = new Date();
  cutoffDate.setDate(cutoffDate.getDate() - days);

  if (isSupabaseConfigured()) {
    const supabase = getSupabaseClient();
    if (!supabase) {
      return { totalViews: 0, totalClicks: 0, averagePosition: 0, totalImpressions: 0, topPerformingPosts: [] };
    }

    const cutoffDateStr = cutoffDate.toISOString().split('T')[0];
    const postIds = allPosts.posts.map(p => p.id);

    if (postIds.length === 0) {
      return { totalViews: 0, totalClicks: 0, averagePosition: 0, totalImpressions: 0, topPerformingPosts: [] };
    }

    const { data, error } = await supabase
      .from('seo_content_performance')
      .select('*')
      .in('post_id', postIds)
      .gte('date', cutoffDateStr);

    if (error || !data) {
      return { totalViews: 0, totalClicks: 0, averagePosition: 0, totalImpressions: 0, topPerformingPosts: [] };
    }

    let totalViews = 0;
    let totalClicks = 0;
    let totalImpressions = 0;
    let totalPosition = 0;
    let positionCount = 0;
    const postPerformance: Record<string, { views: number; clicks: number }> = {};

    for (const perf of data) {
      totalViews += perf.organic_views || 0;
      totalClicks += perf.organic_clicks || 0;
      totalImpressions += perf.impressions || 0;

      if (perf.avg_position) {
        totalPosition += perf.avg_position;
        positionCount++;
      }

      if (!postPerformance[perf.post_id]) {
        postPerformance[perf.post_id] = { views: 0, clicks: 0 };
      }
      postPerformance[perf.post_id].views += perf.organic_views || 0;
      postPerformance[perf.post_id].clicks += perf.organic_clicks || 0;
    }

    const topPerformingPosts = Object.entries(postPerformance)
      .map(([postId, stats]) => ({ postId, ...stats }))
      .sort((a, b) => b.views - a.views)
      .slice(0, 10);

    return {
      totalViews,
      totalClicks,
      averagePosition: positionCount > 0 ? totalPosition / positionCount : 0,
      totalImpressions,
      topPerformingPosts,
    };
  } else {
    // Fallback to in-memory
    let totalViews = 0;
    let totalClicks = 0;
    let totalImpressions = 0;
    let totalPosition = 0;
    let positionCount = 0;
    const postPerformance: Record<string, { views: number; clicks: number }> = {};

    for (const post of allPosts.posts) {
      const performances = await getPostPerformance(post.id, days);
      
      for (const perf of performances) {
        totalViews += perf.organic_views;
        totalClicks += perf.organic_clicks;
        totalImpressions += perf.impressions;
        
        if (perf.avg_position) {
          totalPosition += perf.avg_position;
          positionCount++;
        }

        if (!postPerformance[post.id]) {
          postPerformance[post.id] = { views: 0, clicks: 0 };
        }
        postPerformance[post.id].views += perf.organic_views;
        postPerformance[post.id].clicks += perf.organic_clicks;
      }
    }

    const topPerformingPosts = Object.entries(postPerformance)
      .map(([postId, stats]) => ({ postId, ...stats }))
      .sort((a, b) => b.views - a.views)
      .slice(0, 10);

    return {
      totalViews,
      totalClicks,
      averagePosition: positionCount > 0 ? totalPosition / positionCount : 0,
      totalImpressions,
      topPerformingPosts,
    };
  }
}

/**
 * Get performance summary for a post
 */
export async function getPostPerformanceSummary(postId: string): Promise<{
  totalViews: number;
  totalClicks: number;
  averagePosition?: number;
  clickThroughRate: number;
  trend: 'up' | 'down' | 'stable';
}> {
  const performances = await getPostPerformance(postId, 30);
  
  if (performances.length === 0) {
    return {
      totalViews: 0,
      totalClicks: 0,
      clickThroughRate: 0,
      trend: 'stable',
    };
  }

  const totalViews = performances.reduce((sum, p) => sum + p.organic_views, 0);
  const totalClicks = performances.reduce((sum, p) => sum + p.organic_clicks, 0);
  const totalImpressions = performances.reduce((sum, p) => sum + p.impressions, 0);
  const avgPosition = performances
    .filter(p => p.avg_position)
    .reduce((sum, p, _, arr) => sum + (p.avg_position || 0) / arr.length, 0);

  const clickThroughRate = totalImpressions > 0 ? (totalClicks / totalImpressions) * 100 : 0;

  // Determine trend (compare first half vs second half of period)
  const midPoint = Math.floor(performances.length / 2);
  const firstHalf = performances.slice(0, midPoint);
  const secondHalf = performances.slice(midPoint);

  const firstHalfViews = firstHalf.reduce((sum, p) => sum + p.organic_views, 0);
  const secondHalfViews = secondHalf.reduce((sum, p) => sum + p.organic_views, 0);

  let trend: 'up' | 'down' | 'stable' = 'stable';
  if (secondHalfViews > firstHalfViews * 1.1) trend = 'up';
  else if (secondHalfViews < firstHalfViews * 0.9) trend = 'down';

  return {
    totalViews,
    totalClicks,
    averagePosition: avgPosition > 0 ? avgPosition : undefined,
    clickThroughRate,
    trend,
  };
}

/**
 * Analyze SEO impact - which posts are helping SEO and organic traffic
 */
export async function analyzeSEOImpact(days: number = 30): Promise<{
  overallImpact: {
    totalOrganicTraffic: number;
    totalImpressions: number;
    averagePosition: number;
    clickThroughRate: number;
    trend: 'improving' | 'declining' | 'stable';
  };
  topPerformers: Array<{
    postId: string;
    title: string;
    slug: string;
    views: number;
    clicks: number;
    impressions: number;
    avgPosition?: number;
    ctr: number;
    trend: 'up' | 'down' | 'stable';
    seoScore?: number;
    publishedAt?: string;
    impactScore: number; // Calculated score based on multiple factors
  }>;
  underperformers: Array<{
    postId: string;
    title: string;
    slug: string;
    views: number;
    clicks: number;
    impressions: number;
    seoScore?: number;
    publishedAt?: string;
    recommendations: string[];
  }>;
  insights: {
    bestPerformingCategory?: string;
    bestPerformingTags?: string[];
    averageDaysToFirstTraffic?: number;
    postsHelpingSEO: number;
    postsNeedingImprovement: number;
  };
}> {
  const allPosts = await listBlogPosts({ status: 'published', limit: 1000 });
  const cutoffDate = new Date();
  cutoffDate.setDate(cutoffDate.getDate() - days);

  // Get performance for all posts
  const postAnalyses = await Promise.all(
    allPosts.posts.map(async (post) => {
      const performance = await getPostPerformance(post.id, days);
      const summary = await getPostPerformanceSummary(post.id);
      
      const totalImpressions = performance.reduce((sum, p) => sum + (p.impressions || 0), 0);
      const avgPosition = performance
        .filter(p => p.avg_position)
        .reduce((sum, p, _, arr) => sum + (p.avg_position || 0) / arr.length, 0) || undefined;

      // Calculate impact score (weighted combination of metrics)
      // Higher views, clicks, better position = higher score
      const impactScore = 
        (summary.totalViews * 0.3) +
        (summary.totalClicks * 0.5) +
        (avgPosition ? (100 - avgPosition) * 10 : 0) + // Better position = higher score
        (summary.clickThroughRate * 100) +
        ((post.seo_score || 0) * 0.2);

      return {
        postId: post.id,
        title: post.title,
        slug: post.slug,
        views: summary.totalViews,
        clicks: summary.totalClicks,
        impressions: totalImpressions,
        avgPosition,
        ctr: summary.clickThroughRate,
        trend: summary.trend,
        seoScore: post.seo_score,
        publishedAt: post.published_at,
        impactScore,
        category: post.category,
        tags: post.tags || [],
      };
    })
  );

  // Sort by impact score
  postAnalyses.sort((a, b) => b.impactScore - a.impactScore);

  // Calculate overall metrics
  const totalViews = postAnalyses.reduce((sum, p) => sum + p.views, 0);
  const totalClicks = postAnalyses.reduce((sum, p) => sum + p.clicks, 0);
  const totalImpressions = postAnalyses.reduce((sum, p) => sum + p.impressions, 0);
  const avgPosition = postAnalyses
    .filter(p => p.avgPosition)
    .reduce((sum, p, _, arr) => sum + (p.avgPosition || 0) / arr.length, 0);
  const overallCTR = totalImpressions > 0 ? (totalClicks / totalImpressions) * 100 : 0;

  // Determine overall trend
  const postsWithTrend = postAnalyses.filter(p => p.trend !== 'stable');
  const upTrends = postsWithTrend.filter(p => p.trend === 'up').length;
  const downTrends = postsWithTrend.filter(p => p.trend === 'down').length;
  let overallTrend: 'improving' | 'declining' | 'stable' = 'stable';
  if (upTrends > downTrends * 1.5) overallTrend = 'improving';
  else if (downTrends > upTrends * 1.5) overallTrend = 'declining';

  // Top performers (top 10)
  const topPerformers = postAnalyses.slice(0, 10).map(p => ({
    postId: p.postId,
    title: p.title,
    slug: p.slug,
    views: p.views,
    clicks: p.clicks,
    impressions: p.impressions,
    avgPosition: p.avgPosition,
    ctr: p.ctr,
    trend: p.trend,
    seoScore: p.seoScore,
    publishedAt: p.publishedAt,
    impactScore: Math.round(p.impactScore),
  }));

  // Underperformers (bottom 10 with some traffic but low performance)
  const underperformers = postAnalyses
    .filter(p => p.impressions > 0 && p.views < 10 && p.clicks < 2)
    .slice(0, 10)
    .map(p => {
      const recommendations: string[] = [];
      if (!p.seoScore || p.seoScore < 70) {
        recommendations.push('Improve SEO score (currently ' + (p.seoScore || 0) + ')');
      }
      if (p.avgPosition && p.avgPosition > 50) {
        recommendations.push('Optimize for better search rankings (currently position ' + Math.round(p.avgPosition) + ')');
      }
      if (p.ctr < 1) {
        recommendations.push('Improve title and meta description to increase click-through rate');
      }
      if (p.views === 0) {
        recommendations.push('Promote this post to increase visibility');
      }
      if (recommendations.length === 0) {
        recommendations.push('Monitor performance and consider updating content');
      }

      return {
        postId: p.postId,
        title: p.title,
        slug: p.slug,
        views: p.views,
        clicks: p.clicks,
        impressions: p.impressions,
        seoScore: p.seoScore,
        publishedAt: p.publishedAt,
        recommendations,
      };
    });

  // Calculate insights
  const categoryPerformance: Record<string, { views: number; count: number }> = {};
  const tagPerformance: Record<string, { views: number; count: number }> = {};

  postAnalyses.forEach(p => {
    if (p.category) {
      if (!categoryPerformance[p.category]) {
        categoryPerformance[p.category] = { views: 0, count: 0 };
      }
      categoryPerformance[p.category].views += p.views;
      categoryPerformance[p.category].count += 1;
    }
    (p.tags || []).forEach(tag => {
      if (!tagPerformance[tag]) {
        tagPerformance[tag] = { views: 0, count: 0 };
      }
      tagPerformance[tag].views += p.views;
      tagPerformance[tag].count += 1;
    });
  });

  const bestCategory = Object.entries(categoryPerformance)
    .sort((a, b) => (b[1].views / b[1].count) - (a[1].views / a[1].count))[0]?.[0];

  const bestTags = Object.entries(tagPerformance)
    .sort((a, b) => (b[1].views / b[1].count) - (a[1].views / a[1].count))
    .slice(0, 5)
    .map(([tag]) => tag);

  // Calculate average days to first traffic
  const postsWithTraffic = postAnalyses.filter(p => p.views > 0 && p.publishedAt);
  let totalDaysToTraffic = 0;
  let postsWithDaysData = 0;

  // This would require tracking when first traffic occurred, simplified here
  // In a real implementation, you'd track the first performance record date

  const postsHelpingSEO = postAnalyses.filter(p => 
    p.views > 50 || p.clicks > 5 || (p.avgPosition && p.avgPosition <= 20)
  ).length;

  const postsNeedingImprovement = underperformers.length;

  return {
    overallImpact: {
      totalOrganicTraffic: totalViews,
      totalImpressions,
      averagePosition: avgPosition > 0 ? avgPosition : 0,
      clickThroughRate: overallCTR,
      trend: overallTrend,
    },
    topPerformers,
    underperformers,
    insights: {
      bestPerformingCategory: bestCategory,
      bestPerformingTags: bestTags,
      averageDaysToFirstTraffic: postsWithDaysData > 0 ? totalDaysToTraffic / postsWithDaysData : undefined,
      postsHelpingSEO,
      postsNeedingImprovement,
    },
  };
}