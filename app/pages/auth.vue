<script setup lang="ts">
definePageMeta({
  layout: false
})

useHead({
  title: 'HEat - Iniciar Sesión'
})

const supabase = useSupabaseClient()
const route = useRoute()
const router = useRouter()

const mode = computed(() => route.query.mode === 'register' ? 'register' : 'login')
const isLoading = ref(false)
const error = ref('')

// Phone auth
const phone = ref('')
const otp = ref('')
const showOtpInput = ref(false)

const signInWithGoogle = async () => {
  isLoading.value = true
  error.value = ''
  
  try {
    const { error: authError } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: `${window.location.origin}/confirm`
      }
    })
    
    if (authError) throw authError
  } catch (e: any) {
    error.value = e.message || 'Error al iniciar sesión'
  } finally {
    isLoading.value = false
  }
}

const sendOtp = async () => {
  if (!phone.value) {
    error.value = 'Ingresa tu número de teléfono'
    return
  }
  
  isLoading.value = true
  error.value = ''
  
  try {
    const { error: authError } = await supabase.auth.signInWithOtp({
      phone: phone.value
    })
    
    if (authError) throw authError
    showOtpInput.value = true
  } catch (e: any) {
    error.value = e.message || 'Error al enviar código'
  } finally {
    isLoading.value = false
  }
}

const verifyOtp = async () => {
  if (!otp.value) {
    error.value = 'Ingresa el código de verificación'
    return
  }
  
  isLoading.value = true
  error.value = ''
  
  try {
    const { error: authError } = await supabase.auth.verifyOtp({
      phone: phone.value,
      token: otp.value,
      type: 'sms'
    })
    
    if (authError) throw authError
    router.push('/')
  } catch (e: any) {
    error.value = e.message || 'Código inválido'
  } finally {
    isLoading.value = false
  }
}
</script>

<template>
  <div class="min-h-screen min-h-[100dvh] bg-heat-gray-soft flex items-center justify-center p-4">
    <div class="w-full max-w-md">
      <!-- Logo -->
      <div class="text-center mb-8">
        <NuxtLink to="/" class="inline-flex items-center gap-3">
          <div class="w-16 h-16 rounded-gummy-lg gradient-orange flex items-center justify-center shadow-gummy">
            <span class="text-white text-3xl font-extrabold">H</span>
          </div>
        </NuxtLink>
        <h1 class="text-3xl font-extrabold gradient-text mt-4">HEat</h1>
        <p class="text-heat-gray-dark mt-2">
          {{ mode === 'login' ? 'Bienvenido de vuelta' : 'Crea tu cuenta' }}
        </p>
      </div>
      
      <!-- Card -->
      <GummyCard padding="lg">
        <!-- Error Message -->
        <div 
          v-if="error"
          class="mb-4 p-3 rounded-gummy-sm bg-red-50 text-red-600 text-sm flex items-center gap-2"
        >
          <span class="i-lucide-alert-circle" />
          {{ error }}
        </div>
        
        <!-- Google Sign In -->
        <button 
          class="w-full flex items-center justify-center gap-3 px-6 py-3 rounded-gummy bg-white border border-heat-gray-medium hover:bg-heat-gray-soft transition-colors gummy-press"
          :disabled="isLoading"
          @click="signInWithGoogle"
        >
          <svg class="w-5 h-5" viewBox="0 0 24 24">
            <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
            <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
            <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
            <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
          </svg>
          <span class="font-semibold text-heat-black">
            Continuar con Google
          </span>
        </button>
        
        <!-- Divider -->
        <div class="flex items-center gap-4 my-6">
          <div class="flex-1 h-px bg-heat-gray-medium/50" />
          <span class="text-sm text-heat-gray-dark">o</span>
          <div class="flex-1 h-px bg-heat-gray-medium/50" />
        </div>
        
        <!-- Phone Auth -->
        <form @submit.prevent="showOtpInput ? verifyOtp() : sendOtp()">
          <div class="space-y-4">
            <div>
              <label class="block text-sm font-semibold text-heat-black mb-2">
                Número de teléfono
              </label>
              <input 
                v-model="phone"
                type="tel"
                :disabled="showOtpInput || isLoading"
                class="w-full px-4 py-3 rounded-gummy bg-heat-gray-soft border border-heat-gray-medium/50 focus:border-heat-orange focus:ring-2 focus:ring-heat-orange/20 transition-all outline-none disabled:opacity-60"
                placeholder="+58 XXX-XXX-XXXX"
              />
            </div>
            
            <!-- OTP Input -->
            <div v-if="showOtpInput">
              <label class="block text-sm font-semibold text-heat-black mb-2">
                Código de verificación
              </label>
              <input 
                v-model="otp"
                type="text"
                inputmode="numeric"
                maxlength="6"
                :disabled="isLoading"
                class="w-full px-4 py-3 rounded-gummy bg-heat-gray-soft border border-heat-gray-medium/50 focus:border-heat-orange focus:ring-2 focus:ring-heat-orange/20 transition-all outline-none text-center text-2xl tracking-widest"
                placeholder="000000"
              />
              <p class="text-xs text-heat-gray-dark mt-2 text-center">
                Enviamos un código a {{ phone }}
              </p>
            </div>
            
            <GummyButton 
              type="submit"
              variant="primary"
              class="w-full"
              :loading="isLoading"
            >
              {{ showOtpInput ? 'Verificar Código' : 'Enviar Código' }}
            </GummyButton>
            
            <button 
              v-if="showOtpInput"
              type="button"
              class="w-full text-sm text-heat-gray-dark hover:text-heat-orange transition-colors"
              @click="showOtpInput = false; otp = ''"
            >
              Cambiar número
            </button>
          </div>
        </form>
      </GummyCard>
      
      <!-- Toggle Mode -->
      <p class="text-center text-sm text-heat-gray-dark mt-6">
        {{ mode === 'login' ? '¿No tienes cuenta?' : '¿Ya tienes cuenta?' }}
        <NuxtLink 
          :to="mode === 'login' ? '/auth?mode=register' : '/auth'"
          class="text-heat-orange font-semibold hover:underline"
        >
          {{ mode === 'login' ? 'Regístrate' : 'Inicia sesión' }}
        </NuxtLink>
      </p>
      
      <!-- Back to Home -->
      <NuxtLink 
        to="/"
        class="block text-center text-sm text-heat-gray-dark hover:text-heat-orange transition-colors mt-4"
      >
        ← Volver al inicio
      </NuxtLink>
    </div>
  </div>
</template>

