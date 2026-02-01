// Delivery mode types and composable

export type DeliveryMode = 'local' | 'pickup' | 'delivery'

export interface DeliveryConfig {
  mode: DeliveryMode
  // Local (en mesa)
  tableNumber?: number
  // Pickup (recoger)
  pickupTime?: string
  pickupNotes?: string
  // Delivery (domicilio)
  address?: string
  deliveryNotes?: string
}

export const DELIVERY_FEE = 2000 // COP

export const deliveryModeLabels: Record<DeliveryMode, { label: string; description: string; icon: string }> = {
  local: {
    label: 'En Mesa',
    description: 'Pedir desde el local',
    icon: 'i-lucide-utensils'
  },
  pickup: {
    label: 'Recoger',
    description: 'Paso a buscarlo',
    icon: 'i-lucide-package'
  },
  delivery: {
    label: 'Domicilio',
    description: `Envío $${(DELIVERY_FEE / 1000).toFixed(0)}k`,
    icon: 'i-lucide-bike'
  }
}

export function useDeliveryMode() {
  // State
  const mode = ref<DeliveryMode>('local')
  const tableNumber = ref<number | null>(null)
  const pickupTime = ref('')
  const pickupNotes = ref('')
  const deliveryAddress = ref('')
  const deliveryNotes = ref('')

  // Computed
  const deliveryFee = computed(() => mode.value === 'delivery' ? DELIVERY_FEE : 0)
  
  const isValid = computed(() => {
    switch (mode.value) {
      case 'local':
        return tableNumber.value !== null && tableNumber.value >= 1 && tableNumber.value <= 6
      case 'pickup':
        return true // Pickup always valid, notes are optional
      case 'delivery':
        return deliveryAddress.value.trim().length > 0
      default:
        return false
    }
  })

  const config = computed<DeliveryConfig>(() => ({
    mode: mode.value,
    tableNumber: mode.value === 'local' ? tableNumber.value ?? undefined : undefined,
    pickupTime: mode.value === 'pickup' ? pickupTime.value : undefined,
    pickupNotes: mode.value === 'pickup' ? pickupNotes.value : undefined,
    address: mode.value === 'delivery' ? deliveryAddress.value : undefined,
    deliveryNotes: mode.value === 'delivery' ? deliveryNotes.value : undefined
  }))

  // Build notes string for order
  const buildOrderNotes = computed(() => {
    const parts: string[] = []
    
    switch (mode.value) {
      case 'local':
        if (tableNumber.value) {
          parts.push(`🍽️ Mesa ${tableNumber.value}`)
        }
        break
      case 'pickup':
        parts.push('📦 Para recoger')
        if (pickupTime.value) {
          parts.push(`⏰ Hora: ${pickupTime.value}`)
        }
        if (pickupNotes.value) {
          parts.push(pickupNotes.value)
        }
        break
      case 'delivery':
        parts.push('🚴 Domicilio')
        if (deliveryAddress.value) {
          parts.push(`📍 ${deliveryAddress.value}`)
        }
        if (deliveryNotes.value) {
          parts.push(deliveryNotes.value)
        }
        break
    }
    
    return parts.join('\n')
  })

  // Actions
  const setMode = (newMode: DeliveryMode) => {
    mode.value = newMode
  }

  const setTable = (table: number) => {
    tableNumber.value = table
  }

  const reset = () => {
    mode.value = 'local'
    tableNumber.value = null
    pickupTime.value = ''
    pickupNotes.value = ''
    deliveryAddress.value = ''
    deliveryNotes.value = ''
  }

  // Load address from profile
  const loadFromProfile = (profile: { address?: string | null }) => {
    if (profile.address) {
      deliveryAddress.value = profile.address
    }
  }

  return {
    // State
    mode: readonly(mode),
    tableNumber: readonly(tableNumber),
    pickupTime,
    pickupNotes,
    deliveryAddress,
    deliveryNotes,
    // Computed
    deliveryFee,
    isValid,
    config,
    buildOrderNotes,
    // Actions
    setMode,
    setTable,
    reset,
    loadFromProfile
  }
}
