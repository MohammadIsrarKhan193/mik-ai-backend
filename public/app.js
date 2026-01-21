/* ======================
   MÎK AI – Phase 5
   Chat Switching Logic
====================== */

const chatContainer = document.getElementById("chat-messages");
const input = document.getElementById("user-input");
const sendBtn = document.getElementById("send-btn");
const newChatBtn = document.getElementById("new-chat-btn");
const chatList = document.getElementById("chat-list");

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

/* Render sidebar chat list */
function renderChatList() {
  chatList.innerHTML = "";

  Object.keys(chats).forEach((id) => {
    const div = document.createElement("div");
    div.className = "chat-item";
    div.textContent = "New chat";
    div.onclick = () => {
      currentChatId = id;
      renderMessages();
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
    bubble.className = msg.role === "user" ? "msg user" : "msg ai";
    bubble.textContent = msg.text;
    chatContainer.appendChild(bubble);
  });

  chatContainer.scrollTop = chatContainer.scrollHeight;
}

/* Send message */
function sendMessage() {
  const text = input.value.trim();
  if (!text || !currentChatId) return;

  chats[currentChatId].push({ role: "user", text });
  input.value = "";
  renderMessages();

  /* Placeholder AI reply */
  setTimeout(() => {
    chats[currentChatId].push({
      role: "ai",
      text: "🧠 MÎK AI will respond here (AI next phase)"
    });
    renderMessages();
  }, 600);
}

/* Events */
sendBtn.onclick = sendMessage;
input.addEventListener("keydown", e => {
  if (e.key === "Enter") sendMessage();
});
newChatBtn.onclick = createNewChat;

/* Init */
createNewChat();
