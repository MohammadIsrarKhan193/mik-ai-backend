const chatFlow = document.getElementById("chat-flow");
const userInput = document.getElementById("userInput");
const sendBtn = document.getElementById("sendBtn");

let myId = localStorage.getItem("mik_user_id") || "Mohammad Israr";

function addMsg(text, type) {
    const div = document.createElement("div");
    div.className = `message-bubble ${type}`;
    
    if (type === "ai") {
        const htmlContent = marked.parse(text);
        div.innerHTML = `<div class="ai-avatar">✨</div><div class="content">${htmlContent}</div>`;
    } else {
        div.innerHTML = `<div class="content">${text}</div>`;
    }

    chatFlow.appendChild(div);
    chatFlow.scrollTo({ top: chatFlow.scrollHeight, behavior: 'smooth' });
}

async function send() {
    const msg = userInput.value.trim();
    if (!msg) return;

    // Remove intro screen
    const intro = document.querySelector(".ai-intro");
    if (intro) intro.remove();

    addMsg(msg, "user");
    userInput.value = "";

    // Show Loading
    const loading = document.createElement("div");
    loading.className = "message-bubble ai loading";
    loading.innerHTML = `<div class="ai-avatar">✨</div><div class="content">MÎK AI is thinking...</div>`;
    chatFlow.appendChild(loading);
    chatFlow.scrollTop = chatFlow.scrollHeight;

    try {
        const res = await fetch("/chat", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ message: msg, userId: myId })
        });
        const data = await res.json();
        loading.remove();
        addMsg(data.reply || "No response received.", "ai");
    } catch (err) {
        loading.remove();
        addMsg("Connection Error. Check Render logs!", "ai");
    }
}

sendBtn.onclick = send;
userInput.onkeydown = (e) => { if(e.key === "Enter") send(); };
