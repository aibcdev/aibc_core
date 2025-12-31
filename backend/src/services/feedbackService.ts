/**
 * Feedback Service
 * Tracks content performance, collects user feedback, and enables continuous improvement
 */

import * as fs from 'fs';
import * as path from 'path';

export interface FeedbackData {
  id?: string;
  contentId: string;
  contentType: 'media' | 'think' | 'research' | 'review' | 'browser' | 'content-idea' | 'blog-post';
  success: boolean;
  quality?: number; // 0-1 score
  userFeedback?: 'approved' | 'rejected' | 'modified';
  metadata?: Record<string, any>;
  timestamp: string;
  username?: string;
  workflowType?: string;
}

export interface FeedbackStats {
  totalFeedback: number;
  approvalRate: number;
  averageQuality: number;
  contentTypeStats: Record<string, {
    count: number;
    approvalRate: number;
    averageQuality: number;
  }>;
}

// In-memory storage (can be migrated to database)
const feedbackStorage: FeedbackData[] = [];
const feedbackFilePath = path.join(__dirname, '../../.feedback-data.json');

/**
 * Load feedback from file
 */
function loadFeedback(): void {
  try {
    if (fs.existsSync(feedbackFilePath)) {
      const data = fs.readFileSync(feedbackFilePath, 'utf8');
      const parsed = JSON.parse(data);
      feedbackStorage.length = 0;
      feedbackStorage.push(...(Array.isArray(parsed) ? parsed : []));
    }
  } catch (error: any) {
    console.warn('[Feedback Service] Error loading feedback:', error.message);
  }
}

/**
 * Save feedback to file
 */
function saveFeedback(): void {
  try {
    fs.writeFileSync(feedbackFilePath, JSON.stringify(feedbackStorage, null, 2));
  } catch (error: any) {
    console.warn('[Feedback Service] Error saving feedback:', error.message);
  }
}

// Load on startup
loadFeedback();

/**
 * Add feedback
 */
