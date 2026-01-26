// Menu configuration data
// This file contains all the static data for the product configurator
// Precios en COP basados en menú real

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
    { id: 'chorizos', name: 'Chorizos', emoji: '🥓' },
    { id: 'pinchos', name: 'Pinchos', emoji: '🍢' },
    { id: 'hamburguesas', name: 'Hamburguesas', emoji: '🍔' },
    { id: 'perros', name: 'Perros', emoji: '🌭' },
]

// Base prices per category (COP) - from real menu
export const basePrices: Record<string, number> = {
    arepas: 2000,        // Arepa sola $2,000
    perros: 6000,        // Perro sencillo $6,000
    hamburguesas: 20000, // Hamburguesa sencilla $20,000
    chorizos: 5000,      // Chorizo $5,000
    pinchos: 6000        // Pincho $6,000
}

// Ingredients configuration per category
// Prices deduced from menu:
// Queso: $1,500 (arepa $2,000 → con queso $3,500)
// Jamón: $1,500
// Carne: $10,500 (arepa con carne $12,500 - base $2,000)
// Pollo/Mixta: $9,000
// Chorizo paisa addon: $5,000
// Pincho addon: $6,000
export const ingredientConfig: Record<string, CategoryConfig> = {
    arepas: {
        proteins: [
            { id: 'queso', name: 'Queso', price: 1500, default: 0, max: 3 },
            { id: 'jamon', name: 'Jamón', price: 1500, default: 0, max: 3 },
            { id: 'carne', name: 'Carne', price: 10500, default: 0, max: 2 },
            { id: 'pollo', name: 'Pollo', price: 9000, default: 0, max: 2 },
            { id: 'torta-c', name: 'Torta Carne', price: 8000, default: 0, max: 2 },
            { id: 'chorizo-p', name: 'Chorizo Paisa', price: 5000, default: 0, max: 2 },
            { id: 'pincho-p', name: 'Pincho', price: 6000, default: 0, max: 2 },
        ],
        extras: [
            { id: 'huevo', name: 'Huevo Codorniz', price: 500, default: 0, max: 3 },
            { id: 'tocineta', name: 'Tocineta', price: 1200, default: 0, max: 2 },
            { id: 'papitas', name: 'Papitas', price: 1000, default: 0, max: 2 },
            { id: 'salsas', name: 'Salsas', price: 500, default: 0, max: 2 },
        ]
    },
    chorizos: {
        proteins: [
            { id: 'chorizo-paisa', name: 'Paisa', price: 0, default: 1, max: 10 },
            { id: 'chorizo-res', name: 'Res', price: 0, default: 0, max: 10 },
        ],
        extras: [
            { id: 'queso-ch', name: 'Queso', price: 1500, default: 0, max: 3 },
            { id: 'arepa-ch', name: 'Arepa', price: 2000, default: 1, max: 3 },
        ]
    },
    pinchos: {
        proteins: [
            { id: 'pollo-pi', name: 'Pollo', price: 0, default: 1, max: 5 },
        ],
        extras: [
            { id: 'arepa-pi', name: 'Arepa', price: 2000, default: 0, max: 2 },
            { id: 'papas-pi', name: 'Papas', price: 800, default: 0, max: 2 },
        ]
    },
    hamburguesas: {
        proteins: [
            { id: 'carne-h', name: 'Carne Extra', price: 4000, default: 0, max: 2 },
            { id: 'huevo-h', name: 'Huevo', price: 700, default: 0, max: 3 },
            { id: 'tocineta-h', name: 'Tocineta', price: 1200, default: 0, max: 2 }
        ],
        extras: [
            { id: 'queso-h', name: 'Queso', price: 500, default: 1, max: 3 },
            { id: 'jamon-h', name: 'Jamón', price: 600, default: 0, max: 2 },
            { id: 'papitas-h', name: 'Papitas', price: 800, default: 0, max: 2 },
            { id: 'tomate-h', name: 'Tomate', price: 300, default: 1, max: 2 },
            { id: 'lechuga-h', name: 'Lechuga', price: 300, default: 1, max: 2 }
        ]
    },
    perros: {
        proteins: [
            { id: 'salchicha', name: 'Salchicha Extra', price: 2000, default: 0, max: 2 },
            { id: 'chorizo-p', name: 'Chorizo Paisa', price: 3000, default: 0, max: 2 },
            { id: 'huevo-p', name: 'Huevo Codorniz', price: 700, default: 0, max: 4 },
            { id: 'queso-p', name: 'Queso', price: 500, default: 0, max: 3 },
            { id: 'jamon-p', name: 'Jamón', price: 600, default: 0, max: 3 }
        ],
        extras: [
            { id: 'cebolla', name: 'Cebolla', price: 500, default: 1, max: 2 },
            { id: 'papitas-p', name: 'Papitas', price: 800, default: 0, max: 2 },
            { id: 'salsas-p', name: 'Salsas', price: 200, default: 1, max: 3 },
            { id: 'tocineta-p', name: 'Tocineta', price: 1200, default: 0, max: 2 }
        ]
    },
}

// Preset products for quick ordering - based on real menu
export const presetProducts: Record<string, Preset[]> = {
    arepas: [
        { name: 'Arepa con Queso', config: { queso: 1 }, popular: true },
        { name: 'Arepa Doble Queso', config: { queso: 2 } },
        { name: 'Arepa Jamón y Queso', config: { queso: 1, jamon: 1 } },
        { name: 'Arepa con Carne', config: { carne: 1 } },
        { name: 'Arepa Carne y Queso', config: { carne: 1, queso: 1 }, popular: true },
        { name: 'Arepa Mixta', config: { pollo: 1 } },
        { name: 'Arepa con Todo', config: { jamon: 1, queso: 1, carne: 1, pollo: 1 }, popular: true },
        { name: 'Arepa con Chorizo', config: { 'chorizo-p': 1 } },
        { name: 'Arepa con Pincho', config: { 'pincho-p': 1 } },
        { name: 'Arepaburguer', config: { queso: 1, 'torta-c': 1 } },
    ],
    perros: [
        { name: 'Perro Sencillo', config: { cebolla: 1, 'salsas-p': 1 }, popular: true },
        { name: 'Super Perro', config: { 'queso-p': 2, 'jamon-p': 1, 'papitas-p': 1, cebolla: 1, 'salsas-p': 2 }, popular: true },
        { name: 'Choriperro', config: { 'chorizo-p': 1, cebolla: 1, 'salsas-p': 1 } },
    ],
    hamburguesas: [
        { name: 'Hamburguesa Sencilla', config: { 'queso-h': 1, 'tomate-h': 1, 'lechuga-h': 1 }, popular: true },
        { name: 'Super Hamburguesa', config: { 'carne-h': 1, 'queso-h': 2, 'tocineta-h': 1, 'huevo-h': 1 }, popular: true },
    ],
    chorizos: [
        { name: 'Chorizo con Arepa', config: { 'chorizo-paisa': 1, 'arepa-ch': 1 }, popular: true },
        { name: 'Chorizo con Queso', config: { 'chorizo-paisa': 1, 'queso-ch': 1, 'arepa-ch': 1 } },
    ],
    pinchos: [
        { name: 'Pincho de Pollo', config: { 'pollo-pi': 1 }, popular: true },
        { name: 'Pincho con Arepa', config: { 'pollo-pi': 1, 'arepa-pi': 1 } },
    ]
}
