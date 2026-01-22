import type { SupabaseClient } from '@supabase/supabase-js'
import type { Database } from '~/types/database.types'

export function useAuth() {
  const supabase = useSupabaseClient() as SupabaseClient<Database>
  const user = useSupabaseUser()
  
  const isAuthenticated = computed(() => !!user.value)
  const isLoading = ref(false)
  const error = ref<string | null>(null)

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

  return {
    user,
    isAuthenticated,
    isLoading: readonly(isLoading),
    error: readonly(error),
    signInWithGoogle,
    signInWithPhone,
    verifyOtp,
    signOut
  }
}
