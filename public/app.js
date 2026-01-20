const chat = document.getElementById("chat");
const input = document.getElementById("msgInput");
const voiceBtn = document.getElementById("voiceBtn");

let memory = JSON.parse(localStorage.getItem("mik-memory")) || [];
let listening = false;

// 🔊 Speech
const synth = window.speechSynthesis;
const SpeechRecognition =
  window.SpeechRecognition || window.webkitSpeechRecognition;

const recognition = SpeechRecognition
  ? new SpeechRecognition()
  : null;

if (recognition) {
  recognition.lang = "en-US";
  recognition.onresult = e => {
    const text = e.results[0][0].transcript;
    input.value = text;
    send();
  };
}

// 🎤 Voice Button
voiceBtn.onclick = () => {
  if (!recognition) return alert("Voice not supported");
  listening ? recognition.stop() : recognition.start();
  listening = !listening;
  voiceBtn.textContent = listening ? "🛑" : "🎤";
};

// 🗣 Speak AI
function speak(text) {
  const u = new SpeechSynthesisUtterance(text);
  synth.cancel();
  synth.speak(u);
}

// 💬 UI
function addMsg(text, who) {
  const div = document.createElement("div");
  div.className = `msg ${who}`;
  div.innerText = text;
  chat.appendChild(div);
  chat.scrollTop = chat.scrollHeight;
}

function addImage(url) {
  const div = document.createElement("div");
  div.className = "msg ai";
  div.innerHTML = `<img src="${url}">`;
  chat.appendChild(div);
  chat.scrollTop = chat.scrollHeight;
}

// 🧠 Load Memory
memory.forEach(m => addMsg(m.content, m.role));

// 🚀 Send
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
      speak(data.reply);
      memory.push({ role: "assistant", content: data.reply });
    }

    localStorage.setItem("mik-memory", JSON.stringify(memory));

  } catch {
    addMsg("Brain overload 😵 Try again.", "ai");
  }
}
