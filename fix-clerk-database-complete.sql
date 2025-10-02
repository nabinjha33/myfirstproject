-- COMPLETE FIX FOR CLERK AUTHENTICATION ISSUES
-- Run this script in your Supabase SQL Editor to fix all authentication problems

-- ============================================================================
-- STEP 1: Fix Foreign Key Constraints
-- ============================================================================

-- Drop the problematic foreign key constraint on orders.dealer_id (if it exists)
-- This constraint is trying to link UUID to TEXT which causes errors
ALTER TABLE orders DROP CONSTRAINT IF EXISTS orders_dealer_id_fkey;

-- Change orders.dealer_id from UUID to TEXT to match users.id
ALTER TABLE orders ALTER COLUMN dealer_id TYPE TEXT;

-- Now create the correct foreign key constraint
ALTER TABLE orders ADD CONSTRAINT orders_dealer_id_fkey 
    FOREIGN KEY (dealer_id) REFERENCES users(id) ON DELETE SET NULL;

-- ============================================================================
-- STEP 2: Fix RLS Policies (Remove Infinite Recursion)
-- ============================================================================

-- Drop all problematic RLS policies on users table
DROP POLICY IF EXISTS "Users can view their own data" ON users;
DROP POLICY IF EXISTS "Users can update their own data" ON users;
DROP POLICY IF EXISTS "Admins can view all users" ON users;
DROP POLICY IF EXISTS "Admins can update all users" ON users;
DROP POLICY IF EXISTS "Admins can insert users" ON users;
DROP POLICY IF EXISTS "Allow initial admin creation" ON users;

-- Create NEW safe RLS policies without recursion
-- These policies use auth.uid() and JWT claims instead of querying users table

-- 1. Users can access their own data
CREATE POLICY "Users can view own profile" ON users
    FOR SELECT USING (auth.uid()::text = id);

CREATE POLICY "Users can update own profile" ON users
    FOR UPDATE USING (auth.uid()::text = id);

-- 2. Service role (webhooks) can manage all users
CREATE POLICY "Service role full access" ON users
    FOR ALL USING (auth.role() = 'service_role');

-- 3. Allow public insert for webhook user creation
CREATE POLICY "Allow webhook user creation" ON users
    FOR INSERT WITH CHECK (true);

-- ============================================================================
-- STEP 3: Fix Orders Table RLS Policies
-- ============================================================================

-- Drop existing order policies if they exist
DROP POLICY IF EXISTS "Dealers can view their own orders" ON orders;
DROP POLICY IF EXISTS "Dealers can create orders" ON orders;
DROP POLICY IF EXISTS "Admins can view all orders" ON orders;
DROP POLICY IF EXISTS "Admins can update orders" ON orders;

-- Create new order policies
CREATE POLICY "Users can view own orders" ON orders
    FOR SELECT USING (
        dealer_id = auth.uid()::text OR 
        dealer_email = auth.jwt() ->> 'email'
    );

CREATE POLICY "Users can create orders" ON orders
    FOR INSERT WITH CHECK (
        dealer_id = auth.uid()::text OR 
        dealer_email = auth.jwt() ->> 'email'
    );

CREATE POLICY "Service role can manage orders" ON orders
    FOR ALL USING (auth.role() = 'service_role');

-- ============================================================================
-- STEP 4: Fix Other Tables RLS Policies
-- ============================================================================

-- Brands - Allow public read, authenticated write
DROP POLICY IF EXISTS "Anyone can view active brands" ON brands;
DROP POLICY IF EXISTS "Admins can manage brands" ON brands;

CREATE POLICY "Public can view brands" ON brands
    FOR SELECT USING (true);

CREATE POLICY "Authenticated can manage brands" ON brands
    FOR ALL USING (auth.uid() IS NOT NULL);

-- Categories - Allow public read, authenticated write  
DROP POLICY IF EXISTS "Anyone can view active categories" ON categories;
DROP POLICY IF EXISTS "Admins can manage categories" ON categories;

CREATE POLICY "Public can view categories" ON categories
    FOR SELECT USING (true);

CREATE POLICY "Authenticated can manage categories" ON categories
    FOR ALL USING (auth.uid() IS NOT NULL);

-- Products - Allow public read, authenticated write
DROP POLICY IF EXISTS "Anyone can view active products" ON products;
DROP POLICY IF EXISTS "Admins can manage products" ON products;

CREATE POLICY "Public can view products" ON products
    FOR SELECT USING (true);

CREATE POLICY "Authenticated can manage products" ON products
    FOR ALL USING (auth.uid() IS NOT NULL);

