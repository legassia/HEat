<script setup lang="ts">
const props = defineProps<{
  modelValue: string
  disabled?: boolean
  placeholder?: string
}>()

const emit = defineEmits<{
  'update:modelValue': [value: string]
}>()

// Country codes
const countryCodes = [
  { code: '+57', flag: '🇨🇴', name: 'Colombia' },
  { code: '+58', flag: '🇻🇪', name: 'Venezuela' },
  { code: '+52', flag: '🇲🇽', name: 'México' },
  { code: '+1', flag: '🇺🇸', name: 'USA' },
  { code: '+34', flag: '🇪🇸', name: 'España' },
  { code: '+51', flag: '🇵🇪', name: 'Perú' },
  { code: '+54', flag: '🇦🇷', name: 'Argentina' },
  { code: '+56', flag: '🇨🇱', name: 'Chile' }
]

// Parse existing value to extract country code and number
const parsePhone = (value: string) => {
  if (!value) return { code: '+57', number: '' }
  
  // Try to find matching country code
  for (const c of countryCodes) {
    if (value.startsWith(c.code)) {
      return { code: c.code, number: value.slice(c.code.length) }
    }
  }
  
  // If starts with +, extract code (up to 3 digits after +)
  if (value.startsWith('+')) {
    const match = value.match(/^(\+\d{1,3})(.*)$/)
    if (match) {
      return { code: match[1], number: match[2] }
    }
  }
  
  // No code found, assume Colombia
  return { code: '+57', number: value.replace(/^\+/, '') }
}

const parsed = computed(() => parsePhone(props.modelValue))
const countryCode = ref(parsed.value.code)
const phoneNumber = ref(parsed.value.number)

// Watch for external changes
watch(() => props.modelValue, (newVal) => {
  const p = parsePhone(newVal)
  countryCode.value = p.code
  phoneNumber.value = p.number
})

// Emit full number when either changes
const emitFullNumber = () => {
  const cleanNumber = phoneNumber.value.replace(/\D/g, '')
  emit('update:modelValue', cleanNumber ? `${countryCode.value}${cleanNumber}` : '')
}

watch([countryCode, phoneNumber], emitFullNumber)

// Format display (optional: add dashes for readability)
const formatNumber = (num: string) => {
  const clean = num.replace(/\D/g, '')
  if (clean.length <= 3) return clean
  if (clean.length <= 6) return `${clean.slice(0,3)}-${clean.slice(3)}`
  return `${clean.slice(0,3)}-${clean.slice(3,6)}-${clean.slice(6,10)}`
}

const handleInput = (e: Event) => {
  const input = e.target as HTMLInputElement
  const clean = input.value.replace(/\D/g, '')
  phoneNumber.value = clean
}
</script>

<template>
  <div class="flex gap-2">
    <!-- Country Code Selector -->
    <select
      v-model="countryCode"
      :disabled="disabled"
      class="w-28 px-3 py-3 rounded-gummy bg-heat-gray-soft border border-heat-gray-medium/50 focus:border-heat-orange focus:ring-2 focus:ring-heat-orange/20 transition-all outline-none disabled:opacity-60 appearance-none cursor-pointer text-base"
    >
      <option v-for="c in countryCodes" :key="c.code" :value="c.code">
        {{ c.flag }} {{ c.code }}
      </option>
    </select>
    
    <!-- Phone Number Input -->
    <input 
      :value="formatNumber(phoneNumber)"
      type="tel"
      inputmode="numeric"
      :disabled="disabled"
      :placeholder="placeholder || '314-368-6786'"
      class="flex-1 px-4 py-3 rounded-gummy bg-heat-gray-soft border border-heat-gray-medium/50 focus:border-heat-orange focus:ring-2 focus:ring-heat-orange/20 transition-all outline-none disabled:opacity-60 text-base"
      @input="handleInput"
    />
  </div>
</template>
