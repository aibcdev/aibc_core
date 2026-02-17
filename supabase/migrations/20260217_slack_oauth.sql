-- AIBC Slack Multi-Tenant Support
-- Create table for storing workspace-specific OAuth tokens

CREATE TABLE IF NOT EXISTS slack_installations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  team_id TEXT UNIQUE NOT NULL,
  team_name TEXT,
  access_token TEXT NOT NULL,
  bot_user_id TEXT NOT NULL,
  installer_user_id TEXT,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Enable RLS
ALTER TABLE slack_installations ENABLE ROW LEVEL SECURITY;

-- Allow the bridge server to access installations (update with service role in production)
CREATE POLICY "Allow service role access" ON slack_installations
  FOR ALL USING (true);
