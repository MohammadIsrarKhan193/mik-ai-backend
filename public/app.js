const chat = document.getElementById("chat");
const home = document.getElementById("home");
const input = document.getElementById("msgInput");
const voiceBtn = document.getElementById("voiceBtn");

let voiceEnabled = true;
const synth = window.speechSynthesis;

voiceBtn.onclick = () => {
  voiceEnabled = !voiceEnabled;
  voiceBtn.textContent = voiceEnabled ? "🎤" : "🔇";
};

function speak(text) {
  if (!voiceEnabled) return;
  const u = new SpeechSynthesisUtterance(text);
  u.lang = "en-US";
  synth.cancel();
  synth.speak(u);
}

function addMsg(text, type) {
  const div = document.createElement("div");
  div.className = `msg ${type}`;

  const img = text.match(/https:\/\/pollinations\.ai\/p\/[^\s]+/);
  if (img) {
    div.innerHTML = text.replace(img[0], "");
    const image = document.createElement("img");
    image.src = img[0];
    image.style.width = "100%";
    image.style.borderRadius = "16px";
    div.appendChild(image);
  } else {
    div.innerText = text;
  }

  chat.appendChild(div);
  chat.scrollTop = chat.scrollHeight;

  if (type === "ai") speak(text);
}

async function send() {
  const text = input.value.trim();
  if (!text) return;

  home.classList.add("hidden");
  chat.classList.remove("hidden");

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

function quick(text) {
  input.value = text;
  send();
}
