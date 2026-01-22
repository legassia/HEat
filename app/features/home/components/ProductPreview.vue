<script setup lang="ts">
import { gsap } from 'gsap'
import type { Product } from '../types/product.types'

const props = defineProps<{
  product: Product
  selectedOptions: string[]
}>()

// Refs for GSAP animation targets
const containerRef = ref<HTMLElement>()
const baseRef = ref<HTMLElement>()
const ingredientRefs = ref<Map<string, HTMLElement>>(new Map())

// Ingredient visual mapping (for future image layers)
const ingredientVisuals: Record<string, { emoji: string, layer: number, color: string }> = {
  // Arepas
  queso: { emoji: '🧀', layer: 2, color: '#FFD700' },
  jamon: { emoji: '🥓', layer: 3, color: '#FF6B6B' },
  carne: { emoji: '🥩', layer: 4, color: '#8B4513' },
  pollo: { emoji: '🍗', layer: 4, color: '#F4A460' },
  chorizo: { emoji: '🌭', layer: 5, color: '#CD5C5C' },
  aguacate: { emoji: '🥑', layer: 6, color: '#9ACD32' },
  // Perros
  cebolla: { emoji: '🧅', layer: 2, color: '#DDA0DD' },
  papitas: { emoji: '🍟', layer: 3, color: '#FFD700' },
  'jamon-p': { emoji: '🥓', layer: 4, color: '#FF6B6B' },
  'queso-p': { emoji: '🧀', layer: 5, color: '#FFD700' },
  'salsa-tomate': { emoji: '🍅', layer: 6, color: '#FF6347' },
  mostaza: { emoji: '💛', layer: 6, color: '#FFD700' },
  mayonesa: { emoji: '🥛', layer: 6, color: '#FFFACD' },
  // Hamburguesas
//   lechuga: { emoji: '🥬', layer: 2, color: '#90EE90' },
  tomate: { emoji: '🍅', layer: 3, color: '#FF6347' },
  'cebolla-h': { emoji: '🧅', layer: 4, color: '#DDA0DD' },
  'queso-h': { emoji: '🧀', layer: 5, color: '#FFD700' },
  huevo: { emoji: '🍳', layer: 6, color: '#FFF8DC' },
  codorniz: { emoji: '🥚', layer: 7, color: '#F5F5DC' },
  'papitas-h': { emoji: '🍟', layer: 8, color: '#FFD700' },
  tocineta: { emoji: '🥓', layer: 9, color: '#8B0000' }
}

// Product base emoji
const productEmoji = computed(() => {
  return props.product.image || '🍔'
})

// Animation methods exposed for parent component
const animateAdd = (optionId: string) => {
  const el = ingredientRefs.value.get(optionId)
  if (el) {
    gsap.fromTo(el, 
      { scale: 0, opacity: 0, y: -30, rotation: -15 },
      { 
        scale: 1, 
        opacity: 1, 
        y: 0, 
        rotation: 0,
        duration: 0.5, 
        ease: 'elastic.out(1, 0.5)'
      }
    )
  }
  
  // Bounce the container
  if (containerRef.value) {
    gsap.fromTo(containerRef.value,
      { scale: 1 },
      { scale: 1.05, duration: 0.15, yoyo: true, repeat: 1 }
    )
  }
}

const animateRemove = (optionId: string) => {
  const el = ingredientRefs.value.get(optionId)
  if (el) {
    gsap.to(el, {
      scale: 0,
      opacity: 0,
      y: -20,
      rotation: 15,
      duration: 0.3,
      ease: 'back.in(1.7)'
    })
  }
}

// Register ingredient ref
const setIngredientRef = (optionId: string, el: HTMLElement | null) => {
  if (el) {
    ingredientRefs.value.set(optionId, el)
  } else {
    ingredientRefs.value.delete(optionId)
  }
}

