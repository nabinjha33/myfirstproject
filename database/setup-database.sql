-- Complete Database Setup Script for base44-nextjs
-- This script will create all necessary tables, insert sample data, and configure proper access

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Drop existing tables if they exist (for clean setup)
DROP TABLE IF EXISTS public.orders CASCADE;
DROP TABLE IF EXISTS public.products CASCADE;
DROP TABLE IF EXISTS public.dealer_applications CASCADE;
DROP TABLE IF EXISTS public.shipments CASCADE;
DROP TABLE IF EXISTS public.categories CASCADE;
DROP TABLE IF EXISTS public.brands CASCADE;
DROP TABLE IF EXISTS public.users CASCADE;
DROP TABLE IF EXISTS public.site_settings CASCADE;
DROP TABLE IF EXISTS public.page_visits CASCADE;

-- Users table (extends Supabase auth.users)
CREATE TABLE public.users (
    id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
    email TEXT UNIQUE NOT NULL,
    full_name TEXT NOT NULL,
    business_name TEXT,
    vat_pan TEXT,
    address TEXT,
    phone TEXT,
    whatsapp TEXT,
    role TEXT DEFAULT 'user' CHECK (role IN ('admin', 'dealer', 'user')),
    dealer_status TEXT DEFAULT 'pending' CHECK (dealer_status IN ('pending', 'approved', 'rejected')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Brands table
CREATE TABLE public.brands (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    name TEXT NOT NULL,
    slug TEXT UNIQUE NOT NULL,
    description TEXT,
    logo TEXT,
    origin_country TEXT,
    established_year TEXT,
    specialty TEXT,
    active BOOLEAN DEFAULT true,
    sort_order INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Categories table
CREATE TABLE public.categories (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    name TEXT NOT NULL,
    slug TEXT UNIQUE NOT NULL,
    description TEXT,
    icon TEXT,
    color TEXT,
    parent_id UUID REFERENCES public.categories(id) ON DELETE SET NULL,
    active BOOLEAN DEFAULT true,
    sort_order INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Products table
CREATE TABLE public.products (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    name TEXT NOT NULL,
    slug TEXT UNIQUE NOT NULL,
    description TEXT,
    brand_id UUID REFERENCES public.brands(id) ON DELETE CASCADE,
    category_id UUID REFERENCES public.categories(id) ON DELETE CASCADE,
    images TEXT[] DEFAULT '{}',
    variants JSONB DEFAULT '[]',
    featured BOOLEAN DEFAULT false,
    active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Dealer Applications table
CREATE TABLE public.dealer_applications (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    business_name TEXT NOT NULL,
    contact_person TEXT NOT NULL,
    email TEXT NOT NULL,
    phone TEXT NOT NULL,
    whatsapp TEXT,
    address TEXT NOT NULL,
    vat_pan TEXT,
    business_type TEXT NOT NULL,
    years_in_business TEXT NOT NULL,
    interested_brands TEXT[] DEFAULT '{}',
    annual_turnover TEXT,
    experience_years INTEGER,
    message TEXT,
    status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Orders table
CREATE TABLE public.orders (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    order_number TEXT UNIQUE NOT NULL,
    dealer_id UUID REFERENCES public.users(id) ON DELETE CASCADE,
    dealer_email TEXT NOT NULL,
    dealer_name TEXT NOT NULL,
    contact_person TEXT NOT NULL,
    contact_phone TEXT NOT NULL,
    status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'confirmed', 'processing', 'shipped', 'delivered', 'cancelled')),
    order_date TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    items JSONB NOT NULL DEFAULT '[]',
    total_items INTEGER DEFAULT 0,
    estimated_total_value DECIMAL(12,2) DEFAULT 0,
    additional_notes TEXT,
    inquiry_type TEXT DEFAULT 'order' CHECK (inquiry_type IN ('order', 'inquiry')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Shipments table
CREATE TABLE public.shipments (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    tracking_number TEXT UNIQUE NOT NULL,
    origin_country TEXT NOT NULL,
    status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'in_transit', 'customs', 'delivered')),
    eta_date DATE,
    product_names TEXT[] DEFAULT '{}',
    port_name TEXT,
    last_updated TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Site Settings table
CREATE TABLE public.site_settings (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    company_name TEXT NOT NULL DEFAULT 'Jeen Mata Impex',
    tagline TEXT DEFAULT 'Premium Import Solutions',
    contact_email TEXT DEFAULT 'jeenmataimpex8@gmail.com',
    contact_phone TEXT DEFAULT '+977-1-XXXXXXX',
    contact_address TEXT DEFAULT 'Kathmandu, Nepal',
    logo_url TEXT,
    website_url TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Page Visits table for analytics
CREATE TABLE public.page_visits (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    path TEXT NOT NULL,
    page TEXT NOT NULL,
    user_email TEXT,
    user_agent TEXT,
    visited_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for better performance
CREATE INDEX idx_users_email ON public.users(email);
CREATE INDEX idx_users_role ON public.users(role);
CREATE INDEX idx_brands_slug ON public.brands(slug);
CREATE INDEX idx_brands_active ON public.brands(active);
CREATE INDEX idx_brands_sort_order ON public.brands(sort_order);
CREATE INDEX idx_categories_slug ON public.categories(slug);
CREATE INDEX idx_categories_active ON public.categories(active);
CREATE INDEX idx_categories_sort_order ON public.categories(sort_order);
CREATE INDEX idx_products_slug ON public.products(slug);
CREATE INDEX idx_products_brand_id ON public.products(brand_id);
CREATE INDEX idx_products_category_id ON public.products(category_id);
CREATE INDEX idx_products_featured ON public.products(featured);
CREATE INDEX idx_products_active ON public.products(active);
CREATE INDEX idx_dealer_applications_email ON public.dealer_applications(email);
CREATE INDEX idx_dealer_applications_status ON public.dealer_applications(status);
CREATE INDEX idx_orders_dealer_id ON public.orders(dealer_id);
CREATE INDEX idx_orders_dealer_email ON public.orders(dealer_email);
CREATE INDEX idx_orders_status ON public.orders(status);
CREATE INDEX idx_orders_order_number ON public.orders(order_number);
CREATE INDEX idx_shipments_tracking_number ON public.shipments(tracking_number);
CREATE INDEX idx_shipments_status ON public.shipments(status);
CREATE INDEX idx_page_visits_visited_at ON public.page_visits(visited_at);
CREATE INDEX idx_page_visits_page ON public.page_visits(page);

-- Create updated_at trigger function
CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create triggers for updated_at
CREATE TRIGGER set_updated_at_users BEFORE UPDATE ON public.users FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();
CREATE TRIGGER set_updated_at_brands BEFORE UPDATE ON public.brands FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();
CREATE TRIGGER set_updated_at_categories BEFORE UPDATE ON public.categories FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();
CREATE TRIGGER set_updated_at_products BEFORE UPDATE ON public.products FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();
CREATE TRIGGER set_updated_at_dealer_applications BEFORE UPDATE ON public.dealer_applications FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();
CREATE TRIGGER set_updated_at_orders BEFORE UPDATE ON public.orders FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();
CREATE TRIGGER set_updated_at_shipments BEFORE UPDATE ON public.shipments FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();
CREATE TRIGGER set_updated_at_site_settings BEFORE UPDATE ON public.site_settings FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

-- DISABLE RLS FOR DEVELOPMENT (IMPORTANT!)
ALTER TABLE public.users DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.brands DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.categories DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.products DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.dealer_applications DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.orders DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.shipments DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.site_settings DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.page_visits DISABLE ROW LEVEL SECURITY;

-- Grant full access for development
GRANT ALL ON ALL TABLES IN SCHEMA public TO anon, authenticated;
GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO anon, authenticated;

-- Insert sample brands
INSERT INTO public.brands (name, slug, description, origin_country, established_year, specialty, active, sort_order) VALUES
('FastDrill', 'fastdrill', 'Professional power tools manufacturer specializing in high-performance drilling equipment', 'Germany', '1985', 'Power Tools', true, 1),
('Spider', 'spider', 'High-quality hand tools and precision equipment for professional contractors', 'Japan', '1978', 'Hand Tools', true, 2),
('Gorkha', 'gorkha', 'Reliable construction and building tools made for tough conditions', 'Nepal', '1995', 'Construction Tools', true, 3),
('TechPro', 'techpro', 'Advanced industrial equipment and precision measurement instruments', 'USA', '1992', 'Industrial Equipment', true, 4),
('BuildMaster', 'buildmaster', 'Heavy-duty construction and building tools for large projects', 'Italy', '1965', 'Construction Tools', true, 5);

-- Insert sample categories
INSERT INTO public.categories (name, slug, description, icon, color, active, sort_order) VALUES
('Power Tools', 'power-tools', 'Electric and battery-powered tools for professional use', 'Zap', '#ef4444', true, 1),
('Hand Tools', 'hand-tools', 'Manual tools and precision equipment', 'Hammer', '#3b82f6', true, 2),
('Measurement Tools', 'measurement-tools', 'Precision measurement and calibration instruments', 'Thermometer', '#10b981', true, 3),
('Safety Equipment', 'safety-equipment', 'Personal protective equipment and safety gear', 'Shield', '#f59e0b', true, 4),
('Industrial Equipment', 'industrial-equipment', 'Heavy-duty industrial machinery and equipment', 'HardHat', '#8b5cf6', true, 5),
('Construction Tools', 'construction-tools', 'Tools for construction and building projects', 'UserCheck', '#ec4899', true, 6);

-- Insert sample products with proper brand and category references
INSERT INTO public.products (name, slug, description, brand_id, category_id, images, variants, featured, active) VALUES
(
    'FastDrill Pro 2000',
    'fastdrill-pro-2000',
    'High-performance cordless drill with advanced battery technology. Perfect for professional contractors and serious DIY enthusiasts.',
    (SELECT id FROM public.brands WHERE slug = 'fastdrill'),
    (SELECT id FROM public.categories WHERE slug = 'power-tools'),
    ARRAY['/images/products/fastdrill-pro-2000-1.jpg', '/images/products/fastdrill-pro-2000-2.jpg'],
    '[
        {
            "id": "fd2000-std",
            "name": "Standard Kit",
            "description": "Includes drill, battery, charger, and carrying case",
            "specifications": {
                "voltage": "18V",
                "battery_capacity": "2.0Ah",
                "max_torque": "65Nm",
                "chuck_size": "13mm"
            },
            "estimated_price_npr": 15000,
            "stock_status": "In Stock"
        },
        {
            "id": "fd2000-pro",
            "name": "Professional Kit",
            "description": "Includes drill, 2 batteries, fast charger, bit set, and premium case",
            "specifications": {
                "voltage": "18V",
                "battery_capacity": "4.0Ah",
                "max_torque": "65Nm",
                "chuck_size": "13mm"
            },
            "estimated_price_npr": 22000,
            "stock_status": "In Stock"
        }
    ]'::jsonb,
    true,
    true
),
(
    'Spider Wrench Set Professional',
    'spider-wrench-set-professional',
    'Complete professional wrench set with chrome vanadium steel construction. Includes both metric and imperial sizes.',
    (SELECT id FROM public.brands WHERE slug = 'spider'),
    (SELECT id FROM public.categories WHERE slug = 'hand-tools'),
    ARRAY['/images/products/spider-wrench-set-1.jpg', '/images/products/spider-wrench-set-2.jpg'],
    '[
        {
            "id": "sws-12pc",
            "name": "12-Piece Set",
            "description": "12 most common sizes in organized case",
            "specifications": {
                "material": "Chrome Vanadium Steel",
                "finish": "Chrome Plated",
                "sizes": "8mm-19mm",
                "case": "Blow Molded"
            },
            "estimated_price_npr": 8500,
            "stock_status": "In Stock"
        }
    ]'::jsonb,
    true,
    true
),
(
    'Gorkha Heavy Duty Hammer',
    'gorkha-heavy-duty-hammer',
    'Professional grade claw hammer with ergonomic grip and balanced design for construction work.',
    (SELECT id FROM public.brands WHERE slug = 'gorkha'),
    (SELECT id FROM public.categories WHERE slug = 'hand-tools'),
    ARRAY['/images/products/gorkha-hammer-1.jpg'],
    '[
        {
            "id": "ghd-16oz",
            "name": "16oz Hammer",
            "description": "Standard weight for general construction",
            "specifications": {
                "weight": "16oz",
                "handle": "Fiberglass",
                "head": "Forged Steel",
                "grip": "Anti-slip"
            },
            "estimated_price_npr": 2500,
            "stock_status": "In Stock"
        }
    ]'::jsonb,
    false,
    true
);

-- Insert default site settings
INSERT INTO public.site_settings (company_name, tagline, contact_email, contact_phone, contact_address)
VALUES ('Jeen Mata Impex', 'Premium Import Solutions', 'jeenmataimpex8@gmail.com', '+977-1-XXXXXXX', 'Kathmandu, Nepal');

-- Create a function to handle new user registration
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO public.users (id, email, full_name)
    VALUES (NEW.id, NEW.email, COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.email));
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger for new user registration (drop if exists first)
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Final verification queries
SELECT 'Brands created:' as info, count(*) as count FROM public.brands;
SELECT 'Categories created:' as info, count(*) as count FROM public.categories;
SELECT 'Products created:' as info, count(*) as count FROM public.products;
