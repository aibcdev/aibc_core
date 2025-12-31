/**
 * Create Sample Blog Post
 * Creates a sample published blog post for testing
 */

import { createBlogPost } from '../src/services/seoContentService';

async function createSamplePost() {
  console.log('Creating sample blog post...\n');
  
  const samplePost = {
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
  };
  
  try {
    const post = await createBlogPost(samplePost);
    console.log('✅ Sample blog post created successfully!');
    console.log(`\nPost Details:`);
    console.log(`  - Title: ${post.title}`);
    console.log(`  - Slug: ${post.slug}`);
    console.log(`  - Status: ${post.status}`);
    console.log(`  - Published: ${post.published_at}`);
    console.log(`\nView at: /blog/${post.slug}`);
    console.log(`\nNote: If Supabase is not configured, this post is stored in memory and will be lost on server restart.`);
    console.log(`To persist posts, configure Supabase (see backend/HOW_TO_FIND_SUPABASE_KEYS.md)`);
  } catch (error: any) {
    console.error('❌ Error creating blog post:', error.message);
    console.error('\nTroubleshooting:');
    console.error('1. Make sure the backend server is running');
    console.error('2. Check if Supabase is configured (optional but recommended)');
    console.error('3. Verify database schema is set up (run backend/database/schema.sql)');
  }
}

createSamplePost().catch(console.error);








