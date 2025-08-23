// History page functionality with AI chatbot
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

// History Knowledge Base
const historyKnowledgeBase = {
  skënderbeu: {
    content:
      "Gjergj Kastrioti Skënderbeu (1405-1468) ishte një udhëheqës ushtarak dhe politik shqiptar që u bë simbol i rezistencës kundër Perandorisë Osmane. Ai u lind në Krujë dhe u mor si peng nga osmanët në moshë të re. Pas kthimit në Shqipëri, ai organizoi një koalicion të principatave shqiptare dhe luftoi kundër osmanëve për 25 vjet. Ai është konsideruar hero kombëtar i Shqipërisë.",
    confidence: 0.95,
    source: "Historia e Shqipërisë - Skënderbeu",
  },
  "rilindja kombëtare": {
    content:
      "Rilindja Kombëtare Shqiptare ishte një lëvizje kulturore, politike dhe sociale që filloi në gjysmën e dytë të shekullit XIX. Ajo synonte ruajtjen e identitetit kombëtar shqiptar, zhvillimin e arsimit dhe kulturës në gjuhën shqipe, dhe më vonë pavarësinë politike. Figurat kryesore ishin Naim Frashëri, Sami Frashëri, Pashko Vasa, Jani Vreto dhe të tjerë.",
    confidence: 0.93,
    source: "Historia e Shqipërisë - Rilindja",
  },
  ilirët: {
    content:
      "Ilirët ishin popujt e lashtë që banonin në Gadishullin Ballkanik, përfshirë territorin e sotëm të Shqipërisë. Ata konsiderohen paraardhësit e shqiptarëve. Ilirët kishin një kulturë të zhvilluar dhe luftuan kundër ekspansionit romak. Mbretëria më e famshme ilire ishte ajo e Teuta-s dhe Gent-it. Gjuha ilire konsiderohet si origjina e gjuhës shqipe.",
    confidence: 0.9,
    source: "Historia Antike - Ilirët",
  },
  "lufta e dytë botërore": {
    content:
      "Gjatë Luftës së Dytë Botërore (1939-1945), Shqipëria u pushtua fillimisht nga Italia në 1939 dhe më vonë nga Gjermania në 1943. U formuan lëvizje rezistence, kryesisht Fronti Nacional Çlirimtar (komunistët) dhe Balli Kombëtar. Lufta partizane çoi në çlirimin e vendit në nëntor 1944. Kjo periudhë solli ndryshime të mëdha politike dhe sociale.",
    confidence: 0.92,
    source: "Historia e Shqipërisë - LDBII",
  },
  komunizmi: {
    content:
      "Periudha komuniste në Shqipëri (1944-1990) filloi me ardhjen në pushtet të Enver Hoxhës dhe Partisë së Punës. Kjo periudhë karakterizohej nga një sistem totalitar, izolimi ndërkombëtar, kolektivizimi i bujqësisë, industrializimi i shpejtë dhe kontroll i rreptë i shoqërisë. Regjimi komunist përfundoi me demonstratat studentore të dhjetorit 1990.",
    confidence: 0.94,
    source: "Historia e Shqipërisë - Komunizmi",
  },
  "tranzicioni demokratik": {
    content:
      "Tranzicioni demokratik në Shqipëri filloi në dhjetor 1990 me demonstratat studentore dhe përfundoi me rënien e regjimit komunist. Zgjedhjet e para shumëpartiake u mbajtën në mars 1991. Ky proces solli ndryshime të mëdha: ekonomia e tregut, pluralizmi politik, liritë e shtypit dhe lëvizjes. Megjithatë, tranzicioni ishte i vështirë me kriza ekonomike dhe politike.",
    confidence: 0.91,
    source: "Historia Bashkëkohore - Tranzicioni",
  },
  "liga e lezhës": {
    content:
      "Liga e Lezhës u themelua më 2 mars 1444 nga Gjergj Kastrioti Skënderbeu. Ishte një aleancë ushtarake e principatave shqiptare kundër Perandorisë Osmane. Liga përfshinte shumicën e krerëve feudalë shqiptarë dhe synonte të bashkonte forcat për të luftuar pushtuesit osmanë. Ajo konsiderohet si një nga përpjekjet e para për bashkimin e shqiptarëve.",
    confidence: 0.88,
    source: "Historia Mesjetare - Liga e Lezhës",
  },
}

