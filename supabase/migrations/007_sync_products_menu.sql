-- Sync products with menu.config.ts
-- Run this to ensure DB matches the frontend configuration
-- Safe to run multiple times (idempotent)

-- ============================================
-- 1. ENSURE CATEGORIES ARE CORRECT
-- ============================================
ALTER TABLE products DROP CONSTRAINT IF EXISTS products_category_check;
ALTER TABLE products ADD CONSTRAINT products_category_check 
  CHECK (category IN ('arepas', 'perros', 'hamburguesas', 'chorizos', 'pinchos'));

-- ============================================
-- 2. UPSERT BASE PRODUCTS
-- ============================================
-- First delete any products not in our categories
DELETE FROM products WHERE category NOT IN ('arepas', 'perros', 'hamburguesas', 'chorizos', 'pinchos');

-- Clear existing options (will recreate)
TRUNCATE TABLE product_options CASCADE;

-- Upsert products using ON CONFLICT
INSERT INTO products (name, category, base_price, description, popular) VALUES
  ('Arepa', 'arepas', 2000, 'Arepa de maíz asada al carbón', false),
  ('Perro Caliente', 'perros', 6000, 'Perro caliente tradicional', false),
  ('Hamburguesa', 'hamburguesas', 20000, 'Hamburguesa con carne de res 150g', true),
  ('Chorizo', 'chorizos', 5000, 'Chorizo asado al carbón', false),
  ('Pincho', 'pinchos', 6000, 'Pincho de pollo marinado', false)
ON CONFLICT (name) DO UPDATE SET
  base_price = EXCLUDED.base_price,
  description = EXCLUDED.description,
  category = EXCLUDED.category;

-- ============================================
-- 3. AREPAS OPTIONS
-- ============================================
-- Proteins
INSERT INTO product_options (product_id, name, option_group, price_modifier, is_default)
SELECT id, 'Queso', 'proteina', 1500, false FROM products WHERE category = 'arepas';

INSERT INTO product_options (product_id, name, option_group, price_modifier, is_default)
SELECT id, 'Jamón', 'proteina', 1500, false FROM products WHERE category = 'arepas';

INSERT INTO product_options (product_id, name, option_group, price_modifier, is_default)
SELECT id, 'Carne', 'proteina', 10500, false FROM products WHERE category = 'arepas';

INSERT INTO product_options (product_id, name, option_group, price_modifier, is_default)
SELECT id, 'Pollo', 'proteina', 9000, false FROM products WHERE category = 'arepas';

INSERT INTO product_options (product_id, name, option_group, price_modifier, is_default)
SELECT id, 'Torta Carne', 'proteina', 8000, false FROM products WHERE category = 'arepas';

INSERT INTO product_options (product_id, name, option_group, price_modifier, is_default)
SELECT id, 'Chorizo Paisa', 'proteina', 5000, false FROM products WHERE category = 'arepas';

INSERT INTO product_options (product_id, name, option_group, price_modifier, is_default)
SELECT id, 'Pincho', 'proteina', 6000, false FROM products WHERE category = 'arepas';

-- Extras
INSERT INTO product_options (product_id, name, option_group, price_modifier, is_default)
SELECT id, 'Huevo Codorniz', 'extra', 500, false FROM products WHERE category = 'arepas';

INSERT INTO product_options (product_id, name, option_group, price_modifier, is_default)
SELECT id, 'Tocineta', 'extra', 1200, false FROM products WHERE category = 'arepas';

INSERT INTO product_options (product_id, name, option_group, price_modifier, is_default)
SELECT id, 'Papitas', 'extra', 1000, false FROM products WHERE category = 'arepas';

INSERT INTO product_options (product_id, name, option_group, price_modifier, is_default)
SELECT id, 'Salsas', 'extra', 500, false FROM products WHERE category = 'arepas';

-- ============================================
-- 4. CHORIZOS OPTIONS
-- ============================================
-- Proteins (tipo de chorizo)
INSERT INTO product_options (product_id, name, option_group, price_modifier, is_default)
SELECT id, 'Paisa', 'proteina', 0, true FROM products WHERE category = 'chorizos';

INSERT INTO product_options (product_id, name, option_group, price_modifier, is_default)
SELECT id, 'Res', 'proteina', 0, false FROM products WHERE category = 'chorizos';

