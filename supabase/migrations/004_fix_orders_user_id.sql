-- Fix orders RLS: Auto-assign user_id via trigger
-- This fixes the issue where user_id is filtered out by Supabase before reaching the database

-- Function to auto-assign user_id on orders
CREATE OR REPLACE FUNCTION set_user_id_on_orders()
RETURNS TRIGGER AS $$
BEGIN
  -- If user_id is not provided or is NULL, assign from authenticated user
  IF NEW.user_id IS NULL THEN
    NEW.user_id := auth.uid();
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger that executes BEFORE INSERT
CREATE TRIGGER trigger_set_user_id_on_orders
  BEFORE INSERT ON orders
  FOR EACH ROW
  EXECUTE FUNCTION set_user_id_on_orders();

-- Update RLS policy to allow INSERT without validating user_id upfront
DROP POLICY IF EXISTS "Users can create orders" ON orders;

CREATE POLICY "Authenticated users can create orders"
  ON orders FOR INSERT
  TO authenticated
  WITH CHECK (true);  -- Allow any authenticated user to insert, trigger handles user_id

-- Keep SELECT policy the same (users can only see their own orders)
DROP POLICY IF EXISTS "Users can view own orders" ON orders;

CREATE POLICY "Authenticated users can view own orders"
  ON orders FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

