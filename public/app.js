const chatFlow = document.getElementById("chat-flow");
const userInput = document.getElementById("userInput");
const sendBtn = document.getElementById("sendBtn");
const voiceBtn = document.getElementById("voiceBtn");
const askMode = document.getElementById('askMode');
const imagineMode = document.getElementById('imagineMode');
const galleryGrid = document.getElementById('galleryGrid');

// 🔘 BUTTONS LOGIC
askMode.onclick = () => {
    askMode.classList.add('active');
    imagineMode.classList.remove('active');
    userInput.placeholder = "Ask MÎK AI anything...";
};

imagineMode.onclick = () => {
    imagineMode.classList.add('active');
    askMode.classList.remove('active');
    userInput.placeholder = "Describe what you want to Imagine...";
};

// 🏛️ SIDE PANEL TOGGLES
document.getElementById('historyToggle').onclick = () => document.getElementById('historySidebar').classList.toggle('open');
document.getElementById('galleryToggle').onclick = () => document.getElementById('gallerySidebar').classList.toggle('open');

function addMsg(text, type) {
    const div = document.createElement("div");
    div.className = `msg ${type}`;
    if (text.startsWith("IMAGE_GEN:")) {
        const url = text.replace("IMAGE_GEN:", "");
        div.innerHTML = `<div class="ai-ico"></div><div class="txt"><img src="${url}" class="gen-img"></div>`;
        // Add to Gallery!
        const gImg = document.createElement('img');
        gImg.src = url;
        galleryGrid.prepend(gImg);
    } else {
        div.innerHTML = type === "ai" ? `<div class="ai-ico"></div><div class="txt">${marked.parse(text)}</div>` : text;
    }
    chatFlow.appendChild(div);
    chatFlow.scrollTop = chatFlow.scrollHeight;
}

async function send() {
    let val = userInput.value.trim();
    if (!val) return;
    
    // Auto-trigger Imagine mode if the button is active
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
    } catch { addMsg("Connection error.", "ai"); }
}

sendBtn.onclick = send;
userInput.onkeydown = (e) => e.key === "Enter" && send();

// 🎙️ VOICE
const SpeechRecognition = window.webkitSpeechRecognition || window.SpeechRecognition;
if (SpeechRecognition) {
    const rec = new SpeechRecognition();
    voiceBtn.onclick = () => { rec.start(); voiceBtn.style.color = "red"; };
    rec.onresult = (e) => { userInput.value = e.results[0][0].transcript; send(); };
    rec.onend = () => { voiceBtn.style.color = ""; };
}
