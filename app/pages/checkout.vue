<script setup lang="ts">
import { useCartStore } from '~/features/cart/store/cart.store'

definePageMeta({
  middleware: 'auth'
})

useHead({
  title: 'HEat - Confirmar Pedido'
})

const supabase = useSupabaseClient()
const user = useSupabaseUser()
const cartStore = useCartStore()
const router = useRouter()

const isSubmitting = ref(false)
const error = ref('')

const deliveryInfo = ref({
  name: user.value?.user_metadata?.full_name || '',
  phone: user.value?.phone || '',
  address: '',
  notes: ''
})

const submitOrder = async () => {
  if (!user.value) {
    navigateTo('/auth')
    return
  }

  if (cartStore.isEmpty) {
    router.push('/')
    return
  }

  isSubmitting.value = true
  error.value = ''

  try {
    // Create order
    const { data: order, error: orderError } = await supabase
      .from('orders')
      .insert({
        user_id: user.value.id,
        total: cartStore.total,
        notes: deliveryInfo.value.notes || null
      })
      .select('id, plate_code')
      .single()

    if (orderError) throw orderError

    // Create order items
    const orderItems = cartStore.items.map(item => ({
      order_id: order.id,
      product_id: item.productId,
      quantity: item.quantity,
      selected_options: item.selectedOptions,
      subtotal: (item.basePrice + item.selectedOptions.reduce((sum, opt) => sum + opt.priceModifier, 0)) * item.quantity
    }))

    const { error: itemsError } = await supabase
      .from('order_items')
      .insert(orderItems)

    if (itemsError) throw itemsError

    // Clear cart and redirect
    cartStore.clearCart()
    
    // Show success and redirect to history
    navigateTo(`/historial?success=${order.plate_code}`)
  } catch (e: any) {
    error.value = e.message || 'Error al crear el pedido'
    console.error('Order error:', e)
  } finally {
    isSubmitting.value = false
  }
}
</script>

<template>
  <div class="max-w-2xl mx-auto">
    <!-- Header -->
    <div class="mb-8">
      <NuxtLink to="/carrito" class="text-heat-orange text-sm font-semibold hover:underline mb-4 inline-flex items-center gap-1">
        <span class="i-lucide-chevron-left" />
        Volver al carrito
      </NuxtLink>
      <h1 class="text-3xl font-extrabold text-heat-black">
        Confirmar Pedido
      </h1>
    </div>
    
    <!-- Error Message -->
    <div 
      v-if="error"
      class="mb-6 p-4 rounded-gummy bg-red-50 text-red-600 flex items-center gap-2"
    >
      <span class="i-lucide-alert-circle text-lg" />
      {{ error }}
    </div>
    
    <!-- Order Summary -->
    <GummyCard padding="lg" class="mb-6">
      <h2 class="font-bold text-heat-black mb-4">Resumen del Pedido</h2>
      
      <div class="space-y-3 mb-4">
        <div 
          v-for="item in cartStore.items"
          :key="item.id"
          class="flex justify-between text-sm"
        >
          <div>
            <span class="font-semibold">{{ item.quantity }}x</span>
            <span class="ml-2">{{ item.productName }}</span>
            <p v-if="item.selectedOptions.length > 0" class="text-xs text-heat-gray-dark ml-5">
              {{ item.selectedOptions.map(o => o.name).join(', ') }}
            </p>
          </div>
        </div>
      </div>
      
      <hr class="border-heat-gray-medium/30 my-4" />
      
      <div class="flex justify-between text-lg">
        <span class="font-bold">Total a Pagar</span>
        <span class="font-extrabold text-heat-orange">{{ cartStore.formattedTotal }}</span>
      </div>
    </GummyCard>
    
    <!-- Delivery Info -->
    <GummyCard padding="lg" class="mb-6">
      <h2 class="font-bold text-heat-black mb-4">Información de Entrega</h2>
      
      <form class="space-y-4" @submit.prevent="submitOrder">
        <div>
          <label class="block text-sm font-semibold text-heat-black mb-2">
            Nombre
          </label>
          <input 
            v-model="deliveryInfo.name"
            type="text"
            required
            class="w-full px-4 py-3 rounded-gummy bg-heat-gray-soft border border-heat-gray-medium/50 focus:border-heat-orange focus:ring-2 focus:ring-heat-orange/20 transition-all outline-none"
            placeholder="Tu nombre"
          />
        </div>
        
        <div>
          <label class="block text-sm font-semibold text-heat-black mb-2">
            Teléfono
          </label>
          <input 
            v-model="deliveryInfo.phone"
            type="tel"
            required
            class="w-full px-4 py-3 rounded-gummy bg-heat-gray-soft border border-heat-gray-medium/50 focus:border-heat-orange focus:ring-2 focus:ring-heat-orange/20 transition-all outline-none"
            placeholder="+57 314-368-6786"
          />
        </div>
        
        <div>
          <label class="block text-sm font-semibold text-heat-black mb-2">
            Dirección <span class="text-heat-gray-dark font-normal">(opcional)</span>
          </label>
          <textarea 
            v-model="deliveryInfo.address"
            rows="2"
            class="w-full px-4 py-3 rounded-gummy bg-heat-gray-soft border border-heat-gray-medium/50 focus:border-heat-orange focus:ring-2 focus:ring-heat-orange/20 transition-all outline-none resize-none"
            placeholder="Tu dirección"
          />
        </div>
        
        <div>
          <label class="block text-sm font-semibold text-heat-black mb-2">
            Notas adicionales <span class="text-heat-gray-dark font-normal">(opcional)</span>
          </label>
          <textarea 
            v-model="deliveryInfo.notes"
            rows="2"
            class="w-full px-4 py-3 rounded-gummy bg-heat-gray-soft border border-heat-gray-medium/50 focus:border-heat-orange focus:ring-2 focus:ring-heat-orange/20 transition-all outline-none resize-none"
            placeholder="Instrucciones especiales, alergias, etc."
          />
        </div>
        
        <GummyButton 
          type="submit"
          variant="primary"
          size="lg"
          class="w-full mt-6"
          :loading="isSubmitting"
          :disabled="cartStore.isEmpty"
        >
          <span class="i-lucide-check mr-2" />
          Confirmar Pedido
        </GummyButton>
      </form>
    </GummyCard>
    
    <!-- Payment Note -->
    <p class="text-center text-sm text-heat-gray-dark">
      El pago se realiza al momento de la entrega
    </p>
  </div>
</template>

