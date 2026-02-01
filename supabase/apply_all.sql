-- ============================================
-- HEAT DATABASE - APLICAR TODAS LAS MIGRACIONES
-- Ejecutar en SQL Editor de Supabase Dashboard
-- ============================================

-- ============================================
-- 1. PROFILES TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT,
  phone TEXT,
  address TEXT,
  avatar_url TEXT,
  role TEXT DEFAULT 'customer',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

-- Policies (drop if exist first)
DROP POLICY IF EXISTS "Users can view own profile" ON profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON profiles;
DROP POLICY IF EXISTS "Users can insert own profile" ON profiles;

CREATE POLICY "Users can view own profile"
  ON profiles FOR SELECT
  USING (auth.uid() = id);

CREATE POLICY "Users can update own profile"
  ON profiles FOR UPDATE
  USING (auth.uid() = id);

CREATE POLICY "Users can insert own profile"
  ON profiles FOR INSERT
  WITH CHECK (auth.uid() = id);

-- ============================================
-- 2. PRODUCTS TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS products (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  category TEXT NOT NULL,
  base_price DECIMAL(10, 2) NOT NULL,
  description TEXT,
  image_url TEXT,
  is_available BOOLEAN DEFAULT true,
  popular BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Add constraint for categories (including chorizos y pinchos)
ALTER TABLE products DROP CONSTRAINT IF EXISTS products_category_check;
ALTER TABLE products ADD CONSTRAINT products_category_check 
  CHECK (category IN ('arepas', 'perros', 'hamburguesas', 'chorizos', 'pinchos'));

-- Public read access
ALTER TABLE products ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Anyone can view products" ON products;
CREATE POLICY "Anyone can view products"
  ON products FOR SELECT
  TO authenticated, anon
  USING (is_available = true);

-- ============================================
-- 3. PRODUCT OPTIONS TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS product_options (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id UUID REFERENCES products(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  option_group TEXT NOT NULL,
  price_modifier DECIMAL(10, 2) DEFAULT 0,
  is_default BOOLEAN DEFAULT false,
  is_available BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Public read access
ALTER TABLE product_options ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Anyone can view product options" ON product_options;
CREATE POLICY "Anyone can view product options"
  ON product_options FOR SELECT
  TO authenticated, anon
  USING (is_available = true);

-- ============================================
-- 4. ORDERS TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS orders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  plate_code TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'cooking', 'ready', 'delivered', 'cancelled')),
  total DECIMAL(10, 2) NOT NULL,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view own orders" ON orders;
DROP POLICY IF EXISTS "Users can create orders" ON orders;
DROP POLICY IF EXISTS "Admins can view all orders" ON orders;
DROP POLICY IF EXISTS "Admins can update orders" ON orders;

CREATE POLICY "Users can view own orders"
  ON orders FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create orders"
  ON orders FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Admins can view all orders" ON orders
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE profiles.id = auth.uid() 
      AND profiles.role IN ('admin', 'dev')
    )
  );

CREATE POLICY "Admins can update orders" ON orders
  FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE profiles.id = auth.uid() 
      AND profiles.role IN ('admin', 'dev')
    )
  );

-- ============================================
-- 5. ORDER ITEMS TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS order_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id UUID REFERENCES orders(id) ON DELETE CASCADE,
  product_id UUID REFERENCES products(id) ON DELETE SET NULL,
  quantity INTEGER NOT NULL DEFAULT 1,
  selected_options JSONB DEFAULT '[]'::jsonb,
  subtotal DECIMAL(10, 2) NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE order_items ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view own order items" ON order_items;
DROP POLICY IF EXISTS "Users can create order items" ON order_items;

CREATE POLICY "Users can view own order items"
  ON order_items FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM orders 
      WHERE orders.id = order_items.order_id 
      AND orders.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can create order items"
  ON order_items FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM orders 
      WHERE orders.id = order_items.order_id 
      AND orders.user_id = auth.uid()
    )
  );

-- ============================================
-- 6. FUNCTIONS
-- ============================================

-- Generate daily plate code
CREATE OR REPLACE FUNCTION generate_plate_code()
RETURNS TEXT AS $$
DECLARE
  today_count INTEGER;
  new_code TEXT;
BEGIN
  SELECT COUNT(*) + 1 INTO today_count
  FROM orders
  WHERE DATE(created_at) = CURRENT_DATE;
  
  new_code := 'K' || LPAD(today_count::TEXT, 2, '0');
  
  RETURN new_code;
END;
$$ LANGUAGE plpgsql;

