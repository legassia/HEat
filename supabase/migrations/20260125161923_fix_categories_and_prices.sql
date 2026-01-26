-- Fix categories and update prices to COP
-- Based on real menu prices

-- ============================================
-- 1. UPDATE CATEGORY CONSTRAINT
-- ============================================
ALTER TABLE products DROP CONSTRAINT IF EXISTS products_category_check;
ALTER TABLE products ADD CONSTRAINT products_category_check 
  CHECK (category IN ('arepas', 'perros', 'hamburguesas', 'chorizos', 'pinchos'));

-- ============================================
-- 2. CLEAR OLD PRODUCTS (Venezuelan style)
-- ============================================
TRUNCATE TABLE product_options CASCADE;
TRUNCATE TABLE products CASCADE;

-- ============================================
-- 3. INSERT BASE PRODUCTS (Paisa style, COP prices)
-- ============================================
-- Base prices from menu:
-- Arepa sola: $2,000
-- Perro sencillo: $6,000
-- Hamburguesa sencilla: $20,000
-- Chorizo: $5,000
-- Pincho: $6,000

INSERT INTO products (name, category, base_price, description, popular) VALUES
  ('Arepa', 'arepas', 2000, 'Arepa de maíz asada', false),
  ('Perro Caliente', 'perros', 6000, 'Perro caliente tradicional', false),
  ('Hamburguesa', 'hamburguesas', 20000, 'Hamburguesa con carne de res', true),
  ('Chorizo', 'chorizos', 5000, 'Chorizo asado', false),
  ('Pincho', 'pinchos', 6000, 'Pincho de pollo', false);

-- ============================================
-- 4. INSERT PRODUCT OPTIONS WITH COP PRICES
-- ============================================
-- Deduced prices from menu:
-- Queso: $1,500 (arepa sola $2,000 → con queso $3,500)
-- Jamón: $1,500
-- Carne: $10,500 (arepa con carne $12,500 - base $2,000)
-- Pollo/Mixta: $9,000
-- Chorizo paisa (addon): $5,000
-- Pincho (addon): $6,000
-- Huevo codorniz: $500
-- Tocineta: $1,200
-- Papitas: $1,000

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

