<script setup lang="ts">
import { useCartStore } from '~/features/cart/store/cart.store'
import CartItem from '~/features/cart/components/CartItem.vue'

useHead({
  title: 'HEat - Carrito'
})

const cartStore = useCartStore()
const router = useRouter()

// Redirect to home if cart is empty (after checkout or clear)
watch(() => cartStore.isEmpty, (isEmpty) => {
  if (isEmpty) {
    router.push('/')
  }
})

const proceedToCheckout = () => {
  // TODO: Implement checkout flow
  navigateTo('/checkout')
}
</script>

<template>
  <div class="max-w-2xl mx-auto">
    <!-- Header -->
    <div class="flex items-center justify-between mb-8">
      <div>
        <h1 class="text-3xl font-extrabold text-heat-black mb-1">
          Tu Carrito
        </h1>
        <p class="text-heat-gray-dark">
          {{ cartStore.itemCount }} {{ cartStore.itemCount === 1 ? 'producto' : 'productos' }}
        </p>
      </div>

      <button v-if="!cartStore.isEmpty" class="text-sm text-heat-gray-dark hover:text-red-500 transition-colors"
        @click="cartStore.clearCart">
        Vaciar carrito
      </button>
    </div>

    <!-- Empty State -->
    <div v-if="cartStore.isEmpty" class="text-center py-16">
      <div class="w-32 h-32 mx-auto rounded-full bg-heat-gray-soft flex items-center justify-center mb-6">
        <span class="i-lucide-shopping-cart text-5xl text-heat-gray-medium" />
      </div>
      <h2 class="text-xl font-bold text-heat-black mb-2">
        Tu carrito está vacío
      </h2>
      <p class="text-heat-gray-dark mb-6">
        ¡Explora nuestro menú y agrega algo delicioso!
      </p>
      <GummyButton variant="primary" @click="router.push('/')">
        Ver Menú
      </GummyButton>
    </div>

    <!-- Cart Items -->
    <template v-else>
      <div class="space-y-4 mb-8">
        <CartItem v-for="item in cartStore.items" :key="item.id" :item="item" />
      </div>

      <!-- Order Summary -->
      <GummyCard padding="lg" class="mb-6">
        <h3 class="font-bold text-heat-black mb-4">Resumen del Pedido</h3>

        <div class="space-y-3">
          <div class="flex justify-between text-sm">
            <span class="text-heat-gray-dark">Subtotal</span>
            <span class="font-semibold">{{ cartStore.formattedSubtotal }}</span>
          </div>

          <div class="flex justify-between text-sm">
            <span class="text-heat-gray-dark">Envío</span>
            <span class="font-semibold text-green-600">Gratis</span>
          </div>

          <hr class="border-heat-gray-medium/30" />

          <div class="flex justify-between text-lg">
            <span class="font-bold">Total</span>
            <span class="font-extrabold text-heat-gray-dark">{{ cartStore.formattedTotal }}</span>
          </div>
        </div>
      </GummyCard>

      <!-- Checkout Button -->
      <GummyButton variant="primary" size="lg" class="w-full" @click="proceedToCheckout">
        Generar Orden
        <span class="i-lucide-chevron-right" />
      </GummyButton>

      <!-- Continue Shopping -->
      <NuxtLink to="/"
        class="block text-center text-sm text-heat-gray-dark hover:text-heat-orange transition-colors mt-4">
        ← Continuar comprando
      </NuxtLink>
    </template>
  </div>
</template>
