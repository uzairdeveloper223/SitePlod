-- Add welcome_email_sent column to users table
-- This tracks whether the welcome email has been sent to the user

ALTER TABLE users 
ADD COLUMN IF NOT EXISTS welcome_email_sent BOOLEAN DEFAULT FALSE;

-- Add index for performance
CREATE INDEX IF NOT EXISTS idx_users_welcome_email_sent ON users (welcome_email_sent) WHERE welcome_email_sent = FALSE;

-- Add comment for documentation
COMMENT ON COLUMN users.welcome_email_sent IS 'Tracks whether the welcome email has been sent to the user';
