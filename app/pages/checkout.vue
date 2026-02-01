<script setup lang="ts">
import { toast } from 'vue-sonner'
import { useCartStore } from '~/features/cart/store/cart.store'
import { useDeliveryStore, deliveryModeLabels } from '~/features/cart/stores/delivery.store'
import { useProfile } from '~/features/user/composables/useProfile'

definePageMeta({
  middleware: 'auth'
})

useHead({
  title: 'ArePaisas - Confirmar Pedido'
})

const isUUID = (str: string) => /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(str)

const user = useSupabaseUser()
const supabase = useSupabaseClient<any>()
const cartStore = useCartStore()
const deliveryStore = useDeliveryStore()
const { profile, fetchProfile } = useProfile()

const isSubmitting = ref(false)
const error = ref('')
const additionalNotes = ref('')

// Refresh profile on mount to get latest phone/address
onMounted(() => {
  fetchProfile()
})

// Payment info
const NEQUI_NUMBER = '3143686786'
const BANCOLOMBIA_NUMBER = '3143686786'

const formatPhoneDisplay = (num: string) => `${num.slice(0,3)}-${num.slice(3,6)}-${num.slice(6)}`

const copyNumber = async (number: string, label: string) => {
  try {
    await navigator.clipboard.writeText(number)
    toast.success(`Número ${label} copiado`, {
      description: number,
      duration: 2000
    })
  } catch {
    toast.error('No se pudo copiar')
  }
}

// Load profile on mount
onMounted(async () => {
  await fetchProfile()
})

// Redirect if cart is empty
watch(() => cartStore.isEmpty, (isEmpty) => {
  if (isEmpty) {
    navigateTo('/')
  }
}, { immediate: true })

// Total with delivery
const totalWithDelivery = computed(() => cartStore.total + deliveryStore.deliveryFee)
const formattedTotal = computed(() => 
  new Intl.NumberFormat('es-CO', { style: 'currency', currency: 'COP', minimumFractionDigits: 0 })
    .format(totalWithDelivery.value)
)

// Check if can submit
const canSubmit = computed(() => {
  if (cartStore.isEmpty) return false
  if (!deliveryStore.isValid) return false
  if (!profile.value?.phone) return false
  return true
})

