/**
 * Test script to query posts and see raw database response
 */

import dotenv from 'dotenv';
import { getSupabaseClient, isSupabaseConfigured } from '../src/lib/supabase';
import { listBlogPosts } from '../src/services/seoContentService';

dotenv.config();

async function testAuthorQuery() {
  if (!isSupabaseConfigured()) {
    console.log('❌ Supabase not configured.');
    return;
  }

  const supabase = getSupabaseClient();
  if (!supabase) {
    console.log('❌ Failed to get Supabase client.');
    return;
  }

  console.log('🔍 Testing direct Supabase query...\n');
  
  // Direct query
  const { data: directData, error: directError } = await supabase
    .from('seo_blog_posts')
    .select('id, title, author')
    .eq('status', 'published')
    .limit(1);

  if (directError) {
    console.log('❌ Direct query error:', directError.message);
    return;
  }

  console.log('📝 Direct Supabase query result:');
  console.log(JSON.stringify(directData, null, 2));

  console.log('\n🔍 Testing through listBlogPosts service...\n');
  
  // Through service
  const result = await listBlogPosts({ limit: 1, status: 'published' });
  
  console.log('📝 Service result:');
  console.log(JSON.stringify(result.posts[0] ? { title: result.posts[0].title, author: result.posts[0].author } : 'No posts', null, 2));
}

testAuthorQuery();

