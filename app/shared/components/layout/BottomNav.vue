<script setup lang="ts">
import { useCartStore } from '~/features/cart/store/cart.store'

interface NavItem {
  path: string
  label: string
  icon: string
}

defineProps<{
  items: NavItem[]
  isActive: (path: string) => boolean
}>()

const cartStore = useCartStore()
</script>

<template>
  <nav 
    class="fixed bottom-0 left-0 right-0 h-[var(--bottom-nav-height)] bg-heat-white/95 backdrop-blur-md z-50 border-t border-heat-gray-medium/30 safe-area-bottom"
  >
    <div class="h-full max-w-lg mx-auto px-2 flex items-center justify-around">
      <NuxtLink 
        v-for="item in items" 
        :key="item.path"
        :to="item.path"
        class="nav-item flex-1 gummy-press"
        :class="isActive(item.path) ? 'nav-item-active' : 'nav-item-inactive'"
      >
        <!-- Icon with badge for cart -->
        <div class="relative">
          <span :class="item.icon" class="text-2xl" />
          <span 
            v-if="item.path === '/carrito' && cartStore.itemCount > 0"
            class="absolute -top-1 -right-2 w-4 h-4 rounded-full gradient-orange text-white text-[10px] font-bold flex items-center justify-center"
          >
            {{ cartStore.itemCount > 99 ? '99+' : cartStore.itemCount }}
          </span>
        </div>
        
        <!-- Label -->
        <span 
          class="text-xs font-semibold"
          :class="isActive(item.path) ? 'text-heat-orange' : ''"
        >
          {{ item.label }}
        </span>
        
        <!-- Active indicator -->
        <div 
          v-if="isActive(item.path)"
          class="absolute bottom-0 left-1/2 -translate-x-1/2 w-8 h-1 rounded-full gradient-orange"
        />
      </NuxtLink>
    </div>
  </nav>
</template>

<style scoped>
.safe-area-bottom {
  padding-bottom: env(safe-area-inset-bottom);
}
</style>

