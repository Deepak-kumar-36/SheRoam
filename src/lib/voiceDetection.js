/**
 * Voice-activated distress detection using Web Speech API
 * Primary: Hindi (hi-IN) — also detects English keywords
 */

const DISTRESS_KEYWORDS = [
  // Hindi
  'bachao', 'bachaao', 'bachao mujhe', 'madad', 'madad karo',
  'police bulao', 'chhodo', 'chodo', 'roko', 'hatao',
  'koi hai', 'koi bachao',
  // English  
  'help', 'help me', 'save me', 'emergency', 'police',
  'stop', 'danger', 'sos',
  // Urgent phrases
  'mujhe bachao', 'please help', 'call police'
]

let recognition = null
let isListening = false

/**
 * Check if the browser supports SpeechRecognition
 */
export function isSupported() {
  return !!(window.SpeechRecognition || window.webkitSpeechRecognition)
}

/**
 * Start continuous listening for distress keywords
 * @param {function} onDistressDetected - callback(detectedWord, fullTranscript)
 * @param {function} onTranscript - callback(text) for live display
 * @param {function} onError - callback(errorMessage)
 * @returns {boolean} success
 */
export function startListening(onDistressDetected, onTranscript = null, onError = null) {
  if (!isSupported()) {
    onError?.('Voice detection not supported in this browser. Use Chrome or Edge.')
    return false
  }

  if (isListening) return true

  const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition
  recognition = new SpeechRecognition()
  
  // Configuration
  recognition.continuous = true
  recognition.interimResults = true
  recognition.lang = 'hi-IN' // Primary: Hindi (also catches English words spoken in India)
  recognition.maxAlternatives = 3

  recognition.onresult = (event) => {
    for (let i = event.resultIndex; i < event.results.length; i++) {
      // Check all alternatives for better accuracy
      for (let j = 0; j < event.results[i].length; j++) {
        const transcript = event.results[i][j].transcript.toLowerCase().trim()
        
        onTranscript?.(transcript)

        // Check against all distress keywords
        const detected = DISTRESS_KEYWORDS.find(keyword => 
          transcript.includes(keyword)
        )

        if (detected) {
          onDistressDetected(detected, transcript)
          return
        }
      }
    }
  }

  recognition.onerror = (event) => {
    if (event.error === 'not-allowed') {
      onError?.('Microphone access denied. Please allow microphone permission.')
    } else if (event.error === 'no-speech') {
      // Expected — just no speech detected, keep listening
    } else if (event.error === 'network') {
      onError?.('Network error. Speech recognition requires internet connection.')
    } else {
      console.warn('Speech recognition error:', event.error)
    }
  }

  // Auto-restart if it stops (browser may stop after inactivity)
  recognition.onend = () => {
    if (isListening) {
      try {
        recognition.start()
      } catch (e) {
        // Already started — ignore
      }
    }
  }

  try {
    recognition.start()
    isListening = true
    return true
  } catch (e) {
    onError?.('Failed to start voice detection: ' + e.message)
    return false
  }
}

/**
 * Stop listening
 */
export function stopListening() {
  isListening = false
  if (recognition) {
    try {
      recognition.stop()
    } catch (e) {
      // ignore
    }
    recognition = null
  }
}

/**
 * Get the current listening state
 */
export function getIsListening() {
  return isListening
}
