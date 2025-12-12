export interface BlogPost {
  id: string;
  slug: string;
  title: string;
  meta_description?: string;
  content: string;
  excerpt?: string;
  featured_image_url?: string;
  category?: string;
  tags?: string[];
  target_keywords?: string[];
  status: 'draft' | 'published' | 'scheduled';
  published_at?: string;
  created_at: string;
  updated_at: string;
  word_count?: number;
  reading_time?: number;
  views: number;
  seo_score?: number;
  internal_links?: Record<string, string>;
  structured_data?: any;
}

export interface Keyword {
  id: string;
  keyword: string;
  search_volume?: number;
  competition_score?: number; // 1-100
  current_ranking?: number;
  target_url?: string;
  status: 'targeting' | 'ranking' | 'tracked';
  created_at: string;
}

export interface ContentPerformance {
  id: string;
  post_id: string;
  date: string;
  organic_views: number;
  organic_clicks: number;
  avg_position?: number;
  impressions: number;
  created_at: string;
}

export interface BlogListParams {
  page?: number;
  limit?: number;
  category?: string;
  tag?: string;
  status?: 'draft' | 'published' | 'scheduled';
  search?: string;
}

export interface BlogListResponse {
  posts: BlogPost[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface ContentTemplate {
  id: string;
  type: 'how-to' | 'list' | 'guide' | 'comparison' | 'case-study' | 'tools';
  name: string;
  structure: string;
  example_keywords: string[];
}

export interface ContentGenerationRequest {
  keyword: string;
  template_type: ContentTemplate['type'];
  category?: string;
  target_word_count?: number;
}

export interface ContentGenerationResponse {
  post: BlogPost;
  seo_score: number;
  optimization_suggestions: string[];
}

