const chatFlow = document.getElementById("chat-flow");
const userInput = document.getElementById("userInput");
const sendBtn = document.getElementById("sendBtn");

// 🧠 Get User Identity
let myId = localStorage.getItem("mik_user_id") || "Mohammad Israr";

// 🔊 Voice Setup
const synth = window.speechSynthesis;
function speak(text) {
    if (!synth) return;
    synth.cancel();
    const utter = new SpeechSynthesisUtterance(text.replace(/[*#`]/g, ''));
    synth.speak(utter);
}

// 💬 Add Brand Bubbles
function addMsg(text, type) {
    const div = document.createElement("div");
    div.className = `message-bubble ${type}`;
    
    if (type === "ai") {
        // Uses marked to render code blocks like your design
        const formattedText = typeof marked !== 'undefined' ? marked.parse(text) : text;
        div.innerHTML = `<div class="ai-avatar">✨</div><div class="content">${formattedText}</div>`;
        speak(text);
    } else {
        div.innerHTML = `<div class="content">${text}</div>`;
    }

    chatFlow.appendChild(div);
    chatFlow.scrollTop = chatFlow.scrollHeight;
}

// 🚀 The Logic to get Real Answers
async function send() {
    const msg = userInput.value.trim();
    if (!msg) return;

    // Remove the "Hello" intro on first message
    const intro = document.querySelector(".ai-intro");
    if (intro) intro.remove();

    addMsg(msg, "user");
    userInput.value = "";

    // Show a small loading indicator
    const loading = document.createElement("div");
    loading.className = "message-bubble ai loading";
    loading.innerHTML = `<div class="ai-avatar">✨</div><div class="content">MÎK AI is thinking...</div>`;
    chatFlow.appendChild(loading);

    try {
        const response = await fetch("/chat", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ 
                message: msg, 
                userId: myId 
            })
        });

        const data = await response.json();
        loading.remove();

        if (data.reply) {
            addMsg(data.reply, "ai");
        } else {
            addMsg("I'm having trouble connecting to my brain. Check Render logs, Jani!", "ai");
        }
    } catch (err) {
        loading.remove();
        addMsg("Connection error. Is the Render server awake?", "ai");
    }
}

sendBtn.onclick = send;
userInput.onkeydown = (e) => { if (e.key === "Enter") send(); };
