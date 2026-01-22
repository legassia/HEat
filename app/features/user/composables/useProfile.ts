import type { SupabaseClient } from '@supabase/supabase-js'
import type { Database } from '~/types/database.types'

type ProfileRow = Database['public']['Tables']['profiles']['Row']
type ProfileInsert = Database['public']['Tables']['profiles']['Insert']

export interface UserProfile {
  id: string
  name: string
  phone: string
  email: string
  avatarUrl: string | null
  address: string | null
}

export function useProfile() {
  const supabase = useSupabaseClient() as SupabaseClient<Database>
  const user = useSupabaseUser()
  
  const profile = ref<UserProfile | null>(null)
  const isLoading = ref(false)
  const error = ref<string | null>(null)

  const fetchProfile = async () => {
    if (!user.value) {
      profile.value = null
      return
    }

    isLoading.value = true
    error.value = null
    
    try {
      const { data, error: fetchError } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.value.id)
        .single()
      
      if (fetchError && fetchError.code !== 'PGRST116') {
        throw fetchError
      }
      
      const row = data as ProfileRow | null
      
      profile.value = {
        id: user.value.id,
        name: row?.name || user.value.user_metadata?.full_name || '',
        phone: row?.phone || user.value.phone || '',
        email: user.value.email || '',
        avatarUrl: row?.avatar_url || user.value.user_metadata?.avatar_url || null,
        address: row?.address || null
      }
    } catch (e: unknown) {
      const errorMsg = e instanceof Error ? e.message : 'Error al cargar perfil'
      error.value = errorMsg
      console.error('Error fetching profile:', e)
    } finally {
      isLoading.value = false
    }
  }

  const updateProfile = async (updates: Partial<UserProfile>) => {
    if (!user.value) return false

    isLoading.value = true
    error.value = null
    
    try {
      const insertData: ProfileInsert = {
        id: user.value.id,
        name: updates.name ?? null,
        phone: updates.phone ?? null,
        address: updates.address ?? null,
        updated_at: new Date().toISOString()
      }
      
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const { error: updateError } = await (supabase as any)
        .from('profiles')
        .upsert(insertData)
      
      if (updateError) throw updateError
      
      if (profile.value) {
        Object.assign(profile.value, updates)
      }
      
      return true
    } catch (e: unknown) {
      const errorMsg = e instanceof Error ? e.message : 'Error al actualizar perfil'
      error.value = errorMsg
      throw e
    } finally {
      isLoading.value = false
    }
  }

  watch(user, () => {
    fetchProfile()
  }, { immediate: true })

  return {
    profile: readonly(profile),
    isLoading: readonly(isLoading),
    error: readonly(error),
    fetchProfile,
    updateProfile
  }
}
