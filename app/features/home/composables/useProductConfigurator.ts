import type { Product, ProductOption } from '../types/product.types'
import { OPTIONS_BY_CATEGORY, OPTION_GROUPS, getProductCategory } from '../data/productOptions.data'

interface OptionGroup {
  name: string
  options: ProductOption[]
}

export function useProductConfigurator(product: Ref<Product | null>) {
  const selectedOptions = ref<Set<string>>(new Set())

  const productOptions = computed<ProductOption[]>(() => {
    if (!product.value) return []
    const category = getProductCategory(product.value)
    return OPTIONS_BY_CATEGORY[category] || []
  })

  const groupedOptions = computed<Record<string, OptionGroup>>(() => {
    const groups: Record<string, OptionGroup> = {}
    
    for (const option of productOptions.value) {
      if (!groups[option.group]) {
        groups[option.group] = {
          name: OPTION_GROUPS[option.group] || option.group,
          options: []
        }
      }
      groups[option.group]?.options.push(option)
    }
    
    return groups
  })

  const totalPrice = computed(() => {
    if (!product.value) return 0
    
    let total = product.value.basePrice
    for (const optId of selectedOptions.value) {
      const option = productOptions.value.find(o => o.id === optId)
      if (option) total += option.priceModifier
    }
    
    return total
  })

  const formattedPrice = computed(() => {
    return new Intl.NumberFormat('es-VE', {
      style: 'currency',
      currency: 'COP'
    }).format(totalPrice.value)
  })

  const initDefaults = () => {
    const defaults = productOptions.value
      .filter(opt => opt.isDefault)
      .map(opt => opt.id)
    selectedOptions.value = new Set(defaults)
  }

  const toggleOption = (optionId: string) => {
    const newSet = new Set(selectedOptions.value)
    if (newSet.has(optionId)) {
      newSet.delete(optionId)
    } else {
      newSet.add(optionId)
    }
    selectedOptions.value = newSet
  }

  const getSelectedOptionsArray = () => {
    return productOptions.value.filter(opt => selectedOptions.value.has(opt.id))
  }

  watch(product, (newProduct) => {
    if (newProduct) initDefaults()
  }, { immediate: true })

  return {
    selectedOptions,
    productOptions,
    groupedOptions,
    totalPrice,
    formattedPrice,
    toggleOption,
    getSelectedOptionsArray
  }
}

