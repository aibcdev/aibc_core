-- Continuous Learning & Improvement Database Schema
-- This schema supports machine learning and continuous improvement for the digital scan

-- User Feedback Table
CREATE TABLE IF NOT EXISTS user_feedback (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  scan_id TEXT NOT NULL,
  username TEXT NOT NULL,
  feedback_type TEXT NOT NULL CHECK (feedback_type IN ('approval', 'edit', 'regeneration', 'dismissal', 'rating', 'custom')),
  content_id TEXT,
  content_title TEXT,
  rating INTEGER CHECK (rating >= 1 AND rating <= 5),
  comment TEXT,
  metadata JSONB,
  timestamp TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_user_feedback_scan_id ON user_feedback(scan_id);
CREATE INDEX IF NOT EXISTS idx_user_feedback_username ON user_feedback(username);
CREATE INDEX IF NOT EXISTS idx_user_feedback_type ON user_feedback(feedback_type);
CREATE INDEX IF NOT EXISTS idx_user_feedback_timestamp ON user_feedback(timestamp DESC);

-- Scan Quality Metrics Table
CREATE TABLE IF NOT EXISTS scan_quality_metrics (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  scan_id TEXT NOT NULL UNIQUE,
  username TEXT NOT NULL,
  extraction_confidence DECIMAL(3,2) CHECK (extraction_confidence >= 0 AND extraction_confidence <= 1),
  brand_dna_accuracy DECIMAL(3,2) CHECK (brand_dna_accuracy >= 0 AND brand_dna_accuracy <= 1),
  content_ideas_count INTEGER DEFAULT 0,
  content_ideas_approved INTEGER DEFAULT 0,
  content_ideas_edited INTEGER DEFAULT 0,
  content_ideas_dismissed INTEGER DEFAULT 0,
  average_rating DECIMAL(3,2) CHECK (average_rating >= 0 AND average_rating <= 5),
  timestamp TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_scan_quality_username ON scan_quality_metrics(username);
CREATE INDEX IF NOT EXISTS idx_scan_quality_timestamp ON scan_quality_metrics(timestamp DESC);

-- Learning Insights Table
CREATE TABLE IF NOT EXISTS learning_insights (
  id TEXT PRIMARY KEY,
  category TEXT NOT NULL CHECK (category IN ('prompt_optimization', 'extraction_improvement', 'content_generation', 'brand_dna', 'platform_specific')),
  insight TEXT NOT NULL,
  recommendation TEXT NOT NULL,
  confidence DECIMAL(3,2) CHECK (confidence >= 0 AND confidence <= 1),
  evidence JSONB NOT NULL,
  applied BOOLEAN DEFAULT FALSE,
  applied_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_learning_insights_category ON learning_insights(category);
CREATE INDEX IF NOT EXISTS idx_learning_insights_applied ON learning_insights(applied);
CREATE INDEX IF NOT EXISTS idx_learning_insights_confidence ON learning_insights(confidence DESC);

-- Prompt Versions Table
CREATE TABLE IF NOT EXISTS prompt_versions (
  id TEXT PRIMARY KEY,
  category TEXT NOT NULL CHECK (category IN ('content_generation', 'brand_identity', 'competitor_analysis', 'dna_extraction')),
  version INTEGER NOT NULL,
  prompt TEXT NOT NULL,
  system_prompt TEXT,
  performance JSONB DEFAULT '{"averageRating": 0, "approvalRate": 0, "usageCount": 0}'::jsonb,
  usage_count INTEGER DEFAULT 0,
  is_active BOOLEAN DEFAULT FALSE,
  based_on_insight_id TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  applied_at TIMESTAMPTZ,
  UNIQUE(category, version)
);

CREATE INDEX IF NOT EXISTS idx_prompt_versions_category ON prompt_versions(category);
CREATE INDEX IF NOT EXISTS idx_prompt_versions_active ON prompt_versions(is_active);
CREATE INDEX IF NOT EXISTS idx_prompt_versions_category_version ON prompt_versions(category, version DESC);

-- Content Performance Tracking Table
CREATE TABLE IF NOT EXISTS content_performance (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  content_id TEXT NOT NULL,
  scan_id TEXT NOT NULL,
  username TEXT NOT NULL,
  platform TEXT,
  content_type TEXT,
  title TEXT,
  generated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  approved_at TIMESTAMPTZ,
  edited_at TIMESTAMPTZ,
  dismissed_at TIMESTAMPTZ,
  published_at TIMESTAMPTZ,
  rating INTEGER CHECK (rating >= 1 AND rating <= 5),
  engagement_metrics JSONB, -- Store platform-specific engagement if available
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_content_performance_scan_id ON content_performance(scan_id);
CREATE INDEX IF NOT EXISTS idx_content_performance_username ON content_performance(username);
CREATE INDEX IF NOT EXISTS idx_content_performance_platform ON content_performance(platform);
CREATE INDEX IF NOT EXISTS idx_content_performance_generated_at ON content_performance(generated_at DESC);

-- Brand DNA Accuracy Tracking
CREATE TABLE IF NOT EXISTS brand_dna_accuracy (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  scan_id TEXT NOT NULL,
  username TEXT NOT NULL,
  user_rated_accuracy DECIMAL(3,2) CHECK (user_rated_accuracy >= 0 AND user_rated_accuracy <= 1),
  extraction_confidence DECIMAL(3,2),
  dna_components JSONB, -- Store which components were accurate/inaccurate
  feedback TEXT,
  timestamp TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_brand_dna_accuracy_username ON brand_dna_accuracy(username);
CREATE INDEX IF NOT EXISTS idx_brand_dna_accuracy_timestamp ON brand_dna_accuracy(timestamp DESC);

-- A/B Test Results Table
CREATE TABLE IF NOT EXISTS ab_test_results (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  test_name TEXT NOT NULL,
  variant_a TEXT NOT NULL,
  variant_b TEXT NOT NULL,
  scan_id TEXT NOT NULL,
  username TEXT NOT NULL,
  selected_variant TEXT NOT NULL CHECK (selected_variant IN ('A', 'B')),
  outcome TEXT NOT NULL CHECK (outcome IN ('approved', 'edited', 'dismissed')),
  rating INTEGER CHECK (rating >= 1 AND rating <= 5),
  timestamp TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_ab_test_results_test_name ON ab_test_results(test_name);
CREATE INDEX IF NOT EXISTS idx_ab_test_results_timestamp ON ab_test_results(timestamp DESC);







