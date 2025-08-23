// Enhanced Voice Recognition with Better Accessibility

class AccessibleVoiceRecognition {
  constructor() {
    this.recognition = null
    this.isListening = false
    this.isSupported = this.checkSupport()
    this.commands = new Map()
    this.feedbackEnabled = true
    this.setupCommands()
    this.setupKeyboardShortcuts()
  }

  checkSupport() {
    return !!(window.SpeechRecognition || window.webkitSpeechRecognition)
  }

  setupCommands() {
    // Navigation commands
    this.commands.set(["kryefaqja", "home", "fillim"], () => {
      this.navigateToSection("home", "Duke shkuar në kryefaqe")
    })

    this.commands.set(["lëndët", "mësimet", "subjects"], () => {
      this.navigateToSection("subjects", "Duke shkuar te lëndët")
    })

    this.commands.set(["rreth nesh", "about", "informacion"], () => {
      this.navigateToSection("about", "Duke shkuar te rreth nesh")
    })

    // Subject commands
    this.commands.set(["biologji", "bio", "shkenca jetës"], () => {
      this.selectSubject("biologji", "Duke hapur biologjinë")
    })

    this.commands.set(["gjeografi", "geo", "toka"], () => {
      this.selectSubject("gjeografi", "Duke hapur gjeografinë")
    })

    this.commands.set(["letërsi", "literatura", "libra"], () => {
      this.selectSubject("letersi", "Duke hapur letërsinë")
    })

    this.commands.set(["histori", "historia", "e kaluara"], () => {
      this.selectSubject("histori", "Duke hapur historinë")
    })

    // Control commands
    this.commands.set(["ndihmë", "help", "komanda"], () => {
      this.showHelp()
    })

    this.commands.set(["ndalo", "stop", "mbyll"], () => {
      this.stopListening()
    })

    this.commands.set(["tema errët", "dark mode"], () => {
      this.toggleTheme("dark")
    })

    this.commands.set(["tema drite", "light mode"], () => {
      this.toggleTheme("light")
    })
  }

  setupKeyboardShortcuts() {
    document.addEventListener("keydown", (event) => {
      // Alt + V to start voice recognition
      if (event.altKey && event.key === "v") {
        event.preventDefault()
        this.startListening()
      }

      // Alt + H for help
      if (event.altKey && event.key === "h") {
        event.preventDefault()
        this.showHelp()
      }

      // Alt + T for theme toggle
      if (event.altKey && event.key === "t") {
        event.preventDefault()
        this.toggleTheme()
      }

      // Escape to stop listening
      if (event.key === "Escape" && this.isListening) {
        event.preventDefault()
        this.stopListening()
      }
    })
  }

  startListening() {
    if (!this.isSupported) {
      this.announceError("Njohja e zërit nuk është e mbështetur në këtë shfletues")
      return
    }

    if (this.isListening) {
      this.stopListening()
      return
    }

    this.recognition = new (window.SpeechRecognition || window.webkitSpeechRecognition)()
    this.setupRecognitionSettings()
    this.setupRecognitionEvents()

    try {
      this.recognition.start()
      this.isListening = true
      this.updateUI(true)
      this.announceStatus("Njohja e zërit u aktivizua. Thuani një komandë.")
    } catch (error) {
      this.announceError("Gabim në aktivizimin e njohjes së zërit")
    }
  }

  setupRecognitionSettings() {
    this.recognition.lang = "sq-AL"
    this.recognition.continuous = false
    this.recognition.interimResults = false
    this.recognition.maxAlternatives = 3
  }

  setupRecognitionEvents() {
    this.recognition.onstart = () => {
      this.announceStatus("Duke dëgjuar...")
    }

    this.recognition.onresult = (event) => {
      const results = Array.from(event.results[0])
      const transcript = results[0].transcript.toLowerCase().trim()
      const confidence = results[0].confidence

      this.announceStatus(`Ju thatë: ${transcript}`)
      this.processCommand(transcript, confidence)
    }

    this.recognition.onerror = (event) => {
      this.handleError(event.error)
    }

    this.recognition.onend = () => {
      this.stopListening()
    }
  }

