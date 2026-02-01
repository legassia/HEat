import {
  defineConfig,
  presetUno,
  presetIcons,
  presetWebFonts,
  transformerDirectives,
  transformerVariantGroup
} from 'unocss'

export default defineConfig({
  presets: [
    presetUno(),
    presetIcons({
      scale: 1.2,
      cdn: 'https://esm.sh/',
      extraProperties: {
        'display': 'inline-block',
        'vertical-align': 'middle'
      }
    }),
    presetWebFonts({
      provider: 'google',
      fonts: {
        sans: 'Nunito:400,600,700,800'
      }
    })
  ],
  transformers: [
    transformerDirectives(),
    transformerVariantGroup()
  ],
  theme: {
    colors: {
      heat: {
        orange: '#FF6B35',
        'orange-light': '#FFAB40',
        'orange-dark': '#E55A2B',
        cyan: '#00D9FF',
        'cyan-dark': '#00B8D9',
        white: '#FFFEFA',
        'gray-soft': '#F5F5F5',
        'gray-medium': '#E0E0E0',
        'gray-dark': '#757575',
        black: '#1A1A1A'
      }
    },
    borderRadius: {
      gummy: '1.5rem',
      'gummy-sm': '1rem',
      'gummy-lg': '2rem',
      'gummy-xl': '2.5rem'
    },
    boxShadow: {
      gummy: '0 8px 32px rgba(255, 107, 53, 0.15)',
      'gummy-hover': '0 12px 40px rgba(255, 107, 53, 0.25)',
      'gummy-cyan': '0 8px 32px rgba(0, 217, 255, 0.15)',
      'gummy-soft': '0 4px 16px rgba(0, 0, 0, 0.08)',
      'gummy-inset': 'inset 0 2px 8px rgba(0, 0, 0, 0.06)'
    },
    animation: {
      keyframes: {
        float: '{0%, 100% { transform: translateY(0px) } 50% { transform: translateY(-10px) }}'
      },
      durations: {
        float: '3s'
      },
      timingFns: {
        float: 'ease-in-out'
      },
      counts: {
        float: 'infinite'
      }
    }
  },
  shortcuts: {
    'btn-gummy': 'px-6 py-3 rounded-gummy font-bold transition-all duration-300 transform hover:scale-105 active:scale-95',
    'btn-primary': 'btn-gummy bg-gradient-to-r from-heat-orange to-heat-orange-light text-white shadow-gummy hover:shadow-gummy-hover',
    'btn-secondary': 'btn-gummy bg-heat-white text-heat-orange border-2 border-heat-orange hover:bg-heat-orange hover:text-white',
    'btn-cyan': 'btn-gummy bg-heat-cyan text-white shadow-gummy-cyan hover:bg-heat-cyan-dark',
    'card-gummy': 'bg-heat-white rounded-gummy-lg shadow-gummy-soft p-4 border border-heat-gray-medium/30',
    'nav-item': 'flex flex-col items-center gap-1 p-2 rounded-gummy-sm transition-colors',
    'nav-item-active': 'text-heat-orange bg-heat-orange/10',
    'nav-item-inactive': 'text-heat-gray-dark hover:text-heat-orange hover:bg-heat-orange/5',
    'gradient-orange': 'bg-gradient-to-r from-heat-orange to-heat-orange-light',
    'gradient-cyan': 'bg-gradient-to-r from-heat-cyan to-heat-cyan-dark',
    'text-gradient': 'bg-clip-text text-transparent bg-gradient-to-r from-heat-orange to-heat-orange-light',
    'animate-float': 'animate-float'
  },
  safelist: [
    // Navigation icons
    'i-lucide-home',
    'i-lucide-megaphone',
    'i-lucide-shopping-cart',
    'i-lucide-history',
    'i-lucide-user',
    // Action icons
    'i-lucide-plus',
    'i-lucide-minus',
    'i-lucide-x',
    'i-lucide-check',
    'i-lucide-trash-2',
    // Navigation arrows
    'i-lucide-chevron-left',
    'i-lucide-chevron-right',
    'i-lucide-chevron-up',
    'i-lucide-chevron-down',
    // UI icons
    'i-lucide-menu',
    'i-lucide-phone',
    'i-lucide-clock',
    'i-lucide-map-pin',
    'i-lucide-truck',
    'i-lucide-bike',
    'i-lucide-coffee',
    'i-lucide-shopping-bag',
    'i-lucide-store',
    'i-lucide-utensils',
    'i-lucide-search',
    'i-lucide-settings',
    'i-lucide-log-out',
    'i-lucide-edit',
    'i-lucide-save',
    // Social / Auth
    'i-lucide-mail',
    'i-lucide-lock',
    'i-lucide-eye',
    'i-lucide-eye-off',
    // Status icons
    'i-lucide-loader-2',
    'i-lucide-alert-circle',
    'i-lucide-info',
    'i-lucide-check-circle',
    // TTS & Orders
    'i-lucide-volume-2',
    'i-lucide-square',
    'i-lucide-copy',
    'i-lucide-clipboard-list',
    'i-lucide-alert-triangle',
    'i-lucide-flame',
    'i-lucide-package-check',
    'i-lucide-x-circle',
    'i-lucide-hand-coins',
    'i-lucide-badge-dollar-sign',
    'i-lucide-chef-hat',
    // Order status badge colors (dynamic classes)
    'bg-yellow-100', 'text-yellow-700',
    'bg-orange-100', 'text-orange-700',
    'bg-cyan-100', 'text-cyan-700',
    'bg-red-100', 'text-red-700',
    'bg-red-50/40',
    'bg-emerald-100', 'text-emerald-700',
    'bg-emerald-50/40',
    'bg-gray-100', 'text-gray-500'
  ]
})
