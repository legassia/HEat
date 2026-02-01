<script setup lang="ts">
import { toast } from 'vue-sonner'
import { useCartStore } from '~/features/cart/store/cart.store'
import { useProfile } from '~/features/user/composables/useProfile'
import { useDeliveryMode, type DeliveryMode } from '~/features/cart/composables/useDeliveryMode'
import DeliveryModeSelector from '~/features/cart/components/DeliveryModeSelector.vue'

definePageMeta({
  middleware: 'auth'
})

useHead({
  title: 'HEat - Confirmar Pedido'
})

const isUUID = (str: string) => /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(str)

const user = useSupabaseUser()
const supabase = useSupabaseClient<any>()
const cartStore = useCartStore()
const router = useRouter()
const { profile, fetchProfile } = useProfile()

// Delivery mode
const {
  mode,
  tableNumber,
  pickupTime,
  pickupNotes,
  deliveryAddress,
  deliveryNotes,
  deliveryFee,
  isValid: isDeliveryValid,
  buildOrderNotes,
  setMode,
  setTable,
  loadFromProfile
} = useDeliveryMode()

const isSubmitting = ref(false)
const error = ref('')
const additionalNotes = ref('')

// Auto-load profile data
onMounted(async () => {
  await fetchProfile()
  if (profile.value?.address) {
    loadFromProfile(profile.value)
  }
})

// Total with delivery fee
const totalWithDelivery = computed(() => cartStore.total + deliveryFee.value)
const formattedTotal = computed(() => 
  new Intl.NumberFormat('es-CO', { style: 'currency', currency: 'COP', minimumFractionDigits: 0 })
    .format(totalWithDelivery.value)
)

// Check if can submit
const canSubmit = computed(() => {
  if (cartStore.isEmpty) return false
  if (!isDeliveryValid.value) return false
  if (!profile.value?.phone) return false
  return true
})

const submitOrder = async () => {
  if (!user.value) {
    navigateTo('/auth')
    return
  }

  if (!canSubmit.value) {
    if (!profile.value?.phone) {
      toast.error('Teléfono requerido', {
        description: 'Por favor completa tu perfil con tu número de teléfono'
      })
      navigateTo('/perfil')
    }
    return
  }

  isSubmitting.value = true
  error.value = ''

  try {
    // Build complete notes
    const notesParts = [buildOrderNotes.value]
    if (additionalNotes.value) {
      notesParts.push(`📝 ${additionalNotes.value}`)
    }
    const finalNotes = notesParts.filter(Boolean).join('\n')

    // Create order
    const { data: order, error: orderError } = await supabase
      .from('orders')
      .insert({
        user_id: user.value!.id,
        total: totalWithDelivery.value,
        notes: finalNotes || null
      })
      .select('id, plate_code')
      .single()

    if (orderError) throw orderError

    const orderItems = cartStore.items.map(item => ({
      order_id: order.id,
      product_id: isUUID(item.productId) ? item.productId : null,
      quantity: item.quantity,
      selected_options: item.selectedOptions,
      subtotal: (item.basePrice + item.selectedOptions.reduce((sum: number, opt) => sum + opt.priceModifier, 0)) * item.quantity
    }))

    const { error: itemsError } = await supabase
      .from('order_items')
      .insert(orderItems)

    if (itemsError) throw itemsError

    // Clear cart and show success
    cartStore.clearCart()

    toast.success(`¡Pedido ${order.plate_code} confirmado!`, {
      description: 'Tu pedido está siendo preparado',
      duration: 4000
    })

    navigateTo(`/historial?success=${order.plate_code}`)
  } catch (e: any) {
    const errorMsg = e.message || 'Error al crear el pedido'
    error.value = errorMsg

    toast.error('Error al procesar pedido', {
      description: errorMsg,
      duration: 5000
    })

    console.error('Order error:', e)
  } finally {
    isSubmitting.value = false
  }
}
</script>

