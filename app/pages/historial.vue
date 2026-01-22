<script setup lang="ts">
import OrderCard from '~/features/orders/components/OrderCard.vue'

useHead({
  title: 'HEat - Historial de Pedidos'
})

// Mock orders for now - will be replaced with real data from Supabase
const orders = ref([
  {
    id: '1',
    plateCode: 'K12',
    status: 'delivered',
    createdAt: new Date('2026-01-21T14:30:00'),
    total: 12.50,
    items: [
      { name: 'Arepa con Queso y Jamón', quantity: 2 },
      { name: 'Perro con Todo', quantity: 1 }
    ]
  },
  {
    id: '2',
    plateCode: 'K08',
    status: 'cooking',
    createdAt: new Date('2026-01-21T13:15:00'),
    total: 8.00,
    items: [
      { name: 'Hamburguesa Especial', quantity: 2 }
    ]
  },
  {
    id: '3',
    plateCode: 'K03',
    status: 'ready',
    createdAt: new Date('2026-01-21T12:00:00'),
    total: 15.75,
    items: [
      { name: 'Arepa Mixta', quantity: 3 },
      { name: 'Perro Sencillo', quantity: 2 }
    ]
  }
])

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
    
    <!-- Filters -->
    <div class="flex gap-2 overflow-x-auto pb-2 -mx-4 px-4 lg:mx-0 lg:px-0">
      <button 
        v-for="filter in statusFilters"
        :key="filter.value"
        class="px-4 py-2 rounded-gummy text-sm font-semibold whitespace-nowrap transition-all gummy-press"
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
  </div>
</template>

