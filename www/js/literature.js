// Literature page functionality with AI chatbot
let currentAudio = null
let isPlaying = false
let currentTrack = 0
let playbackSpeed = 1
let isVoiceControlActive = false
let voiceFeedbackEnabled = true
let availableVoices = []
const speechSettings = {
  rate: 1,
  pitch: 1,
  volume: 0.8,
  lang: "sq-AL",
}

// Literature Knowledge Base
const literatureKnowledgeBase = {
  "naim frashëri": {
    content:
      "Naim Frashëri (1846-1900) është poeti kombëtar i Shqipërisë dhe një nga figurat më të rëndësishme të Rilindjes Kombëtare. Ai lindi në Frashër të Përmetit dhe shkroi vepra të shumta në shqip, turqisht dhe persisht. Veprat e tij kryesore përfshijnë 'Bagëtinë e Bujqësinë', 'Lulet e Verës', 'Qerbelaja' dhe 'Istori e Skënderbeut'. Naimi kontriboi shumë në zhvillimin e gjuhës dhe letërsisë shqipe.",
    confidence: 0.95,
    source: "Letërsi Shqipe - Naim Frashëri",
  },
  migjeni: {
    content:
      "Migjeni (Millosh Gjergj Nikolla, 1911-1938) ishte një poet dhe prozator i shquar i letërsisë shqipe. Ai përfaqëson realizmën social në poezinë shqipe dhe është njohur për veprat e tij që pasqyrojnë problemet sociale të kohës. Veprat kryesore të tij janë 'Vargjet e lira' dhe 'Kanga e maleve'. Migjeni vdiq në moshë të re por la një ndikim të madh në letërsinë shqipe.",
    confidence: 0.92,
    source: "Letërsi Shqipe - Migjeni",
  },
  poezia: {
    content:
      "Poezia është një formë letrare që shpreh ndjenjat, idetë dhe përvojat njerëzore përmes gjuhës së figurshme, ritmit dhe rimës. Në letërsinë shqipe, poezia ka një traditë të pasur që fillon me krijimtarinë popullore dhe vazhdon me poetët e Rilindjes si Naim Frashëri, Andon Zako Çajupi dhe të tjerë. Poezia bashkëkohore shqipe përfshin autorë si Migjeni, Lasgush Poradeci, Arshi Pipa dhe shumë të tjerë.",
    confidence: 0.88,
    source: "Teoria Letrare - Poezia",
  },
  proza: {
    content:
      "Proza është forma letrare që përfshin romanin, novelën dhe tregimin. Në letërsinë shqipe, proza u zhvillua më vonë se poezia. Pionierët e prozës shqipe janë Sami Frashëri me 'Kaba e Hazretit Aliut' dhe Naim Frashëri. Në shekullin XX, proza shqipe u pasurua me autorë si Mitrush Kuteli, Sterjo Spasse, Dritëro Agolli, Ismail Kadare dhe të tjerë.",
    confidence: 0.9,
    source: "Letërsi Shqipe - Proza",
  },
  drama: {
    content:
      "Drama është forma letrare që shkruhet për t'u interpretuar në skenë. Dramaturgjia shqipe filloi me Sami Frashërin dhe 'Besa' (1875), drama e parë shqipe. Më vonë u zhvillua me autorë si Kristo Floqi, Etëhem Haxhiademi, Kolë Jakova dhe të tjerë. Drama shqipe ka trajtuar tema kombëtare, sociale dhe psikologjike.",
    confidence: 0.87,
    source: "Letërsi Shqipe - Drama",
  },
  "letërsia botërore": {
    content:
      "Letërsia botërore përfshin veprat më të rëndësishme të të gjitha kulturave dhe gjuhëve. Autorët klasikë si Homer, Shakespeare, Dante, Goethe, Tolstoy, Dostoevsky kanë ndikuar në zhvillimin e letërsisë së gjithë botës. Letërsia bashkëkohore botërore përfshin autorë si García Márquez, Kafka, Joyce, Proust dhe shumë të tjerë që kanë sjellë teknika të reja letrare.",
    confidence: 0.85,
    source: "Letërsi Botërore - Autorë dhe Vepra",
  },
  "analiza letrare": {
    content:
      "Analiza letrare është procesi i studimit të thellë të një teksti letrar për të kuptuar strukturën, temat, personazhet, stilin dhe mesazhin e autorit. Ajo përfshin analizën e elementeve si: tema, motivi, simbolika, stili, gjuha, struktura narrative, karakterizimi i personazheve dhe konteksti historik-kulturor.",
    confidence: 0.83,
    source: "Metodologji Letrare - Analiza",
  },
}

