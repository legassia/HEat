<script setup lang="ts">
import { toast } from 'vue-sonner'
import { useCartStore, type CartItem } from '../store/cart.store'

const props = defineProps<{
  item: CartItem
}>()

const emit = defineEmits<{
  loadToEditor: [item: CartItem]
}>()

const cartStore = useCartStore()

// Accordion state
const isExpanded = ref(false)

// Get emoji based on category
const categoryEmoji = computed(() => {
  const emojis: Record<string, string> = {
    arepas: '🫓',
    perros: '🌭',
    hamburguesas: '🍔',
    chorizos: '🥓',
    pinchos: '🍢'
  }
  return emojis[props.item.category || ''] || '🍔'
})

const itemTotal = computed(() => {
  const optionsTotal = props.item.selectedOptions.reduce((sum, opt) => 
    sum + (opt.priceModifier * (opt.quantity || 1)), 0
  )
  return (props.item.basePrice + optionsTotal) * props.item.quantity
})

const formattedTotal = computed(() => {
  return new Intl.NumberFormat('es-CO', {
    style: 'currency',
    currency: 'COP',
    minimumFractionDigits: 0
  }).format(itemTotal.value)
})

// Format options for collapsed display
const optionsText = computed(() => {
  return props.item.selectedOptions
    .map(o => o.quantity > 1 ? `${o.quantity}x ${o.name}` : o.name)
    .join(', ')
})

// Toggle expanded state
const toggleExpand = () => {
  isExpanded.value = !isExpanded.value
}

// Load item to editor
const loadToEditor = (e: Event) => {
  e.stopPropagation()
  emit('loadToEditor', props.item)
  toast.info('Cargado en el editor', {
    description: 'Personaliza y agrega de nuevo'
  })
}

// Copy item to clipboard
const copyItem = async (e: Event) => {
  e.stopPropagation()
  
  const lines = [
    props.item.productName,
    ...props.item.selectedOptions.map(o => 
      `  - ${o.quantity > 1 ? `${o.quantity}x ` : ''}${o.name}`
    ),
    `Cantidad: ${props.item.quantity}`,
    `Total: ${formattedTotal.value}`
  ]
  
  try {
    await navigator.clipboard.writeText(lines.join('\n'))
    toast.success('Copiado al portapapeles')
  } catch (e) {
    console.error('Failed to copy:', e)
  }
}
</script>

<template>
  <div class="bg-heat-white rounded-gummy-lg border border-heat-gray-medium/30 overflow-hidden transition-all duration-200">
    <!-- Main row (always visible) -->
    <div 
      class="p-4 flex gap-4 cursor-pointer hover:bg-heat-gray-soft/50 transition-colors"
      @click="toggleExpand"
    >
      <!-- Image/Emoji - Clickable to load in editor -->
      <div 
        class="w-14 h-14 rounded-gummy-sm bg-heat-gray-soft flex items-center justify-center shrink-0 hover:bg-heat-orange/10 hover:ring-2 hover:ring-heat-orange/30 transition-all cursor-pointer"
        @click="loadToEditor"
        title="Cargar en editor"
      >
        <span class="text-2xl">{{ categoryEmoji }}</span>
      </div>
      
      <!-- Info -->
      <div class="flex-1 min-w-0">
        <div class="flex items-start justify-between gap-2">
          <h4 class="font-bold text-heat-black text-sm">{{ item.productName }}</h4>
          <!-- Expand indicator -->
          <span 
            class="i-lucide-chevron-down text-heat-gray-dark transition-transform shrink-0"
            :class="{ 'rotate-180': isExpanded }"
          />
        </div>
        
        <!-- Collapsed options preview -->
        <p 
          v-if="optionsText && !isExpanded" 
          class="text-xs text-heat-gray-dark truncate mt-0.5"
        >
          {{ optionsText }}
        </p>
        
        <!-- Price & Quantity -->
        <div class="flex items-center justify-between mt-2">
          <span class="font-bold text-heat-orange text-sm">{{ formattedTotal }}</span>
          
          <!-- Quantity Controls -->
          <div class="flex items-center gap-1" @click.stop>
            <button 
              class="w-6 h-6 rounded-full bg-heat-gray-soft flex items-center justify-center hover:bg-heat-orange/10 transition-colors"
              @click="cartStore.decrementQuantity(item.id)"
            >
              <span class="i-lucide-minus text-xs text-heat-gray-dark" />
            </button>
            
            <span class="w-5 text-center font-bold text-xs">{{ item.quantity }}</span>
            
            <button 
              class="w-6 h-6 rounded-full bg-gradient-to-r from-heat-orange to-heat-orange-light flex items-center justify-center"
              @click="cartStore.incrementQuantity(item.id)"
            >
              <span class="i-lucide-plus text-xs text-white" />
            </button>
          </div>
        </div>
      </div>
      
      <!-- Remove Button -->
      <button 
        class="self-start w-7 h-7 rounded-full bg-red-50 flex items-center justify-center text-red-400 hover:bg-red-100 hover:text-red-600 transition-colors shrink-0"
        @click.stop="cartStore.removeItem(item.id)"
        aria-label="Eliminar del carrito"
      >
        <span class="i-lucide-x text-base" />
      </button>
    </div>
    
    <!-- Expanded content (accordion) -->
    <Transition
      enter-active-class="transition-all duration-200 ease-out"
      enter-from-class="opacity-0 max-h-0"
      enter-to-class="opacity-100 max-h-96"
      leave-active-class="transition-all duration-200 ease-in"
      leave-from-class="opacity-100 max-h-96"
      leave-to-class="opacity-0 max-h-0"
    >
      <div v-if="isExpanded" class="border-t border-heat-gray-medium/30 overflow-hidden">
        <!-- Ingredients list -->
        <div class="p-4 bg-heat-gray-soft/30">
          <h5 class="text-xs font-semibold text-heat-gray-dark uppercase mb-2">Ingredientes</h5>
          
          <div v-if="item.selectedOptions.length > 0" class="space-y-1.5">
            <div 
              v-for="opt in item.selectedOptions"
              :key="opt.id"
              class="flex items-center justify-between text-sm"
            >
              <span class="text-heat-black">
                <span v-if="opt.quantity > 1" class="font-semibold text-heat-orange">{{ opt.quantity }}x </span>
                {{ opt.name }}
              </span>
              <span v-if="opt.priceModifier > 0" class="text-heat-gray-dark text-xs">
                +{{ new Intl.NumberFormat('es-CO', { style: 'currency', currency: 'COP', minimumFractionDigits: 0 }).format(opt.priceModifier * opt.quantity) }}
              </span>
            </div>
          </div>
          <p v-else class="text-sm text-heat-gray-dark">Sin ingredientes extra</p>
          
          <!-- Action buttons -->
          <div class="flex gap-2 mt-4 pt-3 border-t border-heat-gray-medium/30">
            <button 
              class="flex-1 flex items-center justify-center gap-1.5 py-2 rounded-gummy-sm bg-heat-orange/10 text-heat-orange text-xs font-semibold hover:bg-heat-orange/20 transition-colors"
              @click="loadToEditor"
            >
              <span class="i-lucide-edit text-sm" />
              Editar
            </button>
            <button 
              class="flex-1 flex items-center justify-center gap-1.5 py-2 rounded-gummy-sm bg-heat-cyan/10 text-heat-cyan text-xs font-semibold hover:bg-heat-cyan/20 transition-colors"
              @click="copyItem"
            >
              <span class="i-lucide-copy text-sm" />
              Copiar
            </button>
          </div>
        </div>
      </div>
    </Transition>
  </div>
</template>
