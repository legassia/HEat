import type { SupabaseClient } from '@supabase/supabase-js'
import type { Database } from '~/types/database.types'

type ProductRow = Database['public']['Tables']['products']['Row']

export function useProducts() {
  const supabase = useSupabaseClient() as SupabaseClient<Database>
  
  const products = ref<ProductRow[]>([])
  const isLoading = ref(false)
  
  // Map: category → product UUID
  const productByCategory = computed(() => {
    const map: Record<string, ProductRow> = {}
    for (const p of products.value) {
      map[p.category] = p
    }
    return map
  })
  
  const fetchProducts = async () => {
    isLoading.value = true
    try {
      const { data } = await supabase
        .from('products')
        .select('*')
        .eq('is_available', true)
      
      products.value = data || []
    } finally {
      isLoading.value = false
    }
  }
  
  // Auto-fetch on first use
  onMounted(fetchProducts)
  
  return {
    products: readonly(products),
    productByCategory,
    isLoading: readonly(isLoading),
    fetchProducts
  }
}