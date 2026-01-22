-- Seed Products for HEat
-- Run this after 001_initial_schema.sql

-- ============================================
-- AREPAS
-- ============================================
INSERT INTO products (name, category, base_price, description, popular) VALUES
  ('Arepa Reina Pepiada', 'arepas', 3.50, 'Pollo, aguacate y mayonesa', true),
  ('Arepa Rellena', 'arepas', 4.00, 'Carne mechada con queso amarillo', false),
  ('Arepa Domino', 'arepas', 3.00, 'Caraotas negras con queso blanco', false),
  ('Arepa Catira', 'arepas', 3.50, 'Pollo con queso amarillo', false),
  ('Arepa Pabellón', 'arepas', 4.50, 'Carne mechada, caraotas, plátano y queso', true),
  ('Arepa Sifrina', 'arepas', 4.00, 'Pollo, aguacate, queso y mayonesa', false),
  ('Arepa Llanera', 'arepas', 5.00, 'Carne de res, tomate, aguacate', false);

-- Arepas options
INSERT INTO product_options (product_id, name, option_group, price_modifier, is_default) 
SELECT id, 'Queso blanco', 'proteina', 0.50, true FROM products WHERE category = 'arepas';

INSERT INTO product_options (product_id, name, option_group, price_modifier, is_default) 
SELECT id, 'Queso amarillo', 'proteina', 0.75, false FROM products WHERE category = 'arepas';

INSERT INTO product_options (product_id, name, option_group, price_modifier, is_default) 
SELECT id, 'Jamón', 'proteina', 0.75, false FROM products WHERE category = 'arepas';

INSERT INTO product_options (product_id, name, option_group, price_modifier, is_default) 
SELECT id, 'Carne mechada', 'proteina', 1.50, false FROM products WHERE category = 'arepas';

INSERT INTO product_options (product_id, name, option_group, price_modifier, is_default) 
SELECT id, 'Pollo', 'proteina', 1.25, false FROM products WHERE category = 'arepas';

INSERT INTO product_options (product_id, name, option_group, price_modifier, is_default) 
SELECT id, 'Chorizo', 'extra', 1.00, false FROM products WHERE category = 'arepas';

INSERT INTO product_options (product_id, name, option_group, price_modifier, is_default) 
SELECT id, 'Aguacate', 'extra', 0.75, false FROM products WHERE category = 'arepas';

INSERT INTO product_options (product_id, name, option_group, price_modifier, is_default) 
SELECT id, 'Huevo frito', 'extra', 0.50, false FROM products WHERE category = 'arepas';

-- ============================================
-- PERROS CALIENTES
-- ============================================
INSERT INTO products (name, category, base_price, description, popular) VALUES
  ('Perro Tradicional', 'perros', 3.00, 'Salchicha con salsas', false),
  ('Perro con Todo', 'perros', 4.00, 'Salchicha con todos los toppings', true),
  ('Perro Especial', 'perros', 4.50, 'Doble salchicha con queso', false),
  ('Perro Americano', 'perros', 3.50, 'Estilo americano clásico', false);

-- Perros options
INSERT INTO product_options (product_id, name, option_group, price_modifier, is_default) 
SELECT id, 'Cebolla', 'topping', 0, true FROM products WHERE category = 'perros';

INSERT INTO product_options (product_id, name, option_group, price_modifier, is_default) 
SELECT id, 'Papitas', 'topping', 0.50, false FROM products WHERE category = 'perros';

INSERT INTO product_options (product_id, name, option_group, price_modifier, is_default) 
SELECT id, 'Jamón picado', 'topping', 0.50, false FROM products WHERE category = 'perros';

INSERT INTO product_options (product_id, name, option_group, price_modifier, is_default) 
SELECT id, 'Queso rallado', 'topping', 0.50, false FROM products WHERE category = 'perros';

INSERT INTO product_options (product_id, name, option_group, price_modifier, is_default) 
SELECT id, 'Repollo', 'topping', 0, false FROM products WHERE category = 'perros';

