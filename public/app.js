const chatArea = document.querySelector(".chat-area");
const input = document.getElementById("user-input");
const sendBtn = document.getElementById("send-btn");
const micBtn = document.getElementById("mic-btn");

/* Add message bubble */
function addMessage(text, role) {
  const div = document.createElement("div");
  div.className = `bubble ${role}`;
  div.textContent = text;
  chatArea.appendChild(div);
  chatArea.scrollTop = chatArea.scrollHeight;
}

/* Send message */
async function sendMessage() {
  const text = input.value.trim();
  if (!text) return;

  addMessage(text, "user");
  input.value = "";

  try {
    const res = await fetch("/chat", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ message: text })
    });

    const data = await res.json();
    addMessage(data.reply, "ai");
  } catch (err) {
    addMessage("🤖 MÎK AI couldn’t think properly. Try again.", "ai");
  }
}

/* Events */
sendBtn.onclick = sendMessage;
input.addEventListener("keydown", e => {
  if (e.key === "Enter") sendMessage();
});

/* Voice UI (visual only, safe) */
micBtn.onclick = () => {
  micBtn.classList.toggle("listening");
};
