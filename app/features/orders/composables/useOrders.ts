export function useOrders() {
  const supabase = useSupabaseClient()
  const user = useSupabaseUser()
  
  const isLoading = ref(false)
  const error = ref<string | null>(null)

  const createOrder = async (orderData: { total: number, notes?: string }) => {
    if (!user.value) {
      throw new Error('Usuario no autenticado')
    }

    isLoading.value = true
    error.value = null
    
    try {
      const insertData = {
        user_id: user.value.id,
        total: orderData.total,
        notes: orderData.notes ?? null
      }
      
      const { data, error: insertError } = await supabase
        .from('orders')
        .insert(insertData as never)
        .select('id, plate_code')
        .single()
      
      if (insertError) throw insertError
      return data
    } catch (e: unknown) {
      const errorMsg = e instanceof Error ? e.message : 'Error al crear orden'
      error.value = errorMsg
      throw e
    } finally {
      isLoading.value = false
    }
  }

  const getOrder = async (orderId: string) => {
    isLoading.value = true
    error.value = null
    
    try {
      const { data, error: fetchError } = await supabase
        .from('orders')
        .select('*')
        .eq('id', orderId)
        .single()
      
      if (fetchError) throw fetchError
      return data
    } catch (e: unknown) {
      const errorMsg = e instanceof Error ? e.message : 'Error al obtener orden'
      error.value = errorMsg
      throw e
    } finally {
      isLoading.value = false
    }
  }

  const cancelOrder = async (orderId: string) => {
    if (!user.value) return false
    
    isLoading.value = true
    error.value = null
    
    try {
      const { error: updateError } = await supabase
        .from('orders')
        .update({ status: 'cancelled' } as never)
        .eq('id', orderId)
        .eq('user_id', user.value.id)
      
      if (updateError) throw updateError
      return true
    } catch (e: unknown) {
      const errorMsg = e instanceof Error ? e.message : 'Error al cancelar orden'
      error.value = errorMsg
      throw e
    } finally {
      isLoading.value = false
    }
  }

  return {
    isLoading: readonly(isLoading),
    error: readonly(error),
    createOrder,
    getOrder,
    cancelOrder
  }
}