<template>
  <div class="max-w-2xl mx-auto">
    <!-- Header -->
    <div class="mb-6">
      <NuxtLink 
        to="/"
        class="text-heat-orange text-sm font-semibold hover:underline mb-4 inline-flex items-center gap-1"
      >
        <span class="i-lucide-chevron-left" />
        Volver al menú
      </NuxtLink>
      <h1 class="text-2xl font-extrabold text-heat-black">
        Confirmar Pedido
      </h1>
    </div>

    <!-- Error Message -->
    <div v-if="error" class="mb-6 p-4 rounded-gummy bg-red-50 text-red-600 flex items-center gap-2">
      <span class="i-lucide-alert-circle text-lg" />
      {{ error }}
    </div>

    <!-- Delivery Mode Selection -->
    <GummyCard padding="lg" class="mb-6">
      <h2 class="font-bold text-heat-black mb-4 flex items-center gap-2">
        <span class="i-lucide-map-pin text-heat-orange" />
        ¿Cómo lo quieres?
      </h2>
      
      <DeliveryModeSelector
        :mode="mode"
        :table-number="tableNumber"
        :delivery-address="deliveryAddress"
        :pickup-time="pickupTime"
        :pickup-notes="pickupNotes"
        :delivery-notes="deliveryNotes"
        @update:mode="setMode"
        @update:table-number="setTable"
        @update:delivery-address="deliveryAddress = $event"
        @update:pickup-time="pickupTime = $event"
        @update:pickup-notes="pickupNotes = $event"
        @update:delivery-notes="deliveryNotes = $event"
      />
    </GummyCard>

    <!-- Order Summary (Compact) -->
    <GummyCard padding="lg" class="mb-6">
      <div class="flex items-center justify-between mb-4">
        <h2 class="font-bold text-heat-black flex items-center gap-2">
          <span class="i-lucide-shopping-bag text-heat-orange" />
          Tu Pedido
        </h2>
        <span class="text-sm text-heat-gray-dark">{{ cartStore.itemCount }} items</span>
      </div>

      <!-- Items (compact list) -->
      <div class="space-y-2 mb-4">
        <div 
          v-for="item in cartStore.items" 
          :key="item.id" 
          class="flex items-start gap-2 text-sm"
        >
          <span class="text-heat-orange font-bold">{{ item.quantity }}×</span>
          <div class="flex-1">
            <span class="text-heat-black">{{ item.productName }}</span>
            <p v-if="item.selectedOptions.length > 0" class="text-xs text-heat-gray-dark">
              {{ item.selectedOptions.map(o => o.name).join(', ') }}
            </p>
          </div>
        </div>
      </div>

      <!-- Totals -->
      <div class="pt-4 border-t border-heat-gray-medium/30 space-y-2">
        <div class="flex justify-between text-sm text-heat-gray-dark">
          <span>Subtotal</span>
          <span>{{ cartStore.formattedSubtotal }}</span>
        </div>
        <div v-if="deliveryFee > 0" class="flex justify-between text-sm text-heat-gray-dark">
          <span>Envío</span>
          <span>{{ new Intl.NumberFormat('es-CO', { style: 'currency', currency: 'COP', minimumFractionDigits: 0 }).format(deliveryFee) }}</span>
        </div>
        <div v-else class="flex justify-between text-sm text-green-600">
          <span>Envío</span>
          <span class="font-semibold">Gratis</span>
        </div>
        <div class="flex justify-between text-lg font-bold pt-2">
          <span>Total</span>
          <span class="text-heat-orange">{{ formattedTotal }}</span>
        </div>
      </div>
    </GummyCard>

    <!-- Additional Notes -->
    <GummyCard padding="lg" class="mb-6">
      <h2 class="font-bold text-heat-black mb-4 flex items-center gap-2">
        <span class="i-lucide-message-square text-heat-orange" />
        Notas adicionales
        <span class="text-heat-gray-dark font-normal text-sm">(opcional)</span>
      </h2>
      <textarea
        v-model="additionalNotes"
        rows="2"
        class="w-full px-4 py-3 rounded-gummy bg-heat-gray-soft border border-heat-gray-medium/50 focus:border-heat-orange focus:ring-2 focus:ring-heat-orange/20 transition-all outline-none resize-none"
        placeholder="Alergias, instrucciones especiales, etc."
      />
    </GummyCard>

    <!-- Contact Info (from profile) -->
    <GummyCard v-if="profile" padding="lg" class="mb-6">
      <div class="flex items-center justify-between mb-4">
        <h2 class="font-bold text-heat-black flex items-center gap-2">
          <span class="i-lucide-user text-heat-orange" />
          Contacto
        </h2>
        <NuxtLink 
          to="/perfil"
          class="text-sm text-heat-orange hover:underline flex items-center gap-1"
        >
          <span class="i-lucide-edit text-sm" />
          Editar
        </NuxtLink>
      </div>
      
      <div class="space-y-2 text-sm">
        <div class="flex items-center gap-2">
          <span class="i-lucide-user text-heat-gray-medium" />
          <span>{{ profile.name || 'Sin nombre' }}</span>
        </div>
        <div class="flex items-center gap-2">
          <span class="i-lucide-phone text-heat-gray-medium" />
          <span :class="profile.phone ? '' : 'text-red-500'">
            {{ profile.phone || '⚠️ Teléfono requerido' }}
          </span>
        </div>
      </div>
    </GummyCard>

    <!-- Submit Button -->
    <GummyButton
      type="button"
      variant="primary"
      size="lg"
      class="w-full"
      :loading="isSubmitting"
      :disabled="!canSubmit"
      @click="submitOrder"
    >
      <span class="i-lucide-check mr-2" />
      Confirmar Pedido
    </GummyButton>

    <!-- Validation hints -->
    <div v-if="!canSubmit" class="mt-4 text-center text-sm text-heat-gray-dark">
      <p v-if="!isDeliveryValid && mode === 'local'">
        <span class="i-lucide-info text-heat-orange" />
        Selecciona una mesa para continuar
      </p>
      <p v-else-if="!isDeliveryValid && mode === 'delivery'">
        <span class="i-lucide-info text-heat-orange" />
        Ingresa tu dirección para continuar
      </p>
      <p v-else-if="!profile?.phone">
        <span class="i-lucide-info text-heat-orange" />
        Completa tu perfil con tu teléfono
      </p>
    </div>

    <!-- Payment Note -->
    <p class="text-center text-sm text-heat-gray-dark mt-6">
      El pago se realiza al momento de la entrega
    </p>
  </div>
</template>
