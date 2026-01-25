<script setup lang="ts">
useHead({
  title: 'HEat - Política de Privacidad'
})
</script>

<template>
  <div class="space-y-6">
    <div>
      <h1 class="text-3xl font-extrabold text-heat-black mb-2">
        Política de Privacidad
      </h1>
      <p class="text-heat-gray-dark">
        Última actualización: Enero 2026
      </p>
    </div>
    
    <GummyCard>
      <div class="prose prose-heat max-w-none">
        <h2 class="text-xl font-bold text-heat-black mb-4">Información que recopilamos</h2>
        <p class="text-heat-gray-dark mb-4">
          Recopilamos información que nos proporcionas directamente, como tu nombre, 
          número de teléfono y dirección de entrega cuando realizas un pedido.
        </p>
        
        <h2 class="text-xl font-bold text-heat-black mb-4 mt-6">Uso de la información</h2>
        <p class="text-heat-gray-dark mb-4">
          Utilizamos tu información para procesar pedidos, comunicarnos contigo sobre 
          el estado de tus pedidos y mejorar nuestros servicios.
        </p>
        
        <h2 class="text-xl font-bold text-heat-black mb-4 mt-6">Protección de datos</h2>
        <p class="text-heat-gray-dark">
          Tus datos están protegidos y no compartimos tu información personal con terceros 
          sin tu consentimiento, excepto cuando sea necesario para completar tu pedido.
        </p>
      </div>
    </GummyCard>
    
    <div class="text-center">
      <GummyButton variant="outline" @click="navigateTo('/')">
        Volver al inicio
      </GummyButton>
    </div>
  </div>
</template>

