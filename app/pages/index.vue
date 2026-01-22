<script setup lang="ts">
import { toast } from 'vue-sonner'
import { useCartStore } from '~/features/cart/store/cart.store'
import IngredientCounter from '~/features/home/components/IngredientCounter.vue'

useHead({
  title: 'HEat - Sabor Paisa'
})

const cartStore = useCartStore()

// Categories with products
const categories = [
  { id: 'arepas', name: 'Arepas', icon: '🫓', emoji: '🫓' },
  { id: 'perros', name: 'Perros', icon: '🌭', emoji: '🌭' },
  { id: 'hamburguesas', name: 'Hamburguesas', icon: '🍔', emoji: '🍔' },
  { id: 'chorizos', name: 'Chorizos', icon: '🌭', emoji: '🥓' },
  { id: 'pinchos', name: 'Pinchos', icon: '🍢', emoji: '🍢' }
]

const currentCategoryIndex = ref(0)
const currentCategory = computed(() => categories[currentCategoryIndex.value])

// Navigate categories
const prevCategory = () => {
  currentCategoryIndex.value = currentCategoryIndex.value === 0 
    ? categories.length - 1 
    : currentCategoryIndex.value - 1
  resetIngredients()
}

const nextCategory = () => {
  currentCategoryIndex.value = currentCategoryIndex.value === categories.length - 1 
    ? 0 
    : currentCategoryIndex.value + 1
  resetIngredients()
}

