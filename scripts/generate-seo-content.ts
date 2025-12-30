/**
 * Manual SEO Content Generation Script
 * 
 * Usage:
 *   ts-node scripts/generate-seo-content.ts
 *   ts-node scripts/generate-seo-content.ts --keyword "video marketing tips"
 *   ts-node scripts/generate-seo-content.ts --count 3
 */

import * as dotenv from 'dotenv';
import { executeContentPipeline, executeBatchPipeline } from '../backend/src/services/contentPipelineService';
import { initializeTargetKeywords } from '../backend/src/services/keywordService';

dotenv.config({ path: '.env' });
dotenv.config({ path: 'backend/.env' });

async function main() {
  const args = process.argv.slice(2);
  const keywordArg = args.find(arg => arg.startsWith('--keyword='));
  const countArg = args.find(arg => arg.startsWith('--count='));
  
  const keyword = keywordArg ? keywordArg.split('=')[1] : undefined;
  const count = countArg ? parseInt(countArg.split('=')[1]) : 1;

  console.log('🚀 SEO Content Generation Script\n');

  try {
    // Initialize keywords if needed
    console.log('📋 Initializing keywords...');
    await initializeTargetKeywords();
    console.log('✅ Keywords initialized\n');

    if (keyword) {
      // Generate for specific keyword
      console.log(`🎯 Generating content for keyword: "${keyword}"\n`);
      const { generateBlogPost } = await import('../backend/src/services/contentGeneratorService');
      const result = await generateBlogPost({
        keyword,
        category: keyword.includes('video') ? 'Video Marketing' : 'Content Marketing',
      });
      console.log(`✅ Generated: ${result.post.slug}`);
      console.log(`   SEO Score: ${result.score}/100`);
      console.log(`   URL: /blog/${result.post.slug}`);
    } else {
      // Generate using pipeline (automated keyword selection)
      console.log(`🔄 Executing content pipeline (${count} post${count > 1 ? 's' : ''})...\n`);
      const results = count === 1 
        ? [await executeContentPipeline()]
        : await executeBatchPipeline(count);

      console.log('\n📊 Results:');
      results.forEach((result, index) => {
        console.log(`\n${index + 1}. ${result.success ? '✅' : '❌'}`);
        if (result.success) {
          console.log(`   Slug: ${result.slug}`);
          console.log(`   SEO Score: ${result.seoScore}/100`);
          console.log(`   URL: /blog/${result.slug}`);
        } else {
          console.log(`   Error: ${result.error}`);
        }
        console.log(`   Steps:`);
        result.steps.forEach(step => {
          console.log(`     ${step.success ? '✓' : '✗'} ${step.step}: ${step.message || ''}`);
        });
      });

      const successCount = results.filter(r => r.success).length;
      console.log(`\n✅ Generated ${successCount}/${count} posts successfully`);
    }
  } catch (error: any) {
    console.error('\n❌ Error:', error.message);
    process.exit(1);
  }
}

main();







