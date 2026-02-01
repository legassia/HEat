<script setup lang="ts">
const route = useRoute()

const navItems = [
  { path: '/avisos', label: 'Avisos', icon: 'i-lucide-megaphone' },
  { path: '/', label: 'Inicio', icon: 'i-lucide-home' },
  { path: '/carrito', label: 'Carrito', icon: 'i-lucide-shopping-cart' },
  { path: '/historial', label: 'Historial', icon: 'i-lucide-history' },
  { path: '/perfil', label: 'Perfil', icon: 'i-lucide-user' }
]

const isActive = (path: string) => {
  if (path === '/') return route.path === '/'
  return route.path.startsWith(path)
}
</script>

<template>
  <div class="min-h-[100dvh] bg-heat-gray-soft flex flex-col">
    <!-- Header (Desktop only) -->
    <AppHeader class="hidden lg:flex" />
    
    <!-- Main Layout -->
    <div class="flex flex-1">
      <!-- SideNav (Desktop only) -->
      <SideNav 
        :items="navItems" 
        :is-active="isActive"
        class="hidden lg:flex" 
      />
      
      <!-- Main Content -->
      <main 
        class="flex-1 pb-[var(--bottom-nav-height)] lg:pb-0 lg:ml-[var(--sidenav-width)] lg:pt-[var(--nav-height)]"
      >
        <div class="max-w-7xl mx-auto px-4 py-6 lg:px-8">
          <slot />
        </div>
      </main>
    </div>
    
    <!-- BottomNav (Mobile only) -->
    <BottomNav 
      :items="navItems" 
      :is-active="isActive"
      class="lg:hidden" 
    />
    
    <!-- Footer (Desktop only) -->
    <AppFooter class="hidden lg:block lg:ml-[var(--sidenav-width)]" />
    
    <!-- Cart Drawer -->
    <CartDrawer />
  </div>
</template>
