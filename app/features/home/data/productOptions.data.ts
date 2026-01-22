import type { ProductOption } from '../types/product.types'

export const OPTION_GROUPS: Record<string, string> = {
  proteina: 'Proteína',
  extra: 'Extras',
  topping: 'Toppings',
  salsa: 'Salsas',
  vegetal: 'Vegetales'
}

export const OPTIONS_BY_CATEGORY: Record<string, ProductOption[]> = {
  arepas: [
    { id: 'queso', name: 'Queso', group: 'proteina', priceModifier: 0.50, isDefault: true },
    { id: 'jamon', name: 'Jamón', group: 'proteina', priceModifier: 0.75, isDefault: false },
    { id: 'carne', name: 'Carne mechada', group: 'proteina', priceModifier: 1.50, isDefault: false },
    { id: 'pollo', name: 'Pollo', group: 'proteina', priceModifier: 1.25, isDefault: false },
    { id: 'chorizo', name: 'Chorizo', group: 'extra', priceModifier: 1.00, isDefault: false },
    { id: 'aguacate', name: 'Aguacate', group: 'extra', priceModifier: 0.75, isDefault: false }
  ],
  perros: [
    { id: 'cebolla', name: 'Cebolla', group: 'topping', priceModifier: 0, isDefault: true },
    { id: 'papitas', name: 'Papitas', group: 'topping', priceModifier: 0.50, isDefault: false },
    { id: 'jamon-p', name: 'Jamón', group: 'topping', priceModifier: 0.50, isDefault: false },
    { id: 'salsa-tomate', name: 'Con salsas', group: 'salsa', priceModifier: 0, isDefault: true },
    { id: 'mostaza', name: 'Mostaza', group: 'salsa', priceModifier: 0, isDefault: false },
    { id: 'mayonesa', name: 'Mayonesa', group: 'salsa', priceModifier: 0, isDefault: false }
  ],
  hamburguesas: [
    // { id: 'lechuga', name: 'Lechuga', group: 'vegetal', priceModifier: 0, isDefault: true },
    { id: 'tomate', name: 'Tomate', group: 'vegetal', priceModifier: 0, isDefault: true },
    { id: 'cebolla-h', name: 'Cebolla', group: 'vegetal', priceModifier: 0, isDefault: false },
    { id: 'queso-h', name: 'Queso', group: 'extra', priceModifier: 0.50, isDefault: true },
    { id: 'huevo', name: 'Huevo', group: 'extra', priceModifier: 0.75, isDefault: false },
    { id: 'codorniz', name: 'Huevos de codorniz', group: 'extra', priceModifier: 1.00, isDefault: false },
    { id: 'papitas-h', name: 'Papitas', group: 'extra', priceModifier: 0.50, isDefault: false },
    { id: 'tocineta', name: 'Tocineta', group: 'extra', priceModifier: 1.25, isDefault: false }
  ]
}

export function getProductCategory(product: { category?: string, name?: string }): string {
  if (product.category) return product.category
  
  const name = product.name?.toLowerCase() || ''
  if (name.includes('arepa')) return 'arepas'
  if (name.includes('perro')) return 'perros'
  return 'hamburguesas'
}

