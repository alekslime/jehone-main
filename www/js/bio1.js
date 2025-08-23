const { SpeechRecognition } = Capacitor.Plugins;

// ===== Audio Files =====
window.berthama = new Audio('/audio/permbajtja e berthames.mp3');
window.riprodhimi = new Audio('/audio/riprodhimi sexual dhe trashegimia.mp3');
window.variacioni = new Audio('/audio/variacioni dhe trashegimia.mp3');
window.bio = new Audio('/audio/BIOLOGJI.mp3');
window.ulikss = new Audio('audio/PERSHENDETJE ME CAR MUND TJU NDIHMOJ.mp3');

[window.berthama, window.riprodhimi, window.variacioni, window.bio, window.ulikss].forEach(audio => audio.load());

window.isListening = false;
window.recognitionInProgress = false;

// ===== Player Controls =====
window.togglePlay = function() {
  if (!window.currentAudio) return;
  if (window.currentAudio.paused) {
    window.currentAudio.play();
    document.querySelector('.play').textContent = '❚❚';
  } else {
    window.currentAudio.pause();
    document.querySelector('.play').textContent = '▶';
  }
};

window.rewind = function() {
  if (!window.currentAudio) return;
  window.currentAudio.currentTime = Math.max(0, window.currentAudio.currentTime - 10);
};

window.skip = function() {
  if (!window.currentAudio) return;
  window.currentAudio.currentTime = Math.min(window.currentAudio.duration, window.currentAudio.currentTime + 10);
};

window.setVolume = function(val) {
  if (!window.currentAudio) return;
  window.currentAudio.volume = val;
};

window.seekAudio = function(val) {
  if (!window.currentAudio) return;
  window.currentAudio.currentTime = (val / 100) * window.currentAudio.duration;
};

window.formatTime = function(seconds) {
  const mins = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);
  return `${mins}:${secs.toString().padStart(2, '0')}`;
};
    

const close = document.getElementById('close-btn');
const player = document.getElementById('audioPlayer');
window.togglePlayer = function(){
    player.style.display = (player.style.display == 'none') ? 'flex' : 'none';
}
// ===== Show Audio Player =====
window.showAudioPlayer = function(title, audioObj) {
  const player = document.getElementById('audioPlayer');
  const trackTitle = document.getElementById('trackTitle');
  const playBtn = document.querySelector('.play');
  const progressBar = document.getElementById('progressBar');
  const currentTimeEl = document.getElementById('currentTime');
  const durationEl = document.getElementById('duration');

  window.currentAudio = audioObj;
  trackTitle.textContent = title;
  player.style.display = 'flex';
  playBtn.textContent = '❚❚';

  audioObj.onloadedmetadata = () => {
    durationEl.textContent = window.formatTime(audioObj.duration);
  };

  audioObj.ontimeupdate = () => {
    if (!isNaN(audioObj.duration)) {
      progressBar.value = (audioObj.currentTime / audioObj.duration) * 100;
      currentTimeEl.textContent = window.formatTime(audioObj.currentTime);
    }
  };
};

// ===== Play Audio (Stop Others) =====
window.playSound = function(audio) {
  if (window.currentAudio && window.currentAudio !== audio) {
    window.currentAudio.pause();
    window.currentAudio.currentTime = 0;
  }
  [window.berthama, window.riprodhimi, window.variacioni, window.bio, window.ulikss].forEach(a => {
    if (a !== audio) {
      a.pause();
      a.currentTime = 0;
    }
  });

  audio.play().catch(e => console.error('Audio playback failed:', e));

  let title = '';
  if (audio === window.berthama) title = 'Përmbajtja e Bërthamës';
  else if (audio === window.riprodhimi) title = 'Riprodhimi Seksual dhe Trashëgimia';
  else if (audio === window.variacioni) title = 'Variacioni dhe Trashëgimia';
  else if (audio === window.bio) title = 'Biologji';
  else if (audio === window.ulikss) title = 'Uliks Përshëndetje';

  window.showAudioPlayer(title, audio);
};

