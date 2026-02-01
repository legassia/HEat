<script setup lang="ts">
import { toast } from 'vue-sonner'
import { useSpeech } from '../composables/useSpeech'
import { useUserRole } from '~/features/auth/composables/useUserRole'

interface OrderItem {
  readonly name: string
  readonly quantity: number
  readonly selectedOptions?: ReadonlyArray<{ readonly name: string; readonly quantity: number }>
}

interface Order {
  readonly id: string
  readonly plateCode: string
  readonly status: 'pending' | 'cooking' | 'ready' | 'delivered' | 'cancelled'
  readonly createdAt: Date
  readonly total: number
  readonly items: ReadonlyArray<OrderItem>
}

const props = defineProps<{
  order: Order
}>()

const emit = defineEmits<{
  statusUpdated: [orderId: string, newStatus: Order['status']]
}>()

const supabase = useSupabaseClient<any>()
const { isAdmin } = useUserRole()
const { speakOrder, isSpeaking, stop, speechRate, cycleRate } = useSpeech()

const isUpdating = ref(false)

// Status flow: pending → cooking → ready → delivered
const nextStatusMap: Record<string, Order['status'] | null> = {
  pending: 'cooking',
  cooking: 'ready',
  ready: 'delivered',
  delivered: null,
  cancelled: null
}

const nextStatus = computed(() => nextStatusMap[props.order.status])

const nextStatusLabel = computed(() => {
  const labels: Record<string, string> = {
    cooking: 'Aceptar Pedido',
    ready: 'Marcar Listo',
    delivered: 'Entregar'
  }
  return nextStatus.value ? labels[nextStatus.value] : null
})

// Update order status
const updateStatus = async () => {
  if (!nextStatus.value || isUpdating.value) return
  
  isUpdating.value = true
  try {
    const { error } = await supabase
      .from('orders')
      .update({ status: nextStatus.value })
      .eq('id', props.order.id)
    
    if (error) throw error
    
    toast.success(`Pedido ${props.order.plateCode} actualizado`, {
      description: `Estado: ${statusConfig[nextStatus.value].label}`
    })
    
    emit('statusUpdated', props.order.id, nextStatus.value)
  } catch (e: unknown) {
    const errorMsg = e instanceof Error ? e.message : 'Error al actualizar'
    toast.error('Error', { description: errorMsg })
    console.error('Error updating order status:', e)
  } finally {
    isUpdating.value = false
  }
}

// Cancel order
const cancelOrder = async () => {
  if (isUpdating.value) return
  
  isUpdating.value = true
  try {
    const { error } = await supabase
      .from('orders')
      .update({ status: 'cancelled' })
      .eq('id', props.order.id)
    
    if (error) throw error
    
    toast.info(`Pedido ${props.order.plateCode} cancelado`)
    emit('statusUpdated', props.order.id, 'cancelled')
  } catch (e: unknown) {
    const errorMsg = e instanceof Error ? e.message : 'Error al cancelar'
    toast.error('Error', { description: errorMsg })
  } finally {
    isUpdating.value = false
  }
}

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
  return new Intl.DateTimeFormat('es-CO', {
    day: 'numeric',
    month: 'short',
    hour: '2-digit',
    minute: '2-digit'
  }).format(props.order.createdAt)
})

const formattedTotal = computed(() => {
  return new Intl.NumberFormat('es-CO', {
    style: 'currency',
    currency: 'COP',
    minimumFractionDigits: 0
  }).format(props.order.total)
})

const isActive = computed(() => 
  ['pending', 'cooking', 'ready'].includes(props.order.status)
)

// Play order narration
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

// Copy order to clipboard
const copyOrder = async () => {
  const lines = [
    `Pedido #${props.order.plateCode}`,
    ...props.order.items.map(item => `- ${item.name} x${item.quantity}`),
    `Total: ${formattedTotal.value}`
  ]
  
  try {
    await navigator.clipboard.writeText(lines.join('\n'))
    // Could add toast here
  } catch (e) {
    console.error('Failed to copy:', e)
  }
}
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
    
    <!-- Admin Status Controls -->
    <div 
      v-if="isAdmin && isActive"
      class="mt-4 pt-4 border-t border-heat-gray-medium/30 flex items-center gap-2"
    >
      <!-- Advance Status Button -->
      <button 
        v-if="nextStatusLabel"
        class="flex-1 flex items-center justify-center gap-2 px-5 py-2.5 rounded-gummy-sm text-sm font-semibold transition-colors gradient-orange text-white hover:opacity-90 disabled:opacity-50"
        :disabled="isUpdating"
        @click="updateStatus"
      >
        <span v-if="isUpdating" class="i-lucide-loader-2 animate-spin" />
        <span v-else-if="order.status === 'pending'" class="i-lucide-chef-hat" />
        <span v-else-if="order.status === 'cooking'" class="i-lucide-check" />
        <span v-else class="i-lucide-package-check" />
        {{ nextStatusLabel }}
      </button>
      
      <!-- Cancel Button -->
      <button 
        v-if="order.status === 'pending'"
        class="px-4 py-2.5 rounded-gummy-sm bg-red-50 text-red-600 text-sm font-medium hover:bg-red-100 transition-colors disabled:opacity-50"
        :disabled="isUpdating"
        @click="cancelOrder"
      >
        <span class="i-lucide-x" />
      </button>
    </div>
    
    <!-- Tools (TTS & Copy) -->
    <div 
      class="mt-4 pt-4 border-t border-heat-gray-medium/30 flex items-center gap-2"
    >
      <!-- Play/Stop Button -->
      <button 
        class="flex-1 flex items-center justify-center gap-2 px-5 py-2.5 rounded-gummy-sm text-sm font-medium transition-colors"
        :class="isSpeaking ? 'bg-heat-orange text-white' : 'bg-heat-gray-soft text-heat-gray-dark hover:bg-heat-orange/10 hover:text-heat-orange'"
        @click="playOrder"
      >
        <span :class="isSpeaking ? 'i-lucide-square' : 'i-lucide-volume-2'" />
        {{ isSpeaking ? 'Detener' : 'Narrar' }}
      </button>
      
      <!-- Speed Control -->
      <button 
        v-if="isSpeaking"
        class="px-3 py-2.5 rounded-gummy-sm bg-heat-gray-soft text-heat-gray-dark text-sm font-medium hover:bg-heat-orange/10"
        @click="cycleRate"
      >
        {{ speechRate }}x
      </button>
      
      <!-- Copy Button -->
      <button 
        class="flex-1 flex items-center justify-center gap-2 px-5 py-2.5 rounded-gummy-sm bg-heat-gray-soft text-heat-gray-dark text-sm font-medium hover:bg-heat-cyan/10 hover:text-heat-cyan transition-colors"
        @click="copyOrder"
      >
        <span class="i-lucide-copy" />
        Copiar
      </button>
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
