// Theme Management
function toggleTheme() {
  const body = document.body
  const themeIcon = document.querySelector(".theme-icon")

  if (body.getAttribute("data-theme") === "dark") {
    body.removeAttribute("data-theme")
    themeIcon.textContent = "🌙"
    localStorage.setItem("theme", "light")
  } else {
    body.setAttribute("data-theme", "dark")
    themeIcon.textContent = "☀️"
    localStorage.setItem("theme", "dark")
  }
}

// Load saved theme
document.addEventListener("DOMContentLoaded", () => {
  const savedTheme = localStorage.getItem("theme")
  const themeIcon = document.querySelector(".theme-icon")

  if (savedTheme === "dark") {
    document.body.setAttribute("data-theme", "dark")
    themeIcon.textContent = "☀️"
  }

  // Add loading animation
  setTimeout(() => {
    document.body.classList.add("loaded")
  }, 100)
})

// Mobile Menu Toggle
function toggleMobileMenu() {
  const navMenu = document.querySelector(".nav-menu")
  navMenu.classList.toggle("active")
}

// Smooth Scrolling
function scrollToSubjects() {
  document.getElementById("subjects").scrollIntoView({
    behavior: "smooth",
  })
}

// Enhanced Speech Synthesis with Natural Voice Selection
const speechSynthesis = window.speechSynthesis
let availableVoices = []
let selectedVoice = null
let voiceSettings = {
  enabled: true,
  rate: 0.9, // Slightly slower for more natural speech
  pitch: 1.0,
  volume: 0.8,
}

// Load and categorize voices by quality
function loadNaturalVoices() {
  return new Promise((resolve) => {
    const loadVoices = () => {
      availableVoices = speechSynthesis.getVoices()

      // Categorize voices by quality (best to worst)
      const voiceQuality = {
        premium: [],
        enhanced: [],
        standard: [],
        basic: [],
      }

      availableVoices.forEach((voice) => {
        const name = voice.name.toLowerCase()
        const lang = voice.lang.toLowerCase()

        // Premium/Neural voices (highest quality)
        if (
          name.includes("neural") ||
          name.includes("premium") ||
          name.includes("wavenet") ||
          name.includes("studio") ||
          name.includes("enhanced") ||
          name.includes("natural")
        ) {
          voiceQuality.premium.push(voice)
        }
        // Enhanced voices (good quality)
        else if (
          name.includes("google") ||
          name.includes("microsoft") ||
          name.includes("apple") ||
          name.includes("amazon") ||
          voice.localService === false
        ) {
          voiceQuality.enhanced.push(voice)
        }
        // Standard system voices
        else if (voice.localService === true) {
          voiceQuality.standard.push(voice)
        }
        // Basic voices
        else {
          voiceQuality.basic.push(voice)
        }
      })

      // Select best available voice
      selectBestVoice(voiceQuality)
      resolve(voiceQuality)
    }

    if (availableVoices.length === 0) {
      speechSynthesis.onvoiceschanged = loadVoices
      loadVoices()
    } else {
      loadVoices()
    }
  })
}

function selectBestVoice(voiceQuality) {
  // Priority order: Albanian -> English -> Any premium voice
  const languagePriority = ["sq", "en", "en-us", "en-gb"]

  // Try premium voices first
  for (const lang of languagePriority) {
    const voice = voiceQuality.premium.find((v) => v.lang.toLowerCase().startsWith(lang))
    if (voice) {
      selectedVoice = voice
      console.log(`🎙️ Selected premium voice: ${voice.name} (${voice.lang})`)
      return
    }
  }

  // Try enhanced voices
  for (const lang of languagePriority) {
    const voice = voiceQuality.enhanced.find((v) => v.lang.toLowerCase().startsWith(lang))
    if (voice) {
      selectedVoice = voice
      console.log(`🎙️ Selected enhanced voice: ${voice.name} (${voice.lang})`)
      return
    }
  }

  // Fallback to best available
  if (voiceQuality.standard.length > 0) {
    selectedVoice = voiceQuality.standard[0]
    console.log(`🎙️ Selected standard voice: ${selectedVoice.name} (${selectedVoice.lang})`)
  } else if (availableVoices.length > 0) {
    selectedVoice = availableVoices[0]
    console.log(`🎙️ Selected fallback voice: ${selectedVoice.name} (${selectedVoice.lang})`)
  }
}