// Audio tracks for literature
const literatureTracks = [
  { id: "naim", title: "Naim Frashëri", file: "audio/literature/naim-frasheri.mp3" },
  { id: "migjeni", title: "Migjeni", file: "audio/literature/migjeni.mp3" },
  { id: "poezia", title: "Poezia bashkëkohore", file: "audio/literature/poezia.mp3" },
  { id: "proza", title: "Proza moderne", file: "audio/literature/proza.mp3" },
  { id: "drama", title: "Drama dhe teatri", file: "audio/literature/drama.mp3" },
  { id: "boterore", title: "Letërsia botërore", file: "audio/literature/boterore.mp3" },
]

// Initialize literature page
document.addEventListener("DOMContentLoaded", () => {
  loadVoices()
  initializeChatbot()

  // Load voices when they become available
  if (speechSynthesis.onvoiceschanged !== undefined) {
    speechSynthesis.onvoiceschanged = loadVoices
  }
})

// Load available voices
function loadVoices() {
  availableVoices = speechSynthesis.getVoices()

  // Try to find Albanian voice, fallback to English or default
  const preferredVoices = availableVoices.filter(
    (voice) => voice.lang.startsWith("sq") || voice.lang.startsWith("al") || voice.lang.startsWith("en"),
  )

  if (preferredVoices.length > 0) {
    speechSettings.voice = preferredVoices[0]
  } else if (availableVoices.length > 0) {
    speechSettings.voice = availableVoices[0]
  }
}

// Literature voice recognition
function startLiteratureVoice() {
  const output = document.getElementById("lit-output")

  if (!window.webkitSpeechRecognition && !window.SpeechRecognition) {
    output.innerHTML = '<p style="color: red;">Njohja e zërit nuk është e mbështetur në këtë shfletues.</p>'
    return
  }

  const recognition = new (window.SpeechRecognition || window.webkitSpeechRecognition)()
  recognition.lang = "sq-AL"
  recognition.continuous = false
  recognition.interimResults = false

  output.innerHTML = '<p style="color: var(--primary-color);"><strong>🎤 Duke dëgjuar...</strong></p>'

  recognition.start()

  recognition.onresult = (event) => {
    const transcript = event.results[0][0].transcript.toLowerCase()
    const confidence = event.results[0][0].confidence

    output.innerHTML = `
            <div style="text-align: center;">
                <p><strong>Ju thatë:</strong> "${transcript}"</p>
                <p style="font-size: 0.8rem; color: var(--text-secondary);">Besueshmëria: ${Math.round(confidence * 100)}%</p>
            </div>
        `

    processLiteratureVoiceCommand(transcript)
  }

  recognition.onerror = (event) => {
    output.innerHTML = '<p style="color: red;">Gabim në njohjen e zërit. Provoni përsëri.</p>'
  }
}

// Process literature voice commands
function processLiteratureVoiceCommand(transcript) {
  const commands = {
    naim: () => playLiteratureTopic("naim"),
    migjeni: () => playLiteratureTopic("migjeni"),
    poezia: () => playLiteratureTopic("poezia"),
    proza: () => playLiteratureTopic("proza"),
    drama: () => playLiteratureTopic("drama"),
    botërore: () => playLiteratureTopic("boterore"),
    letërsi: () => playLiteratureTopic("boterore"),
    luaj: () => togglePlayPause(),
    ndalo: () => stopAudio(),
    "më shpejt": () => increaseSpeed(),
    "më ngadalë": () => decreaseSpeed(),
    chatbot: () => toggleChatbot(),
    pyetje: () => toggleChatbot(),
  }

  for (const [keyword, action] of Object.entries(commands)) {
    if (transcript.includes(keyword)) {
      action()
      speakText(`Po luaj leksionin për ${keyword}`)
      return
    }
  }

  speakText(`Nuk ju kuptova. Provoni: naim, migjeni, poezia, proza, drama, ose botërore`)
}

