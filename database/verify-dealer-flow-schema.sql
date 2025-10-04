-- VERIFICATION SCRIPT FOR NEW DEALER AUTHENTICATION FLOW
-- This script checks if all database changes have been applied correctly

-- ============================================================================
-- 1. CHECK TABLE STRUCTURES
-- ============================================================================

-- Check users table columns
SELECT 
    'users' as table_name,
    column_name,
    data_type,
    is_nullable,
    column_default
FROM information_schema.columns 
WHERE table_name = 'users' AND table_schema = 'public'
ORDER BY ordinal_position;

-- Check dealer_applications table columns
SELECT 
    'dealer_applications' as table_name,
    column_name,
    data_type,
    is_nullable,
    column_default
FROM information_schema.columns 
WHERE table_name = 'dealer_applications' AND table_schema = 'public'
ORDER BY ordinal_position;

-- Check if new tables exist
SELECT 
    table_name,
    table_type
FROM information_schema.tables 
WHERE table_schema = 'public' 
AND table_name IN ('email_verification_logs', 'dealer_approval_logs');

-- ============================================================================
-- 2. CHECK INDEXES
-- ============================================================================

-- Check if new indexes exist
SELECT 
    indexname,
    tablename,
    indexdef
FROM pg_indexes 
WHERE schemaname = 'public' 
AND indexname IN (
    'idx_users_clerk_user_id',
    'idx_email_verification_logs_email',
    'idx_email_verification_logs_status',
    'idx_email_verification_logs_type',
    'idx_dealer_approval_logs_application_id',
    'idx_dealer_approval_logs_admin_id',
    'idx_dealer_approval_logs_action'
);

-- ============================================================================
-- 3. CHECK FUNCTIONS
-- ============================================================================

-- Check if new functions exist
SELECT 
    routine_name,
    routine_type,
    data_type as return_type
FROM information_schema.routines 
WHERE routine_schema = 'public' 
AND routine_name IN (
    'create_dealer_from_application',
    'reject_dealer_application'
);

-- ============================================================================
-- 4. CHECK TRIGGERS
-- ============================================================================

-- Check if triggers exist
SELECT 
    trigger_name,
    event_manipulation,
    event_object_table,
    action_statement
FROM information_schema.triggers 
WHERE trigger_schema = 'public'
AND trigger_name IN (
    'set_updated_date_users',
    'set_updated_date_dealer_applications',
    'set_updated_at_email_verification_logs'
);

-- ============================================================================
-- 5. CHECK RLS POLICIES
-- ============================================================================

-- Check RLS policies for users table
SELECT 
    schemaname,
    tablename,
    policyname,
    permissive,
    roles,
    cmd,
    qual
FROM pg_policies 
WHERE schemaname = 'public' 
AND tablename = 'users';

-- Check RLS policies for new tables
SELECT 
    schemaname,
    tablename,
    policyname,
    permissive,
    roles,
    cmd
FROM pg_policies 
WHERE schemaname = 'public' 
AND tablename IN ('email_verification_logs', 'dealer_approval_logs');

-- ============================================================================
-- 6. CHECK CONSTRAINTS
-- ============================================================================

-- Check constraints on new tables
SELECT 
    table_name,
    constraint_name,
    constraint_type
FROM information_schema.table_constraints 
WHERE table_schema = 'public' 
AND table_name IN ('email_verification_logs', 'dealer_approval_logs', 'users', 'dealer_applications')
AND constraint_type = 'CHECK';

-- ============================================================================
-- 7. SAMPLE DATA CHECK
-- ============================================================================

-- Count records in each table
SELECT 'users' as table_name, COUNT(*) as record_count FROM public.users
UNION ALL
SELECT 'dealer_applications', COUNT(*) FROM public.dealer_applications
UNION ALL
SELECT 'email_verification_logs', COUNT(*) FROM public.email_verification_logs
UNION ALL
SELECT 'dealer_approval_logs', COUNT(*) FROM public.dealer_approval_logs;

-- Check if any users have clerk_user_id
SELECT 
    COUNT(*) as users_with_clerk_id,
    COUNT(*) FILTER (WHERE clerk_user_id IS NOT NULL) as users_with_clerk_id_populated
