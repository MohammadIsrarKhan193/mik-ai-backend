const chatFlow = document.getElementById("chat-flow");
const userInput = document.getElementById("userInput");
const sendBtn = document.getElementById("sendBtn");
const voiceBtn = document.getElementById("voiceBtn");

function addMsg(text, type) {
    const div = document.createElement("div");
    div.className = `msg ${type}`;
    
    // Check if the reply is an image
    if (text.startsWith("IMAGE_GEN:")) {
        const url = text.replace("IMAGE_GEN:", "");
        div.innerHTML = `<div class="ai-ico"></div>
                         <div class="txt">
                            <p>Here is your creation, Jani:</p>
                            <img src="${url}" class="gen-img" alt="MÎK AI Art">
                            <br><a href="${url}" download="MIK_AI_Art.png" class="dl-btn">Download Image</a>
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
        addMsg("Error connecting to MÎK AI.", "ai"); 
    }
}

sendBtn.onclick = send;
userInput.onkeydown = (e) => e.key === "Enter" && send();

// 🎙️ VOICE BRAIN
const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
if (SpeechRecognition) {
    const recognition = new SpeechRecognition();
    voiceBtn.addEventListener('click', () => {
        recognition.start();
        voiceBtn.style.color = "#ff4757";
    });
    recognition.onresult = (event) => {
        userInput.value = event.results[0][0].transcript;
        voiceBtn.style.color = "";
        send();
    };
}