// Delivery summary text
const deliverySummary = computed(() => {
  switch (deliveryStore.mode) {
    case 'local':
      const tables = [...deliveryStore.selectedTables].sort((a, b) => a - b).join(', ')
      return `Mesa${deliveryStore.selectedTables.length > 1 ? 's' : ''} ${tables}`
    case 'pickup':
      return deliveryStore.pickupTime ? `Recoger a las ${deliveryStore.pickupTime}` : 'Para recoger'
    case 'delivery':
      return deliveryStore.deliveryAddress || 'Domicilio'
    default:
      return ''
  }
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
    const notesParts = [deliveryStore.buildOrderNotes]
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

    // Clear cart and delivery state
    cartStore.clearCart()
    deliveryStore.reset()

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
        to="/carrito"
        class="text-heat-orange text-sm font-semibold hover:underline mb-4 inline-flex items-center gap-1"
      >
        <span class="i-lucide-chevron-left" />
        Volver al carrito
      </NuxtLink>
      <h1 class="text-2xl font-extrabold text-heat-black">
        Confirmar y Pagar
      </h1>
    </div>

    <!-- Error Message -->
    <div v-if="error" class="mb-6 p-4 rounded-gummy bg-red-50 text-red-600 flex items-center gap-2">
      <span class="i-lucide-alert-circle text-lg" />
      {{ error }}
    </div>

    <!-- Order Summary -->
    <GummyCard padding="lg" class="mb-6">
      <div class="flex items-center justify-between mb-4">
        <h2 class="font-bold text-heat-black flex items-center gap-2">
          <span class="i-lucide-receipt text-heat-orange" />
          Resumen del Pedido
        </h2>
        <NuxtLink to="/carrito" class="text-sm text-heat-orange hover:underline">
          Editar
        </NuxtLink>
      </div>

      <!-- Delivery info -->
      <div class="flex items-center gap-2 p-3 rounded-gummy bg-heat-gray-soft/50 mb-4">
        <span :class="deliveryModeLabels[deliveryStore.mode].icon" class="text-heat-orange" />
        <span class="text-sm font-medium">{{ deliverySummary }}</span>
      </div>

      <!-- Items -->
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

      <!-- Total -->
      <div class="pt-4 border-t border-heat-gray-medium/30">
        <div class="flex justify-between text-lg font-bold">
          <span>Total a Pagar</span>
          <span class="text-heat-orange">{{ formattedTotal }}</span>
        </div>
      </div>
    </GummyCard>

    <!-- Payment Methods -->
    <GummyCard padding="lg" class="mb-6">
      <h2 class="font-bold text-heat-black mb-4 flex items-center gap-2">
        <span class="i-lucide-wallet text-heat-orange" />
        Métodos de Pago
      </h2>

      <div class="space-y-3">
        <!-- Nequi -->
        <button 
          class="w-full p-4 rounded-gummy bg-gradient-to-r from-pink-50 to-purple-50 border border-pink-200 hover:border-pink-400 transition-colors text-left"
          @click="copyNumber(NEQUI_NUMBER, 'Nequi')"
        >
          <div class="flex items-center justify-between">
            <div class="flex items-center gap-3">
              <div class="w-10 h-10 rounded-full bg-gradient-to-br from-pink-500 to-purple-600 flex items-center justify-center">
                <span class="text-white font-bold text-sm">N</span>
              </div>
              <div>
                <p class="font-semibold text-heat-black">Nequi</p>
                <p class="text-sm text-heat-gray-dark">Toca para copiar</p>
              </div>
            </div>
            <div class="flex items-center gap-2">
              <p class="font-mono font-bold text-lg text-pink-600">{{ formatPhoneDisplay(NEQUI_NUMBER) }}</p>
              <span class="i-lucide-copy text-pink-400" />
            </div>
          </div>
        </button>

        <!-- Bancolombia -->
        <button 
          class="w-full p-4 rounded-gummy bg-gradient-to-r from-yellow-50 to-amber-50 border border-yellow-200 hover:border-amber-400 transition-colors text-left"
          @click="copyNumber(BANCOLOMBIA_NUMBER, 'Bancolombia')"
        >
          <div class="flex items-center justify-between">
            <div class="flex items-center gap-3">
              <div class="w-10 h-10 rounded-full bg-gradient-to-br from-yellow-500 to-amber-600 flex items-center justify-center">
                <span class="text-white font-bold text-sm">B</span>
              </div>
              <div>
                <p class="font-semibold text-heat-black">Bancolombia</p>
                <p class="text-sm text-heat-gray-dark">Toca para copiar</p>
              </div>
            </div>
            <div class="flex items-center gap-2">
              <p class="font-mono font-bold text-lg text-amber-600">{{ formatPhoneDisplay(BANCOLOMBIA_NUMBER) }}</p>
              <span class="i-lucide-copy text-amber-400" />
            </div>
          </div>
        </button>

        <!-- Cash -->
        <div class="p-4 rounded-gummy bg-heat-gray-soft/50 border border-heat-gray-medium/30">
          <div class="flex items-center gap-3">
            <div class="w-10 h-10 rounded-full bg-green-500 flex items-center justify-center">
              <span class="i-lucide-banknote text-white text-lg" />
            </div>
            <div>
              <p class="font-semibold text-heat-black">Efectivo</p>
              <p class="text-sm text-heat-gray-dark">Pago al momento de la entrega</p>
            </div>
          </div>
        </div>
      </div>

      <p class="text-xs text-heat-gray-dark mt-4 text-center">
        💡 Si pagas por transferencia, envía el comprobante por WhatsApp
      </p>
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

    <!-- Contact Info -->
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
    <p v-if="!profile?.phone" class="text-center text-sm text-red-500 mt-4">
      <span class="i-lucide-alert-circle" />
      Completa tu perfil con tu teléfono para continuar
    </p>
  </div>
</template>
