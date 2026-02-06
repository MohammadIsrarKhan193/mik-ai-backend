const chatFlow = document.getElementById("chat-flow");
const userInput = document.getElementById("userInput");
const sendBtn = document.getElementById("sendBtn");
const voiceBtn = document.getElementById("voiceBtn");
const askMode = document.getElementById('askMode');
const imagineMode = document.getElementById('imagineMode');

// TOGGLE LOGIC
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

function addMsg(text, type) {
    const div = document.createElement("div");
    div.className = `msg ${type}`;
    if (text.startsWith("IMAGE_GEN:")) {
        const url = text.replace("IMAGE_GEN:", "");
        div.innerHTML = `<div class="ai-ico"></div><div class="txt"><img src="${url}" class="gen-img"><br><a href="${url}" target="_blank" style="color:white; font-size:12px;">Download Image</a></div>`;
    } else {
        div.innerHTML = type === "ai" ? `<div class="ai-ico"></div><div class="txt">${marked.parse(text)}</div>` : text;
    }
    chatFlow.appendChild(div);
    chatFlow.scrollTop = chatFlow.scrollHeight;
}

async function send() {
    let val = userInput.value.trim();
    if (!val) return;
    if (imagineMode.classList.contains('active') && !val.toLowerCase().includes('create')) {
        val = "Create " + val;
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
    } catch { addMsg("Error connecting.", "ai"); }
}

sendBtn.onclick = send;
userInput.onkeydown = (e) => e.key === "Enter" && send();

// VOICE BRAIN
const SpeechRecognition = window.webkitSpeechRecognition || window.SpeechRecognition;
if (SpeechRecognition) {
    const rec = new SpeechRecognition();
    voiceBtn.onclick = () => { rec.start(); voiceBtn.style.color = "red"; };
    rec.onresult = (e) => { userInput.value = e.results[0][0].transcript; send(); };
    rec.onend = () => { voiceBtn.style.color = ""; };
}
