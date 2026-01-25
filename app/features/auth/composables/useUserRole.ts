// Composable for user role management
export function useUserRole() {
  const user = useSupabaseUser()
  const supabase = useSupabaseClient()
  
  const userRole = ref<'customer' | 'admin' | 'dev'>('customer')
  const isLoading = ref(false)
  
  // Fetch user role from database
  const fetchRole = async () => {
    if (!user.value?.id) {
      userRole.value = 'customer'
      return
    }
    
    isLoading.value = true
    try {
      const { data, error } = await supabase
        .from('users')
        .select('role')
        .eq('id', user.value.id)
        .single()
      
      if (error) {
        console.error('Error fetching user role:', error)
        userRole.value = 'customer'
      } else {
        userRole.value = data?.role || 'customer'
      }
    } catch (e) {
      console.error('Error fetching user role:', e)
      userRole.value = 'customer'
    } finally {
      isLoading.value = false
    }
  }
  
  // Watch for user changes and fetch role
  watch(user, () => {
    fetchRole()
  }, { immediate: true })
  
  // Computed helpers
  const isAdmin = computed(() => userRole.value === 'admin' || userRole.value === 'dev')
  const isDev = computed(() => userRole.value === 'dev')
  const isCustomer = computed(() => userRole.value === 'customer')
  
  // Check if user has specific role
  const hasRole = (role: 'customer' | 'admin' | 'dev') => userRole.value === role
  
  // Check if user has any of the specified roles
  const hasAnyRole = (roles: Array<'customer' | 'admin' | 'dev'>) => roles.includes(userRole.value)
  
  return {
    userRole,
    isLoading,
    isAdmin,
    isDev,
    isCustomer,
    hasRole,
    hasAnyRole,
    fetchRole
  }
}

