export default defineNuxtConfig({
  compatibilityDate: '2024-11-01',
  devtools: { enabled: true },
  
  future: {
    compatibilityVersion: 4
  },

  modules: [
    '@nuxtjs/supabase',
    '@unocss/nuxt',
    '@vite-pwa/nuxt',
    '@pinia/nuxt',
    'pinia-plugin-persistedstate/nuxt'
  ],

  // Auto-import components from these directories
  components: [
    { path: '~/components', prefix: '' },
    { path: '~/shared/components/ui', prefix: '' },
    { path: '~/shared/components/layout', prefix: '' },
    { path: '~/features/cart/components', prefix: '' },
    { path: '~/features/home/components', prefix: '' },
    { path: '~/features/orders/components', prefix: '' },
    { path: '~/features/auth/components', prefix: '' },
    { path: '~/features/user/components', prefix: '' }
  ],

  css: [
    '~/shared/styles/theme.css'
  ],

  supabase: {
    redirectOptions: {
      login: '/auth',
      callback: '/confirm',
      // Exclude all routes from auth redirect for testing
      exclude: ['/', '/avisos', '/carrito', '/historial', '/perfil', '/checkout', '/**']
    }
  },

  pwa: {
    registerType: 'autoUpdate',
    manifest: {
      name: 'HEat - Pedidos de Comida',
      short_name: 'HEat',
      description: 'Plataforma de pedidos de comida rápida',
      theme_color: '#FF6B35',
      background_color: '#FFFEFA',
      display: 'standalone',
      orientation: 'portrait',
      icons: [
        {
          src: '/icons/icon-192.png',
          sizes: '192x192',
          type: 'image/png'
        },
        {
          src: '/icons/icon-512.png',
          sizes: '512x512',
          type: 'image/png'
        }
      ]
    },
    workbox: {
      navigateFallback: '/',
      globPatterns: ['**/*.{js,css,html,png,svg,ico}']
    },
    client: {
      installPrompt: true
    }
  },

  app: {
    head: {
      title: 'HEat - Pedidos de Comida',
      meta: [
        { name: 'description', content: 'Pide tus arepas, perros y hamburguesas favoritas' },
        { name: 'theme-color', content: '#FF6B35' }
      ],
      link: [
        { rel: 'preconnect', href: 'https://fonts.googleapis.com' },
        { rel: 'preconnect', href: 'https://fonts.gstatic.com', crossorigin: '' },
        { rel: 'stylesheet', href: 'https://fonts.googleapis.com/css2?family=Nunito:wght@400;600;700;800&display=swap' }
      ]
    }
  },

  runtimeConfig: {
    public: {
      baseUrl: process.env.NUXT_PUBLIC_BASE_URL || 'http://localhost:3000'
    }
  }
})
