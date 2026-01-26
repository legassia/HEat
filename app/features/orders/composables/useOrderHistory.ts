import type { SupabaseClient } from '@supabase/supabase-js'
import type { Database } from '~/types/database.types'

type OrderRow = Database['public']['Tables']['orders']['Row']

export interface OrderItem {
  name: string
  quantity: number
  price: number
}

export interface Order {
  id: string
  plateCode: string
  status: 'pending' | 'cooking' | 'ready' | 'delivered' | 'cancelled'
  createdAt: Date
  total: number
  items: OrderItem[]
}

export function useOrderHistory() {
  const supabase = useSupabaseClient() as SupabaseClient<Database>
  const user = useSupabaseUser()
  
  const orders = ref<Order[]>([])
  const isLoading = ref(false)
  const error = ref<string | null>(null)

  const fetchOrders = async () => {
    if (!user.value?.id) {
      orders.value = []
      return
    }

    isLoading.value = true
    error.value = null
    
    try {
      const { data, error: fetchError } = await supabase
        .from('orders')
        .select('*')
        .eq('user_id', user.value.id)
        .order('created_at', { ascending: false })
      
      if (fetchError) throw fetchError
      
      const rows = (data || []) as OrderRow[]
      
      orders.value = rows.map(order => ({
        id: order.id,
        plateCode: order.plate_code,
        status: order.status,
        createdAt: new Date(order.created_at),
        total: order.total,
        items: []
      }))
    } catch (e: unknown) {
      const errorMsg = e instanceof Error ? e.message : 'Error al cargar pedidos'
      error.value = errorMsg
      console.error('Error fetching orders:', e)
    } finally {
      isLoading.value = false
    }
  }

  const subscribeToUpdates = () => {
    if (!user.value?.id) return null

    const channel = supabase
      .channel('order-updates')
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'orders',
          filter: `user_id=eq.${user.value.id}`
        },
        (payload) => {
          const updated = payload.new as OrderRow
          const existingOrder = orders.value.find(o => o.id === updated.id)
          if (existingOrder) {
            existingOrder.status = updated.status
          }
        }
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }

  watch(user, () => {
    fetchOrders()
  }, { immediate: true })

  return {
    orders: readonly(orders),
    isLoading: readonly(isLoading),
    error: readonly(error),
    fetchOrders,
    subscribeToUpdates
  }
}
