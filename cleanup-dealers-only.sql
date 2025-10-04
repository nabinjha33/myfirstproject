-- =====================================================
-- SAFE DEALER-ONLY CLEANUP SCRIPT
-- =====================================================
-- This preserves admin users and only removes dealers
-- =====================================================

-- Step 1: Show what will be deleted
DO $$
DECLARE
    dealer_users INTEGER;
    admin_users INTEGER;
    total_apps INTEGER;
BEGIN
    SELECT COUNT(*) INTO dealer_users FROM public.users WHERE role = 'dealer';
    SELECT COUNT(*) INTO admin_users FROM public.users WHERE role = 'admin';
    SELECT COUNT(*) INTO total_apps FROM public.dealer_applications;
    
    RAISE NOTICE '📊 BEFORE CLEANUP:';
    RAISE NOTICE '   Dealer users: %', dealer_users;
    RAISE NOTICE '   Admin users: % (will be preserved)', admin_users;
    RAISE NOTICE '   Dealer applications: %', total_apps;
    RAISE NOTICE '';
END $$;

-- Step 2: Delete dealer-related data
DO $$
BEGIN
    -- Delete dealer approval logs
    DELETE FROM public.dealer_approval_logs;
    RAISE NOTICE '✅ Deleted all dealer approval logs';

    -- Delete email verification logs for dealers
    DELETE FROM public.email_verification_logs 
    WHERE email IN (
        SELECT email FROM public.users WHERE role = 'dealer'
    );
    RAISE NOTICE '✅ Deleted dealer email verification logs';

    -- Delete orders from dealers
    DELETE FROM public.orders WHERE dealer_email IN (
        SELECT email FROM public.users WHERE role = 'dealer'
    );
    RAISE NOTICE '✅ Deleted dealer orders';

    -- Delete all dealer applications
    DELETE FROM public.dealer_applications;
    RAISE NOTICE '✅ Deleted all dealer applications';

    -- Delete dealer users (preserve admins)
    DELETE FROM public.users WHERE role = 'dealer';
    RAISE NOTICE '✅ Deleted all dealer users';
END $$;

-- Step 4: Verify cleanup
DO $$
DECLARE
    dealer_users INTEGER;
    admin_users INTEGER;
    total_apps INTEGER;
BEGIN
    SELECT COUNT(*) INTO dealer_users FROM public.users WHERE role = 'dealer';
    SELECT COUNT(*) INTO admin_users FROM public.users WHERE role = 'admin';
    SELECT COUNT(*) INTO total_apps FROM public.dealer_applications;
    
    RAISE NOTICE '📊 AFTER CLEANUP:';
    RAISE NOTICE '   Dealer users: %', dealer_users;
    RAISE NOTICE '   Admin users: % (preserved)', admin_users;
    RAISE NOTICE '   Dealer applications: %', total_apps;
    
    IF dealer_users = 0 AND total_apps = 0 THEN
        RAISE NOTICE '✅ SAFE CLEANUP SUCCESSFUL!';
        RAISE NOTICE '🔒 Admin users preserved';
    ELSE
        RAISE NOTICE '⚠️  Some dealer data may still remain';
    END IF;
    
    RAISE NOTICE '🎯 DEALER CLEANUP COMPLETE!';
    RAISE NOTICE '📝 Next step: Clean up Clerk dealer users in the dashboard';
END $$;
