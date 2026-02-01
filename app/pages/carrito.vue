<script setup lang="ts">
import { useCartStore } from '~/features/cart/store/cart.store'
import { useDeliveryStore } from '~/features/cart/stores/delivery.store'
import { useProfile } from '~/features/user/composables/useProfile'
import CartItem from '~/features/cart/components/CartItem.vue'
import DeliveryModeSelector from '~/features/cart/components/DeliveryModeSelector.vue'

useHead({
  title: 'HEat - Carrito'
})

const cartStore = useCartStore()
const deliveryStore = useDeliveryStore()
const router = useRouter()
const { profile, fetchProfile } = useProfile()

// Load profile on mount
onMounted(async () => {
  await fetchProfile()
  if (profile.value?.address) {
    deliveryStore.loadFromProfile(profile.value)
  }
})

// Redirect to home if cart is empty
watch(() => cartStore.isEmpty, (isEmpty) => {
  if (isEmpty) {
    router.push('/')
  }
})

// Total with delivery
const totalWithDelivery = computed(() => cartStore.total + deliveryStore.deliveryFee)
const formattedTotal = computed(() => 
  new Intl.NumberFormat('es-CO', { style: 'currency', currency: 'COP', minimumFractionDigits: 0 })
    .format(totalWithDelivery.value)
)

const proceedToCheckout = () => {
  if (!deliveryStore.isValid) return
  navigateTo('/checkout')
}
</script>

<template>
  <div class="max-w-2xl mx-auto">
    <!-- Header -->
    <div class="flex items-center justify-between mb-6">
      <div>
        <h1 class="text-2xl font-extrabold text-heat-black mb-1">
          Tu Carrito
        </h1>
        <p class="text-heat-gray-dark text-sm">
          {{ cartStore.itemCount }} {{ cartStore.itemCount === 1 ? 'producto' : 'productos' }}
        </p>
      </div>

      <button 
        v-if="!cartStore.isEmpty" 
        class="flex items-center gap-1.5 text-sm text-heat-gray-dark hover:text-red-500 hover:bg-red-50 px-3 py-1.5 rounded-gummy transition-colors"
        @click="cartStore.clearCart"
      >
        <span class="i-lucide-trash-2" />
        Vaciar
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

    <!-- Cart Content -->
    <template v-else>
      <!-- Cart Items -->
      <div class="space-y-3 mb-6">
        <CartItem v-for="item in cartStore.items" :key="item.id" :item="item" />
      </div>

      <!-- Delivery Mode Selection -->
      <GummyCard padding="lg" class="mb-6">
        <h2 class="font-bold text-heat-black mb-4 flex items-center gap-2">
          <span class="i-lucide-map-pin text-heat-orange" />
          ¿Cómo lo quieres?
        </h2>
        
        <DeliveryModeSelector
          :mode="deliveryStore.mode"
          :selected-tables="deliveryStore.tablesSet"
          :delivery-address="deliveryStore.deliveryAddress"
          :pickup-time="deliveryStore.pickupTime"
          :pickup-notes="deliveryStore.pickupNotes"
          :delivery-notes="deliveryStore.deliveryNotes"
          @update:mode="deliveryStore.setMode"
          @toggle-table="deliveryStore.toggleTable"
          @update:delivery-address="deliveryStore.deliveryAddress = $event"
          @update:pickup-time="deliveryStore.pickupTime = $event"
          @update:pickup-notes="deliveryStore.pickupNotes = $event"
          @update:delivery-notes="deliveryStore.deliveryNotes = $event"
        />
      </GummyCard>

      <!-- Order Summary -->
      <GummyCard padding="lg" class="mb-6">
        <h3 class="font-bold text-heat-black mb-4">Resumen</h3>

        <div class="space-y-2">
          <div class="flex justify-between text-sm text-heat-gray-dark">
            <span>Subtotal</span>
            <span>{{ cartStore.formattedSubtotal }}</span>
          </div>

          <div v-if="deliveryStore.deliveryFee > 0" class="flex justify-between text-sm text-heat-gray-dark">
            <span>Envío</span>
            <span>{{ new Intl.NumberFormat('es-CO', { style: 'currency', currency: 'COP', minimumFractionDigits: 0 }).format(deliveryStore.deliveryFee) }}</span>
          </div>
          <div v-else class="flex justify-between text-sm text-green-600">
            <span>Envío</span>
            <span class="font-medium">Gratis</span>
          </div>

          <hr class="border-heat-gray-medium/30 my-2" />

          <div class="flex justify-between text-lg">
            <span class="font-bold">Total</span>
            <span class="font-extrabold text-heat-orange">{{ formattedTotal }}</span>
          </div>
        </div>
      </GummyCard>

      <!-- Checkout Button -->
      <GummyButton 
        variant="primary" 
        size="lg" 
        class="w-full" 
        :disabled="!deliveryStore.isValid"
        @click="proceedToCheckout"
      >
        Generar Orden
        <span class="i-lucide-arrow-right ml-2" />
      </GummyButton>

      <!-- Validation hint -->
      <p v-if="!deliveryStore.isValid" class="text-center text-sm text-heat-gray-dark mt-3">
        <span class="i-lucide-info text-heat-orange" />
        <span v-if="deliveryStore.mode === 'local'">Selecciona al menos una mesa</span>
        <span v-else-if="deliveryStore.mode === 'delivery'">Ingresa tu dirección de entrega</span>
      </p>

      <!-- Continue Shopping -->
      <NuxtLink 
        to="/"
        class="block text-center text-sm text-heat-gray-dark hover:text-heat-orange transition-colors mt-4"
      >
        ← Continuar comprando
      </NuxtLink>
    </template>
  </div>
</template>
