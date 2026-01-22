<script setup lang="ts">
interface NavItem {
  path: string
  label: string
  icon: string
}

defineProps<{
  items: NavItem[]
  isActive: (path: string) => boolean
}>()

const isExpanded = ref(false)
</script>

<template>
  <aside 
    class="fixed top-0 left-0 h-screen bg-heat-white z-50 border-r border-heat-gray-medium/30 transition-all duration-300 flex flex-col"
    :class="isExpanded ? 'w-[var(--sidenav-width-expanded)]' : 'w-[var(--sidenav-width)]'"
    @mouseenter="isExpanded = true"
    @mouseleave="isExpanded = false"
  >
    <!-- Logo -->
    <div class="h-[var(--nav-height)] flex items-center justify-center border-b border-heat-gray-medium/30">
      <NuxtLink to="/" class="flex items-center gap-3 overflow-hidden">
        <div class="w-10 h-10 rounded-gummy gradient-orange flex items-center justify-center shadow-gummy shrink-0">
          <span class="text-white text-xl font-extrabold">H</span>
        </div>
        <span 
          v-if="isExpanded" 
          class="text-2xl font-extrabold gradient-text whitespace-nowrap animate-slide-in-right"
        >
          HEat
        </span>
      </NuxtLink>
    </div>
    
    <!-- Navigation -->
    <nav class="flex-1 py-6 px-2">
      <ul class="space-y-2">
        <li v-for="item in items" :key="item.path">
          <NuxtLink 
            :to="item.path"
            class="flex items-center gap-4 px-3 py-3 rounded-gummy transition-all duration-200 gummy-press"
            :class="isActive(item.path) 
              ? 'gradient-orange text-white shadow-gummy' 
              : 'text-heat-gray-dark hover:bg-heat-orange/10 hover:text-heat-orange'"
          >
            <span :class="item.icon" class="text-xl shrink-0" />
            <span 
              v-if="isExpanded"
              class="font-semibold whitespace-nowrap"
            >
              {{ item.label }}
            </span>
          </NuxtLink>
        </li>
      </ul>
    </nav>
    
    <!-- Bottom Actions -->
    <div class="p-4 border-t border-heat-gray-medium/30">
      <button 
        v-if="isExpanded"
        class="w-full btn-cyan text-sm"
      >
        <span class="i-lucide-phone mr-2" />
        Contactar
      </button>
      <button 
        v-else
        class="w-10 h-10 mx-auto rounded-gummy bg-heat-cyan text-white flex items-center justify-center gummy-press"
        aria-label="Contactar"
      >
        <span class="i-lucide-phone text-lg" />
      </button>
    </div>
  </aside>
</template>

