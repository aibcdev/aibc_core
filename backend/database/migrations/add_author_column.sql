-- Add author column to seo_blog_posts table
ALTER TABLE seo_blog_posts 
ADD COLUMN IF NOT EXISTS author TEXT;

