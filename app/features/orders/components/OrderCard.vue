<script setup lang="ts">
import { useSpeech } from '../composables/useSpeech'
import { useOrderStatus, type OrderStatus } from '../composables/useOrderStatus'
import { useUserRole } from '~/features/auth/composables/useUserRole'

interface OrderItem {
  readonly name: string
  readonly quantity: number
  readonly price?: number
  readonly selectedOptions?: ReadonlyArray<{ readonly name: string; readonly quantity: number }>
}

interface Order {
  readonly id: string
  readonly plateCode: string
  readonly status: OrderStatus
  readonly createdAt: Date
  readonly total: number
  readonly notes: string | null
  readonly items: ReadonlyArray<OrderItem>
  readonly userId: string | null
  readonly userName: string | null
  readonly userPhone: string | null
}

const props = defineProps<{ order: Order }>()

const emit = defineEmits<{
  statusUpdated: [orderId: string, newStatus: OrderStatus]
}>()

// State
const isExpanded = ref(false)

// Composables
const { isAdmin } = useUserRole()
const { speakOrder, isSpeaking, stop, speechRate, cycleRate } = useSpeech()

// Order status management (for admins)
const orderIdRef = computed(() => props.order.id)
const statusRef = computed(() => props.order.status)
const plateCodeRef = computed(() => props.order.plateCode)

const {
  isUpdating,
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
const isActive = computed(() => ['pending', 'cooking', 'ready', 'delivered'].includes(props.order.status))

const formattedDate = computed(() =>
  new Intl.DateTimeFormat('es-CO', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })
    .format(props.order.createdAt)
)

const formattedTotal = computed(() =>
  new Intl.NumberFormat('es-CO', { style: 'currency', currency: 'COP', minimumFractionDigits: 0 })
    .format(props.order.total)
)

// 5 phases: pending(20%), cooking(40%), ready(60%), delivered(80%), paid(100%)
const progressPercent = computed(() => {
  const map: Record<OrderStatus, number> = {
    pending: 20,
    cooking: 40,
    ready: 60,
    delivered: 80,
    paid: 100,
    cancelled: 0
  }
  return map[props.order.status]
})

// Has notes to show
const hasNotes = computed(() => !!props.order.notes?.trim())

// Actions
const toggleExpand = () => {
  isExpanded.value = !isExpanded.value
}

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
  if (props.order.notes) {
    lines.push(`Notas: ${props.order.notes}`)
  }
  await navigator.clipboard.writeText(lines.join('\n')).catch(console.error)
}

const callUser = () => {
  if (props.order.userPhone) {
    window.location.href = `tel:${props.order.userPhone}`
  }
}

const formatPhone = (phone: string | null) => {
  if (!phone) return ''
  const clean = phone.replace(/\D/g, '')
  if (clean.length === 10) {
    return `${clean.slice(0, 3)}-${clean.slice(3, 6)}-${clean.slice(6)}`
  }
  return phone
}
</script>

