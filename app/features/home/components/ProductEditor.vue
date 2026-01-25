<script setup lang="ts">
import type { Category, CategoryConfig } from '../data/menu.config'
import IngredientCounter from './IngredientCounter.vue'

const props = defineProps<{
  category: Category | undefined
  categoryIndex: number
  totalCategories: number
  config: CategoryConfig | undefined
  ingredientCounts: Record<string, number>
  productName: string
  formattedPrice: string
  selectedIngredients: Array<{ id: string; name: string; count: number; price: number }>
}>()

const emit = defineEmits<{
  prevCategory: []
  nextCategory: []
  updateIngredient: [id: string, count: number]
  addToCart: []
}>()

// Emoji mapping for ingredients
const ingredientEmojis: Record<string, string> = {
  // Proteins
  queso: '🧀',
  jamon: '🥓',
  carne: '🥩',
  pollo: '🍗',
  'chorizo-p': '🌭',
  'chorizo-r': '🌭',
  salchicha: '🌭',
  'queso-p': '🧀',
  'jamon-p': '🥓',
  'carne-h': '🍖',
  'queso-h': '🧀',
  'tocineta-h': '🥓',
  chorizo: '🌭',
  'queso-ch': '🧀',
  'pollo-pi': '🍗',
  'res-pi': '🥩',
  'cerdo-pi': '🐷',
  'pincho-p': '🍢',
  'torta-c': '🥩',
  // Extras
  mantequilla: '🧈',
  sal: '🧂',
  aguacate: '🥑',
  huevo: '🥚',
  tocineta: '🥓',
  maiz: '🌽',
  cebolla: '🧅',
  papitas: '🍟',
  salsas: '🥫',
  lechuga: '🥬',
  tomate: '🍅',
  'huevo-h': '🍳',
  'papitas-h': '🍟',
  'arepa-ch': '🫓',
  'papas-ch': '🍟',
  guacamole: '🥑',
  'arepa-pi': '🫓',
  'papas-pi': '🍟',
  ensalada: '🥗',
  crudo: '☁️'
}

// Get emoji for ingredient
const getIngredientEmoji = (id: string): string => {
  return ingredientEmojis[id] || '🔸'
}

// Format ingredient badge text
const formatBadge = (ingredient: { name: string; count: number }) => {
  if (ingredient.count === 1) return ingredient.name
  if (ingredient.count === 2) return `2x ${ingredient.name}`
  return `${ingredient.count}x ${ingredient.name}`
}

// Responsive radius for mobile vs desktop
const isMobile = ref(false)

onMounted(() => {
  const checkMobile = () => {
    isMobile.value = window.innerWidth < 1024
  }
  checkMobile()
  window.addEventListener('resize', checkMobile)
  onUnmounted(() => window.removeEventListener('resize', checkMobile))
})

// Position emojis in a circle around the product
const getEmojiPosition = (index: number, total: number) => {
  // Distribute emojis in a tighter circle
  const angle = (index / Math.max(total, 1)) * 2 * Math.PI - Math.PI / 2
  // Mobile: 40px, Desktop: 75px
  const radius = isMobile.value ? 40 : 75
  const x = 2 * Math.cos(angle) * radius - 10
  const y = Math.sin(angle) * radius - (isMobile.value ? 18 : 24)
  return {
    transform: `translate(${x}px, ${y}px)`
  }
}
</script>

