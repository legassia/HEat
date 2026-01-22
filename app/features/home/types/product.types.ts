export interface ProductOption {
  id: string
  name: string
  group: string
  priceModifier: number
  isDefault: boolean
}

export interface Product {
  id: string
  name: string
  category: string
  basePrice: number
  imageUrl?: string
  image?: string // Emoji placeholder
  description?: string
  popular?: boolean
  options?: ProductOption[]
}

export interface ProductCategory {
  id: string
  name: string
  icon: string
  description: string
}

export interface ConfiguredProduct {
  product: Product
  selectedOptions: ProductOption[]
  quantity: number
  totalPrice: number
}

