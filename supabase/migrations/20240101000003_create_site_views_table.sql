-- Create site_views table
-- This table stores individual view records for analytics tracking
-- Each record represents a single page view with timestamp and referrer

CREATE TABLE IF NOT EXISTS site_views (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  site_id UUID NOT NULL REFERENCES sites(id) ON DELETE CASCADE,
  viewed_at TIMESTAMPTZ DEFAULT NOW(),
  referrer TEXT
);

-- Create composite index on site_id and viewed_at for efficient analytics queries
CREATE INDEX IF NOT EXISTS idx_site_views_site_id_viewed_at ON site_views (site_id, viewed_at DESC);

-- Create index on site_id for general queries
CREATE INDEX IF NOT EXISTS idx_site_views_site_id ON site_views (site_id);

-- Add comments for documentation
COMMENT ON TABLE site_views IS 'Stores individual view records for site analytics tracking';
COMMENT ON COLUMN site_views.id IS 'Unique identifier for the view record (UUID)';
COMMENT ON COLUMN site_views.site_id IS 'Foreign key to sites table (CASCADE delete)';
COMMENT ON COLUMN site_views.viewed_at IS 'Timestamp when the site was viewed';
COMMENT ON COLUMN site_views.referrer IS 'HTTP referrer header from the view request (optional)';
