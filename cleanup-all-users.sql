-- =====================================================
-- COMPLETE USER CLEANUP SCRIPT
-- =====================================================
-- WARNING: This will delete ALL users and related data
-- Use with caution - this action cannot be undone!
-- =====================================================

-- Step 1: Disable RLS temporarily for cleanup (optional)
-- ALTER TABLE public.users DISABLE ROW LEVEL SECURITY;
-- ALTER TABLE public.dealer_applications DISABLE ROW LEVEL SECURITY;
-- ALTER TABLE public.dealer_approval_logs DISABLE ROW LEVEL SECURITY;
-- ALTER TABLE public.email_verification_logs DISABLE ROW LEVEL SECURITY;

-- Step 2: Delete all related data first (to avoid foreign key constraints)
DO $$
BEGIN
    -- Delete dealer approval logs
    DELETE FROM public.dealer_approval_logs;
    RAISE NOTICE '✅ Deleted all dealer approval logs';

    -- Delete email verification logs  
    DELETE FROM public.email_verification_logs;
    RAISE NOTICE '✅ Deleted all email verification logs';

    -- Delete all orders (if any exist)
    DELETE FROM public.orders WHERE dealer_email IS NOT NULL;
    RAISE NOTICE '✅ Deleted all dealer orders';

    -- Delete all dealer applications
    DELETE FROM public.dealer_applications;
    RAISE NOTICE '✅ Deleted all dealer applications';

    -- Delete all users
    DELETE FROM public.users;
    RAISE NOTICE '✅ Deleted all users';
END $$;

-- Step 4: Reset sequences (optional - for clean IDs)
-- ALTER SEQUENCE IF EXISTS users_id_seq RESTART WITH 1;
-- ALTER SEQUENCE IF EXISTS dealer_applications_id_seq RESTART WITH 1;
-- ALTER SEQUENCE IF EXISTS dealer_approval_logs_id_seq RESTART WITH 1;
-- ALTER SEQUENCE IF EXISTS email_verification_logs_id_seq RESTART WITH 1;

-- Step 5: Re-enable RLS (if disabled)
-- ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
-- ALTER TABLE public.dealer_applications ENABLE ROW LEVEL SECURITY;
-- ALTER TABLE public.dealer_approval_logs ENABLE ROW LEVEL SECURITY;
-- ALTER TABLE public.email_verification_logs ENABLE ROW LEVEL SECURITY;

-- Step 6: Verify cleanup
DO $$
DECLARE
    user_count INTEGER;
    app_count INTEGER;
    log_count INTEGER;
BEGIN
    SELECT COUNT(*) INTO user_count FROM public.users;
    SELECT COUNT(*) INTO app_count FROM public.dealer_applications;
    SELECT COUNT(*) INTO log_count FROM public.dealer_approval_logs;
    
    RAISE NOTICE '📊 CLEANUP VERIFICATION:';
    RAISE NOTICE '   Users remaining: %', user_count;
    RAISE NOTICE '   Applications remaining: %', app_count;
    RAISE NOTICE '   Approval logs remaining: %', log_count;
    
    IF user_count = 0 AND app_count = 0 AND log_count = 0 THEN
        RAISE NOTICE '✅ CLEANUP SUCCESSFUL - All user data removed!';
    ELSE
        RAISE NOTICE '⚠️  Some data may still remain - check manually';
    END IF;
    
    RAISE NOTICE '🎯 DATABASE CLEANUP COMPLETE!';
    RAISE NOTICE '📝 Next step: Clean up Clerk users in the dashboard';
END $$;
