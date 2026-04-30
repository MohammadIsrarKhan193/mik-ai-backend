/* ═══════════════════════════════════════════════
   MÎK AI — app.js v2.0 🪐
   By Mohammad Israr Khan
═══════════════════════════════════════════════ */

// ─── DOM References ─────────────────────────────
const sidebar         = document.getElementById("sidebar");
const sidebarOverlay  = document.getElementById("sidebarOverlay");
const sidebarToggle   = document.getElementById("sidebarToggle");
const sidebarClose    = document.getElementById("sidebarClose");
const newChatBtn      = document.getElementById("newChatBtn");
const newChatHeader   = document.getElementById("newChatHeader");
const chatArea        = document.getElementById("chatArea");
const welcomeScreen   = document.getElementById("welcomeScreen");
const messageFlow     = document.getElementById("messageFlow");
const userInput       = document.getElementById("userInput");
const sendBtn         = document.getElementById("sendBtn");
const voiceBtn        = document.getElementById("voiceBtn");
const modeBadge       = document.getElementById("modeBadge");
const settingsModal   = document.getElementById("settingsModal");
const themeToggle     = document.getElementById("themeToggle");
const clearHistory    = document.getElementById("clearHistory");
const historyList     = document.getElementById("historyList");
const modePills       = document.querySelectorAll(".mode-pill");
const suggestionChips = document.querySelectorAll(".suggestion-chip");

// ─── State ──────────────────────────────────────
let currentMode = "general";
let isLoading   = false;
let chats       = JSON.parse(localStorage.getItem("mik_chats") || "[]");
let activeChatId = null;

// ─── Sidebar ────────────────────────────────────
sidebarToggle.onclick = () => {
  sidebar.classList.add("open");
  sidebarOverlay.classList.add("show");
};
const closeSidebar = () => {
  sidebar.classList.remove("open");
  sidebarOverlay.classList.remove("show");
};
sidebarClose.onclick = closeSidebar;
sidebarOverlay.onclick = closeSidebar;

// ─── Mode Switching ──────────────────────────────
modePills.forEach(pill => {
  pill.onclick = () => {
    modePills.forEach(p => p.classList.remove("active"));
    pill.classList.add("active");
    currentMode = pill.dataset.mode;

    // Update header badge
    modeBadge.className = `mode-badge ${currentMode}`;
    const labels = {
      general: "✦ General",
      islamic: "☪ Islamic",
      imagine: "🎨 Imagine"
    };
    modeBadge.textContent = labels[currentMode];
    closeSidebar();
  };
});

// ─── Suggestion Chips ────────────────────────────
suggestionChips.forEach(chip => {
  chip.onclick = () => {
    userInput.value = chip.dataset.q;
    userInput.focus();
    autoResize();
  };
});

// ─── New Chat ────────────────────────────────────
const startNewChat = () => {
  activeChatId = null;
  messageFlow.innerHTML = "";
  welcomeScreen.style.display = "flex";
  messageFlow.style.display = "none";
  userInput.value = "";
  closeSidebar();
};
newChatBtn.onclick = startNewChat;
newChatHeader.onclick = startNewChat;

// ─── Theme ───────────────────────────────────────
themeToggle.onclick = () => {
  document.body.classList.toggle("light");
  localStorage.setItem("mik_theme", document.body.classList.contains("light") ? "light" : "dark");
};
if (localStorage.getItem("mik_theme") === "light") document.body.classList.add("light");

// ─── Settings Modal ──────────────────────────────
// Open via long-press on header brand (optional) or add a settings nav item
clearHistory.onclick = () => {
  if (confirm("Clear all chat history?")) {
    chats = [];
    localStorage.removeItem("mik_chats");
    renderHistory();
    startNewChat();
    settingsModal.classList.add("hidden");
  }
};
document.getElementById("closeSettings").onclick = () => settingsModal.classList.add("hidden");

// ─── Chat History (localStorage) ─────────────────
function saveChat(id, title, messages) {
  const idx = chats.findIndex(c => c.id === id);
  if (idx > -1) {
    chats[idx].messages = messages;
  } else {
    chats.unshift({ id, title, messages });
  }
  localStorage.setItem("mik_chats", JSON.stringify(chats));
  renderHistory();
}

function renderHistory() {
  if (chats.length === 0) {
    historyList.innerHTML = `<p class="history-empty">No chats yet</p>`;
    return;
  }
  historyList.innerHTML = chats.map(c => `
    <div class="history-item ${c.id === activeChatId ? "active" : ""}" 
         data-id="${c.id}">
      ${c.title}
    </div>
  `).join("");

  historyList.querySelectorAll(".history-item").forEach(item => {
    item.onclick = () => {
      const chat = chats.find(c => c.id === item.dataset.id);
      if (!chat) return;
      activeChatId = chat.id;
      loadChat(chat);
      closeSidebar();
    };
  });
}

