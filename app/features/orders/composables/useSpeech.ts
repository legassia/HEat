// Text-to-Speech composable using Web Speech API
export function useSpeech() {
  const isSpeaking = ref(false)
  const isPaused = ref(false)
  const currentUtterance = ref<SpeechSynthesisUtterance | null>(null)
  const speechRate = ref(1) // 0.5, 1, 1.5, 2

  // Available speech rates
  const speechRates = [0.5, 0.75, 1, 1.25, 1.5, 2]

  // Check if speech synthesis is supported
  const isSupported = computed(() => typeof window !== 'undefined' && 'speechSynthesis' in window)
 
  // Get Spanish voice if available
  const getSpanishVoice = (): SpeechSynthesisVoice | null => {
    if (!isSupported.value) return null

    const voices = window.speechSynthesis.getVoices()

    // Try to find Spanish voice
    const spanishVoice = voices.find(v =>
      v.lang.startsWith('es') && v.voiceURI.startsWith('Paulina')
    )

    return spanishVoice || null
  }

  // Speak text
  const speak = (text: string) => {
    if (!isSupported.value) {
      console.warn('Speech synthesis not supported')
      return
    }

    // Cancel any ongoing speech
    stop()

    const utterance = new SpeechSynthesisUtterance(text)
    utterance.rate = speechRate.value
    utterance.pitch = 1
    utterance.volume = 1

    // Set Spanish voice if available
    const voice = getSpanishVoice()
    if (voice) {
      utterance.voice = voice
      utterance.lang = voice.lang
    } else {
      utterance.lang = 'es-CO' // Colombian Spanish fallback
    }

    utterance.onstart = () => {
      isSpeaking.value = true
      isPaused.value = false
    }

    utterance.onend = () => {
      isSpeaking.value = false
      isPaused.value = false
      currentUtterance.value = null
    }

    utterance.onerror = (event) => {
      console.error('Speech error:', event)
      isSpeaking.value = false
      isPaused.value = false
      currentUtterance.value = null
    }

    currentUtterance.value = utterance
    window.speechSynthesis.speak(utterance)
  }

  // Pause speech
  const pause = () => {
    if (isSupported.value && isSpeaking.value) {
      window.speechSynthesis.pause()
      isPaused.value = true
    }
  }

  // Resume speech
  const resume = () => {
    if (isSupported.value && isPaused.value) {
      window.speechSynthesis.resume()
      isPaused.value = false
    }
  }

  // Stop speech
  const stop = () => {
    if (isSupported.value) {
      window.speechSynthesis.cancel()
      isSpeaking.value = false
      isPaused.value = false
      currentUtterance.value = null
    }
  }

  // Toggle pause/resume
  const togglePause = () => {
    if (isPaused.value) {
      resume()
    } else {
      pause()
    }
  }

  // Set speech rate
  const setRate = (rate: number) => {
    speechRate.value = rate
  }

  // Cycle through rates
  const cycleRate = () => {
    const currentIndex = speechRates.indexOf(speechRate.value)
    const nextIndex = (currentIndex + 1) % speechRates.length
    speechRate.value = speechRates[nextIndex] || 1.25
  }

  // Format order for speech
  const formatOrderForSpeech = (order: {
    plate_code?: string
    items?: Array<{
      productName: string
      quantity: number
      selectedOptions?: Array<{ name: string; quantity: number }>
    }>
    total?: number
  }): string => {
    const parts: string[] = []

    if (order.plate_code) {
      parts.push(`Pedido ${order.plate_code}.`)
    }

    if (order.items && order.items.length > 0) {
      order.items.forEach(item => {
        let itemText = `${item.quantity} ${item.productName}`

        if (item.selectedOptions && item.selectedOptions.length > 0) {
          const optionsText = item.selectedOptions
            .map(opt => opt.quantity > 1 ? `${opt.quantity} ${opt.name}` : opt.name)
            .join(', ')
          itemText += ` con ${optionsText}`
        }

        parts.push(itemText)
      })
    }

    if (order.total) {
      parts.push(`Total: ${order.total.toLocaleString('es-CO')} pesos`)
    }

    return parts.join('. ')
  }

  // Speak an order
  const speakOrder = (order: Parameters<typeof formatOrderForSpeech>[0]) => {
    const text = formatOrderForSpeech(order)
    speak(text)
  }

  // Format summary for speech
  const formatSummaryForSpeech = (summary: Array<{ name: string; quantity: number }>): string => {
    if (summary.length === 0) {
      return 'No hay pedidos pendientes'
    }

    const parts = ['Resumen de pedidos pendientes:']
    summary.forEach(item => {
      parts.push(`${item.quantity} ${item.name}`)
    })

    return parts.join('. ')
  }

  // Speak summary
  const speakSummary = (summary: Array<{ name: string; quantity: number }>) => {
    const text = formatSummaryForSpeech(summary)
    speak(text)
  }

  // Cleanup on unmount
  onUnmounted(() => {
    stop()
  })

  return {
    // State
    isSpeaking,
    isPaused,
    speechRate,
    speechRates,
    isSupported,

    // Actions
    speak,
    pause,
    resume,
    stop,
    togglePause,
    setRate,
    cycleRate,

    // Order-specific
    speakOrder,
    speakSummary,
    formatOrderForSpeech,
    formatSummaryForSpeech
  }
}

