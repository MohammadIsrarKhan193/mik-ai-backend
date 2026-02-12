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

// --- 🎙️ VOICE LOGIC ---
const SpeechRecognition = window.webkitSpeechRecognition || window.SpeechRecognition;
if (SpeechRecognition) {
    const recognition = new SpeechRecognition();
    recognition.continuous = false;
    recognition.lang = 'en-US';

    voiceBtn.onclick = () => {
        recognition.start();
        voiceBtn.style.color = "#ff4757";
    };

    recognition.onresult = (event) => {
        userInput.value = event.results[0][0].transcript;
        send();
    };

    recognition.onend = () => { voiceBtn.style.color = ""; };
}

// --- 🖼️ SMART MESSAGE & IMAGE HELPER ---
function addMsg(content, type) {
    const div = document.createElement("div");
    div.className = `msg ${type}`;
    
    const imageUrlPattern = /(https?:\/\/.*\.(?:png|jpg|jpeg|gif|webp))/i;
    const isImage = imageUrlPattern.test(content);

    if (type === "ai") {
        let finalContent = marked.parse(content);
        
        if (isImage || content.includes("pollinations.ai")) {
            const url = isImage ? content.match(imageUrlPattern)[0] : content.trim();
            finalContent = `
                <div class="ai-image-wrapper">
                    <img src="${url}" alt="MÎK AI Art" class="generated-img">
                    <a href="${url}" target="_blank" class="dl-btn"><i class="fas fa-download"></i> Save to Gallery</a>
                </div>`;
        }
        div.innerHTML = `<div class="ai-ico"></div><div class="txt">${finalContent}</div>`;
    } else {
        div.textContent = content;
    }
    
    chatFlow.appendChild(div);
    chatFlow.scrollTop = chatFlow.scrollHeight;
}

// --- 💬 SEND LOGIC (With Earn Money Logic) ---
let messageCount = 0;
async function send() {
    let val = userInput.value.trim();
    if (!val) return;

    // 💰 Earnings Logic: Every 5 messages, show an Ad alert
    messageCount++;
    if (messageCount > 5) {
        alert("Jani, watch a quick ad to keep chatting for free or Go Premium! 🚀");
        messageCount = 0; 
    }
    
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
        addMsg("Connection lost, Jani. Check internet!", "ai");
    }
}

sendBtn.onclick = send;
userInput.onkeydown = (e) => e.key === "Enter" && send();
