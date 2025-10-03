-- QUICK FIX FOR ORDERS TABLE - Add only essential missing columns
-- Run this immediately to fix order placement

-- Add product_items column (the main issue)
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'orders' AND column_name = 'product_items') THEN
        ALTER TABLE orders ADD COLUMN product_items JSONB DEFAULT '[]';
        RAISE NOTICE 'Added product_items column to orders table';
    END IF;
END $$;

-- Add product_details column (for storing JSON as text)
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'orders' AND column_name = 'product_details') THEN
        ALTER TABLE orders ADD COLUMN product_details TEXT;
        RAISE NOTICE 'Added product_details column to orders table';
    END IF;
END $$;

-- Add total_amount_npr column if missing
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'orders' AND column_name = 'total_amount_npr') THEN
        ALTER TABLE orders ADD COLUMN total_amount_npr DECIMAL(10,2) DEFAULT 0.00;
        RAISE NOTICE 'Added total_amount_npr column to orders table';
    END IF;
END $$;

-- Add dealer_name column if missing
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'orders' AND column_name = 'dealer_name') THEN
        ALTER TABLE orders ADD COLUMN dealer_name TEXT;
        RAISE NOTICE 'Added dealer_name column to orders table';
    END IF;
END $$;

-- Add dealer_phone column if missing
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'orders' AND column_name = 'dealer_phone') THEN
        ALTER TABLE orders ADD COLUMN dealer_phone TEXT;
        RAISE NOTICE 'Added dealer_phone column to orders table';
    END IF;
END $$;

-- Add dealer_address column if missing
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'orders' AND column_name = 'dealer_address') THEN
        ALTER TABLE orders ADD COLUMN dealer_address TEXT;
        RAISE NOTICE 'Added dealer_address column to orders table';
    END IF;
END $$;

-- Check final structure
SELECT 
    column_name,
    data_type,
    is_nullable
FROM information_schema.columns 
WHERE table_name = 'orders'
ORDER BY ordinal_position;

-- Success message
DO $$
BEGIN
    RAISE NOTICE '✅ Quick fix applied! Orders table now has essential columns.';
    RAISE NOTICE '📋 Added columns: product_items, product_details, total_amount_npr, dealer_name, dealer_phone, dealer_address';
    RAISE NOTICE '🔄 Try placing an order now - it should work!';
END $$;
