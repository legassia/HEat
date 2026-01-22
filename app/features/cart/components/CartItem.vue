<script setup lang="ts">
import { useCartStore, type CartItem } from '../store/cart.store'

const props = defineProps<{
  item: CartItem
}>()

const cartStore = useCartStore()

// Get emoji based on category
const categoryEmoji = computed(() => {
  const emojis: Record<string, string> = {
    arepas: '🫓',
    perros: '🌭',
    hamburguesas: '🍔',
    chorizos: '🥓',
    pinchos: '🍢'
  }
  return emojis[props.item.category || ''] || '🍔'
})

const itemTotal = computed(() => {
  const optionsTotal = props.item.selectedOptions.reduce((sum, opt) => 
    sum + (opt.priceModifier * (opt.quantity || 1)), 0
  )
  return (props.item.basePrice + optionsTotal) * props.item.quantity
})

const formattedTotal = computed(() => {
  return new Intl.NumberFormat('es-CO', {
    style: 'currency',
    currency: 'COP',
    minimumFractionDigits: 0
  }).format(itemTotal.value)
})

// Format options for display
const optionsText = computed(() => {
  return props.item.selectedOptions
    .map(o => o.quantity > 1 ? `${o.quantity}x ${o.name}` : o.name)
    .join(', ')
})
</script>

<template>
  <div class="bg-heat-white rounded-gummy-lg border border-heat-gray-medium/30 p-4 flex gap-4">
    <!-- Image -->
    <div class="w-16 h-16 rounded-gummy-sm bg-heat-gray-soft flex items-center justify-center shrink-0">
      <span class="text-3xl">{{ categoryEmoji }}</span>
    </div>
    
    <!-- Info -->
    <div class="flex-1 min-w-0">
      <h4 class="font-bold text-heat-black text-sm truncate">{{ item.productName }}</h4>
      
      <!-- Selected Options -->
      <p v-if="optionsText" class="text-xs text-heat-gray-dark truncate mt-1">
        {{ optionsText }}
      </p>
      
      <!-- Price & Quantity -->
      <div class="flex items-center justify-between mt-2">
        <span class="font-bold text-heat-orange">{{ formattedTotal }}</span>
        
        <!-- Quantity Controls -->
        <div class="flex items-center gap-1">
          <button 
            class="w-7 h-7 rounded-full bg-heat-gray-soft flex items-center justify-center hover:bg-heat-orange/10 transition-colors"
            @click="cartStore.decrementQuantity(item.id)"
          >
            <span class="i-lucide-minus text-xs text-heat-gray-dark" />
          </button>
          
          <span class="w-6 text-center font-bold text-sm">{{ item.quantity }}</span>
          
          <button 
            class="w-7 h-7 rounded-full bg-gradient-to-r from-heat-orange to-heat-orange-light flex items-center justify-center"
            @click="cartStore.incrementQuantity(item.id)"
          >
            <span class="i-lucide-plus text-xs text-white" />
          </button>
        </div>
      </div>
    </div>
    
    <!-- Remove Button -->
    <button 
      class="self-start p-1.5 rounded-full hover:bg-red-50 text-heat-gray-medium hover:text-red-500 transition-colors"
      @click="cartStore.removeItem(item.id)"
    >
      <span class="i-lucide-x text-base" />
    </button>
  </div>
</template>
