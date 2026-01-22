import type { Product, ProductOption, ConfiguredProduct } from '../types/product.types'

export function useProductBuilder() {
  const selectedProduct = ref<Product | null>(null)
  const selectedOptions = ref<Set<string>>(new Set())
  const isConfiguratorOpen = ref(false)

  const openConfigurator = (product: Product) => {
    selectedProduct.value = product
    selectedOptions.value = new Set()
    isConfiguratorOpen.value = true
  }

  const closeConfigurator = () => {
    isConfiguratorOpen.value = false
    // Small delay before clearing product for smooth animation
    setTimeout(() => {
      selectedProduct.value = null
      selectedOptions.value.clear()
    }, 300)
  }

  const toggleOption = (optionId: string) => {
    if (selectedOptions.value.has(optionId)) {
      selectedOptions.value.delete(optionId)
    } else {
      selectedOptions.value.add(optionId)
    }
    // Trigger reactivity
    selectedOptions.value = new Set(selectedOptions.value)
  }

  const calculateTotal = (product: Product, options: ProductOption[]): number => {
    const optionsTotal = options.reduce((sum, opt) => sum + opt.priceModifier, 0)
    return product.basePrice + optionsTotal
  }

  const getConfiguredProduct = (options: ProductOption[]): ConfiguredProduct | null => {
    if (!selectedProduct.value) return null

    return {
      product: selectedProduct.value,
      selectedOptions: options,
      quantity: 1,
      totalPrice: calculateTotal(selectedProduct.value, options)
    }
  }

  return {
    selectedProduct: readonly(selectedProduct),
    selectedOptions: readonly(selectedOptions),
    isConfiguratorOpen: readonly(isConfiguratorOpen),
    openConfigurator,
    closeConfigurator,
    toggleOption,
    calculateTotal,
    getConfiguredProduct
  }
}

