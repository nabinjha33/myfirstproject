-- FIX DEALER APPLICATIONS RLS POLICIES
-- This script safely updates existing policies

-- First, drop all existing policies on dealer_applications
DROP POLICY IF EXISTS "Public can create dealer applications" ON dealer_applications;
DROP POLICY IF EXISTS "Users can view own applications" ON dealer_applications;
DROP POLICY IF EXISTS "Service role can manage dealer applications" ON dealer_applications;
DROP POLICY IF EXISTS "Authenticated can update dealer applications" ON dealer_applications;
DROP POLICY IF EXISTS "Anyone can create dealer applications" ON dealer_applications;
DROP POLICY IF EXISTS "Admins can view all applications" ON dealer_applications;
DROP POLICY IF EXISTS "Admins can update applications" ON dealer_applications;
DROP POLICY IF EXISTS "Authenticated can manage applications" ON dealer_applications;

-- Create new, working policies
CREATE POLICY "Allow public to create applications" ON dealer_applications
    FOR INSERT WITH CHECK (true);

CREATE POLICY "Allow users to view own applications by email" ON dealer_applications
    FOR SELECT USING (
        email = auth.jwt() ->> 'email' OR 
        auth.role() = 'service_role'
    );

CREATE POLICY "Allow service role full access to applications" ON dealer_applications
    FOR ALL USING (auth.role() = 'service_role');

CREATE POLICY "Allow authenticated users to manage applications" ON dealer_applications
    FOR ALL USING (auth.uid() IS NOT NULL);

-- Grant necessary permissions
GRANT ALL ON dealer_applications TO authenticated;
GRANT SELECT, INSERT ON dealer_applications TO anon;
GRANT ALL ON dealer_applications TO service_role;

-- Verify the policies were created
SELECT 
    policyname, 
    cmd, 
    qual, 
    with_check
FROM pg_policies 
WHERE tablename = 'dealer_applications'
ORDER BY policyname;

-- Success message
DO $$
BEGIN
    RAISE NOTICE '✅ Dealer applications RLS policies fixed!';
    RAISE NOTICE '📋 New policies created:';
    RAISE NOTICE '   1. Public can create applications';
    RAISE NOTICE '   2. Users can view own applications by email';
    RAISE NOTICE '   3. Service role has full access';
    RAISE NOTICE '   4. Authenticated users can manage applications';
    RAISE NOTICE '';
    RAISE NOTICE '🧪 Now try approving a dealer application!';
END $$;