// ===== Speech Recognition Events =====
SpeechRecognition.addListener('speechResult', (event) => {
  console.log('FINAL RESULT event:', JSON.stringify(event));

  const transcript = Array.isArray(event.value)
    ? event.value.map(v => v.toLowerCase()).join(' ')
    : String(event.value || '').toLowerCase();

  if (!transcript) {
    console.log('No speech detected');
    return;
  }

  const normalized = transcript.normalize("NFD").replace(/[\u0300-\u036f]/g, "");
  console.log('Normalized transcript:', normalized);

  // Commands from both codes
  if (normalized.includes('bertha') || normalized.includes('iet')) {
    window.playSound(window.berthama);
  } else if (normalized.includes('riprodh')) {
    window.playSound(window.riprodhimi);
  } else if (normalized.includes('varia') || normalized.includes('varja')) {
    window.playSound(window.variacioni);
  } else if (normalized.includes('pershe') || normalized.includes('uli') || normalized.includes('uliks')) {
    window.playSound(window.ulikss);
  } else if (normalized.includes('bio') || normalized.includes('lo') || normalized.includes('biologji')) {
    window.location.href = 'biologji.html';
  } else if (normalized.includes('gjeo') || normalized.includes('grafi') || normalized.includes('gjeografi')) {
    window.location.href = 'gjeografi12.html';
  } else {
    const output = document.getElementById('output');
    if (output) output.innerHTML = 'Nuk ju kuptoj :(';
  }
});

SpeechRecognition.addListener('speechPartialResult', (event) => {
  console.log('PARTIAL RESULT event:', JSON.stringify(event));
});

SpeechRecognition.addListener('speechEnd', async () => {
  console.log('Speech ended');
  try {
    await SpeechRecognition.stop();
    console.log('Stopped after speech end');
  } catch (e) {
    console.warn('Stop failed:', e);
  }
  await window.resetAfterDelay();
});

SpeechRecognition.addListener('speechError', async (error) => {
  console.error('Speech error:', error);
  try {
    await SpeechRecognition.stop();
    console.log('Force stopped after error');
  } catch (e) {
    console.warn('Failed to stop cleanly:', e);
  }
  await window.resetAfterDelay();
});

// ===== Helpers =====
window.delay = function(ms) {
  return new Promise(res => setTimeout(res, ms));
};

window.resetAfterDelay = async function() {
  console.log('Delaying reset to let mic release...');
  await window.delay(1200);
  window.recognitionInProgress = false;
  window.isListening = false;
  console.log('Ready for next speech recognition');
};

// ===== Start Listening =====
window.startListening = async function() {
  if (window.recognitionInProgress) {
    console.log('Recognition in progress — forcing stop before restart');
    try {
      await SpeechRecognition.stop();
    } catch (e) {
      console.warn('Stop failed (probably already stopped):', e);
    }
    await window.delay(200);
    window.recognitionInProgress = false;
    window.isListening = false;
  }

  try {
    const permissionStatus = await SpeechRecognition.checkPermissions();
    console.log('Permissions:', JSON.stringify(permissionStatus));
    if (permissionStatus.speechRecognition !== 'granted') {
      const requestResult = await SpeechRecognition.requestPermissions();
      if (requestResult.speechRecognition !== 'granted') {
        console.error('Permission denied');
        return;
      }
    }

    const available = await SpeechRecognition.available();
    console.log('Available:', available);

    window.isListening = true;
    window.recognitionInProgress = true;

    await SpeechRecognition.start({
      language: 'sq-AL',
      maxResults: 5,
      prompt: '',
      partialResults: false,
      popup: false,
    });

    console.log('Listening...');

    setTimeout(() => {
      if (window.recognitionInProgress) {
        window.recognitionInProgress = false;
        window.isListening = false;
        console.warn('Fallback timeout reset');
      }
    }, 4000);

  } catch (err) {
    console.error('Start failed:', err);
    window.recognitionInProgress = false;
    window.isListening = false;
  }
};

