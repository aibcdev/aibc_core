/**
 * Continuous Learning & Improvement Service
 * 
 * This service implements machine learning and continuous improvement for the digital scan.
 * It learns from:
 * - User interactions (approvals, edits, regenerations, dismissals)
 * - Content performance metrics
 * - Scan quality feedback
 * - Brand DNA accuracy improvements
 * - Content generation success rates
 */

import { getSupabaseClient, isSupabaseConfigured } from '../lib/supabase';

export interface UserFeedback {
  scanId: string;
  username: string;
  feedbackType: 'approval' | 'edit' | 'regeneration' | 'dismissal' | 'rating' | 'custom';
  contentId?: string;
  contentTitle?: string;
  rating?: number; // 1-5 scale
  comment?: string;
  metadata?: {
    originalContent?: string;
    editedContent?: string;
    reason?: string;
    platform?: string;
    contentType?: string;
  };
  timestamp: string;
}

export interface ScanQualityMetrics {
  scanId: string;
  username: string;
  extractionConfidence: number;
  brandDNAAccuracy?: number; // User-rated accuracy
  contentIdeasCount: number;
  contentIdeasApproved: number;
  contentIdeasEdited: number;
  contentIdeasDismissed: number;
  averageRating: number;
  timestamp: string;
}

export interface LearningInsight {
  id: string;
  category: 'prompt_optimization' | 'extraction_improvement' | 'content_generation' | 'brand_dna' | 'platform_specific';
  insight: string;
  recommendation: string;
  confidence: number; // 0-1
  evidence: {
    sampleSize: number;
    successRate: number;
    examples: string[];
  };
  applied: boolean;
  appliedAt?: string;
  createdAt: string;
}

export interface PromptVersion {
  id: string;
  category: 'content_generation' | 'brand_identity' | 'competitor_analysis' | 'dna_extraction';
  version: number;
  prompt: string;
  systemPrompt?: string;
  performance: {
    averageRating: number;
    approvalRate: number;
    usageCount: number;
  };
  isActive: boolean;
  createdAt: string;
  appliedAt?: string;
}

/**
 * Track user feedback for learning
 */
export async function trackUserFeedback(feedback: UserFeedback): Promise<void> {
  if (!isSupabaseConfigured()) {
    console.warn('[LEARNING] Supabase not configured - feedback not persisted');
    // Store in memory for now
    return;
  }

  try {
    const supabase = getSupabaseClient();
    if (!supabase) { return; }
    const { error } = await supabase
      .from('user_feedback')
      .insert({
        scan_id: feedback.scanId,
        username: feedback.username,
        feedback_type: feedback.feedbackType,
        content_id: feedback.contentId,
        content_title: feedback.contentTitle,
        rating: feedback.rating,
        comment: feedback.comment,
        metadata: feedback.metadata,
        timestamp: feedback.timestamp || new Date().toISOString()
      });

    if (error) {
      console.error('[LEARNING] Error tracking feedback:', error);
    } else {
      console.log(`[LEARNING] ✅ Feedback tracked: ${feedback.feedbackType} for ${feedback.username}`);
      
      // Trigger learning analysis if we have enough data
      await analyzeFeedbackPatterns(feedback.username);
    }
  } catch (error: any) {
    console.error('[LEARNING] Error in trackUserFeedback:', error);
  }
}

/**
 * Track scan quality metrics
 */
export async function trackScanQuality(metrics: ScanQualityMetrics): Promise<void> {
  if (!isSupabaseConfigured()) {
    console.warn('[LEARNING] Supabase not configured - metrics not persisted');
    return;
  }

  try {
    const supabase = getSupabaseClient();
    if (!supabase) { return; }
    const { error } = await supabase
      .from('scan_quality_metrics')
      .insert({
        scan_id: metrics.scanId,
        username: metrics.username,
        extraction_confidence: metrics.extractionConfidence,
        brand_dna_accuracy: metrics.brandDNAAccuracy,
        content_ideas_count: metrics.contentIdeasCount,
        content_ideas_approved: metrics.contentIdeasApproved,
        content_ideas_edited: metrics.contentIdeasEdited,
        content_ideas_dismissed: metrics.contentIdeasDismissed,
        average_rating: metrics.averageRating,
        timestamp: metrics.timestamp || new Date().toISOString()
      });

    if (error) {
      console.error('[LEARNING] Error tracking scan quality:', error);
    } else {
      console.log(`[LEARNING] ✅ Scan quality tracked for ${metrics.username}`);
    }
  } catch (error: any) {
    console.error('[LEARNING] Error in trackScanQuality:', error);
  }
}

