const chat = document.getElementById("chat");
const input = document.getElementById("msgInput");
const micBtn = document.getElementById("micBtn");
const sendBtn = document.getElementById("sendBtn");
const menuBtn = document.getElementById("menuBtn");
const addBtn = document.getElementById("addBtn");
const sidebar = document.getElementById("sidebar");

let recognizing = false;

/* SIDEBAR TOGGLE */
menuBtn.onclick = () => {
  sidebar.classList.toggle("hidden");
};

/* PLUS BUTTON */
addBtn.onclick = () => {
  alert("Upload & tools coming soon 🚀");
};

/* NEW CHAT */
function newChat() {
  chat.innerHTML = "";
  document.getElementById("welcome")?.remove();
  sidebar.classList.add("hidden");
}

/* SPEECH RECOGNITION */
const SpeechRecognition =
  window.SpeechRecognition || window.webkitSpeechRecognition;

const recognition = new SpeechRecognition();
recognition.lang = "en-US";

micBtn.onclick = () => {
  if (recognizing) recognition.stop();
  else recognition.start();
};

recognition.onstart = () => {
  recognizing = true;
  micBtn.classList.add("listening");
};

recognition.onend = () => {
  recognizing = false;
  micBtn.classList.remove("listening");
};

recognition.onresult = e => {
  input.value = e.results[0][0].transcript;
  send();
};

/* CHAT UI */
function addMsg(text, type) {
  const div = document.createElement("div");
  div.className = `msg ${type}`;
  div.innerText = text;
  chat.appendChild(div);
  chat.scrollTop = chat.scrollHeight;
}

/* SEND MESSAGE */
async function send() {
  const text = input.value.trim();
  if (!text) return;

  document.getElementById("welcome")?.remove();
  addMsg(text, "user");
  input.value = "";

  try {
    const res = await fetch("/chat", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ message: text })
    });

    if (!res.ok) throw new Error("API failed");

    const data = await res.json();
    addMsg(data.reply || "No response", "ai");

  } catch (err) {
    addMsg("Brain overload 😵 Try again.", "ai");
  }
}

sendBtn.onclick = send;
input.addEventListener("keydown", e => {
  if (e.key === "Enter") send();
});
