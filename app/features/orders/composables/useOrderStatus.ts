import { toast } from 'vue-sonner'

export type OrderStatus = 'pending' | 'cooking' | 'ready' | 'delivered' | 'paid' | 'cancelled'

export interface StatusConfig {
  label: string
  color: string        // Badge color
  cardColor: string    // Card background styling
  icon: string
}

// Status flow: pending → cooking → ready → delivered → paid
// Labels: Pendiente → Cocinando → Listo → Entregado → Pagado
export const statusConfig: Record<OrderStatus, StatusConfig> = {
  pending: {
    label: 'Pendiente',
    color: 'bg-yellow-100 text-yellow-700',
    cardColor: '',
    icon: 'i-lucide-clock'
  },
  cooking: {
    label: 'Cocinando',
    color: 'bg-orange-100 text-orange-700',
    cardColor: '',
    icon: 'i-lucide-flame'
  },
  ready: {
    label: 'Listo',
    color: 'bg-cyan-100 text-cyan-700',
    cardColor: '',
    icon: 'i-lucide-check-circle'
  },
  delivered: {
    label: 'Entregado',
    color: 'bg-red-100 text-red-700',
    cardColor: 'bg-red-50/40',  // Subtle reddish - needs payment!
    icon: 'i-lucide-hand-coins'
  },
  paid: {
    label: 'Pagado',
    color: 'bg-emerald-100 text-emerald-700',
    cardColor: 'bg-emerald-50/40',  // Subtle greenish - all done
    icon: 'i-lucide-badge-dollar-sign'
  },
  cancelled: {
    label: 'Cancelado',
    color: 'bg-gray-100 text-gray-500',
    cardColor: 'opacity-60',
    icon: 'i-lucide-x-circle'
  }
}

// Status flow: pending → cooking → ready → delivered → paid
const nextStatusMap: Record<OrderStatus, OrderStatus | null> = {
  pending: 'cooking',
  cooking: 'ready',
  ready: 'delivered',
  delivered: 'paid',
  paid: null,
  cancelled: null
}

// Button labels for advancing to next status
const nextStatusLabels: Record<OrderStatus, string> = {
  cooking: 'Aceptar',
  ready: 'Listo',
  delivered: 'Entregar',
  paid: 'Cobrar',
  pending: '',
  cancelled: ''
}

// Button icons for advancing to next status
const nextStatusIcons: Record<OrderStatus, string> = {
  cooking: 'i-lucide-chef-hat',
  ready: 'i-lucide-check',
  delivered: 'i-lucide-hand-coins',
  paid: 'i-lucide-badge-dollar-sign',
  pending: '',
  cancelled: ''
}

export function useOrderStatus(orderId: Ref<string>, currentStatus: Ref<OrderStatus>, plateCode: Ref<string>) {
  const supabase = useSupabaseClient<any>()
  const isUpdating = ref(false)

  const nextStatus = computed(() => nextStatusMap[currentStatus.value])
  const nextStatusLabel = computed(() => nextStatus.value ? nextStatusLabels[nextStatus.value] : null)
  const nextStatusIcon = computed(() => nextStatus.value ? nextStatusIcons[nextStatus.value] : null)
  const currentConfig = computed(() => statusConfig[currentStatus.value])

  const updateStatus = async (onSuccess?: (newStatus: OrderStatus) => void) => {
    if (!nextStatus.value || isUpdating.value) return
    
    isUpdating.value = true
    try {
      const { error } = await supabase
        .from('orders')
        .update({ status: nextStatus.value })
        .eq('id', orderId.value)
      
      if (error) throw error
      
      toast.success(`Pedido ${plateCode.value} actualizado`, {
        description: `Estado: ${statusConfig[nextStatus.value].label}`
      })
      
      onSuccess?.(nextStatus.value)
    } catch (e: unknown) {
      const errorMsg = e instanceof Error ? e.message : 'Error al actualizar'
      toast.error('Error', { description: errorMsg })
      console.error('Error updating order status:', e)
    } finally {
      isUpdating.value = false
    }
  }

  const cancelOrder = async (onSuccess?: () => void) => {
    if (isUpdating.value) return
    
    isUpdating.value = true
    try {
      const { error } = await supabase
        .from('orders')
        .update({ status: 'cancelled' })
        .eq('id', orderId.value)
      
      if (error) throw error
      
      toast.info(`Pedido ${plateCode.value} cancelado`)
      onSuccess?.()
    } catch (e: unknown) {
      const errorMsg = e instanceof Error ? e.message : 'Error al cancelar'
      toast.error('Error', { description: errorMsg })
    } finally {
      isUpdating.value = false
    }
  }

  return {
    isUpdating: readonly(isUpdating),
    nextStatus,
    nextStatusLabel,
    nextStatusIcon,
    currentConfig,
    statusConfig,
    updateStatus,
    cancelOrder
  }
}
