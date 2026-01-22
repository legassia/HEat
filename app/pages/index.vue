<script setup lang="ts">
import ProductCarousel from '~/features/home/components/ProductCarousel.vue'
import CategoryTabs from '~/features/home/components/CategoryTabs.vue'
import ProductConfigurator from '~/features/home/components/ProductConfigurator.vue'
import type { Product } from '~/features/home/types/product.types'

// SEO
useHead({
  title: 'HEat - Inicio'
})

// Mock categories
const categories = [
  { id: 'arepas', name: 'Arepas', icon: '🫓', description: 'Personaliza tu arepa perfecta' },
  { id: 'perros', name: 'Perros', icon: '🌭', description: 'Hot dogs con todo' },
  { id: 'hamburguesas', name: 'Hamburguesas', icon: '🍔', description: 'Jugosas y deliciosas' }
]

const selectedCategory = ref('arepas')

// Product configurator state
const isConfiguratorOpen = ref(false)
const selectedProduct = ref<Product | null>(null)

const openConfigurator = (product: Product) => {
  selectedProduct.value = product
  isConfiguratorOpen.value = true
}

const closeConfigurator = () => {
  isConfiguratorOpen.value = false
}
</script>

<template>
  <div class="space-y-8">
    <!-- Hero Section -->
    <section class="relative overflow-hidden rounded-gummy-xl gradient-orange p-8 lg:p-12">
      <!-- Background decoration -->
      <div class="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full -translate-y-1/2 translate-x-1/2" />
      <div class="absolute bottom-0 left-0 w-48 h-48 bg-white/10 rounded-full translate-y-1/2 -translate-x-1/2" />
      
      <div class="relative z-10 flex flex-col lg:flex-row items-center gap-8">
        <div class="flex-1 text-center lg:text-left">
          <h1 class="text-3xl lg:text-5xl font-extrabold text-white mb-4">
            ¡Bienvenido a 
            <span class="text-heat-cyan">HEat</span>!
          </h1>
          <p class="text-white/90 text-lg mb-6">
            Arma tu comida perfecta. Arepas, perros y hamburguesas 
            <br class="hidden lg:block" />
            con los ingredientes que tú elijas.
          </p>
          <GummyButton variant="cyan" size="lg" icon-right="i-lucide-chevron-right">
            Ver Menú
          </GummyButton>
        </div>
        
        <!-- Hero Image Placeholder -->
        <div class="w-48 h-48 lg:w-64 lg:h-64 rounded-full bg-white/20 flex items-center justify-center animate-float">
          <span class="text-7xl lg:text-8xl">🍔</span>
        </div>
      </div>
    </section>
    
    <!-- Categories -->
    <section>
      <h2 class="text-2xl font-bold text-heat-black mb-6">
        ¿Qué se te antoja hoy?
      </h2>
      
      <CategoryTabs 
        :categories="categories"
        v-model="selectedCategory"
      />
    </section>
    
    <!-- Product Carousel per Category -->
    <section v-for="category in categories" :key="category.id">
      <ProductCarousel 
        :category-id="category.id"
        :category-name="category.name"
        :category-icon="category.icon"
        @customize="openConfigurator"
      />
    </section>
    
    <!-- Product Configurator Modal -->
    <ProductConfigurator 
      :product="selectedProduct"
      :is-open="isConfiguratorOpen"
      @close="closeConfigurator"
    />
    
    <!-- CTA Section -->
    <section class="card-gummy gummy-3d text-center py-8">
      <h3 class="text-xl font-bold text-heat-black mb-2">
        ¿Primera vez aquí?
      </h3>
      <p class="text-heat-gray-dark mb-4">
        Regístrate y recibe ofertas exclusivas
      </p>
      <GummyButton variant="primary">
        Crear Cuenta
      </GummyButton>
    </section>
  </div>
</template>

