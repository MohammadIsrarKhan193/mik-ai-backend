const chat = document.getElementById("chat");
const input = document.getElementById("msgInput");
const voiceBtn = document.getElementById("voiceBtn");

let voiceEnabled = true;
const synth = window.speechSynthesis;

voiceBtn.onclick = () => {
  voiceEnabled = !voiceEnabled;
  voiceBtn.textContent = voiceEnabled ? "🎤" : "🔇";
};

function speak(text) {
  if (!voiceEnabled || !synth) return;
  const u = new SpeechSynthesisUtterance(text);
  synth.cancel();
  synth.speak(u);
}

function addUser(text) {
  const div = document.createElement("div");
  div.className = "msg user";
  div.innerText = text;
  chat.appendChild(div);
}

function addAIText(text) {
  const div = document.createElement("div");
  div.className = "msg ai";
  div.innerText = text;
  chat.appendChild(div);
  speak(text);
}

function addAIImage(url) {
  const div = document.createElement("div");
  div.className = "msg ai img-card";
  div.innerHTML = `<img src="${url}" />`;
  chat.appendChild(div);
}

async function send() {
  const text = input.value.trim();
  if (!text) return;

  document.getElementById("welcome")?.remove();

  addUser(text);
  input.value = "";

  try {
    const res = await fetch("/chat", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ message: text })
    });

    const data = await res.json();

    if (data.type === "image") {
      addAIImage(data.image);
    } else {
      addAIText(data.reply);
    }

    chat.scrollTop = chat.scrollHeight;

  } catch {
    addAIText("Brain overload 😵 Try again.");
  }
}
