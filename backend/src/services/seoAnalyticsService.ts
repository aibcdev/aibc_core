/**
 * SEO Analytics Service - Track rankings, traffic, and performance
 */

import { ContentPerformance, BlogPost } from '../../../types/seo';
import { listBlogPosts } from './seoContentService';

// In-memory storage (will migrate to database)
const performanceStore: Map<string, ContentPerformance[]> = new Map();

/**
 * Record content performance metrics
 */
export async function recordPerformance(
  postId: string,
  metrics: Partial<ContentPerformance>
): Promise<ContentPerformance> {
  const date = metrics.date || new Date().toISOString().split('T')[0];
  const key = `${postId}_${date}`;

  const existing = performanceStore.get(key);
  const existingArray = performanceStore.get(postId) || [];

  if (existing) {
    // Update existing
    const updated: ContentPerformance = {
      ...existing,
      ...metrics,
      date,
      updated_at: new Date().toISOString(),
    };
    existingArray[existingArray.findIndex(p => p.id === existing.id)] = updated;
    performanceStore.set(key, updated);
    performanceStore.set(postId, existingArray);
    return updated;
  } else {
    // Create new
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
    performanceStore.set(postId, existingArray);
    return performance;
  }
}

/**
 * Get performance for a post
 */
export async function getPostPerformance(postId: string, days: number = 30): Promise<ContentPerformance[]> {
  const performances = performanceStore.get(postId) || [];
  const cutoffDate = new Date();
  cutoffDate.setDate(cutoffDate.getDate() - days);

  return performances
    .filter(p => new Date(p.date) >= cutoffDate)
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
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

