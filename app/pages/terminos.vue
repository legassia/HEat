<script setup lang="ts">
useHead({
  title: 'HEat - Términos y Condiciones'
})
</script>

<template>
  <div class="space-y-6">
    <div>
      <h1 class="text-3xl font-extrabold text-heat-black mb-2">
        Términos y Condiciones
      </h1>
      <p class="text-heat-gray-dark">
        Última actualización: Enero 2026
      </p>
    </div>
    
    <GummyCard>
      <div class="prose prose-heat max-w-none">
        <h2 class="text-xl font-bold text-heat-black mb-4">Pedidos</h2>
        <p class="text-heat-gray-dark mb-4">
          Al realizar un pedido, aceptas pagar el precio total indicado. Los pedidos 
          pueden cancelarse dentro de los primeros 10 minutos después de realizados.
        </p>
        
        <h2 class="text-xl font-bold text-heat-black mb-4 mt-6">Entregas</h2>
        <p class="text-heat-gray-dark mb-4">
          Los tiempos de entrega son estimados y pueden variar según la demanda. 
          Hacemos nuestro mejor esfuerzo para entregar tu pedido lo antes posible.
        </p>
        
        <h2 class="text-xl font-bold text-heat-black mb-4 mt-6">Responsabilidad</h2>
        <p class="text-heat-gray-dark">
          No nos hacemos responsables por retrasos causados por factores externos 
          como el clima o el tráfico. En caso de problemas con tu pedido, contáctanos.
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

