-- Add clerk_id column to existing users table
-- Run this in your Supabase SQL editor

-- Add the clerk_id column to store Clerk user IDs
ALTER TABLE users ADD COLUMN IF NOT EXISTS clerk_id TEXT UNIQUE;

-- Create index for better performance
CREATE INDEX IF NOT EXISTS idx_users_clerk_id ON users(clerk_id);

-- Add comment for documentation
COMMENT ON COLUMN users.clerk_id IS 'Clerk user ID (string format like user_xxxxx) for authentication mapping';

-- Update the middleware check function to use clerk_id
-- You'll need to update your auth functions to check clerk_id instead of id
