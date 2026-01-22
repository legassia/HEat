<script setup lang="ts">
useHead({
  title: 'HEat - Avisos'
})

const announcements = [
  {
    id: 1,
    type: 'horario',
    title: 'Horario de Atención',
    icon: 'i-lucide-clock',
    content: [
      { day: 'Lunes - Viernes', hours: '8:00 AM - 10:00 PM' },
      { day: 'Sábados', hours: '9:00 AM - 11:00 PM' },
      { day: 'Domingos', hours: '10:00 AM - 9:00 PM' }
    ]
  },
  {
    id: 2,
    type: 'contacto',
    title: 'Contacto',
    icon: 'i-lucide-phone',
    content: [
      { label: 'Teléfono', value: '+58 XXX-XXX-XXXX' },
      { label: 'WhatsApp', value: '+58 XXX-XXX-XXXX' },
      { label: 'Email', value: 'contacto@heat.com' }
    ]
  },
  {
    id: 3,
    type: 'ubicacion',
    title: 'Ubicación',
    icon: 'i-lucide-map-pin',
    content: 'Tu ciudad, Venezuela. Cerca de ti.'
  }
]

const promos = [
  {
    id: 1,
    title: '¡Combo Familiar!',
    description: '4 Arepas + 4 Bebidas',
    discount: '15% OFF',
    validUntil: '31 Ene 2026',
    color: 'gradient-orange'
  },
  {
    id: 2,
    title: 'Martes de Perros',
    description: '2x1 en todos los perros calientes',
    discount: '2x1',
    validUntil: 'Todos los martes',
    color: 'bg-heat-cyan'
  }
]
</script>

<template>
  <div class="space-y-8">
    <!-- Header -->
    <div>
      <h1 class="text-3xl font-extrabold text-heat-black mb-2">
        Avisos
      </h1>
      <p class="text-heat-gray-dark">
        Información importante y promociones
      </p>
    </div>
    
    <!-- Promotions -->
    <section>
      <h2 class="text-xl font-bold text-heat-black mb-4 flex items-center gap-2">
        <span class="i-lucide-tag text-heat-orange" />
        Promociones Activas
      </h2>
      
      <div class="grid gap-4 md:grid-cols-2">
        <div 
          v-for="promo in promos" 
          :key="promo.id"
          :class="promo.color"
          class="rounded-gummy-lg p-6 text-white relative overflow-hidden"
        >
          <!-- Decoration -->
          <div class="absolute top-0 right-0 w-24 h-24 bg-white/10 rounded-full -translate-y-1/2 translate-x-1/2" />
          
          <div class="relative z-10">
            <span class="inline-block px-3 py-1 bg-white/20 rounded-full text-sm font-bold mb-3">
              {{ promo.discount }}
            </span>
            <h3 class="text-xl font-bold mb-1">{{ promo.title }}</h3>
            <p class="text-white/90 text-sm mb-3">{{ promo.description }}</p>
            <p class="text-xs text-white/70">
              Válido: {{ promo.validUntil }}
            </p>
          </div>
        </div>
      </div>
    </section>
    
    <!-- Info Cards -->
    <section class="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
      <GummyCard 
        v-for="info in announcements" 
        :key="info.id"
        padding="lg"
      >
        <div class="flex items-start gap-4">
          <div class="w-12 h-12 rounded-gummy gradient-orange flex items-center justify-center shrink-0">
            <span :class="info.icon" class="text-xl text-white" />
          </div>
          
          <div class="flex-1">
            <h3 class="font-bold text-heat-black mb-3">{{ info.title }}</h3>
            
            <!-- Horario -->
            <template v-if="info.type === 'horario'">
              <div class="space-y-2">
                <div 
                  v-for="(schedule, idx) in info.content" 
                  :key="idx"
                  class="flex justify-between text-sm"
                >
                  <span class="text-heat-gray-dark">{{ schedule.day }}</span>
                  <span class="font-semibold text-heat-black">{{ schedule.hours }}</span>
                </div>
              </div>
            </template>
            
            <!-- Contacto -->
            <template v-else-if="info.type === 'contacto'">
              <div class="space-y-2">
                <div 
                  v-for="(contact, idx) in info.content" 
                  :key="idx"
                  class="text-sm"
                >
                  <span class="text-heat-gray-dark">{{ contact.label }}:</span>
                  <span class="font-semibold text-heat-black ml-2">{{ contact.value }}</span>
                </div>
              </div>
            </template>
            
            <!-- Texto simple -->
            <template v-else>
              <p class="text-sm text-heat-gray-dark">{{ info.content }}</p>
            </template>
          </div>
        </div>
      </GummyCard>
    </section>
    
    <!-- Price List -->
    <section>
      <h2 class="text-xl font-bold text-heat-black mb-4 flex items-center gap-2">
        <span class="i-lucide-receipt text-heat-orange" />
        Lista de Precios
      </h2>
      
      <GummyCard padding="none">
        <table class="w-full">
          <thead>
            <tr class="border-b border-heat-gray-medium/30">
              <th class="text-left p-4 font-bold text-heat-black">Producto</th>
              <th class="text-right p-4 font-bold text-heat-black">Desde</th>
            </tr>
          </thead>
          <tbody>
            <tr class="border-b border-heat-gray-medium/30 hover:bg-heat-gray-soft/50 transition-colors">
              <td class="p-4">
                <div class="flex items-center gap-3">
                  <span class="text-2xl">🫓</span>
                  <span class="font-semibold">Arepas</span>
                </div>
              </td>
              <td class="p-4 text-right font-bold text-heat-orange">$2.50</td>
            </tr>
            <tr class="border-b border-heat-gray-medium/30 hover:bg-heat-gray-soft/50 transition-colors">
              <td class="p-4">
                <div class="flex items-center gap-3">
                  <span class="text-2xl">🌭</span>
                  <span class="font-semibold">Perros Calientes</span>
                </div>
              </td>
              <td class="p-4 text-right font-bold text-heat-orange">$3.00</td>
            </tr>
            <tr class="hover:bg-heat-gray-soft/50 transition-colors">
              <td class="p-4">
                <div class="flex items-center gap-3">
                  <span class="text-2xl">🍔</span>
                  <span class="font-semibold">Hamburguesas</span>
                </div>
              </td>
              <td class="p-4 text-right font-bold text-heat-orange">$4.00</td>
            </tr>
          </tbody>
        </table>
      </GummyCard>
      
      <p class="text-xs text-heat-gray-dark mt-2 text-center">
        * Los precios pueden variar según los ingredientes seleccionados
      </p>
    </section>
  </div>
</template>

