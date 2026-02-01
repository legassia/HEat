import { defineStore } from 'pinia'
import type { SupabaseClient } from '@supabase/supabase-js'
import type { Database } from '~/types/database.types'

type ProfileRow = Database['public']['Tables']['profiles']['Row']

export interface UserProfile {
  id: string
  name: string
  phone: string
  email: string
  avatarUrl: string | null
  address: string | null
  emoji: string | null
}

export const useProfileStore = defineStore('profile', {
  state: () => ({
    profile: null as UserProfile | null,
    isLoading: false,
    error: null as string | null,
    _initialized: false
  }),

  getters: {
    hasPhone: (state) => !!state.profile?.phone,
    hasAddress: (state) => !!state.profile?.address,
    displayName: (state) => state.profile?.name || 'Usuario',
    displayEmoji: (state) => state.profile?.emoji || '🔥'
  },

  actions: {
    async fetchProfile() {
      const supabase = useSupabaseClient() as SupabaseClient<Database>
      const { data: { session } } = await supabase.auth.getSession()
      
      if (!session?.user?.id) {
        this.profile = null
        return
      }

      this.isLoading = true
      this.error = null
      
      try {
        const { data, error: fetchError } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', session.user.id)
          .single()
        
        if (fetchError && fetchError.code !== 'PGRST116') {
          throw fetchError
        }
        
        const row = data as ProfileRow | null
        const user = session.user
        
        this.profile = {
          id: user.id,
          name: row?.name || user.user_metadata?.full_name || '',
          phone: row?.phone || user.phone || '',
          email: user.email || '',
          avatarUrl: row?.avatar_url || user.user_metadata?.avatar_url || null,
          address: row?.address || null,
          emoji: row?.emoji || null
        }
        
        this._initialized = true
      } catch (e: unknown) {
        const errorMsg = e instanceof Error ? e.message : 'Error al cargar perfil'
        this.error = errorMsg
        console.error('Error fetching profile:', e)
      } finally {
        this.isLoading = false
      }
    },

    async updateProfile(updates: Partial<Pick<UserProfile, 'name' | 'phone' | 'address'>>) {
      const supabase = useSupabaseClient() as SupabaseClient<Database>
      
      this.isLoading = true
      this.error = null
      
      try {
        const { data: { session } } = await supabase.auth.getSession()
        const userId = session?.user?.id
        
        if (!userId) {
          throw new Error('No hay sesión activa')
        }
        
        const updateData = {
          name: updates.name ?? null,
          phone: updates.phone ?? null,
          address: updates.address ?? null,
          updated_at: new Date().toISOString()
        }
        
        // Try UPDATE first (profile likely exists from trigger)
        const { data, error: updateError } = await supabase
          .from('profiles')
          .update(updateData)
          .eq('id', userId)
          .select()
        
        // If no rows updated, try INSERT
        if (!updateError && (!data || data.length === 0)) {
          const { error: insertError } = await supabase
            .from('profiles')
            .insert({
              id: userId,
              ...updateData
            })
          
          if (insertError) throw insertError
        } else if (updateError) {
          throw updateError
        }
        
        // Update local state immediately
        if (this.profile) {
          if (updates.name !== undefined) this.profile.name = updates.name
          if (updates.phone !== undefined) this.profile.phone = updates.phone
          if (updates.address !== undefined) this.profile.address = updates.address ?? null
        }
        
        return true
      } catch (e: unknown) {
        const errorMsg = e instanceof Error ? e.message : 'Error al actualizar perfil'
        this.error = errorMsg
        throw e
      } finally {
        this.isLoading = false
      }
    },

    reset() {
      this.profile = null
      this.isLoading = false
      this.error = null
      this._initialized = false
    }
  }
})
