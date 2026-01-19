const chatArea = document.getElementById("chatArea");
const input = document.getElementById("userInput");
const sendBtn = document.getElementById("sendBtn");
const welcome = document.getElementById("welcome");
const sidebar = document.getElementById("sidebar");
const chatList = document.getElementById("chatList");

let chats = JSON.parse(localStorage.getItem("mikChats")) || [];
let currentChat = null;

/* TOGGLE SIDEBAR */
document.getElementById("menuBtn").onclick = () =>
  sidebar.classList.toggle("open");

/* SEND */
sendBtn.onclick = send;
input.addEventListener("keypress", e => {
  if (e.key === "Enter") send();
});

/* NEW CHAT */
function newChat() {
  currentChat = {
    id: Date.now(),
    title: "New chat",
    messages: []
  };
  chats.unshift(currentChat);
  saveChats();
  renderChatList();
  loadChat(currentChat.id);
}

/* SEND MESSAGE */
function send() {
  const text = input.value.trim();
  if (!text) return;

  welcome.style.display = "none";

  addMsg(text, "user");
  currentChat.messages.push({ role: "user", text });

  setTimeout(() => {
    const reply = "MÎK AI v13 💚 I remember this conversation now.";
    addMsg(reply, "ai");
    currentChat.messages.push({ role: "ai", text: reply });
    saveChats();
  }, 800);

  input.value = "";
}

/* ADD MESSAGE */
function addMsg(text, type) {
  const div = document.createElement("div");
  div.className = `msg ${type}`;
  div.textContent = text;
  chatArea.appendChild(div);
  chatArea.scrollTop = chatArea.scrollHeight;
}

/* LOAD CHAT */
function loadChat(id) {
  chatArea.innerHTML = "";
  const chat = chats.find(c => c.id === id);
  if (!chat) return;

  currentChat = chat;
  welcome.style.display = "none";

  chat.messages.forEach(m =>
    addMsg(m.text, m.role === "user" ? "user" : "ai")
  );
}

/* RENDER SIDEBAR */
function renderChatList() {
  chatList.innerHTML = "";
  chats.forEach(c => {
    const btn = document.createElement("button");
    btn.textContent = c.messages[0]?.text || "New chat";
    btn.onclick = () => loadChat(c.id);
    chatList.appendChild(btn);
  });
}

/* SAVE */
function saveChats() {
  localStorage.setItem("mikChats", JSON.stringify(chats));
}

/* INIT */
if (chats.length) {
  renderChatList();
  loadChat(chats[0].id);
} else {
  newChat();
}
