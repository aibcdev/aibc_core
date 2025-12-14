/**
 * Create Initial Blog Posts
 * Simple script to create blog posts via API
 * Can be run locally or called from production
 * 
 * Usage: npx tsx -r dotenv/config scripts/create-initial-blog-posts.ts
 */

import 'dotenv/config';
import { getSupabaseClient, isSupabaseConfigured } from '../src/lib/supabase';
import { createBlogPost } from '../src/services/seoContentService';

const initialPosts = [
  {
    title: 'Getting Started with AIBC: Your Complete Guide to Digital Footprint Scanning',
    slug: 'getting-started-with-aibc-complete-guide',
    meta_description: 'Learn how to use AIBC to scan your digital footprint, extract your brand DNA, and generate on-brand content automatically.',
    content: `
      <h2>What is AIBC?</h2>
      <p>AIBC (AI Brand Content) is an autonomous content platform that scans your digital footprint and generates on-brand content automatically. Whether you're a creator, marketer, or business owner, AIBC helps you maintain consistent brand voice across all your channels.</p>
      
      <h2>How Digital Footprint Scanning Works</h2>
      <p>When you start a Brand Scan, AIBC analyzes your existing content across multiple platforms:</p>
      <ul>
        <li><strong>Social Media:</strong> Twitter/X, LinkedIn, Instagram, Facebook, TikTok</li>
        <li><strong>Websites:</strong> Your main website, blog posts, landing pages</li>
        <li><strong>Content Platforms:</strong> YouTube, Medium, Substack</li>
      </ul>
      
      <h2>Extracting Your Brand DNA</h2>
      <p>From your scanned content, AIBC extracts your unique Brand DNA:</p>
      <ul>
        <li>Voice and tone patterns</li>
        <li>Content themes and topics</li>
        <li>Writing style and structure</li>
        <li>Visual preferences</li>
        <li>Call-to-action patterns</li>
      </ul>
      
      <h2>Generating On-Brand Content</h2>
      <p>Once your Brand DNA is extracted, AIBC's autonomous agents generate content that matches your style. You can:</p>
      <ul>
        <li>Generate social media posts</li>
        <li>Create blog articles</li>
        <li>Produce video scripts</li>
        <li>Generate audio content</li>
      </ul>
      
      <h2>Getting Started</h2>
      <p>Ready to start? Here's how:</p>
      <ol>
        <li>Sign up for an AIBC account</li>
        <li>Run your first Brand Scan</li>
        <li>Review your extracted Brand DNA</li>
        <li>Start generating content</li>
      </ol>
      
      <h2>Conclusion</h2>
      <p>AIBC makes it easy to maintain brand consistency and scale your content creation. Start your free scan today and see how AIBC can transform your content workflow.</p>
    `,
    excerpt: 'Learn how to use AIBC to scan your digital footprint, extract your brand DNA, and generate on-brand content automatically.',
    category: 'Getting Started',
    tags: ['getting-started', 'digital-footprint', 'brand-scan', 'content-generation'],
    target_keywords: ['aibc', 'digital footprint scanning', 'brand dna', 'content automation'],
    status: 'published' as const,
    published_at: new Date().toISOString(),
    word_count: 350,
    reading_time: 2,
    seo_score: 85,
  },
  {
    title: 'Content Marketing Strategies: How to Scale Your Content Production',
    slug: 'content-marketing-strategies-scale-production',
    meta_description: 'Discover proven strategies to scale your content production without sacrificing quality. Learn how AIBC helps automate content creation while maintaining brand voice.',
    content: `
      <h2>Why Scale Content Production?</h2>
      <p>In today's digital landscape, consistent content creation is essential for brand visibility and growth. However, scaling content production manually is time-consuming and often leads to inconsistent quality.</p>
      
      <h2>Challenges of Manual Content Creation</h2>
      <ul>
        <li>Time-intensive research and writing</li>
        <li>Difficulty maintaining brand voice consistency</li>
        <li>Limited capacity to produce at scale</li>
        <li>High costs for quality content</li>
      </ul>
      
      <h2>How AIBC Solves This</h2>
      <p>AIBC uses autonomous agents that learn from your existing content to generate new pieces that match your brand voice. This allows you to:</p>
      <ul>
        <li>Produce content 10x faster</li>
        <li>Maintain consistent brand voice</li>
        <li>Scale production without hiring more writers</li>
        <li>Focus on strategy instead of execution</li>
      </ul>
      
      <h2>Best Practices</h2>
      <ol>
        <li>Start with a comprehensive Brand Scan</li>
        <li>Review and refine your Brand DNA</li>
        <li>Set up your Content Plan</li>
        <li>Use the Quality Filter to ensure standards</li>
        <li>Continuously improve with feedback</li>
      </ol>
      
      <h2>Conclusion</h2>
      <p>Scaling content production doesn't have to mean sacrificing quality. With AIBC, you can maintain your brand voice while dramatically increasing output.</p>
    `,
    excerpt: 'Discover proven strategies to scale your content production without sacrificing quality.',
    category: 'Content Marketing',
    tags: ['content-marketing', 'scaling', 'automation', 'strategy'],
    target_keywords: ['content marketing', 'content production', 'content scaling', 'content automation'],
    status: 'published' as const,
    published_at: new Date(Date.now() - 86400000).toISOString(),
    word_count: 420,
    reading_time: 2,
    seo_score: 88,
  },
  {
    title: 'Video Marketing: Creating Engaging Video Content at Scale',
    slug: 'video-marketing-creating-engaging-content-scale',
    meta_description: 'Learn how to create engaging video content at scale using AIBC. From script generation to video production, discover tools and strategies for video marketing success.',
    content: `
      <h2>The Power of Video Marketing</h2>
      <p>Video content has become the most engaging format across social media platforms. However, creating quality video content consistently is challenging and resource-intensive.</p>
      
      <h2>Video Content Challenges</h2>
      <ul>
        <li>Script writing takes significant time</li>
        <li>Production requires multiple tools and skills</li>
        <li>Maintaining brand consistency across videos</li>
        <li>Scaling production while maintaining quality</li>
      </ul>
      
      <h2>AIBC's Video Production Room</h2>
      <p>AIBC's Production Room helps you create video content at scale:</p>
      <ul>
        <li><strong>Script Generation:</strong> AI-powered scripts that match your brand voice</li>
        <li><strong>Audio Generation:</strong> High-quality voiceovers using your brand's tone</li>
        <li><strong>Video Assembly:</strong> Automated video creation from scripts and assets</li>
        <li><strong>Multi-Platform Optimization:</strong> Format videos for different platforms</li>
      </ul>
      
      <h2>Getting Started with Video</h2>
      <ol>
        <li>Complete your Brand Scan to extract video style preferences</li>
        <li>Upload brand assets (logos, colors, fonts)</li>
        <li>Generate your first video script</li>
        <li>Use Production Room to create the video</li>
        <li>Review and refine based on results</li>
      </ol>
      
      <h2>Best Practices</h2>
      <ul>
        <li>Keep videos concise and focused</li>
        <li>Use consistent branding elements</li>
        <li>Optimize for each platform's format</li>
        <li>Test different styles and measure performance</li>
      </ul>
      
      <h2>Conclusion</h2>
      <p>Video marketing doesn't have to be complicated. With AIBC, you can create engaging video content that matches your brand voice and scales with your needs.</p>
    `,
    excerpt: 'Learn how to create engaging video content at scale using AIBC.',
    category: 'Video Marketing',
    tags: ['video-marketing', 'video-production', 'content-creation', 'automation'],
    target_keywords: ['video marketing', 'video content', 'video production', 'video automation'],
    status: 'published' as const,
    published_at: new Date(Date.now() - 172800000).toISOString(),
    word_count: 380,
    reading_time: 2,
    seo_score: 87,
  },
];

