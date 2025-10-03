-- QUICK FIX FOR STATUS CHECK CONSTRAINT
-- This fixes the "orders_status_check" constraint violation

-- Show current constraints
SELECT 
    constraint_name,
    constraint_type
FROM information_schema.table_constraints 
WHERE table_name = 'orders' AND constraint_type = 'CHECK';

-- Drop the restrictive status check constraint
ALTER TABLE orders DROP CONSTRAINT IF EXISTS orders_status_check;

-- Add a more permissive status constraint that includes common values
ALTER TABLE orders ADD CONSTRAINT orders_status_check 
CHECK (status IN (
    'pending', 'confirmed', 'processing', 'shipped', 'delivered', 'cancelled', 
    'Submitted', 'submitted', 'Pending', 'Confirmed', 'Processing', 'Shipped', 
    'Delivered', 'Cancelled', 'new', 'active', 'completed'
));

-- Show final constraints
SELECT 
    constraint_name,
    constraint_type
FROM information_schema.table_constraints 
WHERE table_name = 'orders' AND constraint_type = 'CHECK';

-- Success message
DO $$
BEGIN
    RAISE NOTICE '✅ Status constraint fixed!';
    RAISE NOTICE '📋 Now accepts: pending, confirmed, processing, shipped, delivered, cancelled, Submitted, etc.';
    RAISE NOTICE '🔄 Try placing an order now - status constraint error should be resolved!';
END $$;
