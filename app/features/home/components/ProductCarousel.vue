<script setup lang="ts">
import ProductCard from './ProductCard.vue'
import type { Product } from '../types/product.types'

const props = defineProps<{
  categoryId: string
  categoryName: string
  categoryIcon: string
}>()

const emit = defineEmits<{
  customize: [product: Product]
}>()

// Mock products - will be replaced with Supabase data
const products = computed(() => {
  const mockProducts: Record<string, any[]> = {
    arepas: [
      { id: '1', name: 'Arepa Reina Pepiada', basePrice: 3.50, image: '🫓', popular: true },
      { id: '2', name: 'Arepa Rellena', basePrice: 4.00, image: '🫓' },
      { id: '3', name: 'Arepa Domino', basePrice: 3.00, image: '🫓' },
      { id: '4', name: 'Arepa Catira', basePrice: 3.50, image: '🫓' },
      { id: '5', name: 'Arepa Pabellón', basePrice: 4.50, image: '🫓', popular: true }
    ],
    perros: [
      { id: '6', name: 'Perro Tradicional', basePrice: 3.00, image: '🌭' },
      { id: '7', name: 'Perro con Todo', basePrice: 4.00, image: '🌭', popular: true },
      { id: '8', name: 'Perro Especial', basePrice: 4.50, image: '🌭' }
    ],
    hamburguesas: [
      { id: '9', name: 'Hamburguesa Clásica', basePrice: 4.00, image: '🍔' },
      { id: '10', name: 'Hamburguesa Doble', basePrice: 6.00, image: '🍔', popular: true },
      { id: '11', name: 'Hamburguesa Especial', basePrice: 5.50, image: '🍔' },
      { id: '12', name: 'Hamburguesa BBQ', basePrice: 5.50, image: '🍔' }
    ]
  }
  return mockProducts[props.categoryId] || []
})

const carouselRef = ref<HTMLElement>()

const scroll = (direction: 'left' | 'right') => {
  if (!carouselRef.value) return
  const scrollAmount = 300
  carouselRef.value.scrollBy({
    left: direction === 'left' ? -scrollAmount : scrollAmount,
    behavior: 'smooth'
  })
}
</script>

<template>
  <div class="relative">
    <!-- Header -->
    <div class="flex items-center justify-between mb-4">
      <h3 class="text-xl font-bold text-heat-black flex items-center gap-2">
        <span>{{ categoryIcon }}</span>
        {{ categoryName }}
      </h3>
      
      <!-- Navigation Arrows (Desktop) -->
      <div class="hidden lg:flex gap-2">
        <button 
          class="w-10 h-10 rounded-full bg-heat-white border border-heat-gray-medium/50 flex items-center justify-center hover:bg-heat-orange hover:text-white hover:border-heat-orange transition-all gummy-press"
          @click="scroll('left')"
          aria-label="Anterior"
        >
          <span class="i-lucide-chevron-left" />
        </button>
        <button 
          class="w-10 h-10 rounded-full bg-heat-white border border-heat-gray-medium/50 flex items-center justify-center hover:bg-heat-orange hover:text-white hover:border-heat-orange transition-all gummy-press"
          @click="scroll('right')"
          aria-label="Siguiente"
        >
          <span class="i-lucide-chevron-right" />
        </button>
      </div>
    </div>
    
    <!-- Carousel -->
    <div 
      ref="carouselRef"
      class="flex gap-4 overflow-x-auto pb-4 -mx-4 px-4 lg:mx-0 lg:px-0 snap-x snap-mandatory scroll-smooth"
    >
      <ProductCard 
        v-for="product in products"
        :key="product.id"
        :product="{ ...product, category: categoryId }"
        class="flex-shrink-0 snap-start"
        @customize="emit('customize', { ...product, category: categoryId })"
      />
    </div>
  </div>
</template>

<style scoped>
div::-webkit-scrollbar {
  height: 6px;
}

div::-webkit-scrollbar-track {
  background: transparent;
}

div::-webkit-scrollbar-thumb {
  background: var(--heat-gray-medium);
  border-radius: 3px;
}

div::-webkit-scrollbar-thumb:hover {
  background: var(--heat-orange);
}
</style>

