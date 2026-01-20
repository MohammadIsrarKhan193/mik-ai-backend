const chat = document.getElementById("chat");
const input = document.getElementById("msgInput");
const voiceBtn = document.getElementById("voiceBtn");
const menuBtn = document.getElementById("menuBtn");
const sidebar = document.getElementById("sidebar");
const synth = window.speechSynthesis;

let voice = true;

/* 🎤 Voice toggle */
voiceBtn.onclick = () => {
  voice = !voice;
  voiceBtn.textContent = voice ? "🎤" : "🔇";
};

/* ☰ Sidebar */
menuBtn.onclick = () => {
  sidebar.classList.toggle("hidden");
};

/* 💬 Add bubble */
function addMsg(text, type) {
  const div = document.createElement("div");
  div.className = `msg ${type}`;
  div.innerText = text;
  chat.appendChild(div);
  chat.scrollTop = chat.scrollHeight;

  if (type === "ai" && voice) {
    const u = new SpeechSynthesisUtterance(text);
    synth.cancel();
    synth.speak(u);
  }
}

/* 🚀 Send */
async function send() {
  const text = input.value.trim();
  if (!text) return;

  document.getElementById("welcome")?.remove();
  sidebar.classList.add("hidden");

  addMsg(text, "user");
  input.value = "";

  try {
    const res = await fetch("/chat", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ message: text })
    });
    const data = await res.json();
    addMsg(data.reply, "ai");
  } catch {
    addMsg("Brain overload 😵 Try again.", "ai");
  }
}
