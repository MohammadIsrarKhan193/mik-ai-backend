const sidebar = document.getElementById("sidebar");
const overlay = document.getElementById("overlay");
const openBtn = document.getElementById("openSidebar");
const closeBtn = document.getElementById("closeSidebar");

const chatArea = document.getElementById("chatArea");
const input = document.getElementById("userInput");
const sendBtn = document.getElementById("sendBtn");

/* SIDEBAR TOGGLE */
openBtn.onclick = () => {
  sidebar.classList.add("open");
  overlay.classList.add("show");
};

closeBtn.onclick = overlay.onclick = () => {
  sidebar.classList.remove("open");
  overlay.classList.remove("show");
};

/* CHAT MESSAGE UI */
sendBtn.onclick = () => {
  const text = input.value.trim();
  if (!text) return;

  const bubble = document.createElement("div");
  bubble.className = "bubble user";
  bubble.textContent = text;
  chatArea.appendChild(bubble);

  input.value = "";
  chatArea.scrollTop = chatArea.scrollHeight;
};
