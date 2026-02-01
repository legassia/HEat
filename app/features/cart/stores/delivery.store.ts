import { defineStore } from 'pinia'

export type DeliveryMode = 'local' | 'pickup' | 'delivery'

export interface DeliveryConfig {
  mode: DeliveryMode
  tables?: number[]
  pickupTime?: string
  pickupNotes?: string
  address?: string
  deliveryNotes?: string
}

export const DELIVERY_FEE = 2000 // COP
export const AVAILABLE_TABLES = [1, 2, 3, 4, 5, 6]

export const deliveryModeLabels: Record<DeliveryMode, { label: string; description: string; icon: string }> = {
  local: {
    label: 'En Mesa',
    description: 'Pedir desde el local',
    icon: 'i-lucide-coffee'
  },
  pickup: {
    label: 'Recoger',
    description: 'Paso a buscarlo',
    icon: 'i-lucide-shopping-bag'
  },
  delivery: {
    label: 'Domicilio',
    description: 'Envío disponible',
    icon: 'i-lucide-bike'
  }
}

const getRandomTable = () => AVAILABLE_TABLES[Math.floor(Math.random() * AVAILABLE_TABLES.length)]

interface DeliveryState {
  mode: DeliveryMode
  selectedTables: number[]
  pickupTime: string
  pickupNotes: string
  deliveryAddress: string
  deliveryNotes: string
}

export const useDeliveryStore = defineStore('delivery', {
  state: (): DeliveryState => ({
    mode: 'local',
    selectedTables: [getRandomTable() ?? 1],
    pickupTime: '',
    pickupNotes: '',
    deliveryAddress: '',
    deliveryNotes: ''
  }),

  getters: {
    deliveryFee: (state) => state.mode === 'delivery' ? DELIVERY_FEE : 0,
    
    tablesSet: (state) => new Set(state.selectedTables),
    
    isValid: (state) => {
      switch (state.mode) {
        case 'local':
          return state.selectedTables.length > 0
        case 'pickup':
          return true
        case 'delivery':
          return state.deliveryAddress.trim().length > 0
        default:
          return false
      }
    },

    config: (state): DeliveryConfig => ({
      mode: state.mode,
      tables: state.mode === 'local' ? [...state.selectedTables].sort((a, b) => a - b) : undefined,
      pickupTime: state.mode === 'pickup' ? state.pickupTime : undefined,
      pickupNotes: state.mode === 'pickup' ? state.pickupNotes : undefined,
      address: state.mode === 'delivery' ? state.deliveryAddress : undefined,
      deliveryNotes: state.mode === 'delivery' ? state.deliveryNotes : undefined
    }),

    buildOrderNotes: (state): string => {
      const parts: string[] = []
      
      switch (state.mode) {
        case 'local':
          if (state.selectedTables.length > 0) {
            const tables = [...state.selectedTables].sort((a, b) => a - b).join(', ')
            parts.push(`🍽️ Mesa${state.selectedTables.length > 1 ? 's' : ''} ${tables}`)
          }
          break
        case 'pickup':
          parts.push('📦 Para recoger')
          if (state.pickupTime) {
            parts.push(`⏰ Hora: ${state.pickupTime}`)
          }
          if (state.pickupNotes) {
            parts.push(state.pickupNotes)
          }
          break
        case 'delivery':
          parts.push('🚴 Domicilio')
          if (state.deliveryAddress) {
            parts.push(`📍 ${state.deliveryAddress}`)
          }
          if (state.deliveryNotes) {
            parts.push(state.deliveryNotes)
          }
          break
      }
      
      return parts.join('\n')
    }
  },

  actions: {
    setMode(newMode: DeliveryMode) {
      this.mode = newMode
    },

    toggleTable(table: number) {
      const index = this.selectedTables.indexOf(table)
      if (index > -1) {
        // Don't remove the last table
        if (this.selectedTables.length > 1) {
          this.selectedTables.splice(index, 1)
        }
      } else {
        this.selectedTables.push(table)
      }
    },

    loadFromProfile(profile: { address?: string | null }) {
      if (profile.address) {
        this.deliveryAddress = profile.address
      }
    },

    reset() {
      this.mode = 'local'
      this.selectedTables = [getRandomTable() ?? 1]
      this.pickupTime = ''
      this.pickupNotes = ''
      this.deliveryAddress = ''
      this.deliveryNotes = ''
    }
  }
})
