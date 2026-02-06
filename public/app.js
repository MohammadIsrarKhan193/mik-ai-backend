const chatFlow = document.getElementById("chat-flow");
const userInput = document.getElementById("userInput");
const sendBtn = document.getElementById("sendBtn");
const voiceBtn = document.getElementById("voiceBtn");

// 💬 CHAT LOGIC
function addMsg(text, type) {
    const div = document.createElement("div");
    div.className = `msg ${type}`;
    div.innerHTML = type === "ai" 
        ? `<div class="ai-ico"></div><div class="txt">${marked.parse(text)}</div>` 
        : text;
    chatFlow.appendChild(div);
    chatFlow.scrollTop = chatFlow.scrollHeight;
}

async function send() {
    const val = userInput.value.trim();
    if (!val) return;
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
        addMsg("MÎK AI lost connection. Check your Render logs, Jani!", "ai"); 
    }
}

sendBtn.onclick = send;
userInput.onkeydown = (e) => e.key === "Enter" && send();

// 🎙️ VOICE BRAIN
const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;

if (SpeechRecognition) {
    const recognition = new SpeechRecognition();
    recognition.lang = 'en-US';

    voiceBtn.addEventListener('click', () => {
        recognition.start();
        voiceBtn.style.color = "#ff4757"; // Glowing red when listening
        userInput.placeholder = "MÎK AI is listening...";
    });

    recognition.onresult = (event) => {
        const transcript = event.results[0][0].transcript;
        userInput.value = transcript;
        voiceBtn.style.color = "";
        userInput.placeholder = "Start typing...";
        send(); // Automatically send after talking
    };

    recognition.onerror = () => {
        voiceBtn.style.color = "";
        userInput.placeholder = "Voice Error. Try again!";
    };
} else {
    voiceBtn.style.opacity = "0.3"; // Dim if not supported
}
