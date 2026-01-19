const chat = document.getElementById("chat");
const input = document.getElementById("msgInput");
const sendBtn = document.getElementById("sendBtn");
const voiceBtn = document.getElementById("voiceBtn");
const sidebarBtn = document.getElementById("sidebarBtn");
const sidebar = document.getElementById("sidebar");
const newChatBtn = document.getElementById("newChatBtn");

// --- v11.0 BRAIN LOGIC ---
let myId = localStorage.getItem("mik_user_id");
if (!myId) {
    myId = prompt("Enter your Profile Name:") || "Guest";
    localStorage.setItem("mik_user_id", myId);
}
document.getElementById("welcomeScreen").querySelector('h1').innerText = `Welcome, ${myId}`;

// --- VOICE & SIDEBAR ---
let voiceEnabled = true;
const synth = window.speechSynthesis;

voiceBtn.onclick = () => {
    voiceEnabled = !voiceEnabled;
    voiceBtn.textContent = voiceEnabled ? "🎤" : "🔇";
};

sidebarBtn.onclick = () => sidebar.classList.toggle("visible");

newChatBtn.onclick = () => {
    chat.innerHTML = "";
    sidebar.classList.remove("visible");
    addMsg("New chat started! How can I help?", "ai");
};

function speak(text) {
    if (!voiceEnabled || !synth) return;
    const utter = new SpeechSynthesisUtterance(text);
    synth.cancel();
    synth.speak(utter);
}

function addMsg(text, type) {
    const div = document.createElement("div");
    div.className = `msg ${type}`;
    div.innerText = text;
    chat.appendChild(div);
    chatContainer.scrollTop = chatContainer.scrollHeight;
    if (type === "ai") speak(text);
}

// --- UPDATED SEND (v15.0 Style + v11.0 Logic) ---
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
            body: JSON.stringify({ 
                message: text,
                userId: myId // Don't forget this, Jani!
            })
        });
        const data = await res.json();
        addMsg(data.reply || "Server is tired.", "ai");
    } catch {
        addMsg("Connection error 😢", "ai");
    }
}

sendBtn.onclick = send;
input.addEventListener("keydown", (e) => { if (e.key === "Enter") send(); });
