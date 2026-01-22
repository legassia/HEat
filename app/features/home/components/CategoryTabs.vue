<script setup lang="ts">
interface Category {
  id: string
  name: string
  icon: string
  description: string
}

const props = defineProps<{
  categories: Category[]
}>()

const modelValue = defineModel<string>()
</script>

<template>
  <div class="flex gap-4 overflow-x-auto pb-2 -mx-4 px-4 lg:mx-0 lg:px-0 snap-x snap-mandatory">
    <button
      v-for="category in categories"
      :key="category.id"
      class="flex-shrink-0 snap-start"
      @click="modelValue = category.id"
    >
      <div 
        class="card-gummy min-w-[140px] text-center transition-all duration-300 gummy-press"
        :class="modelValue === category.id 
          ? 'ring-2 ring-heat-orange shadow-gummy scale-105' 
          : 'hover:shadow-gummy-soft hover:-translate-y-1'"
      >
        <!-- Icon -->
        <div 
          class="w-16 h-16 mx-auto rounded-gummy flex items-center justify-center mb-3 transition-all"
          :class="modelValue === category.id ? 'gradient-orange shadow-gummy' : 'bg-heat-gray-soft'"
        >
          <span class="text-3xl">{{ category.icon }}</span>
        </div>
        
        <!-- Name -->
        <h3 
          class="font-bold transition-colors"
          :class="modelValue === category.id ? 'text-heat-orange' : 'text-heat-black'"
        >
          {{ category.name }}
        </h3>
        
        <!-- Description -->
        <p class="text-xs text-heat-gray-dark mt-1 line-clamp-2">
          {{ category.description }}
        </p>
      </div>
    </button>
  </div>
</template>

<style scoped>
/* Hide scrollbar but keep functionality */
div::-webkit-scrollbar {
  display: none;
}

div {
  -ms-overflow-style: none;
  scrollbar-width: none;
}
</style>