-- Set plate code trigger function
CREATE OR REPLACE FUNCTION set_plate_code()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.plate_code IS NULL OR NEW.plate_code = '' THEN
    NEW.plate_code := generate_plate_code();
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Handle new user (create profile)
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO profiles (id, name, avatar_url, role)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'full_name', ''),
    COALESCE(NEW.raw_user_meta_data->>'avatar_url', ''),
    'customer'
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Update timestamp function
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- ============================================
-- 7. TRIGGERS (drop and recreate)
-- ============================================

DROP TRIGGER IF EXISTS trigger_set_plate_code ON orders;
CREATE TRIGGER trigger_set_plate_code
  BEFORE INSERT ON orders
  FOR EACH ROW
  EXECUTE FUNCTION set_plate_code();

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION handle_new_user();

DROP TRIGGER IF EXISTS trigger_profiles_updated ON profiles;
CREATE TRIGGER trigger_profiles_updated
  BEFORE UPDATE ON profiles
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at();

DROP TRIGGER IF EXISTS trigger_products_updated ON products;
CREATE TRIGGER trigger_products_updated
  BEFORE UPDATE ON products
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at();

DROP TRIGGER IF EXISTS trigger_orders_updated ON orders;
CREATE TRIGGER trigger_orders_updated
  BEFORE UPDATE ON orders
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at();

-- ============================================
-- 8. REALTIME
-- ============================================
ALTER PUBLICATION supabase_realtime ADD TABLE orders;

-- ============================================
-- 9. SEED PRODUCTS (COP prices)
-- ============================================
TRUNCATE TABLE product_options CASCADE;
TRUNCATE TABLE products CASCADE;

INSERT INTO products (name, category, base_price, description, popular) VALUES
  ('Arepa', 'arepas', 2000, 'Arepa de maíz asada', false),
  ('Perro Caliente', 'perros', 6000, 'Perro caliente tradicional', false),
  ('Hamburguesa', 'hamburguesas', 20000, 'Hamburguesa con carne de res', true),
  ('Chorizo', 'chorizos', 5000, 'Chorizo asado', false),
  ('Pincho', 'pinchos', 6000, 'Pincho de pollo', false);

-- AREPAS OPTIONS
INSERT INTO product_options (product_id, name, option_group, price_modifier, is_default)
SELECT id, 'Queso', 'proteina', 1500, false FROM products WHERE category = 'arepas';

INSERT INTO product_options (product_id, name, option_group, price_modifier, is_default)
SELECT id, 'Jamón', 'proteina', 1500, false FROM products WHERE category = 'arepas';

INSERT INTO product_options (product_id, name, option_group, price_modifier, is_default)
SELECT id, 'Carne', 'proteina', 10500, false FROM products WHERE category = 'arepas';

INSERT INTO product_options (product_id, name, option_group, price_modifier, is_default)
SELECT id, 'Pollo', 'proteina', 9000, false FROM products WHERE category = 'arepas';

INSERT INTO product_options (product_id, name, option_group, price_modifier, is_default)
SELECT id, 'Chorizo Paisa', 'proteina', 5000, false FROM products WHERE category = 'arepas';

INSERT INTO product_options (product_id, name, option_group, price_modifier, is_default)
SELECT id, 'Pincho', 'proteina', 6000, false FROM products WHERE category = 'arepas';

INSERT INTO product_options (product_id, name, option_group, price_modifier, is_default)
SELECT id, 'Torta Carne', 'proteina', 8000, false FROM products WHERE category = 'arepas';

INSERT INTO product_options (product_id, name, option_group, price_modifier, is_default)
SELECT id, 'Huevo Codorniz', 'extra', 500, false FROM products WHERE category = 'arepas';

INSERT INTO product_options (product_id, name, option_group, price_modifier, is_default)
SELECT id, 'Tocineta', 'extra', 1200, false FROM products WHERE category = 'arepas';

INSERT INTO product_options (product_id, name, option_group, price_modifier, is_default)
SELECT id, 'Papitas', 'extra', 1000, false FROM products WHERE category = 'arepas';

INSERT INTO product_options (product_id, name, option_group, price_modifier, is_default)
SELECT id, 'Salsas', 'extra', 500, false FROM products WHERE category = 'arepas';

-- PERROS OPTIONS
INSERT INTO product_options (product_id, name, option_group, price_modifier, is_default)
SELECT id, 'Chorizo Paisa', 'proteina', 3000, false FROM products WHERE category = 'perros';

