const chat = document.getElementById("chat");
const input = document.getElementById("msgInput");
const home = document.getElementById("home");

const menuBtn = document.getElementById("menuBtn");
const plusBtn = document.getElementById("plusBtn");
const profileBtn = document.getElementById("profileBtn");
const voiceBtn = document.getElementById("voiceBtn");

let voiceEnabled = true;
const synth = window.speechSynthesis;

/* 🎤 VOICE */
voiceBtn.onclick = () => {
  voiceEnabled = !voiceEnabled;
  voiceBtn.classList.toggle("off");
};

function speak(text) {
  if (!voiceEnabled) return;
  const u = new SpeechSynthesisUtterance(text);
  u.lang = "en-US";
  synth.cancel();
  synth.speak(u);
}

/* 💬 MESSAGE */
function addMsg(text, type) {
  const div = document.createElement("div");
  div.className = `msg ${type}`;
  div.innerText = text;
  chat.appendChild(div);
  chat.scrollTop = chat.scrollHeight;
  if (type === "ai") speak(text);
}

/* 🚀 SEND */
async function send() {
  const text = input.value.trim();
  if (!text) return;

  home.style.display = "none";
  addMsg(text, "user");
  input.value = "";

  try {
    const res = await fetch("/chat", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ message: text })
    });
    const data = await res.json();
    addMsg(data.reply || "No response 😢", "ai");
  } catch {
    addMsg("Connection error 😢", "ai");
  }
}

/* ⚡ QUICK PROMPTS */
function quickPrompt(text) {
  input.value = text;
  send();
}

/* ☰ SIDEBAR */
menuBtn.onclick = () => {
  alert("Sidebar coming in next version 🚧");
};

/* ➕ PLUS */
plusBtn.onclick = () => {
  alert("Upload & tools coming soon 🚀");
};

/* 👤 PROFILE */
profileBtn.onclick = () => {
  addMsg("👤 Profile feature coming soon", "ai");
};
