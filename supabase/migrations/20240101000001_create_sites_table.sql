-- Create sites table
-- This table stores site information including managed and unmanaged sites
-- Managed sites are linked to users, unmanaged sites are anonymous

CREATE TABLE IF NOT EXISTS sites (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  managed BOOLEAN DEFAULT false,
  views INTEGER DEFAULT 0,
  status TEXT DEFAULT 'live' CHECK (status IN ('live', 'draft', 'archived')),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create unique index for case-insensitive slug lookups
CREATE UNIQUE INDEX IF NOT EXISTS idx_sites_slug_lower ON sites (LOWER(slug));

-- Create indexes for performance on common queries
CREATE INDEX IF NOT EXISTS idx_sites_user_id ON sites (user_id);
CREATE INDEX IF NOT EXISTS idx_sites_slug ON sites (slug);
CREATE INDEX IF NOT EXISTS idx_sites_created_at ON sites (created_at DESC);

-- Add trigger to automatically update updated_at timestamp
CREATE TRIGGER update_sites_updated_at
  BEFORE UPDATE ON sites
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Add comments for documentation
COMMENT ON TABLE sites IS 'Stores site information for both managed and unmanaged sites';
COMMENT ON COLUMN sites.id IS 'Unique identifier for the site (UUID)';
COMMENT ON COLUMN sites.user_id IS 'Foreign key to users table (NULL for unmanaged sites)';
COMMENT ON COLUMN sites.name IS 'Display name of the site';
COMMENT ON COLUMN sites.slug IS 'Unique URL-friendly identifier (case-insensitive)';
COMMENT ON COLUMN sites.managed IS 'Whether the site is managed by a user (true) or anonymous (false)';
COMMENT ON COLUMN sites.views IS 'Total number of views for the site';
COMMENT ON COLUMN sites.status IS 'Current status of the site (live, draft, or archived)';
COMMENT ON COLUMN sites.created_at IS 'Timestamp when the site was created';
COMMENT ON COLUMN sites.updated_at IS 'Timestamp when the site was last updated';
