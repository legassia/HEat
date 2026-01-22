<script setup lang="ts">
definePageMeta({
  layout: false
})

useHead({
  title: 'HEat - Confirmando...'
})

const router = useRouter()
const user = useSupabaseUser()

// Watch for user to be authenticated
watch(user, (newUser) => {
  if (newUser) {
    // Small delay for better UX
    setTimeout(() => {
      router.push('/')
    }, 1500)
  }
}, { immediate: true })
</script>

<template>
  <div class="min-h-screen min-h-[100dvh] bg-heat-gray-soft flex items-center justify-center p-4">
    <div class="text-center">
      <!-- Animated Logo -->
      <div class="w-24 h-24 mx-auto rounded-gummy-xl gradient-orange flex items-center justify-center shadow-gummy animate-pulse-gummy">
        <span class="text-white text-4xl font-extrabold">A</span>
      </div>
      
      <h1 class="text-2xl font-bold text-heat-black mt-6 mb-2">
        Confirmando...
      </h1>
      <p class="text-heat-gray-dark">
        Un momento, estamos verificando tu sesión
      </p>
      
      <!-- Loading dots -->
      <div class="flex justify-center gap-2 mt-6">
        <span class="w-3 h-3 rounded-full bg-heat-orange animate-bounce" style="animation-delay: 0ms" />
        <span class="w-3 h-3 rounded-full bg-heat-orange animate-bounce" style="animation-delay: 150ms" />
        <span class="w-3 h-3 rounded-full bg-heat-orange animate-bounce" style="animation-delay: 300ms" />
      </div>
    </div>
  </div>
</template>