/**
 * Analyze feedback patterns to generate learning insights
 */
async function analyzeFeedbackPatterns(username?: string): Promise<LearningInsight[]> {
  if (!isSupabaseConfigured()) {
    return [];
  }

  try {
    const supabase = getSupabaseClient();
    if (!supabase) { return []; }
    
    // Get recent feedback (last 100 entries)
    let query = supabase
      .from('user_feedback')
      .select('*')
      .order('timestamp', { ascending: false })
      .limit(100);

    if (username) {
      query = query.eq('username', username);
    }

    const { data: feedback, error } = await query;

    if (error || !feedback || feedback.length < 10) {
      // Need at least 10 data points for meaningful analysis
      return [];
    }

    const insights: LearningInsight[] = [];

    // Analyze approval rates by content type
    const byContentType = feedback.reduce((acc: any, f: any) => {
      const type = f.metadata?.contentType || 'unknown';
      if (!acc[type]) {
        acc[type] = { approvals: 0, total: 0, edits: 0, dismissals: 0 };
      }
      if (f.feedback_type === 'approval') acc[type].approvals++;
      if (f.feedback_type === 'edit') acc[type].edits++;
      if (f.feedback_type === 'dismissal') acc[type].dismissals++;
      acc[type].total++;
      return acc;
    }, {});

    // Generate insights for low-performing content types
    Object.entries(byContentType).forEach(([type, stats]: [string, any]) => {
      const approvalRate = stats.approvals / stats.total;
      const dismissalRate = stats.dismissals / stats.total;
      
      if (dismissalRate > 0.3 && stats.total >= 5) {
        insights.push({
          id: `insight_${Date.now()}_${type}`,
          category: 'content_generation',
          insight: `${type} content has ${(dismissalRate * 100).toFixed(0)}% dismissal rate`,
          recommendation: `Improve ${type} content generation by analyzing dismissed examples and refining prompts`,
          confidence: Math.min(0.9, stats.total / 20),
          evidence: {
            sampleSize: stats.total,
            successRate: approvalRate,
            examples: feedback
              .filter((f: any) => f.metadata?.contentType === type && f.feedback_type === 'dismissal')
              .slice(0, 3)
              .map((f: any) => f.contentTitle || 'N/A')
          },
          applied: false,
          createdAt: new Date().toISOString()
        });
      }
    });

    // Analyze rating patterns
    const ratings = feedback.filter((f: any) => f.rating).map((f: any) => f.rating);
    if (ratings.length >= 10) {
      const avgRating = ratings.reduce((a: number, b: number) => a + b, 0) / ratings.length;
      if (avgRating < 3.5) {
        insights.push({
          id: `insight_${Date.now()}_ratings`,
          category: 'content_generation',
          insight: `Average content rating is ${avgRating.toFixed(1)}/5 - below target`,
          recommendation: 'Review low-rated content to identify common issues and refine generation prompts',
          confidence: Math.min(0.9, ratings.length / 30),
          evidence: {
            sampleSize: ratings.length,
            successRate: avgRating / 5,
            examples: feedback
              .filter((f: any) => f.rating && f.rating <= 2)
              .slice(0, 3)
              .map((f: any) => f.contentTitle || 'N/A')
          },
          applied: false,
          createdAt: new Date().toISOString()
        });
      }
    }

    // Save insights
    if (insights.length > 0) {
      await saveLearningInsights(insights);
    }

    return insights;
  } catch (error: any) {
    console.error('[LEARNING] Error analyzing feedback patterns:', error);
    return [];
  }
}

/**
 * Save learning insights
 */
async function saveLearningInsights(insights: LearningInsight[]): Promise<void> {
  if (!isSupabaseConfigured()) {
    return;
  }

  try {
    const supabase = getSupabaseClient();
    if (!supabase) { return; }
    const { error } = await supabase
      .from('learning_insights')
      .insert(insights.map(insight => ({
        id: insight.id,
        category: insight.category,
        insight: insight.insight,
        recommendation: insight.recommendation,
        confidence: insight.confidence,
        evidence: insight.evidence,
        applied: insight.applied,
        applied_at: insight.appliedAt,
        created_at: insight.createdAt
      })));

    if (error) {
      console.error('[LEARNING] Error saving insights:', error);
    } else {
      console.log(`[LEARNING] ✅ Saved ${insights.length} learning insights`);
    }
  } catch (error: any) {
    console.error('[LEARNING] Error in saveLearningInsights:', error);
  }
}

