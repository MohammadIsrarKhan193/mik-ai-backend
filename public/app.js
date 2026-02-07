const chatFlow = document.getElementById("chat-flow");
const userInput = document.getElementById("userInput");
const sendBtn = document.getElementById("sendBtn");
const voiceBtn = document.getElementById("voiceBtn");
const askMode = document.getElementById('askMode');
const imagineMode = document.getElementById('imagineMode');
const galleryGrid = document.getElementById('galleryGrid');
const themeToggle = document.getElementById('themeToggle');
const newChatBtn = document.getElementById('newChatBtn');

// 🌓 DARK/LIGHT MODE LOGIC
themeToggle.onchange = () => {
    document.body.classList.toggle('light-theme');
    localStorage.setItem('mik_theme', document.body.classList.contains('light-theme') ? 'light' : 'dark');
};

// Load saved theme on start
if (localStorage.getItem('mik_theme') === 'light') {
    document.body.classList.add('light-theme');
    themeToggle.checked = true;
}

// 🆕 NEW CHAT LOGIC
newChatBtn.onclick = () => {
    if(confirm("Jani, do you want to start a fresh chat?")) {
        chatFlow.innerHTML = `
            <div class="welcome-screen">
                <h1>Welcome, Israr Jani</h1>
                <p>MÎK AI is ready. What are we building today?</p>
            </div>`;
    }
};

// 🔘 MODE SWITCHER
askMode.onclick = () => {
    askMode.classList.add('active');
    imagineMode.classList.remove('active');
    userInput.placeholder = "Ask MÎK AI anything...";
};

imagineMode.onclick = () => {
    imagineMode.classList.add('active');
    askMode.classList.remove('active');
    userInput.placeholder = "Describe what to Imagine...";
};

// 🏛️ SIDEBAR TOGGLES
document.getElementById('historyToggle').onclick = () => document.getElementById('historySidebar').classList.toggle('open');
document.getElementById('galleryToggle').onclick = () => document.getElementById('gallerySidebar').classList.toggle('open');
document.getElementById('settingsToggle').onclick = () => document.getElementById('settingsSidebar').classList.toggle('open');

// Close panels when 'X' is clicked
document.querySelectorAll('.close-panel').forEach(btn => {
    btn.onclick = () => {
        document.querySelectorAll('.side-panel').forEach(p => p.classList.remove('open'));
    }
});

function addMsg(text, type) {
    const div = document.createElement("div");
    div.className = `msg ${type}`;
    
    if (text.startsWith("IMAGE_GEN:")) {
        const url = text.replace("IMAGE_GEN:", "");
        div.innerHTML = `
            <div class="ai-ico"></div>
            <div class="txt">
                <p>Here is your creation, Jani:</p>
                <img src="${url}" class="gen-img" alt="AI Art">
                <br><a href="${url}" target="_blank" class="dl-btn">Open Full Quality</a>
            </div>`;
        
        // Add to Gallery!
        const gImg = document.createElement('img');
        gImg.src = url;
        galleryGrid.prepend(gImg);
    } else {
        div.innerHTML = type === "ai" 
            ? `<div class="ai-ico"></div><div class="txt">${marked.parse(text)}</div>` 
            : text;
    }
    
    chatFlow.appendChild(div);
    chatFlow.scrollTop = chatFlow.scrollHeight;
}

async function send() {
    let val = userInput.value.trim();
    if (!val) return;

    // Auto-Imagine logic
    if (imagineMode.classList.contains('active') && !val.toLowerCase().includes('create')) {
        val = "Create a " + val;
    }

    document.querySelector(".welcome-screen")?.remove();
    addMsg(val, "user");
    userInput.value = "";

    try {
        const res = await fetch("/chat", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ message: val, userId: "Israr" })
        });
        const data = await res.json();
        addMsg(data.reply, "ai");
    } catch { 
        addMsg("MÎK AI connection error. Check Render!", "ai"); 
    }
}

sendBtn.onclick = send;
userInput.onkeydown = (e) => e.key === "Enter" && send();

// 🎙️ VOICE BRAIN
const SpeechRecognition = window.webkitSpeechRecognition || window.SpeechRecognition;
if (SpeechRecognition) {
    const recognition = new SpeechRecognition();
    voiceBtn.onclick = () => { 
        recognition.start(); 
        voiceBtn.style.color = "red"; 
    };
    recognition.onresult = (e) => { 
        userInput.value = e.results[0][0].transcript; 
        send(); 
    };
    recognition.onend = () => { 
        voiceBtn.style.color = ""; 
    };
}