async function createPosts() {
  console.log('=== Creating Initial Blog Posts ===\n');
  
  if (!isSupabaseConfigured()) {
    console.log('❌ Supabase not configured');
    console.log('\nPlease ensure SUPABASE_URL and SUPABASE_ANON_KEY are set.');
    console.log('For production, these should be set in Cloud Run environment variables.');
    console.log('For local, add them to backend/.env file.\n');
    process.exit(1);
  }
  
  const supabase = getSupabaseClient();
  if (!supabase) {
    console.log('❌ Failed to create Supabase client');
    process.exit(1);
  }
  
  console.log('✅ Supabase connected\n');
  
  // Check if tables exist
  const { error: tableError } = await supabase
    .from('seo_blog_posts')
    .select('id')
    .limit(1);
  
  if (tableError) {
    console.log('❌ Database table does not exist');
    console.log('\nPlease run the database schema first:');
    console.log('1. Go to Supabase Dashboard → SQL Editor');
    console.log('2. Copy contents of backend/database/schema.sql');
    console.log('3. Paste and run in SQL Editor\n');
    process.exit(1);
  }
  
  console.log('✅ Database table exists\n');
  console.log('Creating blog posts...\n');
  
  let createdCount = 0;
  let skippedCount = 0;
  let failedCount = 0;
  
  for (const postData of initialPosts) {
    try {
      // Check if post already exists
      const { data: existing } = await supabase
        .from('seo_blog_posts')
        .select('id, title')
        .eq('slug', postData.slug)
        .single();
      
      if (existing) {
        console.log(`  ⏭️  "${postData.title}" already exists, skipping`);
        skippedCount++;
        continue;
      }
      
      const post = await createBlogPost(postData);
      console.log(`  ✅ Created: "${post.title}"`);
      createdCount++;
    } catch (error: any) {
      console.log(`  ❌ Error: "${postData.title}" - ${error.message}`);
      failedCount++;
    }
  }
  
  console.log(`\n✅ Complete!`);
  console.log(`   Created: ${createdCount} posts`);
  if (skippedCount > 0) console.log(`   Skipped: ${skippedCount} (already exist)`);
  if (failedCount > 0) console.log(`   Failed: ${failedCount}`);
  console.log(`\n📝 View blog at: https://www.aibcmedia.com/blog\n`);
}

createPosts().catch(console.error);

