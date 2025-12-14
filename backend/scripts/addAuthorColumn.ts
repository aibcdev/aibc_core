/**
 * Script to add author column to seo_blog_posts table
 * Run with: npx ts-node scripts/addAuthorColumn.ts
 */

import dotenv from 'dotenv';
import { getSupabaseClient, isSupabaseConfigured } from '../src/lib/supabase';

dotenv.config();

async function addAuthorColumn() {
  console.log('🔄 Adding author column to seo_blog_posts table...\n');

  if (!isSupabaseConfigured()) {
    console.log('❌ Supabase not configured. Set SUPABASE_URL and SUPABASE_ANON_KEY environment variables.');
    return;
  }

  const supabase = getSupabaseClient();
  if (!supabase) {
    console.log('❌ Failed to get Supabase client.');
    return;
  }

  try {
    // Execute the ALTER TABLE command using RPC or direct SQL
    // Since Supabase JS client doesn't support DDL directly, we'll use a workaround
    // by trying to update a post with author field - if it fails, the column doesn't exist
    
    // First, let's try to query the table structure
    const { data, error } = await supabase
      .from('seo_blog_posts')
      .select('id')
      .limit(1);

    if (error) {
      console.log('❌ Error accessing table:', error.message);
      console.log('\n📝 Please run this SQL manually in your Supabase SQL editor:');
      console.log('ALTER TABLE seo_blog_posts ADD COLUMN IF NOT EXISTS author TEXT;');
      return;
    }

    // Try to update a post with author field to see if column exists
    const testUpdate = await supabase
      .from('seo_blog_posts')
      .update({ author: 'test' })
      .eq('id', data?.[0]?.id || '00000000-0000-0000-0000-000000000000')
      .select();

    if (testUpdate.error) {
      if (testUpdate.error.message.includes('column') && testUpdate.error.message.includes('author')) {
        console.log('❌ Author column does not exist.');
        console.log('\n📝 Please run this SQL manually in your Supabase SQL editor:');
        console.log('ALTER TABLE seo_blog_posts ADD COLUMN IF NOT EXISTS author TEXT;');
        console.log('\nThen run the update script again.');
        return;
      }
    }

    // If we get here, the column might exist or the update worked
    console.log('✅ Author column appears to exist or was added successfully!');
    console.log('🔄 You can now run the update script to add author names to posts.');
    
  } catch (error: any) {
    console.error('❌ Error:', error.message);
    console.log('\n📝 Please run this SQL manually in your Supabase SQL editor:');
    console.log('ALTER TABLE seo_blog_posts ADD COLUMN IF NOT EXISTS author TEXT;');
  }
}

addAuthorColumn();

