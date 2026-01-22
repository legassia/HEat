<script setup lang="ts">
interface Props {
  name: string
  price?: number
  count: number
  max?: number
  disabled?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  price: 0,
  max: 3,
  disabled: false
})

const emit = defineEmits<{
  'update:count': [value: number]
}>()

const isActive = computed(() => props.count > 0)

const increment = () => {
  if (props.count < props.max && !props.disabled) {
    emit('update:count', props.count + 1)
  }
}

const decrement = () => {
  if (props.count > 0 && !props.disabled) {
    emit('update:count', props.count - 1)
  }
}

const toggleActive = () => {
  if (props.disabled) return
  if (props.count === 0) {
    emit('update:count', 1)
  }
}

const formattedPrice = computed(() => {
  if (props.price === 0) return ''
  return `+$${props.price.toFixed(2)}`
})
</script>

<template>
  <div 
    class="relative flex items-center gap-2 p-3 rounded-gummy-sm border-2 transition-all duration-200 cursor-pointer select-none"
    :class="[
      isActive 
        ? 'border-heat-orange bg-heat-orange/10' 
        : 'border-heat-gray-medium/40 bg-white hover:border-heat-orange/50',
      disabled ? 'opacity-50 cursor-not-allowed' : ''
    ]"
    @click="toggleActive"
  >
    <!-- Count Badge (when active) -->
    <div 
      v-if="isActive"
      class="absolute -top-2 -left-2 w-6 h-6 rounded-full bg-gradient-to-r from-heat-orange to-heat-orange-light text-white text-xs font-bold flex items-center justify-center shadow-gummy"
    >
      {{ count }}
    </div>
    
    <!-- Name & Price -->
    <div class="flex-1 min-w-0">
      <span 
        class="font-semibold text-sm truncate block"
        :class="isActive ? 'text-heat-orange' : 'text-heat-black'"
      >
        {{ name }}
      </span>
      <span v-if="formattedPrice" class="text-xs text-heat-gray-dark">
        {{ formattedPrice }}
      </span>
    </div>
    
    <!-- Controls (show when active) -->
    <div 
      v-if="isActive"
      class="flex items-center gap-1"
      @click.stop
    >
      <button 
        class="w-7 h-7 rounded-full bg-heat-gray-soft flex items-center justify-center hover:bg-heat-orange/20 transition-colors"
        :disabled="count <= 0 || disabled"
        @click="decrement"
      >
        <span class="i-lucide-minus text-sm text-heat-gray-dark" />
      </button>
      <button 
        class="w-7 h-7 rounded-full bg-gradient-to-r from-heat-orange to-heat-orange-light flex items-center justify-center shadow-sm hover:shadow-gummy transition-all"
        :disabled="count >= max || disabled"
        @click="increment"
      >
        <span class="i-lucide-plus text-sm text-white" />
      </button>
    </div>
  </div>
</template>

