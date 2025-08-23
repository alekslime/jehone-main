class UliksVoiceAssistant {
  constructor() {
    this.isListening = false
    this.isActive = false
    this.recognition = null
    this.commandRecognition = null // separate recognition for commands
    this.audioPlayer = new Audio()
    this.permissionGranted = false
    this.timeoutId = null // timeout for auto-close

    this.audioFiles = {
      greeting: "audio/PERSHENDETJE ME CAR MUND TJU NDIHMOJ.mp3", // "Përshëndetje! Unë jam Uliks. Si mund t'ju ndihmoj?"
      biology: "audio/BIOLOGJI.mp3", // "Duke shkuar te mësimet e biologjisë"
      geography: "audio/GJEOGRAFI.mp3", // "Duke shkuar te mësimet e gjeografisë"
      literature: "audio/LETERSI.mp3", // "Duke shkuar te mësimet e letërsisë"
      home: "audio/HOME.mp3", // "Duke shkuar te paneli kryesor"
      error: "audio/ERROR.mp3", // "Nuk e kuptova komandën. Provoni përsëri ose thoni 'paneli' për të shkuar te kryefaqja."
    }

    console.log("[v0] Uliks Voice Assistant created")
    this.init()
  }

  async init() {
    console.log("[v0] Starting Uliks initialization...")

    // Check browser support first
    if (!("webkitSpeechRecognition" in window) && !("SpeechRecognition" in window)) {
      console.log("[v0] Speech recognition not supported")
      alert("Shfletuesi juaj nuk mbështet njohjen e zërit.")
      return
    }

    // Request microphone permission
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true })
      this.permissionGranted = true
      console.log("[v0] Microphone permission granted")
      stream.getTracks().forEach((track) => track.stop())

      // Initialize speech recognition after permission granted
      this.setupSpeechRecognition()
      this.startListening()
    } catch (error) {
      console.log("[v0] Microphone permission denied:", error)
      alert("Mikrofonit i nevojitet leje për të përdorur Uliks. Ju lutemi rifreskoni faqen dhe jepni leje.")
    }
  }

  setupSpeechRecognition() {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition
    this.recognition = new SpeechRecognition()

    this.recognition.continuous = true
    this.recognition.interimResults = true
    this.recognition.lang = "sq-AL"

    this.recognition.onstart = () => {
      console.log("[v0] Voice recognition started - say 'Uliks' to activate")
    }

    this.recognition.onresult = (event) => {
      for (let i = event.resultIndex; i < event.results.length; i++) {
        const transcript = event.results[i][0].transcript.toLowerCase().trim()
        console.log("[v0] Heard:", transcript, "Final:", event.results[i].isFinal)

        if (
          transcript.includes("uliks") ||
          transcript.includes("ulik") ||
          transcript.includes("yulik") ||
          transcript.includes("hey uliks") ||
          transcript.includes("ok uliks") ||
          transcript.includes("ulixs") ||
          transcript.includes("ulix")
        ) {
          console.log("[v0] Wake word detected!")
          this.activateUliks()
          break
        }
      }
    }

    this.recognition.onerror = (event) => {
      console.log("[v0] Speech error:", event.error)
      if (event.error === "not-allowed") {
        console.log("[v0] Microphone access denied")
        alert("Mikrofonit i nevojitet leje për të përdorur Uliks. Ju lutemi rifreskoni faqen dhe jepni leje.")
      } else if (event.error === "network") {
        console.log("[v0] Network error - retrying...")
        setTimeout(() => this.restartListening(), 3000)
      } else if (event.error !== "no-speech") {
        setTimeout(() => this.restartListening(), 2000)
      }
    }

    this.recognition.onend = () => {
      console.log("[v0] Speech recognition ended")
      if (!this.isActive) {
        this.restartListening()
      }
    }
  }

  setupCommandRecognition() {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition
    this.commandRecognition = new SpeechRecognition()

    this.commandRecognition.continuous = false
    this.commandRecognition.interimResults = false
    this.commandRecognition.lang = "sq-AL"

    this.commandRecognition.onresult = (event) => {
      const transcript = event.results[0][0].transcript.toLowerCase().trim()
      console.log("[v0] Command heard:", transcript)
      this.processCommand(transcript)
    }

    this.commandRecognition.onerror = (event) => {
      console.log("[v0] Command recognition error:", event.error)
      this.hideUliksModal()
    }

    this.commandRecognition.onend = () => {
      console.log("[v0] Command recognition ended")
      setTimeout(() => this.hideUliksModal(), 1000)
    }
  }

  startListening() {
    if (!this.recognition || this.isListening || this.isActive) {
      console.log("[v0] Cannot start listening - already active or listening")
      return
    }

    try {
      if (this.recognition.state && this.recognition.state !== "inactive") {
        console.log("[v0] Recognition not inactive, stopping first...")
        this.recognition.stop()
        setTimeout(() => this.startListening(), 1000)
        return
      }

      this.isListening = true
      this.recognition.start()
      console.log("[v0] Listening for 'Uliks'... (Try saying: Uliks, Ulik, or Hey Uliks)")
    } catch (error) {
      console.log("[v0] Error starting recognition:", error)
      this.isListening = false
      setTimeout(() => this.startListening(), 5000)
    }
  }

  restartListening() {
    if (this.isActive || this.isListening) return

    console.log("[v0] Restarting voice recognition...")
    this.isListening = false

    if (this.recognition) {
      try {
        this.recognition.stop()
      } catch (e) {
        console.log("[v0] Error stopping recognition:", e)
      }
    }

    setTimeout(() => {
      if (!this.isActive && !this.isListening) {
        this.startListening()
      }
    }, 2000)
  }

  activateUliks() {
    if (this.isActive) {
      console.log("[v0] Uliks already active")
      return
    }

    console.log("[v0] Activating Uliks...")
    this.isActive = true
    this.isListening = false

    try {
      if (this.recognition) {
        this.recognition.stop()
      }
    } catch (error) {
      console.log("[v0] Error stopping recognition:", error)
    }

    console.log("[v0] Showing Uliks modal...")
    this.showUliksModal()

    this.timeoutId = setTimeout(() => {
      console.log("[v0] Auto-closing Uliks due to timeout (18s)")
      this.hideUliksModal()
    }, 18000)

    setTimeout(() => {
      this.playAudio("greeting")
      setTimeout(() => this.listenForCommands(), 2000)
    }, 500)
  }

  listenForCommands() {
    if (!this.isActive) return

    console.log("[v0] Listening for commands...")
    this.setupCommandRecognition()

    try {
      this.commandRecognition.start()
    } catch (error) {
      console.log("[v0] Error starting command recognition:", error)
      this.hideUliksModal()
    }
  }

  processCommand(command) {
    if (this.timeoutId) {
      clearTimeout(this.timeoutId)
      this.timeoutId = null
      console.log("[v0] Timeout cleared - processing command immediately")
    }

    let audioKey = ""
    let redirect = null

    if (command.includes("biologji") || command.includes("shkencë")) {
      audioKey = "biology"
      redirect = "biologji.html"
    } else if (command.includes("gjeografi") || command.includes("hartë")) {
      audioKey = "geography"
      redirect = "gjeografi12.html"
    } else if (command.includes("letërsi") || command.includes("libra")) {
      audioKey = "literature"
      redirect = "lessons.html"
    } else if (command.includes("paneli") || command.includes("shtëpi") || command.includes("kryefaqja")) {
      audioKey = "home"
      redirect = "index.html"
    } else {
      audioKey = "error"
      redirect = null // Stay on current page
    }

    this.playAudio(audioKey)

    setTimeout(() => {
      this.hideUliksModal()
      if (redirect) {
        window.location.href = redirect
      }
    }, 2000)
  }

  showUliksModal() {
    const modal = document.getElementById("uliksModal")
    const overlay = document.getElementById("uliksOverlay")

    if (modal && overlay) {
      modal.style.display = "flex"
      overlay.style.display = "block"

      setTimeout(() => {
        overlay.classList.add("active")
        modal.classList.add("active")
      }, 10)
    }
  }

  hideUliksModal() {
    if (this.timeoutId) {
      clearTimeout(this.timeoutId)
      this.timeoutId = null
    }

    const modal = document.getElementById("uliksModal")
    const overlay = document.getElementById("uliksOverlay")

    if (modal && overlay) {
      overlay.classList.remove("active")
      modal.classList.remove("active")

      setTimeout(() => {
        modal.style.display = "none"
        overlay.style.display = "none"
        this.isActive = false

        if (this.commandRecognition) {
          try {
            this.commandRecognition.stop()
          } catch (error) {
            console.log("[v0] Error stopping command recognition:", error)
          }
        }

        setTimeout(() => {
          if (!this.isListening && !this.isActive) {
            this.startListening()
          }
        }, 1000)
      }, 500)
    }
  }

  playAudio(audioKey) {
    const audioFile = this.audioFiles[audioKey]
    if (!audioFile) {
      console.log("[v0] Audio file not found for key:", audioKey)
      return
    }

    console.log("[v0] Playing audio:", audioFile)

    // Stop any currently playing audio
    this.audioPlayer.pause()
    this.audioPlayer.currentTime = 0

    // Set the new audio source and play
    this.audioPlayer.src = audioFile
    this.audioPlayer.volume = 0.8 // Adjust volume as needed

    this.audioPlayer.onloadeddata = () => {
      console.log("[v0] Audio loaded successfully:", audioFile)
    }

    this.audioPlayer.onerror = (error) => {
      console.log("[v0] Audio loading error:", error, "for file:", audioFile)
      // Fallback to text-to-speech if MP3 fails
      this.fallbackToTTS(audioKey)
    }

    this.audioPlayer.play().catch((error) => {
      console.log("[v0] Error playing audio:", error)
      // Fallback to text-to-speech if MP3 fails
      this.fallbackToTTS(audioKey)
    })
  }

  fallbackToTTS(audioKey) {
    console.log("[Uliks] Falling back to text-to-speech for:", audioKey)

    const textMap = {
      greeting: "Hello!",
      biology: "Duke shkuar te mësimet e biologjisë",
      geography: "Duke shkuar te mësimet e gjeografisë",
      literature: "Duke shkuar te mësimet e letërsisë",
      home: "Duke shkuar te paneli kryesor",
      error: "Nuk e kuptova komandën. Provoni përsëri ose thoni 'paneli' për të shkuar te kryefaqja.",
    }

    const text = textMap[audioKey] || "Gabim në sistem"
    const utterance = new SpeechSynthesisUtterance(text)
    utterance.rate = 0.9
    utterance.pitch = 1.0
    utterance.lang = "sq-AL"

    window.speechSynthesis.speak(utterance)
  }
}

document.addEventListener("DOMContentLoaded", () => {
  console.log("[v0] DOM loaded, creating Uliks...")
  window.uliks = new UliksVoiceAssistant()
})
