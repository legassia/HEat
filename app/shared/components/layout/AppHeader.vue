<script setup lang="ts">
import { useCartStore } from '~/features/cart/store/cart.store'

const user = useSupabaseUser()
const cartStore = useCartStore()
</script>

<template>
  <header 
    class="fixed top-0 left-[var(--sidenav-width)] right-0 h-[var(--nav-height)] bg-heat-white/80 backdrop-blur-md z-40 border-b border-heat-gray-medium/30"
  >
    <div class="h-full max-w-7xl mx-auto px-6 flex items-center justify-between">
      <!-- Logo -->
      <NuxtLink to="/" class="flex items-center gap-3">
        <div class="w-10 h-10 rounded-gummy gradient-orange flex items-center justify-center shadow-gummy">
          <span class="text-white text-xl font-extrabold">A</span>
        </div>
        <span class="text-2xl font-extrabold gradient-text">ArePaisas</span>
      </NuxtLink>
      
      <!-- Search (future feature) -->
      <div class="flex-1 max-w-md mx-8">
        <div class="relative">
          <input 
            type="search"
            placeholder="Buscar productos..."
            class="w-full px-5 py-2.5 rounded-gummy bg-heat-gray-soft border border-heat-gray-medium/50 focus:border-heat-orange focus:ring-2 focus:ring-heat-orange/20 transition-all outline-none"
          />
        </div>
      </div>
      
      <!-- User Actions -->
      <div class="flex items-center gap-4">
        <!-- Cart Button -->
        <button 
          class="relative p-3 rounded-gummy bg-heat-gray-soft hover:bg-heat-orange/10 transition-colors gummy-press"
          aria-label="Ver carrito"
          @click="cartStore.openDrawer()"
        >
          <span class="i-lucide-shopping-cart text-xl text-heat-gray-dark" />
          <!-- Badge -->
          <span 
            v-if="cartStore.itemCount > 0"
            class="absolute -top-1 -right-1 w-5 h-5 rounded-full gradient-orange text-white text-xs font-bold flex items-center justify-center"
          >
            {{ cartStore.itemCount > 99 ? '99+' : cartStore.itemCount }}
          </span>
        </button>
        
        <!-- User Avatar -->
        <NuxtLink 
          to="/perfil"
          class="w-10 h-10 rounded-full bg-heat-cyan overflow-hidden border-2 border-heat-cyan shadow-gummy-cyan gummy-press"
        >
          <img 
            v-if="user?.user_metadata?.avatar_url"
            :src="user.user_metadata.avatar_url"
            :alt="user.user_metadata?.full_name || 'Usuario'"
            class="w-full h-full object-cover"
          />
          <div v-else class="w-full h-full flex items-center justify-center">
            <span class="i-lucide-user text-white text-lg" />
          </div>
        </NuxtLink>
      </div>
    </div>
  </header>
</template>

