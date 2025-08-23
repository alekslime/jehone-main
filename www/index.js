const { SpeechRecognition } = Capacitor.Plugins;

const ulikss = new Audio('audio/PERSHENDETJE ME CAR MUND TJU NDIHMOJ.mp3');
ulikss.load();
ulikss.addEventListener('error', (e) => {
  console.error('Audio error:', e);
});

let isListening = false;
let recognitionInProgress = false;

function playSound(audio) {
  audio.play().catch(e => console.error('Audio playback failed:', e));
}

function delay(ms) {
  return new Promise(res => setTimeout(res, ms));
}

// ===== Log All Events =====
SpeechRecognition.addListener('speechResult', (event) => {
  console.log('FINAL RESULT event:', JSON.stringify(event));

  const transcript = Array.isArray(event.value)
    ? event.value.map(v => v.toLowerCase()).join(' ')
    : String(event.value || '').toLowerCase();

  console.log('Transcript:', transcript);

  if (!transcript) {
    console.log('No speech detected');
    return;
  }

  const normalized = transcript
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "");

  console.log('Normalized transcript:', normalized);

  if (normalized.includes('përshë') || normalized.includes('uli') || normalized.includes('uliks')) {
    console.log('Uliks command detected!');
    playSound(ulikss);
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
  await resetAfterDelay();
});

SpeechRecognition.addListener('speechError', async (error) => {
  console.error('Speech error:', error);
  try {
    await SpeechRecognition.stop();
    console.log('Force stopped after error');
  } catch (e) {
    console.warn('Failed to stop cleanly:', e);
  }
  await resetAfterDelay();
});

// ===== Cooldown Delay =====
async function resetAfterDelay() {
  console.log('Delaying reset to let mic release...');
  await delay(1200);
  recognitionInProgress = false;
  isListening = false;
  console.log('Ready for next speech recognition');
}

// ===== Start Listening =====
async function startListening() {
  if (recognitionInProgress) {
    console.log('Recognition in progress — forcing stop before restart');
    try {
      await SpeechRecognition.stop();
    } catch (e) {
      console.warn('Stop failed (probably already stopped):', e);
    }
    await delay(200); // Let mic fully release
    recognitionInProgress = false;
    isListening = false;
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

    isListening = true;
    recognitionInProgress = true;

    console.log('Calling start...');
    await SpeechRecognition.start({
      language: 'sq-AL',
      maxResults: 5,
      prompt: '',
      partialResults: false,
      popup: false,
    });
    console.log('Listening...');

    setTimeout(() => {
      if (recognitionInProgress) {
        recognitionInProgress = false;
        isListening = false;
        console.warn('Fallback timeout reset');
      }
    }, 4000);

  } catch (err) {
    console.error('Start failed:', err);
    recognitionInProgress = false;
    isListening = false;
  }
}


