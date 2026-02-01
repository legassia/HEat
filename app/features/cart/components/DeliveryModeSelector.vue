<script setup lang="ts">
import { type DeliveryMode, deliveryModeLabels, AVAILABLE_TABLES } from '../stores/delivery.store'

const props = defineProps<{
  mode: DeliveryMode
  selectedTables: ReadonlySet<number>
  deliveryAddress: string
  pickupTime: string
  pickupNotes: string
  deliveryNotes: string
}>()

const emit = defineEmits<{
  'update:mode': [mode: DeliveryMode]
  'toggleTable': [table: number]
  'update:pickupTime': [time: string]
  'update:pickupNotes': [notes: string]
  'update:deliveryNotes': [notes: string]
}>()

const modes: DeliveryMode[] = ['local', 'pickup', 'delivery']
</script>

<template>
  <div class="space-y-4">
    <!-- Mode Tabs -->
    <div class="grid grid-cols-3 gap-2 p-1 bg-heat-gray-soft rounded-gummy">
      <button
        v-for="m in modes"
        :key="m"
        class="flex flex-col items-center gap-1 py-3 px-2 rounded-gummy-sm transition-all text-center"
        :class="mode === m 
          ? 'bg-heat-white shadow-sm text-heat-orange' 
          : 'text-heat-gray-dark hover:text-heat-black'"
        @click="emit('update:mode', m)"
      >
        <span :class="deliveryModeLabels[m].icon" class="text-xl" />
        <span class="text-sm font-semibold">{{ deliveryModeLabels[m].label }}</span>
        <span class="text-xs opacity-70">{{ deliveryModeLabels[m].description }}</span>
      </button>
    </div>

    <!-- Mode-specific content -->
    <div class="pt-2">
      <!-- LOCAL: Table Selection (Multi-select) -->
      <div v-if="mode === 'local'" class="space-y-3">
        <label class="block text-sm font-semibold text-heat-black">
          Selecciona tu mesa
          <span class="font-normal text-heat-gray-dark">(puedes elegir varias)</span>
        </label>
        <div class="grid grid-cols-3 gap-3">
          <button
            v-for="table in AVAILABLE_TABLES"
            :key="table"
            class="aspect-square rounded-gummy flex flex-col items-center justify-center transition-all border-2"
            :class="selectedTables.has(table) 
              ? 'border-heat-orange bg-heat-orange/10 text-heat-orange' 
              : 'border-heat-gray-medium/30 bg-heat-white text-heat-gray-dark hover:border-heat-orange/50'"
            @click="emit('toggleTable', table)"
          >
            <span 
              :class="selectedTables.has(table) ? 'i-lucide-check-circle' : 'i-lucide-circle'" 
              class="text-lg mb-1" 
            />
            <span class="text-2xl font-bold">{{ table }}</span>
          </button>
        </div>
        <p v-if="selectedTables.size > 1" class="text-sm text-heat-orange">
          <span class="i-lucide-info" />
          {{ selectedTables.size }} mesas seleccionadas
        </p>
      </div>

      <!-- PICKUP: Time and Notes -->
      <div v-else-if="mode === 'pickup'" class="space-y-4">
        <div class="p-4 rounded-gummy bg-green-50 border border-green-200">
          <div class="flex items-center gap-2 text-green-700">
            <span class="i-lucide-check-circle text-lg" />
            <span class="font-semibold">Envío gratis</span>
          </div>
          <p class="text-sm text-green-600 mt-1">
            Recoge tu pedido en el local cuando esté listo
          </p>
        </div>

        <div>
          <label class="block text-sm font-semibold text-heat-black mb-2">
            Hora aproximada de recogida
            <span class="text-heat-gray-dark font-normal">(opcional)</span>
          </label>
          <input 
            type="time"
            :value="pickupTime"
            class="w-full px-4 py-3 rounded-gummy bg-heat-gray-soft border border-heat-gray-medium/50 focus:border-heat-orange focus:ring-2 focus:ring-heat-orange/20 transition-all outline-none"
            @input="emit('update:pickupTime', ($event.target as HTMLInputElement).value)"
          />
        </div>

        <div>
          <label class="block text-sm font-semibold text-heat-black mb-2">
            Cómo encontrarme
            <span class="text-heat-gray-dark font-normal">(opcional)</span>
          </label>
          <textarea
            :value="pickupNotes"
            rows="2"
            class="w-full px-4 py-3 rounded-gummy bg-heat-gray-soft border border-heat-gray-medium/50 focus:border-heat-orange focus:ring-2 focus:ring-heat-orange/20 transition-all outline-none resize-none"
            placeholder="Ej: Voy en carro rojo, llámame cuando esté listo..."
            @input="emit('update:pickupNotes', ($event.target as HTMLTextAreaElement).value)"
          />
        </div>
      </div>

      <!-- DELIVERY: Shows address from profile (read-only) -->
      <div v-else-if="mode === 'delivery'" class="space-y-4">
        <div class="p-4 rounded-gummy bg-orange-50 border border-orange-200">
          <div class="flex items-center gap-2 text-orange-700">
            <span class="i-lucide-bike text-lg" />
            <span class="font-semibold">Envío a domicilio</span>
          </div>
          <p class="text-sm text-orange-600 mt-1">
            Disponible en el sector de Villa Adriana
          </p>
        </div>

        <!-- Address display (from profile) -->
        <div v-if="deliveryAddress" class="p-4 rounded-gummy bg-heat-gray-soft border border-heat-gray-medium/30">
          <div class="flex items-start justify-between gap-3">
            <div class="flex items-start gap-2">
              <span class="i-lucide-map-pin text-heat-orange mt-0.5" />
              <div>
                <p class="text-sm font-medium text-heat-black">{{ deliveryAddress }}</p>
                <p class="text-xs text-heat-gray-dark mt-1">Dirección guardada en tu perfil</p>
              </div>
            </div>
            <NuxtLink 
              to="/perfil" 
              class="text-xs text-heat-orange hover:underline flex items-center gap-1 shrink-0"
            >
              <span class="i-lucide-pencil" />
              Editar
            </NuxtLink>
          </div>
        </div>

        <!-- No address warning -->
        <div v-else class="p-4 rounded-gummy bg-red-50 border border-red-200">
          <div class="flex items-center gap-2 text-red-700">
            <span class="i-lucide-alert-circle text-lg" />
            <span class="font-semibold">Dirección requerida</span>
          </div>
          <p class="text-sm text-red-600 mt-1">
            Agrega tu dirección en tu perfil para pedir a domicilio
          </p>
          <NuxtLink to="/perfil">
            <button class="mt-3 px-4 py-2 rounded-gummy bg-red-100 text-red-700 text-sm font-semibold hover:bg-red-200 transition-colors">
              Ir a mi perfil
            </button>
          </NuxtLink>
        </div>

        <!-- Delivery notes (optional) -->
        <div v-if="deliveryAddress">
          <label class="block text-sm font-semibold text-heat-black mb-2">
            Instrucciones de entrega
            <span class="text-heat-gray-dark font-normal">(opcional)</span>
          </label>
          <textarea
            :value="deliveryNotes"
            rows="2"
            class="w-full px-4 py-3 rounded-gummy bg-heat-gray-soft border border-heat-gray-medium/50 focus:border-heat-orange focus:ring-2 focus:ring-heat-orange/20 transition-all outline-none resize-none"
            placeholder="Ej: Apartamento 201, tocar el timbre..."
            @input="emit('update:deliveryNotes', ($event.target as HTMLTextAreaElement).value)"
          />
        </div>
      </div>
    </div>
  </div>
</template>