/**
 * Get active learning insights
 */
export async function getActiveInsights(limit: number = 10): Promise<LearningInsight[]> {
  if (!isSupabaseConfigured()) {
    return [];
  }

  try {
    const supabase = getSupabaseClient();
    if (!supabase) { return []; }
    const { data, error } = await supabase
      .from('learning_insights')
      .select('*')
      .eq('applied', false)
      .order('confidence', { ascending: false })
      .order('created_at', { ascending: false })
      .limit(limit);

    if (error) {
      console.error('[LEARNING] Error fetching insights:', error);
      return [];
    }

    return (data || []).map((row: any) => ({
      id: row.id,
      category: row.category,
      insight: row.insight,
      recommendation: row.recommendation,
      confidence: row.confidence,
      evidence: row.evidence,
      applied: row.applied,
      appliedAt: row.applied_at,
      createdAt: row.created_at
    }));
  } catch (error: any) {
    console.error('[LEARNING] Error in getActiveInsights:', error);
    return [];
  }
}

/**
 * Apply a learning insight (mark as applied and update system)
 */
export async function applyInsight(insightId: string): Promise<boolean> {
  if (!isSupabaseConfigured()) {
    return false;
  }

  try {
    const supabase = getSupabaseClient();
    if (!supabase) { return false; }
    const { error } = await supabase
      .from('learning_insights')
      .update({
        applied: true,
        applied_at: new Date().toISOString()
      })
      .eq('id', insightId);

    if (error) {
      console.error('[LEARNING] Error applying insight:', error);
      return false;
    }

    console.log(`[LEARNING] ✅ Applied insight: ${insightId}`);
    return true;
  } catch (error: any) {
    console.error('[LEARNING] Error in applyInsight:', error);
    return false;
  }
}

/**
 * Get the active prompt version for a category
 */
export async function getActivePrompt(category: string): Promise<PromptVersion | null> {
  if (!isSupabaseConfigured()) {
    return null;
  }

  try {
    const supabase = getSupabaseClient();
    if (!supabase) { return null; }
    const { data, error } = await supabase
      .from('prompt_versions')
      .select('*')
      .eq('category', category)
      .eq('is_active', true)
      .order('version', { ascending: false })
      .limit(1)
      .single();

    if (error || !data) {
      // No active version found - return null to use default
      return null;
    }

    return {
      id: data.id,
      category: data.category,
      version: data.version,
      prompt: data.prompt,
      systemPrompt: data.system_prompt,
      performance: data.performance,
      isActive: data.is_active,
      createdAt: data.created_at,
      appliedAt: data.applied_at
    };
  } catch (error: any) {
    console.error('[LEARNING] Error fetching active prompt:', error);
    return null;
  }
}

/**
 * Get prompt version history and performance
 */
export async function getPromptVersions(category: string): Promise<PromptVersion[]> {
  if (!isSupabaseConfigured()) {
    return [];
  }

  try {
    const supabase = getSupabaseClient();
    if (!supabase) { return []; }
    const { data, error } = await supabase
      .from('prompt_versions')
      .select('*')
      .eq('category', category)
      .order('version', { ascending: false })
      .limit(10);

    if (error) {
      console.error('[LEARNING] Error fetching prompt versions:', error);
      return [];
    }

    return (data || []).map((row: any) => ({
      id: row.id,
      category: row.category,
      version: row.version,
      prompt: row.prompt,
      systemPrompt: row.system_prompt,
      performance: row.performance,
      isActive: row.is_active,
      createdAt: row.created_at,
      appliedAt: row.applied_at
    }));
  } catch (error: any) {
    console.error('[LEARNING] Error in getPromptVersions:', error);
    return [];
  }
}

/**
 * Create a new prompt version based on learning insights
 */
