<script setup lang="ts">
import OrderCard from '~/features/orders/components/OrderCard.vue'
import { useOrderHistory } from '~/features/orders/composables/useOrderHistory'

definePageMeta({
  middleware: 'auth'
})

useHead({
  title: 'HEat - Historial de Pedidos'
})

const { orders, isLoading, error, fetchOrders, subscribeToUpdates } = useOrderHistory()

// Subscribe to realtime updates
let unsubscribe: (() => void) | null = null

onMounted(async () => {
  console.log('[historial] onMounted called')
  await fetchOrders() // Ensure orders are fetched client-side
  unsubscribe = await subscribeToUpdates()
})

onUnmounted(() => {
  if (unsubscribe) unsubscribe()
})

const statusFilters = [
  { value: 'all', label: 'Todos' },
  { value: 'pending', label: 'Pendiente' },
  { value: 'cooking', label: 'Cocinando' },
  { value: 'ready', label: 'Listo' },
  { value: 'delivered', label: 'Entregado' }
]

const selectedFilter = ref('all')

const filteredOrders = computed(() => {
  if (selectedFilter.value === 'all') return orders.value
  return orders.value.filter(order => order.status === selectedFilter.value)
})
</script>

<template>
  <div class="space-y-6">
    <!-- Header -->
    <div>
      <h1 class="text-3xl font-extrabold text-heat-black mb-2">
        Historial de Pedidos
      </h1>
      <p class="text-heat-gray-dark">
        Revisa el estado de tus pedidos
      </p>
    </div>
    
    <!-- Loading State -->
    <div v-if="isLoading" class="text-center py-16">
      <div class="w-16 h-16 mx-auto rounded-full bg-heat-orange/10 flex items-center justify-center mb-4">
        <span class="i-lucide-loader-2 text-3xl text-heat-orange animate-spin" />
      </div>
      <p class="text-heat-gray-dark">Cargando pedidos...</p>
    </div>
    
    <!-- Error State -->
    <div v-else-if="error" class="text-center py-16">
      <div class="w-16 h-16 mx-auto rounded-full bg-red-50 flex items-center justify-center mb-4">
        <span class="i-lucide-alert-circle text-3xl text-red-500" />
      </div>
      <p class="text-red-600 mb-4">{{ error }}</p>
      <GummyButton variant="outline" @click="fetchOrders">
        Reintentar
      </GummyButton>
    </div>
    
    <template v-else>
      <!-- Filters -->
      <div class="flex gap-2 overflow-x-auto pb-2 -mx-4 px-4 lg:mx-0 lg:px-0">
        <button 
          v-for="filter in statusFilters"
          :key="filter.value"
          class="px-4 py-2 rounded-gummy text-sm font-semibold whitespace-nowrap transition-all"
          :class="selectedFilter === filter.value 
            ? 'gradient-orange text-white shadow-gummy' 
            : 'bg-heat-white text-heat-gray-dark hover:bg-heat-orange/10'"
          @click="selectedFilter = filter.value"
        >
          {{ filter.label }}
        </button>
      </div>
      
      <!-- Orders List -->
      <div v-if="filteredOrders.length > 0" class="space-y-4">
        <OrderCard 
          v-for="order in filteredOrders"
          :key="order.id"
          :order="order"
        />
      </div>
      
      <!-- Empty State -->
      <div 
        v-else
        class="text-center py-16"
      >
        <div class="w-32 h-32 mx-auto rounded-full bg-heat-gray-soft flex items-center justify-center mb-6">
          <span class="i-lucide-history text-5xl text-heat-gray-medium" />
        </div>
        <h2 class="text-xl font-bold text-heat-black mb-2">
          No hay pedidos
        </h2>
        <p class="text-heat-gray-dark mb-6">
          {{ selectedFilter === 'all' 
            ? 'Aún no has realizado ningún pedido' 
            : 'No hay pedidos con este estado' }}
        </p>
        <GummyButton variant="primary" @click="navigateTo('/')">
          Hacer mi primer pedido
        </GummyButton>
      </div>
    </template>
  </div>
</template>
