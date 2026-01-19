const chat = document.getElementById("chat");
const input = document.getElementById("msgInput");
const sendBtn = document.getElementById("sendBtn");
const voiceBtn = document.getElementById("voiceBtn");
const sidebarBtn = document.getElementById("sidebarBtn");
const sidebar = document.getElementById("sidebar");
const chatList = document.getElementById("chatList");
const newChatBtn = document.getElementById("newChatBtn");

let voiceEnabled = true;
const synth = window.speechSynthesis;

// 🎤 Toggle Voice
voiceBtn.onclick = () => {
    voiceEnabled = !voiceEnabled;
    voiceBtn.textContent = voiceEnabled ? "🎤" : "🔇";
};

// ☰ Toggle Sidebar
sidebarBtn.onclick = () => {
    sidebar.classList.toggle("visible");
};

// ➕ New Chat
newChatBtn.onclick = () => {
    chat.innerHTML = "";
    sidebar.classList.remove("visible");
    addMsg("New chat started! Ask me anything 💬", "ai");
};

// 🔊 Speak AI
function speak(text) {
    if (!voiceEnabled || !synth) return;
    const utter = new SpeechSynthesisUtterance(text);
    utter.rate = 1;
    utter.pitch = 1;
    utter.lang = "en-US";
    synth.cancel();
    synth.speak(utter);
}

// 💬 Add Chat Bubble
function addMsg(text, type) {
    const div = document.createElement("div");
    div.className = `msg ${type}`;
    div.innerText = text;
    chat.appendChild(div);
    chat.scrollTop = chat.scrollHeight;
    if (type === "ai") speak(text);
}

// 🚀 Send Message
async function send() {
    const text = input.value.trim();
    if (!text) return;

    document.getElementById("welcomeScreen")?.remove();
    addMsg(text, "user");
    input.value = "";

    try {
        const res = await fetch("/chat", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ message: text })
        });
        const data = await res.json();
        addMsg(data.reply || "No response 😢", "ai");
    } catch {
        addMsg("Connection error 😢", "ai");
    }
}

sendBtn.onclick = send;
input.addEventListener("keydown", (e) => { if (e.key === "Enter") send(); });
