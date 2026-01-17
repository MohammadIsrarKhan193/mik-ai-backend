const chat = document.getElementById("chat");
const input = document.getElementById("msgInput");
const voiceBtn = document.getElementById("voiceBtn");

let voiceEnabled = true;
const synth = window.speechSynthesis;

/* 🎤 Toggle Voice */
voiceBtn.onclick = () => {
  voiceEnabled = !voiceEnabled;
  voiceBtn.textContent = voiceEnabled ? "🎤" : "🔇";
};

/* 🔊 Speak AI Response */
function speak(text) {
  if (!voiceEnabled || !synth) return;

  const utter = new SpeechSynthesisUtterance(String(text));
  utter.rate = 1;
  utter.pitch = 1;
  utter.lang = "en-US";

  synth.cancel(); // stop previous voice
  synth.speak(utter);
}

/* 💬 Add Message Bubble */
function addMsg(text, type) {
  const div = document.createElement("div");
  div.className = `msg ${type}`;

  // Detect image URLs (Pollinations)
  const imgMatch = text.match(/https:\/\/pollinations\.ai\/p\/[^\s]+/);

  if (imgMatch) {
    const imgDiv = document.createElement("div");
    imgDiv.className = "img-card";

    const img = document.createElement("img");
    img.src = imgMatch[0];
    img.loading = "lazy";

    imgDiv.appendChild(img);
    div.innerHTML = text.replace(imgMatch[0], "");
    div.appendChild(imgDiv);
  } else {
    div.innerText = text;
  }

  chat.appendChild(div);
  chat.scrollTop = chat.scrollHeight;

  if (type === "ai") speak(text);
}
/* 🚀 Send Message */
async function send() {
  const text = input.value.trim();
  if (!text) return;

  // remove welcome screen (ChatGPT behavior)
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
    addMsg(data.reply || "No response 😢", "ai");

  } catch (err) {
    addMsg("Connection error 😢", "ai");
  }
}
