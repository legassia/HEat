<script setup lang="ts">
const currentYear = new Date().getFullYear()

const socialLinks = [
  { icon: 'i-lucide-instagram', url: '#', label: 'Instagram' },
  { icon: 'i-lucide-facebook', url: '#', label: 'Facebook' }
]

const contactInfo = [
  { icon: 'i-lucide-phone', text: '+58 XXX-XXX-XXXX' },
  { icon: 'i-lucide-clock', text: 'Lun-Dom: 8am - 10pm' },
  { icon: 'i-lucide-map-pin', text: 'Tu ciudad, Venezuela' }
]
</script>

<template>
  <footer class="bg-heat-white border-t border-heat-gray-medium/30 ml-[var(--sidenav-width)]">
    <div class="max-w-7xl mx-auto px-8 py-12">
      <div class="grid grid-cols-1 md:grid-cols-3 gap-8">
        <!-- Brand -->
        <div>
          <div class="flex items-center gap-3 mb-4">
            <div class="w-12 h-12 rounded-gummy gradient-orange flex items-center justify-center shadow-gummy">
              <span class="text-white text-2xl font-extrabold">H</span>
            </div>
            <span class="text-3xl font-extrabold gradient-text">HEat</span>
          </div>
          <p class="text-heat-gray-dark text-sm leading-relaxed">
            Tu lugar favorito para pedir arepas, perros calientes y hamburguesas. 
            Sabor casero con un toque especial.
          </p>
        </div>
        
        <!-- Contact -->
        <div>
          <h4 class="font-bold text-heat-black mb-4">Contacto</h4>
          <ul class="space-y-3">
            <li 
              v-for="(info, idx) in contactInfo" 
              :key="idx"
              class="flex items-center gap-3 text-heat-gray-dark text-sm"
            >
              <span :class="info.icon" class="text-heat-orange text-lg" />
              <span>{{ info.text }}</span>
            </li>
          </ul>
        </div>
        
        <!-- Social -->
        <div>
          <h4 class="font-bold text-heat-black mb-4">Síguenos</h4>
          <div class="flex gap-3">
            <a 
              v-for="social in socialLinks"
              :key="social.label"
              :href="social.url"
              :aria-label="social.label"
              class="w-10 h-10 rounded-gummy bg-heat-gray-soft flex items-center justify-center hover:bg-heat-orange hover:text-white text-heat-gray-dark transition-colors gummy-press"
            >
              <span :class="social.icon" class="text-xl" />
            </a>
          </div>
        </div>
      </div>
      
      <!-- Bottom -->
      <div class="mt-12 pt-6 border-t border-heat-gray-medium/30 flex flex-col md:flex-row items-center justify-between gap-4">
        <p class="text-heat-gray-dark text-sm">
          © {{ currentYear }} HEat. Todos los derechos reservados.
        </p>
        <div class="flex gap-6 text-sm">
          <NuxtLink to="/terminos" class="text-heat-gray-dark hover:text-heat-orange transition-colors">
            Términos
          </NuxtLink>
          <NuxtLink to="/privacidad" class="text-heat-gray-dark hover:text-heat-orange transition-colors">
            Privacidad
          </NuxtLink>
        </div>
      </div>
    </div>
  </footer>
</template>

