<script setup lang="ts">
interface Props {
  hoverable?: boolean
  clickable?: boolean
  padding?: 'none' | 'sm' | 'md' | 'lg'
}

const props = withDefaults(defineProps<Props>(), {
  hoverable: false,
  clickable: false,
  padding: 'md'
})

const emit = defineEmits<{
  click: [event: MouseEvent]
}>()

const paddingClasses: Record<string, string> = {
  none: '',
  sm: 'p-3',
  md: 'p-4',
  lg: 'p-6'
}

const classes = computed(() => [
  'bg-heat-white rounded-gummy-lg border border-heat-gray-medium/30 transition-all duration-300',
  paddingClasses[props.padding],
  {
    'shadow-gummy-soft': !props.hoverable,
    'shadow-gummy-soft hover:shadow-gummy hover:-translate-y-1': props.hoverable,
    'cursor-pointer gummy-press': props.clickable
  }
])
</script>

<template>
  <div 
    :class="classes"
    @click="clickable ? emit('click', $event) : null"
  >
    <slot />
  </div>
</template>

