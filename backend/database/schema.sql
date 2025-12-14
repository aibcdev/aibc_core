-- SEO Blog Database Schema for Supabase PostgreSQL

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Blog Posts Table
CREATE TABLE IF NOT EXISTS seo_blog_posts (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  slug TEXT UNIQUE NOT NULL,
  title TEXT NOT NULL,
  meta_description TEXT,
  content TEXT NOT NULL,
  excerpt TEXT,
  featured_image_url TEXT,
  category TEXT,
  tags TEXT[] DEFAULT '{}',
  target_keywords TEXT[] DEFAULT '{}',
  status TEXT NOT NULL DEFAULT 'draft' CHECK (status IN ('draft', 'published', 'scheduled')),
  published_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  word_count INTEGER,
  reading_time INTEGER,
  views INTEGER DEFAULT 0,
  seo_score INTEGER,
  internal_links JSONB DEFAULT '{}',
  structured_data JSONB DEFAULT '{}'
);

-- Keywords Table
CREATE TABLE IF NOT EXISTS seo_keywords (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  keyword TEXT UNIQUE NOT NULL,
  search_volume INTEGER,
  competition_score INTEGER CHECK (competition_score >= 0 AND competition_score <= 100),
  current_ranking INTEGER,
  target_url TEXT,
  status TEXT NOT NULL DEFAULT 'targeting' CHECK (status IN ('targeting', 'ranking', 'tracked')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Content Performance Table
CREATE TABLE IF NOT EXISTS seo_content_performance (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  post_id UUID NOT NULL REFERENCES seo_blog_posts(id) ON DELETE CASCADE,
  date DATE NOT NULL,
  organic_views INTEGER DEFAULT 0,
  organic_clicks INTEGER DEFAULT 0,
  avg_position NUMERIC(5, 2),
  impressions INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(post_id, date)
);

-- Indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_blog_posts_status ON seo_blog_posts(status);
CREATE INDEX IF NOT EXISTS idx_blog_posts_slug ON seo_blog_posts(slug);
CREATE INDEX IF NOT EXISTS idx_blog_posts_category ON seo_blog_posts(category);
CREATE INDEX IF NOT EXISTS idx_blog_posts_published_at ON seo_blog_posts(published_at DESC);
CREATE INDEX IF NOT EXISTS idx_keywords_status ON seo_keywords(status);
CREATE INDEX IF NOT EXISTS idx_keywords_keyword ON seo_keywords(keyword);
CREATE INDEX IF NOT EXISTS idx_performance_post_id ON seo_content_performance(post_id);
CREATE INDEX IF NOT EXISTS idx_performance_date ON seo_content_performance(date DESC);
CREATE INDEX IF NOT EXISTS idx_performance_post_date ON seo_content_performance(post_id, date DESC);

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Triggers to auto-update updated_at
CREATE TRIGGER update_blog_posts_updated_at BEFORE UPDATE ON seo_blog_posts
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_keywords_updated_at BEFORE UPDATE ON seo_keywords
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_performance_updated_at BEFORE UPDATE ON seo_content_performance
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Full-text search index for blog posts
CREATE INDEX IF NOT EXISTS idx_blog_posts_search ON seo_blog_posts USING gin(to_tsvector('english', title || ' ' || COALESCE(meta_description, '') || ' ' || content));

-- Function to increment post views
CREATE OR REPLACE FUNCTION increment_post_views(post_slug TEXT)
RETURNS void AS $$
BEGIN
  UPDATE seo_blog_posts
  SET views = COALESCE(views, 0) + 1
  WHERE slug = post_slug;
END;
$$ LANGUAGE plpgsql;