// Float animation for base product
onMounted(() => {
  if (baseRef.value) {
    gsap.to(baseRef.value, {
      y: -10,
      duration: 2,
      ease: 'sine.inOut',
      repeat: -1,
      yoyo: true
    })
  }
})

defineExpose({
  animateAdd,
  animateRemove
})
</script>

<template>
  <div 
    ref="containerRef"
    class="relative bg-gradient-to-br from-heat-gray-soft to-heat-white rounded-gummy-lg p-8 min-h-[300px] flex items-center justify-center"
  >
    <!-- Background decoration circles -->
    <div class="absolute inset-0 overflow-hidden rounded-gummy-lg">
      <div class="absolute top-4 right-4 w-20 h-20 rounded-full bg-heat-orange/10" />
      <div class="absolute bottom-8 left-8 w-16 h-16 rounded-full bg-heat-cyan/10" />
    </div>
    
    <!-- Product stack container -->
    <div class="relative">
      <!-- Base product -->
      <div 
        ref="baseRef"
        class="text-8xl relative z-10"
      >
        {{ productEmoji }}
      </div>
      
      <!-- Ingredient layers (stacked around base) -->
      <TransitionGroup name="ingredient">
        <div
          v-for="optionId in selectedOptions"
          :key="optionId"
          :ref="(el) => setIngredientRef(optionId, el as HTMLElement)"
          class="absolute text-3xl"
          :style="{
            top: `${(ingredientVisuals[optionId]?.layer || 1) * -8}px`,
            left: `${50 + (ingredientVisuals[optionId]?.layer || 1) * 5}%`,
            zIndex: ingredientVisuals[optionId]?.layer || 1,
            filter: `drop-shadow(2px 2px 4px rgba(0,0,0,0.2))`
          }"
        >
          {{ ingredientVisuals[optionId]?.emoji || '✨' }}
        </div>
      </TransitionGroup>
    </div>
    
    <!-- Selected ingredients list -->
    <div class="absolute bottom-4 left-4 right-4">
      <div class="flex flex-wrap gap-1 justify-center">
        <span
          v-for="optionId in selectedOptions"
          :key="optionId"
          class="px-2 py-1 text-xs rounded-full bg-heat-orange/20 text-heat-orange font-semibold"
        >
          {{ ingredientVisuals[optionId]?.emoji }}
        </span>
      </div>
    </div>
    
    <!-- Placeholder message when no options selected -->
    <div 
      v-if="selectedOptions.length === 0"
      class="absolute bottom-4 left-4 right-4 text-center text-sm text-heat-gray-dark"
    >
      Selecciona ingredientes para personalizar
    </div>
  </div>
</template>

<style scoped>
.ingredient-enter-active,
.ingredient-leave-active {
  transition: all 0.3s ease;
}

.ingredient-enter-from {
  opacity: 0;
  transform: scale(0) rotate(-15deg);
}

.ingredient-leave-to {
  opacity: 0;
  transform: scale(0) rotate(15deg);
}
</style>

<!-- 

// Auto-imports de Nuxt - declaraciones para el linter
import type { User } from '@supabase/supabase-js'
import type { SupabaseClient } from '@supabase/supabase-js'
import type { Ref, ComputedRef } from 'vue'

declare global {
  // Nuxt composables
  function useSupabaseClient(): SupabaseClient
  function useSupabaseUser(): Ref<User | null>
  function useHead(options: Record<string, unknown>): void
  function useRouter(): { push: (path: string) => void }
  function useRoute(): { path: string, query: Record<string, string> }
  function navigateTo(path: string): void
  function definePageMeta(meta: Record<string, unknown>): void
  
  // Vue composables
  function ref<T>(value: T): Ref<T>
  function computed<T>(getter: () => T): ComputedRef<T>
  function watch(source: unknown, callback: (newVal: unknown, oldVal: unknown) => void, options?: Record<string, unknown>): void
  function readonly<T>(value: T): T
  function toRef<T, K extends keyof T>(object: T, key: K): Ref<T[K]>
}

export {}


-->