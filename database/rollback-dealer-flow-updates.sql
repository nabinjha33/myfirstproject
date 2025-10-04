-- ROLLBACK SCRIPT FOR NEW DEALER AUTHENTICATION FLOW
-- This script reverts the database changes made for the new dealer flow
-- Use this if you need to rollback to the previous schema

-- ============================================================================
-- 1. DROP NEW TABLES
-- ============================================================================

-- Drop new tables (this will also drop their policies and triggers)
DROP TABLE IF EXISTS public.dealer_approval_logs CASCADE;
DROP TABLE IF EXISTS public.email_verification_logs CASCADE;

-- ============================================================================
-- 2. DROP NEW FUNCTIONS
-- ============================================================================

DROP FUNCTION IF EXISTS public.create_dealer_from_application(UUID, TEXT, TEXT);
DROP FUNCTION IF EXISTS public.reject_dealer_application(UUID, TEXT);

-- ============================================================================
-- 3. REMOVE NEW COLUMNS FROM EXISTING TABLES
-- ============================================================================

-- Remove new columns from users table
ALTER TABLE public.users DROP COLUMN IF EXISTS clerk_user_id;
ALTER TABLE public.users DROP COLUMN IF EXISTS created_date;
ALTER TABLE public.users DROP COLUMN IF EXISTS updated_date;

-- Remove new columns from dealer_applications table
ALTER TABLE public.dealer_applications DROP COLUMN IF EXISTS rejection_reason;
ALTER TABLE public.dealer_applications DROP COLUMN IF EXISTS created_date;
ALTER TABLE public.dealer_applications DROP COLUMN IF EXISTS updated_date;

-- ============================================================================
-- 4. DROP NEW TRIGGERS
-- ============================================================================

DROP TRIGGER IF EXISTS set_updated_date_users ON public.users;
DROP TRIGGER IF EXISTS set_updated_date_dealer_applications ON public.dealer_applications;

-- ============================================================================
-- 5. RESTORE ORIGINAL USER POLICIES
-- ============================================================================

-- Drop the updated policies
DROP POLICY IF EXISTS "Users can view their own profile" ON public.users;
DROP POLICY IF EXISTS "Users can update their own profile" ON public.users;

-- Restore original policies
CREATE POLICY "Users can view their own profile" ON public.users FOR SELECT USING (auth.uid() = id);
CREATE POLICY "Users can update their own profile" ON public.users FOR UPDATE USING (auth.uid() = id);

-- ============================================================================
-- SUCCESS MESSAGE
-- ============================================================================

DO $$
BEGIN
    RAISE NOTICE '🔄 Database rollback completed successfully!';
    RAISE NOTICE '';
    RAISE NOTICE '↩️  Changes reverted:';
    RAISE NOTICE '   • Removed clerk_user_id column from users table';
    RAISE NOTICE '   • Removed created_date/updated_date columns';
    RAISE NOTICE '   • Removed rejection_reason from dealer_applications';
    RAISE NOTICE '   • Dropped email_verification_logs table';
    RAISE NOTICE '   • Dropped dealer_approval_logs table';
    RAISE NOTICE '   • Restored original RLS policies';
    RAISE NOTICE '   • Removed helper functions';
    RAISE NOTICE '';
    RAISE NOTICE '📋 Database is now back to the original schema';
    RAISE NOTICE '⚠️  Note: Any data in the dropped tables has been lost';
END $$;
