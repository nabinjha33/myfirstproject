-- DATABASE UPDATES FOR NEW DEALER AUTHENTICATION FLOW
-- This script updates the database schema to support the new email-first dealer signup flow

-- ============================================================================
-- 1. UPDATE USERS TABLE FOR CLERK INTEGRATION
-- ============================================================================

-- Add clerk_user_id column to link with Clerk authentication
ALTER TABLE public.users ADD COLUMN IF NOT EXISTS clerk_user_id TEXT UNIQUE;

-- Add created_date and updated_date columns for consistency with new flow
ALTER TABLE public.users ADD COLUMN IF NOT EXISTS created_date TIMESTAMP WITH TIME ZONE DEFAULT NOW();
ALTER TABLE public.users ADD COLUMN IF NOT EXISTS updated_date TIMESTAMP WITH TIME ZONE DEFAULT NOW();

-- Update existing records to have created_date and updated_date
UPDATE public.users 
SET 
    created_date = COALESCE(created_at, NOW()),
    updated_date = COALESCE(updated_at, NOW())
WHERE created_date IS NULL OR updated_date IS NULL;

-- Create index for clerk_user_id for better performance
CREATE INDEX IF NOT EXISTS idx_users_clerk_user_id ON public.users(clerk_user_id);

-- ============================================================================
-- 2. UPDATE DEALER_APPLICATIONS TABLE
-- ============================================================================

-- Add rejection_reason column for better rejection handling
ALTER TABLE public.dealer_applications ADD COLUMN IF NOT EXISTS rejection_reason TEXT;

-- Add created_date and updated_date columns for consistency
ALTER TABLE public.dealer_applications ADD COLUMN IF NOT EXISTS created_date TIMESTAMP WITH TIME ZONE DEFAULT NOW();
ALTER TABLE public.dealer_applications ADD COLUMN IF NOT EXISTS updated_date TIMESTAMP WITH TIME ZONE DEFAULT NOW();

-- Update existing records
UPDATE public.dealer_applications 
SET 
    created_date = COALESCE(created_at, NOW()),
    updated_date = COALESCE(updated_at, NOW())
WHERE created_date IS NULL OR updated_date IS NULL;

-- ============================================================================
-- 3. CREATE EMAIL_VERIFICATION_LOGS TABLE (Optional - for tracking)
-- ============================================================================

