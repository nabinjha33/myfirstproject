-- Add show_on_homepage column to brands table
-- This migration adds the ability to control which brands appear on the homepage

-- Add the show_on_homepage column to the brands table
ALTER TABLE public.brands 
ADD COLUMN IF NOT EXISTS show_on_homepage BOOLEAN DEFAULT true;

-- Create an index for better performance when filtering homepage brands
CREATE INDEX IF NOT EXISTS idx_brands_show_on_homepage ON public.brands(show_on_homepage);

-- Update existing brands to show on homepage by default (optional)
-- This ensures all current brands remain visible on homepage after migration
UPDATE public.brands 
SET show_on_homepage = true 
WHERE show_on_homepage IS NULL;

-- Add a comment to document the column purpose
COMMENT ON COLUMN public.brands.show_on_homepage IS 'Controls whether this brand appears in the homepage brands section';
