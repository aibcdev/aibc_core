/**
 * Start SEO Content Generation
 * 
 * This script initializes keywords and generates initial blog content
 * 
 * Usage:
 *   ts-node scripts/start-content-generation.ts
 *   ts-node scripts/start-content-generation.ts --count 5
 */

import * as dotenv from 'dotenv';
import * as path from 'path';

// Load environment variables
const backendEnvPath = path.join(__dirname, '../backend/.env');
const rootEnvPath = path.join(__dirname, '../.env');
dotenv.config({ path: rootEnvPath });
dotenv.config({ path: backendEnvPath });

// Import after env is loaded
const { executeContentPipeline, executeBatchPipeline } = await import('../backend/src/services/contentPipelineService');
const { initializeTargetKeywords } = await import('../backend/src/services/keywordService');

async function main() {
  const args = process.argv.slice(2);
  const countArg = args.find(arg => arg.startsWith('--count='));
  const count = countArg ? parseInt(countArg.split('=')[1]) : 3; // Default to 3 initial posts

  console.log('🚀 Starting SEO Content Generation\n');
  console.log('📋 Initializing keyword database...');

  try {
    // Step 1: Initialize keywords  
    await initializeTargetKeywords();
    console.log('✅ Keywords initialized\n');

    // Step 2: Generate initial content
    console.log(`🎯 Generating ${count} SEO-optimized blog posts...\n`);
    const results = await executeBatchPipeline(count);

    console.log('\n📊 Generation Results:');
    console.log('=' .repeat(60));
    
    let successCount = 0;
    results.forEach((result, index) => {
      console.log(`\n${index + 1}. ${result.success ? '✅ SUCCESS' : '❌ FAILED'}`);
      if (result.success) {
        successCount++;
        console.log(`   📝 Slug: ${result.slug}`);
        console.log(`   📈 SEO Score: ${result.seoScore}/100`);
        console.log(`   🔗 URL: /blog/${result.slug}`);
        console.log(`   📍 Steps completed:`);
        result.steps.forEach(step => {
          console.log(`      ${step.success ? '✓' : '✗'} ${step.step}: ${step.message || ''}`);
        });
      } else {
        console.log(`   ❌ Error: ${result.error}`);
        if (result.steps.length > 0) {
          console.log(`   📍 Steps attempted:`);
          result.steps.forEach(step => {
            console.log(`      ${step.success ? '✓' : '✗'} ${step.step}: ${step.message || ''}`);
          });
        }
      }
    });

    console.log('\n' + '='.repeat(60));
    console.log(`\n✅ Generated ${successCount}/${count} posts successfully`);
    
    if (successCount > 0) {
      console.log('\n📝 Next Steps:');
      console.log('   1. Visit /blog to see your new content');
      console.log('   2. Content will auto-generate daily at 9 AM (configured in server)');
      console.log('   3. Check SEO scores and optimize as needed');
      console.log('   4. Submit sitemap to Google: /api/sitemap.xml');
    }

    if (successCount < count) {
      console.log('\n⚠️  Some posts failed to generate. Check logs above for details.');
      console.log('   Common issues:');
      console.log('   - Missing GEMINI_API_KEY in backend/.env');
      console.log('   - API rate limits');
      console.log('   - Network connectivity');
    }

  } catch (error: any) {
    console.error('\n❌ Fatal Error:', error.message);
    console.error(error.stack);
    process.exit(1);
  }
}

main();

