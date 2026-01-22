// Menu configuration data
// This file contains all the static data for the product configurator

export interface Ingredient {
  id: string
  name: string
  price: number
  default: number
  max: number
}

export interface CategoryConfig {
  proteins: Ingredient[]
  extras: Ingredient[]
}

export interface Category {
  id: string
  name: string
  emoji: string
}

export interface Preset {
  name: string
  config: Record<string, number>
  popular?: boolean
}

// Available product categories
export const categories: Category[] = [
  { id: 'arepas', name: 'Arepas', emoji: '🫓' },
  { id: 'perros', name: 'Perros', emoji: '🌭' },
  { id: 'hamburguesas', name: 'Hamburguesas', emoji: '🍔' },
  { id: 'chorizos', name: 'Chorizos', emoji: '🥓' },
  { id: 'pinchos', name: 'Pinchos', emoji: '🍢' }
]

// Base prices per category (COP)
export const basePrices: Record<string, number> = {
  arepas: 3000,
  perros: 5000,
  hamburguesas: 8000,
  chorizos: 6000,
  pinchos: 7000
}

// Ingredients configuration per category
export const ingredientConfig: Record<string, CategoryConfig> = {
  arepas: {
    proteins: [
      { id: 'queso', name: 'Queso', price: 500, default: 1, max: 3 },
      { id: 'jamon', name: 'Jamón', price: 800, default: 0, max: 3 },
      { id: 'carne', name: 'Carne', price: 1500, default: 0, max: 2 },
      { id: 'pollo', name: 'Pollo', price: 1200, default: 0, max: 2 },
      { id: 'chorizo-p', name: 'Chorizo Paisa', price: 1200, default: 0, max: 2 },
      { id: 'chorizo-r', name: 'Chorizo Res', price: 1200, default: 0, max: 2 }
    ],
    extras: [
      { id: 'aguacate', name: 'Aguacate', price: 1000, default: 0, max: 2 },
      { id: 'huevo', name: 'Huevo', price: 500, default: 0, max: 2 },
      { id: 'tocineta', name: 'Tocineta', price: 1200, default: 0, max: 2 },
      { id: 'maiz', name: 'Maíz', price: 300, default: 0, max: 2 }
    ]
  },
  perros: {
    proteins: [
      { id: 'salchicha', name: 'Salchicha', price: 0, default: 1, max: 2 },
      { id: 'queso-p', name: 'Queso', price: 500, default: 0, max: 3 },
      { id: 'jamon-p', name: 'Jamón', price: 600, default: 0, max: 2 }
    ],
    extras: [
      { id: 'cebolla', name: 'Cebolla', price: 0, default: 1, max: 2 },
      { id: 'papitas', name: 'Papitas', price: 800, default: 0, max: 2 },
      { id: 'salsas', name: 'Salsas', price: 0, default: 1, max: 3 },
      { id: 'repollo', name: 'Repollo', price: 0, default: 0, max: 2 }
    ]
  },
  hamburguesas: {
    proteins: [
      { id: 'carne-h', name: 'Carne', price: 0, default: 1, max: 3 },
      { id: 'queso-h', name: 'Queso', price: 500, default: 1, max: 3 },
      { id: 'tocineta-h', name: 'Tocineta', price: 1200, default: 0, max: 2 }
    ],
    extras: [
      { id: 'lechuga', name: 'Lechuga', price: 0, default: 1, max: 2 },
      { id: 'tomate', name: 'Tomate', price: 0, default: 1, max: 2 },
      { id: 'huevo-h', name: 'Huevo', price: 700, default: 0, max: 2 },
      { id: 'papitas-h', name: 'Papitas', price: 800, default: 0, max: 2 }
    ]
  },
  chorizos: {
    proteins: [
      { id: 'chorizo', name: 'Chorizo', price: 0, default: 1, max: 3 },
      { id: 'queso-ch', name: 'Queso', price: 500, default: 0, max: 2 }
    ],
    extras: [
      { id: 'arepa-ch', name: 'Arepa', price: 500, default: 1, max: 2 },
      { id: 'papas-ch', name: 'Papas', price: 800, default: 0, max: 2 },
      { id: 'guacamole', name: 'Guacamole', price: 1000, default: 0, max: 2 }
    ]
  },
  pinchos: {
    proteins: [
      { id: 'pollo-pi', name: 'Pollo', price: 0, default: 1, max: 3 },
      { id: 'res-pi', name: 'Res', price: 500, default: 0, max: 3 },
      { id: 'cerdo-pi', name: 'Cerdo', price: 300, default: 0, max: 3 }
    ],
    extras: [
      { id: 'arepa-pi', name: 'Arepa', price: 500, default: 1, max: 2 },
      { id: 'papas-pi', name: 'Papas', price: 800, default: 0, max: 2 },
      { id: 'ensalada', name: 'Ensalada', price: 500, default: 0, max: 2 }
    ]
  }
}

// Preset products for quick ordering
export const presetProducts: Record<string, Preset[]> = {
  arepas: [
    { name: 'Arepa Doble Queso', config: { queso: 2 }, popular: true },
    { name: 'Arepa Jamón y Queso', config: { queso: 1, jamon: 1 } },
    { name: 'Arepa con Carne', config: { carne: 1, queso: 1 } },
    { name: 'Arepa Triple Queso', config: { queso: 3 }, popular: true },
    { name: 'Arepa Mixta', config: { queso: 1, jamon: 1, huevo: 1 } }
  ],
  perros: [
    { name: 'Perro Sencillo', config: { salchicha: 1, cebolla: 1, salsas: 1 } },
    { name: 'Perro con Todo', config: { salchicha: 1, 'queso-p': 1, papitas: 1, cebolla: 1, salsas: 2 }, popular: true },
    { name: 'Perro Doble', config: { salchicha: 2, 'queso-p': 1 } }
  ],
  hamburguesas: [
    { name: 'Hamburguesa Simple', config: { 'carne-h': 1, 'queso-h': 1, lechuga: 1, tomate: 1 } },
    { name: 'Hamburguesa Doble Carne', config: { 'carne-h': 2, 'queso-h': 2 }, popular: true },
    { name: 'Hamburguesa con Huevo', config: { 'carne-h': 1, 'queso-h': 1, 'huevo-h': 1 } },
    { name: 'Hamburguesa Completa', config: { 'carne-h': 1, 'queso-h': 1, 'tocineta-h': 1, lechuga: 1, tomate: 1 }, popular: true }
  ],
  chorizos: [
    { name: 'Chorizo Sencillo', config: { chorizo: 1, 'arepa-ch': 1 } },
    { name: 'Chorizo con Queso', config: { chorizo: 1, 'queso-ch': 1, 'arepa-ch': 1 }, popular: true }
  ],
  pinchos: [
    { name: 'Pincho de Pollo', config: { 'pollo-pi': 2, 'arepa-pi': 1 } },
    { name: 'Pincho Mixto', config: { 'pollo-pi': 1, 'res-pi': 1, 'cerdo-pi': 1 }, popular: true }
  ]
}

