<script setup lang="ts">
// Importar GSAP para animaciones futuras
import { gsap } from 'gsap'

// Proveer GSAP globalmente para uso en componentes
provide('gsap', gsap)
</script>

<template>
  <NuxtLayout>
    <NuxtPage />
  </NuxtLayout>
</template>

<style>
/* Global styles loaded from theme.css via nuxt.config */
</style>
