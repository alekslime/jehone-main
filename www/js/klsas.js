// Klasa page functionality
function playClassAudio() {
  const audio = new Audio("../audio/uliksi.mp3")
  audio.play().catch((e) => console.error("Error playing audio:", e))
}

// Add click animations
document.querySelectorAll(".klasa-card").forEach((card) => {
  card.addEventListener("click", function (e) {
    // Add click effect
    this.style.transform = "scale(0.95)"
    setTimeout(() => {
      this.style.transform = ""
    }, 150)
  })
})
