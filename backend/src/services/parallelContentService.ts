/**
 * Parallel Content Generation Service
 * Processes thousands of posts concurrently using worker threads
 */

import { Keyword } from './keywordGenerationService';
import { BlogPost } from '../types/seo';
import { generatePostForKeyword } from './massContentGenerationService';

export interface ParallelJob {
  keyword: Keyword;
  id: string;
}

export class ParallelContentGenerator {
  private maxConcurrency: number;
  private activeJobs: Set<string> = new Set();

  constructor(maxConcurrency: number = 20) {
    // Use CPU count or configured value, max 50
    this.maxConcurrency = Math.min(maxConcurrency, 50);
  }

  /**
   * Generate posts in parallel batches
   */
  async generateBatch(
    keywords: Keyword[],
    batchSize: number = 100
  ): Promise<BlogPost[]> {
    console.log(`🚀 Starting parallel generation: ${keywords.length} keywords, ${this.maxConcurrency} workers`);

    // Split into batches
    const batches: Keyword[][] = [];
    for (let i = 0; i < keywords.length; i += batchSize) {
      batches.push(keywords.slice(i, i + batchSize));
    }

    // Process all batches in parallel (limited by maxConcurrency)
    const results: BlogPost[][] = [];
    
    for (let i = 0; i < batches.length; i += this.maxConcurrency) {
      const batchGroup = batches.slice(i, i + this.maxConcurrency);
      
      const batchResults = await Promise.all(
        batchGroup.map(batch => this.processBatch(batch))
      );
      
      results.push(...batchResults);
      
      // Log progress
      const processed = Math.min((i + this.maxConcurrency) * batchSize, keywords.length);
      console.log(`📊 Progress: ${processed}/${keywords.length} keywords processed`);
    }

    const allPosts = results.flat().filter(Boolean) as BlogPost[];
    console.log(`✅ Parallel generation complete: ${allPosts.length} posts created`);
    
    return allPosts;
  }

  /**
   * Process a single batch of keywords
   */
  private async processBatch(keywords: Keyword[]): Promise<BlogPost[]> {
    // Process keywords in parallel within batch
    const chunks = this.chunkArray(keywords, 20); // 20 per chunk
    
    const results = await Promise.all(
      chunks.map(chunk => 
        Promise.allSettled(
          chunk.map(kw => this.generatePost(kw))
        )
      )
    );

    const posts: BlogPost[] = [];
    for (const chunkResult of results) {
      for (const result of chunkResult) {
        if (result.status === 'fulfilled' && result.value) {
          posts.push(result.value);
        }
      }
    }

    return posts;
  }

  /**
   * Generate a single post (with error handling)
   */
  private async generatePost(keyword: Keyword): Promise<BlogPost | null> {
    const jobId = `${keyword.keyword}-${Date.now()}`;
    
    try {
      this.activeJobs.add(jobId);
      
      const llmService = await import('./llmService');
      const post = await generatePostForKeyword(keyword, llmService);
      
      return post;
    } catch (error) {
      console.error(`Error generating post for ${keyword.keyword}:`, error);
      return null;
    } finally {
      this.activeJobs.delete(jobId);
    }
  }

  /**
   * Chunk array into smaller arrays
   */
  private chunkArray<T>(array: T[], size: number): T[][] {
    const chunks: T[][] = [];
    for (let i = 0; i < array.length; i += size) {
      chunks.push(array.slice(i, i + size));
    }
    return chunks;
  }

  /**
   * Get current active job count
   */
  getActiveJobCount(): number {
    return this.activeJobs.size;
  }
}




