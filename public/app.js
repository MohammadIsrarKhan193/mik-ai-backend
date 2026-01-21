const chatArea = document.getElementById("chatArea");
const input = document.getElementById("userInput");
const sendBtn = document.getElementById("sendBtn");
const voiceBtn = document.getElementById("voiceBtn");

/* ADD MESSAGE */
function addMessage(text, sender) {
  const bubble = document.createElement("div");
  bubble.className = `bubble ${sender}`;
  bubble.textContent = text;
  chatArea.appendChild(bubble);
  chatArea.scrollTop = chatArea.scrollHeight;
}

/* SEND TEXT */
sendBtn.addEventListener("click", () => {
  const msg = input.value.trim();
  if (!msg) return;

  addMessage(msg, "user");
  input.value = "";
});

/* ENTER KEY */
input.addEventListener("keydown", (e) => {
  if (e.key === "Enter") {
    sendBtn.click();
  }
});

/* VOICE BUTTON (UI ONLY) */
voiceBtn.addEventListener("click", () => {
  alert("🎤 Voice input UI ready (logic comes later)");
});
