/**
 * Content Pipeline Service - End-to-end content generation and publishing workflow
 */

import { getNextKeywordToTarget } from './keywordService';
import { generateBlogPost } from './contentGeneratorService';
import { ContentGenerationRequest } from '../types/seo';
import { injectInternalLinks, updatePostWithInternalLinks } from './internalLinkingService';
import { analyzeContentSEO } from './contentOptimizationService';
import { updateBlogPost, getBlogPostById } from './seoContentService';
import { recordPerformance } from './seoAnalyticsService';
import { getHolidayKeyword, getHolidayContentIdea, getTopHolidayEvent } from './holidayEventService';
import { trackKeyword } from './keywordService';

export interface PipelineResult {
  success: boolean;
  postId?: string;
  slug?: string;
  seoScore?: number;
  error?: string;
  steps: Array<{ step: string; success: boolean; message?: string }>;
}

/**
 * Execute full content pipeline: keyword selection -> generation -> optimization -> publishing
 */
export async function executeContentPipeline(): Promise<PipelineResult> {
  const steps: Array<{ step: string; success: boolean; message?: string }> = [];
  
  try {
    // Step 1: Get next keyword (prioritize holiday keywords if available)
    steps.push({ step: 'keyword_selection', success: false });
    
    // Check for holiday/event keywords first (30% chance to use holiday keyword if available)
    let keyword = null;
    const useHolidayKeyword = Math.random() < 0.3; // 30% chance
    
    if (useHolidayKeyword) {
      const holidayKeywordStr = getHolidayKeyword();
      if (holidayKeywordStr) {
        // Check if this keyword exists, if not create it
        const { getKeyword } = await import('./keywordService');
        let holidayKeyword = await getKeyword(holidayKeywordStr);
        
        if (!holidayKeyword) {
          // Create holiday keyword with high priority
          const topEvent = getTopHolidayEvent();
          holidayKeyword = await trackKeyword({
            keyword: holidayKeywordStr,
            search_volume: 1500, // Estimated high volume for holiday keywords
            competition_score: 30, // Moderate competition
            status: 'targeting',
          });
          console.log(`[Content Pipeline] Created holiday keyword: "${holidayKeywordStr}" for ${topEvent?.name || 'event'}`);
        }
        
        keyword = holidayKeyword;
      }
    }
    
    // Fall back to regular keyword selection if no holiday keyword
    if (!keyword) {
      keyword = await getNextKeywordToTarget();
    }
    
    if (!keyword) {
      return {
        success: false,
        error: 'No keywords available to target',
        steps: [{ step: 'keyword_selection', success: false, message: 'No keywords found' }],
      };
    }
    
    const isHolidayKeyword = useHolidayKeyword && getHolidayKeyword() === keyword.keyword;
    steps[steps.length - 1] = { 
      step: 'keyword_selection', 
      success: true, 
      message: `Selected: ${keyword.keyword}${isHolidayKeyword ? ' (Holiday/Event)' : ''}` 
    };

    // Step 2: Generate content
    steps.push({ step: 'content_generation', success: false });
    const generationRequest: ContentGenerationRequest = {
      keyword: keyword.keyword,
      category: keyword.keyword.includes('video') ? 'Video Marketing' : 'Content Marketing',
      target_word_count: 2000,
    };

    const generated = await generateBlogPost(generationRequest);
    steps[steps.length - 1] = { step: 'content_generation', success: true, message: `Generated: ${generated.post.slug}` };

    // Step 3: Add internal links
    steps.push({ step: 'internal_linking', success: false });
    try {
      const updatedPost = await updatePostWithInternalLinks(generated.post.id);
      if (updatedPost) {
        steps[steps.length - 1] = { step: 'internal_linking', success: true, message: 'Internal links added' };
      } else {
        steps[steps.length - 1] = { step: 'internal_linking', success: false, message: 'No related posts found' };
      }
    } catch (error: any) {
      steps[steps.length - 1] = { step: 'internal_linking', success: false, message: error.message };
    }

    // Step 4: Analyze and optimize
    steps.push({ step: 'seo_optimization', success: false });
    const analysis = analyzeContentSEO(generated.post, keyword.keyword);
    const updatedPost = await updateBlogPost(generated.post.id, {
      seo_score: analysis.score,
    });
    steps[steps.length - 1] = { step: 'seo_optimization', success: true, message: `SEO Score: ${analysis.score}/100` };

    // Step 5: Publish (content is already published by generator, just verify)
    steps.push({ step: 'publishing', success: false });
    const finalPost = await getBlogPostById(generated.post.id);
    if (finalPost && finalPost.status === 'published') {
      steps[steps.length - 1] = { step: 'publishing', success: true, message: 'Published successfully' };
    } else if (analysis.score >= 70) {
      // If not published and score is good, publish it
      const published = await updateBlogPost(generated.post.id, {
        status: 'published',
        published_at: new Date().toISOString(),
      });
      steps[steps.length - 1] = { step: 'publishing', success: true, message: 'Published successfully' };
    } else {
      steps[steps.length - 1] = { step: 'publishing', success: false, message: `Score too low (${analysis.score}), keeping as draft` };
    }

    // Step 6: Record initial performance (zero metrics)
    try {
      await recordPerformance(generated.post.id, {
        organic_views: 0,
        organic_clicks: 0,
        impressions: 0,
      });
    } catch (error) {
      // Non-critical, continue
    }

    return {
      success: true,
      postId: generated.post.id,
      slug: generated.post.slug,
      seoScore: analysis.score,
      steps,
    };
  } catch (error: any) {
    console.error('[Content Pipeline] Error:', error);
    return {
      success: false,
      error: error.message,
      steps,
    };
  }
}

/**
 * Execute pipeline for multiple posts
 */
export async function executeBatchPipeline(count: number = 2): Promise<PipelineResult[]> {
  const results: PipelineResult[] = [];

  for (let i = 0; i < count; i++) {
    console.log(`[Content Pipeline] Processing batch ${i + 1}/${count}`);
    const result = await executeContentPipeline();
    results.push(result);

    // Wait between generations to avoid rate limits
    if (i < count - 1) {
      await new Promise(resolve => setTimeout(resolve, 30000)); // 30 second delay
    }
  }

  return results;
}