export async function createPromptVersion(
  category: string,
  prompt: string,
  systemPrompt?: string,
  basedOnInsightId?: string
): Promise<PromptVersion | null> {
  if (!isSupabaseConfigured()) {
    return null;
  }

  try {
    const supabase = getSupabaseClient();
    if (!supabase) { 
      throw new Error('Supabase not configured');
    }
    
    // Get current version number
    const { data: currentVersions } = await supabase
      .from('prompt_versions')
      .select('version')
      .eq('category', category)
      .order('version', { ascending: false })
      .limit(1);

    const nextVersion = currentVersions && currentVersions.length > 0
      ? currentVersions[0].version + 1
      : 1;

    // Deactivate old versions
    await supabase
      .from('prompt_versions')
      .update({ is_active: false })
      .eq('category', category)
      .eq('is_active', true);

    // Create new version
    const newVersion: PromptVersion = {
      id: `prompt_${category}_v${nextVersion}_${Date.now()}`,
      category: category as any,
      version: nextVersion,
      prompt,
      systemPrompt,
      performance: {
        averageRating: 0,
        approvalRate: 0,
        usageCount: 0
      },
      isActive: true,
      createdAt: new Date().toISOString()
    };

    const { error } = await supabase
      .from('prompt_versions')
      .insert({
        id: newVersion.id,
        category: newVersion.category,
        version: newVersion.version,
        prompt: newVersion.prompt,
        system_prompt: newVersion.systemPrompt,
        performance: newVersion.performance,
        is_active: newVersion.isActive,
        created_at: newVersion.createdAt,
        based_on_insight_id: basedOnInsightId
      });

    if (error) {
      console.error('[LEARNING] Error creating prompt version:', error);
      return null;
    }

    console.log(`[LEARNING] ✅ Created prompt version ${nextVersion} for ${category}`);
    return newVersion;
  } catch (error: any) {
    console.error('[LEARNING] Error in createPromptVersion:', error);
    return null;
  }
}

/**
 * Update prompt performance metrics
 */
export async function updatePromptPerformance(
  promptId: string,
  rating: number,
  approved: boolean
): Promise<void> {
  if (!isSupabaseConfigured()) {
    return;
  }

  try {
    const supabase = getSupabaseClient();
    if (!supabase) { return; }
    
    // Get current performance
    const { data: current } = await supabase
      .from('prompt_versions')
      .select('performance, usage_count')
      .eq('id', promptId)
      .single();

    if (!current) return;

    const performance = current.performance || {
      averageRating: 0,
      approvalRate: 0,
      usageCount: 0
    };

    // Update metrics
    const newUsageCount = (current.usage_count || 0) + 1;
    const newAvgRating = ((performance.averageRating * performance.usageCount) + rating) / newUsageCount;
    const newApprovalRate = approved
      ? ((performance.approvalRate * performance.usageCount) + 1) / newUsageCount
      : (performance.approvalRate * performance.usageCount) / newUsageCount;

    await supabase
      .from('prompt_versions')
      .update({
        performance: {
          averageRating: newAvgRating,
          approvalRate: newApprovalRate,
          usageCount: newUsageCount
        },
        usage_count: newUsageCount
      })
      .eq('id', promptId);

    console.log(`[LEARNING] ✅ Updated performance for prompt ${promptId}`);
  } catch (error: any) {
    console.error('[LEARNING] Error updating prompt performance:', error);
  }
}

/**
 * Daily learning analysis job
 * Analyzes all feedback and generates insights
 */
export async function runDailyLearningAnalysis(): Promise<LearningInsight[]> {
  console.log('[LEARNING] 🔄 Running daily learning analysis...');
  
  const insights = await analyzeFeedbackPatterns();
  
  // Get insights by category and apply high-confidence ones automatically
  const highConfidenceInsights = insights.filter(i => i.confidence > 0.8);
  
  for (const insight of highConfidenceInsights) {
    console.log(`[LEARNING] 🤖 Auto-applying high-confidence insight: ${insight.insight}`);
    await applyInsight(insight.id);
    
    // If it's a prompt optimization insight, create a new prompt version
    if (insight.category === 'prompt_optimization' || insight.category === 'content_generation') {
      // This would trigger prompt refinement - implementation depends on specific insight
      console.log(`[LEARNING] 💡 Insight suggests prompt optimization - manual review recommended`);
    }
  }
  
  console.log(`[LEARNING] ✅ Daily analysis complete: ${insights.length} insights, ${highConfidenceInsights.length} auto-applied`);
  return insights;
}

