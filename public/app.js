const chat = document.getElementById("chat");
const input = document.getElementById("msgInput");
const voiceBtn = document.getElementById("voiceBtn");

let voiceEnabled = true;
const synth = window.speechSynthesis;

/* ====== TOGGLE VOICE ====== */
voiceBtn.onclick = () => {
  voiceEnabled = !voiceEnabled;
  voiceBtn.textContent = voiceEnabled ? "🎤" : "🔇";
};

/* ====== SPEAK AI RESPONSE ====== */
function speak(text) {
  if (!voiceEnabled || !synth) return;
  const utter = new SpeechSynthesisUtterance(String(text));
  utter.rate = 1;
  utter.pitch = 1;
  utter.lang = "en-US";
  synth.cancel();
  synth.speak(utter);
}

/* ====== ADD MESSAGE BUBBLE ====== */
function addMsg(text, role) {
  const div = document.createElement("div");
  div.classList.add("msg");
  div.classList.add(role);

  // detect image URLs
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
    div.textContent = text;
  }

  chat.appendChild(div);
  chat.scrollTop = chat.scrollHeight;

  if (role === "ai") speak(text);
}

/* ====== SEND MESSAGE ====== */
async function send() {
  const text = input.value.trim();
  if (!text) return;

  // remove welcome screen
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

/* ====== INPUT ENTER KEY ====== */
input.addEventListener("keydown", (e) => {
  if (e.key === "Enter") send();
});
