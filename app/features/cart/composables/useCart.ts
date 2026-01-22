import { useCartStore } from '../store/cart.store'

export function useCart() {
  const cartStore = useCartStore()
  const router = useRouter()
  
  const addToCart = (item: Parameters<typeof cartStore.addItem>[0]) => {
    cartStore.addItem(item)
  }

  const removeFromCart = (itemId: string) => {
    cartStore.removeItem(itemId)
  }

  const updateQuantity = (itemId: string, quantity: number) => {
    cartStore.updateQuantity(itemId, quantity)
  }

  const clearCart = () => {
    cartStore.clearCart()
  }

  const openCartDrawer = () => {
    cartStore.openDrawer()
  }

  const closeCartDrawer = () => {
    cartStore.closeDrawer()
  }

  const goToCheckout = () => {
    cartStore.closeDrawer()
    router.push('/carrito')
  }

  return {
    // State
    items: computed(() => cartStore.items),
    itemCount: computed(() => cartStore.itemCount),
    subtotal: computed(() => cartStore.subtotal),
    total: computed(() => cartStore.total),
    formattedSubtotal: computed(() => cartStore.formattedSubtotal),
    formattedTotal: computed(() => cartStore.formattedTotal),
    isEmpty: computed(() => cartStore.isEmpty),
    isDrawerOpen: computed(() => cartStore.isDrawerOpen),
    
    // Actions
    addToCart,
    removeFromCart,
    updateQuantity,
    clearCart,
    openCartDrawer,
    closeCartDrawer,
    goToCheckout
  }
}

