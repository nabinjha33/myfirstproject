-- Fix the users table to support Clerk string IDs instead of UUID
-- Run this in your Supabase SQL editor

-- First, check if there are any existing users (backup if needed)
-- SELECT * FROM users;

-- Drop and recreate the users table with proper Clerk ID support
DROP TABLE IF EXISTS users CASCADE;

CREATE TABLE users (
  id TEXT PRIMARY KEY,  -- Changed from UUID to TEXT to support Clerk IDs
  email TEXT UNIQUE NOT NULL,
  full_name TEXT,
  role TEXT DEFAULT 'dealer' CHECK (role IN ('dealer', 'admin')),
  dealer_status TEXT DEFAULT 'pending' CHECK (dealer_status IN ('pending', 'approved', 'rejected')),
  business_name TEXT,
  phone TEXT,
  whatsapp TEXT,
  address TEXT,
  vat_pan TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create indexes for better performance
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_role ON users(role);
CREATE INDEX idx_users_dealer_status ON users(dealer_status);

-- Enable RLS (Row Level Security)
ALTER TABLE users ENABLE ROW LEVEL SECURITY;

-- Create RLS policies
CREATE POLICY "Users can view their own data" ON users
  FOR SELECT USING (auth.uid()::text = id);

CREATE POLICY "Users can update their own data" ON users
  FOR UPDATE USING (auth.uid()::text = id);

CREATE POLICY "Admins can view all users" ON users
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM users 
      WHERE id = auth.uid()::text 
      AND role = 'admin'
    )
  );

CREATE POLICY "Admins can update all users" ON users
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM users 
      WHERE id = auth.uid()::text 
      AND role = 'admin'
    )
  );

CREATE POLICY "Admins can insert users" ON users
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM users 
      WHERE id = auth.uid()::text 
      AND role = 'admin'
    )
  );

-- Allow public insert for initial admin creation (will be restricted by application logic)
CREATE POLICY "Allow initial admin creation" ON users
  FOR INSERT WITH CHECK (role = 'admin');

-- Create updated_at trigger
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_users_updated_at 
  BEFORE UPDATE ON users 
  FOR EACH ROW 
  EXECUTE FUNCTION update_updated_at_column();

-- Insert a comment for documentation
COMMENT ON TABLE users IS 'User accounts table supporting Clerk string IDs';
COMMENT ON COLUMN users.id IS 'Clerk user ID (string format like user_xxxxx)';
COMMENT ON COLUMN users.role IS 'User role: dealer or admin';
COMMENT ON COLUMN users.dealer_status IS 'Dealer approval status: pending, approved, or rejected';
