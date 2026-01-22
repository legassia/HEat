<script setup lang="ts">
defineProps<{
  title: string
  icon: string
  type?: 'info' | 'promo' | 'alert'
}>()
</script>

<template>
  <GummyCard padding="lg" hoverable>
    <div class="flex items-start gap-4">
      <div 
        class="w-12 h-12 rounded-gummy flex items-center justify-center shrink-0"
        :class="type === 'promo' ? 'gradient-orange' : type === 'alert' ? 'bg-heat-cyan' : 'bg-heat-gray-soft'"
      >
        <span :class="icon" class="text-xl" :class="type ? 'text-white' : 'text-heat-orange'" />
      </div>
      
      <div class="flex-1">
        <h3 class="font-bold text-heat-black mb-2">{{ title }}</h3>
        <slot />
      </div>
    </div>
  </GummyCard>
</template>