// Enhanced speak function with natural voice settings
function speak(text, priority = "normal") {
  if (!voiceSettings.enabled || !text) return

  // Cancel lower priority speech
  if (priority === "high") {
    speechSynthesis.cancel()
  }

  const utterance = new SpeechSynthesisUtterance(text)

  // Use selected natural voice
  if (selectedVoice) {
    utterance.voice = selectedVoice
  }

  // Optimized settings for natural speech
  utterance.rate = voiceSettings.rate
  utterance.pitch = voiceSettings.pitch
  utterance.volume = voiceSettings.volume

  // Add natural pauses and emphasis
  const enhancedText = enhanceTextForSpeech(text)
  utterance.text = enhancedText

  // Error handling
  utterance.onerror = (event) => {
    console.error("Speech synthesis error:", event.error)
  }

  speechSynthesis.speak(utterance)
}

// Enhance text for more natural speech
function enhanceTextForSpeech(text) {
  return (
    text
      // Add pauses for better flow
      .replace(/\./g, ". ")
      .replace(/,/g, ", ")
      .replace(/:/g, ": ")
      // Emphasize important words
      .replace(/duke/gi, "duke ")
      .replace(/përfundoi/gi, "përfundoi.")
      // Add natural breathing pauses
      .replace(/dhe /gi, "dhe, ")
      .replace(/ në /gi, " në, ")
  )
}

// Create voice selection UI
function createVoiceSelector() {
  const voiceSelector = document.createElement("div")
  voiceSelector.className = "voice-selector"
  voiceSelector.innerHTML = `
    <div class="voice-controls">
      <h4>🎙️ Cilësimet e Zërit</h4>
      
      <div class="voice-option">
        <label>Zëri:</label>
        <select id="voice-select" onchange="changeVoice(this.value)">
          <option value="">Duke zgjedhur zërin më të mirë...</option>
        </select>
        <button onclick="previewVoice()" class="preview-btn">🔊 Provo</button>
      </div>
      
      <div class="voice-option">
        <label>Shpejtësia: <span id="rate-value">${voiceSettings.rate}</span></label>
        <input type="range" id="rate-slider" min="0.5" max="2" step="0.1" 
               value="${voiceSettings.rate}" oninput="updateRate(this.value)">
      </div>
      
      <div class="voice-option">
        <label>Toni: <span id="pitch-value">${voiceSettings.pitch}</span></label>
        <input type="range" id="pitch-slider" min="0.5" max="2" step="0.1" 
               value="${voiceSettings.pitch}" oninput="updatePitch(this.value)">
      </div>
      
      <div class="voice-option">
        <label>Volumi: <span id="volume-value">${Math.round(voiceSettings.volume * 100)}%</span></label>
        <input type="range" id="volume-slider" min="0" max="1" step="0.1" 
               value="${voiceSettings.volume}" oninput="updateVolume(this.value)">
      </div>
      
      <button onclick="toggleVoiceFeedback()" class="voice-toggle" id="voice-toggle">
        ${voiceSettings.enabled ? "🔊 Çaktivizo Zërin" : "🔇 Aktivizo Zërin"}
      </button>
    </div>
  `

  return voiceSelector
}

// Voice control functions
function changeVoice(voiceIndex) {
  if (voiceIndex && availableVoices[voiceIndex]) {
    selectedVoice = availableVoices[voiceIndex]
    localStorage.setItem("selectedVoice", voiceIndex)
    speak("Zëri u ndryshua. Si dëgjohet tani?", "high")
  }
}

function previewVoice() {
  speak("Përshëndetje! Unë jam zëri juaj i ri. Si dëgjohem?", "high")
}

function updateRate(value) {
  voiceSettings.rate = Number.parseFloat(value)
  document.getElementById("rate-value").textContent = value
  localStorage.setItem("voiceRate", value)
}

function updatePitch(value) {
  voiceSettings.pitch = Number.parseFloat(value)
  document.getElementById("pitch-value").textContent = value
  localStorage.setItem("voicePitch", value)
}

function updateVolume(value) {
  voiceSettings.volume = Number.parseFloat(value)
  document.getElementById("volume-value").textContent = Math.round(value * 100) + "%"
  localStorage.setItem("voiceVolume", value)
}

function toggleVoiceFeedback() {
  voiceSettings.enabled = !voiceSettings.enabled
  const button = document.getElementById("voice-toggle")

  if (voiceSettings.enabled) {
    button.textContent = "🔊 Çaktivizo Zërin"
    speak("Përgjigjet me zë u aktivizuan", "high")
  } else {
    button.textContent = "🔇 Aktivizo Zërin"
    speechSynthesis.cancel()
  }

  localStorage.setItem("voiceEnabled", voiceSettings.enabled)
}

