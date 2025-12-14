/**
 * Check Blog Posts in Database
 * Diagnostic script to see what blog posts exist
 * 
 * Usage: npx tsx -r dotenv/config scripts/check-blog-posts.ts
 */

import 'dotenv/config';
import { getSupabaseClient, isSupabaseConfigured } from '../src/lib/supabase';
import { listBlogPosts } from '../src/services/seoContentService';

async function checkBlogPosts() {
  console.log('=== Blog Posts Diagnostic ===\n');
  
  // Check Supabase configuration
  console.log('1. Supabase Configuration:');
  console.log(`   - Configured: ${isSupabaseConfigured()}`);
  
  if (!isSupabaseConfigured()) {
    console.log('   ❌ Supabase not configured - blog posts will use in-memory storage');
    console.log('   💡 Set SUPABASE_URL and SUPABASE_KEY environment variables');
    return;
  }
  
  const supabase = getSupabaseClient();
  if (!supabase) {
    console.log('   ❌ Supabase client not available');
    return;
  }
  console.log('   ✅ Supabase client available\n');
  
  // Check all posts (any status)
  console.log('2. All Blog Posts (any status):');
  const { data: allPosts, error: allError } = await supabase
    .from('seo_blog_posts')
    .select('id, slug, title, status, published_at, created_at')
    .order('created_at', { ascending: false });
  
  if (allError) {
    console.log(`   ❌ Error: ${allError.message}`);
  } else {
    console.log(`   Total posts: ${allPosts?.length || 0}`);
    if (allPosts && allPosts.length > 0) {
      allPosts.forEach((post, i) => {
        console.log(`   ${i + 1}. "${post.title}"`);
        console.log(`      - Status: ${post.status}`);
        console.log(`      - Published at: ${post.published_at || 'NOT SET'}`);
        console.log(`      - Slug: ${post.slug}`);
      });
    } else {
      console.log('   ⚠️  No blog posts found in database');
    }
  }
  console.log('');
  
  // Check published posts only
  console.log('3. Published Blog Posts:');
  const { data: publishedPosts, error: publishedError } = await supabase
    .from('seo_blog_posts')
    .select('id, slug, title, status, published_at')
    .eq('status', 'published')
    .not('published_at', 'is', null)
    .order('published_at', { ascending: false });
  
  if (publishedError) {
    console.log(`   ❌ Error: ${publishedError.message}`);
  } else {
    console.log(`   Published posts: ${publishedPosts?.length || 0}`);
    if (publishedPosts && publishedPosts.length > 0) {
      publishedPosts.forEach((post, i) => {
        console.log(`   ${i + 1}. "${post.title}"`);
        console.log(`      - Published: ${post.published_at}`);
        console.log(`      - Slug: ${post.slug}`);
      });
    } else {
      console.log('   ⚠️  No published posts found');
      console.log('   💡 Blog posts need:');
      console.log('      - status = "published"');
      console.log('      - published_at IS NOT NULL');
    }
  }
  console.log('');
  
  // Test the listBlogPosts function
  console.log('4. Testing listBlogPosts function:');
  try {
    const result = await listBlogPosts({
      page: 1,
      limit: 10,
      status: 'published'
    });
    console.log(`   Total: ${result.total}`);
    console.log(`   Posts returned: ${result.posts.length}`);
    console.log(`   Total pages: ${result.totalPages}`);
    if (result.posts.length > 0) {
      console.log(`   First post: "${result.posts[0].title}"`);
    }
  } catch (error: any) {
    console.log(`   ❌ Error: ${error.message}`);
  }
  console.log('');
  
  // Recommendations
  console.log('5. Recommendations:');
  if (!allPosts || allPosts.length === 0) {
    console.log('   📝 Create blog posts using:');
    console.log('      POST /api/blog/generate');
    console.log('      or');
    console.log('      POST /api/blog (with full post data)');
  } else if (!publishedPosts || publishedPosts.length === 0) {
    console.log('   📝 Publish existing posts by updating:');
    console.log('      - status to "published"');
    console.log('      - published_at to current timestamp');
    console.log('   Use: PUT /api/blog/:id');
  } else {
    console.log('   ✅ Blog posts are available and should show on /blog');
  }
}

checkBlogPosts().catch(console.error);

