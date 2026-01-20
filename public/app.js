const chat = document.getElementById("chat");
const input = document.getElementById("msgInput");
const sendBtn = document.getElementById("sendBtn");
const voiceBtn = document.getElementById("voiceBtn");
const sidebarBtn = document.getElementById("sidebarBtn");
const sidebar = document.getElementById("sidebar");
const newChatBtn = document.getElementById("newChatBtn");

let voiceOn = true;
const synth = window.speechSynthesis;

sidebarBtn.onclick = () => sidebar.classList.toggle("show");

voiceBtn.onclick = () => {
  voiceOn = !voiceOn;
  voiceBtn.textContent = voiceOn ? "🎤" : "🔇";
};

newChatBtn.onclick = () => {
  chat.innerHTML = "";
};

function speak(text) {
  if (!voiceOn) return;
  const u = new SpeechSynthesisUtterance(text);
  u.lang = "en-US";
  synth.cancel();
  synth.speak(u);
}

function addMsg(text, type) {
  document.getElementById("welcome")?.remove();
  const div = document.createElement("div");
  div.className = `msg ${type}`;
  div.textContent = text;
  chat.appendChild(div);
  chat.scrollTop = chat.scrollHeight;
  if (type === "ai") speak(text);
}

async function send() {
  const text = input.value.trim();
  if (!text) return;

  addMsg(text, "user");
  input.value = "";

  try {
    const res = await fetch("/chat", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ message: text })
    });
    const data = await res.json();
    addMsg(data.reply || "No reply 😢", "ai");
  } catch {
    addMsg("Brain overload 😵 Try again.", "ai");
  }
}

sendBtn.onclick = send;
input.addEventListener("keydown", e => {
  if (e.key === "Enter") send();
});
