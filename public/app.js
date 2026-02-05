const chatFlow = document.getElementById("chat-flow");
const userInput = document.getElementById("userInput");
const sendBtn = document.getElementById("sendBtn");

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
    document.querySelector(".welcome")?.remove();
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
    } catch { addMsg("Server Connection Error.", "ai"); }
}

sendBtn.onclick = send;
userInput.onkeydown = (e) => e.key === "Enter" && send();
