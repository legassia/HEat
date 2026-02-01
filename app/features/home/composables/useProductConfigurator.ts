import { toast } from 'vue-sonner'
import { useCartStore } from '~/features/cart/store/cart.store'
import {
  categories,
  basePrices,
  ingredientConfig,
  presetProducts,
  type Category,
  type Preset,
  type Ingredient
} from '../data/menu.config'
import { useProducts } from './useProducts'

export function useProductConfigurator() {
  const cartStore = useCartStore()
  const { productByCategory } = useProducts()

  // Current category navigation
  const currentCategoryIndex = ref(0)
  const currentCategory = computed<Category | undefined>(() => categories[currentCategoryIndex.value])

  // Current ingredient counts
  const ingredientCounts = ref<Record<string, number>>({})

  // Navigate to previous category
  const prevCategory = () => {
    currentCategoryIndex.value = currentCategoryIndex.value === 0
      ? categories.length - 1
      : currentCategoryIndex.value - 1
    resetIngredients()
  }

  // Navigate to next category
  const nextCategory = () => {
    currentCategoryIndex.value = currentCategoryIndex.value === categories.length - 1
      ? 0
      : currentCategoryIndex.value + 1
    resetIngredients()
  }

  // Reset ingredients to default values
  const resetIngredients = () => {
    const config = ingredientConfig[currentCategory.value?.id || 'arepas']
    const counts: Record<string, number> = {}

    config?.proteins.forEach(p => { counts[p.id] = p.default })
    config?.extras.forEach(e => { counts[e.id] = e.default })

    ingredientCounts.value = counts
  }

  // Get current category config
  const currentConfig = computed(() => ingredientConfig[currentCategory.value?.id || 'arepas'])

  // Get current presets
  const currentPresets = computed<Preset[]>(() => presetProducts[currentCategory.value?.id || 'arepas'] || [])

  // Calculate total price
  const totalPrice = computed(() => {
    const base = basePrices[currentCategory.value?.id || 'arepas'] || 0
    let extras = 0

    const config = currentConfig.value
    if (config) {
      config.proteins.forEach(p => {
        const count = ingredientCounts.value[p.id] || 0
        if (count > 0) extras += p.price * count
      })
      config.extras.forEach(e => {
        const count = ingredientCounts.value[e.id] || 0
        if (count > 0) extras += e.price * count
      })
    }

    return base + extras
  })

  // Format price for display
  const formattedPrice = computed(() => {
    return new Intl.NumberFormat('es-CO', {
      style: 'currency',
      currency: 'COP',
      minimumFractionDigits: 0
    }).format(totalPrice.value)
  })

  // Get selected ingredients list (for display badges)
  const selectedIngredients = computed(() => {
    const selected: Array<{ id: string; name: string; count: number; price: number }> = []
    const config = currentConfig.value

    if (config) {
      config.proteins.forEach(p => {
        const count = ingredientCounts.value[p.id] || 0
        if (count > 0) {
          selected.push({ id: p.id, name: p.name, count, price: p.price })
        }
      })
      config.extras.forEach(e => {
        const count = ingredientCounts.value[e.id] || 0
        if (count > 0) {
          selected.push({ id: e.id, name: e.name, count, price: e.price })
        }
      })
    }

    return selected
  })

  // Generate product name from selected ingredients
  const productName = computed(() => {
    const cat = currentCategory.value?.name || 'Producto'
    const selected: string[] = []

    const config = currentConfig.value
    if (config) {
      config.proteins.forEach(p => {
        const count = ingredientCounts.value[p.id] || 0
        if (count === 1) selected.push(p.name)
        else if (count === 2) selected.push(`Doble ${p.name}`)
        else if (count >= 3) selected.push(`Triple ${p.name}`)
      })
    }

    if (selected.length === 0) return cat
    if (selected.length === 1) return `${cat} ${selected[0]}`
    return `${cat} ${selected.slice(0, 2).join(' y ')}`
  })

  // Build options array from current selection
  const buildOptions = () => {
    const options: Array<{ id: string; name: string; priceModifier: number; quantity: number }> = []
    const config = currentConfig.value

    if (config) {
      for (const p of config.proteins) {
        const count = ingredientCounts.value[p.id] || 0
        if (count > 0) {
          options.push({ id: p.id, name: p.name, priceModifier: p.price, quantity: count })
        }
      }
      for (const e of config.extras) {
        const count = ingredientCounts.value[e.id] || 0
        if (count > 0) {
          options.push({ id: e.id, name: e.name, priceModifier: e.price, quantity: count })
        }
      }
    }

    return options
  }

  // Add current configuration to cart
  const addToCart = () => {
    const options = buildOptions()
    const categoryId = currentCategory.value?.id || 'arepas'
    const product = productByCategory.value[categoryId]

    cartStore.addItem({
      productId: product?.id || categoryId,  // ← UUID real o fallback
      productName: productName.value,
      basePrice: basePrices[categoryId] || 0,
      selectedOptions: options,
      category: categoryId
    })

    toast.success('¡Agregado al carrito!', {
      description: productName.value
    })
  }

  // Load a preset into the configurator (for editing)
  const loadPreset = (preset: Preset) => {
    // Reset all ingredients to 0
    const config = currentConfig.value
    const counts: Record<string, number> = {}

    if (config) {
      config.proteins.forEach(p => { counts[p.id] = 0 })
      config.extras.forEach(e => { counts[e.id] = 0 })
    }

    // Apply preset values
    Object.entries(preset.config).forEach(([id, count]) => {
      if (typeof count === 'number') {
        counts[id] = count
      }
    })

    ingredientCounts.value = counts

    toast.info('Preset cargado', {
      description: `${preset.name} - Personalízalo a tu gusto`
    })
  }

  // Quick add a preset directly to cart
  const quickAddPreset = (preset: Preset) => {
    const config = currentConfig.value
    let price = basePrices[currentCategory.value?.id || 'arepas'] || 0
    const options: Array<{ id: string; name: string; priceModifier: number; quantity: number }> = []

    const categoryId = currentCategory.value?.id || 'arepas'
    const product = productByCategory.value[categoryId]


    if (config) {
      Object.entries(preset.config).forEach(([id, count]) => {
        const protein = config.proteins.find(p => p.id === id)
        const extra = config.extras.find(e => e.id === id)
        const item = protein || extra
        if (item && typeof count === 'number' && count > 0) {
          price += item.price * count
          options.push({ id, name: item.name, priceModifier: item.price, quantity: count })
        }
      })
    }

    cartStore.addItem({
      productId: product?.id || categoryId,  // ← UUID real
      productName: preset.name,
      basePrice: price,
      selectedOptions: options,
      category: categoryId
    })

    toast.success('¡Agregado al carrito!', {
      description: preset.name
    })
  }

  // Update ingredient count
  const updateIngredient = (id: string, count: number) => {
    ingredientCounts.value[id] = count
  }

  return {
    // State
    categories,
    currentCategoryIndex,
    currentCategory,
    currentConfig,
    currentPresets,
    ingredientCounts,

    // Computed
    totalPrice,
    formattedPrice,
    productName,
    selectedIngredients,

    // Actions
    prevCategory,
    nextCategory,
    resetIngredients,
    addToCart,
    loadPreset,
    quickAddPreset,
    updateIngredient
  }
}
