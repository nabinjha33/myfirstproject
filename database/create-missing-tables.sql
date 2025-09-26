-- Create missing tables for base44-nextjs to match base44_Complete functionality

-- Site Settings table
CREATE TABLE IF NOT EXISTS site_settings (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
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
CREATE TABLE IF NOT EXISTS page_visits (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    path TEXT NOT NULL,
    page TEXT NOT NULL,
    user_email TEXT,
    user_agent TEXT,
    visited_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Insert default site settings if none exist
INSERT INTO site_settings (company_name, tagline, contact_email, contact_phone, contact_address)
SELECT 'Jeen Mata Impex', 'Premium Import Solutions', 'jeenmataimpex8@gmail.com', '+977-1-XXXXXXX', 'Kathmandu, Nepal'
WHERE NOT EXISTS (SELECT 1 FROM site_settings);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_page_visits_visited_at ON page_visits(visited_at);
CREATE INDEX IF NOT EXISTS idx_page_visits_page ON page_visits(page);
CREATE INDEX IF NOT EXISTS idx_page_visits_user_email ON page_visits(user_email);

-- Enable RLS (Row Level Security) if needed
ALTER TABLE site_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE page_visits ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist, then create new ones
DROP POLICY IF EXISTS "Allow public read access to site_settings" ON site_settings;
DROP POLICY IF EXISTS "Allow admin update access to site_settings" ON site_settings;
DROP POLICY IF EXISTS "Allow public insert to page_visits" ON page_visits;
DROP POLICY IF EXISTS "Allow admin read access to page_visits" ON page_visits;

-- Create policies for site_settings (admin only for updates, public read)
CREATE POLICY "Allow public read access to site_settings" ON site_settings
    FOR SELECT USING (true);

CREATE POLICY "Allow admin update access to site_settings" ON site_settings
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM users 
            WHERE users.id = auth.uid() 
            AND users.role = 'admin'
        )
    );

-- Create policies for page_visits (public insert, admin read)
CREATE POLICY "Allow public insert to page_visits" ON page_visits
    FOR INSERT WITH CHECK (true);

CREATE POLICY "Allow admin read access to page_visits" ON page_visits
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM users 
            WHERE users.id = auth.uid() 
            AND users.role = 'admin'
        )
    );

-- Update function for site_settings updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create trigger for site_settings
DROP TRIGGER IF EXISTS update_site_settings_updated_at ON site_settings;
CREATE TRIGGER update_site_settings_updated_at
    BEFORE UPDATE ON site_settings
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();
