-- Protardio Whitelist Registration Schema
-- Run this in Supabase SQL Editor

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create registrations table
CREATE TABLE IF NOT EXISTS registrations (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  fid BIGINT NOT NULL UNIQUE,
  username TEXT NOT NULL,
  wallet_address TEXT NOT NULL,
  neynar_score DECIMAL(4,2) NOT NULL,
  follows_protardio BOOLEAN DEFAULT FALSE,
  has_shared BOOLEAN DEFAULT FALSE,
  registered_at TIMESTAMPTZ DEFAULT NOW(),
  tier TEXT NOT NULL CHECK(tier IN ('phase1_tier3', 'phase2_tier1')),
  status TEXT DEFAULT 'pending' CHECK(status IN ('pending', 'approved', 'rejected')),
  verification_notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create indexes for common queries
CREATE INDEX IF NOT EXISTS idx_registrations_fid ON registrations(fid);
CREATE INDEX IF NOT EXISTS idx_registrations_wallet ON registrations(wallet_address);
CREATE INDEX IF NOT EXISTS idx_registrations_tier ON registrations(tier);
CREATE INDEX IF NOT EXISTS idx_registrations_status ON registrations(status);
CREATE INDEX IF NOT EXISTS idx_registrations_created ON registrations(created_at DESC);

-- Create unique constraint on wallet (normalized to lowercase)
CREATE UNIQUE INDEX IF NOT EXISTS idx_registrations_wallet_unique 
ON registrations(LOWER(wallet_address));

-- Auto-update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_registrations_updated_at
  BEFORE UPDATE ON registrations
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Row Level Security (RLS)
ALTER TABLE registrations ENABLE ROW LEVEL SECURITY;

-- Policy: Allow insert from authenticated requests (via service role)
CREATE POLICY "Allow insert for service role" ON registrations
  FOR INSERT
  WITH CHECK (true);

-- Policy: Allow select for service role
CREATE POLICY "Allow select for service role" ON registrations
  FOR SELECT
  USING (true);

-- Policy: Allow update for service role
CREATE POLICY "Allow update for service role" ON registrations
  FOR UPDATE
  USING (true);

-- Create view for export (CSV allowlist)
CREATE OR REPLACE VIEW allowlist_export AS
SELECT 
  wallet_address,
  fid,
  username,
  neynar_score,
  tier,
  registered_at
FROM registrations
WHERE status = 'pending' OR status = 'approved'
ORDER BY registered_at ASC;

-- Stats view
CREATE OR REPLACE VIEW registration_stats AS
SELECT 
  tier,
  status,
  COUNT(*) as count,
  AVG(neynar_score) as avg_score,
  MIN(registered_at) as first_registration,
  MAX(registered_at) as last_registration
FROM registrations
GROUP BY tier, status;

-- Grant permissions (adjust based on your setup)
-- GRANT ALL ON registrations TO service_role;
-- GRANT SELECT ON allowlist_export TO anon;
-- GRANT SELECT ON registration_stats TO anon;
