<script setup lang="ts">
const emit = defineEmits<{
  scrollToMenu: []
}>()
</script>

<template>
  <section class="relative overflow-hidden rounded-gummy-xl bg-heat-white p-6 lg:p-12 border border-heat-gray-medium/30 min-h-[400px] lg:min-h-0">
    <!-- Floating food icons - hidden on small mobile, responsive sizes -->
    <div class="hidden sm:block absolute top-4 lg:top-8 right-[30%] lg:right-[40%] text-5xl lg:text-9xl animate-float" style="animation-delay: 0s">🍔</div>
    <div class="hidden md:block absolute top-12 lg:top-16 right-[15%] lg:right-[25%] text-4xl lg:text-6xl animate-float" style="animation-delay: 0.5s">🥓</div>
    <div class="hidden sm:block absolute top-32 lg:top-50 right-[10%] lg:right-[15%] text-5xl lg:text-9xl animate-float" style="animation-delay: 1s">🫓</div>
    <div class="hidden md:block absolute bottom-16 lg:bottom-20 right-[18%] lg:right-[24%] text-4xl lg:text-7xl animate-float" style="animation-delay: 1.5s">🍢</div>
    <div class="hidden sm:block absolute bottom-4 lg:bottom-8 right-[30%] lg:right-[40%] text-5xl lg:text-8xl animate-float" style="animation-delay: 0.3s">🌭</div>
    
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