// Audio tracks for history
const historyTracks = [
  { id: "ilire", title: "Ilirët dhe Antikiteti", file: "audio/history/ilire.mp3" },
  { id: "skenderbeu", title: "Skënderbeu dhe Rezistenca", file: "audio/history/skenderbeu.mp3" },
  { id: "rilindja", title: "Rilindja Kombëtare", file: "audio/history/rilindja.mp3" },
  { id: "lufta", title: "Lufta e Dytë Botërore", file: "audio/history/lufta.mp3" },
  { id: "komunizmi", title: "Periudha Komuniste", file: "audio/history/komunizmi.mp3" },
  { id: "demokracia", title: "Tranzicioni Demokratik", file: "audio/history/demokracia.mp3" },
]

// Initialize history page
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

// History voice recognition
function startHistoryVoice() {
  const output = document.getElementById("hist-output")

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

    processHistoryVoiceCommand(transcript)
  }

  recognition.onerror = (event) => {
    output.innerHTML = '<p style="color: red;">Gabim në njohjen e zërit. Provoni përsëri.</p>'
  }
}

// Process history voice commands
function processHistoryVoiceCommand(transcript) {
  const commands = {
    ilirë: () => playHistoryTopic("ilire"),
    skënderbeu: () => playHistoryTopic("skenderbeu"),
    rilindja: () => playHistoryTopic("rilindja"),
    lufta: () => playHistoryTopic("lufta"),
    komunizmi: () => playHistoryTopic("komunizmi"),
    demokracia: () => playHistoryTopic("demokracia"),
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

  speakText(`Nuk ju kuptova. Provoni: ilirë, skënderbeu, rilindja, lufta, komunizmi, ose demokracia`)
}

// Play history topic
function playHistoryTopic(topicId) {
  const track = historyTracks.find((t) => t.id === topicId)
  if (!track) return

  currentTrack = historyTracks.indexOf(track)

  // Show player
  const player = document.getElementById("audio-player")
  player.style.display = "block"

  // Update player info
  document.getElementById("player-title").textContent = track.title
  document.getElementById("player-subtitle").textContent = "Histori"

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
  currentTrack = (currentTrack + 1) % historyTracks.length
  playHistoryTopic(historyTracks[currentTrack].id)
}

function previousTrack() {
  currentTrack = currentTrack > 0 ? currentTrack - 1 : historyTracks.length - 1
  playHistoryTopic(historyTracks[currentTrack].id)
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
  for (const [key, data] of Object.entries(historyKnowledgeBase)) {
    if (message.includes(key) || key.split(" ").some((word) => message.includes(word))) {
      return data
    }
  }

  // General responses
  if (message.includes("ndihmë") || message.includes("help")) {
    return {
      content:
        "Mund t'ju ndihmoj me pyetje rreth historisë së Shqipërisë dhe botës, personaliteteve historike, ngjarjeve të rëndësishme, periodave historike, ose çdo gjë tjetër që lidhet me historinë. Thjesht pyesni!",
      confidence: 0.9,
      source: "Asistenti i Historisë",
    }
  }

  if (message.includes("faleminderit") || message.includes("thanks")) {
    return {
      content: "Ju lutem! Jam këtu për t'ju ndihmuar me çdo pyetje rreth historisë. Mos hezitoni të pyesni!",
      confidence: 0.95,
      source: "Asistenti i Historisë",
    }
  }

  // Default response
  return {
    content:
      "Më vjen keq, por nuk kam informacion të mjaftueshëm për këtë pyetje. Mund të më pyesni për Skënderbeu, Rilindjen Kombëtare, Ilirët, Luftën e Dytë Botërore, komunizmin, ose tranzicionin demokratik.",
    confidence: 0.7,
    source: "Asistenti i Historisë",
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
  if (subject === "histori") {
    speakText(
      "Mirë se vini në lëndën e historisë! Këtu mund të mësoni për historinë e Shqipërisë dhe botës, personalitetet e mëdha historike dhe ngjarjet që kanë formësuar botën tonë.",
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