// ===== Set Up Button =====
document.addEventListener('DOMContentLoaded', () => {
  const btn = document.getElementById('uliks-btn');
  if (btn) {
    btn.addEventListener('click', startListening);
  }
});

    // Accessibility State
    let accessibilitySettings = {
        fontSize: 'normal',
        highContrast: false,
        screenReader: false,
        reducedMotion: false
    };

    // Load saved settings
    function loadAccessibilitySettings() {
        const saved = localStorage.getItem('accessibilitySettings');
        if (saved) {
            accessibilitySettings = { ...accessibilitySettings, ...JSON.parse(saved) };
            applyAccessibilitySettings();
        }
    }

    // Save settings
    function saveAccessibilitySettings() {
        localStorage.setItem('accessibilitySettings', JSON.stringify(accessibilitySettings));
    }

    // Apply settings
    function applyAccessibilitySettings() {
        document.body.setAttribute('data-font-size', accessibilitySettings.fontSize);
        if (accessibilitySettings.highContrast) {
            document.body.setAttribute('data-high-contrast', 'true');
        }
        if (accessibilitySettings.reducedMotion) {
            document.body.style.setProperty('--transition', 'none');
        }
    }
    // Theme Management
    function toggleTheme() {
        const body = document.body;
        const themeIcon = document.querySelector(".theme-icon");
        const menuToggle = document.querySelector(".mobile-menu-toggle");

        if (body.getAttribute("data-theme") === "dark") {
            body.removeAttribute("data-theme");
            themeIcon.textContent = "🌙";
            localStorage.setItem("theme", "light");
        } else {
            body.setAttribute("data-theme", "dark");
            themeIcon.textContent = "☀️";
            localStorage.setItem("theme", "dark");
        }
        
        if (menuToggle) {
            menuToggle.setAttribute("aria-expanded", "false");
        }
    }

    // High Contrast Mode
    function toggleHighContrast() {
        accessibilitySettings.highContrast = !accessibilitySettings.highContrast;
        saveAccessibilitySettings();
        
        const toggle = document.getElementById('contrastToggle');
        if (accessibilitySettings.highContrast) {
            document.body.setAttribute("data-high-contrast", "true");
            toggle.textContent = 'Kontrast normal';
            toggle.classList.add('active');
        } else {
            document.body.removeAttribute("data-high-contrast");
            toggle.textContent = 'Kontrast i lartë';
            toggle.classList.remove('active');
        }
    }

    // Font Size Control
    function setFontSize(size) {
        accessibilitySettings.fontSize = size;
        saveAccessibilitySettings();
        document.body.setAttribute('data-font-size', size);
        
        // Update button states
        document.querySelectorAll('[data-font-size]').forEach(btn => {
            btn.classList.remove('active');
        });
        document.querySelector(`[data-font-size="${size}"]`).classList.add('active');
        
    }

    // Accessibility Toolbar
    function toggleAccessibilityToolbar() {
        const toolbar = document.getElementById('accessibilityToolbar');
        toolbar.classList.toggle('open');
        
        const isOpen = toolbar.classList.contains('open');
    }

    // Keyboard Shortcuts
    function showKeyboardShortcuts() {
        const shortcuts = `
            Shkurtesat e tastierës:
            Ctrl + H: Kryefaqja
            Ctrl + S: Lëndët
            Ctrl + A: Aksesueshmëria
            Ctrl + R: Lexo seksionin
            Ctrl + T: Ndrysho temën
            Escape: Ndalo leximin
            Tab: Lëviz midis elementeve
            Enter/Space: Aktivizo elementin
            Ctrl + Plus: Zmadho tekstin
            Ctrl + Minus: Zvogëlo tekstin
        `;
        
        speakText(shortcuts);
        alert(shortcuts);
    }

    // Reading Progress
    function updateReadingProgress() {
        const scrollTop = window.pageYOffset;
        const docHeight = document.documentElement.scrollHeight - window.innerHeight;
        const scrollPercent = (scrollTop / docHeight) * 100;
        
        document.querySelector('.reading-progress-bar').style.width = scrollPercent + '%';
    }

    // Mobile Menu Toggle
    function toggleMobileMenu() {
        const navMenu = document.querySelector(".nav-menu");
        const menuToggle = document.querySelector(".mobile-menu-toggle");
        const isExpanded = menuToggle.getAttribute("aria-expanded") === "true";
        
        navMenu.classList.toggle("active");
        menuToggle.setAttribute("aria-expanded", !isExpanded);
        
    }

    // Smooth Scrolling
    function scrollToSubjects() {
        document.getElementById("subjects").scrollIntoView({
            behavior: "smooth",
        });
    }

   

    function showVoiceMessage(message, type = "default") {
        const output = document.getElementById("voiceOutput");
        let className = "voice-message";

        if (type === "error") className += " error";
        if (type === "success") className += " success";
        if (type === "listening") className += " listening";

        output.innerHTML = `
            <div class="${className}">
                <span>${message}</span>
            </div>
        `;
    }

    //!
    function processVoiceCommand(transcript) {
        const commands = {
            biologji: () => showSubjectInfo("biologji"),
            gjeografi: () => showSubjectInfo("gjeografi"),
            letërsi: () => showSubjectInfo("letersi"),
            histori: () => showSubjectInfo("histori"),
            matematikë: () => showSubjectInfo("matematike"),
            matematike: () => showSubjectInfo("matematike"),
            fizikë: () => showSubjectInfo("fizike"),
            fizike: () => showSubjectInfo("fizike"),
            lëndët: () => scrollToSubjects(),
            mësimet: () => scrollToSubjects(),
            "rreth nesh": () => document.getElementById("about").scrollIntoView({ behavior: "smooth" }),
            kryefaqja: () => document.getElementById("home").scrollIntoView({ behavior: "smooth" }),
            lexo: () => readCurrentSection(),
            ndalo: () => stopReading(),
            ndihma: () => showKeyboardShortcuts(),
            "tema e errët": () => {
                if (document.body.getAttribute("data-theme") !== "dark") toggleTheme();
            },
            "tema e ndritshme": () => {
                if (document.body.getAttribute("data-theme") === "dark") toggleTheme();
            },
            "kontrast i lartë": () => {
                if (!accessibilitySettings.highContrast) toggleHighContrast();
            },
            "tekst i madh": () => setFontSize("large"),
            "tekst normal": () => setFontSize("normal"),
            "aktivizo lexuesin": () => {
                if (!accessibilitySettings.screenReader) toggleScreenReader();
            }
        };

        // Check for command matches
        for (const [keyword, action] of Object.entries(commands)) {
            if (transcript.includes(keyword)) {
                action();
                return;
            }
        }

        // If no command found
        showVoiceMessage(
            `🤔 Nuk ju kuptova: "${transcript}". Provoni: "biologji", "gjeografi", "letërsi", "histori", "matematikë", "fizikë", "lëndët", "lexo", "ndalo", "ndihma"`,
            "default"
        );
    }
    //!

    function showSubjectInfo(subject) {
        const subjectNames = {
            biologji: "Biologji - Shkenca e jetës dhe organizmave të gjallë",
            gjeografi: "Gjeografi - Gjeografia fizike dhe njerëzore e botës",
            letersi: "Letërsi - Letërsia shqipe dhe botërore",
            histori: "Histori - Historia e Shqipërisë dhe e botës",
            matematike: "Matematikë - Algjebra, gjeometria dhe analiza",
            fizike: "Fizikë - Ligjet e natyrës dhe fenomenet fizike"
        };

        const message = `📚 ${subjectNames[subject]}`;
        showVoiceMessage(message, "success");
        
        if (accessibilitySettings.screenReader) {
            speakText(subjectNames[subject]);
        }

        // Scroll to subjects and highlight the selected subject
        setTimeout(() => {
            scrollToSubjects();
            const subjectCard = document.querySelector(`[data-subject="${subject}"]`);
            if (subjectCard) {
                subjectCard.style.transform = "scale(1.05)";
                subjectCard.style.borderColor = "var(--primary)";
                subjectCard.focus();
                setTimeout(() => {
                    subjectCard.style.transform = "";
                    subjectCard.style.borderColor = "";
                }, 2000);
            }
        }, 1000);
    }


    // !
    // Tool Functions   
    function openNoteTaker() {
        alert("Shënuesi audio do të hapet së shpejti!");
    }

    function openQuizMode() {
        alert("Kuizet audio do të jenë të disponueshme së shpejti!");
    }

    function openProgressTracker() {
        alert("Ndjekësi i progresit do të hapet së shpejti!");
    }

    function openStudyPlanner() {
        alert("Planifikuesi i studimit do të hapet së shpejti!");
    }

    function openDictionary() {
        alert("Fjalori audio do të hapet së shpejti!");
    }

    function openBookmarks() {
        alert("Bookmark-at do të hapen së shpejti!");
    }

    function openCalculator() {
        alert("Kalkulatori audio do të hapet së shpejti!");
    }

    function openStudyGroups() {
        alert("Grupet e studimit do të hapen së shpejti!");
    }



    function enableNavigationHelp() {
        const helpText = `
            Ndihma e navigimit:
            - Përdorni Tab për të lëvizur midis elementeve
            - Enter ose Space për të aktivizuar butonat
            - Shkurtesat e tastierës janë të disponueshme
            - Komandat zanore mund të përdoren kudo
            - Lexuesi i ekranit mund të aktivizohet nga paneli i aksesueshmërisë
        `;
        speakText(helpText);
    }

    function testAssistiveTech() {
        const testText = "Ky është një test për teknologjitë ndihmëse. Nëse dëgjoni këtë mesazh, sistemi juaj është kompatibël me Jehonë.";
        speakText(testText);
    }
    //!


    function enableKeyboardNavigation() {
        showKeyboardShortcuts();
    }

 

    // Keyboard Event Handlers
    document.addEventListener('keydown', (e) => {
        // Global keyboard shortcuts
        if (e.ctrlKey) {
            switch(e.key.toLowerCase()) {
                case 'h':
                    e.preventDefault();
                    document.getElementById('home').scrollIntoView({ behavior: 'smooth' });
                    break;
                case 's':
                    e.preventDefault();
                    scrollToSubjects();
                    break;
                case 'a':
                    e.preventDefault();
                    document.getElementById('accessibility').scrollIntoView({ behavior: 'smooth' });
                    break;
                case 'r':
                    e.preventDefault();
                    readCurrentSection();
                    break;
                case 't':
                    e.preventDefault();
                    toggleTheme();
                    break;
                case '=':
                case '+':
                    e.preventDefault();
                    if (accessibilitySettings.fontSize === 'normal') {
                        setFontSize('large');
                    } else if (accessibilitySettings.fontSize === 'large') {
                        setFontSize('extra-large');
                    }
                    break;
                case '-':
                    e.preventDefault();
                    if (accessibilitySettings.fontSize === 'extra-large') {
                        setFontSize('large');
                    } else if (accessibilitySettings.fontSize === 'large') {
                        setFontSize('normal');
                    }
                    break;
            }
        }
        
        // Escape key
        if (e.key === 'Escape') {
            stopReading();
            if (isListening) {
                stopListening();
            }
        }
    });

    // Subject Card Interactions
    document.addEventListener("DOMContentLoaded", () => {
        // Load saved preferences
        loadAccessibilitySettings();
        
        const savedTheme = localStorage.getItem("theme");
        const themeIcon = document.querySelector(".theme-icon");

        if (savedTheme === "dark") {
            document.body.setAttribute("data-theme", "dark");
            themeIcon.textContent = "☀️";
        }

        // Add loading animation
        setTimeout(() => {
            document.body.classList.add("loaded");
        }, 100);
        
        // Add keyboard navigation for subject cards
        const subjectCards = document.querySelectorAll(".subject-card");
        subjectCards.forEach(card => {
            card.addEventListener("keydown", (e) => {
                if (e.key === "Enter" || e.key === " ") {
                    e.preventDefault();
                    const subject = card.getAttribute("data-subject");
                    showSubjectInfo(subject);
                }
            });
            
            card.addEventListener("click", () => {
                const subject = card.getAttribute("data-subject");
                showSubjectInfo(subject);
            });
        });

        // Add scroll listener for reading progress
        window.addEventListener('scroll', updateReadingProgress);
    });

    // Navbar Scroll Effect
    window.addEventListener("scroll", () => {
        const navbar = document.querySelector(".navbar");
        if (window.scrollY > 50) {
            navbar.style.background = "rgba(255, 255, 255, 0.95)";
            if (document.body.getAttribute("data-theme") === "dark") {
                navbar.style.background = "rgba(15, 23, 42, 0.95)";
            }
        } else {
            navbar.style.background = "rgba(255, 255, 255, 0.8)";
            if (document.body.getAttribute("data-theme") === "dark") {
                navbar.style.background = "rgba(15, 23, 42, 0.8)";
            }
        }
        
        updateReadingProgress();
    });

    // Smooth scroll for navigation links
    document.querySelectorAll('a[href^="#"]').forEach((anchor) => {
        anchor.addEventListener("click", function (e) {
            e.preventDefault();
            const target = document.querySelector(this.getAttribute("href"));
            if (target) {
                target.scrollIntoView({
                    behavior: "smooth",
                    block: "start",
                });
            }
        });
    });

    // Add intersection observer for animations
    const observerOptions = {
        threshold: 0.1,
        rootMargin: "0px 0px -50px 0px",
    };

    const observer = new IntersectionObserver((entries) => {
        entries.forEach((entry) => {
            if (entry.isIntersecting) {
                entry.target.classList.add("loaded");
            }
        });
    }, observerOptions);

    // Observe elements for animation
    document.addEventListener("DOMContentLoaded", () => {
        const animatedElements = document.querySelectorAll(".feature-card, .subject-card, .about-text, .about-visual, .accessibility-card, .tool-card");
        animatedElements.forEach((el) => {
            el.classList.add("loading");
            observer.observe(el);
        });
    });

    // Add loading animation on page load
    window.addEventListener("load", () => {
        document.body.style.opacity = "0";
        document.body.style.transition = "opacity 0.5s ease";

        setTimeout(() => {
            document.body.style.opacity = "1";
        }, 100);
    });
    
    window.scrollToSubjects = scrollToSubjects;
    window.toggleMobileMenu = toggleMobileMenu;
    window.toggleTheme = toggleTheme;
    window.toggleAccessibilityToolbar = toggleAccessibilityToolbar;
    window.enableKeyboardNavigation = enableKeyboardNavigation;
    window.showKeyboardShortcuts = showKeyboardShortcuts; 
