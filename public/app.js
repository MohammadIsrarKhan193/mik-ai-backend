const chat = document.getElementById("chat");
const input = document.getElementById("msgInput");
const home = document.getElementById("home");

const sidebar = document.getElementById("sidebar");
const overlay = document.getElementById("overlay");
const tools = document.getElementById("tools");
const profile = document.getElementById("profile");

const menuBtn = document.getElementById("menuBtn");
const plusBtn = document.getElementById("plusBtn");
const profileBtn = document.getElementById("profileBtn");
const voiceBtn = document.getElementById("voiceBtn");

let voiceEnabled = true;

/* VOICE */
voiceBtn.onclick = () => {
  voiceEnabled = !voiceEnabled;
  voiceBtn.style.opacity = voiceEnabled ? 1 : 0.5;
};

function speak(text) {
  if (!voiceEnabled) return;
  const u = new SpeechSynthesisUtterance(text);
  speechSynthesis.cancel();
  speechSynthesis.speak(u);
}

/* MESSAGE */
function addMsg(text, type) {
  const div = document.createElement("div");
  div.className = `msg ${type}`;
  div.innerText = text;
  chat.appendChild(div);
  chat.scrollTop = chat.scrollHeight;
  if (type === "ai") speak(text);
}

/* SEND */
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
    addMsg(data.reply || "No response", "ai");
  } catch {
    addMsg("Connection error 😢", "ai");
  }
}

/* QUICK */
function quickPrompt(text) {
  input.value = text;
  send();
}

/* SIDEBAR */
menuBtn.onclick = () => {
  sidebar.classList.add("open");
  overlay.style.display = "block";
};

/* PLUS */
plusBtn.onclick = () => {
  tools.style.display = tools.style.display === "block" ? "none" : "block";
};

/* PROFILE */
profileBtn.onclick = () => {
  profile.style.display = "block";
  overlay.style.display = "block";
};

function closeAll() {
  sidebar.classList.remove("open");
  tools.style.display = "none";
  profile.style.display = "none";
  overlay.style.display = "none";
}

function newChat() {
  chat.innerHTML = "";
  home.style.display = "block";
  closeAll();
}
