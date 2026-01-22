<script setup lang="ts">
import { gsap } from 'gsap'
import { useCartStore } from '~/features/cart/store/cart.store'
import type { Product } from '../types/product.types'
import { useProductConfigurator } from '../composables/useProductConfigurator'
import ProductPreview from './ProductPreview.vue'
import ConfiguratorOptions from './ConfiguratorOptions.vue'

const props = defineProps<{
  product: Product | null
  isOpen: boolean
}>()

const emit = defineEmits<{
  close: []
}>()

const cartStore = useCartStore()
const previewRef = ref<InstanceType<typeof ProductPreview>>()
const modalRef = ref<HTMLElement>()

const productRef = toRef(props, 'product')
const {
  selectedOptions,
  groupedOptions,
  formattedPrice,
  toggleOption,
  getSelectedOptionsArray
} = useProductConfigurator(productRef)

const handleToggle = (optionId: string) => {
  const wasSelected = selectedOptions.value.has(optionId)
  toggleOption(optionId)
  
  if (wasSelected) {
    previewRef.value?.animateRemove(optionId)
  } else {
    previewRef.value?.animateAdd(optionId)
  }
}

const addToCart = () => {
  if (!props.product) return
  
  const selectedOpts = getSelectedOptionsArray()
  
  cartStore.addItem({
    productId: props.product.id,
    productName: props.product.name,
    basePrice: props.product.basePrice,
    selectedOptions: selectedOpts.map(opt => ({
      id: opt.id,
      name: opt.name,
      priceModifier: opt.priceModifier
    })),
    imageUrl: props.product.imageUrl
  })
  
  emit('close')
}

watch(() => props.isOpen, (isOpen) => {
  if (isOpen && modalRef.value) {
    gsap.fromTo(modalRef.value, 
      { opacity: 0, y: 50, scale: 0.9 },
      { opacity: 1, y: 0, scale: 1, duration: 0.4, ease: 'back.out(1.7)' }
    )
  }
})
</script>

<template>
  <Teleport to="body">
    <Transition name="fade">
      <div 
        v-if="isOpen && product"
        class="fixed inset-0 bg-black/50 backdrop-blur-sm z-50"
        @click="emit('close')"
      />
    </Transition>
    
    <Transition name="modal">
      <div 
        v-if="isOpen && product"
        class="fixed inset-0 z-50 flex items-center justify-center p-4 pointer-events-none"
      >
        <div 
          ref="modalRef"
          class="bg-heat-white rounded-gummy-xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-hidden flex flex-col pointer-events-auto"
        >
          <header class="p-6 border-b border-heat-gray-medium/30 flex items-center justify-between">
            <div>
              <h2 class="text-2xl font-bold text-heat-black">{{ product.name }}</h2>
              <p class="text-heat-gray-dark text-sm">Personaliza tu pedido</p>
            </div>
            <button 
              class="w-10 h-10 rounded-gummy bg-heat-gray-soft flex items-center justify-center hover:bg-heat-orange/10 transition-colors gummy-press"
              @click="emit('close')"
            >
              <span class="i-lucide-x text-xl text-heat-gray-dark" />
            </button>
          </header>
          
          <div class="flex-1 overflow-y-auto p-6">
            <div class="grid gap-6 lg:grid-cols-2">
              <div class="order-1 lg:order-2">
                <ProductPreview 
                  ref="previewRef"
                  :product="product"
                  :selected-options="Array.from(selectedOptions)"
                />
              </div>
              
              <div class="order-2 lg:order-1">
                <ConfiguratorOptions
                  :grouped-options="groupedOptions"
                  :selected-options="selectedOptions"
                  @toggle="handleToggle"
                />
              </div>
            </div>
          </div>
          
          <footer class="p-6 border-t border-heat-gray-medium/30 bg-heat-gray-soft/50">
            <div class="flex items-center justify-between gap-4">
              <div>
                <span class="text-sm text-heat-gray-dark">Total</span>
                <p class="text-2xl font-extrabold text-heat-orange">{{ formattedPrice }}</p>
              </div>
              
              <GummyButton variant="primary" size="lg" @click="addToCart">
                <span class="i-lucide-shopping-cart mr-2" />
                Agregar al Carrito
              </GummyButton>
            </div>
          </footer>
        </div>
      </div>
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

.modal-enter-active,
.modal-leave-active {
  transition: all 0.3s ease;
}

.modal-enter-from,
.modal-leave-to {
  opacity: 0;
  transform: scale(0.9) translateY(20px);
}
</style>
