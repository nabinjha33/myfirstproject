-- Add missing columns to site_settings table
-- This script adds columns that are used in the admin settings form but missing from the database

-- Add missing columns to site_settings table
ALTER TABLE public.site_settings 
ADD COLUMN IF NOT EXISTS whatsapp_number TEXT DEFAULT '+977-9876543210',
ADD COLUMN IF NOT EXISTS default_theme TEXT DEFAULT 'light' CHECK (default_theme IN ('light', 'dark')),
ADD COLUMN IF NOT EXISTS default_language TEXT DEFAULT 'en' CHECK (default_language IN ('en', 'ne')),
ADD COLUMN IF NOT EXISTS enable_dealer_notifications BOOLEAN DEFAULT true,
ADD COLUMN IF NOT EXISTS enable_inquiry_notifications BOOLEAN DEFAULT true,
ADD COLUMN IF NOT EXISTS enable_whatsapp_notifications BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS auto_approve_dealers BOOLEAN DEFAULT false;

-- Update existing record with default values if it exists
UPDATE public.site_settings 
SET 
    whatsapp_number = COALESCE(whatsapp_number, '+977-9876543210'),
    default_theme = COALESCE(default_theme, 'light'),
    default_language = COALESCE(default_language, 'en'),
    enable_dealer_notifications = COALESCE(enable_dealer_notifications, true),
    enable_inquiry_notifications = COALESCE(enable_inquiry_notifications, true),
    enable_whatsapp_notifications = COALESCE(enable_whatsapp_notifications, false),
    auto_approve_dealers = COALESCE(auto_approve_dealers, false)
WHERE id IS NOT NULL;

-- If no settings record exists, insert a default one
INSERT INTO public.site_settings (
    company_name, 
    tagline, 
    contact_email, 
    contact_phone, 
    contact_address,
    whatsapp_number,
    default_theme,
    default_language,
    enable_dealer_notifications,
    enable_inquiry_notifications,
    enable_whatsapp_notifications,
    auto_approve_dealers
)
SELECT 
    'Jeen Mata Impex',
    'Premium Import Solutions from China & India',
    'jeenmataimpex8@gmail.com',
    '+977-1-XXXXXXX',
    'Kathmandu, Nepal',
    '+977-9876543210',
    'light',
    'en',
    true,
    true,
    false,
    false
WHERE NOT EXISTS (SELECT 1 FROM public.site_settings);

-- Verify the changes
SELECT 
    id,
    company_name,
    tagline,
    contact_email,
    contact_phone,
    contact_address,
    whatsapp_number,
    default_theme,
    default_language,
    enable_dealer_notifications,
    enable_inquiry_notifications,
    enable_whatsapp_notifications,
    auto_approve_dealers,
    created_at,
    updated_at
FROM public.site_settings;
