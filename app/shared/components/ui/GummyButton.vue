<script setup lang="ts">
type ButtonVariant = 'primary' | 'secondary' | 'outline' | 'cyan' | 'ghost'
type ButtonSize = 'sm' | 'md' | 'lg'

interface Props {
  variant?: ButtonVariant
  size?: ButtonSize
  disabled?: boolean
  loading?: boolean
  icon?: string
  iconRight?: string
}

const props = withDefaults(defineProps<Props>(), {
  variant: 'primary',
  size: 'md',
  disabled: false,
  loading: false
})

const emit = defineEmits<{
  click: [event: MouseEvent]
}>()

const variantClasses: Record<ButtonVariant, string> = {
  // Primary: gradient orange with subtle shadow (no harsh border)
  primary: 'bg-gradient-to-r from-heat-orange to-heat-orange-light text-white shadow-gummy hover:shadow-gummy-hover',
  // Secondary: white bg with orange border
  secondary: 'bg-heat-white text-heat-orange border-2 border-heat-orange hover:bg-heat-orange hover:text-white',
  // Outline: white bg with subtle orange border (softer than secondary)
  outline: 'bg-white text-heat-black border border-heat-orange/40 hover:border-heat-orange hover:bg-heat-orange/5',
  // Cyan variant
  cyan: 'bg-heat-cyan text-white shadow-gummy-cyan hover:bg-heat-cyan-dark',
  // Ghost: no background
  ghost: 'bg-transparent text-heat-gray-dark hover:bg-heat-gray-soft hover:text-heat-orange'
}

const sizeClasses: Record<ButtonSize, string> = {
  sm: 'px-4 py-2 text-sm rounded-gummy-sm',
  md: 'px-6 py-3 rounded-gummy',
  lg: 'px-8 py-4 text-lg rounded-gummy-lg'
}

const classes = computed(() => [
  'inline-flex items-center justify-center gap-2 font-bold transition-all duration-300 transform cursor-pointer select-none',
  variantClasses[props.variant],
  sizeClasses[props.size],
  {
    'opacity-50 cursor-not-allowed pointer-events-none': props.disabled || props.loading,
    'hover:scale-105 active:scale-95': !props.disabled && !props.loading
  }
])

const handleClick = (event: MouseEvent) => {
  if (!props.disabled && !props.loading) {
    emit('click', event)
  }
}
</script>

<template>
  <button 
    :class="classes"
    :disabled="disabled || loading"
    @click="handleClick"
  >
    <!-- Loading Spinner -->
    <span 
      v-if="loading" 
      class="w-5 h-5 border-2 border-current border-t-transparent rounded-full animate-spin"
    />
    
    <!-- Left Icon -->
    <span v-else-if="icon" :class="icon" />
    
    <!-- Content -->
    <slot />
    
    <!-- Right Icon -->
    <span v-if="iconRight && !loading" :class="iconRight" />
  </button>
</template>