<template>
  <GummyCard
    :hoverable="true"
    padding="md"
    class="overflow-hidden"
    :class="[currentConfig.cardColor, isActive && order.status !== 'delivered' ? 'ring-2 ring-heat-orange/30' : '']"
  >
    <!-- Header (clickable to expand) -->
    <div class="cursor-pointer" @click="toggleExpand">
      <!-- Row 1: Plate code + Status -->
      <div class="flex items-center justify-between gap-2 mb-2">
        <div class="flex items-center gap-2">
          <span
            class="px-3 py-1.5 rounded-gummy-sm font-extrabold text-xl"
            :class="order.status === 'delivered' ? 'bg-red-500 text-white' : isActive ? 'gradient-orange text-white' : 'bg-heat-gray-soft text-heat-gray-dark'"
          >
            {{ order.plateCode }}
          </span>
          <span v-if="order.status === 'delivered'" class="w-2.5 h-2.5 rounded-full bg-red-500 animate-pulse" />
          <span v-else-if="isActive" class="w-2.5 h-2.5 rounded-full bg-green-500 animate-pulse" />
        </div>

        <div class="flex items-center gap-1.5">
          <div
            class="flex items-center gap-1.5 px-2.5 py-1.5 rounded-gummy-sm text-sm font-bold"
            :class="currentConfig.color"
          >
            <span :class="currentConfig.icon" />
            {{ currentConfig.label }}
          </div>
          <span 
            class="text-lg text-heat-gray-dark transition-transform duration-200"
            :class="isExpanded ? 'i-lucide-chevron-up' : 'i-lucide-chevron-down'"
          />
        </div>
      </div>

      <!-- Date -->
      <p class="text-sm text-heat-gray-dark mb-3">{{ formattedDate }}</p>

      <!-- Items -->
      <div class="space-y-1 mb-3">
        <div 
          v-for="(item, idx) in order.items.slice(0, isExpanded ? order.items.length : 3)" 
          :key="idx" 
          class="flex justify-between items-start gap-2"
        >
          <span class="text-base text-heat-black font-medium flex-1 break-words">{{ item.quantity }}x {{ item.name }}</span>
          <span v-if="item.price && isExpanded" class="text-sm text-heat-gray-dark font-semibold whitespace-nowrap">
            {{ new Intl.NumberFormat('es-CO', { style: 'currency', currency: 'COP', minimumFractionDigits: 0 }).format(item.price) }}
          </span>
        </div>
        <p v-if="!isExpanded && order.items.length > 3" class="text-sm text-heat-orange font-semibold">
          +{{ order.items.length - 3 }} más...
        </p>
      </div>

      <!-- Notes preview (collapsed) -->
      <div v-if="hasNotes" class="mb-3 p-2 rounded-gummy-sm bg-yellow-50 border border-yellow-200 overflow-hidden">
        <p class="text-sm text-yellow-700 font-medium" :class="isExpanded ? 'whitespace-pre-wrap' : 'truncate'">
          <span class="i-lucide-sticky-note mr-1" />
          {{ order.notes }}
        </p>
      </div>

      <!-- Total -->
      <div class="flex items-center justify-between pt-3 border-t border-heat-gray-medium/30">
        <span class="text-lg font-bold text-heat-black">Total</span>
        <span class="text-2xl font-extrabold text-heat-orange">{{ formattedTotal }}</span>
      </div>
    </div>

    <!-- ALWAYS VISIBLE: Narrar + Copiar -->
    <div class="flex items-center gap-2 mt-3 pt-3 border-t border-heat-gray-medium/30">
      <button
        class="flex-1 flex items-center justify-center gap-1.5 px-3 py-2.5 rounded-gummy-sm text-sm font-bold transition-colors"
        :class="isSpeaking ? 'bg-heat-orange text-white' : 'bg-heat-gray-soft text-heat-gray-dark hover:bg-heat-orange/10 hover:text-heat-orange'"
        @click.stop="playOrder"
      >
        <span :class="isSpeaking ? 'i-lucide-square' : 'i-lucide-volume-2'" class="text-lg" />
        {{ isSpeaking ? 'Parar' : 'Narrar' }}
      </button>

      <button
        v-if="isSpeaking"
        class="px-3 py-2.5 rounded-gummy-sm bg-heat-gray-soft text-heat-gray-dark text-sm font-bold hover:bg-heat-orange/10"
        @click.stop="cycleRate"
      >
        {{ speechRate }}x
      </button>

      <button
        class="flex-1 flex items-center justify-center gap-1.5 px-3 py-2.5 rounded-gummy-sm bg-heat-gray-soft text-heat-gray-dark text-sm font-bold hover:bg-heat-cyan/10 hover:text-heat-cyan transition-colors"
        @click.stop="copyOrder"
      >
        <span class="i-lucide-copy text-lg" />
        Copiar
      </button>
    </div>

    <!-- Admin Controls (always visible for active orders) -->
    <div v-if="isAdmin && isActive" class="flex items-center gap-2 mt-2">
      <button
        v-if="nextStatusLabel"
        class="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 rounded-gummy-sm text-base font-bold gradient-orange text-white hover:opacity-90 disabled:opacity-50 transition-colors"
        :disabled="isUpdating"
        @click.stop="handleUpdateStatus"
      >
        <span v-if="isUpdating" class="i-lucide-loader-2 animate-spin" />
        <span v-else :class="nextStatusIcon" />
        {{ nextStatusLabel }}
      </button>

      <button
        v-if="order.status === 'pending'"
        class="px-3 py-2.5 rounded-gummy-sm bg-red-100 text-red-600 font-bold hover:bg-red-200 disabled:opacity-50 transition-colors"
        :disabled="isUpdating"
        @click.stop="handleCancelOrder"
      >
        <span class="i-lucide-x text-lg" />
      </button>
    </div>

    <!-- Expanded Details -->
    <Transition name="expand">
      <div v-if="isExpanded" class="mt-3 pt-3 border-t border-heat-gray-medium/30 space-y-3">
        <!-- User Info (Admin only) -->
        <div v-if="isAdmin && (order.userName || order.userPhone)" class="p-3 rounded-gummy-sm bg-heat-gray-soft">
          <h4 class="text-sm font-bold text-heat-black mb-2 flex items-center gap-1.5">
            <span class="i-lucide-user" />
            Cliente
          </h4>
          <div class="space-y-1.5">
            <p v-if="order.userName" class="text-sm text-heat-gray-dark font-medium">
              {{ order.userName }}
            </p>
            <div v-if="order.userPhone" class="flex items-center gap-2 flex-wrap">
              <span class="text-sm text-heat-black font-mono font-bold">{{ formatPhone(order.userPhone) }}</span>
              <button
                class="flex items-center gap-1.5 px-3 py-1.5 rounded-gummy-sm bg-green-500 text-white text-sm font-bold hover:bg-green-600 transition-colors"
                @click.stop="callUser"
              >
                <span class="i-lucide-phone" />
                Llamar
              </button>
            </div>
          </div>
        </div>

        <!-- Progress -->
        <div v-if="isActive">
          <div class="flex justify-between mb-1.5">
            <span class="text-sm text-heat-gray-dark">Progreso</span>
            <span class="text-sm font-bold text-heat-orange">{{ progressPercent }}%</span>
          </div>
          <div class="h-2 bg-heat-gray-soft rounded-full overflow-hidden">
            <div
              class="h-full gradient-orange transition-all duration-500 rounded-full"
              :style="{ width: `${progressPercent}%` }"
            />
          </div>
          <div class="flex justify-between mt-2 text-xs font-semibold">
            <span :class="progressPercent >= 20 ? 'text-heat-orange' : 'text-heat-gray-dark'">Pendiente</span>
            <span :class="progressPercent >= 40 ? 'text-heat-orange' : 'text-heat-gray-dark'">Cocinando</span>
            <span :class="progressPercent >= 60 ? 'text-heat-orange' : 'text-heat-gray-dark'">Listo</span>
            <span :class="progressPercent >= 80 ? 'text-heat-orange' : 'text-heat-gray-dark'">Entregado</span>
            <span :class="progressPercent >= 100 ? 'text-heat-orange' : 'text-heat-gray-dark'">Pagado</span>
          </div>
        </div>
      </div>
    </Transition>
  </GummyCard>
</template>

<style scoped>
.expand-enter-active,
.expand-leave-active {
  transition: all 0.3s ease;
  overflow: hidden;
}

.expand-enter-from,
.expand-leave-to {
  opacity: 0;
  max-height: 0;
}

.expand-enter-to,
.expand-leave-from {
  opacity: 1;
  max-height: 400px;
}
</style>
