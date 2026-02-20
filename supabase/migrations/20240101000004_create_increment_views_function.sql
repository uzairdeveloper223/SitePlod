-- Create increment_views RPC function
-- This function atomically increments the views counter for a site
-- Uses atomic increment to prevent race conditions

CREATE OR REPLACE FUNCTION increment_views(site_id UUID)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  -- Atomically increment the views counter
  UPDATE sites
  SET views = views + 1
  WHERE id = site_id;
END;
$$;

-- Add comment for documentation
COMMENT ON FUNCTION increment_views(UUID) IS 'Atomically increments the views counter for a site to prevent race conditions';
