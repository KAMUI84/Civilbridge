-- Add google_id column to users table for Google OAuth support
ALTER TABLE users 
ADD COLUMN google_id VARCHAR(255) NULL UNIQUE AFTER phone,
MODIFY COLUMN password_hash VARCHAR(255) NULL;

-- Add index for google_id lookups
CREATE INDEX idx_users_google_id ON users(google_id);
