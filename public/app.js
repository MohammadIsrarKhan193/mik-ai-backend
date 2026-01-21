/* =========================
   ELEMENTS
========================= */
const chat = document.getElementById("chat");
const input = document.getElementById("msgInput");
const sendBtn = document.getElementById("sendBtn");
const voiceBtn = document.getElementById("voiceBtn");

/* =========================
   VOICE (TEXT → SPEECH)
========================= */
let voiceEnabled = true;
const synth = window.speechSynthesis;

voiceBtn.onclick = () => {
  voiceEnabled = !voiceEnabled;
  voiceBtn.textContent = voiceEnabled ? "🎤" : "🔇";
};

function speak(text) {
  if (!voiceEnabled || !synth) return;
  const utter = new SpeechSynthesisUtterance(text);
  utter.lang = "en-US";
  utter.rate = 1;
  utter.pitch = 1;
  synth.cancel();
  synth.speak(utter);
}

/* =========================
   CHAT BUBBLES
========================= */
function addMessage(text, type) {
  const bubble = document.createElement("div");
  bubble.className = `msg ${type}`;
  bubble.textContent = text;

  chat.appendChild(bubble);
  chat.scrollTop = chat.scrollHeight;

  if (type === "ai") speak(text);
}

/* =========================
   SEND MESSAGE → BACKEND
========================= */
async function sendMessage() {
  const text = input.value.trim();
  if (!text) return;

  // remove welcome screen (if exists)
  document.getElementById("welcome")?.remove();

  addMessage(text, "user");
  input.value = "";

  try {
    const res = await fetch("/chat", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ message: text })
    });

    const data = await res.json();
    addMessage(data.reply || "No response 😢", "ai");

  } catch (err) {
    addMessage("Brain overload 😵 Try again.", "ai");
  }
}

/* =========================
   EVENTS
========================= */
sendBtn.onclick = sendMessage;

input.addEventListener("keydown", (e) => {
  if (e.key === "Enter") sendMessage();
});
