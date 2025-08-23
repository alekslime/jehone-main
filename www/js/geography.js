    const playBtn = document.querySelector('.play');
    const progressBar = document.getElementById('progressBar');
    const currentTimeEl = document.getElementById('currentTime');
    const durationEl = document.getElementById('duration');
    const player = document.getElementById('audioPlayer');


function togglePlay() {
  if (!window.currentAudio) return;

  if (window.currentAudio.paused) {
    window.currentAudio.play();
    document.querySelector('.play').textContent = '❚❚';
  } else {
    window.currentAudio.pause();
    document.querySelector('.play').textContent = '▶';
  }
}

function rewind() {
  if (!window.currentAudio) return;
  window.currentAudio.currentTime = Math.max(0, window.currentAudio.currentTime - 10);
}

function skip() {
  if (!window.currentAudio) return;
  window.currentAudio.currentTime = Math.min(window.currentAudio.duration, window.currentAudio.currentTime + 10);
}

function setVolume(val) {
  if (!window.currentAudio) return;
  window.currentAudio.volume = val;
}

function seekAudio(val) {
  if (!window.currentAudio) return;
  window.currentAudio.currentTime = (val / 100) * window.currentAudio.duration;
}


    function formatTime(seconds) {
      const mins = Math.floor(seconds / 60);
      const secs = Math.floor(seconds % 60);
      return `${mins}:${secs.toString().padStart(2, '0')}`;
    }

    function togglePlayer() {
      player.style.display = (player.style.display === 'none') ? 'flex' : 'none';
    }

function gjeo12(){
  let output = document.getElementById('output')
  let input = document.getElementById('input')

  var recognition = new webkitSpeechRecognition();
  recognition.lang = "sq-AL";
  recognition.start();

  recognition.onresult = function(event) {
    let transcript = event.results[0][0].transcript;
    if(transcript.includes("hyrje")){
      playSound(hyrje)
    }else if(transcript.includes("ecur")){
      playSound(ecuri)
    }else if(transcript.includes("popu")){
      playSound(popull)
    }else{
      output.innerHTML = "Nuk ju kuptova"
    }
  }

    recognition.onerror = function(event) {
      switch (event.error) {
        case 'audio-capture':
          console.error('No audio capture device found.');
          break;
        case 'not-allowed':
          console.error('The user denied access to the microphone.');
          break;
        case 'no-speech':
          console.error('No speech was detected. Try again.');
          break;
        case 'network':
          console.error('A network error occurred.');
          break;
        case 'service-not-allowed':
          console.error('The user agent does not support speech recognition.');
          break;
        default:
          console.error('An unknown error occurred.');
      }
    }
}

  const hyrje = new Audio('/audio/hyrje.mp3')
  const ecuri = new Audio('/audio/ecuria e numrit te pergjithsme te popullsise.mp3')
  const popull = new Audio('/audio/popullimi i hershem i trevave shqiptare.mp3')
  const gjeo = new Audio('/audio/GJEOGRAFI.mp3')


  function playSound(audio){
     if (window.currentAudio && window.currentAudio !== audio) {
  window.currentAudio.pause();
  window.currentAudio.currentTime = 0;
}
    hyrje.pause();
    hyrje.currentTime = 0;
    ecuri.pause();
    ecuri.currentTime = 0;
    popull.pause();
    popullcurrentTime = 0;

    audio.play();
    let title = '';
  if (audio === hyrje) title = 'Hyrje';
  else if (audio === popull) title = 'Popullsimi i hershem';
  else if (audio === ecuri) title = 'Ecuria e pergjithshme e popullsise';
  else if (audio === gjeo) title = '';

  showAudioPlayer(title, audio);
  }