  processCommand(transcript, confidence) {
    // Log for debugging
    console.log(`Voice command: "${transcript}" (confidence: ${confidence})`)

    // Check confidence threshold
    if (confidence < 0.6) {
      this.announceError(`Nuk ju kuptova qartë. Provoni përsëri. (Besueshmëria: ${Math.round(confidence * 100)}%)`)
      return
    }

    // Find matching command
    let commandFound = false
    for (const [keywords, action] of this.commands) {
      if (keywords.some((keyword) => transcript.includes(keyword))) {
        action()
        commandFound = true
        break
      }
    }

    if (!commandFound) {
      this.announceError(`Komanda "${transcript}" nuk u gjet. Thoni "ndihmë" për komandat e disponueshme.`)
    }
  }

  stopListening() {
    if (this.recognition) {
      this.recognition.stop()
      this.recognition = null
    }

    this.isListening = false
    this.updateUI(false)
    this.announceStatus("Njohja e zërit u çaktivizua")
  }

  updateUI(listening) {
    const voiceBtn = document.querySelector(".cta-secondary")
    const output = document.getElementById("voiceOutput")

    if (!voiceBtn || !output) return

    if (listening) {
      voiceBtn.innerHTML = `
                <span aria-hidden="true">⏹️</span>
                <span>Ndalo</span>
            `
      voiceBtn.setAttribute("aria-label", "Ndalo njohjen e zërit")
      output.classList.add("active")
    } else {
      voiceBtn.innerHTML = `
                <span aria-hidden="true">🎤</span>
                <span>Provo Zërin</span>
            `
      voiceBtn.setAttribute("aria-label", "Aktivizo njohjen e zërit")
      output.classList.remove("active")

      // Reset output after delay
      setTimeout(() => {
        output.innerHTML = `
                    <div class="voice-placeholder">
                        <div class="pulse-dot" aria-hidden="true"></div>
                        <span>Kliko "Provo Zërin" për të filluar...</span>
                    </div>
                `
      }, 3000)
    }
  }

  announceStatus(message) {
    this.updateVoiceOutput(message, "status")
    this.announceToScreenReader(message)

    if (this.feedbackEnabled) {
      this.speak(message)
    }
  }

  announceError(message) {
    this.updateVoiceOutput(message, "error")
    this.announceToScreenReader(message)

    if (this.feedbackEnabled) {
      this.speak(message)
    }
  }

  updateVoiceOutput(message, type = "default") {
    const output = document.getElementById("voiceOutput")
    if (!output) return

    let className = "voice-message"
    let icon = "💬"

    switch (type) {
      case "error":
        className += " error"
        icon = "❌"
        break
      case "success":
        className += " success"
        icon = "✅"
        break
      case "listening":
        className += " listening"
        icon = "🎤"
        break
      case "status":
        icon = "ℹ️"
        break
    }

    output.innerHTML = `
            <div class="${className}" role="status" aria-live="polite">
                <span aria-hidden="true">${icon}</span>
                <span>${message}</span>
            </div>
        `
  }

  announceToScreenReader(message) {
    const announcement = document.createElement("div")
    announcement.setAttribute("aria-live", "polite")
    announcement.setAttribute("aria-atomic", "true")
    announcement.className = "sr-only"
    announcement.textContent = message
    document.body.appendChild(announcement)

    setTimeout(() => {
      if (document.body.contains(announcement)) {
        document.body.removeChild(announcement)
      }
    }, 1000)
  }

  speak(text) {
    if (!window.speechSynthesis || !text) return

    // Cancel any ongoing speech
    speechSynthesis.cancel()

    const utterance = new SpeechSynthesisUtterance(text)
    utterance.lang = "sq-AL"
    utterance.rate = 0.9
    utterance.pitch = 1
    utterance.volume = 0.8

    // Try to use Albanian voice if available
    const voices = speechSynthesis.getVoices()
    const albanianVoice = voices.find((voice) => voice.lang.startsWith("sq") || voice.lang.startsWith("al"))

    if (albanianVoice) {
      utterance.voice = albanianVoice
    }

    utterance.onerror = (event) => {
      console.error("Speech synthesis error:", event.error)
    }

    speechSynthesis.speak(utterance)
  }

  navigateToSection(sectionId, announcement) {
    const section = document.getElementById(sectionId)
    if (!section) {
      this.announceError(`Seksioni ${sectionId} nuk u gjet`)
      return
    }

    section.scrollIntoView({
      behavior: "smooth",
      block: "start",
    })

    // Focus management
    const heading = section.querySelector("h1, h2, h3")
    if (heading) {
      heading.setAttribute("tabindex", "-1")
      heading.focus()
      heading.addEventListener(
        "blur",
        () => {
          heading.removeAttribute("tabindex")
        },
        { once: true },
      )
    }

    this.announceStatus(announcement)
  }

