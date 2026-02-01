<script setup lang="ts">
import { type DeliveryMode, deliveryModeLabels, DELIVERY_FEE } from '../composables/useDeliveryMode'

const props = defineProps<{
  mode: DeliveryMode
  tableNumber: number | null
  deliveryAddress: string
  pickupTime: string
  pickupNotes: string
  deliveryNotes: string
}>()

const emit = defineEmits<{
  'update:mode': [mode: DeliveryMode]
  'update:tableNumber': [table: number]
  'update:deliveryAddress': [address: string]
  'update:pickupTime': [time: string]
  'update:pickupNotes': [notes: string]
  'update:deliveryNotes': [notes: string]
}>()

const modes: DeliveryMode[] = ['local', 'pickup', 'delivery']
const tables = [1, 2, 3, 4, 5, 6]

const formattedDeliveryFee = computed(() => 
  new Intl.NumberFormat('es-CO', { style: 'currency', currency: 'COP', minimumFractionDigits: 0 })
    .format(DELIVERY_FEE)
)
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
      <!-- LOCAL: Table Selection -->
      <div v-if="mode === 'local'" class="space-y-3">
        <label class="block text-sm font-semibold text-heat-black">
          Selecciona tu mesa
        </label>
        <div class="grid grid-cols-3 gap-3">
          <button
            v-for="table in tables"
            :key="table"
            class="aspect-square rounded-gummy flex flex-col items-center justify-center transition-all border-2"
            :class="tableNumber === table 
              ? 'border-heat-orange bg-heat-orange/10 text-heat-orange' 
              : 'border-heat-gray-medium/30 bg-heat-white text-heat-gray-dark hover:border-heat-orange/50'"
            @click="emit('update:tableNumber', table)"
          >
            <span class="i-lucide-layout-grid text-lg mb-1" />
            <span class="text-2xl font-bold">{{ table }}</span>
          </button>
        </div>
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

      <!-- DELIVERY: Address and Notes -->
      <div v-else-if="mode === 'delivery'" class="space-y-4">
        <div class="p-4 rounded-gummy bg-orange-50 border border-orange-200">
          <div class="flex items-center justify-between">
            <div class="flex items-center gap-2 text-orange-700">
              <span class="i-lucide-bike text-lg" />
              <span class="font-semibold">Coste asociado</span>
            </div>
            <!-- <span class="font-bold text-orange-700">{{ formattedDeliveryFee }}</span> -->
          </div>
          <p class="text-sm text-orange-600 mt-1">
            <!-- Entrega en tu dirección -->
            Disponible en el sector de Villa Adriana
          </p>
        </div>

        <div>
          <label class="block text-sm font-semibold text-heat-black mb-2">
            Dirección de entrega
            <span class="text-red-500">*</span>
          </label>
          <textarea
            :value="deliveryAddress"
            rows="2"
            required
            class="w-full px-4 py-3 rounded-gummy bg-heat-gray-soft border border-heat-gray-medium/50 focus:border-heat-orange focus:ring-2 focus:ring-heat-orange/20 transition-all outline-none resize-none"
            placeholder="Calle, número, barrio, referencias..."
            @input="emit('update:deliveryAddress', ($event.target as HTMLTextAreaElement).value)"
          />
        </div>

        <div>
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
