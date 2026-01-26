import type { SupabaseClient } from '@supabase/supabase-js'
import type { Database } from '~/types/database.types'

export function useAuth() {
  const supabase = useSupabaseClient() as SupabaseClient<Database>
  const user = useSupabaseUser()
  
  const isAuthenticated = computed(() => !!user.value)
  const isLoading = ref(false)
  const error = ref<string | null>(null)

  // ============================================
  // Google OAuth
  // ============================================
  const signInWithGoogle = async () => {
    isLoading.value = true
    error.value = null
    
    try {
      const { error: authError } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: `${window.location.origin}/confirm`
        }
      })
      
      if (authError) throw authError
    } catch (e: unknown) {
      error.value = e instanceof Error ? e.message : 'Error al iniciar sesión'
      throw e
    } finally {
      isLoading.value = false
    }
  }

  // ============================================
  // Email/Password Auth
  // ============================================
  const signInWithEmail = async (email: string, password: string) => {
    isLoading.value = true
    error.value = null
    
    try {
      const { error: authError } = await supabase.auth.signInWithPassword({
        email,
        password
      })
      
      if (authError) throw authError
      return true
    } catch (e: unknown) {
      error.value = e instanceof Error ? e.message : 'Credenciales inválidas'
      throw e
    } finally {
      isLoading.value = false
    }
  }

  const signUpWithEmail = async (email: string, password: string, name?: string) => {
    isLoading.value = true
    error.value = null
    
    try {
      const { error: authError } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            full_name: name
          },
          emailRedirectTo: `${window.location.origin}/confirm`
        }
      })
      
      if (authError) throw authError
      return true
    } catch (e: unknown) {
      error.value = e instanceof Error ? e.message : 'Error al crear cuenta'
      throw e
    } finally {
      isLoading.value = false
    }
  }

  // ============================================
  // Phone Auth
  // ============================================
  const signInWithPhone = async (phone: string) => {
    isLoading.value = true
    error.value = null
    
    try {
      const { error: authError } = await supabase.auth.signInWithOtp({ phone })
      if (authError) throw authError
      return true
    } catch (e: unknown) {
      error.value = e instanceof Error ? e.message : 'Error al enviar código'
      throw e
    } finally {
      isLoading.value = false
    }
  }

  const verifyOtp = async (phone: string, token: string) => {
    isLoading.value = true
    error.value = null
    
    try {
      const { error: authError } = await supabase.auth.verifyOtp({
        phone,
        token,
        type: 'sms'
      })
      if (authError) throw authError
      return true
    } catch (e: unknown) {
      error.value = e instanceof Error ? e.message : 'Código inválido'
      throw e
    } finally {
      isLoading.value = false
    }
  }

  // ============================================
  // Sign Out
  // ============================================
  const signOut = async () => {
    isLoading.value = true
    error.value = null
    
    try {
      const { error: authError } = await supabase.auth.signOut()
      if (authError) throw authError
    } catch (e: unknown) {
      error.value = e instanceof Error ? e.message : 'Error al cerrar sesión'
      throw e
    } finally {
      isLoading.value = false
    }
  }

  // ============================================
  // Password Reset
  // ============================================
  const resetPassword = async (email: string) => {
    isLoading.value = true
    error.value = null
    
    try {
      const { error: authError } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/auth?mode=reset`
      })
      if (authError) throw authError
      return true
    } catch (e: unknown) {
      error.value = e instanceof Error ? e.message : 'Error al enviar correo'
      throw e
    } finally {
      isLoading.value = false
    }
  }

  return {
    user,
    isAuthenticated,
    isLoading: readonly(isLoading),
    error: readonly(error),
    // Google
    signInWithGoogle,
    // Email
    signInWithEmail,
    signUpWithEmail,
    resetPassword,
    // Phone
    signInWithPhone,
    verifyOtp,
    // Sign out
    signOut
  }
}
