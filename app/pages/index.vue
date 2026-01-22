<script setup lang="ts">
import { useProductConfigurator } from '~/features/home/composables/useProductConfigurator'
import HeroSection from '~/features/home/components/HeroSection.vue'
import ProductEditor from '~/features/home/components/ProductEditor.vue'
import QuickPresets from '~/features/home/components/QuickPresets.vue'

useHead({
  title: 'HEat - Sabor Paisa'
})

// Use the product configurator composable
const {
  categories,
  currentCategoryIndex,
  currentCategory,
  currentConfig,
  currentPresets,
  ingredientCounts,
  formattedPrice,
  productName,
  selectedIngredients,
  prevCategory,
  nextCategory,
  resetIngredients,
  addToCart,
  loadPreset,
  quickAddPreset,
  updateIngredient
} = useProductConfigurator()

// Initialize ingredients on mount
onMounted(() => {
  resetIngredients()
})

// Scroll to configurator ref
const editorRef = ref<HTMLElement>()
const scrollToMenu = () => {
  editorRef.value?.scrollIntoView({ behavior: 'smooth' })
}
</script>

<template>
  <div class="space-y-8">
    <!-- Toast Container -->
    <ClientOnly>
      <Toaster position="top-right" :toastOptions="{ style: { background: '#FFFEFA', border: '1px solid #E0E0E0' } }" />
    </ClientOnly>
    
    <!-- Hero Section -->
    <HeroSection @scroll-to-menu="scrollToMenu" />
    
    <!-- Product Editor/Configurator -->
    <div ref="editorRef">
      <ProductEditor
        :category="currentCategory"
        :category-index="currentCategoryIndex"
        :total-categories="categories.length"
        :config="currentConfig"
        :ingredient-counts="ingredientCounts"
        :product-name="productName"
        :formatted-price="formattedPrice"
        :selected-ingredients="selectedIngredients"
        @prev-category="prevCategory"
        @next-category="nextCategory"
        @update-ingredient="updateIngredient"
        @add-to-cart="addToCart"
      />
    </div>
    
    <!-- Quick Presets -->
    <QuickPresets
      :presets="currentPresets"
      :category="currentCategory"
      @load-preset="loadPreset"
      @quick-add="quickAddPreset"
    />
    
    <!-- CTA Section -->
    <section class="bg-heat-white rounded-gummy-xl border border-heat-gray-medium/30 text-center py-8 px-6">
      <h3 class="text-xl font-bold text-heat-black mb-2">
        ¿Primera vez por acá?
      </h3>
      <p class="text-heat-gray-dark mb-4">
        Regístrate y recibe ofertas exclusivas
      </p>
      <GummyButton variant="secondary" @click="navigateTo('/auth')">
        Crear Cuenta
      </GummyButton>
    </section>
  </div>
</template>
