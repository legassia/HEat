<script setup lang="ts">
import { useSpeech } from '../composables/useSpeech'

interface OrderItem {
  name: string
  quantity: number
}

interface Order {
  id: string
  status: 'pending' | 'cooking' | 'ready' | 'delivered' | 'paid' | 'cancelled'
  items: OrderItem[]
}

const props = defineProps<{
  orders: Order[]
}>()

const { speakSummary, isSpeaking, stop, speechRate, cycleRate } = useSpeech()

// Filter only pending and cooking orders
const activeOrders = computed(() => 
  props.orders.filter(o => ['pending', 'cooking'].includes(o.status))
)

// Aggregate items across all active orders
const aggregatedItems = computed(() => {
  const itemMap = new Map<string, number>()
  
  activeOrders.value.forEach(order => {
    order.items.forEach(item => {
      const current = itemMap.get(item.name) || 0
      itemMap.set(item.name, current + item.quantity)
    })
  })
  
  return Array.from(itemMap.entries())
    .map(([name, quantity]) => ({ name, quantity }))
    .sort((a, b) => b.quantity - a.quantity)
})

// Total items count
const totalItems = computed(() => 
  aggregatedItems.value.reduce((sum, item) => sum + item.quantity, 0)
)

// Total orders count
const totalOrders = computed(() => activeOrders.value.length)

// Play summary narration
const playSummary = () => {
  if (isSpeaking.value) {
    stop()
  } else {
    speakSummary(aggregatedItems.value)
  }
}

// Copy summary to clipboard
const copySummary = async () => {
  const lines = [
    `Resumen de Pedidos (${totalOrders.value} pedidos, ${totalItems.value} items)`,
    '',
    ...aggregatedItems.value.map(item => `- ${item.quantity}x ${item.name}`)
  ]
  
  try {
    await navigator.clipboard.writeText(lines.join('\n'))
  } catch (e) {
    console.error('Failed to copy:', e)
  }
}
</script>

<template>
  <div class="bg-heat-white rounded-gummy-xl border border-heat-gray-medium/30 p-6">
    <!-- Header -->
    <div class="flex items-center justify-between mb-4">
      <div>
        <h3 class="text-lg font-bold text-heat-black flex items-center gap-2">
          <span class="i-lucide-clipboard-list text-heat-orange" />
          Resumen de Pedidos
        </h3>
        <p class="text-sm text-heat-gray-dark">
          {{ totalOrders }} pedidos activos • {{ totalItems }} items
        </p>
      </div>
      
      <!-- Controls -->
      <div class="flex items-center gap-2">
        <!-- Play/Stop Button -->
        <button 
          class="flex items-center gap-2 px-4 py-2 rounded-gummy text-sm font-semibold transition-colors"
          :class="isSpeaking ? 'bg-heat-orange text-white' : 'bg-heat-gray-soft text-heat-gray-dark hover:bg-heat-orange/10 hover:text-heat-orange'"
          @click="playSummary"
        >
          <span :class="isSpeaking ? 'i-lucide-square' : 'i-lucide-volume-2'" />
          {{ isSpeaking ? 'Detener' : 'Narrar Resumen' }}
        </button>
        
        <!-- Speed Control -->
        <button 
          v-if="isSpeaking"
          class="px-3 py-2 rounded-gummy bg-heat-gray-soft text-heat-gray-dark text-sm font-medium hover:bg-heat-orange/10"
          @click="cycleRate"
        >
          {{ speechRate }}x
        </button>
        
        <!-- Copy Button -->
        <button 
          class="p-2 rounded-gummy bg-heat-gray-soft text-heat-gray-dark hover:bg-heat-cyan/10 hover:text-heat-cyan transition-colors"
          @click="copySummary"
          title="Copiar resumen"
        >
          <span class="i-lucide-copy text-lg" />
        </button>
      </div>
    </div>
    
    <!-- Empty State -->
    <div 
      v-if="aggregatedItems.length === 0"
      class="text-center py-8 text-heat-gray-dark"
    >
      <span class="i-lucide-check-circle text-4xl text-green-500 mb-2" />
      <p>No hay pedidos pendientes</p>
    </div>
    
    <!-- Items List -->
    <div v-else class="space-y-2">
      <div 
        v-for="item in aggregatedItems"
        :key="item.name"
        class="flex items-center justify-between p-3 bg-heat-gray-soft/50 rounded-gummy-sm"
      >
        <span class="font-medium text-heat-black">{{ item.name }}</span>
        <span 
          class="px-3 py-1 rounded-full font-bold text-sm"
          :class="item.quantity >= 5 ? 'bg-heat-orange text-white' : 'bg-heat-gray-medium/50 text-heat-gray-dark'"
        >
          {{ item.quantity }}
        </span>
      </div>
    </div>
    
    <!-- High quantity warning -->
    <div 
      v-if="aggregatedItems.some(i => i.quantity >= 5)"
      class="mt-4 p-3 bg-yellow-50 rounded-gummy-sm border border-yellow-200"
    >
      <p class="text-sm text-yellow-700 flex items-center gap-2">
        <span class="i-lucide-alert-triangle" />
        Hay productos con alta demanda. Considera prepararlos en lote.
      </p>
    </div>
  </div>
</template>

