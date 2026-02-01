<script setup lang="ts">
import { toast } from 'vue-sonner'
import { useProfileStore } from '~/features/user/stores/profile.store'

useHead({
  title: 'HEat - Mi Perfil'
})

const user = useSupabaseUser()
const supabase = useSupabaseClient()
const profileStore = useProfileStore()

const isEditing = ref(false)
const isSaving = ref(false)

// Local form state (editable copy)
const formData = ref({
  name: '',
  phone: '',
  address: ''
})

// Fetch profile on mount
onMounted(async () => {
  await profileStore.fetchProfile()
})

// Sync form with profile when profile loads
watch(() => profileStore.profile, (p) => {
  if (p && !isEditing.value) {
    formData.value = {
      name: p.name || '',
      phone: p.phone || '',
      address: p.address || ''
    }
  }
}, { immediate: true })

const startEditing = () => {
  if (profileStore.profile) {
    formData.value = {
      name: profileStore.profile.name || '',
      phone: profileStore.profile.phone || '',
      address: profileStore.profile.address || ''
    }
  }
  isEditing.value = true
}

const cancelEditing = () => {
  isEditing.value = false
  // Reset form to current profile
  if (profileStore.profile) {
    formData.value = {
      name: profileStore.profile.name || '',
      phone: profileStore.profile.phone || '',
      address: profileStore.profile.address || ''
    }
  }
}

const saveProfile = async () => {
  if (!formData.value.name.trim()) {
    toast.error('Nombre requerido')
    return
  }

  isSaving.value = true
  try {
    await profileStore.updateProfile({
      name: formData.value.name.trim(),
      phone: formData.value.phone || undefined,
      address: formData.value.address?.trim() || undefined
    })
    
    toast.success('Perfil actualizado', {
      description: 'Tus datos se han guardado correctamente'
    })
    
    isEditing.value = false
  } catch (e: any) {
    toast.error('Error al guardar', {
      description: e.message || 'Intenta de nuevo'
    })
  } finally {
    isSaving.value = false
  }
}

const logout = async () => {
  await supabase.auth.signOut()
  profileStore.reset()
  navigateTo('/')
}
</script>

<template>
  <div class="max-w-2xl mx-auto space-y-8">
    <!-- Header -->
    <div class="text-center">
      <h1 class="text-3xl font-extrabold text-heat-black mb-2">
        Mi Perfil
      </h1>
    </div>
    
    <!-- Loading -->
    <div v-if="profileStore.isLoading && !profileStore.profile" class="text-center py-16">
      <span class="i-lucide-loader-2 text-3xl text-heat-orange animate-spin" />
    </div>
    
    <!-- Not Logged In -->
    <template v-else-if="!user">
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
    
    <!-- Logged In -->
    <template v-else>
      <!-- Avatar Section -->
      <div class="text-center">
        <div class="relative inline-block">
          <div class="w-28 h-28 rounded-full bg-heat-cyan overflow-hidden border-4 border-heat-cyan shadow-gummy-cyan">
            <!-- Google avatar -->
            <img 
              v-if="user.user_metadata?.avatar_url"
              :src="user.user_metadata.avatar_url"
              :alt="profileStore.displayName"
              class="w-full h-full object-cover"
            />
            <!-- Emoji avatar (default fallback) -->
            <div 
              v-else 
              class="w-full h-full flex items-center justify-center bg-gradient-to-br from-heat-orange to-heat-pink"
            >
              <span class="text-5xl">{{ profileStore.displayEmoji }}</span>
            </div>
          </div>
        </div>
        
        <h2 class="text-2xl font-bold text-heat-black mt-4">
          {{ profileStore.displayName }}
        </h2>
        <p class="text-heat-gray-dark">
          {{ user.email }}
        </p>
      </div>
      
      <!-- Profile Form -->
      <GummyCard padding="lg">
        <div class="flex items-center justify-between mb-6">
          <h3 class="font-bold text-heat-black">Información Personal</h3>
          <button 
            v-if="!isEditing"
            class="flex items-center gap-1 text-sm text-heat-orange font-semibold hover:bg-heat-orange/10 px-3 py-1.5 rounded-gummy transition-colors"
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
              class="w-full px-4 py-3 rounded-gummy bg-heat-gray-soft border border-heat-gray-medium/50 focus:border-heat-orange focus:ring-2 focus:ring-heat-orange/20 transition-all outline-none disabled:opacity-60"
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
            <textarea 
              v-model="formData.address"
              :disabled="!isEditing"
              rows="3"
              class="w-full px-4 py-3 rounded-gummy bg-heat-gray-soft border border-heat-gray-medium/50 focus:border-heat-orange focus:ring-2 focus:ring-heat-orange/20 transition-all outline-none disabled:opacity-60 resize-none"
              placeholder="Calle, número, barrio, referencias..."
            />
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
      
      <!-- Error -->
      <div v-if="profileStore.error" class="p-4 rounded-gummy bg-red-50 text-red-600 flex items-center gap-2">
        <span class="i-lucide-alert-circle" />
        {{ profileStore.error }}
      </div>
      
      <!-- Actions -->
      <div class="space-y-3">
        <GummyButton 
          variant="secondary" 
          class="w-full"
          @click="navigateTo('/historial')"
        >
          <span class="i-lucide-history mr-2" />
          Ver mis pedidos
        </GummyButton>
        
        <GummyButton 
          variant="ghost" 
          class="w-full text-red-500 hover:bg-red-50"
          @click="logout"
        >
          <span class="i-lucide-log-out mr-2" />
          Cerrar Sesión
        </GummyButton>
      </div>
    </template>
  </div>
</template>