// Play literature topic
function playLiteratureTopic(topicId) {
  const track = literatureTracks.find((t) => t.id === topicId)
  if (!track) return

  currentTrack = literatureTracks.indexOf(track)

  // Show player
  const player = document.getElementById("audio-player")
  player.style.display = "block"

  // Update player info
  document.getElementById("player-title").textContent = track.title
  document.getElementById("player-subtitle").textContent = "Letërsi"

  // Create audio element
  if (currentAudio) {
    currentAudio.pause()
  }

  currentAudio = new Audio(track.file)
  currentAudio.addEventListener("loadedmetadata", updatePlayerUI)
  currentAudio.addEventListener("timeupdate", updateProgress)
  currentAudio.addEventListener("ended", nextTrack)

  currentAudio
    .play()
    .then(() => {
      isPlaying = true
      updatePlayPauseButton()
      speakText(`Po luaj leksionin: ${track.title}`)
    })
    .catch((error) => {
      console.error("Error playing audio:", error)
      speakText("Gabim në luajtjen e audio-s")
    })
}

// Enhanced audio player functions
function togglePlayPause() {
  if (!currentAudio) return

  if (isPlaying) {
    currentAudio.pause()
    isPlaying = false
    speakText("Audio u ndalua")
  } else {
    currentAudio.play()
    isPlaying = true
    speakText("Audio po luhet")
  }
  updatePlayPauseButton()
}

function stopAudio() {
  if (currentAudio) {
    currentAudio.pause()
    currentAudio.currentTime = 0
    isPlaying = false
  }

  const player = document.getElementById("audio-player")
  player.style.display = "none"
  speakText("Audio u mbyll")
}

function nextTrack() {
  currentTrack = (currentTrack + 1) % literatureTracks.length
  playLiteratureTopic(literatureTracks[currentTrack].id)
}

function previousTrack() {
  currentTrack = currentTrack > 0 ? currentTrack - 1 : literatureTracks.length - 1
  playLiteratureTopic(literatureTracks[currentTrack].id)
}

function toggleSpeed() {
  const speeds = [0.5, 0.75, 1, 1.25, 1.5, 2]
  const currentIndex = speeds.indexOf(playbackSpeed)
  playbackSpeed = speeds[(currentIndex + 1) % speeds.length]

  if (currentAudio) {
    currentAudio.playbackRate = playbackSpeed
  }

  document.getElementById("speed-btn").textContent = `${playbackSpeed}x`
  speakText(`Shpejtësia u ndryshua në ${playbackSpeed}x`)
}

function setVolume(value) {
  if (currentAudio) {
    currentAudio.volume = value / 100
  }
}

function toggleMute() {
  if (!currentAudio) return

  if (currentAudio.volume > 0) {
    currentAudio.volume = 0
    document.getElementById("volume-btn").textContent = "🔇"
    speakText("Audio u heshtu")
  } else {
    currentAudio.volume = 0.8
    document.getElementById("volume-btn").textContent = "🔊"
    speakText("Audio u aktivizua")
  }
}

function updatePlayerUI() {
  if (!currentAudio) return

  const totalTime = formatTime(currentAudio.duration)
  document.getElementById("total-time").textContent = totalTime
}

function updateProgress() {
  if (!currentAudio) return

  const progress = (currentAudio.currentTime / currentAudio.duration) * 100
  document.getElementById("progress-fill").style.width = `${progress}%`
  document.getElementById("progress-handle").style.left = `${progress}%`

  const currentTime = formatTime(currentAudio.currentTime)
  document.getElementById("current-time").textContent = currentTime
}

function seekAudio(event) {
  if (!currentAudio) return

  const progressBar = event.currentTarget
  const rect = progressBar.getBoundingClientRect()
  const percent = (event.clientX - rect.left) / rect.width
  currentAudio.currentTime = percent * currentAudio.duration
}

function updatePlayPauseButton() {
  const btn = document.getElementById("play-pause-btn")
  btn.textContent = isPlaying ? "⏸️" : "▶️"
}

function formatTime(seconds) {
  if (isNaN(seconds)) return "0:00"

  const mins = Math.floor(seconds / 60)
  const secs = Math.floor(seconds % 60)
  return `${mins}:${secs.toString().padStart(2, "0")}`
}

// AI Chatbot Functions
function initializeChatbot() {
  // Initialize chatbot state
  updateChatbotStatus("Online")
}