CREATE TABLE IF NOT EXISTS public.email_verification_logs (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    email TEXT NOT NULL,
    verification_type TEXT NOT NULL CHECK (verification_type IN ('signup', 'password_reset', 'email_change')),
    status TEXT NOT NULL CHECK (status IN ('sent', 'verified', 'expired', 'failed')),
    verification_code TEXT,
    expires_at TIMESTAMP WITH TIME ZONE,
    verified_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for email verification logs
CREATE INDEX IF NOT EXISTS idx_email_verification_logs_email ON public.email_verification_logs(email);
CREATE INDEX IF NOT EXISTS idx_email_verification_logs_status ON public.email_verification_logs(status);
CREATE INDEX IF NOT EXISTS idx_email_verification_logs_type ON public.email_verification_logs(verification_type);

-- ============================================================================
-- 4. CREATE DEALER_APPROVAL_LOGS TABLE (For audit trail)
-- ============================================================================

-- Create the table with admin_id type matching users.id (which is likely TEXT for Supabase auth)
CREATE TABLE IF NOT EXISTS public.dealer_approval_logs (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    application_id UUID REFERENCES public.dealer_applications(id) ON DELETE CASCADE,
    admin_id TEXT, -- Use TEXT to match Supabase auth.users.id type
    admin_email TEXT NOT NULL,
    action TEXT NOT NULL CHECK (action IN ('approved', 'rejected', 'pending')),
    reason TEXT,
    credentials_sent BOOLEAN DEFAULT false,
    temp_password_generated BOOLEAN DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Add foreign key constraint after table creation to handle type compatibility
DO $$
DECLARE
    users_id_type TEXT;
    constraint_exists BOOLEAN := FALSE;
BEGIN
    -- Check if constraint already exists
    SELECT EXISTS (
        SELECT 1 FROM information_schema.table_constraints 
        WHERE table_name = 'dealer_approval_logs' 
        AND constraint_name = 'fk_dealer_approval_logs_admin_id'
    ) INTO constraint_exists;
    
    IF constraint_exists THEN
        RAISE NOTICE '✅ Foreign key constraint already exists';
        RETURN;
    END IF;
    
    -- Check the actual type of users.id
    SELECT data_type INTO users_id_type
    FROM information_schema.columns 
    WHERE table_name = 'users' AND column_name = 'id' AND table_schema = 'public';
    
    RAISE NOTICE 'Users.id column type detected: %', COALESCE(users_id_type, 'NOT FOUND');
    
    -- Try to add foreign key constraint based on detected type
    IF users_id_type = 'text' THEN
        -- Add foreign key for TEXT type
        EXECUTE 'ALTER TABLE public.dealer_approval_logs 
                 ADD CONSTRAINT fk_dealer_approval_logs_admin_id 
                 FOREIGN KEY (admin_id) REFERENCES public.users(id) ON DELETE SET NULL';
        RAISE NOTICE '✅ Foreign key constraint added for TEXT type';
        
    ELSIF users_id_type = 'uuid' THEN
        -- Change admin_id to UUID first, then add foreign key
        EXECUTE 'ALTER TABLE public.dealer_approval_logs 
                 ALTER COLUMN admin_id TYPE UUID USING admin_id::UUID';
        EXECUTE 'ALTER TABLE public.dealer_approval_logs 
                 ADD CONSTRAINT fk_dealer_approval_logs_admin_id 
                 FOREIGN KEY (admin_id) REFERENCES public.users(id) ON DELETE SET NULL';
        RAISE NOTICE '✅ Foreign key constraint added for UUID type';
        
    ELSE
        RAISE NOTICE '⚠️  Unknown or missing users.id type: %. Skipping foreign key constraint.', COALESCE(users_id_type, 'NULL');
    END IF;
    
EXCEPTION
    WHEN OTHERS THEN
        RAISE NOTICE '⚠️  Could not add foreign key constraint: %', SQLERRM;
        RAISE NOTICE '📝 Table created without foreign key - this is OK, the table will still work';
        RAISE NOTICE '💡 You can manually add the constraint later if needed';
END $$;

-- Create indexes for approval logs
CREATE INDEX IF NOT EXISTS idx_dealer_approval_logs_application_id ON public.dealer_approval_logs(application_id);
CREATE INDEX IF NOT EXISTS idx_dealer_approval_logs_admin_id ON public.dealer_approval_logs(admin_id);
CREATE INDEX IF NOT EXISTS idx_dealer_approval_logs_action ON public.dealer_approval_logs(action);

-- ============================================================================
-- 5. UPDATE TRIGGERS FOR NEW COLUMNS
-- ============================================================================

-- Update the updated_date trigger for users table
CREATE TRIGGER set_updated_date_users BEFORE UPDATE ON public.users 
FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

-- Update the updated_date trigger for dealer_applications table  
CREATE TRIGGER set_updated_date_dealer_applications BEFORE UPDATE ON public.dealer_applications 
FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

-- Create trigger for email verification logs
CREATE TRIGGER set_updated_at_email_verification_logs BEFORE UPDATE ON public.email_verification_logs 
FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

-- ============================================================================
-- 6. UPDATE RLS POLICIES FOR NEW TABLES
-- ============================================================================

-- Enable RLS on new tables
ALTER TABLE public.email_verification_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.dealer_approval_logs ENABLE ROW LEVEL SECURITY;

-- Email verification logs policies
CREATE POLICY "Users can view their own verification logs" ON public.email_verification_logs 
FOR SELECT USING (email = (auth.jwt() ->> 'email'));

CREATE POLICY "Admins can view all verification logs" ON public.email_verification_logs 
FOR SELECT USING (
    EXISTS (
        SELECT 1 FROM public.users 
        WHERE id = auth.uid() AND role = 'admin'
    )
);

CREATE POLICY "System can insert verification logs" ON public.email_verification_logs 
FOR INSERT WITH CHECK (true);

CREATE POLICY "System can update verification logs" ON public.email_verification_logs 
FOR UPDATE USING (true);

-- Dealer approval logs policies
CREATE POLICY "Admins can view all approval logs" ON public.dealer_approval_logs 
FOR SELECT USING (
    EXISTS (
        SELECT 1 FROM public.users 
        WHERE id = auth.uid() AND role = 'admin'
    )
);

CREATE POLICY "Admins can create approval logs" ON public.dealer_approval_logs 
FOR INSERT WITH CHECK (
    EXISTS (
        SELECT 1 FROM public.users 
        WHERE id = auth.uid() AND role = 'admin'
    )
);

-- ============================================================================
-- 7. UPDATE EXISTING POLICIES FOR BETTER CLERK INTEGRATION
-- ============================================================================

-- Drop and recreate user policies to work with clerk_user_id
DROP POLICY IF EXISTS "Users can view their own profile" ON public.users;
DROP POLICY IF EXISTS "Users can update their own profile" ON public.users;

-- New policies that work with both Supabase auth and Clerk
CREATE POLICY "Users can view their own profile" ON public.users 
FOR SELECT USING (
    auth.uid() = id OR 
    clerk_user_id = (auth.jwt() ->> 'sub') OR
    (auth.jwt() ->> 'email') = email
);

CREATE POLICY "Users can update their own profile" ON public.users 
FOR UPDATE USING (
    auth.uid() = id OR 
    clerk_user_id = (auth.jwt() ->> 'sub') OR
    (auth.jwt() ->> 'email') = email
);

-- ============================================================================
-- 8. CREATE HELPER FUNCTIONS FOR NEW FLOW
-- ============================================================================

-- Function to create dealer from approved application
CREATE OR REPLACE FUNCTION public.create_dealer_from_application(
    app_id UUID,
    clerk_id TEXT,
    temp_password TEXT DEFAULT NULL
)
RETURNS UUID AS $$
DECLARE
    app_record RECORD;
    new_user_id UUID;
BEGIN
    -- Get application details
    SELECT * INTO app_record FROM public.dealer_applications WHERE id = app_id;
    
    IF NOT FOUND THEN
        RAISE EXCEPTION 'Application not found';
    END IF;
    
    -- Create or update user record
    INSERT INTO public.users (
        clerk_user_id,
        email,
        full_name,
        business_name,
        phone,
        address,
        vat_pan,
        whatsapp,
        role,
        dealer_status,
        created_date,
        updated_date
    ) VALUES (
        clerk_id,
        app_record.email,
        app_record.contact_person,
        app_record.business_name,
        app_record.phone,
        app_record.address,
        app_record.vat_pan,
        app_record.whatsapp,
        'dealer',
        'approved',
        NOW(),
        NOW()
    )
    ON CONFLICT (email) DO UPDATE SET
        clerk_user_id = EXCLUDED.clerk_user_id,
        full_name = EXCLUDED.full_name,
        business_name = EXCLUDED.business_name,
        phone = EXCLUDED.phone,
        address = EXCLUDED.address,
        vat_pan = EXCLUDED.vat_pan,
        whatsapp = EXCLUDED.whatsapp,
        role = EXCLUDED.role,
        dealer_status = EXCLUDED.dealer_status,
        updated_date = NOW()
    RETURNING id INTO new_user_id;
    
    -- Update application status
    UPDATE public.dealer_applications 
    SET status = 'approved', updated_date = NOW()
    WHERE id = app_id;
    
    RETURN new_user_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to reject dealer application
CREATE OR REPLACE FUNCTION public.reject_dealer_application(
    app_id UUID,
    rejection_reason TEXT DEFAULT 'Application did not meet our requirements'
)
RETURNS BOOLEAN AS $$
BEGIN
    -- Update application status
    UPDATE public.dealer_applications 
    SET 
        status = 'rejected',
        rejection_reason = rejection_reason,
        updated_date = NOW()
    WHERE id = app_id AND status = 'pending';
    
    RETURN FOUND;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================================================
-- 9. GRANT PERMISSIONS FOR NEW TABLES AND FUNCTIONS
-- ============================================================================

-- Grant permissions on new tables
GRANT ALL ON public.email_verification_logs TO anon, authenticated;
GRANT ALL ON public.dealer_approval_logs TO anon, authenticated;

-- Grant execute permissions on new functions
GRANT EXECUTE ON FUNCTION public.create_dealer_from_application(UUID, TEXT, TEXT) TO authenticated;
GRANT EXECUTE ON FUNCTION public.reject_dealer_application(UUID, TEXT) TO authenticated;

-- ============================================================================
-- 10. DATA MIGRATION FOR EXISTING RECORDS
-- ============================================================================

-- Update existing dealer users to have proper created_date/updated_date
UPDATE public.users 
SET 
    created_date = COALESCE(created_at, NOW()),
    updated_date = COALESCE(updated_at, NOW())
WHERE role = 'dealer' AND (created_date IS NULL OR updated_date IS NULL);

-- Update existing applications
UPDATE public.dealer_applications 
SET 
    created_date = COALESCE(created_at, NOW()),
    updated_date = COALESCE(updated_at, NOW())
WHERE created_date IS NULL OR updated_date IS NULL;

-- ============================================================================
-- SUCCESS MESSAGE
-- ============================================================================

DO $$
BEGIN
    RAISE NOTICE '✅ Database updated successfully for new dealer authentication flow!';
    RAISE NOTICE '';
    RAISE NOTICE '🔄 Changes made:';
    RAISE NOTICE '   • Added clerk_user_id column to users table';
    RAISE NOTICE '   • Added created_date/updated_date columns for consistency';
    RAISE NOTICE '   • Added rejection_reason to dealer_applications';
    RAISE NOTICE '   • Created email_verification_logs table';
    RAISE NOTICE '   • Created dealer_approval_logs table';
    RAISE NOTICE '   • Updated RLS policies for Clerk integration';
    RAISE NOTICE '   • Added helper functions for dealer approval/rejection';
    RAISE NOTICE '';
    RAISE NOTICE '🎯 New flow supported:';
    RAISE NOTICE '   • Email-first signup with Clerk authentication';
    RAISE NOTICE '   • Separate application form after email verification';
    RAISE NOTICE '   • Admin approval with automatic credential generation';
    RAISE NOTICE '   • Audit trail for all dealer approvals/rejections';
    RAISE NOTICE '';
    RAISE NOTICE '🚀 Ready to test the new dealer authentication flow!';
END $$;
