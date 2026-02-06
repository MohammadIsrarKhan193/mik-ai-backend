const chatFlow = document.getElementById("chat-flow");
const userInput = document.getElementById("userInput");
const sendBtn = document.getElementById("sendBtn");
const voiceBtn = document.getElementById("voiceBtn");

function addMsg(text, type) {
    const div = document.createElement("div");
    div.className = `msg ${type}`;
    
    if (text.startsWith("IMAGE_GEN:")) {
        const url = text.replace("IMAGE_GEN:", "");
        div.innerHTML = `<div class="ai-ico"></div>
                         <div class="txt">
                            <p>Here is your creation, Jani:</p>
                            <img src="${url}" class="gen-img" onerror="this.src='https://via.placeholder.com/400?text=Image+Loading...'" alt="MÎK AI Art">
                            <br><a href="${url}" target="_blank" class="dl-btn">Open Full Image</a>
                         </div>`;
    } else {
        div.innerHTML = type === "ai" 
            ? `<div class="ai-ico"></div><div class="txt">${marked.parse(text)}</div>` 
            : text;
    }
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
        addMsg("MÎK AI is having trouble. Check your Render logs!", "ai"); 
    }
}

sendBtn.onclick = send;
userInput.onkeydown = (e) => e.key === "Enter" && send();

// 🎙️ IMPROVED VOICE BRAIN
const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
if (SpeechRecognition) {
    const recognition = new SpeechRecognition();
    recognition.continuous = false;
    recognition.interimResults = false;

    voiceBtn.addEventListener('click', () => {
        try {
            recognition.start();
            voiceBtn.style.color = "#ff4757";
            userInput.placeholder = "Listening...";
        } catch (e) {
            recognition.stop();
        }
    });

    recognition.onresult = (event) => {
        const result = event.results[0][0].transcript;
        userInput.value = result;
        voiceBtn.style.color = "";
        userInput.placeholder = "Start typing...";
        send(); // This sends the spoken text automatically
    };

    recognition.onend = () => {
        voiceBtn.style.color = "";
    };
}
