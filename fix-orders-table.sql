-- FIX ORDERS TABLE SCHEMA ISSUES
-- This script fixes the missing product_items column and ensures proper order functionality

-- 1. Check current orders table structure
SELECT 
    column_name,
    data_type,
    is_nullable,
    column_default
FROM information_schema.columns 
WHERE table_name = 'orders'
ORDER BY ordinal_position;

-- 2. Add missing product_items column to orders table
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'orders' AND column_name = 'product_items') THEN
        ALTER TABLE orders ADD COLUMN product_items JSONB NOT NULL DEFAULT '[]';
        RAISE NOTICE 'Added product_items column to orders table';
    ELSE
        RAISE NOTICE 'product_items column already exists in orders table';
    END IF;
END $$;

-- 3. Add other essential columns that might be missing
-- Add dealer_id column (foreign key to users table)
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'orders' AND column_name = 'dealer_id') THEN
        ALTER TABLE orders ADD COLUMN dealer_id TEXT REFERENCES users(id) ON DELETE CASCADE;
        RAISE NOTICE 'Added dealer_id column to orders table';
    END IF;
END $$;

-- Add order_status column
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'orders' AND column_name = 'order_status') THEN
        ALTER TABLE orders ADD COLUMN order_status TEXT DEFAULT 'pending' 
        CHECK (order_status IN ('pending', 'confirmed', 'processing', 'shipped', 'delivered', 'cancelled'));
        RAISE NOTICE 'Added order_status column to orders table';
    END IF;
END $$;

-- Add total_amount column
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'orders' AND column_name = 'total_amount') THEN
        ALTER TABLE orders ADD COLUMN total_amount DECIMAL(10,2) NOT NULL DEFAULT 0.00;
        RAISE NOTICE 'Added total_amount column to orders table';
    END IF;
END $$;

-- Add order_date column
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'orders' AND column_name = 'order_date') THEN
        ALTER TABLE orders ADD COLUMN order_date TIMESTAMP WITH TIME ZONE DEFAULT NOW();
        RAISE NOTICE 'Added order_date column to orders table';
    END IF;
END $$;

-- Add delivery_address column
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'orders' AND column_name = 'delivery_address') THEN
        ALTER TABLE orders ADD COLUMN delivery_address JSONB;
        RAISE NOTICE 'Added delivery_address column to orders table';
    END IF;
END $$;

-- Add notes column
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'orders' AND column_name = 'notes') THEN
        ALTER TABLE orders ADD COLUMN notes TEXT;
        RAISE NOTICE 'Added notes column to orders table';
    END IF;
END $$;

-- Add created_at and updated_at columns
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'orders' AND column_name = 'created_at') THEN
        ALTER TABLE orders ADD COLUMN created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW();
        RAISE NOTICE 'Added created_at column to orders table';
    END IF;
END $$;

DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'orders' AND column_name = 'updated_at') THEN
        ALTER TABLE orders ADD COLUMN updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW();
        RAISE NOTICE 'Added updated_at column to orders table';
    END IF;
END $$;

-- 4. Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_orders_dealer_id ON orders(dealer_id);
CREATE INDEX IF NOT EXISTS idx_orders_order_status ON orders(order_status);
CREATE INDEX IF NOT EXISTS idx_orders_order_date ON orders(order_date);
CREATE INDEX IF NOT EXISTS idx_orders_created_at ON orders(created_at);

-- 5. Enable RLS on orders table
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;

-- 6. Create RLS policies for orders
-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Dealers can view their own orders" ON orders;
DROP POLICY IF EXISTS "Dealers can insert their own orders" ON orders;
DROP POLICY IF EXISTS "Dealers can update their own orders" ON orders;
DROP POLICY IF EXISTS "Admins can view all orders" ON orders;
DROP POLICY IF EXISTS "Admins can update all orders" ON orders;

-- Dealers can view their own orders
CREATE POLICY "Dealers can view their own orders" ON orders 
FOR SELECT USING (
    dealer_id = auth.uid()::text OR
    EXISTS (
        SELECT 1 FROM users 
        WHERE id = auth.uid()::text AND role = 'dealer' AND id = orders.dealer_id
    )
);

-- Dealers can insert their own orders
CREATE POLICY "Dealers can insert their own orders" ON orders 
FOR INSERT WITH CHECK (
    dealer_id = auth.uid()::text AND
    EXISTS (
        SELECT 1 FROM users 
        WHERE id = auth.uid()::text AND role = 'dealer' AND dealer_status = 'approved'
    )
);

-- Dealers can update their own pending orders
CREATE POLICY "Dealers can update their own orders" ON orders 
FOR UPDATE USING (
    dealer_id = auth.uid()::text AND order_status = 'pending'
) WITH CHECK (
    dealer_id = auth.uid()::text
);

-- Admins can view all orders
CREATE POLICY "Admins can view all orders" ON orders 
FOR SELECT USING (
    EXISTS (
        SELECT 1 FROM users 
        WHERE id = auth.uid()::text AND role = 'admin'
    )
);

-- Admins can update all orders
CREATE POLICY "Admins can update all orders" ON orders 
FOR UPDATE USING (
    EXISTS (
        SELECT 1 FROM users 
        WHERE id = auth.uid()::text AND role = 'admin'
    )
) WITH CHECK (
    EXISTS (
        SELECT 1 FROM users 
        WHERE id = auth.uid()::text AND role = 'admin'
    )
);

-- 7. Create trigger for updated_at column
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

DROP TRIGGER IF EXISTS update_orders_updated_at ON orders;
CREATE TRIGGER update_orders_updated_at 
    BEFORE UPDATE ON orders 
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();

-- 8. Verify the final structure
SELECT 
    column_name,
    data_type,
    is_nullable,
    column_default
FROM information_schema.columns 
WHERE table_name = 'orders'
ORDER BY ordinal_position;

-- 9. Show sample product_items structure
DO $$
BEGIN
    RAISE NOTICE '📋 Sample product_items JSON structure:';
    RAISE NOTICE '[';
    RAISE NOTICE '  {';
    RAISE NOTICE '    "product_id": "uuid-here",';
    RAISE NOTICE '    "product_name": "Product Name",';
    RAISE NOTICE '    "quantity": 10,';
    RAISE NOTICE '    "unit_price": 25.50,';
    RAISE NOTICE '    "total_price": 255.00,';
    RAISE NOTICE '    "specifications": "Any special requirements"';
    RAISE NOTICE '  }';
    RAISE NOTICE ']';
END $$;

-- Success message
DO $$
BEGIN
    RAISE NOTICE '✅ Orders table schema fixed!';
    RAISE NOTICE '📋 Changes made:';
    RAISE NOTICE '   1. Added product_items JSONB column';
    RAISE NOTICE '   2. Added dealer_id foreign key column';
    RAISE NOTICE '   3. Added order_status with constraints';
    RAISE NOTICE '   4. Added total_amount decimal column';
    RAISE NOTICE '   5. Added order_date timestamp column';
    RAISE NOTICE '   6. Added delivery_address JSONB column';
    RAISE NOTICE '   7. Added notes text column';
    RAISE NOTICE '   8. Added created_at and updated_at columns';
    RAISE NOTICE '   9. Created performance indexes';
    RAISE NOTICE '   10. Enabled RLS with proper policies';
    RAISE NOTICE '   11. Added updated_at trigger';
    RAISE NOTICE '';
    RAISE NOTICE '🔄 Next: Test order placement from dealer portal';
END $$;
