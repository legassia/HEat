<script setup lang="ts">
useHead({
  title: 'HEat - Mi Perfil'
})

const user = useSupabaseUser()
const supabase = useSupabaseClient()

const isEditing = ref(false)
const isLoading = ref(false)

const profile = ref({
  name: user.value?.user_metadata?.full_name || '',
  phone: user.value?.phone || '',
  address: ''
})

const logout = async () => {
  await supabase.auth.signOut()
  navigateTo('/')
}

const saveProfile = async () => {
  isLoading.value = true
  try {
    // TODO: Save to Supabase profile table
    await new Promise(resolve => setTimeout(resolve, 1000))
    isEditing.value = false
  } finally {
    isLoading.value = false
  }
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
    
    <!-- Not Logged In -->
    <template v-if="!user">
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
            <img 
              v-if="user.user_metadata?.avatar_url"
              :src="user.user_metadata.avatar_url"
              :alt="user.user_metadata?.full_name || 'Usuario'"
              class="w-full h-full object-cover"
            />
            <div v-else class="w-full h-full flex items-center justify-center">
              <span class="i-lucide-user text-white text-4xl" />
            </div>
          </div>
          
          <button 
            class="absolute bottom-0 right-0 w-10 h-10 rounded-full gradient-orange flex items-center justify-center shadow-gummy gummy-press"
            aria-label="Cambiar foto"
          >
            <span class="i-lucide-camera text-white" />
          </button>
        </div>
        
        <h2 class="text-2xl font-bold text-heat-black mt-4">
          {{ user.user_metadata?.full_name || 'Usuario' }}
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
            @click="isEditing = true"
          >
            <span class="i-lucide-pencil text-sm" />
            Editar
          </button>
        </div>
        
        <form @submit.prevent="saveProfile" class="space-y-4">
          <div>
            <label class="block text-sm font-semibold text-heat-black mb-2">
              Nombre completo
            </label>
            <input 
              v-model="profile.name"
              type="text"
              :disabled="!isEditing"
              class="w-full px-4 py-3 rounded-gummy bg-heat-gray-soft border border-heat-gray-medium/50 focus:border-heat-orange focus:ring-2 focus:ring-heat-orange/20 transition-all outline-none disabled:opacity-60"
              placeholder="Tu nombre"
            />
          </div>
          
          <div>
            <label class="block text-sm font-semibold text-heat-black mb-2">
              Teléfono
            </label>
            <input 
              v-model="profile.phone"
              type="tel"
              :disabled="!isEditing"
              class="w-full px-4 py-3 rounded-gummy bg-heat-gray-soft border border-heat-gray-medium/50 focus:border-heat-orange focus:ring-2 focus:ring-heat-orange/20 transition-all outline-none disabled:opacity-60"
              placeholder="+58 322-857-7409"
            />
          </div>
          
          <div>
            <label class="block text-sm font-semibold text-heat-black mb-2">
              Dirección de entrega
            </label>
            <textarea 
              v-model="profile.address"
              :disabled="!isEditing"
              rows="3"
              class="w-full px-4 py-3 rounded-gummy bg-heat-gray-soft border border-heat-gray-medium/50 focus:border-heat-orange focus:ring-2 focus:ring-heat-orange/20 transition-all outline-none disabled:opacity-60 resize-none"
              placeholder="Añada tu dirección para poder recibir domicilios en el sector!"
            />
          </div>
          
          <div v-if="isEditing" class="flex gap-3 pt-4">
            <GummyButton 
              type="button" 
              variant="ghost" 
              class="flex-1"
              @click="isEditing = false"
            >
              Cancelar
            </GummyButton>
            <GummyButton 
              type="submit" 
              variant="primary" 
              class="flex-1"
              :loading="isLoading"
            >
              Guardar
            </GummyButton>
          </div>
        </form>
      </GummyCard>
      
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

