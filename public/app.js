// --- SELECTORS ---
const chatFlow = document.getElementById("chat-flow");
const userInput = document.getElementById("userInput");
const sendBtn = document.getElementById("sendBtn");
const voiceBtn = document.getElementById("voiceBtn");
const askMode = document.getElementById('askMode');
const imagineMode = document.getElementById('imagineMode');
const galleryGrid = document.getElementById('galleryGrid');
const themeToggle = document.getElementById('themeToggle');
const newChatBtn = document.getElementById('newChatBtn');

// --- 🔊 VOICE REPLY (TEXT-TO-SPEECH) ---
let isVoiceEnabled = true; // You can turn this off in settings later if you want

function speak(text) {
    if (!isVoiceEnabled) return;
    
    // Clean text for cleaner speech (remove markdown)
    const cleanText = text.replace(/[#*`_]/g, "");
    const utterance = new SpeechSynthesisUtterance(cleanText);
    utterance.lang = 'en-US';
    utterance.rate = 1.0; 
    utterance.pitch = 1.0;
    window.speechSynthesis.speak(utterance);
}

// --- 🌓 DARK/LIGHT MODE ---
themeToggle.onchange = () => {
    document.body.classList.toggle('light-theme');
    localStorage.setItem('mik_theme', document.body.classList.contains('light-theme') ? 'light' : 'dark');
};

if (localStorage.getItem('mik_theme') === 'light') {
    document.body.classList.add('light-theme');
    themeToggle.checked = true;
}

// --- 🆕 NEW CHAT ---
newChatBtn.onclick = () => {
    if(confirm("Jani, clear this chat and start fresh?")) {
        window.speechSynthesis.cancel(); // Stop talking if starting new chat
        chatFlow.innerHTML = `
            <div class="welcome-screen">
                <h1>Welcome, Israr Jani</h1>
                <p>MÎK AI is ready. What are we building today?</p>
            </div>`;
    }
};

// --- 🔘 MODE SWITCHER ---
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

// --- 🏛️ SIDEBAR LOGIC (Fixes the "Ugly" Overlap) ---
function closeAllPanels() {
    document.querySelectorAll('.side-panel').forEach(p => p.classList.remove('open'));
}

document.getElementById('historyToggle').onclick = () => { closeAllPanels(); document.getElementById('historySidebar').classList.toggle('open'); };
document.getElementById('galleryToggle').onclick = () => { closeAllPanels(); document.getElementById('gallerySidebar').classList.toggle('open'); };
document.getElementById('settingsToggle').onclick = () => { closeAllPanels(); document.getElementById('settingsSidebar').classList.toggle('open'); };
document.getElementById('openGallery').onclick = () => { closeAllPanels(); document.getElementById('gallerySidebar').classList.add('open'); };

document.querySelectorAll('.close-panel').forEach(btn => {
    btn.onclick = closeAllPanels;
});

// --- 📤 SHARE FUNCTION ---
async function shareImg(url) {
    try {
        const response = await fetch(url);
        const blob = await response.blob();
        const file = new File([blob], 'MIK-AI-Art.png', { type: blob.type });
        
        if (navigator.share) {
            await navigator.share({
                files: [file],
                title: 'MÎK AI Creation',
                text: 'Jani, check out this art created by MÎK AI! 🎨'
            });
        } else {
            alert("Share not supported. Copy the image link instead!");
        }
    } catch (err) {
        console.error("Share failed", err);
    }
}

// --- 💬 MESSAGE LOGIC ---
function addMsg(text, type) {
    const div = document.createElement("div");
    div.className = `msg ${type}`;
    
    if (text.startsWith("IMAGE_GEN:")) {
        const url = text.replace("IMAGE_GEN:", "");
        div.innerHTML = `
            <div class="ai-ico"></div>
            <div class="txt">
                <p>Jani, I imagined this for you:</p>
                <img src="${url}" class="gen-img">
                <div class="image-actions">
                    <a href="${url}" download class="action-link">📥 Download</a>
                    <button onclick="shareImg('${url}')" class="action-link share-btn">📤 Share</button>
                </div>
            </div>`;
        const gImg = document.createElement('img'); gImg.src = url;
        galleryGrid.prepend(gImg);
        speak("Here is your creation, Jani.");
    } else {
        div.innerHTML = type === "ai" 
            ? `<div class="ai-ico"></div><div class="txt">${marked.parse(text)}</div>` 
            : text;
        
        if (type === "ai") speak(text);
    }
    
    chatFlow.appendChild(div);
    chatFlow.scrollTop = chatFlow.scrollHeight;
}

// --- 🚀 SEND LOGIC ---
async function send() {
    let val = userInput.value.trim();
    if (!val) return;

    if (imagineMode.classList.contains('active') && !val.toLowerCase().includes('create')) {
        val = "Create " + val;
    }

    document.querySelector(".welcome-screen")?.remove();
    addMsg(val, "user");
    userInput.value = "";
    window.speechSynthesis.cancel(); // Stop talking if user sends a new message

    try {
        const res = await fetch("/chat", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ message: val, userId: "Israr" })
        });
        const data = await res.json();
        addMsg(data.reply, "ai");
    } catch { 
        addMsg("Connection error, Jani. Check your Render logs.", "ai"); 
    }
}

sendBtn.onclick = send;
userInput.onkeydown = (e) => e.key === "Enter" && send();

// --- 🎙️ VOICE INPUT ---
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
    recognition.onend = () => { voiceBtn.style.color = ""; };
}
