/**
 * Blog Auto-Publishing Scheduler
 * Publishes 1 blog post every day at 9 AM
 */

import { getSupabaseClient, isSupabaseConfigured } from '../lib/supabase';

/**
 * Publish the next scheduled blog post
 * Should be called daily at 9 AM via Cloud Scheduler or cron
 */
export async function publishScheduledPost(): Promise<{ success: boolean; post?: any; error?: string }> {
  if (!isSupabaseConfigured()) {
    return { success: false, error: 'Supabase not configured' };
  }

  try {
    const supabase = getSupabaseClient();
    if (!supabase) {
      return { success: false, error: 'Supabase not configured' };
    }
    
    // Find the next draft post to publish (oldest first)
    const { data: draftPost, error: fetchError } = await supabase
      .from('seo_blog_posts')
      .select('*')
      .eq('status', 'draft')
      .order('created_at', { ascending: true })
      .limit(1)
      .single();

    if (fetchError || !draftPost) {
      console.log('[BLOG SCHEDULER] No draft posts available to publish');
      return { success: false, error: 'No draft posts available' };
    }

    // Update post to published
    const now = new Date().toISOString();
    const { data: updatedPost, error: updateError } = await supabase
      .from('seo_blog_posts')
      .update({
        status: 'published',
        published_at: now,
        updated_at: now
      })
      .eq('id', draftPost.id)
      .select()
      .single();

    if (updateError) {
      console.error('[BLOG SCHEDULER] Error publishing post:', updateError);
      return { success: false, error: updateError.message };
    }

    console.log(`[BLOG SCHEDULER] ✅ Published post: "${updatedPost.title}" at ${now}`);
    return { success: true, post: updatedPost };
  } catch (error: any) {
    console.error('[BLOG SCHEDULER] Error in publishScheduledPost:', error);
    return { success: false, error: error.message };
  }
}

/**
 * Get next scheduled publish time and post count
 */
export async function getSchedulerStatus(): Promise<{
  nextPublishTime: string;
  draftCount: number;
  publishedCount: number;
}> {
  if (!isSupabaseConfigured()) {
    return {
      nextPublishTime: 'Not configured',
      draftCount: 0,
      publishedCount: 0
    };
  }

  try {
    const supabase = getSupabaseClient();
    if (!supabase) {
      return {
        nextPublishTime: 'Not configured',
        draftCount: 0,
        publishedCount: 0
      };
    }
    
    // Get draft count
    const { count: draftCount } = await supabase
      .from('seo_blog_posts')
      .select('*', { count: 'exact', head: true })
      .eq('status', 'draft');

    // Get published count
    const { count: publishedCount } = await supabase
      .from('seo_blog_posts')
      .select('*', { count: 'exact', head: true })
      .eq('status', 'published');

    // Calculate next publish time (9 AM today or tomorrow)
    const now = new Date();
    const nextPublish = new Date();
    nextPublish.setHours(9, 0, 0, 0);
    if (now >= nextPublish) {
      nextPublish.setDate(nextPublish.getDate() + 1);
    }

    return {
      nextPublishTime: nextPublish.toISOString(),
      draftCount: draftCount || 0,
      publishedCount: publishedCount || 0
    };
  } catch (error: any) {
    console.error('[BLOG SCHEDULER] Error getting status:', error);
    return {
      nextPublishTime: 'Error',
      draftCount: 0,
      publishedCount: 0
    };
  }
}

