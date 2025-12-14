/**
 * Test Supabase Connection
 * 
 * Usage: npx ts-node scripts/test-supabase.ts
 */

import * as dotenv from 'dotenv';
dotenv.config();

import { isSupabaseConfigured, getSupabaseClient } from '../src/lib/supabase';

async function testConnection() {
  console.log('🔍 Testing Supabase configuration...\n');

  if (!isSupabaseConfigured()) {
    console.log('❌ Supabase not configured');
    console.log('   Please add to backend/.env:');
    console.log('   SUPABASE_URL=your_supabase_url');
    console.log('   SUPABASE_ANON_KEY=your_supabase_key\n');
    process.exit(1);
  }

  console.log('✅ Supabase environment variables found\n');

  const client = getSupabaseClient();
  if (!client) {
    console.log('❌ Failed to initialize Supabase client');
    process.exit(1);
  }

  console.log('✅ Supabase client initialized\n');

  // Test database connection by checking if tables exist
  console.log('📊 Testing database connection...\n');

  try {
    // Test blog posts table
    const { data: posts, error: postsError } = await client
      .from('seo_blog_posts')
      .select('id')
      .limit(1);

    if (postsError) {
      if (postsError.message.includes('does not exist')) {
        console.log('⚠️  Tables not created yet!');
        console.log('   Please run the SQL schema from backend/database/schema.sql');
        console.log('   in your Supabase SQL Editor\n');
        process.exit(1);
      }
      throw postsError;
    }

    console.log('✅ seo_blog_posts table accessible');

    // Test keywords table
    const { error: keywordsError } = await client
      .from('seo_keywords')
      .select('id')
      .limit(1);

    if (keywordsError) {
      throw keywordsError;
    }

    console.log('✅ seo_keywords table accessible');

    // Test performance table
    const { error: perfError } = await client
      .from('seo_content_performance')
      .select('id')
      .limit(1);

    if (perfError) {
      throw perfError;
    }

    console.log('✅ seo_content_performance table accessible\n');

    console.log('🎉 All tests passed! Supabase is properly configured.\n');
    console.log('✅ Database is ready for use');
    console.log('✅ Content will persist across server restarts\n');

  } catch (error: any) {
    console.log('❌ Database connection test failed:');
    console.log(`   ${error.message}\n`);
    
    if (error.message.includes('does not exist')) {
      console.log('💡 Solution:');
      console.log('   1. Go to your Supabase dashboard');
      console.log('   2. Open SQL Editor');
      console.log('   3. Run the SQL from backend/database/schema.sql\n');
    }
    
    process.exit(1);
  }
}

testConnection();

