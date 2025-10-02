-- FIX ALL DEALER APPROVAL ISSUES AT ONCE
-- This script fixes all missing columns and ensures all dealer form data is preserved

-- 1. Add missing approved_at column to dealer_applications table
ALTER TABLE dealer_applications 
ADD COLUMN IF NOT EXISTS approved_at TIMESTAMP WITH TIME ZONE;

-- 2. Add missing rejected_at column to dealer_applications table  
ALTER TABLE dealer_applications 
ADD COLUMN IF NOT EXISTS rejected_at TIMESTAMP WITH TIME ZONE;

-- 3. Add missing clerk_id column to users table (if not exists)
ALTER TABLE users 
ADD COLUMN IF NOT EXISTS clerk_id TEXT;

-- 4. Ensure all dealer form fields are in users table
-- Add any missing columns that might be needed for dealer data

-- Check if experience_years column exists in users table, if not add it
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'users' AND column_name = 'experience_years') THEN
        ALTER TABLE users ADD COLUMN experience_years INTEGER;
    END IF;
END $$;

-- Check if annual_turnover column exists in users table, if not add it
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'users' AND column_name = 'annual_turnover') THEN
        ALTER TABLE users ADD COLUMN annual_turnover TEXT;
    END IF;
END $$;

-- Check if interested_brands column exists in users table, if not add it
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'users' AND column_name = 'interested_brands') THEN
        ALTER TABLE users ADD COLUMN interested_brands TEXT[];
    END IF;
END $$;

-- 5. Create index on clerk_id for better performance
CREATE INDEX IF NOT EXISTS idx_users_clerk_id ON users(clerk_id);

-- 6. Create index on approved_at for better performance
CREATE INDEX IF NOT EXISTS idx_dealer_applications_approved_at ON dealer_applications(approved_at);

-- 7. Verify the changes
SELECT 
    table_name,
    column_name,
    data_type,
    is_nullable
FROM information_schema.columns 
WHERE table_name IN ('users', 'dealer_applications')
    AND column_name IN ('approved_at', 'rejected_at', 'clerk_id', 'experience_years', 'annual_turnover', 'interested_brands')
ORDER BY table_name, column_name;

-- 8. Show current dealer_applications structure
SELECT 
    column_name,
    data_type,
    is_nullable,
    column_default
FROM information_schema.columns 
WHERE table_name = 'dealer_applications'
ORDER BY ordinal_position;

-- Success message
DO $$
BEGIN
    RAISE NOTICE '✅ All dealer approval database issues fixed!';
    RAISE NOTICE '📋 Changes made:';
    RAISE NOTICE '   1. Added approved_at column to dealer_applications';
    RAISE NOTICE '   2. Added rejected_at column to dealer_applications';
    RAISE NOTICE '   3. Ensured clerk_id column exists in users';
    RAISE NOTICE '   4. Added missing dealer form fields to users table';
    RAISE NOTICE '   5. Created performance indexes';
    RAISE NOTICE '';
    RAISE NOTICE '🔄 Next: Update the API to handle existing Clerk users';
END $$;
