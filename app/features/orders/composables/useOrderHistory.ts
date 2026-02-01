import type { SupabaseClient } from '@supabase/supabase-js'
import type { Database } from '~/types/database.types'

type OrderRow = Database['public']['Tables']['orders']['Row']
type OrderItemRow = Database['public']['Tables']['order_items']['Row']
type ProductRow = Database['public']['Tables']['products']['Row']

export interface OrderItem {
  name: string
  quantity: number
  price: number
  selectedOptions?: Array<{ name: string; quantity: number }>
}

export type OrderStatus = 'pending' | 'cooking' | 'ready' | 'delivered' | 'paid' | 'cancelled'

export interface Order {
  id: string
  plateCode: string
  status: OrderStatus
  createdAt: Date
  total: number
  items: OrderItem[]
}

interface OrderWithItems extends OrderRow {
  order_items: Array<OrderItemRow & { products: ProductRow | null }>
}

export function useOrderHistory() {
  const supabase = useSupabaseClient() as SupabaseClient<Database>
  const user = useSupabaseUser()

  const orders = ref<Order[]>([])
  const isLoading = ref(false)
  const error = ref<string | null>(null)
  const isAdmin = ref(false)

  const fetchOrders = async () => {
    // Get fresh session to ensure we have the latest auth state
    const { data: { session } } = await supabase.auth.getSession()
    const userId = session?.user?.id
    
    if (!userId) {
      orders.value = []
      return
    }

    isLoading.value = true
    error.value = null

    try {
      // Check if user is admin (use any to avoid strict typing issues with role column)
      const { data: profile } = await (supabase as any)
        .from('profiles')
        .select('role')
        .eq('id', userId)
        .single()
      
      const userRole = profile?.role as string | undefined
      isAdmin.value = userRole === 'admin' || userRole === 'dev'

      // Build query - admins see all, customers see only their own
      let query = supabase
        .from('orders')
        .select(`
          *,
          order_items (
            id,
            quantity,
            subtotal,
            selected_options,
            products ( id, name, category )
          )
        `)
      
      // Only filter by user_id for non-admins
      if (!isAdmin.value) {
        query = query.eq('user_id', userId)
      }
      
      const { data, error: fetchError } = await query.order('created_at', { ascending: false })

      if (fetchError) throw fetchError

      const typedData = data as OrderWithItems[] | null

      orders.value = (typedData || []).map(order => ({
        id: order.id,
        plateCode: order.plate_code,
        status: order.status as OrderStatus,
        createdAt: new Date(order.created_at),
        total: Number(order.total),
        items: order.order_items.map(item => {
          const options = item.selected_options as Array<{ name: string; quantity: number }> || []
          const productName = item.products?.name || ''
          const optionNames = options.map(o => o.name).join(', ')

          return {
            name: productName ? `${productName} ${optionNames}` : optionNames || 'Producto',
            quantity: item.quantity,
            price: Number(item.subtotal),
            selectedOptions: options
          }
        })
      }))
    } catch (e: unknown) {
      const errorMsg = e instanceof Error ? e.message : 'Error al cargar pedidos'
      error.value = errorMsg
      console.error('Error fetching orders:', e)
    } finally {
      isLoading.value = false
    }
  }

  const subscribeToUpdates = async () => {
    const { data: { session } } = await supabase.auth.getSession()
    const userId = session?.user?.id
    
    if (!userId) return null

    // Admins subscribe to all orders, customers only to their own
    const channelConfig = isAdmin.value
      ? { event: 'UPDATE' as const, schema: 'public', table: 'orders' }
      : { event: 'UPDATE' as const, schema: 'public', table: 'orders', filter: `user_id=eq.${userId}` }

    const channel = supabase
      .channel('order-updates')
      .on('postgres_changes', channelConfig, (payload) => {
        const updated = payload.new as OrderRow
        const existingOrder = orders.value.find(o => o.id === updated.id)
        if (existingOrder) {
          existingOrder.status = updated.status
        }
      })
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }

  // Watch for user logout to clear orders
  watch(() => user.value?.id, (newId, oldId) => {
    if (!newId && oldId) {
      orders.value = []
      isAdmin.value = false
    }
  })

  return {
    orders: readonly(orders),
    isLoading: readonly(isLoading),
    error: readonly(error),
    isAdmin: readonly(isAdmin),
    fetchOrders,
    subscribeToUpdates
  }
}
