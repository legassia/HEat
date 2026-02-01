<script setup lang="ts">
import OrderCard from '~/features/orders/components/OrderCard.vue'
import { useOrderHistory } from '~/features/orders/composables/useOrderHistory'

definePageMeta({
  middleware: 'auth'
})

useHead({
  title: 'HEat - Historial de Pedidos'
})

const { orders, isLoading, error, isAdmin, fetchOrders, subscribeToUpdates } = useOrderHistory()

// Subscribe to realtime updates
let unsubscribe: (() => void) | null = null

onMounted(async () => {
  await fetchOrders()
  unsubscribe = await subscribeToUpdates()
})

onUnmounted(() => {
  if (unsubscribe) unsubscribe()
})

// Multi-select status filters
import { type OrderStatus, statusConfig } from '~/features/orders/composables/useOrderStatus'

const statusFilters: Array<{ value: OrderStatus; label: string; icon: string }> = [
  { value: 'pending', label: 'Pendiente', icon: 'i-lucide-clock' },
  { value: 'cooking', label: 'Cocinando', icon: 'i-lucide-flame' },
  { value: 'ready', label: 'Listo', icon: 'i-lucide-check-circle' },
  { value: 'delivered', label: 'Entregado', icon: 'i-lucide-hand-coins' },
  { value: 'paid', label: 'Pagado', icon: 'i-lucide-badge-dollar-sign' },
  { value: 'cancelled', label: 'Cancelado', icon: 'i-lucide-x-circle' }
]

// Default: active orders (not paid, not cancelled)
const activeFilters = ref<Set<OrderStatus>>(new Set(['pending', 'cooking', 'ready', 'delivered']))

const toggleFilter = (status: OrderStatus) => {
  if (activeFilters.value.has(status)) {
    activeFilters.value.delete(status)
  } else {
    activeFilters.value.add(status)
  }
  // Trigger reactivity
  activeFilters.value = new Set(activeFilters.value)
}

const filteredOrders = computed(() => {
  // If nothing selected, show cancelled (archived)
  if (activeFilters.value.size === 0) {
    return orders.value.filter(o => o.status === 'cancelled')
  }
  return orders.value.filter(order => activeFilters.value.has(order.status as OrderStatus))
})
</script>

<template>
  <div class="space-y-6 overflow-x-hidden">
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
      <!-- Status Filters (multi-select toggles) -->
      <div class="grid grid-cols-3 sm:grid-cols-6 gap-2">
        <button 
          v-for="filter in statusFilters"
          :key="filter.value"
          class="flex items-center justify-center gap-1.5 px-2 py-2.5 rounded-gummy text-xs sm:text-sm font-semibold transition-all"
          :class="activeFilters.has(filter.value) 
            ? 'gradient-orange text-white shadow-gummy'
            : 'bg-heat-white text-heat-gray-dark hover:bg-heat-orange/10 border border-heat-gray-medium/30'"
          @click="toggleFilter(filter.value)"
        >
          <span :class="filter.icon" class="text-base" />
          <span class="hidden sm:inline">{{ filter.label }}</span>
        </button>
      </div>
      
      <!-- Orders List -->
      <div v-if="filteredOrders.length > 0" class="space-y-4">
        <OrderCard 
          v-for="order in filteredOrders"
          :key="order.id"
          :order="order"
          @status-updated="fetchOrders"
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
          {{ orders.length === 0 
            ? 'Aún no has realizado ningún pedido' 
            : 'No hay pedidos con los filtros seleccionados' }}
        </p>
        <GummyButton v-if="orders.length === 0" variant="primary" @click="navigateTo('/')">
          Hacer mi primer pedido
        </GummyButton>
      </div>
    </template>
  </div>
</template>