function loadChat(chat) {
  welcomeScreen.style.display = "none";
  messageFlow.style.display = "flex";
  messageFlow.innerHTML = "";
  chat.messages.forEach(m => appendBubble(m.content, m.role, false));
  chatArea.scrollTop = chatArea.scrollHeight;
  renderHistory();
}

// ─── Message Rendering ───────────────────────────
function appendBubble(content, role, animate = true) {
  const isUser = role === "user";
  const row = document.createElement("div");
  row.className = `msg-row ${isUser ? "user" : "ai"}`;

  // Check if image
  const isImage = content.startsWith("IMAGE_GEN:");
  const imageUrl = isImage ? content.replace("IMAGE_GEN:", "") : null;

  let bubbleHTML = "";
  if (isImage) {
    bubbleHTML = `
      <div class="ai-image-wrapper">
        <img src="${imageUrl}" alt="MÎK AI Art" class="generated-img" 
             onerror="this.style.display='none'" />
        <a href="${imageUrl}" target="_blank" class="dl-btn">
          <i class="fas fa-download"></i> Save to Gallery
        </a>
      </div>`;
  } else {
    bubbleHTML = isUser ? escapeHTML(content) : marked.parse(content);
  }

  row.innerHTML = isUser
    ? `<div class="msg-bubble">${bubbleHTML}</div>
       <div class="user-msg-avatar">M</div>`
    : `<div class="msg-avatar">🪐</div>
       <div class="msg-bubble">${bubbleHTML}</div>`;

  if (animate) row.style.opacity = "0";
  messageFlow.appendChild(row);
  if (animate) requestAnimationFrame(() => { row.style.opacity = "1"; });
  chatArea.scrollTop = chatArea.scrollHeight;
}

function escapeHTML(str) {
  return str.replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;");
}

// ─── Typing Indicator ────────────────────────────
function showTyping() {
  const row = document.createElement("div");
  row.className = "typing-row";
  row.id = "typingIndicator";
  row.innerHTML = `
    <div class="msg-avatar">🪐</div>
    <div class="typing-dots">
      <span></span><span></span><span></span>
    </div>`;
  messageFlow.appendChild(row);
  chatArea.scrollTop = chatArea.scrollHeight;
}
function hideTyping() {
  document.getElementById("typingIndicator")?.remove();
}

// ─── Send Message ────────────────────────────────
let sessionMessages = [];

async function send() {
  const val = userInput.value.trim();
  if (!val || isLoading) return;

  // Hide welcome, show messages
  welcomeScreen.style.display = "none";
  messageFlow.style.display = "flex";

  // New chat session
  if (!activeChatId) {
    activeChatId = Date.now().toString();
    sessionMessages = [];
  }

  appendBubble(val, "user");
  sessionMessages.push({ role: "user", content: val });

  userInput.value = "";
  autoResize();
  isLoading = true;
  sendBtn.disabled = true;
  showTyping();

  try {
    const res = await fetch("/chat", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        message: val,
        userId: activeChatId,
        mode: currentMode
      })
    });

    const data = await res.json();
    hideTyping();

    const reply = data.reply || "Sorry, no response received.";
    appendBubble(reply, "assistant");
    sessionMessages.push({ role: "assistant", content: reply });

    // Save to history
    const title = sessionMessages[0]?.content?.slice(0, 40) + "…" || "New Chat";
    saveChat(activeChatId, title, sessionMessages);

  } catch (e) {
    hideTyping();
    appendBubble("Connection lost, Jani. Check your internet! 🪐", "assistant");
  } finally {
    isLoading = false;
    sendBtn.disabled = false;
  }
}

// ─── Input: Enter & Auto-resize ──────────────────
userInput.addEventListener("keydown", (e) => {
  if (e.key === "Enter" && !e.shiftKey) {
    e.preventDefault();
    send();
  }
});

function autoResize() {
  userInput.style.height = "auto";
  userInput.style.height = Math.min(userInput.scrollHeight, 120) + "px";
}
userInput.addEventListener("input", autoResize);

sendBtn.onclick = send;

// ─── Voice Input ─────────────────────────────────
const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
if (SpeechRecognition) {
  const recognition = new SpeechRecognition();
  recognition.lang = "en-US";
  recognition.continuous = false;

  voiceBtn.onclick = () => {
    recognition.start();
    voiceBtn.style.color = "#f0b429";
  };
  recognition.onresult = (e) => {
    userInput.value = e.results[0][0].transcript;
    autoResize();
    send();
  };
  recognition.onend = () => { voiceBtn.style.color = ""; };
} else {
  voiceBtn.style.display = "none";
}

// ─── Init ────────────────────────────────────────
renderHistory();
messageFlow.style.display = "none";
