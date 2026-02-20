-- Create site_files table
-- This table stores metadata for all files associated with a site
-- Files are stored externally (Pastebin for text, ImgBB for images)

CREATE TABLE IF NOT EXISTS site_files (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  site_id UUID NOT NULL REFERENCES sites(id) ON DELETE CASCADE,
  path TEXT NOT NULL,
  storage_url TEXT NOT NULL,
  mime_type TEXT NOT NULL,
  size INTEGER NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  CONSTRAINT unique_site_file_path UNIQUE (site_id, path)
);

-- Create index on site_id for efficient queries
CREATE INDEX IF NOT EXISTS idx_site_files_site_id ON site_files (site_id);

-- Create index on path for lookups
CREATE INDEX IF NOT EXISTS idx_site_files_path ON site_files (path);

-- Create composite index for common queries
CREATE INDEX IF NOT EXISTS idx_site_files_site_id_path ON site_files (site_id, path);

-- Add trigger to automatically update updated_at timestamp
CREATE TRIGGER update_site_files_updated_at
  BEFORE UPDATE ON site_files
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Add comments for documentation
COMMENT ON TABLE site_files IS 'Stores metadata for files associated with sites';
COMMENT ON COLUMN site_files.id IS 'Unique identifier for the file record (UUID)';
COMMENT ON COLUMN site_files.site_id IS 'Foreign key to sites table (CASCADE delete)';
COMMENT ON COLUMN site_files.path IS 'File path within the site (e.g., index.html, css/style.css)';
COMMENT ON COLUMN site_files.storage_url IS 'External storage URL (Pastebin or ImgBB)';
COMMENT ON COLUMN site_files.mime_type IS 'MIME type of the file (e.g., text/html, image/png)';
COMMENT ON COLUMN site_files.size IS 'File size in bytes';
COMMENT ON COLUMN site_files.created_at IS 'Timestamp when the file was uploaded';
COMMENT ON COLUMN site_files.updated_at IS 'Timestamp when the file was last updated';
