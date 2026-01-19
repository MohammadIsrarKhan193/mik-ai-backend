const chat = document.getElementById("chat");
const input = document.getElementById("msgInput");
const sidebar = document.getElementById("sidebar");
const chatList = document.getElementById("chatList");
const menuBtn = document.getElementById("menuBtn");

let chats = JSON.parse(localStorage.getItem("mik_chats")) || [];
let currentChat = null;

/* SIDEBAR TOGGLE */
menuBtn.onclick = () => sidebar.classList.toggle("open");

/* SAVE */
function save() {
  localStorage.setItem("mik_chats", JSON.stringify(chats));
}

/* RENDER CHAT LIST */
function renderList() {
  chatList.innerHTML = "";
  chats.forEach(c => {
    const div = document.createElement("div");
    div.className = "chat-item";
    div.textContent = c.title || "New chat";
    div.onclick = () => loadChat(c.id);
    chatList.appendChild(div);
  });
}

/* NEW CHAT */
function newChat() {
  currentChat = { id: Date.now(), messages: [], title: "New chat" };
  chats.unshift(currentChat);
  save();
  renderList();
  chat.innerHTML = "";
  sidebar.classList.remove("open"); // ✅ AUTO CLOSE
}

/* LOAD CHAT */
function loadChat(id) {
  chat.innerHTML = "";
  currentChat = chats.find(c => c.id === id);
  currentChat.messages.forEach(m => addMsg(m.content, m.role));
  sidebar.classList.remove("open"); // ✅ AUTO CLOSE
}

/* ADD MESSAGE */
function addMsg(text, role) {
  const div = document.createElement("div");
  div.className = `msg ${role}`;
  div.textContent = text;
  chat.appendChild(div);
  chat.scrollTop = chat.scrollHeight;
}

/* SEND MESSAGE */
async function send() {
  const text = input.value.trim();
  if (!text) return;

  if (!currentChat) newChat();

  addMsg(text, "user");
  currentChat.messages.push({ role: "user", content: text });
  currentChat.title ||= text.slice(0, 20);
  input.value = "";

  sidebar.classList.remove("open"); // ✅ AUTO CLOSE

  try {
    const res = await fetch("/chat", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ message: text })
    });
    const data = await res.json();

    addMsg(data.reply, "ai");
    currentChat.messages.push({ role: "ai", content: data.reply });
    save();
    renderList();

  } catch {
    addMsg("Connection error 😢", "ai");
  }
}

/* INIT */
renderList();
