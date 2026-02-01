<script setup lang="ts">
import { useSpeech } from '../composables/useSpeech'
import { useOrderStatus, statusConfig, type OrderStatus } from '../composables/useOrderStatus'
import { useUserRole } from '~/features/auth/composables/useUserRole'

interface OrderItem {
  readonly name: string
  readonly quantity: number
  readonly selectedOptions?: ReadonlyArray<{ readonly name: string; readonly quantity: number }>
}

interface Order {
  readonly id: string
  readonly plateCode: string
  readonly status: OrderStatus
  readonly createdAt: Date
  readonly total: number
  readonly items: ReadonlyArray<OrderItem>
}

const props = defineProps<{ order: Order }>()

const emit = defineEmits<{
  statusUpdated: [orderId: string, newStatus: OrderStatus]
}>()

// Composables
const { isAdmin } = useUserRole()
const { speakOrder, isSpeaking, stop, speechRate, cycleRate } = useSpeech()

// Order status management (for admins)
const orderIdRef = computed(() => props.order.id)
const statusRef = computed(() => props.order.status)
const plateCodeRef = computed(() => props.order.plateCode)

const { 
  isUpdating, 
  nextStatus, 
  nextStatusLabel, 
  nextStatusIcon,
  currentConfig, 
  updateStatus, 
  cancelOrder 
} = useOrderStatus(orderIdRef, statusRef, plateCodeRef)

// Handlers
const handleUpdateStatus = () => updateStatus((newStatus) => emit('statusUpdated', props.order.id, newStatus))
const handleCancelOrder = () => cancelOrder(() => emit('statusUpdated', props.order.id, 'cancelled'))

// Computed values
// Active = needs admin action (not paid, not cancelled)
const isActive = computed(() => ['pending', 'cooking', 'ready', 'delivered'].includes(props.order.status))

const formattedDate = computed(() => 
  new Intl.DateTimeFormat('es-CO', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })
    .format(props.order.createdAt)
)

const formattedTotal = computed(() => 
  new Intl.NumberFormat('es-CO', { style: 'currency', currency: 'COP', minimumFractionDigits: 0 })
    .format(props.order.total)
)

const progressPercent = computed(() => {
  const map: Record<OrderStatus, string> = { 
    pending: '20%', 
    cooking: '40%', 
    ready: '60%', 
    delivered: '80%', 
    paid: '100%',
    cancelled: '0%' 
  }
  return map[props.order.status]
})

// Actions
const playOrder = () => {
  if (isSpeaking.value) {
    stop()
  } else {
    speakOrder({
      plate_code: props.order.plateCode,
      items: props.order.items.map(item => ({
        productName: item.name,
        quantity: item.quantity,
        selectedOptions: item.selectedOptions as Array<{ name: string; quantity: number }>
      })),
      total: props.order.total
    })
  }
}

const copyOrder = async () => {
  const lines = [
    `Pedido #${props.order.plateCode}`,
    ...props.order.items.map(item => `- ${item.name} x${item.quantity}`),
    `Total: ${formattedTotal.value}`
  ]
  await navigator.clipboard.writeText(lines.join('\n')).catch(console.error)
}
</script>

