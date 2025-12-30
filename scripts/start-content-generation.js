/**
 * Start SEO Content Generation (CommonJS version for easier execution)
 * 
 * Usage:
 *   node scripts/start-content-generation.js
 *   node scripts/start-content-generation.js --count=5
 */

require('dotenv').config({ path: require('path').join(__dirname, '../backend/.env') });
require('dotenv').config({ path: require('path').join(__dirname, '../.env') });

async function main() {
  // Import services
  const { executeBatchPipeline } = require('../backend/dist/services/contentPipelineService');
  const { initializeTargetKeywords } = require('../backend/dist/services/keywordService');
  
  const args = process.argv.slice(2);
  const countArg = args.find(arg => arg.startsWith('--count='));
  const count = countArg ? parseInt(countArg.split('=')[1]) : 3;

  console.log('🚀 Starting SEO Content Generation\n');
  console.log('📋 Initializing keyword database...');

  try {
    await initializeTargetKeywords();
    console.log('✅ Keywords initialized\n');

    console.log(`🎯 Generating ${count} SEO-optimized blog posts...\n`);
    const results = await executeBatchPipeline(count);

    console.log('\n📊 Generation Results:');
    console.log('='.repeat(60));
    
    let successCount = 0;
    results.forEach((result, index) => {
      console.log(`\n${index + 1}. ${result.success ? '✅ SUCCESS' : '❌ FAILED'}`);
      if (result.success) {
        successCount++;
        console.log(`   📝 Slug: ${result.slug}`);
        console.log(`   📈 SEO Score: ${result.seoScore}/100`);
        console.log(`   🔗 URL: /blog/${result.slug}`);
      } else {
        console.log(`   ❌ Error: ${result.error}`);
      }
    });

    console.log('\n' + '='.repeat(60));
    console.log(`\n✅ Generated ${successCount}/${count} posts successfully`);
    
    if (successCount > 0) {
      console.log('\n📝 Next Steps:');
      console.log('   1. Visit /blog to see your new content');
      console.log('   2. Content will auto-generate daily at 9 AM');
      console.log('   3. Submit sitemap to Google: /api/sitemap.xml');
    }
  } catch (error) {
    console.error('\n❌ Error:', error.message);
    process.exit(1);
  }
}

main();







