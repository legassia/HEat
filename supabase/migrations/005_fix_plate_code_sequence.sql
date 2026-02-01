-- Fix plate code generation to prevent duplicates
-- Solution: Use a dedicated sequence table with row-level locking

-- Drop existing trigger and function
DROP TRIGGER IF EXISTS trigger_set_plate_code ON orders;
DROP FUNCTION IF EXISTS set_plate_code();
DROP FUNCTION IF EXISTS generate_plate_code();

-- ============================================
-- DAILY SEQUENCE TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS daily_plate_sequence (
  date DATE PRIMARY KEY DEFAULT CURRENT_DATE,
  last_number INTEGER NOT NULL DEFAULT 0
);

-- Disable RLS for internal sequence table (simpler approach)
ALTER TABLE daily_plate_sequence DISABLE ROW LEVEL SECURITY;

-- ============================================
-- PLATE CODE GENERATOR (with row-level lock)
-- ============================================
CREATE OR REPLACE FUNCTION generate_plate_code()
RETURNS TEXT AS $$
DECLARE
  today DATE := CURRENT_DATE;
  next_number INTEGER;
  new_code TEXT;
BEGIN
  -- Insert today's row if it doesn't exist, or get existing
  INSERT INTO daily_plate_sequence (date, last_number)
  VALUES (today, 0)
  ON CONFLICT (date) DO NOTHING;
  
  -- Atomically increment and get the new number (with row lock)
  UPDATE daily_plate_sequence
  SET last_number = last_number + 1
  WHERE date = today
  RETURNING last_number INTO next_number;
  
  -- Generate code like A01, A02, ... A99, then B01, B02, etc.
  IF next_number <= 99 THEN
    new_code := 'A' || LPAD(next_number::TEXT, 2, '0');
  ELSIF next_number <= 199 THEN
    new_code := 'B' || LPAD((next_number - 100)::TEXT, 2, '0');
  ELSIF next_number <= 299 THEN
    new_code := 'C' || LPAD((next_number - 200)::TEXT, 2, '0');
  ELSE
    -- Fallback for very high volume days
    new_code := 'Z' || next_number::TEXT;
  END IF;
  
  RETURN new_code;
END;
$$ LANGUAGE plpgsql;

-- ============================================
-- TRIGGER FUNCTION
-- ============================================
CREATE OR REPLACE FUNCTION set_plate_code()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.plate_code IS NULL OR NEW.plate_code = '' THEN
    NEW.plate_code := generate_plate_code();
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_set_plate_code
  BEFORE INSERT ON orders
  FOR EACH ROW
  EXECUTE FUNCTION set_plate_code();

-- ============================================
-- Add unique constraint on plate_code + date
-- ============================================
CREATE UNIQUE INDEX IF NOT EXISTS idx_orders_plate_code_daily 
ON orders (plate_code, DATE(created_at));
