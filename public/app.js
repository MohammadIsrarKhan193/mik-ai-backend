const chatArea = document.getElementById("chatArea");
const input = document.getElementById("userInput");
const sendBtn = document.getElementById("sendBtn");
const welcome = document.getElementById("welcome");
const sidebar = document.getElementById("sidebar");
const chatList = document.getElementById("chatList");

let chats = JSON.parse(localStorage.getItem("mikChats")) || [];
let currentChat;

document.getElementById("menuBtn").onclick = () =>
  sidebar.classList.toggle("open");

sendBtn.onclick = send;
input.onkeypress = e => e.key === "Enter" && send();

function newChat() {
  currentChat = { id: Date.now(), messages: [] };
  chats.unshift(currentChat);
  save();
  renderList();
  chatArea.innerHTML = "";
}

async function send() {
  const text = input.value.trim();
  if (!text) return;

  welcome.style.display = "none";

  addMsg(text, "user");
  currentChat.messages.push({ role: "user", content: text });
  input.value = "";

  const res = await fetch("/chat", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ messages: currentChat.messages })
  });

  const data = await res.json();
  addMsg(data.reply, "ai");
  currentChat.messages.push({ role: "assistant", content: data.reply });

  save();
}

function addMsg(text, type) {
  const div = document.createElement("div");
  div.className = `msg ${type}`;
  div.textContent = text;
  chatArea.appendChild(div);
  chatArea.scrollTop = chatArea.scrollHeight;
}

function renderList() {
  chatList.innerHTML = "";
  chats.forEach(c => {
    const btn = document.createElement("button");
    btn.textContent = c.messages[0]?.content || "New chat";
    btn.onclick = () => loadChat(c.id);
    chatList.appendChild(btn);
  });
}

function loadChat(id) {
  chatArea.innerHTML = "";
  currentChat = chats.find(c => c.id === id);
  currentChat.messages.forEach(m =>
    addMsg(m.content, m.role === "user" ? "user" : "ai")
  );
}

function save() {
  localStorage.setItem("mikChats", JSON.stringify(chats));
}

newChat();
renderList();
