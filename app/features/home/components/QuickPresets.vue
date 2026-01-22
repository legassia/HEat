<script setup lang="ts">
import type { Preset, Category } from '../data/menu.config'

const props = defineProps<{
  presets: Preset[]
  category: Category | undefined
}>()

const emit = defineEmits<{
  loadPreset: [preset: Preset]
  quickAdd: [preset: Preset]
}>()

// Handle click on the card (load preset to editor)
const handleCardClick = (preset: Preset) => {
  emit('loadPreset', preset)
}

// Handle click on the + button (add directly to cart)
const handleQuickAdd = (event: Event, preset: Preset) => {
  event.stopPropagation()
  emit('quickAdd', preset)
}
</script>

<template>
  <section v-if="presets.length > 0">
    <h2 class="text-xl font-bold text-heat-black mb-4">
      Opciones rápidas
    </h2>
    
    <div class="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4">
      <div 
        v-for="preset in presets"
        :key="preset.name"
        class="relative bg-heat-white rounded-gummy-lg border border-heat-gray-medium/30 p-4 hover:shadow-gummy hover:-translate-y-1 transition-all cursor-pointer group"
        @click="handleCardClick(preset)"
      >
        <!-- Popular badge -->
        <span 
          v-if="preset.popular"
          class="absolute -top-2 -right-2 px-2 py-1 bg-heat-cyan text-white text-xs font-bold rounded-full z-10 pointer-events-none"
        >
          Popular
        </span>
        
        <div class="text-center">
          <span class="text-4xl block mb-2">{{ category?.emoji }}</span>
          <h4 class="font-semibold text-heat-black text-sm group-hover:text-heat-orange transition-colors">
            {{ preset.name }}
          </h4>
          <p class="text-xs text-heat-gray-dark mt-1">
            Click para personalizar
          </p>
        </div>
        
        <!-- Quick add button -->
        <button 
          class="absolute bottom-2 right-2 w-8 h-8 rounded-full bg-gradient-to-r from-heat-orange to-heat-orange-light flex items-center justify-center shadow-gummy opacity-0 group-hover:opacity-100 transition-all hover:scale-110"
          @click="(e) => handleQuickAdd(e, preset)"
          aria-label="Agregar al carrito"
        >
          <span class="i-lucide-plus text-white text-sm" />
        </button>
      </div>
    </div>
  </section>
</template>