// Populate voice selector
async function populateVoiceSelector() {
  const voiceQuality = await loadNaturalVoices()
  const select = document.getElementById("voice-select")

  if (!select) return

  select.innerHTML = '<option value="">Zgjidhni zërin...</option>'

  // Add premium voices first
  if (voiceQuality.premium.length > 0) {
    const premiumGroup = document.createElement("optgroup")
    premiumGroup.label = "🌟 Zëra Premium (Më të mirët)"
    voiceQuality.premium.forEach((voice, index) => {
      const option = document.createElement("option")
      option.value = availableVoices.indexOf(voice)
      option.textContent = `${voice.name} (${voice.lang})`
      premiumGroup.appendChild(option)
    })
    select.appendChild(premiumGroup)
  }

  // Add enhanced voices
  if (voiceQuality.enhanced.length > 0) {
    const enhancedGroup = document.createElement("optgroup")
    enhancedGroup.label = "⭐ Zëra të Përmirësuar"
    voiceQuality.enhanced.forEach((voice, index) => {
      const option = document.createElement("option")
      option.value = availableVoices.indexOf(voice)
      option.textContent = `${voice.name} (${voice.lang})`
      enhancedGroup.appendChild(option)
    })
    select.appendChild(enhancedGroup)
  }

  // Add standard voices
  if (voiceQuality.standard.length > 0) {
    const standardGroup = document.createElement("optgroup")
    standardGroup.label = "🔊 Zëra Standardë"
    voiceQuality.standard.forEach((voice, index) => {
      const option = document.createElement("option")
      option.value = availableVoices.indexOf(voice)
      option.textContent = `${voice.name} (${voice.lang})`
      standardGroup.appendChild(option)
    })
    select.appendChild(standardGroup)
  }

  // Set selected voice in dropdown
  if (selectedVoice) {
    select.value = availableVoices.indexOf(selectedVoice)
  }
}

// Load saved settings
function loadVoiceSettings() {
  const saved = {
    enabled: localStorage.getItem("voiceEnabled") !== "false",
    rate: Number.parseFloat(localStorage.getItem("voiceRate")) || 0.9,
    pitch: Number.parseFloat(localStorage.getItem("voicePitch")) || 1.0,
    volume: Number.parseFloat(localStorage.getItem("voiceVolume")) || 0.8,
    voiceIndex: localStorage.getItem("selectedVoice"),
  }

  voiceSettings = { ...voiceSettings, ...saved }

  if (saved.voiceIndex && availableVoices[saved.voiceIndex]) {
    selectedVoice = availableVoices[saved.voiceIndex]
  }
}

// Initialize voice system
document.addEventListener("DOMContentLoaded", async () => {
  await loadNaturalVoices()
  loadVoiceSettings()

  // Add voice selector to page
  const voiceOutput = document.getElementById("voiceOutput")
  if (voiceOutput && voiceOutput.parentNode) {
    const voiceSelector = createVoiceSelector()
    voiceOutput.parentNode.insertBefore(voiceSelector, voiceOutput.nextSibling)

    // Populate after a short delay
    setTimeout(populateVoiceSelector, 500)
  }

  // Welcome message with natural voice
  setTimeout(() => {
    if (voiceSettings.enabled) {
      speak('Mirë se vini në Jehonë! Sistemi i zërit është gati. Thoni "ndihmë" për komandat.', "normal")
    }
  }, 2000)
})

// Voice Recognition
let recognition
let isListening = false

