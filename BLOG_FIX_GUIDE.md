# Blog Articles Not Showing - Fix Guide

## Problem
Blog articles are not showing on https://www.aibcmedia.com/blog

## Root Cause
The blog system requires **Supabase** to be configured for persistent storage. Without Supabase:
- Blog posts are stored in memory only
- Posts are lost when the server restarts
- No posts exist in the database

## Solution Options

### Option 1: Configure Supabase (Recommended for Production)

**Step 1: Get Supabase Credentials**
1. Go to https://supabase.com and log in
2. Select your project (or create one)
3. Go to Settings → API
4. Copy:
   - **Project URL** → `SUPABASE_URL`
   - **anon public key** → `SUPABASE_ANON_KEY`

**Step 2: Set Environment Variables**

For **Local Development** (`backend/.env`):
```env
SUPABASE_URL=https://your-project-id.supabase.co
SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

For **Production (Google Cloud Run)**:
```bash
gcloud run services update aibc-backend \
  --set-env-vars "SUPABASE_URL=https://your-project-id.supabase.co,SUPABASE_ANON_KEY=your_key_here" \
  --region us-central1
```

**Step 3: Run Database Schema**
1. Go to Supabase Dashboard → SQL Editor
2. Copy contents of `backend/database/schema.sql`
3. Run the SQL to create the `seo_blog_posts` table

**Step 4: Create Blog Posts**
Once Supabase is configured, you can:
- Use the content generator: `POST /api/blog/generate`
- Create posts manually: `POST /api/blog`
- Or use the script: `npx tsx backend/scripts/create-sample-blog-post.ts`

### Option 2: Quick Test (Temporary - In-Memory)

If you just want to test that the blog page works:

**Step 1: Create Sample Post**
```bash
cd backend
npx tsx scripts/create-sample-blog-post.ts
```

**Step 2: Restart Backend**
The post will be in memory, but you need to ensure the backend is running and has the post loaded.

**⚠️ Note:** This is temporary - posts will be lost on server restart.

## Verify Blog Posts Exist

**Check via API:**
```bash
# Check all posts
curl "https://aibc-backend-409115133182.us-central1.run.app/api/blog"

# Check published posts only
curl "https://aibc-backend-409115133182.us-central1.run.app/api/blog?status=published"
```

**Check via Script:**
```bash
cd backend
npx tsx scripts/check-blog-posts.ts
```

## Expected Response

The API should return:
```json
{
  "posts": [
    {
      "id": "...",
      "title": "...",
      "slug": "...",
      "status": "published",
      "published_at": "2025-12-13T...",
      ...
    }
  ],
  "total": 1,
  "page": 1,
  "limit": 10,
  "totalPages": 1
}
```

## Troubleshooting

### Issue: API returns empty posts array
**Cause:** No published posts in database
**Fix:** Create blog posts (see Option 1 or 2 above)

### Issue: Supabase not configured
**Cause:** Missing environment variables
**Fix:** Set `SUPABASE_URL` and `SUPABASE_ANON_KEY` (see Option 1)

### Issue: Posts exist but not showing
**Check:**
1. Posts have `status: "published"`
2. Posts have `published_at` set (not null)
3. Frontend is calling correct API URL
4. CORS is configured correctly

### Issue: Frontend shows "Content coming soon"
**Cause:** API returned empty posts array
**Fix:** Create and publish blog posts

## Next Steps

1. **Configure Supabase** (if not already done)
2. **Create initial blog posts** using content generator or manually
3. **Verify posts appear** on /blog page
4. **Set up automated content generation** (optional) for ongoing posts

## Related Files

- `backend/src/services/seoContentService.ts` - Blog post service
- `backend/src/routes/blog.ts` - Blog API routes
- `backend/database/schema.sql` - Database schema
- `components/BlogView.tsx` - Frontend blog component
- `backend/scripts/create-sample-blog-post.ts` - Create test post
- `backend/scripts/check-blog-posts.ts` - Diagnostic script








