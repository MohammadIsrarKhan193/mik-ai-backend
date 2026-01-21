/* ======================
   Phase 8 – Voice
====================== */

const chatContainer = document.getElementById("chat-messages");
const input = document.getElementById("user-input");
const sendBtn = document.getElementById("send-btn");
const newChatBtn = document.getElementById("new-chat-btn");
const chatList = document.getElementById("chat-list");

const sidebar = document.querySelector(".sidebar");
const menuBtn = document.getElementById("menu-btn");
const overlay = document.getElementById("overlay");

const voiceToggle = document.getElementById("voice-toggle");

/* Sidebar toggle */
menuBtn.onclick = () => {
  sidebar.classList.add("open");
  overlay.classList.add("show");
};

overlay.onclick = () => {
  sidebar.classList.remove("open");
  overlay.classList.remove("show");
};

/* Chat state */
let chats = {};
let currentChatId = null;

/* Create new chat */
function createNewChat() {
  const id = "chat_" + Date.now();
  chats[id] = [];
  currentChatId = id;
  renderChatList();
  renderMessages();
}

/* Render chat list */
function renderChatList() {
  chatList.innerHTML = "";
  Object.keys(chats).forEach(id => {
    const div = document.createElement("div");
    div.className = "history-item" + (id === currentChatId ? " active" : "");
    div.textContent = "New chat";
    div.onclick = () => {
      currentChatId = id;
      renderMessages();
      sidebar.classList.remove("open");
      overlay.classList.remove("show");
    };
    chatList.appendChild(div);
  });
}

/* Render messages */
function renderMessages() {
  chatContainer.innerHTML = "";
  if (!currentChatId) return;

  chats[currentChatId].forEach(msg => {
    const bubble = document.createElement("div");
    bubble.className = `bubble ${msg.role}`;
    bubble.textContent = msg.text;
    chatContainer.appendChild(bubble);
  });

  chatContainer.scrollTop = chatContainer.scrollHeight;
}

/* Send message */
function sendMessage(text) {
  if (!text || !currentChatId) return;

  chats[currentChatId].push({ role: "user", text });
  renderMessages();

  fetch("/chat", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ message: text })
  })
    .then(res => res.json())
    .then(data => {
      const reply = data.reply || "…";
      chats[currentChatId].push({ role: "ai", text: reply });
      speak(reply);
      renderMessages();
    })
    .catch(() => {
      chats[currentChatId].push({
        role: "ai",
        text: "Brain overload 😵 Try again."
      });
      renderMessages();
    });
}

/* Button events */
sendBtn.onclick = () => {
  const text = input.value.trim();
  input.value = "";
  sendMessage(text);
};

input.addEventListener("keydown", e => {
  if (e.key === "Enter") sendBtn.click();
});

newChatBtn.onclick = createNewChat;

/* ======================
   Voice Recognition
====================== */

const SpeechRecognition =
  window.SpeechRecognition || window.webkitSpeechRecognition;

let recognition;
let recording = false;

if (SpeechRecognition) {
  recognition = new SpeechRecognition();
  recognition.lang = "en-US";
  recognition.continuous = false;
  recognition.interimResults = false;

  recognition.onresult = e => {
    const text = e.results[0][0].transcript;
    input.value = text;
    stopRecording();
  };

  recognition.onerror = stopRecording;
}

voiceToggle.onclick = () => {
  if (!recognition) return;

  recording ? stopRecording() : startRecording();
};

function startRecording() {
  recording = true;
  voiceToggle.classList.add("active");
  recognition.start();
}

function stopRecording() {
  recording = false;
  voiceToggle.classList.remove("active");
  recognition.stop();
}

/* ======================
   Text To Speech
====================== */

function speak(text) {
  if (!window.speechSynthesis) return;
  const utter = new SpeechSynthesisUtterance(text);
  utter.lang = "en-US";
  speechSynthesis.cancel();
  speechSynthesis.speak(utter);
}

/* Init */
createNewChat();