function startVoiceDemo() {
  const output = document.getElementById("voiceOutput")
  const voiceBtn = document.querySelector(".cta-secondary")

  if (!window.webkitSpeechRecognition && !window.SpeechRecognition) {
    showVoiceMessage("Njohja e zërit nuk është e mbështetur në këtë shfletues.", "error")
    return
  }

  if (isListening) {
    stopListening()
    return
  }

  recognition = new (window.SpeechRecognition || window.webkitSpeechRecognition)()
  recognition.lang = "sq-AL"
  recognition.continuous = false
  recognition.interimResults = false

  // Visual feedback
  output.classList.add("active")
  voiceBtn.innerHTML = `
    <span class="voice-icon">⏹️</span>
    <span>Ndalo</span>
  `

  showVoiceMessage("🎤 Duke dëgjuar... Thuaj diçka në shqip!", "listening")

  isListening = true
  recognition.start()

  recognition.onresult = (event) => {
    const transcript = event.results[0][0].transcript.toLowerCase()
    const confidence = event.results[0][0].confidence

    showVoiceMessage(`✅ Ju thatë: "${transcript}" (Besueshmëria: ${Math.round(confidence * 100)}%)`, "success")

    // Process voice commands
    processVoiceCommand(transcript)
    stopListening()
  }

  recognition.onerror = (event) => {
    let errorMessage = "Ndodhi një gabim gjatë njohjes së zërit."

    switch (event.error) {
      case "audio-capture":
        errorMessage = "Nuk u gjet pajisje audio. Kontrolloni mikrofonin."
        break
      case "not-allowed":
        errorMessage = "Qasja në mikrofon u refuzua. Lejoni qasjen dhe provoni përsëri."
        break
      case "no-speech":
        errorMessage = "Nuk u dëgjua asnjë zë. Provoni përsëri."
        break
      case "network":
        errorMessage = "Gabim në rrjet. Kontrolloni lidhjen tuaj."
        break
    }

    showVoiceMessage(`❌ ${errorMessage}`, "error")
    stopListening()
  }

  recognition.onend = () => {
    stopListening()
  }
}

function stopListening() {
  if (recognition) {
    recognition.stop()
  }

  isListening = false
  const output = document.getElementById("voiceOutput")
  const voiceBtn = document.querySelector(".cta-secondary")

  output.classList.remove("active")
  voiceBtn.innerHTML = `
    <span class="voice-icon">🎤</span>
    <span>Provo Zërin</span>
  `

  // Reset output after 5 seconds
  setTimeout(() => {
    output.innerHTML = `
      <div class="voice-placeholder">
        <div class="pulse-dot"></div>
        <span>Kliko "Provo Zërin" për të filluar...</span>
      </div>
    `
  }, 5000)
}

function showVoiceMessage(message, type = "default") {
  const output = document.getElementById("voiceOutput")
  let className = "voice-message"

  if (type === "error") className += " error"
  if (type === "success") className += " success"
  if (type === "listening") className += " listening"

  output.innerHTML = `
    <div class="${className}">
      <span>${message}</span>
    </div>
  `
  if (voiceSettings.enabled && type !== "listening") {
    speak(message, "normal")
  }
}

function processVoiceCommand(transcript) {
  const commands = {
    biologji: () => showSubjectInfo("biologji"),
    gjeografi: () => showSubjectInfo("gjeografi"),
    letërsi: () => showSubjectInfo("letërsi"),
    histori: () => showSubjectInfo("histori"),
    lëndët: () => scrollToSubjects(),
    mësimet: () => scrollToSubjects(),
    "rreth nesh": () => document.getElementById("about").scrollIntoView({ behavior: "smooth" }),
    kryefaqja: () => document.getElementById("home").scrollIntoView({ behavior: "smooth" }),
    ndihmë: () => {
      speak(
        "Mund të provoni komandat: biologji, gjeografi, letërsi, histori, lëndët, rreth nesh, ose kryefaqja.",
        "high",
      )
      showVoiceMessage(
        `Mund të provoni komandat: biologji, gjeografi, letërsi, histori, lëndët, rreth nesh, ose kryefaqja.`,
        "default",
      )
    },
  }

  // Check for command matches
  for (const [keyword, action] of Object.entries(commands)) {
    if (transcript.includes(keyword)) {
      action()
      return
    }
  }

  // If no command found
  showVoiceMessage(
    `🤔 Nuk ju kuptova: "${transcript}". Provoni: "biologji", "gjeografi", "letërsi", "histori", "lëndët"`,
    "default",
  )
  if (voiceSettings.enabled) {
    speak(`Nuk ju kuptova. Provoni: biologji, gjeografi, letërsi, histori, lëndët`, "normal")
  }
}

function showSubjectInfo(subject) {
  const subjectNames = {
    biologji: "Biologji - Shkenca e jetës",
    gjeografi: "Gjeografi - Gjeografia fizike dhe njerëzore",
    letërsi: "Letërsi - Letërsia shqipe dhe botërore",
    histori: "Histori - Historia e Shqipërisë dhe botës",
  }

  showVoiceMessage(`📚 ${subjectNames[subject]}`, "success")

  // Scroll to subjects and highlight the selected subject
  setTimeout(() => {
    scrollToSubjects()
    const subjectCard = document.querySelector(`[data-subject="${subject}"]`)
    if (subjectCard) {
      subjectCard.style.transform = "scale(1.05)"
      subjectCard.style.borderColor = "var(--primary)"
      setTimeout(() => {
        subjectCard.style.transform = ""
        subjectCard.style.borderColor = ""
      }, 2000)
    }
  }, 1000)
  if (voiceSettings.enabled) {
    speak(subjectNames[subject], "normal")
  }
}

