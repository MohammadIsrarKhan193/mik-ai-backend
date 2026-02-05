const chatFlow = document.getElementById("chat-flow");
const userInput = document.getElementById("userInput");
const sendBtn = document.getElementById("sendBtn");

function addMsg(text, type) {
    const div = document.createElement("div");
    div.className = `message-bubble ${type}`;
    div.innerHTML = type === "ai" 
        ? `<div class="ai-avatar">✨</div><div class="content">${marked.parse(text)}</div>` 
        : text;
    chatFlow.appendChild(div);
    chatFlow.scrollTop = chatFlow.scrollHeight;
}

async function send() {
    const msg = userInput.value.trim();
    if (!msg) return;
    document.querySelector(".intro")?.remove();
    addMsg(msg, "user");
    userInput.value = "";

    try {
        const res = await fetch("/chat", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ message: msg, userId: "Israr" })
        });
        const data = await res.json();
        addMsg(data.reply, "ai");
    } catch { addMsg("Server error!", "ai"); }
}

sendBtn.onclick = send;
userInput.onkeydown = (e) => e.key === "Enter" && send();
