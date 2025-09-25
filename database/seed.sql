-- Seed data for Jeen Mata Impex Database
-- This file contains initial data to populate the database

-- Insert sample brands
INSERT INTO public.brands (name, slug, description, origin_country, established_year, specialty, active) VALUES
('FastDrill', 'fastdrill', 'Professional power tools manufacturer', 'Germany', '1985', 'Power Tools', true),
('Spider', 'spider', 'High-quality hand tools and equipment', 'Japan', '1978', 'Hand Tools', true),
('TechPro', 'techpro', 'Advanced industrial equipment', 'USA', '1992', 'Industrial Equipment', true),
('BuildMaster', 'buildmaster', 'Construction and building tools', 'Italy', '1965', 'Construction Tools', true),
('PrecisionCraft', 'precisioncraft', 'Precision measurement instruments', 'Switzerland', '1955', 'Measurement Tools', true)
ON CONFLICT (slug) DO NOTHING;

-- Insert sample categories
INSERT INTO public.categories (name, slug, description, active) VALUES
('Power Tools', 'power-tools', 'Electric and battery-powered tools', true),
('Hand Tools', 'hand-tools', 'Manual tools and equipment', true),
('Measurement Tools', 'measurement-tools', 'Precision measurement instruments', true),
('Safety Equipment', 'safety-equipment', 'Personal protective equipment', true),
('Industrial Equipment', 'industrial-equipment', 'Heavy-duty industrial machinery', true),
('Construction Tools', 'construction-tools', 'Tools for construction and building', true),
('Automotive Tools', 'automotive-tools', 'Specialized automotive equipment', true),
('Garden Tools', 'garden-tools', 'Gardening and landscaping tools', true)
ON CONFLICT (slug) DO NOTHING;

-- Insert sample products
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
        },
        {
            "id": "sws-24pc",
            "name": "24-Piece Set",
            "description": "Complete set with both metric and imperial sizes",
            "specifications": {
                "material": "Chrome Vanadium Steel",
                "finish": "Chrome Plated",
                "sizes": "6mm-24mm + 1/4\"-15/16\"",
                "case": "Metal Tool Box"
            },
            "estimated_price_npr": 15500,
            "stock_status": "In Stock"
        }
    ]'::jsonb,
    true,
    true
),
(
    'TechPro Digital Caliper',
    'techpro-digital-caliper',
    'Precision digital caliper with LCD display. Accurate to 0.01mm with both metric and imperial measurements.',
    (SELECT id FROM public.brands WHERE slug = 'techpro'),
    (SELECT id FROM public.categories WHERE slug = 'measurement-tools'),
    ARRAY['/images/products/techpro-caliper-1.jpg'],
    '[
        {
            "id": "tpc-150",
            "name": "150mm (6 inch)",
            "description": "Standard size for most applications",
            "specifications": {
                "range": "0-150mm / 0-6 inch",
                "accuracy": "±0.01mm",
                "resolution": "0.01mm",
                "battery": "CR2032"
            },
            "estimated_price_npr": 3500,
            "stock_status": "In Stock"
        },
        {
            "id": "tpc-200",
            "name": "200mm (8 inch)",
            "description": "Extended range for larger measurements",
            "specifications": {
                "range": "0-200mm / 0-8 inch",
                "accuracy": "±0.01mm",
                "resolution": "0.01mm",
                "battery": "CR2032"
            },
            "estimated_price_npr": 4200,
            "stock_status": "In Stock"
        }
    ]'::jsonb,
    false,
    true
),
(
    'BuildMaster Concrete Mixer',
    'buildmaster-concrete-mixer',
    'Heavy-duty concrete mixer for construction projects. Electric motor with robust steel drum construction.',
    (SELECT id FROM public.brands WHERE slug = 'buildmaster'),
    (SELECT id FROM public.categories WHERE slug = 'construction-tools'),
    ARRAY['/images/products/buildmaster-mixer-1.jpg', '/images/products/buildmaster-mixer-2.jpg'],
    '[
        {
            "id": "bcm-120",
            "name": "120L Capacity",
            "description": "Ideal for small to medium construction projects",
            "specifications": {
                "capacity": "120 liters",
                "motor": "1.5HP Electric",
                "voltage": "220V",
                "weight": "85kg"
            },
            "estimated_price_npr": 45000,
            "stock_status": "In Stock"
        },
        {
            "id": "bcm-200",
            "name": "200L Capacity",
            "description": "Heavy-duty mixer for large construction projects",
            "specifications": {
                "capacity": "200 liters",
                "motor": "2.5HP Electric",
                "voltage": "220V",
                "weight": "120kg"
            },
            "estimated_price_npr": 65000,
            "stock_status": "Limited Stock"
        }
    ]'::jsonb,
    true,
    true
),
(
    'PrecisionCraft Laser Level',
    'precisioncraft-laser-level',
    'Professional laser level with self-leveling technology. Perfect for construction and installation work.',
    (SELECT id FROM public.brands WHERE slug = 'precisioncraft'),
    (SELECT id FROM public.categories WHERE slug = 'measurement-tools'),
    ARRAY['/images/products/precisioncraft-laser-1.jpg'],
    '[
        {
            "id": "pcl-basic",
            "name": "Basic Model",
            "description": "Essential features for most applications",
            "specifications": {
                "range": "30 meters",
                "accuracy": "±2mm at 10m",
                "laser_class": "Class II",
                "battery_life": "20 hours"
            },
            "estimated_price_npr": 12000,
            "stock_status": "In Stock"
        },
        {
            "id": "pcl-pro",
            "name": "Professional Model",
            "description": "Advanced features with remote control",
            "specifications": {
                "range": "50 meters",
                "accuracy": "±1mm at 10m",
                "laser_class": "Class II",
                "battery_life": "30 hours"
            },
            "estimated_price_npr": 18500,
            "stock_status": "In Stock"
        }
    ]'::jsonb,
    false,
    true
)
ON CONFLICT (slug) DO NOTHING;

