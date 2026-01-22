import { defineStore } from 'pinia'

export interface CartItemOption {
  id: string
  name: string
  priceModifier: number
  quantity: number
}

export interface CartItem {
  id: string
  productId: string
  productName: string
  basePrice: number
  quantity: number
  selectedOptions: CartItemOption[]
  imageUrl?: string
  category?: string
}

interface CartState {
  items: CartItem[]
  isDrawerOpen: boolean
}

// Helper function for formatting price
const formatPrice = (amount: number): string => {
  return new Intl.NumberFormat('es-CO', {
    style: 'currency',
    currency: 'COP',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0
  }).format(amount)
}

export const useCartStore = defineStore('cart', {
  state: (): CartState => ({
    items: [],
    isDrawerOpen: false
  }),

  getters: {
    itemCount(state): number {
      return state.items.reduce((acc: number, item: CartItem) => acc + item.quantity, 0)
    },
    
    subtotal(state): number {
      return state.items.reduce((acc: number, item: CartItem) => {
        const optionsTotal = item.selectedOptions.reduce((sum: number, opt: CartItemOption) => 
          sum + (opt.priceModifier * opt.quantity), 0
        )
        return acc + (item.basePrice + optionsTotal) * item.quantity
      }, 0)
    },
    
    total(): number {
      return this.subtotal
    },
    
    formattedSubtotal(): string {
      return formatPrice(this.subtotal)
    },
    
    formattedTotal(): string {
      return formatPrice(this.total)
    },
    
    isEmpty(state): boolean {
      return state.items.length === 0
    }
  },

  actions: {
    addItem(item: Omit<CartItem, 'id' | 'quantity'>) {
      const existingIndex = this.items.findIndex((existing: CartItem) => 
        existing.productId === item.productId &&
        JSON.stringify(existing.selectedOptions.map((o: CartItemOption) => `${o.id}:${o.quantity}`).sort()) === 
        JSON.stringify(item.selectedOptions.map((o: CartItemOption) => `${o.id}:${o.quantity}`).sort())
      )

      if (existingIndex !== -1) {
        const existingItem = this.items[existingIndex]
        if (existingItem) {
          existingItem.quantity++
        }
      } else {
        this.items.push({
          ...item,
          id: crypto.randomUUID(),
          quantity: 1
        })
      }
    },

    addItemWithToast(item: Omit<CartItem, 'id' | 'quantity'>) {
      this.addItem(item)
      // Toast will be called from component using vue-sonner
    },

    removeItem(itemId: string) {
      const index = this.items.findIndex((item: CartItem) => item.id === itemId)
      if (index !== -1) {
        this.items.splice(index, 1)
      }
    },

    updateQuantity(itemId: string, quantity: number) {
      const item = this.items.find((item: CartItem) => item.id === itemId)
      if (item) {
        if (quantity <= 0) {
          this.removeItem(itemId)
        } else {
          item.quantity = quantity
        }
      }
    },

    incrementQuantity(itemId: string) {
      const item = this.items.find((item: CartItem) => item.id === itemId)
      if (item) {
        item.quantity++
      }
    },

    decrementQuantity(itemId: string) {
      const item = this.items.find((item: CartItem) => item.id === itemId)
      if (item) {
        if (item.quantity <= 1) {
          this.removeItem(itemId)
        } else {
          item.quantity--
        }
      }
    },

    clearCart() {
      this.items = []
    },

    openDrawer() {
      this.isDrawerOpen = true
    },

    closeDrawer() {
      this.isDrawerOpen = false
    },

    toggleDrawer() {
      this.isDrawerOpen = !this.isDrawerOpen
    }
  },

  persist: {
    key: 'heat-cart',
    pick: ['items']
  }
})
