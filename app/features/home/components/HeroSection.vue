<script setup lang="ts">
const emit = defineEmits<{
  scrollToMenu: []
}>()
</script>

<template>
  <section class="relative overflow-hidden rounded-gummy-xl bg-heat-white p-8 lg:p-12 border border-heat-gray-medium/30">
    <!-- Floating food icons -->
    <div class="absolute top-8 right-[40%] text-9xl animate-float" style="animation-delay: 0s">🍔</div>
    <div class="absolute top-16 right-[25%] text-6xl animate-float" style="animation-delay: 0.5s">🥓</div>
    <div class="absolute top-50 right-[15%] text-9xl animate-float" style="animation-delay: 1s">🫓</div>
    <div class="absolute bottom-20 right-[24%] text-7xl animate-float" style="animation-delay: 1.5s">🍢</div>
    <div class="absolute bottom-8 right-[40%] text-8xl animate-float" style="animation-delay: 0.3s">🌭</div>
    
    <div class="relative z-10 max-w-xl">
      <!-- Badge -->
      <div class="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-heat-orange/10 text-heat-orange text-sm font-semibold mb-6">
        <span class="text-lg">✨</span>
        ¡Nuevos productos disponibles!
      </div>
      
      <!-- Title -->
      <h1 class="text-4xl lg:text-5xl font-extrabold text-heat-black mb-2 leading-tight">
        El auténtico sabor
      </h1>
      <h1 class="text-4xl lg:text-5xl font-extrabold text-heat-orange mb-6">
        Paisa
      </h1>
      
      <!-- Description -->
      <p class="text-heat-gray-dark text-lg mb-8 leading-relaxed">
        Arepas, chorizos y hamburguesas hechos con amor. 
        <br>
        Personaliza tu pedido y recíbelo calentito en minutos.
      </p>
      
      <!-- Buttons -->
      <div class="flex flex-wrap gap-4 mb-8">
        <GummyButton variant="primary" size="lg" @click="emit('scrollToMenu')">
          Hacer Pedido
          <span class="ml-1">🍽️</span>
        </GummyButton>
        <GummyButton variant="outline" size="lg" @click="emit('scrollToMenu')">
          Ver Menú
        </GummyButton>
      </div>
      
      <!-- Info badges -->
      <div class="flex flex-wrap gap-6 text-sm text-heat-gray-dark">
        <div class="flex items-center gap-2">
          <span class="w-8 h-8 rounded-full bg-heat-cyan/10 flex items-center justify-center">
            <span class="i-lucide-clock text-heat-cyan" />
          </span>
          <span>5-15 min</span>
        </div>
        <div class="flex items-center gap-2">
          <span class="w-8 h-8 rounded-full bg-heat-orange/10 flex items-center justify-center">
            <span class="i-lucide-bike text-heat-orange" />
          </span>
          <span>Delivery disponible en sector!</span>
        </div>
      </div>
    </div>
  </section>
</template>