// ===== Hook up button =====
document.addEventListener('DOMContentLoaded', () => {
  const btn = document.getElementById('uliks-btn');
  if (btn) {
    btn.addEventListener('click', window.startListening);
  }
});

// Optional: Play BIO by default on load
  window.onload = () => window.playSound(window.bio);






          // Theme Management
        window.toggleTheme = function() {
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

        // Save Progress
        window.saveProgress = function(topic, progress) {
            // Save to localStorage
            const progressData = JSON.parse(localStorage.getItem('audioProgress') || '{}')
            progressData[topic] = Math.round(progress)
            localStorage.setItem('audioProgress', JSON.stringify(progressData))
            
            // Update UI if needed
            updateTopicProgress(topic, Math.round(progress))
        }

        // Load Progress
        window.loadProgress = function() {
            const progressData = JSON.parse(localStorage.getItem('audioProgress') || '{}')
            
            // Update UI for each topic
            Object.keys(progressData).forEach(topic => {
                updateTopicProgress(topic, progressData[topic])
            })
        }

        // Update Topic Progress UI
        window.updateTopicProgress = function(topic, progress) {
            const topicCard = document.querySelector(`.topic-card[data-topic="${topic}"]`)
            if (!topicCard) return
            
            // Add or update progress indicator
            let indicator = topicCard.querySelector('.progress-indicator')
            if (!indicator && progress > 0) {
                indicator = document.createElement('div')
                indicator.className = 'progress-indicator'
                topicCard.appendChild(indicator)
            }
            
            if (indicator) {
                if (progress >= 100) {
                    indicator.textContent = '✓'
                    indicator.style.background = 'var(--success)'
                } else {
                    indicator.textContent = `${progress}%`
                }
            }
        }

        // Bookmark Toggle
        window.toggleBookmark = function(btn) {
            const isBookmarked = btn.classList.contains('bookmarked')
            
            if (isBookmarked) {
                btn.classList.remove('bookmarked')
                btn.innerHTML = '<span>🔖</span>'
                showVoiceMessage("📌 Hequr nga të ruajturit", "default")
            } else {
                btn.classList.add('bookmarked')
                btn.innerHTML = '<span>📌</span>'
                showVoiceMessage("📌 Shtuar në të ruajturit", "success")
            }
            
            // Save bookmarks to localStorage
            saveBookmarks()
        }

        // Save Bookmarks
        window.saveBookmarks = function() {
            const bookmarkedTopics = []
            document.querySelectorAll('.bookmark-btn.bookmarked').forEach(btn => {
                const topicCard = btn.closest('.topic-card')
                if (topicCard) {
                    bookmarkedTopics.push(topicCard.dataset.topic)
                }
            })
            
            localStorage.setItem('bookmarkedTopics', JSON.stringify(bookmarkedTopics))
        }

        // Load Bookmarks
        window.loadBookmarks = function() {
            const bookmarkedTopics = JSON.parse(localStorage.getItem('bookmarkedTopics') || '[]')
            
            bookmarkedTopics.forEach(topic => {
                const topicCard = document.querySelector(`.topic-card[data-topic="${topic}"]`)
                if (topicCard) {
                    const bookmarkBtn = topicCard.querySelector('.bookmark-btn')
                    if (bookmarkBtn) {
                        bookmarkBtn.classList.add('bookmarked')
                        bookmarkBtn.innerHTML = '<span>📌</span>'
                    }
                }
            })
        }



        window.toggleMobileMenu = function() {
            const menu = document.querySelector('.nav-menu');
            menu.classList.toggle('show');
        }

        // AI Chatbot State
        let chatbotVisible = false
        let chatVoiceActive = false
        let chatRecognition = null
        let chatHistory = []

        // Biology Knowledge Base
        const biologyKnowledgeBase = {
            "adn": {
                keywords: ["adn", "dna", "acid", "nukleik", "gjenetik", "kod"],
                answer: "ADN-ja (Acidi Deoksiribonukleik) është molekula që mban informacionin gjenetik në të gjitha organizmat e gjallë. Ajo përbëhet nga dy zinxhirë të spiralizuar që formojnë një spirale të dyfishtë. ADN-ja përmban katër baza: Adenina (A), Timina (T), Guanina (G) dhe Citozina (C). Ky informacion përdoret për të prodhuar proteina dhe për t'u trashëguar nga prindërit te pasardhësit."
            },
            "fotosinteza": {
                keywords: ["fotosintez", "drita", "klorofil", "oksigjen", "glukoze", "bimë"],
                answer: "Fotosinteza është procesi ku bimët përdorin energjinë e dritës së diellit për të prodhuar ushqim. Gjatë fotosintezës, bimët marrin dioksid karboni nga ajri dhe ujë nga rrënjët, dhe me ndihmën e klorofilit prodhojnë glukoze dhe oksigjen. Formula kimike është: 6CO₂ + 6H₂O + energji drite → C₆H₁₂O₆ + 6O₂. Ky proces është jetik për jetën në Tokë sepse prodhon oksigjenin që ne thithim."
            },
            "mitoza": {
                keywords: ["mitoz", "ndarje", "qeliz", "kromosom", "reprodukim"],
                answer: "Mitoza është procesi i ndarjes së qelizës ku një qelizë prind ndahet në dy qeliza të reja identike. Ky proces ka pesë faza: Profaza, Metafaza, Anafaza, Telofaza dhe Citokineza. Gjatë mitozës, kromozomet duplikohen dhe ndahen në mënyrë të barabartë midis dy qelizave të reja. Mitoza është e rëndësishme për rritjen, riparimin e indeve dhe zëvendësimin e qelizave të vdekura."
            },
            "berthama": {
                keywords: ["bërtham", "qeliz", "adn", "arn", "protein", "ribozom"],
                answer: "Bërthama është qendra e kontrollit të qelizës që përmban ADN-në. Ajo rregullon të gjitha aktivitetet qelizore duke kontrolluar shprehjen e gjeneve. Në bërthamë ndodhen kromozomet që përmbajnë informacionin gjenetik. Bërthama është e rrethuar nga membrana bërthamore që ka pore për të lejuar kalimin e molekulave. Gjithashtu, në bërthamë prodhohet ARN-ja që përdoret për sintezën e proteinave."
            },
            "riprodhimi": {
                keywords: ["riprodhim", "seksual", "gamete", "fertilizim", "zigot"],
                answer: "Riprodhimi seksual është procesi ku dy organizma kontribuojnë me material gjenetik për të krijuar pasardhës. Ai përfshin prodhimin e gameteve (qeliza seksuale) përmes meiozës, fertilizimin (bashkimin e gameteve) dhe zhvillimin e zigotit. Riprodhimi seksual krijon diversitet gjenetik sepse pasardhësit marrin gjene nga të dy prindërit. Kjo është e rëndësishme për evolucionin dhe përshtatjen e specieve."
            },
            "variacioni": {
                keywords: ["variacion", "mutacion", "evolucion", "trashëgimi", "diversitet"],
                answer: "Variacioni gjenetik është ndryshimi në karakteristikat e organizmave brenda një specie. Ai krijohet përmes mutacioneve, riprodhimit seksual dhe rekombinimit gjenetik. Variacioni është bazë e evolucionit sepse lejon që disa individë të jenë më të përshtatshëm për mjedis të caktuar. Seleksioni natyror vepron mbi këtë variacion duke favorizuar karakteristikat që rrisin shanset e mbijetesës dhe riprodhimit."
            },
            "ekosistemi": {
                keywords: ["ekosistem", "biodiversitet", "zinxhir", "ushqim", "mjedis"],
                answer: "Ekosistemi është një komunitet i organizmave të gjallë që ndërveprojnë me njëri-tjetrin dhe me mjedisin e tyre fizik. Ai përfshin prodhuesit (bimët), konsumatorët (kafshët) dhe dekompozuesit (bakteret dhe kërpudhat). Zinxhirët ushqimorë tregojnë se si energjia kalon nga një nivel në tjetrin. Biodiversiteti është i rëndësishëm për stabilitetin e ekosistemit dhe për shërbimet që ai ofron për njerëzit."
            }
        }

        // AI Response Generation
        window.generateAIResponse = function(question) {
            const lowerQuestion = question.toLowerCase()
            
            // Search knowledge base
            for (const [topic, data] of Object.entries(biologyKnowledgeBase)) {
                if (data.keywords.some(keyword => lowerQuestion.includes(keyword))) {
                    return {
                        answer: data.answer,
                        confidence: 0.9,
                        source: `Biologji - ${topic.charAt(0).toUpperCase() + topic.slice(1)}`
                    }
                }
            }
            
            // General biology responses
            if (lowerQuestion.includes("biologji") || lowerQuestion.includes("shkencë")) {
                return {
                    answer: "Biologjia është shkenca që studion jetën dhe organizmat e gjallë. Ajo përfshin shumë fusha si gjenetika, ekologjia, anatomia, fiziologjia dhe evolucioni. A keni ndonjë pyetje specifike rreth ndonjë teme biologjike?",
                    confidence: 0.7,
                    source: "Biologji - Përgjithshme"
                }
            }
            
            if (lowerQuestion.includes("mësim") || lowerQuestion.includes("kapitull")) {
                return {
                    answer: "Në platformën tonë kemi katër kapituj kryesorë: Përmbajtja e Bërthamës, Riprodhimi Seksual dhe Trashëgimia, Variacioni dhe Trashëgimia, dhe Ekosistemet dhe Biodiversiteti. Cili kapitull ju intereson më shumë?",
                    confidence: 0.8,
                    source: "Jehonë - Kurrikula"
                }
            }
            
            if (lowerQuestion.includes("ndihmë") || lowerQuestion.includes("si")) {
                return {
                    answer: "Mund t'ju ndihmoj me pyetje rreth biologjisë, shpjegime të koncepteve, ndihmë me detyrat, ose orientim në platformë. Gjithashtu mund të përdorni komandat me zë për të kontrolluar mësimet. Çfarë dëshironi të dini?",
                    confidence: 0.8,
                    source: "Jehonë - Ndihmë"
                }
            }
            
            // Default response
            return {
                answer: "Më vjen keq, por nuk kam informacion të mjaftueshëm për këtë pyetje. Mund të më pyesni rreth temave të biologjisë si ADN-ja, fotosinteza, mitoza, riprodhimi, ose ekosistemet. Gjithashtu mund të kontaktoni mësuesit tuaj për pyetje më specifike.",
                confidence: 0.3,
                source: "Jehonë - Përgjigje e përgjithshme"
            }
        }

        // Chatbot Functions
        window.showChatbot = function() {
            const chatbot = document.getElementById('aiChatbot')
            const toggleBtn = document.getElementById('chatbotToggleBtn')
            
            chatbot.classList.add('active')
            toggleBtn.style.display = 'none'
            chatbotVisible = true
            
            // Hide notification
            const notification = document.getElementById('chatbotNotification')
            notification.style.display = 'none'
            
            // Speak welcome message if voice feedback is enabled
            if (voiceFeedbackEnabled) {
                setTimeout(() => {
                    speakText("Përshëndetje! Si mund t'ju ndihmoj me biologjinë sot?")
                }, 500)
            }
        }

         window.toggleChatbot = function() {
            const chatbot = document.getElementById('aiChatbot')
            const toggleIcon = document.getElementById('chatbotToggleIcon')
            
            if (chatbot.classList.contains('minimized')) {
                chatbot.classList.remove('minimized')
                toggleIcon.textContent = '−'
            } else {
                chatbot.classList.add('minimized')
                toggleIcon.textContent = '+'
            }
        }

        window.hideChatbot = function() {
            const chatbot = document.getElementById('aiChatbot')
            const toggleBtn = document.getElementById('chatbotToggleBtn')
            
            chatbot.classList.remove('active')
            toggleBtn.style.display = 'flex'
            chatbotVisible = false
            
            // Stop any ongoing voice input
            if (chatVoiceActive) {
                stopChatVoiceInput()
            }
        }

        window.sendChatMessage = function() {
            const input = document.getElementById('chatInput')
            const message = input.value.trim()
            
            if (!message) return
            
            // Add user message
            addChatMessage(message, 'user')
            
            // Clear input
            input.value = ''
            
            // Show typing indicator
            showTypingIndicator()
            
            // Generate AI response
            setTimeout(() => {
                const response = generateAIResponse(message)
                hideTypingIndicator()
                addChatMessage(response.answer, 'ai', response.source)
                
                // Speak response if voice feedback is enabled
                if (voiceFeedbackEnabled) {
                    setTimeout(() => {
                        speakText(response.answer)
                    }, 300)
                }
            }, 1000 + Math.random() * 1000) // Simulate thinking time
        }

        window.addChatMessage = function(message, sender, source = null) {
            const messagesContainer = document.getElementById('chatMessages')
            const messageDiv = document.createElement('div')
            messageDiv.className = `message ${sender}-message`
            
            const avatar = sender === 'ai' ? '🤖' : '👤'
            const timestamp = new Date().toLocaleTimeString('sq-AL', { 
                hour: '2-digit', 
                minute: '2-digit' 
            })
            
            messageDiv.innerHTML = `
                <div class="message-avatar">${avatar}</div>
                <div class="message-content">
                    <p>${message}</p>
                    ${source ? `<small style="opacity: 0.7; font-size: 0.8em;">Burimi: ${source}</small>` : ''}
                    <div class="message-actions">
                        ${sender === 'ai' ? `<button class="play-message-btn" onclick="playMessage(this, '${message.replace(/'/g, "\\'")}')"><span>🔊</span></button>` : ''}
                        <small style="opacity: 0.5; font-size: 0.7em; margin-left: auto;">${timestamp}</small>
                    </div>
                </div>
            `
            
            messagesContainer.appendChild(messageDiv)
            messagesContainer.scrollTop = messagesContainer.scrollHeight
            
            // Add to chat history
            chatHistory.push({ message, sender, timestamp, source })
            
            // Limit history to last 50 messages
            if (chatHistory.length > 50) {
                chatHistory = chatHistory.slice(-50)
            }
        }

        window.showTypingIndicator = function() {
            const messagesContainer = document.getElementById('chatMessages')
            const typingDiv = document.createElement('div')
            typingDiv.className = 'message ai-message typing-indicator-message'
            typingDiv.id = 'typingIndicator'
            
            typingDiv.innerHTML = `
                <div class="message-avatar">🤖</div>
                <div class="message-content">
                    <div class="typing-indicator">
                        <div class="typing-dot"></div>
                        <div class="typing-dot"></div>
                        <div class="typing-dot"></div>
                    </div>
                </div>
            `
            
            messagesContainer.appendChild(typingDiv)
            messagesContainer.scrollTop = messagesContainer.scrollHeight
        }

        window.hideTypingIndicator = function() {
            const typingIndicator = document.getElementById('typingIndicator')
            if (typingIndicator) {
                typingIndicator.remove()
            }
        }

        window.handleChatKeyPress = function(event) {
            if (event.key === 'Enter') {
                sendChatMessage()
            }
        }

        window.askQuickQuestion = function(question) {
            const input = document.getElementById('chatInput')
            input.value = question
            sendChatMessage()
        }

        window.playMessage = function(button, message) {
            // Visual feedback
            button.style.color = 'var(--bio-primary)'
            
            // Speak the message
            speakText(message)
            
            // Reset button color
            setTimeout(() => {
                button.style.color = ''
            }, 1000)
        }

        // Chat Voice Input
        window.startChatVoiceInput = function() {
            if (!window.webkitSpeechRecognition && !window.SpeechRecognition) {
                addChatMessage("Më vjen keq, por njohja e zërit nuk është e mbështetur në këtë shfletues.", 'ai')
                return
            }
            
            if (chatVoiceActive) {
                stopChatVoiceInput()
                return
            }
            
            chatRecognition = new (window.SpeechRecognition || window.webkitSpeechRecognition)()
            chatRecognition.lang = "sq-AL"
            chatRecognition.continuous = false
            chatRecognition.interimResults = false
            
            const voiceBtn = document.getElementById('chatVoiceInput')
            const status = document.getElementById('chatbotStatus')
            
            // Visual feedback
            voiceBtn.classList.add('active')
            status.textContent = 'Duke dëgjuar...'
            chatVoiceActive = true
            
            chatRecognition.start()
            
            chatRecognition.onresult = (event) => {
                const transcript = event.results[0][0].transcript
                const input = document.getElementById('chatInput')
                input.value = transcript
                
                // Auto-send the message
                setTimeout(() => {
                    sendChatMessage()
                }, 500)
                
                stopChatVoiceInput()
            }
            
            chatRecognition.onerror = (event) => {
                console.error('Chat voice recognition error:', event.error)
                addChatMessage("Gabim në njohjen e zërit. Ju lutem provoni përsëri.", 'ai')
                stopChatVoiceInput()
            }
            
            chatRecognition.onend = () => {
                stopChatVoiceInput()
            }
        }

        window.stopChatVoiceInput = function() {
            if (chatRecognition) {
                chatRecognition.stop()
            }
            
            const voiceBtn = document.getElementById('chatVoiceInput')
            const status = document.getElementById('chatbotStatus')
            
            voiceBtn.classList.remove('active')
            status.textContent = 'Online'
            chatVoiceActive = false
        }

        window.toggleChatVoice = function() {
            // This could toggle auto-voice responses or voice input mode
            const btn = document.getElementById('chatVoiceBtn')
            
            if (btn.classList.contains('active')) {
                btn.classList.remove('active')
                speakText("Përgjigjet automatike me zë u çaktivizuan")
            } else {
                btn.classList.add('active')
                speakText("Përgjigjet automatike me zë u aktivizuan")
            }
        }

        // Initialize chatbot when page loads
        document.addEventListener("DOMContentLoaded", () => {
            // Show notification after 3 seconds
            setTimeout(() => {
                const notification = document.getElementById('chatbotNotification')
                if (notification && !chatbotVisible) {
                    notification.style.display = 'flex'
                }
            }, 3000)
            
            // Add welcome message to history
            chatHistory.push({
                message: "Përshëndetje! Unë jam Jehonë AI, asistenti juaj për biologji. Mund të më pyesni çdo gjë rreth mësimeve, koncepteve biologjike, ose ndihmë me detyrat. Si mund t'ju ndihmoj sot?",
                sender: 'ai',
                timestamp: new Date().toLocaleTimeString('sq-AL', { hour: '2-digit', minute: '2-digit' }),
                source: 'Jehonë AI'
            })
        })

        // Add CSS for voice message types and bookmarked state
        const style = document.createElement("style")
        style.textContent = `
            .error { color: #ef4444; }
            .success { color: #22c55e; }
            .listening { color: #6366f1; }
            .bookmarked { background: var(--bio-primary) !important; color: white !important; }
        `
        document.head.appendChild(style)


        window.playSound = playSound;
        window.startListening = startListening;