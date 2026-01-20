const chat = document.getElementById("chat");
const input = document.getElementById("msgInput");
const micBtn = document.getElementById("micBtn");
const sendBtn = document.getElementById("sendBtn");

let recognizing = false;

/* SPEECH RECOGNITION */
const SpeechRecognition =
  window.SpeechRecognition || window.webkitSpeechRecognition;

const recognition = new SpeechRecognition();
recognition.lang = "en-US";
recognition.interimResults = false;
recognition.continuous = false;

/* MIC EVENTS */
micBtn.addEventListener("click", () => {
  if (recognizing) {
    recognition.stop();
    return;
  }
  recognition.start();
});

recognition.onstart = () => {
  recognizing = true;
  micBtn.classList.add("listening");
};

recognition.onend = () => {
  recognizing = false;
  micBtn.classList.remove("listening");
};

recognition.onresult = (e) => {
  const text = e.results[0][0].transcript;
  input.value = text;
  send();
};

/* CHAT */
function addMsg(text, type) {
  const div = document.createElement("div");
  div.className = `msg ${type}`;
  div.innerText = text;
  chat.appendChild(div);
  chat.scrollTop = chat.scrollHeight;
}

/* SEND */
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

    const data = await res.json();
    addMsg(data.reply || "⚠️ No response", "ai");

  } catch {
    addMsg("Brain overload 😵 Try again.", "ai");
  }
}

sendBtn.onclick = send;

input.addEventListener("keydown", e => {
  if (e.key === "Enter") send();
});