INSERT INTO product_options (product_id, name, option_group, price_modifier, is_default)
SELECT id, 'Huevo Codorniz', 'proteina', 700, false FROM products WHERE category = 'perros';

INSERT INTO product_options (product_id, name, option_group, price_modifier, is_default)
SELECT id, 'Queso', 'proteina', 500, false FROM products WHERE category = 'perros';

INSERT INTO product_options (product_id, name, option_group, price_modifier, is_default)
SELECT id, 'Jamón', 'proteina', 600, false FROM products WHERE category = 'perros';

INSERT INTO product_options (product_id, name, option_group, price_modifier, is_default)
SELECT id, 'Salchicha Extra', 'proteina', 2000, false FROM products WHERE category = 'perros';

INSERT INTO product_options (product_id, name, option_group, price_modifier, is_default)
SELECT id, 'Cebolla', 'extra', 500, true FROM products WHERE category = 'perros';

INSERT INTO product_options (product_id, name, option_group, price_modifier, is_default)
SELECT id, 'Papitas', 'extra', 800, false FROM products WHERE category = 'perros';

INSERT INTO product_options (product_id, name, option_group, price_modifier, is_default)
SELECT id, 'Salsas', 'extra', 200, true FROM products WHERE category = 'perros';

INSERT INTO product_options (product_id, name, option_group, price_modifier, is_default)
SELECT id, 'Tocineta', 'extra', 1200, false FROM products WHERE category = 'perros';

-- HAMBURGUESAS OPTIONS
INSERT INTO product_options (product_id, name, option_group, price_modifier, is_default)
SELECT id, 'Carne Extra', 'proteina', 4000, false FROM products WHERE category = 'hamburguesas';

INSERT INTO product_options (product_id, name, option_group, price_modifier, is_default)
SELECT id, 'Huevo', 'proteina', 700, false FROM products WHERE category = 'hamburguesas';

INSERT INTO product_options (product_id, name, option_group, price_modifier, is_default)
SELECT id, 'Tocineta', 'proteina', 1200, false FROM products WHERE category = 'hamburguesas';

INSERT INTO product_options (product_id, name, option_group, price_modifier, is_default)
SELECT id, 'Queso', 'extra', 500, true FROM products WHERE category = 'hamburguesas';

INSERT INTO product_options (product_id, name, option_group, price_modifier, is_default)
SELECT id, 'Jamón', 'extra', 600, false FROM products WHERE category = 'hamburguesas';

INSERT INTO product_options (product_id, name, option_group, price_modifier, is_default)
SELECT id, 'Papitas', 'extra', 800, false FROM products WHERE category = 'hamburguesas';

INSERT INTO product_options (product_id, name, option_group, price_modifier, is_default)
SELECT id, 'Tomate', 'extra', 300, true FROM products WHERE category = 'hamburguesas';

INSERT INTO product_options (product_id, name, option_group, price_modifier, is_default)
SELECT id, 'Lechuga', 'extra', 300, true FROM products WHERE category = 'hamburguesas';

-- CHORIZOS OPTIONS
INSERT INTO product_options (product_id, name, option_group, price_modifier, is_default)
SELECT id, 'Paisa', 'proteina', 0, true FROM products WHERE category = 'chorizos';

INSERT INTO product_options (product_id, name, option_group, price_modifier, is_default)
SELECT id, 'Res', 'proteina', 0, false FROM products WHERE category = 'chorizos';

INSERT INTO product_options (product_id, name, option_group, price_modifier, is_default)
SELECT id, 'Queso', 'extra', 1500, false FROM products WHERE category = 'chorizos';

INSERT INTO product_options (product_id, name, option_group, price_modifier, is_default)
SELECT id, 'Arepa', 'extra', 2000, true FROM products WHERE category = 'chorizos';

-- PINCHOS OPTIONS
INSERT INTO product_options (product_id, name, option_group, price_modifier, is_default)
SELECT id, 'Pollo', 'proteina', 0, true FROM products WHERE category = 'pinchos';

INSERT INTO product_options (product_id, name, option_group, price_modifier, is_default)
SELECT id, 'Arepa', 'extra', 2000, false FROM products WHERE category = 'pinchos';

INSERT INTO product_options (product_id, name, option_group, price_modifier, is_default)
SELECT id, 'Papas', 'extra', 800, false FROM products WHERE category = 'pinchos';

-- Index for roles
CREATE INDEX IF NOT EXISTS idx_profiles_role ON profiles(role);

-- ============================================
-- DONE! Auth should work now
-- ============================================

