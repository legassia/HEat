<script setup lang="ts">
import type { ProductOption } from '../types/product.types'
import ConfiguratorOptionItem from './ConfiguratorOptionItem.vue'

interface OptionGroup {
  name: string
  options: ProductOption[]
}

defineProps<{
  groupedOptions: Record<string, OptionGroup>
  selectedOptions: Set<string>
}>()

defineEmits<{
  toggle: [optionId: string]
}>()
</script>

<template>
  <div class="space-y-6">
    <div 
      v-for="(group, groupId) in groupedOptions"
      :key="groupId"
    >
      <h3 class="font-bold text-heat-black mb-3">
        {{ group.name }}
      </h3>
      
      <div class="space-y-2">
        <ConfiguratorOptionItem
          v-for="option in group.options"
          :key="option.id"
          :option="option"
          :is-selected="selectedOptions.has(option.id)"
          @toggle="$emit('toggle', option.id)"
        />
      </div>
    </div>
  </div>
</template>