-- Dealer Applications - Allow public insert, user view own, authenticated manage
DROP POLICY IF EXISTS "Anyone can create dealer applications" ON dealer_applications;
DROP POLICY IF EXISTS "Users can view their own applications" ON dealer_applications;
DROP POLICY IF EXISTS "Admins can view all applications" ON dealer_applications;
DROP POLICY IF EXISTS "Admins can update applications" ON dealer_applications;

CREATE POLICY "Public can create applications" ON dealer_applications
    FOR INSERT WITH CHECK (true);

CREATE POLICY "Users can view own applications" ON dealer_applications
    FOR SELECT USING (email = auth.jwt() ->> 'email');

CREATE POLICY "Authenticated can manage applications" ON dealer_applications
    FOR ALL USING (auth.uid() IS NOT NULL);

-- Shipments - Allow public read, authenticated write
DROP POLICY IF EXISTS "Anyone can view shipments" ON shipments;
DROP POLICY IF EXISTS "Admins can manage shipments" ON shipments;

CREATE POLICY "Public can view shipments" ON shipments
    FOR SELECT USING (true);

CREATE POLICY "Authenticated can manage shipments" ON shipments
    FOR ALL USING (auth.uid() IS NOT NULL);

-- ============================================================================
-- STEP 5: Update Indexes for Performance
-- ============================================================================

-- Add index for the new TEXT dealer_id column
DROP INDEX IF EXISTS idx_orders_dealer_id;
CREATE INDEX idx_orders_dealer_id ON orders(dealer_id) WHERE dealer_id IS NOT NULL;

-- Add index for clerk_id if not exists
CREATE INDEX IF NOT EXISTS idx_users_clerk_id ON users(clerk_id) WHERE clerk_id IS NOT NULL;

-- ============================================================================
-- STEP 6: Grant Proper Permissions
-- ============================================================================

-- Grant necessary permissions for anonymous users (public access)
GRANT SELECT ON brands TO anon;
GRANT SELECT ON categories TO anon;
GRANT SELECT ON products TO anon;
GRANT SELECT ON shipments TO anon;
GRANT SELECT ON site_settings TO anon;
GRANT INSERT ON dealer_applications TO anon;
GRANT INSERT ON page_visits TO anon;

-- Grant permissions for authenticated users
GRANT ALL ON ALL TABLES IN SCHEMA public TO authenticated;
GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO authenticated;

-- ============================================================================
-- STEP 7: Verify the Fix
-- ============================================================================

-- Check users table structure
SELECT column_name, data_type, is_nullable 
FROM information_schema.columns 
WHERE table_name = 'users' AND table_schema = 'public'
ORDER BY ordinal_position;

-- Check foreign key constraints
SELECT 
    tc.table_name, 
    kcu.column_name, 
    ccu.table_name AS foreign_table_name,
    ccu.column_name AS foreign_column_name,
    tc.constraint_name
FROM information_schema.table_constraints AS tc 
JOIN information_schema.key_column_usage AS kcu ON tc.constraint_name = kcu.constraint_name
JOIN information_schema.constraint_column_usage AS ccu ON ccu.constraint_name = tc.constraint_name
WHERE tc.constraint_type = 'FOREIGN KEY' 
    AND tc.table_schema = 'public'
    AND tc.table_name = 'orders';

-- Check RLS policies on users table
SELECT policyname, cmd, qual, with_check
FROM pg_policies 
WHERE schemaname = 'public' AND tablename = 'users'
ORDER BY policyname;

-- ============================================================================
-- COMPLETION MESSAGE
-- ============================================================================

DO $$
BEGIN
    RAISE NOTICE '✅ Clerk integration fix completed successfully!';
    RAISE NOTICE '📋 Changes made:';
    RAISE NOTICE '   1. Fixed orders.dealer_id foreign key constraint (UUID -> TEXT)';
    RAISE NOTICE '   2. Removed infinite recursion from RLS policies';
    RAISE NOTICE '   3. Created safe RLS policies using auth.uid() and JWT claims';
    RAISE NOTICE '   4. Updated permissions for public and authenticated access';
    RAISE NOTICE '   5. Added proper indexes for performance';
    RAISE NOTICE '';
    RAISE NOTICE '🔄 Next steps:';
    RAISE NOTICE '   1. Test Clerk authentication in your app';
    RAISE NOTICE '   2. Verify webhook user creation works';
    RAISE NOTICE '   3. Check that orders can be created by dealers';
    RAISE NOTICE '   4. Restart your Next.js application';
END $$;