export function addFeedback(feedback: FeedbackData): void {
  const feedbackWithId: FeedbackData = {
    ...feedback,
    id: feedback.id || `feedback-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
    timestamp: feedback.timestamp || new Date().toISOString(),
  };

  feedbackStorage.push(feedbackWithId);
  saveFeedback();

  console.log(`[Feedback Service] Added feedback: ${feedbackWithId.id} for ${feedbackWithId.contentId}`);
}

/**
 * Get feedback for specific content
 */
export function getFeedbackForContent(contentId: string): FeedbackData[] {
  return feedbackStorage.filter(f => f.contentId === contentId);
}

/**
 * Get feedback by type
 */
export function getFeedbackByType(contentType: FeedbackData['contentType']): FeedbackData[] {
  return feedbackStorage.filter(f => f.contentType === contentType);
}

/**
 * Get feedback statistics
 */
export function getFeedbackStats(username?: string, workflowType?: string): FeedbackStats {
  let filtered = feedbackStorage;

  if (username) {
    filtered = filtered.filter(f => f.username === username);
  }

  if (workflowType) {
    filtered = filtered.filter(f => f.workflowType === workflowType);
  }

  const total = filtered.length;
  const approved = filtered.filter(f => f.userFeedback === 'approved').length;
  const rejected = filtered.filter(f => f.userFeedback === 'rejected').length;
  const withQuality = filtered.filter(f => f.quality !== undefined);
  const averageQuality = withQuality.length > 0
    ? withQuality.reduce((sum, f) => sum + (f.quality || 0), 0) / withQuality.length
    : 0;

  const approvalRate = total > 0 ? approved / total : 0;

  // Group by content type
  const contentTypeStats: Record<string, {
    count: number;
    approvalRate: number;
    averageQuality: number;
  }> = {};

  const typeGroups = new Map<string, FeedbackData[]>();
  filtered.forEach(f => {
    if (!typeGroups.has(f.contentType)) {
      typeGroups.set(f.contentType, []);
    }
    typeGroups.get(f.contentType)!.push(f);
  });

  typeGroups.forEach((items, type) => {
    const typeApproved = items.filter(f => f.userFeedback === 'approved').length;
    const typeWithQuality = items.filter(f => f.quality !== undefined);
    const typeAvgQuality = typeWithQuality.length > 0
      ? typeWithQuality.reduce((sum, f) => sum + (f.quality || 0), 0) / typeWithQuality.length
      : 0;

    contentTypeStats[type] = {
      count: items.length,
      approvalRate: items.length > 0 ? typeApproved / items.length : 0,
      averageQuality: typeAvgQuality,
    };
  });

  return {
    totalFeedback: total,
    approvalRate,
    averageQuality,
    contentTypeStats,
  };
}

/**
 * Get recent feedback
 */
export function getRecentFeedback(limit: number = 50): FeedbackData[] {
  return feedbackStorage
    .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
    .slice(0, limit);
}

/**
 * Update feedback
 */
export function updateFeedback(feedbackId: string, updates: Partial<FeedbackData>): boolean {
  const index = feedbackStorage.findIndex(f => f.id === feedbackId);
  if (index === -1) {
    return false;
  }

  feedbackStorage[index] = {
    ...feedbackStorage[index],
    ...updates,
  };
  saveFeedback();

  return true;
}

/**
 * Get learning insights from feedback
 */
export function getLearningInsights(username?: string): {
  successfulPatterns: string[];
  failedPatterns: string[];
  recommendations: string[];
} {
  const filtered = username
    ? feedbackStorage.filter(f => f.username === username)
    : feedbackStorage;

  const successful = filtered.filter(f => f.success && (f.userFeedback === 'approved' || (f.quality && f.quality > 0.7)));
  const failed = filtered.filter(f => !f.success || f.userFeedback === 'rejected' || (f.quality && f.quality < 0.5));

  // Extract patterns from successful feedback
  const successfulPatterns: string[] = [];
  successful.forEach(f => {
    if (f.metadata?.task) {
      successfulPatterns.push(`Task "${f.metadata.task}" performed well`);
    }
    if (f.metadata?.workflowType) {
      successfulPatterns.push(`Workflow "${f.metadata.workflowType}" generated good results`);
    }
  });

  // Extract patterns from failed feedback
  const failedPatterns: string[] = [];
  failed.forEach(f => {
    if (f.metadata?.task) {
      failedPatterns.push(`Task "${f.metadata.task}" needs improvement`);
    }
    if (f.error) {
      failedPatterns.push(`Error: ${f.error}`);
    }
  });

  // Generate recommendations
  const recommendations: string[] = [];
  
  const stats = getFeedbackStats(username);
  if (stats.approvalRate < 0.5) {
    recommendations.push('Content approval rate is below 50%. Consider improving content quality or alignment with brand voice.');
  }

  if (stats.averageQuality < 0.6) {
    recommendations.push('Average content quality is low. Review content generation prompts and brand DNA extraction.');
  }

  const lowPerformingTypes = Object.entries(stats.contentTypeStats)
    .filter(([_, stat]) => stat.approvalRate < 0.5 || stat.averageQuality < 0.6)
    .map(([type, _]) => type);

  if (lowPerformingTypes.length > 0) {
    recommendations.push(`Content types needing improvement: ${lowPerformingTypes.join(', ')}`);
  }

  return {
    successfulPatterns: Array.from(new Set(successfulPatterns)),
    failedPatterns: Array.from(new Set(failedPatterns)),
    recommendations,
  };
}

/**
 * Clear old feedback (cleanup)
 */
export function clearOldFeedback(olderThanDays: number = 90): void {
  const cutoff = Date.now() - olderThanDays * 24 * 60 * 60 * 1000;
  const initialLength = feedbackStorage.length;

  const filtered = feedbackStorage.filter(f => {
    const timestamp = new Date(f.timestamp).getTime();
    return timestamp >= cutoff;
  });

  feedbackStorage.length = 0;
  feedbackStorage.push(...filtered);
  saveFeedback();

  console.log(`[Feedback Service] Cleared ${initialLength - feedbackStorage.length} old feedback entries`);
}

