/**
 * Server-side implementation for web scraping
 * This runs on Cloud Run/Cloud Functions to avoid CORS issues
 */

// DISABLED: Client-side Gemini calls removed to prevent quota errors
// This file should not be used in frontend builds
// import { GoogleGenAI } from "@google/genai";
import playwright from 'playwright';

const llmApiKey = ''; // Disabled - no client-side Gemini calls

/**
 * Scrapes a public profile page using Playwright
 */
export async function scrapePublicProfileServer(url: string): Promise<{ html: string; text: string; url: string }> {
  const browser = await playwright.chromium.launch({
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox'],
  });

  try {
    const page = await browser.newPage();
    
    // Set user agent to avoid detection
    await page.setExtraHTTPHeaders({
      'User-Agent': 'Mozilla/5.0 (compatible; AIBCBot/1.0; +https://aibc.ai/bot)',
    });

    // Load page and wait for content
    await page.goto(url, {
      waitUntil: 'networkidle',
      timeout: 30000,
    });

    // Wait for dynamic content to load
    await page.waitForTimeout(2000);

    // Extract page content
    const html = await page.content();
    const text = await page.innerText('body');

    await browser.close();

    return {
      html,
      text,
      url,
    };
  } catch (error) {
    await browser.close();
    throw error;
  }
}

/**
 * Uses LLM to extract OUTPUT content (server-side version)
 */
export async function extractOutputContentServer(
  scrapedContent: { html: string; text: string; url: string },
  username: string,
  platform: string
): Promise<any> {
  // DISABLED: Client-side Gemini calls removed to prevent quota errors
  throw new Error('Client-side LLM calls disabled - use backend API instead');
  
  // if (!llmApiKey) {
  //   throw new Error('Gemini API key not configured');
  // }

  // const ai = new GoogleGenAI({ apiKey: llmApiKey });

  const prompt = `You are analyzing a public ${platform} profile page for user: ${username}

IMPORTANT: Extract ONLY content published BY ${username} (OUTPUT only).
DO NOT extract:
- Mentions of ${username} by others
- Retweets or shares
- Comments from other users
- Content about ${username}
- Third-party content

From this page content, extract:

1. Profile Information:
   - Bio/description
   - Profile picture URL
   - Verification status
   - Follower/following counts (if visible)

2. Posts/Content Published BY ${username}:
   - Post text/content
   - Timestamps
   - Media (images, videos) URLs
   - Engagement metrics (if visible)

3. Content Analysis:
   - Topics/themes
   - Writing style
   - Posting frequency patterns

Page Content (first 50,000 chars):
${scrapedContent.text.substring(0, 50000)}

Return ONLY valid JSON, no markdown, no code blocks:
{
  "profile": {
    "bio": "...",
    "verified": true/false,
    "profile_image": "url",
    "follower_count": 0
  },
  "posts": [
    {
      "content": "...",
      "timestamp": "...",
      "media_urls": ["..."],
      "engagement": {"likes": 0, "shares": 0}
    }
  ],
  "content_themes": ["..."],
  "extraction_confidence": 0.0-1.0
}`;

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.0-flash-exp',
      contents: prompt,
    });

    const text = response.text || '';
    
    // Extract JSON from response
    const jsonMatch = text.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      return JSON.parse(jsonMatch[0]);
    }

    throw new Error('Failed to parse LLM response as JSON');
  } catch (error) {
    console.error('LLM extraction error:', error);
    throw error;
  }
}

/**
 * Extracts Brand DNA (server-side version)
 */
export async function extractBrandDNAServer(
  validatedContent: any
): Promise<any> {
  // DISABLED: Client-side Gemini calls removed to prevent quota errors
  throw new Error('Client-side LLM calls disabled - use backend API instead');
  
  // if (!llmApiKey) {
  //   throw new Error('Gemini API key not configured');
  // }

  // const ai = new GoogleGenAI({ apiKey: llmApiKey });

  const allPosts = validatedContent.posts.map((p: any) => p.content).join('\n\n');
  const combinedText = allPosts.substring(0, 50000);

  const prompt = `Analyze this brand's content to extract their unique DNA:

Content:
${combinedText}

Extract:

1. Voice & Tone:
   - Writing style (formal, casual, technical, etc.)
   - Vocabulary patterns (list 5-10 key words)
   - Sentence structure (short, long, varied)
   - Emotional tone (professional, friendly, humorous, etc.)

2. Content Themes:
   - Main topics they discuss (list 3-5)
   - Value propositions
   - Messaging pillars

3. Visual Identity (from descriptions):
   - Color preferences
   - Style (minimalist, bold, etc.)

4. Engagement Patterns:
   - Posting frequency
   - Best performing content types

Return ONLY valid JSON:
{
  "voice": {
    "style": "...",
    "formality": "...",
    "tone": "...",
    "vocabulary": ["..."]
  },
  "themes": ["..."],
  "visual_identity": {
    "colors": ["..."],
    "style": "..."
  },
  "engagement_patterns": {
    "frequency": "...",
    "best_content_types": ["..."]
  }
}`;

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.0-flash-exp',
      contents: prompt,
    });

    const text = response.text || '';
    const jsonMatch = text.match(/\{[\s\S]*\}/);
    
    if (jsonMatch) {
      return JSON.parse(jsonMatch[0]);
    }

    throw new Error('Failed to parse Brand DNA response as JSON');
  } catch (error) {
    console.error('Brand DNA extraction error:', error);
    throw error;
  }
}

