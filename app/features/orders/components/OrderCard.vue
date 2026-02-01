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
    padding="lg"
    :class="[currentConfig.cardColor, isActive && order.status !== 'delivered' ? 'ring-2 ring-heat-orange/30' : '']"
  >
    <!-- Clickable Header -->
    <div class="cursor-pointer" @click="toggleExpand">
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
            
            <!-- Expand indicator -->
            <span 
              class="transition-transform duration-200"
              :class="isExpanded ? 'i-lucide-chevron-up' : 'i-lucide-chevron-down'"
            />
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

      <!-- Items Preview -->
      <div class="mb-4">
        <div v-for="(item, idx) in order.items.slice(0, isExpanded ? order.items.length : 3)" :key="idx" class="flex justify-between text-sm py-1">
          <span class="text-heat-gray-dark">{{ item.quantity }}x {{ item.name }}</span>
          <span v-if="item.price && isExpanded" class="text-heat-gray-dark">
            {{ new Intl.NumberFormat('es-CO', { style: 'currency', currency: 'COP', minimumFractionDigits: 0 }).format(item.price) }}
          </span>
        </div>
        <p v-if="!isExpanded && order.items.length > 3" class="text-xs text-heat-orange mt-1">
          +{{ order.items.length - 3 }} más...
        </p>
      </div>

      <!-- Notes preview (collapsed) -->
      <div v-if="hasNotes && !isExpanded" class="mb-4 p-2 rounded-gummy-sm bg-yellow-50 border border-yellow-200">
        <p class="text-xs text-yellow-700 truncate">
          <span class="i-lucide-sticky-note mr-1" />
          {{ order.notes }}
        </p>
      </div>

      <!-- Total -->
      <div class="flex items-center justify-between pt-4 border-t border-heat-gray-medium/30">
        <span class="font-bold text-heat-black">Total</span>
        <span class="text-xl font-extrabold text-heat-orange">{{ formattedTotal }}</span>
      </div>
    </div>

    <!-- Expanded Details -->
    <Transition name="expand">
      <div v-if="isExpanded" class="mt-4 pt-4 border-t border-heat-gray-medium/30 space-y-4">
        <!-- Full Notes -->
        <div v-if="hasNotes" class="p-3 rounded-gummy bg-yellow-50 border border-yellow-200">
          <h4 class="text-sm font-semibold text-yellow-800 mb-1 flex items-center gap-1">
            <span class="i-lucide-sticky-note" />
            Notas del pedido
          </h4>
          <p class="text-sm text-yellow-700 whitespace-pre-wrap">{{ order.notes }}</p>
        </div>

        <!-- User Info (Admin only) -->
        <div v-if="isAdmin && (order.userName || order.userPhone)" class="p-3 rounded-gummy bg-heat-gray-soft">
          <h4 class="text-sm font-semibold text-heat-black mb-2 flex items-center gap-1">
            <span class="i-lucide-user" />
            Cliente
          </h4>
          <div class="space-y-1">
            <p v-if="order.userName" class="text-sm text-heat-gray-dark">
              {{ order.userName }}
            </p>
            <div v-if="order.userPhone" class="flex items-center gap-2">
              <span class="text-sm text-heat-gray-dark font-mono">{{ formatPhone(order.userPhone) }}</span>
              <button
                class="flex items-center gap-1 px-2 py-1 rounded-gummy-sm bg-green-100 text-green-700 text-xs font-medium hover:bg-green-200 transition-colors"
                @click.stop="callUser"
              >
                <span class="i-lucide-phone" />
                Llamar
              </button>
            </div>
          </div>
        </div>

        <!-- Tools -->
        <div class="flex items-center gap-2">
          <button
            class="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 rounded-gummy-sm text-sm font-medium transition-colors"
            :class="isSpeaking ? 'bg-heat-orange text-white' : 'bg-heat-gray-soft text-heat-gray-dark hover:bg-heat-orange/10 hover:text-heat-orange'"
            @click.stop="playOrder"
          >
            <span :class="isSpeaking ? 'i-lucide-square' : 'i-lucide-volume-2'" />
            {{ isSpeaking ? 'Detener' : 'Narrar' }}
          </button>

          <button
            v-if="isSpeaking"
            class="px-3 py-2.5 rounded-gummy-sm bg-heat-gray-soft text-heat-gray-dark text-sm font-medium hover:bg-heat-orange/10"
            @click.stop="cycleRate"
          >
            {{ speechRate }}x
          </button>

          <button
            class="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 rounded-gummy-sm bg-heat-gray-soft text-heat-gray-dark text-sm font-medium hover:bg-heat-cyan/10 hover:text-heat-cyan transition-colors"
            @click.stop="copyOrder"
          >
            <span class="i-lucide-copy" />
            Copiar
          </button>
        </div>

        <!-- Admin Controls -->
        <div v-if="isAdmin && isActive" class="flex items-center gap-2">
          <button
            v-if="nextStatusLabel"
            class="flex-1 flex items-center justify-center gap-2 px-5 py-2.5 rounded-gummy-sm text-sm font-semibold gradient-orange text-white hover:opacity-90 disabled:opacity-50 transition-colors"
            :disabled="isUpdating"
            @click.stop="handleUpdateStatus"
          >
            <span v-if="isUpdating" class="i-lucide-loader-2 animate-spin" />
            <span v-else :class="nextStatusIcon" />
            {{ nextStatusLabel }}
          </button>

          <button
            v-if="order.status === 'pending'"
            class="px-4 py-2.5 rounded-gummy-sm bg-red-50 text-red-600 text-sm font-medium hover:bg-red-100 disabled:opacity-50 transition-colors"
            :disabled="isUpdating"
            @click.stop="handleCancelOrder"
          >
            <span class="i-lucide-x" />
          </button>
        </div>

        <!-- Progress -->
        <div v-if="isActive">
          <div class="flex justify-between mb-2">
            <span class="text-xs text-heat-gray-dark">Progreso</span>
            <span class="text-xs font-semibold text-heat-orange">{{ progressPercent }}%</span>
          </div>
          <div class="h-2 bg-heat-gray-soft rounded-full overflow-hidden">
            <div
              class="h-full gradient-orange transition-all duration-500 rounded-full"
              :style="{ width: `${progressPercent}%` }"
            />
          </div>
          <div class="flex justify-between mt-2 text-xs">
            <span :class="progressPercent >= 20 ? 'text-heat-orange font-semibold' : 'text-heat-gray-dark'">Pendiente</span>
            <span :class="progressPercent >= 40 ? 'text-heat-orange font-semibold' : 'text-heat-gray-dark'">Cocinando</span>
            <span :class="progressPercent >= 60 ? 'text-heat-orange font-semibold' : 'text-heat-gray-dark'">Listo</span>
            <span :class="progressPercent >= 80 ? 'text-heat-orange font-semibold' : 'text-heat-gray-dark'">Entregado</span>
            <span :class="progressPercent >= 100 ? 'text-heat-orange font-semibold' : 'text-heat-gray-dark'">Pagado</span>
          </div>
        </div>
      </div>
    </Transition>

    <!-- Collapsed quick tools (when not expanded) -->
    <div v-if="!isExpanded && isAdmin && isActive" class="mt-4 pt-4 border-t border-heat-gray-medium/30 flex items-center gap-2">
      <button
        v-if="nextStatusLabel"
        class="flex-1 flex items-center justify-center gap-2 px-4 py-2 rounded-gummy-sm text-sm font-semibold gradient-orange text-white hover:opacity-90 disabled:opacity-50 transition-colors"
        :disabled="isUpdating"
        @click.stop="handleUpdateStatus"
      >
        <span v-if="isUpdating" class="i-lucide-loader-2 animate-spin" />
        <span v-else :class="nextStatusIcon" />
        {{ nextStatusLabel }}
      </button>

      <button
        v-if="order.status === 'pending'"
        class="px-3 py-2 rounded-gummy-sm bg-red-50 text-red-600 text-sm font-medium hover:bg-red-100 disabled:opacity-50 transition-colors"
        :disabled="isUpdating"
        @click.stop="handleCancelOrder"
      >
        <span class="i-lucide-x" />
      </button>
    </div>
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
  max-height: 800px;
}
</style>
