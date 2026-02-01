export default defineNuxtRouteMiddleware(async () => {
  const supabase = useSupabaseClient()
  
  // Get fresh session from Supabase (handles cookie restoration)
  const { data: { session } } = await supabase.auth.getSession()
  
  if (!session) {
    return navigateTo('/auth')
  }
})
