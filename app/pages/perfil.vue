<script setup lang="ts">
import { toast } from 'vue-sonner'
import { useProfileStore } from '~/features/user/stores/profile.store'
import ProfileAvatar from '~/features/user/components/ProfileAvatar.vue'
import ProfileNotLoggedIn from '~/features/user/components/ProfileNotLoggedIn.vue'
import ProfileForm from '~/features/user/components/ProfileForm.vue'

useHead({
  title: 'HEat - Mi Perfil'
})

const user = useSupabaseUser()
const supabase = useSupabaseClient()
const profileStore = useProfileStore()

const isSaving = ref(false)

// Fetch profile on mount
onMounted(async () => {
  await profileStore.fetchProfile()
})

const handleSaveProfile = async (data: { name: string; phone: string; address: string }) => {
  if (!data.name.trim()) {
    toast.error('Nombre requerido')
    return
  }

  isSaving.value = true
  try {
    await profileStore.updateProfile({
      name: data.name.trim(),
      phone: data.phone || undefined,
      address: data.address?.trim() || undefined
    })
    
    toast.success('Perfil actualizado', {
      description: 'Tus datos se han guardado correctamente'
    })
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
  <div class="space-y-6 min-w-0">
    <!-- Header -->
    <div class="text-center">
      <h1 class="text-2xl font-extrabold text-heat-black mb-1">
        Mi Perfil
      </h1>
    </div>
    
    <!-- Loading -->
    <div v-if="profileStore.isLoading && !profileStore.profile" class="text-center py-16">
      <span class="i-lucide-loader-2 text-3xl text-heat-orange animate-spin" />
    </div>
    
    <!-- Not Logged In -->
    <ProfileNotLoggedIn v-else-if="!user" />
    
    <!-- Logged In -->
    <template v-else>
      <!-- Avatar Section -->
      <ProfileAvatar
        :avatar-url="user.user_metadata?.avatar_url"
        :display-name="profileStore.displayName"
        :display-emoji="profileStore.displayEmoji"
        :email="user.email || ''"
      />
      
      <!-- Profile Form -->
      <ProfileForm
        :profile="profileStore.profile"
        :is-saving="isSaving"
        @save="handleSaveProfile"
      />
      
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
