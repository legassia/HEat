<script setup lang="ts">
import type { Product } from '../types/product.types'

const props = defineProps<{
  product: Product
}>()

const emit = defineEmits<{
  customize: []
}>()

const formattedPrice = computed(() => {
  return new Intl.NumberFormat('es-VE', {
    style: 'currency',
    currency: 'COP'
  }).format(props.product.basePrice)
})
</script>

<template>
  <div 
    class="card-gummy w-[200px] lg:w-[220px] gummy-3d hover:shadow-gummy hover:-translate-y-2 transition-all duration-300 cursor-pointer group"
    @click="emit('customize')"
  >
    <!-- Popular Badge -->
    <div 
      v-if="product.popular"
      class="absolute -top-2 -right-2 z-10"
    >
      <span class="px-3 py-1 bg-heat-cyan text-white text-xs font-bold rounded-full shadow-gummy-cyan">
        Popular
      </span>
    </div>
    
    <!-- Image -->
    <div class="relative h-32 rounded-gummy-sm bg-heat-gray-soft mb-3 overflow-hidden flex items-center justify-center">
      <!-- Placeholder emoji - will be replaced with actual images -->
      <span class="text-6xl group-hover:scale-110 transition-transform duration-300">
        {{ product.image }}
      </span>
      
      <!-- Overlay on hover -->
      <div class="absolute inset-0 bg-heat-orange/0 group-hover:bg-heat-orange/10 transition-colors rounded-gummy-sm" />
    </div>
    
    <!-- Info -->
    <div>
      <h4 class="font-bold text-heat-black line-clamp-2 mb-2 group-hover:text-heat-orange transition-colors">
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
          class="w-10 h-10 rounded-full gradient-orange flex items-center justify-center shadow-gummy hover:shadow-gummy-hover gummy-press"
          @click.stop="emit('customize')"
          aria-label="Personalizar"
        >
          <span class="i-lucide-plus text-white text-lg" />
        </button>
      </div>
    </div>
  </div>
</template>