// Subject Card Interactions
document.addEventListener("DOMContentLoaded", () => {
  const subjectCards = document.querySelectorAll(".subject-card")

  subjectCards.forEach((card) => {
    card.addEventListener("click", () => {
      const subject = card.getAttribute("data-subject")
      showSubjectInfo(subject)
    })
  })
})

// Navbar Scroll Effect
window.addEventListener("scroll", () => {
  const navbar = document.querySelector(".navbar")
  if (window.scrollY > 50) {
    navbar.style.background = "rgba(255, 255, 255, 0.95)"
    if (document.body.getAttribute("data-theme") === "dark") {
      navbar.style.background = "rgba(15, 23, 42, 0.95)"
    }
  } else {
    navbar.style.background = "rgba(255, 255, 255, 0.8)"
    if (document.body.getAttribute("data-theme") === "dark") {
      navbar.style.background = "rgba(15, 23, 42, 0.8)"
    }
  }
})

// Smooth scroll for navigation links
document.querySelectorAll('a[href^="#"]').forEach((anchor) => {
  anchor.addEventListener("click", function (e) {
    e.preventDefault()
    const target = document.querySelector(this.getAttribute("href"))
    if (target) {
      target.scrollIntoView({
        behavior: "smooth",
        block: "start",
      })
    }
  })
})

// Add intersection observer for animations
const observerOptions = {
  threshold: 0.1,
  rootMargin: "0px 0px -50px 0px",
}

const observer = new IntersectionObserver((entries) => {
  entries.forEach((entry) => {
    if (entry.isIntersecting) {
      entry.target.classList.add("loaded")
    }
  })
}, observerOptions)

// Observe elements for animation
document.addEventListener("DOMContentLoaded", () => {
  const animatedElements = document.querySelectorAll(".feature-card, .subject-card, .about-text, .about-visual")
  animatedElements.forEach((el) => {
    el.classList.add("loading")
    observer.observe(el)
  })
})

// Add CSS for loading animations
const style = document.createElement("style")
style.textContent = `
  .voice-message {
    display: flex;
    align-items: center;
    gap: 1rem;
    color: var(--text-primary);
    font-weight: 500;
  }
  
  .voice-message.error {
    color: var(--error);
  }
  
  .voice-message.success {
    color: var(--success);
  }
  
  .voice-message.listening {
    color: var(--primary);
  }
  
  @media (max-width: 768px) {
    .nav-menu.active {
      display: flex;
      position: absolute;
      top: 100%;
      left: 0;
      right: 0;
      background: var(--surface);
      border: 1px solid var(--border);
      border-top: none;
      flex-direction: column;
      padding: 1rem;
      gap: 0.5rem;
    }
  }
  
  .voice-selector {
    padding: 1rem;
    border: 1px solid var(--border);
    border-radius: 8px;
    margin-top: 1rem;
    background: var(--surface);
  }
  
  .voice-controls {
    display: flex;
    flex-direction: column;
    gap: 0.75rem;
  }
  
  .voice-option {
    display: flex;
    flex-direction: column;
    gap: 0.25rem;
  }
  
  .voice-option label {
    font-weight: 500;
    color: var(--text-secondary);
  }
  
  .voice-option input[type="range"] {
    width: 100%;
  }
  
  .voice-option select {
    padding: 0.5rem;
    border: 1px solid var(--border);
    border-radius: 4px;
    background: var(--background);
    color: var(--text-primary);
  }
  
  .voice-toggle, .preview-btn {
    padding: 0.5rem 1rem;
    border: none;
    border-radius: 4px;
    background: var(--primary);
    color: var(--text-light);
    cursor: pointer;
    transition: background-color 0.3s ease;
  }
  
  .voice-toggle:hover, .preview-btn:hover {
    background: var(--primary-dark);
  }
`
document.head.appendChild(style)

// Prevent right-click and keyboard shortcuts (optional)
document.addEventListener("contextmenu", (e) => {
  e.preventDefault()
})

document.addEventListener("keydown", (e) => {
  if (e.ctrlKey && (e.key === "u" || e.key === "U")) {
    e.preventDefault()
  }
})

// Add loading animation on page load
window.addEventListener("load", () => {
  document.body.style.opacity = "0"
  document.body.style.transition = "opacity 0.5s ease"

  setTimeout(() => {
    document.body.style.opacity = "1"
  }, 100)
})
