-- AIBC Marketing OS Production Schema
-- Version: 2.0 (Postgres + Vector Hybrid)

-- 0. Enable Vector Extension (Requires pgvector)
create extension if not exists vector;

-- 1. Brands Table (Context Anchor)
create table if not exists brands (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  industry text,
  tone_profile jsonb,
  positioning jsonb,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 2. Agents Table (Expanded for Neuroscience)
create type agent_type_enum as enum (
  'competitor_intelligence',
  'content_director',
  'brand_architect',
  'growth_strategy',
  'executive_briefing'
);

create table if not exists agents (
  id uuid primary key default gen_random_uuid(),
  brand_id uuid references brands(id) on delete cascade not null,
  type agent_type_enum not null,
  name text not null,
  role text not null, -- Specific System Prompt Role
  
  -- Confidence & Neuroscience (Dynamic State)
  baseline_confidence float default 0.7,
  current_confidence float default 0.7,
  assertiveness float default 0.5,
  volatility float default 0.1, -- How much confidence swings per event
  
  personality_profile jsonb, -- 9-dimensional matrix
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  unique(brand_id, type)
);

-- 3. Memory Items (4-Layer System)
create table if not exists memory_items (
  id uuid primary key default gen_random_uuid(),
  agent_id uuid references agents(id) on delete cascade not null,
  
  type text not null check (type in ('short_term', 'working', 'long_term', 'performance')),
  content text not null,
  
  confidence float default 0.5,
  metadata jsonb, -- Source signal ID, impact score
  
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  expires_at timestamp with time zone, -- Auto-decay for short_term
  last_accessed_at timestamp with time zone
);

create index memory_type_idx on memory_items(agent_id, type);

-- 4. Memory Embeddings (Vector Search)
create table if not exists memory_embeddings (
  id uuid primary key default gen_random_uuid(),
  memory_id uuid references memory_items(id) on delete cascade not null,
  agent_id uuid references agents(id) on delete cascade not null,
  embedding vector(1536) -- Compatible with OpenAI/Gemini embeddings
);

-- 5. Signals Table (Strict Filtering)
create table if not exists signals (
  id uuid primary key default gen_random_uuid(),
  brand_id uuid references brands(id) on delete cascade not null,
  
  source text not null,
  category text not null, -- 'competitor', 'trend', 'brand', 'opportunity'
  
  title text not null,
  content text,
  url text,
  
  confidence float not null, -- Signal quality (Rule: < 0.65 = Log Only)
  relevance float not null, -- Impact score
  
  payload jsonb, -- Raw data dump
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 6. Signal Embeddings (Trend Detection)
create table if not exists signal_embeddings (
  id uuid primary key default gen_random_uuid(),
  signal_id uuid references signals(id) on delete cascade not null,
  embedding vector(1536)
);

-- 7. Tasks Table (Actionable Dashboard)
create table if not exists tasks (
  id uuid primary key default gen_random_uuid(),
  agent_owner uuid references agents(id) on delete cascade not null,
  
  title text not null,
  description text,
  
  status text not null default 'open' check (status in ('open', 'approved', 'rejected', 'completed', 'in_progress')),
  priority text default 'medium' check (priority in ('low', 'medium', 'high', 'critical')),
  
  impact_estimate float, -- 0-1 score
  confidence float, -- Agent's confidence in this task
  
  metadata jsonb, -- Linked signal IDs, screenshots
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone
);

-- 8. Decisions Table (Outcome Tracking)
create table if not exists decisions (
  id uuid primary key default gen_random_uuid(),
  task_id uuid references tasks(id) on delete cascade not null,
  
  outcome text not null check (outcome in ('approved', 'rejected', 'modified')),
  reason text, -- User provided reason or auto-reason
  
  decided_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 9. Confidence Events (Audit Log)
create table if not exists confidence_events (
  id uuid primary key default gen_random_uuid(),
  agent_id uuid references agents(id) on delete cascade not null,
  
  delta float not null, -- e.g. +0.05 or -0.10
  reason text not null, -- e.g. "Task Rejected", "alert_verified"
  new_confidence float not null,
  
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 10. Chat Messages (Secondary Interface)
create table if not exists chat_messages (
  id uuid primary key default gen_random_uuid(),
  agent_id uuid references agents(id) on delete cascade not null,
  role text not null,
  content text not null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Enable RLS (Default Security)
alter table brands enable row level security;
alter table agents enable row level security;
alter table memory_items enable row level security;
alter table signals enable row level security;
alter table tasks enable row level security;
alter table decisions enable row level security;
alter table confidence_events enable row level security;

-- Policies (Simplified for prototype, lock down in prod)
create policy "Allow all access" on brands for all using (true);
create policy "Allow all access" on agents for all using (true);
create policy "Allow all access" on memory_items for all using (true);
create policy "Allow all access" on signals for all using (true);
create policy "Allow all access" on tasks for all using (true);
create policy "Allow all access" on decisions for all using (true);
create policy "Allow all access" on confidence_events for all using (true);
