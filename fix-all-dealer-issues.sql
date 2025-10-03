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

-- 9. Add email verification and password management related columns
-- Add clerk_user_id column to users table (for better Clerk integration)
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'users' AND column_name = 'clerk_user_id') THEN
        ALTER TABLE users ADD COLUMN clerk_user_id TEXT UNIQUE;
        CREATE INDEX IF NOT EXISTS idx_users_clerk_user_id ON users(clerk_user_id);
    END IF;
END $$;

-- Add email_verified column to users table
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'users' AND column_name = 'email_verified') THEN
        ALTER TABLE users ADD COLUMN email_verified BOOLEAN DEFAULT false;
        CREATE INDEX IF NOT EXISTS idx_users_email_verified ON users(email_verified);
    END IF;
END $$;

-- Add email_verified_at column to users table
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'users' AND column_name = 'email_verified_at') THEN
        ALTER TABLE users ADD COLUMN email_verified_at TIMESTAMP WITH TIME ZONE;
    END IF;
END $$;

-- Add password_changed_at column to users table (for tracking password changes)
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'users' AND column_name = 'password_changed_at') THEN
        ALTER TABLE users ADD COLUMN password_changed_at TIMESTAMP WITH TIME ZONE;
    END IF;
END $$;

-- Add last_login_at column to users table
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'users' AND column_name = 'last_login_at') THEN
        ALTER TABLE users ADD COLUMN last_login_at TIMESTAMP WITH TIME ZONE;
    END IF;
END $$;

-- Add invited_by column to users table (for tracking admin invitations)
-- Since this is a Clerk-integrated app, users.id is TEXT type
DO $$
BEGIN
    -- Drop the column if it exists with wrong type
    IF EXISTS (SELECT 1 FROM information_schema.columns 
               WHERE table_name = 'users' AND column_name = 'invited_by' AND data_type = 'uuid') THEN
        ALTER TABLE users DROP COLUMN invited_by;
        RAISE NOTICE 'Dropped existing invited_by column with wrong type';
    END IF;
    
    -- Add invited_by column with TEXT type (matching Clerk user IDs)
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'users' AND column_name = 'invited_by') THEN
        ALTER TABLE users ADD COLUMN invited_by TEXT REFERENCES users(id);
        RAISE NOTICE 'Added invited_by column with TEXT type for Clerk integration';
    END IF;
END $$;

-- Add invited_at column to users table
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'users' AND column_name = 'invited_at') THEN
        ALTER TABLE users ADD COLUMN invited_at TIMESTAMP WITH TIME ZONE;
    END IF;
END $$;

-- Add account_status column to users table (active, suspended, pending_verification)
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'users' AND column_name = 'account_status') THEN
        ALTER TABLE users ADD COLUMN account_status TEXT DEFAULT 'active' 
        CHECK (account_status IN ('active', 'suspended', 'pending_verification'));
        CREATE INDEX IF NOT EXISTS idx_users_account_status ON users(account_status);
    END IF;
END $$;

-- 10. Update RLS policies for email verification and security features
-- Allow users to update their email verification status
DROP POLICY IF EXISTS "Users can update email verification" ON public.users;
CREATE POLICY "Users can update email verification" ON public.users 
FOR UPDATE USING (auth.uid()::text = id) 
WITH CHECK (auth.uid()::text = id);

-- Allow admins to invite dealers (insert with invited_by)
DROP POLICY IF EXISTS "Admins can invite dealers" ON public.users;
CREATE POLICY "Admins can invite dealers" ON public.users 
FOR INSERT WITH CHECK (
    EXISTS (
        SELECT 1 FROM public.users 
        WHERE id = auth.uid()::text AND role = 'admin'
    )
);

-- 11. Create audit table for security events (optional but recommended)
-- Since this is a Clerk-integrated app, users.id is TEXT type
DO $$
BEGIN
    -- Drop the table if it exists with wrong user_id type
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'security_audit') THEN
        -- Check if user_id column has wrong type
        IF EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'security_audit' AND column_name = 'user_id' AND data_type = 'uuid') THEN
            DROP TABLE public.security_audit;
            RAISE NOTICE 'Dropped existing security_audit table with wrong user_id type';
        END IF;
    END IF;
    
    -- Create the table with TEXT user_id (matching Clerk user IDs)
    IF NOT EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'security_audit') THEN
        CREATE TABLE public.security_audit (
            id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
            user_id TEXT REFERENCES public.users(id) ON DELETE CASCADE,
            event_type TEXT NOT NULL CHECK (event_type IN (
                'login', 'logout', 'password_change', 'email_verification', 
                'account_created', 'account_suspended', 'failed_login'
            )),
            ip_address INET,
            user_agent TEXT,
            metadata JSONB DEFAULT '{}',
            created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
        );
        
        RAISE NOTICE 'Created security_audit table with TEXT user_id for Clerk integration';
    END IF;
END $$;

-- Create index for security audit
CREATE INDEX IF NOT EXISTS idx_security_audit_user_id ON public.security_audit(user_id);
CREATE INDEX IF NOT EXISTS idx_security_audit_event_type ON public.security_audit(event_type);
CREATE INDEX IF NOT EXISTS idx_security_audit_created_at ON public.security_audit(created_at);

-- Enable RLS on security audit table
ALTER TABLE public.security_audit ENABLE ROW LEVEL SECURITY;

-- Security audit policies
CREATE POLICY "Users can view their own audit logs" ON public.security_audit 
FOR SELECT USING (user_id = auth.uid()::text);

CREATE POLICY "Admins can view all audit logs" ON public.security_audit 
FOR SELECT USING (
    EXISTS (
        SELECT 1 FROM public.users 
        WHERE id = auth.uid()::text AND role = 'admin'
    )
);

CREATE POLICY "System can insert audit logs" ON public.security_audit 
FOR INSERT WITH CHECK (true);

-- 12. Update verification status for existing users
-- Set email_verified to true for existing admin users (assuming they're already verified)
UPDATE users 
SET email_verified = true, 
    email_verified_at = NOW(),
    account_status = 'active'
WHERE role = 'admin' AND email_verified IS NULL;

-- Set pending verification for existing dealers who haven't been verified
UPDATE users 
SET account_status = 'pending_verification'
WHERE role = 'dealer' AND email_verified IS NULL;

-- Success message
DO $$
BEGIN
    RAISE NOTICE '✅ All dealer approval and security database issues fixed!';
    RAISE NOTICE '📋 Changes made:';
    RAISE NOTICE '   1. Added approved_at column to dealer_applications';
    RAISE NOTICE '   2. Added rejected_at column to dealer_applications';
    RAISE NOTICE '   3. Ensured clerk_id column exists in users';
    RAISE NOTICE '   4. Added missing dealer form fields to users table';
    RAISE NOTICE '   5. Added email verification columns (email_verified, email_verified_at)';
    RAISE NOTICE '   6. Added password management columns (password_changed_at, last_login_at)';
    RAISE NOTICE '   7. Added invitation tracking columns (invited_by, invited_at)';
    RAISE NOTICE '   8. Added account_status column for user management';
    RAISE NOTICE '   9. Added clerk_user_id for better Clerk integration';
    RAISE NOTICE '   10. Created security_audit table for tracking security events';
    RAISE NOTICE '   11. Updated RLS policies for email verification features';
    RAISE NOTICE '   12. Created performance indexes for new columns';
    RAISE NOTICE '   13. Set verification status for existing users';
    RAISE NOTICE '';
    RAISE NOTICE '🔄 Next: Configure Clerk dashboard and test authentication flows';
END $$;
