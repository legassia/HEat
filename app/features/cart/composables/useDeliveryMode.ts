// // Delivery mode types and composable

// export type DeliveryMode = 'local' | 'pickup' | 'delivery'

// export interface DeliveryConfig {
//   mode: DeliveryMode
//   // Local (en mesa) - can be multiple tables
//   tables?: number[]
//   // Pickup (recoger)
//   pickupTime?: string
//   pickupNotes?: string
//   // Delivery (domicilio)
//   address?: string
//   deliveryNotes?: string
// }

// export const DELIVERY_FEE = 2000 // COP

// export const AVAILABLE_TABLES = [1, 2, 3, 4, 5, 6]

// export const deliveryModeLabels: Record<DeliveryMode, { label: string; description: string; icon: string }> = {
//   local: {
//     label: 'En Mesa',
//     description: 'Pedir desde el local',
//     icon: 'i-lucide-utensils'
//   },
//   pickup: {
//     label: 'Recoger',
//     description: 'Paso a buscarlo',
//     icon: 'i-lucide-package'
//   },
//   delivery: {
//     label: 'Domicilio',
//     description: 'Envío disponible',
//     icon: 'i-lucide-bike'
//   }
// }

// // Get a random default table
// const getRandomTable = () => AVAILABLE_TABLES[Math.floor(Math.random() * AVAILABLE_TABLES.length)]

// export function useDeliveryMode() {
//   // State
//   const mode = ref<DeliveryMode>('local')
//   const selectedTables = ref<Set<number>>(new Set([getRandomTable() ?? 1])) // Default: random table
//   const pickupTime = ref('')
//   const pickupNotes = ref('')
//   const deliveryAddress = ref('')
//   const deliveryNotes = ref('')

//   // Computed
//   const deliveryFee = computed(() => mode.value === 'delivery' ? DELIVERY_FEE : 0)
  
//   const tablesArray = computed(() => Array.from(selectedTables.value).sort((a, b) => a - b))
  
//   const isValid = computed(() => {
//     switch (mode.value) {
//       case 'local':
//         return selectedTables.value.size > 0
//       case 'pickup':
//         return true // Pickup always valid, notes are optional
//       case 'delivery':
//         return deliveryAddress.value.trim().length > 0
//       default:
//         return false
//     }
//   })

//   const config = computed<DeliveryConfig>(() => ({
//     mode: mode.value,
//     tables: mode.value === 'local' ? tablesArray.value : undefined,
//     pickupTime: mode.value === 'pickup' ? pickupTime.value : undefined,
//     pickupNotes: mode.value === 'pickup' ? pickupNotes.value : undefined,
//     address: mode.value === 'delivery' ? deliveryAddress.value : undefined,
//     deliveryNotes: mode.value === 'delivery' ? deliveryNotes.value : undefined
//   }))

//   // Build notes string for order
//   const buildOrderNotes = computed(() => {
//     const parts: string[] = []
    
//     switch (mode.value) {
//       case 'local':
//         if (selectedTables.value.size > 0) {
//           const tables = tablesArray.value.join(', ')
//           parts.push(`🍽️ Mesa${selectedTables.value.size > 1 ? 's' : ''} ${tables}`)
//         }
//         break
//       case 'pickup':
//         parts.push('📦 Para recoger')
//         if (pickupTime.value) {
//           parts.push(`⏰ Hora: ${pickupTime.value}`)
//         }
//         if (pickupNotes.value) {
//           parts.push(pickupNotes.value)
//         }
//         break
//       case 'delivery':
//         parts.push('🚴 Domicilio')
//         if (deliveryAddress.value) {
//           parts.push(`📍 ${deliveryAddress.value}`)
//         }
//         if (deliveryNotes.value) {
//           parts.push(deliveryNotes.value)
//         }
//         break
//     }
    
//     return parts.join('\n')
//   })

//   // Actions
//   const setMode = (newMode: DeliveryMode) => {
//     mode.value = newMode
//   }

//   const toggleTable = (table: number) => {
//     if (selectedTables.value.has(table)) {
//       // Don't allow removing the last table
//       if (selectedTables.value.size > 1) {
//         selectedTables.value.delete(table)
//       }
//     } else {
//       selectedTables.value.add(table)
//     }
//     // Trigger reactivity
//     selectedTables.value = new Set(selectedTables.value)
//   }

//   const reset = () => {
//     mode.value = 'local'
//     selectedTables.value = new Set([getRandomTable() ?? 1])
//     pickupTime.value = ''
//     pickupNotes.value = ''
//     deliveryAddress.value = ''
//     deliveryNotes.value = ''
//   }

//   // Load address from profile
//   const loadFromProfile = (profile: { address?: string | null }) => {
//     if (profile.address) {
//       deliveryAddress.value = profile.address
//     }
//   }

//   return {
//     // State
//     mode: readonly(mode),
//     selectedTables: readonly(selectedTables),
//     tablesArray,
//     pickupTime,
//     pickupNotes,
//     deliveryAddress,
//     deliveryNotes,
//     // Computed
//     deliveryFee,
//     isValid,
//     config,
//     buildOrderNotes,
//     // Actions
//     setMode,
//     toggleTable,
//     reset,
//     loadFromProfile
//   }
// }
