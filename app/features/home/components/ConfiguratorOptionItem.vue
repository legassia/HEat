<script setup lang="ts">
import type { ProductOption } from '../types/product.types'

defineProps<{
  option: ProductOption
  isSelected: boolean
}>()

defineEmits<{
  toggle: []
}>()
</script>

<template>
  <button
    class="w-full flex items-center justify-between p-3 rounded-gummy-sm border-2 transition-all gummy-press"
    :class="isSelected
      ? 'border-heat-orange bg-heat-orange/10'
      : 'border-heat-gray-medium/30 hover:border-heat-orange/50'"
    @click="$emit('toggle')"
  >
    <div class="flex items-center gap-3">
      <div 
        class="w-6 h-6 rounded-md flex items-center justify-center transition-colors"
        :class="isSelected ? 'gradient-orange' : 'bg-heat-gray-soft'"
      >
        <span v-if="isSelected" class="i-lucide-check text-white text-sm" />
      </div>
      <span 
        class="font-semibold"
        :class="isSelected ? 'text-heat-orange' : 'text-heat-black'"
      >
        {{ option.name }}
      </span>
    </div>
    
    <span 
      v-if="option.priceModifier > 0"
      class="text-sm font-semibold text-heat-gray-dark"
    >
      +${{ option.priceModifier.toFixed(2) }}
    </span>
  </button>
</template>

