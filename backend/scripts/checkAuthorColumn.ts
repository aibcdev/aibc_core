/**
 * Script to check if author column exists and has data
 * Run with: npx ts-node scripts/checkAuthorColumn.ts
 */

import dotenv from 'dotenv';
import { getSupabaseClient, isSupabaseConfigured } from '../src/lib/supabase';

dotenv.config();

async function checkAuthorColumn() {
  console.log('🔍 Checking author column...\n');

  if (!isSupabaseConfigured()) {
    console.log('❌ Supabase not configured.');
    return;
  }

  const supabase = getSupabaseClient();
  if (!supabase) {
    console.log('❌ Failed to get Supabase client.');
    return;
  }

  try {
    // Try to select author field
    const { data, error } = await supabase
      .from('seo_blog_posts')
      .select('id, title, author')
      .limit(5);

    if (error) {
      console.log('❌ Error:', error.message);
      if (error.message.includes('column') && error.message.includes('author')) {
        console.log('\n📝 The author column does not exist. Please run:');
        console.log('ALTER TABLE seo_blog_posts ADD COLUMN IF NOT EXISTS author TEXT;');
      }
      return;
    }

    console.log('✅ Author column exists!\n');
    console.log('📝 Current author values:');
    data?.forEach(post => {
      console.log(`   ${post.title}: ${post.author || '(null)'}`);
    });

    // Check if any posts have null authors
    const nullAuthors = data?.filter(p => !p.author);
    if (nullAuthors && nullAuthors.length > 0) {
      console.log(`\n⚠️  ${nullAuthors.length} posts have null authors. Run update script to fix.`);
    } else {
      console.log('\n✅ All posts have author names!');
    }

  } catch (error: any) {
    console.error('❌ Error:', error.message);
  }
}

checkAuthorColumn();

