<script setup lang="ts">
definePageMeta({
  layout: false
})

useHead({
  title: 'ArePaisas - Iniciar Sesión'
})

const supabase = useSupabaseClient()
const route = useRoute()
const router = useRouter()

const mode = computed(() => route.query.mode === 'register' ? 'register' : 'login')
const isLoading = ref(false)
const error = ref('')
const successMessage = ref('')

// Auth method: 'email' | 'phone'
const authMethod = ref<'email' | 'phone'>('email')

// Email auth
const email = ref('')
const password = ref('')
const name = ref('')
const showPassword = ref(false)

// Phone auth
const countryCode = ref('+57')
const phoneNumber = ref('')
const otp = ref('')
const showOtpInput = ref(false)

// Country codes for selector
const countryCodes = [
  { code: '+57', flag: '🇨🇴', name: 'Colombia' },
  { code: '+58', flag: '🇻🇪', name: 'Venezuela' },
  { code: '+52', flag: '🇲🇽', name: 'México' },
  { code: '+1', flag: '🇺🇸', name: 'USA' },
  { code: '+34', flag: '🇪🇸', name: 'España' },
  { code: '+51', flag: '🇵🇪', name: 'Perú' },
  { code: '+54', flag: '🇦🇷', name: 'Argentina' },
  { code: '+56', flag: '🇨🇱', name: 'Chile' }
]

// Full phone number
const fullPhone = computed(() => `${countryCode.value}${phoneNumber.value.replace(/\D/g, '')}`)

// Google Sign In
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

// Email Sign In
const signInWithEmail = async () => {
  if (!email.value || !password.value) {
    error.value = 'Completa todos los campos'
    return
  }
  
  isLoading.value = true
  error.value = ''
  
  try {
    const { error: authError } = await supabase.auth.signInWithPassword({
      email: email.value,
      password: password.value
    })
    
    if (authError) throw authError
    router.push('/')
  } catch (e: any) {
    error.value = e.message || 'Credenciales inválidas'
  } finally {
    isLoading.value = false
  }
}

// Email Sign Up
const signUpWithEmail = async () => {
  if (!email.value || !password.value) {
    error.value = 'Completa todos los campos'
    return
  }
  
  if (password.value.length < 6) {
    error.value = 'La contraseña debe tener al menos 6 caracteres'
    return
  }
  
  isLoading.value = true
  error.value = ''
  
  try {
    const { error: authError } = await supabase.auth.signUp({
      email: email.value,
      password: password.value,
      options: {
        data: { full_name: name.value },
        emailRedirectTo: `${window.location.origin}/confirm`
      }
    })
    
    if (authError) throw authError
    successMessage.value = 'Revisa tu correo para confirmar tu cuenta'
  } catch (e: any) {
    error.value = e.message || 'Error al crear cuenta'
  } finally {
    isLoading.value = false
  }
}

