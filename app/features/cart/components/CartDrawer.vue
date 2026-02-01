<script setup lang="ts">
import { useCartStore, type CartItem } from '../store/cart.store'

const cartStore = useCartStore()
const isOpen = computed(() => cartStore.isDrawerOpen)

const emit = defineEmits<{
  loadToEditor: [item: CartItem]
}>()

const closeDrawer = () => {
  cartStore.isDrawerOpen = false
}

// Handle load to editor from CartItem
const handleLoadToEditor = (item: CartItem) => {
  emit('loadToEditor', item)
  closeDrawer()
}

// Close on escape
onMounted(() => {
  const handleEscape = (e: KeyboardEvent) => {
    if (e.key === 'Escape' && isOpen.value) {
      closeDrawer()
    }
  }
  window.addEventListener('keydown', handleEscape)
  onUnmounted(() => window.removeEventListener('keydown', handleEscape))
})
</script>

<template>
  <Teleport to="body">
    <!-- Backdrop -->
    <Transition name="fade">
      <div 
        v-if="isOpen"
        class="fixed inset-0 bg-black/40 backdrop-blur-sm z-50"
        @click="closeDrawer"
      />
    </Transition>
    
    <!-- Drawer -->
    <Transition name="slide-right">
      <aside 
        v-if="isOpen"
        class="fixed top-0 right-0 h-screen w-full max-w-md bg-heat-white z-50 shadow-2xl flex flex-col"
      >
        <!-- Header -->
        <header class="h-[var(--nav-height)] px-6 flex items-center justify-between border-b border-heat-gray-medium/30 shrink-0">
          <h2 class="text-xl font-bold flex items-center gap-2">
            <span class="i-lucide-shopping-cart text-heat-orange" />
            Tu Carrito
            <span 
              v-if="cartStore.itemCount > 0"
              class="text-sm font-normal text-heat-gray-dark"
            >
              ({{ cartStore.itemCount }})
            </span>
          </h2>
          <button 
            class="w-10 h-10 rounded-gummy bg-heat-gray-soft flex items-center justify-center hover:bg-heat-orange/10 transition-colors"
            @click="closeDrawer"
            aria-label="Cerrar carrito"
          >
            <span class="i-lucide-x text-xl text-heat-gray-dark" />
          </button>
        </header>
        
        <!-- Content -->
        <div class="flex-1 overflow-y-auto p-4">
          <!-- Empty State -->
          <div 
            v-if="cartStore.items.length === 0"
            class="h-full flex flex-col items-center justify-center text-center"
          >
            <div class="w-20 h-20 rounded-full bg-heat-gray-soft flex items-center justify-center mb-4">
              <span class="i-lucide-shopping-cart text-3xl text-heat-gray-medium" />
            </div>
            <h3 class="text-lg font-bold text-heat-black mb-2">
              Tu carrito está vacío
            </h3>
            <p class="text-heat-gray-dark text-sm mb-6">
              Agrega algunos productos deliciosos
            </p>
            <NuxtLink 
              to="/"
              class="btn-primary"
              @click="closeDrawer"
            >
              Ver Menú
            </NuxtLink>
          </div>
          
          <!-- Cart Items -->
          <div v-else class="space-y-3">
            <CartItem 
              v-for="item in cartStore.items"
              :key="item.id"
              :item="item"
              @load-to-editor="handleLoadToEditor"
            />
          </div>
        </div>
        
        <!-- Footer -->
        <footer 
          v-if="cartStore.items.length > 0"
          class="p-4 border-t border-heat-gray-medium/30 bg-heat-gray-soft/50 shrink-0"
        >
          <!-- Summary (simplified) -->
          <div class="flex items-center justify-between mb-4">
            <div>
              <span class="text-sm text-heat-gray-dark">{{ cartStore.itemCount }} productos</span>
              <p class="text-lg font-bold text-heat-orange">{{ cartStore.formattedTotal }}</p>
            </div>
            <div class="text-right">
              <span class="text-xs text-green-600 font-medium flex items-center gap-1">
                <span class="i-lucide-truck text-sm" />
                Envío gratis en local
              </span>
            </div>
          </div>
          
          <!-- Checkout Button -->
          <NuxtLink 
            to="/checkout"
            class="btn-primary w-full text-center block"
            @click="closeDrawer"
          >
            <span class="i-lucide-arrow-right mr-2" />
            Continuar
          </NuxtLink>
        </footer>
      </aside>
    </Transition>
  </Teleport>
</template>

<style scoped>
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.3s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}

.slide-right-enter-active,
.slide-right-leave-active {
  transition: transform 0.3s ease;
}

.slide-right-enter-from,
.slide-right-leave-to {
  transform: translateX(100%);
}
</style>
