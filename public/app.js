const chat = document.getElementById("chat");
const input = document.getElementById("msgInput");
const sendBtn = document.getElementById("sendBtn");
const voiceBtn = document.getElementById("voiceBtn");

/* ===============================
   CHAT BUBBLE FUNCTION
================================ */
function addMessage(text, type) {
  const bubble = document.createElement("div");
  bubble.className = `bubble ${type}`;
  bubble.innerText = text;
  chat.appendChild(bubble);
  chat.scrollTop = chat.scrollHeight;
}

/* ===============================
   SEND TEXT → AI
================================ */
sendBtn.onclick = async () => {
  const text = input.value.trim();
  if (!text) return;

  addMessage(text, "user");
  input.value = "";

  const thinking = document.createElement("div");
  thinking.className = "bubble ai";
  thinking.innerText = "Thinking…";
  chat.appendChild(thinking);
  chat.scrollTop = chat.scrollHeight;

  try {
    const res = await fetch("https://mik-ai-backend.onrender.com/chat", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ message: text })
    });

    const data = await res.json();
    thinking.innerText = data.reply;
  } catch (err) {
    thinking.innerText = "Brain overload 😵 Try again.";
  }
};

/* ===============================
   VOICE INPUT (NO AI LOGIC HERE)
================================ */
voiceBtn.onclick = () => {
  const SpeechRecognition =
    window.SpeechRecognition || window.webkitSpeechRecognition;

  if (!SpeechRecognition) {
    alert("Voice not supported");
    return;
  }

  const recognition = new SpeechRecognition();
  recognition.lang = "en-US";
  recognition.start();

  recognition.onresult = (e) => {
    const text = e.results[0][0].transcript;
    input.value = text;
  };
};
