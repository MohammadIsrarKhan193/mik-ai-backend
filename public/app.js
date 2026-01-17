const chat = document.getElementById("chat");
const input = document.getElementById("msgInput");
const voiceBtn = document.getElementById("voiceBtn");

let voiceEnabled = true;
const synth = window.speechSynthesis;

// 🎤 Toggle Voice
voiceBtn.onclick = () => {
  voiceEnabled = !voiceEnabled;
  voiceBtn.textContent = voiceEnabled ? "🔊" : "🔇";
};

function speak(text) {
  if (!voiceEnabled) return;
  if (!synth) return;

  const utter = new SpeechSynthesisUtterance(text);
  utter.rate = 1;
  utter.pitch = 1;
  utter.lang = "en-US";
  synth.cancel(); // stop previous
  synth.speak(utter);
}

function addMsg(text, type) {
  const div = document.createElement("div");
  div.className = `msg ${type}`;
  div.innerText = text;
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
    addMsg(data.reply, "ai");

  } catch {
    addMsg("Connection error 😢", "ai");
  }
}
