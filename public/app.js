const chatFlow = document.getElementById("chat-flow");
const userInput = document.getElementById("userInput");
const sendBtn = document.getElementById("sendBtn");

// 🧠 v11.0 Profile Memory
let myId = localStorage.getItem("mik_user_id");
if (!myId) {
    myId = prompt("Enter your Brand Profile ID:") || "Mohammad Israr";
    localStorage.setItem("mik_user_id", myId);
}

// 🔊 Voice Settings
let voiceEnabled = true;
const synth = window.speechSynthesis;

function speak(text) {
    if (!voiceEnabled || !synth) return;
    const cleanText = text.replace(/<[^>]*>?/gm, ''); // Remove HTML tags
    const utter = new SpeechSynthesisUtterance(cleanText);
    synth.cancel();
    synth.speak(utter);
}

// 💬 Add Brand Message Bubbles
function addMsg(text, type) {
    const div = document.createElement("div");
    div.className = `message-bubble ${type}`;
    
    if (type === "ai") {
        // Formats code like your design
        div.innerHTML = `<div class="ai-avatar">✨</div><div class="content">${marked.parse(text)}</div>`;
        speak(text);
    } else {
        div.innerHTML = `<div class="content">${text}</div>`;
    }

    chatFlow.appendChild(div);
    chatFlow.scrollTop = chatFlow.scrollHeight;
}

// 🚀 Send Message to Render Backend
async function send() {
    const message = userInput.value.trim();
    if (!message) return;

    // Clear intro on first message
    const intro = document.querySelector(".ai-intro");
    if (intro) intro.remove();

    addMsg(message, "user");
    userInput.value = "";

    try {
        const res = await fetch("/chat", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ message, userId: myId })
        });
        const data = await res.json();
        addMsg(data.reply || "MÎK AI is updating...", "ai");
    } catch (err) {
        addMsg("Connection issue. Please check your Render server!", "ai");
    }
}

function clearAll() {
    if(confirm("Jani, clear all memory?")) {
        chatFlow.innerHTML = "";
        localStorage.removeItem("mik_user_id");
        location.reload();
    }
}

sendBtn.onclick = send;
userInput.onkeydown = (e) => { if(e.key === "Enter") send(); };