// Ingredients configuration per category
const ingredientConfig: Record<string, { proteins: any[], extras: any[] }> = {
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

// Current ingredient counts
const ingredientCounts = ref<Record<string, number>>({})

// Initialize with defaults
const resetIngredients = () => {
  const config = ingredientConfig[currentCategory.value?.id || 'arepas']
  const counts: Record<string, number> = {}
  
  config?.proteins.forEach(p => { counts[p.id] = p.default })
  config?.extras.forEach(e => { counts[e.id] = e.default })
  
  ingredientCounts.value = counts
}

// Initialize on mount
onMounted(() => {
  resetIngredients()
})

// Current config
const currentConfig = computed(() => ingredientConfig[currentCategory.value?.id || 'arepas'])

// Base prices per category
const basePrices: Record<string, number> = {
  arepas: 3000,
  perros: 5000,
  hamburguesas: 8000,
  chorizos: 6000,
  pinchos: 7000
}

// Calculate total price
const totalPrice = computed(() => {
  const base = basePrices[currentCategory.value?.id || 'arepas'] || 0
  let extras = 0
  
  const config = currentConfig.value
  if (config) {
    config.proteins.forEach(p => {
      const count = ingredientCounts.value[p.id] || 0
      if (count > 0) extras += p.price * count
    })
    config.extras.forEach(e => {
      const count = ingredientCounts.value[e.id] || 0
      if (count > 0) extras += e.price * count
    })
  }
  
  return base + extras
})

const formattedPrice = computed(() => {
  return new Intl.NumberFormat('es-CO', {
    style: 'currency',
    currency: 'COP',
    minimumFractionDigits: 0
  }).format(totalPrice.value)
})

// Generate product name from selected ingredients
const productName = computed(() => {
  const cat = currentCategory.value?.name || 'Producto'
  const selected: string[] = []
  
  const config = currentConfig.value
  if (config) {
    config.proteins.forEach(p => {
      const count = ingredientCounts.value[p.id] || 0
      if (count === 1) selected.push(p.name)
      else if (count === 2) selected.push(`Doble ${p.name}`)
      else if (count >= 3) selected.push(`Triple ${p.name}`)
    })
  }
  
  if (selected.length === 0) return cat
  if (selected.length === 1) return `${cat} ${selected[0]}`
  return `${cat} ${selected.slice(0, 2).join(' y ')}`
})

// Add to cart
const addToCart = () => {
  const options = []
  const config = currentConfig.value
  
  if (config) {
    for (const p of config.proteins) {
      const count = ingredientCounts.value[p.id] || 0
      if (count > 0) {
        options.push({ id: p.id, name: p.name, priceModifier: p.price, quantity: count })
      }
    }
    for (const e of config.extras) {
      const count = ingredientCounts.value[e.id] || 0
      if (count > 0) {
        options.push({ id: e.id, name: e.name, priceModifier: e.price, quantity: count })
      }
    }
  }
  
  cartStore.addItem({
    productId: `${currentCategory.value?.id}-${Date.now()}`,
    productName: productName.value,
    basePrice: basePrices[currentCategory.value?.id || 'arepas'] || 0,
    selectedOptions: options,
    category: currentCategory.value?.id
  })
  
  toast.success('¡Agregado al carrito!', {
    description: productName.value
  })
}

// Scroll to configurator
const configuratorRef = ref<HTMLElement>()
const scrollToConfigurator = () => {
  configuratorRef.value?.scrollIntoView({ behavior: 'smooth' })
}

// Preset products for quick add
const presetProducts = computed(() => {
  const presets: Record<string, any[]> = {
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
  return presets[currentCategory.value?.id || 'arepas'] || []
})

// Quick add preset
const quickAddPreset = (preset: any) => {
  // Calculate price
  let price = basePrices[currentCategory.value?.id || 'arepas'] || 0
  const options: any[] = []
  const config = currentConfig.value
  
  if (config) {
    Object.entries(preset.config).forEach(([id, count]) => {
      const protein = config.proteins.find(p => p.id === id)
      const extra = config.extras.find(e => e.id === id)
      const item = protein || extra
      if (item && typeof count === 'number' && count > 0) {
        price += item.price * count
        options.push({ id, name: item.name, priceModifier: item.price, quantity: count })
      }
    })
  }
  
  cartStore.addItem({
    productId: `${currentCategory.value?.id}-preset-${Date.now()}`,
    productName: preset.name,
    basePrice: price,
    selectedOptions: options,
    category: currentCategory.value?.id
  })
  
  toast.success('¡Agregado al carrito!', {
    description: preset.name
  })
}
</script>

<template>
  <div class="space-y-8">
    <!-- Toast Container -->
    <ClientOnly>
      <Toaster position="top-right" :toastOptions="{ style: { background: '#FFFEFA', border: '1px solid #E0E0E0' } }" />
    </ClientOnly>
    
    <!-- Hero Section - Estilo Lovable -->
    <section class="relative overflow-hidden rounded-gummy-xl bg-heat-white p-8 lg:p-12 border border-heat-gray-medium/30">
      <!-- Floating food icons -->
      <div class="absolute top-8 right-[40%] text-9xl animate-float" style="animation-delay: 0s">🍔</div>
      <div class="absolute top-16 right-[25%] text-6xl animate-float" style="animation-delay: 0.5s">🥓</div>
      <div class="absolute top-50 right-[15%] text-9xl animate-float" style="animation-delay: 1s">🫓</div>
      <div class="absolute bottom-20 right-[24%] text-7xl animate-float" style="animation-delay: 1.5s">🍢</div>
      <div class="absolute bottom-8 right-[40%] text-8xl animate-float" style="animation-delay: 0.3s">🌭</div>
      
      <div class="relative z-10 max-w-xl">
        <!-- Badge -->
        <div class="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-heat-orange/10 text-heat-orange text-sm font-semibold mb-6">
          <span class="text-lg">✨</span>
          ¡Nuevos productos disponibles!
        </div>
        
        <!-- Title -->
        <h1 class="text-4xl lg:text-5xl font-extrabold text-heat-black mb-2 leading-tight">
          El auténtico sabor
        </h1>
        <h1 class="text-4xl lg:text-5xl font-extrabold text-heat-orange mb-6">
          Paisa
        </h1>
        
        <!-- Description -->
        <p class="text-heat-gray-dark text-lg mb-8 leading-relaxed">
          Arepas, perros y hamburguesas hechos con amor. 
          Personaliza tu pedido y recíbelo calentito en minutos.
        </p>
        
        <!-- Buttons -->
        <div class="flex flex-wrap gap-4 mb-8">
          <GummyButton variant="primary" size="lg" @click="scrollToConfigurator">
            Hacer Pedido
            <span class="ml-1">🍽️</span>
          </GummyButton>
          <GummyButton variant="outline" size="lg" @click="scrollToConfigurator">
            Ver Menú
          </GummyButton>
        </div>
        
        <!-- Info badges -->
        <div class="flex flex-wrap gap-6 text-sm text-heat-gray-dark">
          <div class="flex items-center gap-2">
            <span class="w-8 h-8 rounded-full bg-heat-cyan/10 flex items-center justify-center">
              <span class="i-lucide-clock text-heat-cyan" />
            </span>
            <span>15-30 min</span>
          </div>
          <div class="flex items-center gap-2">
            <span class="w-8 h-8 rounded-full bg-heat-orange/10 flex items-center justify-center">
              <span class="i-lucide-bike text-heat-orange" />
            </span>
            <span>Delivery disponible en sector!</span>
          </div>
        </div>
      </div>
    </section>
    
    <!-- Product Configurator -->
    <section ref="configuratorRef" class="scroll-mt-8">
      <h2 class="text-2xl font-bold text-heat-black mb-6">
        ¿Qué vas a pedir hoy?
      </h2>
      
      <!-- Category Carousel -->
      <div class="bg-heat-white rounded-gummy-xl border border-heat-gray-medium/30 p-6 lg:p-8">
        <!-- Category Navigation -->
        <div class="flex items-center justify-between mb-6">
          <button 
            class="w-12 h-12 rounded-full bg-heat-gray-soft flex items-center justify-center hover:bg-heat-orange/10 hover:text-heat-orange transition-all"
            @click="prevCategory"
          >
            <span class="i-lucide-chevron-left text-2xl" />
          </button>
          
          <div class="flex-1 text-center">
            <div class="flex items-center justify-center gap-3">
              <span class="text-4xl">{{ currentCategory?.emoji }}</span>
              <h3 class="text-2xl font-bold text-heat-black">{{ currentCategory?.name }}</h3>
            </div>
            <p class="text-sm text-heat-gray-dark mt-1">
              {{ currentCategoryIndex + 1 }} de {{ categories.length }}
            </p>
          </div>
          
          <button 
            class="w-12 h-12 rounded-full bg-heat-gray-soft flex items-center justify-center hover:bg-heat-orange/10 hover:text-heat-orange transition-all"
            @click="nextCategory"
          >
            <span class="i-lucide-chevron-right text-2xl" />
          </button>
        </div>
        
        <!-- Proteins (Top) -->
        <div class="mb-6">
          <h4 class="text-sm font-semibold text-heat-gray-dark mb-3 uppercase tracking-wide">Proteínas</h4>
          <div class="grid grid-cols-2 lg:grid-cols-4 gap-3">
            <IngredientCounter 
              v-for="protein in currentConfig?.proteins"
              :key="protein.id"
              :name="protein.name"
              :price="protein.price"
              :count="ingredientCounts[protein.id] || 0"
              :max="protein.max"
              @update:count="ingredientCounts[protein.id] = $event"
            />
          </div>
        </div>
        
        <!-- Preview & Price -->
        <div class="bg-gradient-to-br from-heat-gray-soft to-white rounded-gummy-lg p-8 mb-6 text-center relative overflow-hidden">
          <div class="absolute inset-0 opacity-10">
            <div class="absolute top-2 left-4 text-6xl">{{ currentCategory?.emoji }}</div>
            <div class="absolute bottom-2 right-4 text-6xl">{{ currentCategory?.emoji }}</div>
          </div>
          
          <div class="relative z-10">
            <span class="text-8xl block mb-4">{{ currentCategory?.emoji }}</span>
            <h4 class="text-xl font-bold text-heat-black mb-2">{{ productName }}</h4>
            <p class="text-3xl font-extrabold text-heat-orange">{{ formattedPrice }}</p>
          </div>
        </div>
        
        <!-- Extras (Bottom) -->
        <div class="mb-6">
          <h4 class="text-sm font-semibold text-heat-gray-dark mb-3 uppercase tracking-wide">Extras</h4>
          <div class="grid grid-cols-2 lg:grid-cols-4 gap-3">
            <IngredientCounter 
              v-for="extra in currentConfig?.extras"
              :key="extra.id"
              :name="extra.name"
              :price="extra.price"
              :count="ingredientCounts[extra.id] || 0"
              :max="extra.max"
              @update:count="ingredientCounts[extra.id] = $event"
            />
          </div>
        </div>
        
        <!-- Add to Cart Button -->
        <GummyButton variant="primary" size="lg" class="w-full" @click="addToCart">
          <span class="i-lucide-shopping-cart mr-2" />
          Agregar al Carrito - {{ formattedPrice }}
        </GummyButton>
      </div>
    </section>
    
    <!-- Quick Options / Presets -->
    <section>

      
      <div class="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4">
        <div 
          v-for="preset in presetProducts"
          :key="preset.name"
          class="relative bg-heat-white rounded-gummy-lg border border-heat-gray-medium/30 p-4 hover:shadow-gummy hover:-translate-y-1 transition-all cursor-pointer group"
          @click="quickAddPreset(preset)"
        >
          <!-- Popular badge -->
          <span 
            v-if="preset.popular"
            class="absolute -top-2 -right-2 px-2 py-1 bg-heat-cyan text-white text-xs font-bold rounded-full z-10"
          >
            Popular
          </span>
          
          <div class="text-center">
            <span class="text-4xl block mb-2">{{ currentCategory?.emoji }}</span>
            <h4 class="font-semibold text-heat-black text-sm group-hover:text-heat-orange transition-colors">
              {{ preset.name }}
            </h4>
          </div>
          
          <!-- Quick add indicator -->
          <div class="absolute bottom-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
            <span class="w-8 h-8 rounded-full bg-gradient-to-r from-heat-orange to-heat-orange-light flex items-center justify-center">
              <span class="i-lucide-plus text-white text-sm" />
            </span>
          </div>
        </div>
      </div>
    </section>
    
    <!-- CTA Section -->
    <section class="bg-heat-white rounded-gummy-xl border border-heat-gray-medium/30 text-center py-8 px-6">
      <h3 class="text-xl font-bold text-heat-black mb-2">
        ¿Primera vez por acá?
      </h3>
      <p class="text-heat-gray-dark mb-4">
        Regístrate y recibe ofertas exclusivas
      </p>
      <GummyButton variant="secondary" @click="navigateTo('/auth')">
        Crear Cuenta
      </GummyButton>
    </section>
  </div>
</template>
