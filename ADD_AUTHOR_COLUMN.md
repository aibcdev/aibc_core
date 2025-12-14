# Adding Author Column to Database

To add author names to blog posts, you need to first add the `author` column to your Supabase database.

## Steps:

1. **Open your Supabase Dashboard**
   - Go to https://supabase.com/dashboard
   - Select your project

2. **Open SQL Editor**
   - Click on "SQL Editor" in the left sidebar
   - Click "New query"

3. **Run this SQL:**
   ```sql
   ALTER TABLE seo_blog_posts ADD COLUMN IF NOT EXISTS author TEXT;
   ```

4. **Run the update script:**
   ```bash
   cd backend
   npx ts-node scripts/updateBlogPosts.ts
   ```

This will add unique author names to each blog post:
- Sarah Chen
- Marcus Rodriguez
- Emily Watson
- David Kim
- Alexandra Thompson

The author names will now appear on both the blog listing page and individual blog post pages.

