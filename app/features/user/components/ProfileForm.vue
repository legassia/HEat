<script setup lang="ts">
import type { UserProfile } from '../stores/profile.store'

const props = defineProps<{
  profile: UserProfile | null
  isSaving: boolean
}>()

const emit = defineEmits<{
  save: [data: { name: string; phone: string; address: string }]
}>()

// Local editing state
const isEditing = ref(false)
const formData = reactive({
  name: '',
  phone: '',
  address: ''
})

// Geolocation
const isGettingLocation = ref(false)

// Initialize form when profile changes
watch(() => props.profile, (profile) => {
  if (profile) {
    formData.name = profile.name || ''
    formData.phone = profile.phone || ''
    formData.address = profile.address || ''
  }
}, { immediate: true })

const startEditing = () => {
  if (props.profile) {
    formData.name = props.profile.name || ''
    formData.phone = props.profile.phone || ''
    formData.address = props.profile.address || ''
  }
  isEditing.value = true
}

const cancelEditing = () => {
  isEditing.value = false
}

const saveProfile = () => {
  emit('save', { ...formData })
  isEditing.value = false
}

// Geolocation
const getLocation = async () => {
  if (!navigator.geolocation) {
    alert('Tu navegador no soporta geolocalización')
    return
  }
  
  isGettingLocation.value = true
  
  try {
    const position = await new Promise<GeolocationPosition>((resolve, reject) => {
      navigator.geolocation.getCurrentPosition(resolve, reject, {
        enableHighAccuracy: true,
        timeout: 10000
      })
    })
    
    const { latitude, longitude } = position.coords
    
    // Reverse geocoding with Nominatim
    const response = await fetch(
      `https://nominatim.openstreetmap.org/reverse?lat=${latitude}&lon=${longitude}&format=json&addressdetails=1`,
      { headers: { 'Accept-Language': 'es' } }
    )
    
    if (response.ok) {
      const data = await response.json()
      formData.address = data.display_name || `${latitude}, ${longitude}`
    } else {
      formData.address = `${latitude.toFixed(6)}, ${longitude.toFixed(6)}`
    }
  } catch (error) {
    console.error('Geolocation error:', error)
    alert('No se pudo obtener tu ubicación')
  } finally {
    isGettingLocation.value = false
  }
}
</script>

<template>
  <GummyCard padding="lg">
    <div class="flex items-center justify-between gap-2 mb-6">
      <h3 class="font-bold text-heat-black truncate">Información Personal</h3>
      <button 
        v-if="!isEditing"
        class="flex items-center gap-1 text-sm text-heat-orange font-semibold hover:bg-heat-orange/10 px-3 py-1.5 rounded-gummy transition-colors flex-shrink-0"
        @click="startEditing"
      >
        <span class="i-lucide-pencil text-sm" />
        Editar
      </button>
    </div>
    
    <form @submit.prevent="saveProfile" class="space-y-4">
      <!-- Name -->
      <div>
        <label class="block text-sm font-semibold text-heat-black mb-2">
          Nombre completo
          <span v-if="isEditing" class="text-red-500">*</span>
        </label>
        <input 
          v-model="formData.name"
          type="text"
          :disabled="!isEditing"
          required
          class="w-full px-4 py-3 rounded-gummy bg-heat-gray-soft border border-heat-gray-medium/50 focus:border-heat-orange focus:ring-2 focus:ring-heat-orange/20 transition-all outline-none disabled:opacity-60 text-base"
          placeholder="Tu nombre"
        />
      </div>
      
      <!-- Phone -->
      <div>
        <label class="block text-sm font-semibold text-heat-black mb-2">
          Teléfono
        </label>
        <PhoneInput 
          v-model="formData.phone"
          :disabled="!isEditing"
          placeholder="314-368-6786"
        />
        <p v-if="isEditing" class="text-xs text-heat-gray-dark mt-1">
          Incluye tu número para que podamos contactarte sobre tu pedido
        </p>
      </div>
      
      <!-- Address -->
      <div>
        <label class="block text-sm font-semibold text-heat-black mb-2">
          Dirección de entrega
        </label>
        
        <!-- Geolocation button -->
        <button
          v-if="isEditing"
          type="button"
          class="w-full mb-2 flex items-center justify-center gap-2 px-4 py-2.5 rounded-gummy border-2 border-dashed border-heat-cyan/50 text-heat-cyan hover:bg-heat-cyan/5 transition-colors disabled:opacity-50"
          :disabled="isGettingLocation"
          @click="getLocation"
        >
          <span v-if="isGettingLocation" class="i-lucide-loader-2 animate-spin" />
          <span v-else class="i-lucide-map-pin" />
          <span class="text-sm font-medium">
            {{ isGettingLocation ? 'Obteniendo ubicación...' : 'Usar mi ubicación actual' }}
          </span>
        </button>

        <textarea 
          v-model="formData.address"
          :disabled="!isEditing"
          rows="3"
          class="w-full px-4 py-3 rounded-gummy bg-heat-gray-soft border border-heat-gray-medium/50 focus:border-heat-orange focus:ring-2 focus:ring-heat-orange/20 transition-all outline-none disabled:opacity-60 resize-none text-base"
          placeholder="Calle, número, barrio, piso, referencias..."
        />
        <p v-if="isEditing" class="text-xs text-heat-gray-dark mt-1">
          Necesaria para pedidos a domicilio
        </p>
      </div>
      
      <!-- Actions -->
      <div v-if="isEditing" class="flex gap-3 pt-4">
        <GummyButton 
          type="button" 
          variant="ghost" 
          class="flex-1"
          :disabled="isSaving"
          @click="cancelEditing"
        >
          Cancelar
        </GummyButton>
        <GummyButton 
          type="submit" 
          variant="primary" 
          class="flex-1"
          :loading="isSaving"
        >
          <span class="i-lucide-check mr-2" />
          Guardar
        </GummyButton>
      </div>
    </form>
  </GummyCard>
</template>
