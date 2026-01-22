<script setup lang="ts">
import { useCartStore, type CartItem } from '../store/cart.store'

const props = defineProps<{
  item: CartItem
}>()

const cartStore = useCartStore()

const itemTotal = computed(() => {
  const optionsTotal = props.item.selectedOptions.reduce((sum, opt) => sum + opt.priceModifier, 0)
  return (props.item.basePrice + optionsTotal) * props.item.quantity
})

const formattedTotal = computed(() => {
  return new Intl.NumberFormat('es-VE', {
    style: 'currency',
    currency: 'COP'
  }).format(itemTotal.value)
})
</script>

<template>
  <div class="card-gummy flex gap-4 animate-slide-up">
    <!-- Image -->
    <div class="w-20 h-20 rounded-gummy-sm bg-heat-gray-soft overflow-hidden shrink-0">
      <img 
        v-if="item.imageUrl"
        :src="item.imageUrl"
        :alt="item.productName"
        class="w-full h-full object-cover"
      />
      <div v-else class="w-full h-full flex items-center justify-center">
        <span class="text-3xl">🍔</span>
      </div>
    </div>
    
    <!-- Info -->
    <div class="flex-1 min-w-0">
      <h4 class="font-bold text-heat-black truncate">{{ item.productName }}</h4>
      
      <!-- Selected Options -->
      <div v-if="item.selectedOptions.length > 0" class="mt-1">
        <p class="text-xs text-heat-gray-dark truncate">
          {{ item.selectedOptions.map(o => o.name).join(', ') }}
        </p>
      </div>
      
      <!-- Price & Quantity -->
      <div class="flex items-center justify-between mt-2">
        <span class="font-bold text-heat-orange">{{ formattedTotal }}</span>
        
        <!-- Quantity Controls -->
        <div class="flex items-center gap-2">
          <button 
            class="w-8 h-8 rounded-full bg-heat-gray-soft flex items-center justify-center hover:bg-heat-orange/10 transition-colors gummy-press"
            @click="cartStore.decrementQuantity(item.id)"
            aria-label="Reducir cantidad"
          >
            <span class="i-lucide-minus text-sm text-heat-gray-dark" />
          </button>
          
          <span class="w-8 text-center font-bold">{{ item.quantity }}</span>
          
          <button 
            class="w-8 h-8 rounded-full gradient-orange flex items-center justify-center shadow-gummy gummy-press"
            @click="cartStore.incrementQuantity(item.id)"
            aria-label="Aumentar cantidad"
          >
            <span class="i-lucide-plus text-sm text-white" />
          </button>
        </div>
      </div>
    </div>
    
    <!-- Remove Button -->
    <button 
      class="self-start p-2 rounded-full hover:bg-red-50 text-heat-gray-dark hover:text-red-500 transition-colors"
      @click="cartStore.removeItem(item.id)"
      aria-label="Eliminar del carrito"
    >
      <span class="i-lucide-x text-lg" />
    </button>
  </div>
</template>

