    function uliks(){
        let output = document.getElementById('output')
        let input = document.getElementById('input')

        var recognition = new webkitSpeechRecognition();
        recognition.lang = "sq-AL";
        recognition.start();

        recognition.onresult = function(event) {
        let transcript = event.results[0][0].transcript;
        if(transcript.includes("përshë") || transcript.includes("uliks")){
        playSound(ulikss);
        }
        else if (transcript.includes("bio") || transcript.includes("lo") || transcript.includes("biologji")) {
        window.location = "biologji.html";
        }
        else if(transcript.includes("gjeo") || transcript.includes("grafi") || transcript.includes("gjeografi")){
            window.location = "gjeografi12.html"
        }
        else {
        output.innerHTML = "Nuk ju kuptoj :(";
        }
        };

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

    const ulikss = new Audio('audio/PERSHENDETJE ME CAR MUND TJU NDIHMOJ.mp3');
    function playSound(audio){
    audio.play();
    }

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
    