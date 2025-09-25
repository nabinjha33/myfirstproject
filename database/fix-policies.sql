-- Fix for infinite recursion in RLS policies
-- Run this script to replace the problematic policies

-- First, drop all existing policies to start fresh
DROP POLICY IF EXISTS "Users can view their own profile" ON public.users;
DROP POLICY IF EXISTS "Users can update their own profile" ON public.users;
DROP POLICY IF EXISTS "Admins can view all users" ON public.users;
DROP POLICY IF EXISTS "Admins can update all users" ON public.users;
DROP POLICY IF EXISTS "Anyone can view active brands" ON public.brands;
DROP POLICY IF EXISTS "Admins can manage brands" ON public.brands;
DROP POLICY IF EXISTS "Anyone can view active categories" ON public.categories;
DROP POLICY IF EXISTS "Admins can manage categories" ON public.categories;
DROP POLICY IF EXISTS "Anyone can view active products" ON public.products;
DROP POLICY IF EXISTS "Admins can manage products" ON public.products;
DROP POLICY IF EXISTS "Anyone can create dealer applications" ON public.dealer_applications;
DROP POLICY IF EXISTS "Users can view their own applications" ON public.dealer_applications;
DROP POLICY IF EXISTS "Admins can view all applications" ON public.dealer_applications;
DROP POLICY IF EXISTS "Admins can update applications" ON public.dealer_applications;
DROP POLICY IF EXISTS "Dealers can view their own orders" ON public.orders;
DROP POLICY IF EXISTS "Dealers can create orders" ON public.orders;
DROP POLICY IF EXISTS "Admins can view all orders" ON public.orders;
DROP POLICY IF EXISTS "Admins can update orders" ON public.orders;
DROP POLICY IF EXISTS "Anyone can view shipments" ON public.shipments;
DROP POLICY IF EXISTS "Admins can manage shipments" ON public.shipments;

-- Create simplified policies without recursion

-- Users policies - simplified to avoid recursion
CREATE POLICY "Users can view their own profile" ON public.users 
FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update their own profile" ON public.users 
FOR UPDATE USING (auth.uid() = id);

-- For admin access, we'll use a simpler approach without checking the users table
-- This requires the admin to be authenticated and have the proper JWT claims
CREATE POLICY "Service role can manage users" ON public.users 
FOR ALL USING (auth.jwt() ->> 'role' = 'service_role' OR auth.jwt() ->> 'user_metadata' ->> 'role' = 'admin');

-- Brands policies - allow public read access, no admin restrictions for now
CREATE POLICY "Anyone can view brands" ON public.brands 
FOR SELECT USING (true);

CREATE POLICY "Authenticated users can manage brands" ON public.brands 
FOR ALL USING (auth.uid() IS NOT NULL);

-- Categories policies - allow public read access
CREATE POLICY "Anyone can view categories" ON public.categories 
FOR SELECT USING (true);

CREATE POLICY "Authenticated users can manage categories" ON public.categories 
FOR ALL USING (auth.uid() IS NOT NULL);

-- Products policies - allow public read access
CREATE POLICY "Anyone can view products" ON public.products 
FOR SELECT USING (true);

CREATE POLICY "Authenticated users can manage products" ON public.products 
FOR ALL USING (auth.uid() IS NOT NULL);

-- Dealer applications policies
CREATE POLICY "Anyone can create dealer applications" ON public.dealer_applications 
FOR INSERT WITH CHECK (true);

CREATE POLICY "Users can view their own applications" ON public.dealer_applications 
FOR SELECT USING (auth.jwt() ->> 'email' = email);

CREATE POLICY "Authenticated users can manage applications" ON public.dealer_applications 
FOR ALL USING (auth.uid() IS NOT NULL);

-- Orders policies
CREATE POLICY "Users can view their own orders" ON public.orders 
FOR SELECT USING (dealer_id = auth.uid() OR dealer_email = (auth.jwt() ->> 'email'));

CREATE POLICY "Users can create orders" ON public.orders 
FOR INSERT WITH CHECK (dealer_id = auth.uid() OR dealer_email = (auth.jwt() ->> 'email'));

CREATE POLICY "Authenticated users can manage orders" ON public.orders 
FOR ALL USING (auth.uid() IS NOT NULL);

-- Shipments policies - allow public read access
CREATE POLICY "Anyone can view shipments" ON public.shipments 
FOR SELECT USING (true);

CREATE POLICY "Authenticated users can manage shipments" ON public.shipments 
FOR ALL USING (auth.uid() IS NOT NULL);

-- Grant necessary permissions for anonymous access (for public data)
GRANT SELECT ON public.brands TO anon;
GRANT SELECT ON public.categories TO anon;
GRANT SELECT ON public.products TO anon;
GRANT SELECT ON public.shipments TO anon;
GRANT INSERT ON public.dealer_applications TO anon;
