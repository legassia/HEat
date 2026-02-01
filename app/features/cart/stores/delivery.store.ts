import { defineStore } from 'pinia'

export type DeliveryMode = 'local' | 'pickup' | 'delivery'

export interface DeliveryConfig {
  mode: DeliveryMode
  tables?: number[]
  pickupTime?: string
  pickupNotes?: string
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
  deliveryNotes: string
}

export const useDeliveryStore = defineStore('delivery', {
  state: (): DeliveryState => ({
    mode: 'local',
    selectedTables: [getRandomTable() ?? 1],
    pickupTime: '',
    pickupNotes: '',
    deliveryNotes: ''
  }),

  getters: {
    deliveryFee: (state) => state.mode === 'delivery' ? DELIVERY_FEE : 0,
    
    tablesSet: (state) => new Set(state.selectedTables),
    
    // Basic validation (address validation handled in component with profile)
    isValidBasic: (state) => {
      switch (state.mode) {
        case 'local':
          return state.selectedTables.length > 0
        case 'pickup':
        case 'delivery':
          return true // Address checked separately from profile
        default:
          return false
      }
    },

    config: (state): DeliveryConfig => ({
      mode: state.mode,
      tables: state.mode === 'local' ? [...state.selectedTables].sort((a, b) => a - b) : undefined,
      pickupTime: state.mode === 'pickup' ? state.pickupTime : undefined,
      pickupNotes: state.mode === 'pickup' ? state.pickupNotes : undefined,
      deliveryNotes: state.mode === 'delivery' ? state.deliveryNotes : undefined
    })
  },

  actions: {
    setMode(newMode: DeliveryMode) {
      this.mode = newMode
    },

    toggleTable(table: number) {
      const index = this.selectedTables.indexOf(table)
      if (index > -1) {
        if (this.selectedTables.length > 1) {
          this.selectedTables.splice(index, 1)
        }
      } else {
        this.selectedTables.push(table)
      }
    },

    // Build order notes - address passed from profile
    buildOrderNotes(profileAddress?: string | null): string {
      const parts: string[] = []
      
      switch (this.mode) {
        case 'local':
          if (this.selectedTables.length > 0) {
            const tables = [...this.selectedTables].sort((a, b) => a - b).join(', ')
            parts.push(`🍽️ Mesa${this.selectedTables.length > 1 ? 's' : ''} ${tables}`)
          }
          break
        case 'pickup':
          parts.push('📦 Para recoger')
          if (this.pickupTime) {
            parts.push(`⏰ Hora: ${this.pickupTime}`)
          }
          if (this.pickupNotes) {
            parts.push(this.pickupNotes)
          }
          break
        case 'delivery':
          parts.push('🚴 Domicilio')
          if (profileAddress) {
            parts.push(`📍 ${profileAddress}`)
          }
          if (this.deliveryNotes) {
            parts.push(this.deliveryNotes)
          }
          break
      }
      
      return parts.join('\n')
    },

    reset() {
      this.mode = 'local'
      this.selectedTables = [getRandomTable() ?? 1]
      this.pickupTime = ''
      this.pickupNotes = ''
      this.deliveryNotes = ''
    }
  }
})