-- Insert sample dealer applications
INSERT INTO public.dealer_applications (
    business_name, contact_person, email, phone, whatsapp, address, vat_pan, 
    business_type, years_in_business, interested_brands, annual_turnover, 
    experience_years, message, status
) VALUES
(
    'Kathmandu Hardware Store',
    'Ram Sharma',
    'ram@kathmanduHardware.com',
    '+977-1-4567890',
    '+977-9841234567',
    'Thamel, Kathmandu, Nepal',
    '301234567',
    'Retail',
    '8',
    ARRAY['FastDrill', 'Spider', 'TechPro'],
    'NPR 50,00,000 - NPR 1,00,00,000',
    8,
    'We are an established hardware store in Kathmandu with strong customer base. Looking to expand our power tools section.',
    'approved'
),
(
    'Pokhara Tools & Equipment',
    'Sita Gurung',
    'sita@pokharatools.com',
    '+977-61-123456',
    '+977-9856789012',
    'Lakeside, Pokhara, Nepal',
    '301234568',
    'Wholesale',
    '12',
    ARRAY['BuildMaster', 'PrecisionCraft'],
    'NPR 1,00,00,000+',
    12,
    'We specialize in construction tools and serve contractors across western Nepal.',
    'approved'
),
(
    'Chitwan Industrial Supplies',
    'Hari Thapa',
    'hari@chitwansupplies.com',
    '+977-56-789012',
    '+977-9812345678',
    'Bharatpur, Chitwan, Nepal',
    '301234569',
    'Industrial',
    '5',
    ARRAY['TechPro', 'BuildMaster'],
    'NPR 25,00,000 - NPR 50,00,000',
    5,
    'We supply industrial equipment to factories and manufacturing units in Chitwan region.',
    'pending'
),
(
    'Biratnagar Hardware Hub',
    'Maya Rai',
    'maya@biratHardware.com',
    '+977-21-456789',
    '+977-9823456789',
    'Main Road, Biratnagar, Nepal',
    '301234570',
    'Retail',
    '3',
    ARRAY['FastDrill', 'Spider'],
    'NPR 10,00,000 - NPR 25,00,000',
    3,
    'New business looking to establish strong presence in eastern Nepal market.',
    'pending'
)
ON CONFLICT DO NOTHING;

-- Insert sample shipments
INSERT INTO public.shipments (
    tracking_number, origin_country, status, eta_date, product_names, port_name, last_updated
) VALUES
(
    'TRK-2024-001',
    'Germany',
    'in_transit',
    '2024-04-15',
    ARRAY['FastDrill Pro 2000', 'FastDrill Accessories'],
    'Tribhuvan International Airport',
    NOW() - INTERVAL '2 days'
),
(
    'TRK-2024-002',
    'Japan',
    'customs',
    '2024-04-10',
    ARRAY['Spider Wrench Set Professional', 'Spider Tool Accessories'],
    'Tribhuvan International Airport',
    NOW() - INTERVAL '1 day'
),
(
    'TRK-2024-003',
    'Italy',
    'delivered',
    '2024-03-25',
    ARRAY['BuildMaster Concrete Mixer'],
    'Birgunj Customs',
    NOW() - INTERVAL '5 days'
),
(
    'TRK-2024-004',
    'USA',
    'pending',
    '2024-04-20',
    ARRAY['TechPro Digital Caliper', 'TechPro Measurement Tools'],
    'Tribhuvan International Airport',
    NOW()
)
ON CONFLICT (tracking_number) DO NOTHING;

-- Note: Users will be created through Supabase Auth signup process
-- Sample orders without specific user references
INSERT INTO public.orders (
    order_number, dealer_id, dealer_email, dealer_name, contact_person, contact_phone,
    status, order_date, items, total_items, estimated_total_value, additional_notes, inquiry_type
) VALUES
(
    'ORD-2024-001',
    NULL,
    'ram@kathmanduHardware.com',
    'Kathmandu Hardware Store',
    'Ram Sharma',
    '+977-9841234567',
    'confirmed',
    NOW() - INTERVAL '3 days',
    '[
        {
            "product_id": "fastdrill-pro-2000",
            "product_name": "FastDrill Pro 2000",
            "variant_id": "fd2000-std",
            "variant_name": "Standard Kit",
            "quantity": 5,
            "unit_price_npr": 15000,
            "total_price_npr": 75000
        },
        {
            "product_id": "spider-wrench-set-professional",
            "product_name": "Spider Wrench Set Professional",
            "variant_id": "sws-12pc",
            "variant_name": "12-Piece Set",
            "quantity": 3,
            "unit_price_npr": 8500,
            "total_price_npr": 25500
        }
    ]'::jsonb,
    8,
    100500.00,
    'Please ensure fast delivery as we have customer orders pending.',
    'order'
),
(
    'INQ-2024-001',
    NULL,
    'sita@pokharatools.com',
    'Pokhara Tools & Equipment',
    'Sita Gurung',
    '+977-9856789012',
    'pending',
    NOW() - INTERVAL '1 day',
    '[
        {
            "product_id": "buildmaster-concrete-mixer",
            "product_name": "BuildMaster Concrete Mixer",
            "variant_id": "bcm-200",
            "variant_name": "200L Capacity",
            "quantity": 2,
            "unit_price_npr": 65000,
            "total_price_npr": 130000
        }
    ]'::jsonb,
    2,
    130000.00,
    'Bulk order inquiry for construction project. Need best pricing.',
    'inquiry'
)
ON CONFLICT (order_number) DO NOTHING;
