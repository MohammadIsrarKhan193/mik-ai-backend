const chat = document.getElementById("chat");
const input = document.getElementById("msgInput");
const sendBtn = document.getElementById("sendBtn");
const voiceBtn = document.getElementById("voiceBtn");
const newChatBtn = document.getElementById("newChat");
const historyBox = document.getElementById("history");

let memory = JSON.parse(localStorage.getItem("mik-memory")) || [];

/* 🔊 Voice */
const synth = window.speechSynthesis;
const SpeechRecognition =
  window.SpeechRecognition || window.webkitSpeechRecognition;

const recognition = SpeechRecognition ? new SpeechRecognition() : null;

if (recognition) {
  recognition.lang = "en-US";
  recognition.onresult = e => {
    input.value = e.results[0][0].transcript;
    send();
  };
}

voiceBtn.onclick = () => recognition && recognition.start();

/* 💬 UI */
function addMsg(text, role) {
  const div = document.createElement("div");
  div.className = `msg ${role}`;
  div.innerText = text;
  chat.appendChild(div);
  chat.scrollTop = chat.scrollHeight;
}

function addImage(url) {
  const div = document.createElement("div");
  div.className = "msg ai";
  div.innerHTML = `<img src="${url}">`;
  chat.appendChild(div);
}

/* 🧠 Load memory */
memory.forEach(m => addMsg(m.content, m.role));

/* 🚀 Send */
async function send() {
  const text = input.value.trim();
  if (!text) return;

  addMsg(text, "user");
  memory.push({ role: "user", content: text });
  input.value = "";

  try {
    const res = await fetch("/chat", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        message: text,
        history: memory.slice(-6)
      })
    });

    const data = await res.json();

    if (data.type === "image") {
      addImage(data.image);
    } else {
      addMsg(data.reply, "ai");
      synth.speak(new SpeechSynthesisUtterance(data.reply));
      memory.push({ role: "assistant", content: data.reply });
    }

    localStorage.setItem("mik-memory", JSON.stringify(memory));

  } catch {
    addMsg("Brain overload 😵 Try again.", "ai");
  }
}

sendBtn.onclick = send;
newChatBtn.onclick = () => {
  chat.innerHTML = "";
  memory = [];
  localStorage.removeItem("mik-memory");
};
