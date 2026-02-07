const chatFlow = document.getElementById("chat-flow");
const userInput = document.getElementById("userInput");
const sendBtn = document.getElementById("sendBtn");
const voiceBtn = document.getElementById("voiceBtn");
const askMode = document.getElementById('askMode');
const imagineMode = document.getElementById('imagineMode');
const mainSidebar = document.getElementById('mainSidebar');

// --- 🚀 SIDEBAR CONTROLS ---
document.getElementById('sidebarToggle').onclick = () => mainSidebar.classList.add('open');
document.getElementById('sidebarClose').onclick = () => mainSidebar.classList.remove('open');

// NEW CHAT
document.getElementById('newChatBtn').onclick = () => {
    if(confirm("Start a fresh chat, Jani?")) {
        chatFlow.innerHTML = `
            <div class="welcome-screen">
                <div class="big-logo">MÎK</div>
                <h1>Welcome, Israr Jani</h1>
                <p>MÎK AI is ready. Let's create something great.</p>
            </div>`;
        mainSidebar.classList.remove('open');
        window.speechSynthesis.cancel();
    }
};

// --- 🔘 ASK/IMAGINE TOGGLE ---
askMode.onclick = () => { 
    askMode.classList.add('active'); 
    imagineMode.classList.remove('active'); 
    userInput.placeholder = "Message MÎK AI..."; 
};
imagineMode.onclick = () => { 
    imagineMode.classList.add('active'); 
    askMode.classList.remove('active'); 
    userInput.placeholder = "Describe what to Imagine..."; 
};

// --- 🔊 VOICE REPLY ---
function speak(text) {
    const cleanText = text.replace(/[#*`_]/g, "");
    const utterance = new SpeechSynthesisUtterance(cleanText);
    window.speechSynthesis.speak(utterance);
}

// --- 💬 MESSAGE LOGIC ---
function addMsg(text, type) {
    const div = document.createElement("div");
    div.className = `msg ${type}`;
    if (text.startsWith("IMAGE_GEN:")) {
        const url = text.replace("IMAGE_GEN:", "");
        div.innerHTML = `<div class="ai-ico"></div><div class="txt"><img src="${url}" class="gen-img" style="width:100%; border-radius:12px;"></div>`;
        speak("Here is your image, Jani.");
    } else {
        div.innerHTML = type === "ai" ? `<div class="ai-ico"></div><div class="txt">${marked.parse(text)}</div>` : text;
        if (type === "ai") speak(text);
    }
    chatFlow.appendChild(div);
    chatFlow.scrollTop = chatFlow.scrollHeight;
}

async function send() {
    let val = userInput.value.trim();
    if (!val) return;
    if (imagineMode.classList.contains('active') && !val.toLowerCase().includes('create')) val = "Create " + val;
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
        addMsg("Connection error, Jani.", "ai"); 
    }
}

sendBtn.onclick = send;
userInput.onkeydown = (e) => e.key === "Enter" && send();

// --- 🎙️ VOICE INPUT ---
const SpeechRecognition = window.webkitSpeechRecognition || window.SpeechRecognition;
if (SpeechRecognition) {
    const rec = new SpeechRecognition();
    voiceBtn.onclick = () => { rec.start(); voiceBtn.style.color = "red"; };
    rec.onresult = (e) => { userInput.value = e.results[0][0].transcript; send(); };
    rec.onend = () => { voiceBtn.style.color = ""; };
}
