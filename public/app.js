const chatFlow = document.getElementById("chat-flow");
const userInput = document.getElementById("userInput");
const sendBtn = document.getElementById("sendBtn");
const voiceBtn = document.getElementById("voiceBtn");
const mainSidebar = document.getElementById('mainSidebar');
const settingsOverlay = document.getElementById('settingsOverlay');

// --- 🧭 NAVIGATION ---
document.getElementById('sidebarToggle').onclick = () => mainSidebar.classList.add('open');
document.getElementById('sidebarClose').onclick = () => mainSidebar.classList.remove('open');

document.getElementById('headerNewChat').onclick = () => {
    chatFlow.innerHTML = `<div class="welcome-screen"><div class="big-logo">MÎK</div><h1>MÎK AI Refreshed</h1></div>`;
};

document.getElementById('navSettings').onclick = () => {
    settingsOverlay.style.display = 'flex';
    mainSidebar.classList.remove('open');
};
document.getElementById('closeSettings').onclick = () => settingsOverlay.style.display = 'none';

// --- 🎙️ FIXED VOICE LOGIC ---
const SpeechRecognition = window.webkitSpeechRecognition || window.SpeechRecognition;
if (SpeechRecognition) {
    const recognition = new SpeechRecognition();
    recognition.continuous = false;
    recognition.lang = 'en-US';

    voiceBtn.onclick = () => {
        recognition.start();
        voiceBtn.style.color = "#ff4757"; // Red when listening
    };

    recognition.onresult = (event) => {
        const transcript = event.results[0][0].transcript;
        userInput.value = transcript;
        send(); // Automatically send after speaking
    };

    recognition.onend = () => {
        voiceBtn.style.color = ""; // Back to normal
    };
}

// --- 🖼️ MESSAGE & IMAGE HELPER ---
function addMsg(content, type) {
    const div = document.createElement("div");
    div.className = `msg ${type}`;
    
    // Check if the content is an image link
    if (content.includes("https://") && (content.includes("pollinations.ai") || content.includes(".png"))) {
        div.innerHTML = `
            <div class="ai-ico"></div>
            <div class="txt">
                <img src="${content}" style="width:100%; border-radius:15px; margin-top:10px;" alt="Generated AI Art">
                <br><a href="${content}" download="MIK_AI_Art.png" class="action-link" style="display:inline-block; margin-top:10px; color:var(--accent); text-decoration:none; font-size:12px;">📥 Download Image</a>
            </div>`;
    } else {
        div.innerHTML = type === "ai" ? `<div class="ai-ico"></div><div class="txt">${marked.parse(content)}</div>` : content;
    }
    
    chatFlow.appendChild(div);
    chatFlow.scrollTop = chatFlow.scrollHeight;
}

// --- 💬 SEND LOGIC ---
async function send() {
    let val = userInput.value.trim();
    if (!val) return;
    
    document.querySelector(".welcome-screen")?.remove();
    addMsg(val, "user");
    userInput.value = "";

    try {
        const model = document.getElementById('modelSelect')?.value || 'gemini';
        const res = await fetch("/chat", { 
            method: "POST", 
            headers: { "Content-Type": "application/json" }, 
            body: JSON.stringify({ message: val, model: model }) 
        });
        const data = await res.json();
        addMsg(data.reply, "ai");
    } catch (e) {
        addMsg("Connection lost, Jani. Check your internet!", "ai");
    }
}

sendBtn.onclick = send;
userInput.onkeydown = (e) => e.key === "Enter" && send();

