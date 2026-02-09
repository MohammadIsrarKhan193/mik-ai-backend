const chatFlow = document.getElementById("chat-flow");
const userInput = document.getElementById("userInput");
const sendBtn = document.getElementById("sendBtn");
const voiceBtn = document.getElementById("voiceBtn");
const askMode = document.getElementById('askMode');
const imagineMode = document.getElementById('imagineMode');
const mainSidebar = document.getElementById('mainSidebar');

// --- 🚀 SIDEBAR ---
document.getElementById('sidebarToggle').onclick = () => mainSidebar.classList.add('open');
document.getElementById('sidebarClose').onclick = () => mainSidebar.classList.remove('open');

document.getElementById('newChatBtn').onclick = () => {
    if(confirm("Start a fresh chat, Jani?")) {
        chatFlow.innerHTML = `<div class="welcome-screen"><div class="big-logo">MÎK</div><h1>Welcome, Israr Jani</h1><p>MÎK AI is ready.</p></div>`;
        mainSidebar.classList.remove('open');
        window.speechSynthesis.cancel();
    }
};

// --- ✍️ TYPING ANIMATION LOGIC ---
function showTyping() {
    const div = document.createElement("div");
    div.id = "typing-indicator";
    div.className = "msg ai";
    div.innerHTML = `<div class="ai-ico"></div><div class="typing"><span></span><span></span><span></span></div>`;
    chatFlow.appendChild(div);
    chatFlow.scrollTop = chatFlow.scrollHeight;
}

function removeTyping() {
    const indicator = document.getElementById("typing-indicator");
    if (indicator) indicator.remove();
}

// --- 🔊 VOICE ---
function speak(text) {
    const cleanText = text.replace(/[#*`_]/g, "");
    const utterance = new SpeechSynthesisUtterance(cleanText);
    window.speechSynthesis.speak(utterance);
}

// --- 📤 SHARE ---
async function shareImg(url) {
    try {
        const res = await fetch(url);
        const blob = await res.json();
        const file = new File([blob], 'MIK-Art.png', { type: blob.type });
        if (navigator.share) await navigator.share({ files: [file], title: 'MÎK AI Art' });
    } catch (e) { alert("Sharing not supported on this browser."); }
}

function addMsg(text, type) {
    const div = document.createElement("div");
    div.className = `msg ${type}`;
    if (text.startsWith("IMAGE_GEN:")) {
        const url = text.replace("IMAGE_GEN:", "");
        div.innerHTML = `<div class="ai-ico"></div><div class="txt"><img src="${url}" class="gen-img" style="width:100%; border-radius:12px;"><div class="image-actions"><a href="${url}" download class="action-link">📥 Download</a><button onclick="shareImg('${url}')" class="action-link">📤 Share</button></div></div>`;
        speak("Here is your creation.");
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
    
    showTyping(); // Start animation
    
    try {
        const res = await fetch("/chat", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ message: val, userId: "Israr" }) });
        const data = await res.json();
        removeTyping(); // Stop animation
        addMsg(data.reply, "ai");
    } catch { 
        removeTyping();
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

askMode.onclick = () => { askMode.classList.add('active'); imagineMode.classList.remove('active'); userInput.placeholder = "Message MÎK AI..."; };
imagineMode.onclick = () => { imagineMode.classList.add('active'); askMode.classList.remove('active'); userInput.placeholder = "Describe what to Imagine..."; };

