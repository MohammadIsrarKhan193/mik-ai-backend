const chat = document.getElementById("chat");
const input = document.getElementById("msgInput");
const sendBtn = document.getElementById("sendBtn");
const micBtn = document.getElementById("micBtn");

let recognition;
let listening = false;

/* Add chat bubble */
function addMessage(text, type) {
  const div = document.createElement("div");
  div.className = `bubble ${type}`;
  div.innerText = text;
  chat.appendChild(div);
  chat.scrollTop = chat.scrollHeight;
}

/* Text send */
sendBtn.onclick = () => {
  const text = input.value.trim();
  if (!text) return;
  addMessage(text, "user");
  input.value = "";
};

/* Voice setup */
if ("webkitSpeechRecognition" in window) {
  recognition = new webkitSpeechRecognition();
  recognition.lang = "en-US";
  recognition.continuous = false;
  recognition.interimResults = false;

  recognition.onresult = e => {
    const transcript = e.results[0][0].transcript;
    addMessage(transcript, "user");
  };

  recognition.onend = () => {
    listening = false;
    micBtn.classList.remove("recording");
  };
}

/* Mic click */
micBtn.onclick = () => {
  if (!recognition) {
    alert("Voice not supported on this browser");
    return;
  }

  if (!listening) {
    recognition.start();
    listening = true;
    micBtn.classList.add("recording");
  } else {
    recognition.stop();
  }
};

/* Enter key */
input.addEventListener("keydown", e => {
  if (e.key === "Enter") sendBtn.click();
});
