-- Migration: Create study_groups table for dynamic group tracking
-- This allows the app to work with multiple groups instead of hardcoded addresses

CREATE TABLE IF NOT EXISTS study_groups (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  group_address TEXT UNIQUE NOT NULL,
  chain_id INTEGER NOT NULL DEFAULT 11155111,
  title TEXT NOT NULL,
  description TEXT,
  subject TEXT,
  stake_amount TEXT NOT NULL,
  max_members INTEGER NOT NULL,
  duration_days INTEGER NOT NULL,
  creator_address TEXT NOT NULL,
  factory_address TEXT NOT NULL,
  created_at TIMESTAMP DEFAULT NOW(),
  blockchain_tx_hash TEXT,
  is_active BOOLEAN DEFAULT TRUE
);

-- Indexes for common queries
CREATE INDEX IF NOT EXISTS idx_groups_creator ON study_groups(creator_address);
CREATE INDEX IF NOT EXISTS idx_groups_address ON study_groups(group_address);
CREATE INDEX IF NOT EXISTS idx_groups_active ON study_groups(is_active) WHERE is_active = true;

-- Enable RLS
ALTER TABLE study_groups ENABLE ROW LEVEL SECURITY;

-- Policy: Anyone can read active groups
CREATE POLICY "Anyone can view active groups"
  ON study_groups FOR SELECT
  USING (is_active = true);

-- Policy: Authenticated users can insert their own groups
CREATE POLICY "Users can create groups"
  ON study_groups FOR INSERT
  WITH CHECK (true);

-- Policy: Creators can update their own groups
CREATE POLICY "Creators can update their groups"
  ON study_groups FOR UPDATE
  USING (creator_address = auth.jwt() ->> 'sub');