INSERT INTO product_options (product_id, name, option_group, price_modifier, is_default) 
SELECT id, 'Salsa de tomate', 'salsa', 0, true FROM products WHERE category = 'perros';

INSERT INTO product_options (product_id, name, option_group, price_modifier, is_default) 
SELECT id, 'Mostaza', 'salsa', 0, false FROM products WHERE category = 'perros';

INSERT INTO product_options (product_id, name, option_group, price_modifier, is_default) 
SELECT id, 'Mayonesa', 'salsa', 0, false FROM products WHERE category = 'perros';

INSERT INTO product_options (product_id, name, option_group, price_modifier, is_default) 
SELECT id, 'Salsa de ajo', 'salsa', 0.25, false FROM products WHERE category = 'perros';

-- ============================================
-- HAMBURGUESAS
-- ============================================
INSERT INTO products (name, category, base_price, description, popular) VALUES
  ('Hamburguesa Clásica', 'hamburguesas', 4.00, 'Carne 150g con vegetales', false),
  ('Hamburguesa Doble', 'hamburguesas', 6.00, 'Doble carne con queso', true),
  ('Hamburguesa Especial', 'hamburguesas', 5.50, 'Con tocineta y huevo', false),
  ('Hamburguesa BBQ', 'hamburguesas', 5.50, 'Salsa BBQ y aros de cebolla', false),
  ('Hamburguesa Criolla', 'hamburguesas', 5.00, 'Con aguacate y plátano', false);

-- Hamburguesas options
INSERT INTO product_options (product_id, name, option_group, price_modifier, is_default) 
SELECT id, 'Lechuga', 'vegetal', 0, true FROM products WHERE category = 'hamburguesas';

INSERT INTO product_options (product_id, name, option_group, price_modifier, is_default) 
SELECT id, 'Tomate', 'vegetal', 0, true FROM products WHERE category = 'hamburguesas';

INSERT INTO product_options (product_id, name, option_group, price_modifier, is_default) 
SELECT id, 'Cebolla', 'vegetal', 0, false FROM products WHERE category = 'hamburguesas';

INSERT INTO product_options (product_id, name, option_group, price_modifier, is_default) 
SELECT id, 'Pepinillos', 'vegetal', 0, false FROM products WHERE category = 'hamburguesas';

INSERT INTO product_options (product_id, name, option_group, price_modifier, is_default) 
SELECT id, 'Queso americano', 'extra', 0.50, true FROM products WHERE category = 'hamburguesas';

INSERT INTO product_options (product_id, name, option_group, price_modifier, is_default) 
SELECT id, 'Queso cheddar', 'extra', 0.75, false FROM products WHERE category = 'hamburguesas';

INSERT INTO product_options (product_id, name, option_group, price_modifier, is_default) 
SELECT id, 'Huevo frito', 'extra', 0.75, false FROM products WHERE category = 'hamburguesas';

INSERT INTO product_options (product_id, name, option_group, price_modifier, is_default) 
SELECT id, 'Huevos de codorniz', 'extra', 1.00, false FROM products WHERE category = 'hamburguesas';

INSERT INTO product_options (product_id, name, option_group, price_modifier, is_default) 
SELECT id, 'Papitas', 'extra', 0.50, false FROM products WHERE category = 'hamburguesas';

INSERT INTO product_options (product_id, name, option_group, price_modifier, is_default) 
SELECT id, 'Tocineta', 'extra', 1.25, false FROM products WHERE category = 'hamburguesas';

INSERT INTO product_options (product_id, name, option_group, price_modifier, is_default) 
SELECT id, 'Aguacate', 'extra', 0.75, false FROM products WHERE category = 'hamburguesas';

INSERT INTO product_options (product_id, name, option_group, price_modifier, is_default) 
SELECT id, 'Carne extra', 'extra', 2.00, false FROM products WHERE category = 'hamburguesas';