function showAudioPlayer(title, audioObj) {
  const trackTitle = document.getElementById('trackTitle');
  const playBtn = document.querySelector('.play');
  const progressBar = document.getElementById('progressBar');
  const currentTimeEl = document.getElementById('currentTime');
  const durationEl = document.getElementById('duration');

  window.currentAudio = audioObj;

  // Update title
  trackTitle.textContent = title;

  // Reset button icon
  playBtn.textContent = '❚❚';

  // Display player
  player.style.display = 'flex';

  // Update duration
  audioObj.onloadedmetadata = () => {
    durationEl.textContent = formatTime(audioObj.duration);
  };

  // Update progress
  audioObj.ontimeupdate = () => {
    if (!isNaN(audioObj.duration)) {
      progressBar.value = (audioObj.currentTime / audioObj.duration) * 100;
      currentTimeEl.textContent = formatTime(audioObj.currentTime);
    }
  };
}

  window.onload = playSound(gjeo)


    
    function toggleMobileMenu() {
        const menu = document.querySelector('.nav-menu');
        menu.classList.toggle('show');
    }




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


        // Save Progress
        function saveProgress(topic, progress) {
            // Save to localStorage
            const progressData = JSON.parse(localStorage.getItem('audioProgress') || '{}')
            progressData[topic] = Math.round(progress)
            localStorage.setItem('audioProgress', JSON.stringify(progressData))
            
            // Update UI if needed
            updateTopicProgress(topic, Math.round(progress))
        }

        // Load Progress
        function loadProgress() {
            const progressData = JSON.parse(localStorage.getItem('audioProgress') || '{}')
            
            // Update UI for each topic
            Object.keys(progressData).forEach(topic => {
                updateTopicProgress(topic, progressData[topic])
            })
        }

        // Update Topic Progress UI
        function updateTopicProgress(topic, progress) {
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
        function toggleBookmark(btn) {
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
        function saveBookmarks() {
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
        function loadBookmarks() {
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

        // AI Chatbot State
        let chatbotVisible = false
        let chatVoiceActive = false
        let chatRecognition = null
        let chatHistory = []

        // Biology Knowledge Base
        const biologyKnowledgeBase = {
    "klim": {
        keywords: ["klima", "mot", "temperaturë", "shira", "stinë", "atmosferë"],
        answer: "Klima është modeli i përgjithshëm i motit në një zonë të caktuar gjatë një periudhe të gjatë kohe. Ajo përcaktohet nga temperatura, reshjet, lagështia, era dhe faktorë të tjerë atmosferikë. Klima mund të jetë e ngrohtë, e ftohtë, e thatë apo e lagësht, dhe ndikon shumë në jetën e bimëve, kafshëve dhe njerëzve."
    },
    "relievi": {
        keywords: ["reliev", "mal", "luginë", "kodër", "shkretëtirë", "fushë"],
        answer: "Relievi i Tokës përbëhet nga formacionet natyrore të sipërfaqes si malet, kodrat, luginat dhe fushat. Ai përcakton lartësinë, pjerrësinë dhe format e terrenit, duke ndikuar në klimën lokale dhe aktivitetet njerëzore si bujqësia dhe ndërtimi."
    },
    "oqean": {
        keywords: ["oqean", "det", "ujë", "kripë", "valë", "buzëdeti"],
        answer: "Oqeanet janë sipërfaqe të mëdha uji që mbulojnë rreth 71% të sipërfaqes së Tokës. Ka pesë oqeane kryesore: Paqësorin, Atlantikun, Indianin, Arktikun dhe Antarktikun. Oqeanet janë burim i rëndësishëm i burimeve natyrore dhe ndikojnë në klimën globale."
    },
    "kontinent": {
        keywords: ["kontinent", "Tokë", "Afrikë", "Azia", "Evropë", "Amerikë", "Oqeani"],
        answer: "Kontinentet janë pjesë të mëdha tokësore të ndara nga oqeanet dhe detet. Tokës i ka shtatë kontinente kryesore: Afrika, Antarktika, Azia, Evropa, Amerika e Veriut, Amerika e Jugut dhe Oqeania. Çdo kontinent ka karakteristika unike gjeografike, kulturore dhe klimatike."
    },
    "vullkan": {
        keywords: ["vullkan", "magmë", "lavë", "krater", "shpërthim", "lavas"],
        answer: "Vullkani është një hapje në sipërfaqen e Tokës nga ku del magma, avuj dhe gazra nga brendësia e Tokës. Kur magma arrin sipërfaqen, ajo quhet lavë. Vullkanet mund të jenë aktivë, gjysmë-aktivë ose të fikur, dhe shpërthimet e tyre mund të kenë ndikim të madh në mjedis dhe njerëz."
    },
    "bim": {
        keywords: ["bimë", "mjedis", "tokë", "ujë", "temperaturë", "ekosistem"],
        answer: "Bimët janë pjesë e rëndësishme e ekosistemeve dhe ndihmojnë në ruajtjen e ekuilibrit ekologjik. Ato varen nga klima dhe tiparet gjeografike të vendit ku rriten. Për shembull, pyjet tropikale ndodhen në zona me shumë shi dhe temperatura të larta, ndërsa shkretëtirat kanë bimësi shumë të kufizuar."
    },
    "rrafshnaj": {
        keywords: ["rrafshnajë", "fushë", "tokë e sheshtë", "bujqësi", "vendbanim"],
        answer: "Rrafshnaja është një zonë e sheshtë ose me pak luhatje në reliev, që shpesh përdoret për bujqësi dhe ndërtim vendbanimesh. Ato janë të rëndësishme për zhvillimin ekonomik dhe shpërndarjen e popullsisë."
    },
    "popullsia shqiperise": {
    keywords: ["popullsia", "shqipëri", "banorë", "numër", "densitet", "demografi"],
    answer: "Popullsia e Shqipërisë është rreth 2.8 milion banorë sipas të dhënave të fundit. Shumica e popullsisë jeton në zona urbane, si Tirana, Durrësi dhe Shkodra. Densiteti i popullsisë ndryshon shumë midis rajoneve, me zona malore që kanë më pak banorë dhe fushat që janë më të populluara. Shqipëria ka një strukturë demografike të përzier, me një përqindje të konsiderueshme të të rinjve dhe të moshuarve."
    }

        }

        // AI Response Generation
        function generateAIResponse(question) {
            const lowerQuestion = question.toLowerCase()
            
            // Search knowledge base
            for (const [topic, data] of Object.entries(biologyKnowledgeBase)) {
                if (data.keywords.some(keyword => lowerQuestion.includes(keyword))) {
                    return {
                        answer: data.answer,
                        confidence: 0.9,
                        source: `Gjeografi - ${topic.charAt(0).toUpperCase() + topic.slice(1)}`
                    }
                }
            }
            
            // General biology responses
if (lowerQuestion.includes("jeografi") || lowerQuestion.includes("shkencë")) {
    return {
        answer: "Gjeografia është shkenca që studion Tokën, peizazhet, popullsinë, klimën dhe marrëdhëniet ndërmjet tyre. A doni të dini më shumë për ndonjë temë specifike gjeografike, si klima, relievi, popullsia apo kontinentet?",
        confidence: 0.75,
        source: "Gjeografi - Përgjithshme"
    };
}

            
            if (lowerQuestion.includes("mësim") || lowerQuestion.includes("kapitull")) {
                return {
                    answer: "Në platformën tonë kemi katër mesime kryesorë: Hyrje, Ecuria e pergjithshme e popullsise dhe Popullimi i hershem i trevave shqiptare. Cili mesim ju intereson më shumë?",
                    confidence: 0.8,
                    source: "Jehonë - Kurrikula"
                }
            }
            
            if (lowerQuestion.includes("ndihmë") || lowerQuestion.includes("si")) {
                return {
                    answer: "Mund t'ju ndihmoj me pyetje rreth gjeografise, shpjegime të koncepteve, ndihmë me detyrat, ose orientim në platformë. Gjithashtu mund të përdorni komandat me zë për të kontrolluar mësimet. Çfarë dëshironi të dini?",
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
        function showChatbot() {
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

        function toggleChatbot() {
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

        function hideChatbot() {
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

        function sendChatMessage() {
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

        function addChatMessage(message, sender, source = null) {
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

        function showTypingIndicator() {
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

        function hideTypingIndicator() {
            const typingIndicator = document.getElementById('typingIndicator')
            if (typingIndicator) {
                typingIndicator.remove()
            }
        }

        function handleChatKeyPress(event) {
            if (event.key === 'Enter') {
                sendChatMessage()
            }
        }

        function askQuickQuestion(question) {
            const input = document.getElementById('chatInput')
            input.value = question
            sendChatMessage()
        }

        function playMessage(button, message) {
            // Visual feedback
            button.style.color = 'var(--bio-primary)'
            
            
            // Reset button color
            setTimeout(() => {
                button.style.color = ''
            }, 1000)
        }

 
        function stopChatVoiceInput() {
            if (chatRecognition) {
                chatRecognition.stop()
            }
            
            const voiceBtn = document.getElementById('chatVoiceInput')
            const status = document.getElementById('chatbotStatus')
            
            voiceBtn.classList.remove('active')
            status.textContent = 'Online'
            chatVoiceActive = false
        }

        function toggleChatVoice() {
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
