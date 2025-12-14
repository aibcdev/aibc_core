/**
 * Generate Today's Blog Content
 * 
 * Usage: npx ts-node scripts/generate-today-content.ts
 */

import * as dotenv from 'dotenv';
dotenv.config();

import('./src/services/keywordService').then(async (kwMod) => {
  console.log('🎯 Generating today\'s content...\n');
  
  // Initialize keywords
  await kwMod.initializeTargetKeywords();
  const keyword = await kwMod.getNextKeywordToTarget();
  
  if (!keyword) {
    console.error('No keyword available');
    process.exit(1);
  }
  
  console.log(`📝 Selected keyword: ${keyword.keyword}`);
  console.log(`   Competition: ${keyword.competition_score}/100`);
  console.log(`   Volume: ${keyword.search_volume}\n`);
  
  const { generateBlogPost } = await import('./src/services/contentGeneratorService');
  const { updateBlogPost } = await import('./src/services/seoContentService');
  const { analyzeContentSEO } = await import('./src/services/contentOptimizationService');
  
  console.log('🚀 Generating Blitz SEO-optimized content...\n');
  
  const result = await generateBlogPost({
    keyword: keyword.keyword,
    category: keyword.keyword.toLowerCase().includes('video') ? 'Video Marketing' : 'Content Marketing',
    target_word_count: 2500,
  });
  
  console.log(`\n✅ Generated: ${result.post.title}`);
  console.log(`   Word count: ${result.post.word_count}`);
  
  // Optimize and publish
  const analysis = analyzeContentSEO(result.post, keyword.keyword);
  const published = await updateBlogPost(result.post.id, { 
    seo_score: analysis.score,
    status: 'published',
    published_at: new Date().toISOString(),
  });
  
  if (published) {
    console.log(`\n✅ Published successfully!`);
    console.log(`📊 SEO Score: ${analysis.score}/100`);
    console.log(`🔗 URL: /blog/${result.post.slug}`);
    
    // Verify it's saved
    const { getBlogPostBySlug } = await import('./src/services/seoContentService');
    const saved = await getBlogPostBySlug(result.post.slug);
    if (saved) {
      console.log(`\n✅ Verified: Post is saved in database!`);
      console.log(`🌐 The post is now live and will appear on /blog`);
    }
  } else {
    console.log('❌ Failed to publish');
  }
  
}).catch(e => {
  console.error('❌ Error:', e.message);
  if (e.stack) console.error(e.stack);
  process.exit(1);
});
