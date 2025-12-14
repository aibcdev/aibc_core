# SEO Content Generation System

## Overview

This system automatically generates and publishes SEO-optimized blog content daily, targeting low-competition keywords in content marketing and video marketing.

## Quick Start

### 1. Generate Initial Content

```bash
# Generate 3 initial posts (recommended)
ts-node scripts/start-content-generation.ts

# Or generate more
ts-node scripts/start-content-generation.ts --count 5
```

### 2. View Your Content

- Visit `/blog` to see all published posts
- Individual posts are at `/blog/{slug}`
- Sitemap: `/api/sitemap.xml`

## Automated Daily Generation

The system automatically generates 1-2 new posts daily at 9 AM (configurable).

### Configuration

In `backend/.env`:
```
ENABLE_CONTENT_SCHEDULER=true
CONTENT_GENERATION_TIME=09:00
TIMEZONE=America/New_York
```

### Manual Generation

```bash
# Generate single post
ts-node scripts/generate-seo-content.ts

# Generate with specific keyword
ts-node scripts/generate-seo-content.ts --keyword "video marketing tips"

# Generate multiple posts
ts-node scripts/generate-seo-content.ts --count 3
```

## Target Keywords

The system targets 20+ low-competition keywords including:
- Content marketing strategies
- Video marketing tips for brands
- Video ideas for brands
- Content calendar templates
- Social media content ideas
- Brand storytelling examples
- And more...

## Content Quality

Each generated post includes:
- ✅ SEO-optimized titles and meta descriptions
- ✅ Target keyword integration
- ✅ Proper heading structure (H2/H3)
- ✅ 2000+ word comprehensive content
- ✅ Internal linking opportunities
- ✅ SEO score (aims for 70+/100)
- ✅ Reading time calculation
- ✅ Category and tag assignment

## API Endpoints

- `GET /api/blog` - List all blog posts
- `GET /api/blog/:slug` - Get single post
- `POST /api/blog/generate` - Generate new content
- `GET /api/sitemap.xml` - SEO sitemap
- `GET /api/seo/analytics` - Analytics data

## SEO Features

- Dynamic sitemap generation
- Structured data (JSON-LD)
- Meta tags optimization
- Internal linking
- Keyword tracking
- Performance analytics

## Next Steps

1. **Submit Sitemap to Google Search Console**
   - URL: `https://yourdomain.com/api/sitemap.xml`

2. **Monitor Performance**
   - Check `/api/seo/analytics` for traffic data
   - Review SEO scores in generated content

3. **Customize Keywords**
   - Edit `backend/src/services/keywordService.ts`
   - Add your target keywords to `TARGET_KEYWORDS` array

4. **Optimize Content**
   - Use `/api/seo/optimize` endpoint
   - Review and improve posts with low SEO scores

## Troubleshooting

**Content not generating?**
- Check `GEMINI_API_KEY` is set in `backend/.env`
- Verify API quota hasn't been exceeded
- Check server logs for errors

**Posts not appearing?**
- Ensure posts have `status: 'published'`
- Check SEO score is >= 70 (auto-publishes if good)
- Verify `/blog` route is working

**Daily generation not running?**
- Check `ENABLE_CONTENT_SCHEDULER=true` in `.env`
- Verify server is running continuously
- Check cron logs in server output