-- Extras
INSERT INTO product_options (product_id, name, option_group, price_modifier, is_default)
SELECT id, 'Queso', 'extra', 1500, false FROM products WHERE category = 'chorizos';

INSERT INTO product_options (product_id, name, option_group, price_modifier, is_default)
SELECT id, 'Arepa', 'extra', 2000, true FROM products WHERE category = 'chorizos';

-- ============================================
-- 5. PINCHOS OPTIONS
-- ============================================
-- Proteins
INSERT INTO product_options (product_id, name, option_group, price_modifier, is_default)
SELECT id, 'Pollo', 'proteina', 0, true FROM products WHERE category = 'pinchos';

-- Extras
INSERT INTO product_options (product_id, name, option_group, price_modifier, is_default)
SELECT id, 'Arepa', 'extra', 2000, false FROM products WHERE category = 'pinchos';

INSERT INTO product_options (product_id, name, option_group, price_modifier, is_default)
SELECT id, 'Papas', 'extra', 800, false FROM products WHERE category = 'pinchos';

-- ============================================
-- 6. HAMBURGUESAS OPTIONS
-- ============================================
-- Proteins
INSERT INTO product_options (product_id, name, option_group, price_modifier, is_default)
SELECT id, 'Carne Extra', 'proteina', 4000, false FROM products WHERE category = 'hamburguesas';

INSERT INTO product_options (product_id, name, option_group, price_modifier, is_default)
SELECT id, 'Huevo', 'proteina', 700, false FROM products WHERE category = 'hamburguesas';

INSERT INTO product_options (product_id, name, option_group, price_modifier, is_default)
SELECT id, 'Tocineta', 'proteina', 1200, false FROM products WHERE category = 'hamburguesas';

-- Extras (algunos por defecto)
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

-- ============================================
-- 7. PERROS OPTIONS
-- ============================================
-- Proteins
INSERT INTO product_options (product_id, name, option_group, price_modifier, is_default)
SELECT id, 'Salchicha Extra', 'proteina', 2000, false FROM products WHERE category = 'perros';

INSERT INTO product_options (product_id, name, option_group, price_modifier, is_default)
SELECT id, 'Chorizo Paisa', 'proteina', 3000, false FROM products WHERE category = 'perros';

INSERT INTO product_options (product_id, name, option_group, price_modifier, is_default)
SELECT id, 'Huevo Codorniz', 'proteina', 700, false FROM products WHERE category = 'perros';

INSERT INTO product_options (product_id, name, option_group, price_modifier, is_default)
SELECT id, 'Queso', 'proteina', 500, false FROM products WHERE category = 'perros';

INSERT INTO product_options (product_id, name, option_group, price_modifier, is_default)
SELECT id, 'Jamón', 'proteina', 600, false FROM products WHERE category = 'perros';

-- Extras (algunos por defecto para perro sencillo)
INSERT INTO product_options (product_id, name, option_group, price_modifier, is_default)
SELECT id, 'Cebolla', 'extra', 500, true FROM products WHERE category = 'perros';

INSERT INTO product_options (product_id, name, option_group, price_modifier, is_default)
SELECT id, 'Papitas', 'extra', 800, false FROM products WHERE category = 'perros';

INSERT INTO product_options (product_id, name, option_group, price_modifier, is_default)
SELECT id, 'Salsas', 'extra', 200, true FROM products WHERE category = 'perros';

INSERT INTO product_options (product_id, name, option_group, price_modifier, is_default)
SELECT id, 'Tocineta', 'extra', 1200, false FROM products WHERE category = 'perros';

-- ============================================
-- SUMMARY OF PRICES (COP)
-- ============================================
-- Base prices:
--   Arepa: $2,000
--   Perro: $6,000
--   Hamburguesa: $20,000
--   Chorizo: $5,000
--   Pincho: $6,000
--
-- Default combos:
--   Arepa con Queso: $3,500
--   Arepa con Carne: $12,500
--   Perro Sencillo: $6,700 (cebolla $500 + salsas $200)
--   Hamburguesa Sencilla: $21,100 (queso $500 + tomate $300 + lechuga $300)
--   Chorizo con Arepa: $7,000 (arepa $2,000)
--   Pincho de Pollo: $6,000