  selectSubject(subject, announcement) {
    this.navigateToSection("subjects", "Duke shkuar te lëndët")

    setTimeout(() => {
      const subjectCard = document.querySelector(`[data-subject="${subject}"]`)
      if (subjectCard) {
        subjectCard.focus()
        subjectCard.style.transform = "scale(1.05)"
        subjectCard.style.borderColor = "var(--primary)"

        setTimeout(() => {
          subjectCard.style.transform = ""
          subjectCard.style.borderColor = ""
        }, 2000)

        this.announceStatus(announcement)
      } else {
        this.announceError(`Lënda ${subject} nuk u gjet`)
      }
    }, 1000)
  }

  toggleTheme(targetTheme = null) {
    const body = document.body
    const themeIcon = document.querySelector(".theme-icon")
    const themeButton = document.querySelector(".theme-toggle")

    if (!themeIcon || !themeButton) return

    let newTheme
    if (targetTheme) {
      newTheme = targetTheme
    } else {
      newTheme = body.getAttribute("data-theme") === "dark" ? "light" : "dark"
    }

    if (newTheme === "dark") {
      body.setAttribute("data-theme", "dark")
      themeIcon.textContent = "☀️"
      themeButton.setAttribute("aria-label", "Aktivizo temën e dritës")
      localStorage.setItem("theme", "dark")
      this.announceStatus("Tema e errët u aktivizua")
    } else {
      body.removeAttribute("data-theme")
      themeIcon.textContent = "🌙"
      themeButton.setAttribute("aria-label", "Aktivizo temën e errët")
      localStorage.setItem("theme", "light")
      this.announceStatus("Tema e dritës u aktivizua")
    }
  }

  showHelp() {
    const helpCommands = [
      'Navigimi: "kryefaqja", "lëndët", "rreth nesh"',
      'Lëndët: "biologji", "gjeografi", "letërsi", "histori"',
      'Kontrolli: "ndalo", "tema errët", "tema drite"',
      "Shkurtoret e tastierës: Alt+V (zëri), Alt+H (ndihmë), Alt+T (tema), Escape (ndalo)",
    ]

    const helpMessage = `Komandat e disponueshme: ${helpCommands.join(". ")}`
    this.announceStatus(helpMessage)
  }

  handleError(error) {
    let errorMessage = "Ndodhi një gabim në njohjen e zërit"

    switch (error) {
      case "audio-capture":
        errorMessage = "Nuk u gjet mikrofon. Kontrolloni pajisjen tuaj audio."
        break
      case "not-allowed":
        errorMessage = "Qasja në mikrofon u refuzua. Lejoni qasjen dhe provoni përsëri."
        break
      case "no-speech":
        errorMessage = "Nuk u dëgjua asnjë zë. Provoni të flisni më qartë."
        break
      case "network":
        errorMessage = "Gabim në rrjet. Kontrolloni lidhjen tuaj të internetit."
        break
      case "service-not-allowed":
        errorMessage = "Shërbimi i njohjes së zërit nuk është i lejuar."
        break
    }

    this.announceError(errorMessage)
    this.stopListening()
  }

  toggleFeedback() {
    this.feedbackEnabled = !this.feedbackEnabled
    const status = this.feedbackEnabled ? "aktivizuar" : "çaktivizuar"
    this.announceStatus(`Përgjigjet me zë u ${status}`)
  }

  destroy() {
    if (this.recognition) {
      this.recognition.stop()
      this.recognition = null
    }
    this.isListening = false
    this.commands.clear()
  }
}

// Initialize the voice recognition system
let voiceRecognition

document.addEventListener("DOMContentLoaded", () => {
  voiceRecognition = new AccessibleVoiceRecognition()

  // Connect to existing voice demo button
  const voiceBtn = document.querySelector(".cta-secondary")
  if (voiceBtn) {
    voiceBtn.addEventListener("click", () => {
      voiceRecognition.startListening()
    })
  }
})

// Global function for backward compatibility
function startVoiceDemo() {
  if (voiceRecognition) {
    voiceRecognition.startListening()
  }
}
