<script setup lang="ts">
</script>

<template>
  <GummyCard padding="lg" class="text-center">
    <div class="w-24 h-24 mx-auto rounded-full bg-heat-gray-soft flex items-center justify-center mb-6">
      <span class="i-lucide-user text-4xl text-heat-gray-medium" />
    </div>
    
    <h2 class="text-xl font-bold text-heat-black mb-2">
      Inicia sesión
    </h2>
    <p class="text-heat-gray-dark mb-6">
      Accede para ver tu historial y realizar pedidos más rápido
    </p>
    
    <div class="space-y-3">
      <GummyButton variant="primary" class="w-full" @click="navigateTo('/auth')">
        <span class="i-lucide-log-in mr-2" />
        Iniciar Sesión
      </GummyButton>
      
      <GummyButton variant="secondary" class="w-full" @click="navigateTo('/auth?mode=register')">
        Crear Cuenta
      </GummyButton>
    </div>
  </GummyCard>
</template>