function toggleChatbot() {
  const chatbotBody = document.getElementById("chatbot-body")
  const toggle = document.getElementById("chatbot-toggle")

  if (chatbotBody.style.display === "none") {
    chatbotBody.style.display = "block"
    toggle.textContent = "✕"
    speakText("Chatbot u hap")
  } else {
    chatbotBody.style.display = "none"
    toggle.textContent = "💬"
    speakText("Chatbot u mbyll")
  }
}

function sendChatMessage() {
  const input = document.getElementById("chat-input")
  const message = input.value.trim()

  if (!message) return

  // Add user message
  addChatMessage(message, "user")
  input.value = ""

  // Show typing indicator
  showTypingIndicator()

  // Generate AI response
  setTimeout(() => {
    const response = generateAIResponse(message)
    hideTypingIndicator()
    addChatMessage(response.content, "bot", response.confidence, response.source)

    // Speak response if enabled
    if (voiceFeedbackEnabled) {
      speakText(response.content)
    }
  }, 1500)
}

function addChatMessage(content, sender, confidence = null, source = null) {
  const messagesContainer = document.getElementById("chat-messages")
  const messageDiv = document.createElement("div")
  messageDiv.className = `message ${sender}-message`

  const time = new Date().toLocaleTimeString("sq-AL", {
    hour: "2-digit",
    minute: "2-digit",
  })

  let confidenceText = ""
  const sourceText = ""

  if (confidence && source) {
    confidenceText = `<div class="message-meta">Besueshmëria: ${Math.round(confidence * 100)}% | Burimi: ${source}</div>`
  }

  messageDiv.innerHTML = `
        <div class="message-avatar">${sender === "user" ? "👤" : "🤖"}</div>
        <div class="message-content">
            <p>${content}</p>
            ${confidenceText}
            <div class="message-actions">
                ${sender === "bot" ? '<button class="play-message-btn" onclick="playMessage(this)">🔊</button>' : ""}
                <span class="message-time">${time}</span>
            </div>
        </div>
    `

  messagesContainer.appendChild(messageDiv)
  messagesContainer.scrollTop = messagesContainer.scrollHeight
}

function generateAIResponse(userMessage) {
  const message = userMessage.toLowerCase()

  // Search knowledge base
  for (const [key, data] of Object.entries(literatureKnowledgeBase)) {
    if (message.includes(key) || key.split(" ").some((word) => message.includes(word))) {
      return data
    }
  }

  // General responses
  if (message.includes("ndihmë") || message.includes("help")) {
    return {
      content:
        "Mund t'ju ndihmoj me pyetje rreth letërsisë shqipe dhe botërore, analizave letrare, autorëve të famshëm, veprave letrare, ose çdo gjë tjetër që lidhet me letërsinë. Thjesht pyesni!",
      confidence: 0.9,
      source: "Asistenti i Letërsisë",
    }
  }

  if (message.includes("faleminderit") || message.includes("thanks")) {
    return {
      content: "Ju lutem! Jam këtu për t'ju ndihmuar me çdo pyetje rreth letërsisë. Mos hezitoni të pyesni!",
      confidence: 0.95,
      source: "Asistenti i Letërsisë",
    }
  }

  // Default response
  return {
    content:
      "Më vjen keq, por nuk kam informacion të mjaftueshëm për këtë pyetje. Mund të më pyesni për autorë si Naim Frashëri, Migjeni, për poezinë, prozën, dramën, ose letërsinë botërore.",
    confidence: 0.7,
    source: "Asistenti i Letërsisë",
  }
}

function askQuickQuestion(question) {
  const input = document.getElementById("chat-input")
  input.value = question
  sendChatMessage()
}

function handleChatKeyPress(event) {
  if (event.key === "Enter") {
    sendChatMessage()
  }
}

function startChatVoiceInput() {
  const btn = document.getElementById("voice-input-btn")

  if (!window.webkitSpeechRecognition && !window.SpeechRecognition) {
    speakText("Njohja e zërit nuk është e mbështetur")
    return
  }

  const recognition = new (window.SpeechRecognition || window.webkitSpeechRecognition)()
  recognition.lang = "sq-AL"
  recognition.continuous = false
  recognition.interimResults = false

  btn.textContent = "🔴"
  btn.disabled = true

  recognition.start()

  recognition.onresult = (event) => {
    const transcript = event.results[0][0].transcript
    document.getElementById("chat-input").value = transcript
    sendChatMessage()
  }

  recognition.onend = () => {
    btn.textContent = "🎤"
    btn.disabled = false
  }

  recognition.onerror = () => {
    btn.textContent = "🎤"
    btn.disabled = false
    speakText("Gabim në njohjen e zërit")
  }
}

