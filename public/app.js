const chatArea = document.getElementById("chatArea");
const userInput = document.getElementById("userInput");
const sendBtn = document.getElementById("sendBtn");
const typingIndicator = document.getElementById("typingIndicator");

// Buttons (future-ready)
document.getElementById("menuBtn").onclick = () =>
  alert("Sidebar coming in next version 🚧");

document.getElementById("plusBtn").onclick = () =>
  alert("Upload & tools coming soon 🚀");

document.getElementById("profileBtn").onclick = () =>
  alert("Profile feature coming soon 👤");

document.getElementById("voiceBtn").onclick = () =>
  alert("Voice mode polishing in progress 🎙️");

sendBtn.onclick = sendMessage;
userInput.addEventListener("keypress", e => {
  if (e.key === "Enter") sendMessage();
});

function sendMessage() {
  const text = userInput.value.trim();
  if (!text) return;

  addMessage(text, "user");
  userInput.value = "";

  typingIndicator.style.display = "block";

  setTimeout(() => {
    typingIndicator.style.display = "none";
    aiReply(text);
  }, 1200);
}

function addMessage(text, sender) {
  const div = document.createElement("div");
  div.className = `message ${sender}`;
  div.textContent = text;
  chatArea.appendChild(div);
  chatArea.scrollTop = chatArea.scrollHeight;
}

function aiReply(userText) {
  const reply =
    "Thanks for your message 💚 I'm MÎK AI v11.0. " +
    "This version focuses on stability, polish, and clean experience. " +
    "Big features are coming next 🚀";

  addMessage(reply, "ai");
}