FROM public.users;

-- Check dealer applications status distribution
SELECT 
    status,
    COUNT(*) as count
FROM public.dealer_applications 
GROUP BY status;

-- ============================================================================
-- 8. VERIFICATION SUMMARY
-- ============================================================================

DO $$
DECLARE
    users_has_clerk_id BOOLEAN;
    users_has_dates BOOLEAN;
    apps_has_rejection BOOLEAN;
    apps_has_dates BOOLEAN;
    email_logs_exists BOOLEAN;
    approval_logs_exists BOOLEAN;
    functions_exist INTEGER;
BEGIN
    -- Check if columns exist
    SELECT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'users' AND column_name = 'clerk_user_id'
    ) INTO users_has_clerk_id;
    
    SELECT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'users' AND column_name = 'created_date'
    ) INTO users_has_dates;
    
    SELECT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'dealer_applications' AND column_name = 'rejection_reason'
    ) INTO apps_has_rejection;
    
    SELECT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'dealer_applications' AND column_name = 'created_date'
    ) INTO apps_has_dates;
    
    -- Check if tables exist
    SELECT EXISTS (
        SELECT 1 FROM information_schema.tables 
        WHERE table_name = 'email_verification_logs'
    ) INTO email_logs_exists;
    
    SELECT EXISTS (
        SELECT 1 FROM information_schema.tables 
        WHERE table_name = 'dealer_approval_logs'
    ) INTO approval_logs_exists;
    
    -- Check if functions exist
    SELECT COUNT(*) FROM information_schema.routines 
    WHERE routine_schema = 'public' 
    AND routine_name IN ('create_dealer_from_application', 'reject_dealer_application')
    INTO functions_exist;
    
    -- Display results
    RAISE NOTICE '============================================================================';
    RAISE NOTICE '📋 VERIFICATION RESULTS FOR NEW DEALER AUTHENTICATION FLOW';
    RAISE NOTICE '============================================================================';
    RAISE NOTICE '';
    RAISE NOTICE '📊 Table Structure Updates:';
    RAISE NOTICE '   • users.clerk_user_id column: %', CASE WHEN users_has_clerk_id THEN '✅ EXISTS' ELSE '❌ MISSING' END;
    RAISE NOTICE '   • users date columns: %', CASE WHEN users_has_dates THEN '✅ EXISTS' ELSE '❌ MISSING' END;
    RAISE NOTICE '   • dealer_applications.rejection_reason: %', CASE WHEN apps_has_rejection THEN '✅ EXISTS' ELSE '❌ MISSING' END;
    RAISE NOTICE '   • dealer_applications date columns: %', CASE WHEN apps_has_dates THEN '✅ EXISTS' ELSE '❌ MISSING' END;
    RAISE NOTICE '';
    RAISE NOTICE '🗃️  New Tables:';
    RAISE NOTICE '   • email_verification_logs: %', CASE WHEN email_logs_exists THEN '✅ EXISTS' ELSE '❌ MISSING' END;
    RAISE NOTICE '   • dealer_approval_logs: %', CASE WHEN approval_logs_exists THEN '✅ EXISTS' ELSE '❌ MISSING' END;
    RAISE NOTICE '';
    RAISE NOTICE '⚙️  Functions:';
    RAISE NOTICE '   • Helper functions: % of 2 exist', functions_exist;
    RAISE NOTICE '';
    
    IF users_has_clerk_id AND users_has_dates AND apps_has_rejection AND apps_has_dates 
       AND email_logs_exists AND approval_logs_exists AND functions_exist = 2 THEN
        RAISE NOTICE '🎉 ALL UPDATES APPLIED SUCCESSFULLY!';
        RAISE NOTICE '✅ Database is ready for the new dealer authentication flow';
    ELSE
        RAISE NOTICE '⚠️  SOME UPDATES ARE MISSING!';
        RAISE NOTICE '❌ Please run the update script: database/update-for-new-dealer-flow.sql';
    END IF;
    
    RAISE NOTICE '';
    RAISE NOTICE '============================================================================';
END $$;