// Phone OTP
const sendOtp = async () => {
  if (!phoneNumber.value) {
    error.value = 'Ingresa tu número de teléfono'
    return
  }
  
  isLoading.value = true
  error.value = ''
  
  try {
    const { error: authError } = await supabase.auth.signInWithOtp({
      phone: fullPhone.value
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
      phone: fullPhone.value,
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

// Handle form submission
const handleSubmit = () => {
  if (authMethod.value === 'email') {
    if (mode.value === 'register') {
      signUpWithEmail()
    } else {
      signInWithEmail()
    }
  } else {
    if (showOtpInput.value) {
      verifyOtp()
    } else {
      sendOtp()
    }
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
            <span class="text-white text-3xl font-extrabold">A</span>
          </div>
        </NuxtLink>
        <h1 class="text-3xl font-extrabold gradient-text mt-4">ArePaisas</h1>
        <p class="text-heat-gray-dark mt-2">
          {{ mode === 'login' ? 'Bienvenido de vuelta' : 'Crea tu cuenta' }}
        </p>
      </div>
      
      <!-- Card -->
      <GummyCard padding="lg">
        <!-- Success Message -->
        <div 
          v-if="successMessage"
          class="mb-4 p-3 rounded-gummy-sm bg-green-50 text-green-600 text-sm flex items-center gap-2"
        >
          <span class="i-lucide-check-circle" />
          {{ successMessage }}
        </div>
        
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
          class="w-full flex items-center justify-center gap-3 px-6 py-3 rounded-gummy bg-white border border-heat-gray-medium hover:bg-heat-gray-soft transition-colors"
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
        
        <!-- Auth Method Tabs -->
        <div class="flex mb-6 bg-heat-gray-soft rounded-gummy-sm p-1">
          <button
            class="flex-1 py-2 px-4 rounded-gummy-sm text-sm font-semibold transition-all"
            :class="authMethod === 'email' ? 'bg-white shadow-sm text-heat-orange' : 'text-heat-gray-dark'"
            @click="authMethod = 'email'; showOtpInput = false"
          >
            <span class="i-lucide-mail mr-1" />
            Correo
          </button>
          <button
            class="flex-1 py-2 px-4 rounded-gummy-sm text-sm font-semibold transition-all"
            :class="authMethod === 'phone' ? 'bg-white shadow-sm text-heat-orange' : 'text-heat-gray-dark'"
            @click="authMethod = 'phone'"
          >
            <span class="i-lucide-phone mr-1" />
            Teléfono
          </button>
        </div>
        
        <!-- Email Auth Form -->
        <form v-if="authMethod === 'email'" @submit.prevent="handleSubmit">
          <div class="space-y-4">
            <!-- Name (only for register) -->
            <div v-if="mode === 'register'">
              <label class="block text-sm font-semibold text-heat-black mb-2">
                Nombre
              </label>
              <input 
                v-model="name"
                type="text"
                :disabled="isLoading"
                class="w-full px-4 py-3 rounded-gummy bg-heat-gray-soft border border-heat-gray-medium/50 focus:border-heat-orange focus:ring-2 focus:ring-heat-orange/20 transition-all outline-none disabled:opacity-60"
                placeholder="Tu nombre"
              />
            </div>
            
            <!-- Email -->
            <div>
              <label class="block text-sm font-semibold text-heat-black mb-2">
                Correo electrónico
              </label>
              <input 
                v-model="email"
                type="email"
                :disabled="isLoading"
                class="w-full px-4 py-3 rounded-gummy bg-heat-gray-soft border border-heat-gray-medium/50 focus:border-heat-orange focus:ring-2 focus:ring-heat-orange/20 transition-all outline-none disabled:opacity-60"
                placeholder="tu@correo.com"
              />
            </div>
            
            <!-- Password -->
            <div>
              <label class="block text-sm font-semibold text-heat-black mb-2">
                Contraseña
              </label>
              <div class="relative">
                <input 
                  v-model="password"
                  :type="showPassword ? 'text' : 'password'"
                  :disabled="isLoading"
                  class="w-full px-4 py-3 pr-12 rounded-gummy bg-heat-gray-soft border border-heat-gray-medium/50 focus:border-heat-orange focus:ring-2 focus:ring-heat-orange/20 transition-all outline-none disabled:opacity-60"
                  placeholder="••••••••"
                />
                <button
                  type="button"
                  class="absolute right-3 top-1/2 -translate-y-1/2 text-heat-gray-dark hover:text-heat-orange"
                  @click="showPassword = !showPassword"
                >
                  <span :class="showPassword ? 'i-lucide-eye-off' : 'i-lucide-eye'" />
                </button>
              </div>
            </div>
            
            <GummyButton 
              type="submit"
              variant="primary"
              class="w-full"
              :loading="isLoading"
            >
              {{ mode === 'register' ? 'Crear Cuenta' : 'Iniciar Sesión' }}
            </GummyButton>
          </div>
        </form>
        
        <!-- Phone Auth Form -->
        <form v-else @submit.prevent="handleSubmit">
          <div class="space-y-4">
            <div>
              <label class="block text-sm font-semibold text-heat-black mb-2">
                Número de teléfono
              </label>
              <div class="flex gap-2">
                <!-- Country Code Selector -->
                <select
                  v-model="countryCode"
                  :disabled="showOtpInput || isLoading"
                  class="px-3 py-3 rounded-gummy bg-heat-gray-soft border border-heat-gray-medium/50 focus:border-heat-orange focus:ring-2 focus:ring-heat-orange/20 transition-all outline-none disabled:opacity-60 text-sm font-medium"
                >
                  <option v-for="c in countryCodes" :key="c.code" :value="c.code">
                    {{ c.flag }} {{ c.code }}
                  </option>
                </select>
                
                <!-- Phone Number -->
                <input 
                  v-model="phoneNumber"
                  type="tel"
                  :disabled="showOtpInput || isLoading"
                  class="flex-1 px-4 py-3 rounded-gummy bg-heat-gray-soft border border-heat-gray-medium/50 focus:border-heat-orange focus:ring-2 focus:ring-heat-orange/20 transition-all outline-none disabled:opacity-60"
                  placeholder="314 368 6786"
                />
              </div>
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
                Enviamos un código a {{ fullPhone }}
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