function playMessage(button) {
  const messageContent = button.closest(".message-content").querySelector("p").textContent
  speakText(messageContent)
}

function toggleVoiceFeedback() {
  const toggle = document.getElementById("voice-feedback-toggle")
  voiceFeedbackEnabled = toggle.checked

  const status = voiceFeedbackEnabled ? "aktivizuar" : "çaktivizuar"
  speakText(`Përgjigjet me zë u ${status}`)
}

function showTypingIndicator() {
  const messagesContainer = document.getElementById("chat-messages")
  const typingDiv = document.createElement("div")
  typingDiv.className = "message bot-message typing-indicator"
  typingDiv.id = "typing-indicator"
  typingDiv.innerHTML = `
        <div class="message-avatar">🤖</div>
        <div class="message-content">
            <div class="typing-dots">
                <span></span>
                <span></span>
                <span></span>
            </div>
        </div>
    `

  messagesContainer.appendChild(typingDiv)
  messagesContainer.scrollTop = messagesContainer.scrollHeight
}

function hideTypingIndicator() {
  const typingIndicator = document.getElementById("typing-indicator")
  if (typingIndicator) {
    typingIndicator.remove()
  }
}

function updateChatbotStatus(status) {
  document.getElementById("chatbot-status").textContent = status
}

// Text-to-Speech function
function speakText(text, priority = "normal") {
  if (!voiceFeedbackEnabled || !speechSynthesis || !text) return

  // Cancel previous speech if high priority
  if (priority === "high") {
    speechSynthesis.cancel()
  }

  const utterance = new SpeechSynthesisUtterance(text)
  utterance.rate = speechSettings.rate
  utterance.pitch = speechSettings.pitch
  utterance.volume = speechSettings.volume
  utterance.lang = speechSettings.lang

  if (speechSettings.voice) {
    utterance.voice = speechSettings.voice
  }

  utterance.onerror = (event) => {
    console.error("Speech synthesis error:", event.error)
  }

  speechSynthesis.speak(utterance)
}

// Subject intro function
function playSubjectIntro(subject) {
  if (subject === "letersi") {
    speakText(
      "Mirë se vini në lëndën e letërsisë! Këtu mund të mësoni për autorët e mëdhenj shqiptarë dhe botërorë, analizat letrare dhe zhvillimin e letërsisë.",
    )
  }
}

// Bookmark and sharing functions
function toggleBookmark() {
  const btn = document.getElementById("bookmark-btn")
  const isBookmarked = btn.textContent.includes("🔖")

  if (isBookmarked) {
    btn.innerHTML = "🔗 Shëno"
    speakText("Shënimi u hoq")
  } else {
    btn.innerHTML = "🔖 E shënuar"
    speakText("Leksioni u shënua")
  }
}

function showTranscript() {
  speakText("Transkripti do të shfaqet së shpejti")
}

function shareLesson() {
  speakText("Opsionet e ndarjes do të shfaqen së shpejti")
}

function toggleVoiceControl() {
  isVoiceControlActive = !isVoiceControlActive
  const btn = document.querySelector(".voice-control-btn")

  if (isVoiceControlActive) {
    btn.style.background = "var(--primary-color)"
    btn.style.color = "white"
    speakText("Kontrolli me zë u aktivizua")
  } else {
    btn.style.background = ""
    btn.style.color = ""
    speakText("Kontrolli me zë u çaktivizua")
  }
}

function increaseSpeed() {
  const speeds = [0.5, 0.75, 1, 1.25, 1.5, 2]
  const currentIndex = speeds.indexOf(playbackSpeed)
  if (currentIndex < speeds.length - 1) {
    playbackSpeed = speeds[currentIndex + 1]
    if (currentAudio) currentAudio.playbackRate = playbackSpeed
    document.getElementById("speed-btn").textContent = `${playbackSpeed}x`
  }
}

function decreaseSpeed() {
  const speeds = [0.5, 0.75, 1, 1.25, 1.5, 2]
  const currentIndex = speeds.indexOf(playbackSpeed)
  if (currentIndex > 0) {
    playbackSpeed = speeds[currentIndex - 1]
    if (currentAudio) currentAudio.playbackRate = playbackSpeed
    document.getElementById("speed-btn").textContent = `${playbackSpeed}x`
  }
}
