<script setup lang="ts">
const props = defineProps<{
  avatarUrl?: string | null
  displayName: string
  displayEmoji: string
  email: string
}>()
</script>

<template>
  <div class="text-center">
    <div class="relative inline-block">
      <div class="w-28 h-28 rounded-full bg-heat-cyan overflow-hidden border-4 border-heat-cyan shadow-gummy-cyan">
        <!-- Google avatar -->
        <img 
          v-if="avatarUrl"
          :src="avatarUrl"
          :alt="displayName"
          class="w-full h-full object-cover"
        />
        <!-- Emoji avatar (default fallback) -->
        <div 
          v-else 
          class="w-full h-full flex items-center justify-center bg-gradient-to-br from-green to-white"
        >
          <span class="text-7xl">{{ displayEmoji }}</span>
        </div>
      </div>
    </div>
    
    <h2 class="text-2xl font-bold text-heat-black mt-4">
      {{ displayName }}
    </h2>
    <p class="text-heat-gray-dark">
      {{ email }}
    </p>
  </div>
</template>