<template>
  <GummyCard :hoverable="true" padding="lg" :class="[currentConfig.cardColor, isActive && order.status !== 'delivered' ? 'ring-2 ring-heat-orange/30' : '']">
    <!-- Header -->
    <div class="flex items-start justify-between mb-4">
      <div>
        <div class="flex items-center gap-2 mb-1">
          <span 
            class="px-3 py-1 rounded-gummy-sm font-bold text-lg"
            :class="order.status === 'delivered' ? 'bg-red-500 text-white' : isActive ? 'gradient-orange text-white' : 'bg-heat-gray-soft text-heat-gray-dark'"
          >
            {{ order.plateCode }}
          </span>
          <span v-if="order.status === 'delivered'" class="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
          <span v-else-if="isActive" class="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
        </div>
        <p class="text-sm text-heat-gray-dark">{{ formattedDate }}</p>
      </div>
      
      <div 
        class="flex items-center gap-1.5 px-3 py-1.5 rounded-gummy-sm text-sm font-semibold"
        :class="currentConfig.color"
      >
        <span :class="currentConfig.icon" />
        {{ currentConfig.label }}
      </div>
    </div>
    
    <!-- Items -->
    <div class="mb-4">
      <div v-for="(item, idx) in order.items" :key="idx" class="flex justify-between text-sm py-1">
        <span class="text-heat-gray-dark">{{ item.quantity }}x {{ item.name }}</span>
      </div>
    </div>
    
    <!-- Total -->
    <div class="flex items-center justify-between pt-4 border-t border-heat-gray-medium/30">
      <span class="font-bold text-heat-black">Total</span>
      <span class="text-xl font-extrabold text-heat-orange">{{ formattedTotal }}</span>
    </div>
    
    <!-- Admin Controls -->
    <div v-if="isAdmin && isActive" class="mt-4 pt-4 border-t border-heat-gray-medium/30 flex items-center gap-2">
      <button 
        v-if="nextStatusLabel"
        class="flex-1 flex items-center justify-center gap-2 px-5 py-2.5 rounded-gummy-sm text-sm font-semibold gradient-orange text-white hover:opacity-90 disabled:opacity-50 transition-colors"
        :disabled="isUpdating"
        @click="handleUpdateStatus"
      >
        <span v-if="isUpdating" class="i-lucide-loader-2 animate-spin" />
        <span v-else :class="nextStatusIcon" />
        {{ nextStatusLabel }}
      </button>
      
      <button 
        v-if="order.status === 'pending'"
        class="px-4 py-2.5 rounded-gummy-sm bg-red-50 text-red-600 text-sm font-medium hover:bg-red-100 disabled:opacity-50 transition-colors"
        :disabled="isUpdating"
        @click="handleCancelOrder"
      >
        <span class="i-lucide-x" />
      </button>
    </div>
    
    <!-- Tools -->
    <div class="mt-4 pt-4 border-t border-heat-gray-medium/30 flex items-center gap-2">
      <button 
        class="flex-1 flex items-center justify-center gap-2 px-5 py-2.5 rounded-gummy-sm text-sm font-medium transition-colors"
        :class="isSpeaking ? 'bg-heat-orange text-white' : 'bg-heat-gray-soft text-heat-gray-dark hover:bg-heat-orange/10 hover:text-heat-orange'"
        @click="playOrder"
      >
        <span :class="isSpeaking ? 'i-lucide-square' : 'i-lucide-volume-2'" />
        {{ isSpeaking ? 'Detener' : 'Narrar' }}
      </button>
      
      <button 
        v-if="isSpeaking"
        class="px-3 py-2.5 rounded-gummy-sm bg-heat-gray-soft text-heat-gray-dark text-sm font-medium hover:bg-heat-orange/10"
        @click="cycleRate"
      >
        {{ speechRate }}x
      </button>
      
      <button 
        class="flex-1 flex items-center justify-center gap-2 px-5 py-2.5 rounded-gummy-sm bg-heat-gray-soft text-heat-gray-dark text-sm font-medium hover:bg-heat-cyan/10 hover:text-heat-cyan transition-colors"
        @click="copyOrder"
      >
        <span class="i-lucide-copy" />
        Copiar
      </button>
    </div>
    
    <!-- Progress -->
    <div v-if="isActive" class="mt-4 pt-4 border-t border-heat-gray-medium/30">
      <div class="flex justify-between mb-2">
        <span class="text-xs text-heat-gray-dark">Progreso</span>
        <span class="text-xs font-semibold text-heat-orange">{{ progressPercent }}</span>
      </div>
      <div class="h-2 bg-heat-gray-soft rounded-full overflow-hidden">
        <div class="h-full gradient-orange transition-all duration-500 rounded-full" :style="{ width: progressPercent }" />
      </div>
      <div class="flex justify-between mt-2 text-xs">
        <span :class="['pending', 'cooking', 'ready', 'delivered'].includes(order.status) ? 'text-heat-orange font-semibold' : 'text-heat-gray-dark'">Recibido</span>
        <span :class="['cooking', 'ready', 'delivered'].includes(order.status) ? 'text-heat-orange font-semibold' : 'text-heat-gray-dark'">Cocinando</span>
        <span :class="['ready', 'delivered'].includes(order.status) ? 'text-heat-orange font-semibold' : 'text-heat-gray-dark'">Listo</span>
        <span :class="order.status === 'delivered' ? 'text-heat-orange font-semibold' : 'text-heat-gray-dark'">Entregar</span>
      </div>
    </div>
  </GummyCard>
</template>
