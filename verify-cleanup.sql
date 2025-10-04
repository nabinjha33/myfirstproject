-- =====================================================
-- CLEANUP VERIFICATION SCRIPT
-- =====================================================
-- Run this to check the current state of your database
-- =====================================================

-- Check current user counts
SELECT 
    'USERS' as table_name,
    COUNT(*) as total_count,
    COUNT(CASE WHEN role = 'admin' THEN 1 END) as admin_count,
    COUNT(CASE WHEN role = 'dealer' THEN 1 END) as dealer_count,
    COUNT(CASE WHEN role IS NULL THEN 1 END) as no_role_count
FROM public.users;

-- Check dealer applications
SELECT 
    'DEALER_APPLICATIONS' as table_name,
    COUNT(*) as total_count,
    COUNT(CASE WHEN status = 'pending' THEN 1 END) as pending_count,
    COUNT(CASE WHEN status = 'approved' THEN 1 END) as approved_count,
    COUNT(CASE WHEN status = 'rejected' THEN 1 END) as rejected_count
FROM public.dealer_applications;

-- Check approval logs
SELECT 
    'APPROVAL_LOGS' as table_name,
    COUNT(*) as total_count
FROM public.dealer_approval_logs;

-- Check email verification logs
SELECT 
    'EMAIL_VERIFICATION_LOGS' as table_name,
    COUNT(*) as total_count
FROM public.email_verification_logs;

-- Show sample users (if any)
SELECT 
    id,
    email,
    full_name,
    role,
    dealer_status,
    created_date
FROM public.users 
ORDER BY created_date DESC 
LIMIT 5;

-- Show sample applications (if any)
SELECT 
    id,
    email,
    business_name,
    status,
    created_date
FROM public.dealer_applications 
ORDER BY created_date DESC 
LIMIT 5;
