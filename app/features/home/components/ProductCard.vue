<script setup lang="ts">
import { toast } from 'vue-sonner'
import { useCartStore } from '~/features/cart/store/cart.store'
import type { Product } from '../types/product.types'

const props = defineProps<{
  product: Product
}>()

const cartStore = useCartStore()

const formattedPrice = computed(() => {
  return new Intl.NumberFormat('es-CO', {
    style: 'currency',
    currency: 'COP',
    minimumFractionDigits: 0
  }).format(props.product.basePrice)
})

// Add directly to cart
const addToCart = () => {
  cartStore.addItem({
    productId: props.product.id,
    productName: props.product.name,
    basePrice: props.product.basePrice,
    selectedOptions: [],
    category: props.product.category
  })
  
  toast.success('¡Agregado al carrito!', {
    description: props.product.name
  })
}
</script>

<template>
  <div 
    class="relative bg-heat-white rounded-gummy-lg border border-heat-gray-medium/30 p-4 hover:shadow-gummy hover:-translate-y-2 transition-all duration-300 cursor-pointer group"
    @click="addToCart"
  >
    <!-- Popular Badge - Fixed positioning -->
    <span 
      v-if="product.popular"
      class="absolute -top-2 -right-2 px-3 py-1 bg-heat-cyan text-white text-xs font-bold rounded-full shadow-gummy-cyan z-20 pointer-events-none"
    >
      Popular
    </span>
    
    <!-- Image -->
    <div class="relative h-28 rounded-gummy-sm bg-heat-gray-soft mb-3 flex items-center justify-center overflow-hidden">
      <span class="text-5xl group-hover:scale-110 transition-transform duration-300">
        {{ product.image }}
      </span>
    </div>
    
    <!-- Info -->
    <div>
      <h4 class="font-bold text-heat-black text-sm line-clamp-2 mb-2 group-hover:text-heat-orange transition-colors">
        {{ product.name }}
      </h4>
      
      <div class="flex items-center justify-between">
        <div>
          <span class="text-xs text-heat-gray-dark">Desde</span>
          <p class="text-lg font-extrabold text-heat-orange">
            {{ formattedPrice }}
          </p>
        </div>
        
        <!-- Quick Add Button -->
        <button 
          class="w-10 h-10 rounded-full bg-gradient-to-r from-heat-orange to-heat-orange-light flex items-center justify-center shadow-gummy hover:shadow-gummy-hover transition-all hover:scale-110 active:scale-95"
          @click.stop="addToCart"
          aria-label="Agregar al carrito"
        >
          <span class="i-lucide-plus text-white text-lg" />
        </button>
      </div>
    </div>
  </div>
</template>
