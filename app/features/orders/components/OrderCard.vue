<script setup lang="ts">
interface OrderItem {
  name: string
  quantity: number
}

interface Order {
  id: string
  plateCode: string
  status: 'pending' | 'cooking' | 'ready' | 'delivered' | 'cancelled'
  createdAt: Date
  total: number
  items: OrderItem[]
}

const props = defineProps<{
  order: Order
}>()

const statusConfig = {
  pending: {
    label: 'Pendiente',
    color: 'bg-yellow-100 text-yellow-700',
    icon: 'i-lucide-clock'
  },
  cooking: {
    label: 'Cocinando',
    color: 'bg-orange-100 text-orange-700',
    icon: 'i-lucide-flame'
  },
  ready: {
    label: 'Listo',
    color: 'bg-green-100 text-green-700',
    icon: 'i-lucide-check-circle'
  },
  delivered: {
    label: 'Entregado',
    color: 'bg-blue-100 text-blue-700',
    icon: 'i-lucide-package-check'
  },
  cancelled: {
    label: 'Cancelado',
    color: 'bg-red-100 text-red-700',
    icon: 'i-lucide-x-circle'
  }
}

const currentStatus = computed(() => statusConfig[props.order.status])

const formattedDate = computed(() => {
  return new Intl.DateTimeFormat('es-VE', {
    day: 'numeric',
    month: 'short',
    hour: '2-digit',
    minute: '2-digit'
  }).format(props.order.createdAt)
})

const formattedTotal = computed(() => {
  return new Intl.NumberFormat('es-VE', {
    style: 'currency',
    currency: 'COP'
  }).format(props.order.total)
})

const isActive = computed(() => 
  ['pending', 'cooking', 'ready'].includes(props.order.status)
)
</script>

<template>
  <GummyCard 
    :hoverable="true"
    padding="lg"
    :class="isActive ? 'ring-2 ring-heat-orange/30' : ''"
  >
    <!-- Header -->
    <div class="flex items-start justify-between mb-4">
      <div>
        <!-- Plate Code -->
        <div class="flex items-center gap-2 mb-1">
          <span 
            class="px-3 py-1 rounded-gummy-sm font-bold text-lg"
            :class="isActive ? 'gradient-orange text-white' : 'bg-heat-gray-soft text-heat-gray-dark'"
          >
            {{ order.plateCode }}
          </span>
          
          <!-- Active indicator -->
          <span 
            v-if="isActive"
            class="w-2 h-2 rounded-full bg-green-500 animate-pulse"
          />
        </div>
        
        <!-- Date -->
        <p class="text-sm text-heat-gray-dark">
          {{ formattedDate }}
        </p>
      </div>
      
      <!-- Status Badge -->
      <div 
        class="flex items-center gap-1.5 px-3 py-1.5 rounded-gummy-sm text-sm font-semibold"
        :class="currentStatus.color"
      >
        <span :class="currentStatus.icon" />
        {{ currentStatus.label }}
      </div>
    </div>
    
    <!-- Items -->
    <div class="mb-4">
      <div 
        v-for="(item, idx) in order.items"
        :key="idx"
        class="flex justify-between text-sm py-1"
      >
        <span class="text-heat-gray-dark">
          {{ item.quantity }}x {{ item.name }}
        </span>
      </div>
    </div>
    
    <!-- Footer -->
    <div class="flex items-center justify-between pt-4 border-t border-heat-gray-medium/30">
      <span class="font-bold text-heat-black">Total</span>
      <span class="text-xl font-extrabold text-heat-orange">
        {{ formattedTotal }}
      </span>
    </div>
    
    <!-- Progress bar for active orders -->
    <div 
      v-if="isActive"
      class="mt-4 pt-4 border-t border-heat-gray-medium/30"
    >
      <div class="flex justify-between mb-2">
        <span class="text-xs text-heat-gray-dark">Progreso</span>
        <span class="text-xs font-semibold text-heat-orange">
          {{ order.status === 'pending' ? '25%' : order.status === 'cooking' ? '50%' : '100%' }}
        </span>
      </div>
      <div class="h-2 bg-heat-gray-soft rounded-full overflow-hidden">
        <div 
          class="h-full gradient-orange transition-all duration-500 rounded-full"
          :style="{ 
            width: order.status === 'pending' ? '25%' : order.status === 'cooking' ? '50%' : '100%' 
          }"
        />
      </div>
      
      <!-- Status steps -->
      <div class="flex justify-between mt-2 text-xs">
        <span :class="['pending', 'cooking', 'ready'].includes(order.status) ? 'text-heat-orange font-semibold' : 'text-heat-gray-dark'">
          Recibido
        </span>
        <span :class="['cooking', 'ready'].includes(order.status) ? 'text-heat-orange font-semibold' : 'text-heat-gray-dark'">
          Cocinando
        </span>
        <span :class="order.status === 'ready' ? 'text-heat-orange font-semibold' : 'text-heat-gray-dark'">
          Listo
        </span>
      </div>
    </div>
  </GummyCard>
</template>