<template>
  <section class="scroll-mt-8">
    <h2 class="text-2xl font-bold text-heat-black mb-6">
      ¿Qué vas a pedir hoy?
    </h2>
    
    <!-- Category Carousel -->
    <div class="bg-heat-white rounded-gummy-xl border border-heat-gray-medium/30 p-6 lg:p-8">
      <!-- Category Navigation -->
      <div class="flex items-center justify-between mb-6">
        <button 
          class="w-12 h-12 rounded-full border-2 border-heat-gray-medium/50 bg-white flex items-center justify-center hover:border-heat-orange hover:text-heat-orange transition-all"
          @click="emit('prevCategory')"
        >
          <span class="i-lucide-chevron-left text-2xl" />
        </button>
        
        <div class="flex-1 text-center">
          <div class="flex items-center justify-center gap-3">
            <span class="text-4xl">{{ category?.emoji }}</span>
            <h3 class="text-2xl font-bold text-heat-black">{{ category?.name }}</h3>
          </div>
          <p class="text-sm text-heat-gray-dark mt-1">
            {{ categoryIndex + 1 }} de {{ totalCategories }}
          </p>
        </div>
        
        <button 
          class="w-12 h-12 rounded-full border-2 border-heat-gray-medium/50 bg-white flex items-center justify-center hover:border-heat-orange hover:text-heat-orange transition-all"
          @click="emit('nextCategory')"
        >
          <span class="i-lucide-chevron-right text-2xl" />
        </button>
      </div>
      
      <!-- Proteins (Top) -->
      <div class="mb-6">
        <h4 class="text-sm font-semibold text-heat-gray-dark mb-3 uppercase tracking-wide">Proteínas</h4>
        <div class="grid grid-cols-2 lg:grid-cols-4 gap-3">
          <IngredientCounter 
            v-for="protein in config?.proteins"
            :key="protein.id"
            :name="protein.name"
            :price="protein.price"
            :count="ingredientCounts[protein.id] || 0"
            :max="protein.max"
            @update:count="emit('updateIngredient', protein.id, $event)"
          />
        </div>
      </div>
      
      <!-- Product Visualizer - Taller with centered product -->
      <div class="bg-gradient-to-br from-heat-gray-soft/80 to-white rounded-gummy-lg mb-6 relative overflow-hidden min-h-[280px] lg:min-h-[360px] flex flex-col">
        <!-- Product Name (Top) -->
        <div class="text-center pt-6 relative z-10">
          <h4 class="text-xl font-bold text-heat-black">{{ productName }}</h4>
        </div>
        
        <!-- Central Product with Floating Ingredient Emojis -->
        <div class="flex-1 flex items-center justify-center relative">
          <!-- Background decorations (very subtle) -->
          <div class="absolute inset-0 opacity-[0.03] pointer-events-none">
            <div class="absolute top-4 left-8 text-8xl">{{ category?.emoji }}</div>
            <div class="absolute bottom-4 right-8 text-8xl">{{ category?.emoji }}</div>
          </div>
          
          <!-- Center container for product + floating emojis -->
          <div class="relative">
            <!-- Main product emoji (centered) -->
            <div class="text-[80px] lg:text-[120px] leading-none select-none">
              {{ category?.emoji }}
            </div>
            
            <!-- Floating ingredient emojis around the product (above it with z-index) -->
            <div 
              v-for="(ingredient, idx) in selectedIngredients.slice(0, 8)"
              :key="ingredient.id"
              class="absolute text-xl lg:text-3xl transition-all duration-500 ease-out z-10"
              :style="{
                top: '50%',
                left: '50%',
                ...getEmojiPosition(idx, Math.min(selectedIngredients.length, 8))
              }"
            >
              <span 
                class="block drop-shadow-md" 
              >
                {{ getIngredientEmoji(ingredient.id) }}
              </span>
              <!-- Count badge if > 1 -->
              <span 
                v-if="ingredient.count > 1"
                class="absolute -bottom-1 -right-1 w-4 h-4 lg:w-5 lg:h-5 bg-heat-orange text-white text-[8px] lg:text-[10px] font-bold rounded-full flex items-center justify-center shadow-sm"
              >
                {{ ingredient.count }}
              </span>
            </div>
          </div>
        </div>
        
        <!-- Ingredient Tags (below product) -->
        <div v-if="selectedIngredients.length > 0" class="px-4 lg:px-6 pb-3">
          <div class="flex flex-wrap gap-1 lg:gap-2 justify-center">
            <span 
              v-for="ing in selectedIngredients"
              :key="ing.id"
              class="px-2 py-0.5 bg-heat-orange/10 text-heat-orange text-[10px] lg:text-xs rounded-full font-medium"
            >
              {{ formatBadge(ing) }}
            </span>
          </div>
        </div>
        
        <!-- Price (Bottom - Grayish color) -->
        <div class="text-center pb-6 relative z-10">
          <p class="text-xl lg:text-2xl font-bold text-heat-gray-dark/70">{{ formattedPrice }}</p>
        </div>
      </div>
      
      <!-- Extras (Bottom) -->
      <div class="mb-6">
        <h4 class="text-sm font-semibold text-heat-gray-dark mb-3 uppercase tracking-wide">Extras</h4>
        <div class="grid grid-cols-2 lg:grid-cols-4 gap-3">
          <IngredientCounter 
            v-for="extra in config?.extras"
            :key="extra.id"
            :name="extra.name"
            :price="extra.price"
            :count="ingredientCounts[extra.id] || 0"
            :max="extra.max"
            @update:count="emit('updateIngredient', extra.id, $event)"
          />
        </div>
      </div>
      
      <!-- Add to Cart Button -->
      <GummyButton variant="primary" size="lg" class="w-full" @click="emit('addToCart')">
        <span class="i-lucide-shopping-cart mr-2" />
        Agregar al Carrito
      </GummyButton>
    </div>
  </section>
</template>
