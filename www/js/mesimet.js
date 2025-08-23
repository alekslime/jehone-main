// Mesimet page functionality
function playWelcomeAudio() {
  const audio = new Audio("audio/CFARE MESIMI DO TE DEGJOSH.mp3")
  audio.play().catch((e) => console.error("Error playing audio:", e))
}

function startVoiceRecognition() {
  const output = document.getElementById("output")

  if (!window.webkitSpeechRecognition) {
    output.innerHTML = '<p style="color: red;">Njohja e zërit nuk është e mbështetur.</p>'
    return
  }

  const recognition = new window.webkitSpeechRecognition()
  recognition.lang = "sq-AL"
  recognition.continuous = false
  recognition.interimResults = false

  output.innerHTML = '<p style="color: var(--primary-color);"><strong>Duke dëgjuar...</strong></p>'

  recognition.start()

  recognition.onresult = (event) => {
    const transcript = event.results[0][0].transcript.toLowerCase()

    output.innerHTML = `<p><strong>Ju thatë:</strong> "${transcript}"</p>`

    // Process commands
    if (transcript.includes("biologji")) {
      window.location.href = "biologji12.html"
    } else if (transcript.includes("letërsi")) {
      window.location.href = "letersi12.html"
    } else if (transcript.includes("gjeografi") || transcript.includes("gjeo")) {
      window.location.href = "gjeografi12.html"
    } else if (transcript.includes("histori")) {
      window.location.href = "histori12.html"
    } else {
      output.innerHTML = `<p style="color: orange;">Nuk ju kuptova: "${transcript}"</p>`
    }
  }

  recognition.onerror = () => {
    output.innerHTML = '<p style="color: red;">Gabim në njohjen e zërit.</p>'
  }
}

// Auto-play welcome audio when page loads
window.addEventListener("load", () => {
  setTimeout(playWelcomeAudio, 1000)
})
