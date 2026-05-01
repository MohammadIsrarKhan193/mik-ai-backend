/* ═══════════════════════════════════════════════
   MÎK AI — app.js v2.0 🪐
   By Mohammad Israr Khan
═══════════════════════════════════════════════ */

// ─── DOM ─────────────────────────────────────────
const sidebar        = document.getElementById("sidebar");
const sidebarOverlay = document.getElementById("sidebarOverlay");
const sidebarToggle  = document.getElementById("sidebarToggle");
const sidebarClose   = document.getElementById("sidebarClose");
const newChatBtn     = document.getElementById("newChatBtn");
const newChatHeader  = document.getElementById("newChatHeader");
const chatArea       = document.getElementById("chatArea");
const welcomeScreen  = document.getElementById("welcomeScreen");
const messageFlow    = document.getElementById("messageFlow");
const userInput      = document.getElementById("userInput");
const sendBtn        = document.getElementById("sendBtn");
const voiceBtn       = document.getElementById("voiceBtn");
const voiceRoomBtn   = document.getElementById("voiceRoomBtn");
const uploadBtn      = document.getElementById("uploadBtn");
const cameraBtn      = document.getElementById("cameraBtn");
const fileInput      = document.getElementById("fileInput");
const cameraInput    = document.getElementById("cameraInput");
const modeBadge      = document.getElementById("modeBadge");
const historyList    = document.getElementById("historyList");
const quizPanel      = document.getElementById("quizPanel");
const adBanner       = document.getElementById("adBanner");
const modePills      = document.querySelectorAll(".mode-pill");
const suggestionChips= document.querySelectorAll(".suggestion-chip");

// ─── State ───────────────────────────────────────
let currentMode    = "general";
let isLoading      = false;
let voiceRoomActive= false;
let isSpeaking     = false;
let activeChatId   = null;
let sessionMessages= [];
let messageCount   = 0;
let chats          = JSON.parse(localStorage.getItem("mik_chats") || "[]");
let currentQuiz    = null;

// ─── Sidebar ─────────────────────────────────────
sidebarToggle.onclick = () => { sidebar.classList.add("open"); sidebarOverlay.classList.add("show"); };
const closeSidebar = () => { sidebar.classList.remove("open"); sidebarOverlay.classList.remove("show"); };
sidebarClose.onclick = closeSidebar;
sidebarOverlay.onclick = closeSidebar;

// ─── Mode Switching ──────────────────────────────
const modeBadgeLabels = { general:"✦ General", islamic:"☪ Islamic", imagine:"🎨 Imagine", quiz:"🧠 Quiz" };
modePills.forEach(pill => {
  pill.onclick = () => {
    modePills.forEach(p => p.classList.remove("active"));
    pill.classList.add("active");
    currentMode = pill.dataset.mode;
    modeBadge.className = `mode-badge ${currentMode}`;
    modeBadge.textContent = modeBadgeLabels[currentMode];

    if (currentMode === "quiz") startQuiz();
    else { quizPanel.classList.add("hidden"); }
    closeSidebar();
  };
});

// ─── Suggestion Chips ────────────────────────────
suggestionChips.forEach(chip => {
  chip.onclick = () => { userInput.value = chip.dataset.q; autoResize(); userInput.focus(); };
});

// ─── New Chat ────────────────────────────────────
const startNewChat = () => {
  activeChatId = null; sessionMessages = []; messageCount = 0;
  messageFlow.innerHTML = "";
  welcomeScreen.style.display = "flex";
  messageFlow.style.display = "none";
  quizPanel.classList.add("hidden");
  userInput.value = "";
  closeSidebar();
};
newChatBtn.onclick = startNewChat;
newChatHeader.onclick = startNewChat;

// ─── Theme ───────────────────────────────────────
document.getElementById("themeToggle").onclick = () => {
  document.body.classList.toggle("light");
  localStorage.setItem("mik_theme", document.body.classList.contains("light") ? "light" : "dark");
};
if (localStorage.getItem("mik_theme") === "light") document.body.classList.add("light");

// ─── Settings ────────────────────────────────────
const settingsModal = document.getElementById("settingsModal");
document.getElementById("settingsBtn").onclick = () => { settingsModal.classList.remove("hidden"); closeSidebar(); };
document.getElementById("closeSettings").onclick = () => settingsModal.classList.add("hidden");
document.getElementById("clearHistory").onclick = () => {
  if (confirm("Clear all chat history?")) {
    chats = []; localStorage.removeItem("mik_chats");
    renderHistory(); startNewChat();
    settingsModal.classList.add("hidden");
  }
};

// ─── Premium Modal ────────────────────────────────
const premiumModal = document.getElementById("premiumModal");
document.getElementById("upgradeBtn").onclick = () => { premiumModal.classList.remove("hidden"); closeSidebar(); };
document.getElementById("closePremium").onclick = () => premiumModal.classList.add("hidden");
document.getElementById("getPremiumBtn").onclick = () => alert("Stripe payments coming soon Insha'Allah! 🪐");
document.getElementById("adUpgradeBtn").onclick = () => { premiumModal.classList.remove("hidden"); };
document.getElementById("adClose").onclick = () => adBanner.classList.add("hidden");

// ─── Ad / Monetization Logic ─────────────────────
function checkAds() {
  messageCount++;
  if (messageCount % 5 === 0) {
    adBanner.classList.remove("hidden");
    setTimeout(() => adBanner.classList.add("hidden"), 8000);
  }
}

// ─── History ─────────────────────────────────────
function saveChat(id, title, messages) {
  const idx = chats.findIndex(c => c.id === id);
  if (idx > -1) chats[idx].messages = messages;
  else chats.unshift({ id, title, messages });
  localStorage.setItem("mik_chats", JSON.stringify(chats));
  renderHistory();
}

function renderHistory() {
  if (!chats.length) { historyList.innerHTML = `<p class="history-empty">No chats yet</p>`; return; }
  historyList.innerHTML = chats.map(c =>
    `<div class="history-item ${c.id === activeChatId ? "active" : ""}" data-id="${c.id}">${c.title}</div>`
  ).join("");
  historyList.querySelectorAll(".history-item").forEach(item => {
    item.onclick = () => {
      const chat = chats.find(c => c.id === item.dataset.id);
      if (!chat) return;
      activeChatId = chat.id;
      sessionMessages = [...chat.messages];
      welcomeScreen.style.display = "none";
      messageFlow.style.display = "flex";
      messageFlow.innerHTML = "";
      chat.messages.forEach(m => appendBubble(m.content, m.role, false));
      chatArea.scrollTop = chatArea.scrollHeight;
      renderHistory();
      closeSidebar();
    };
  });
}

// ─── Message Rendering ───────────────────────────
function appendBubble(content, role, animate = true) {
  const isUser  = role === "user";
  const isImage = content.startsWith("IMAGE_GEN:");
  const imageUrl= isImage ? content.replace("IMAGE_GEN:", "") : null;

  let bubbleHTML = "";
  if (isImage) {
    bubbleHTML = `
      <div class="ai-image-wrapper">
        <img src="${imageUrl}" alt="MÎK AI Art" class="generated-img" onerror="this.style.display='none'" />
        <a href="${imageUrl}" target="_blank" class="dl-btn"><i class="fas fa-download"></i> Save to Gallery</a>
      </div>`;
  } else {
    bubbleHTML = isUser ? escapeHTML(content) : marked.parse(content);
  }

  const row = document.createElement("div");
  row.className = `msg-row ${isUser ? "user" : "ai"}`;
  row.innerHTML = isUser
    ? `<div class="msg-bubble">${bubbleHTML}</div><div class="user-msg-avatar">M</div>`
    : `<div class="msg-avatar">🪐</div><div class="msg-bubble">${bubbleHTML}</div>`;

  if (animate) row.style.opacity = "0";
  messageFlow.appendChild(row);
  if (animate) requestAnimationFrame(() => row.style.opacity = "1");
  chatArea.scrollTop = chatArea.scrollHeight;
}

function escapeHTML(str) {
  return str.replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;");
}

// ─── Typing Indicator ────────────────────────────
function showTyping() {
  const row = document.createElement("div");
  row.className = "typing-row"; row.id = "typingIndicator";
  row.innerHTML = `<div class="msg-avatar">🪐</div><div class="typing-dots"><span></span><span></span><span></span></div>`;
  messageFlow.appendChild(row);
  chatArea.scrollTop = chatArea.scrollHeight;
}
function hideTyping() { document.getElementById("typingIndicator")?.remove(); }

// ─── Send Message ────────────────────────────────
async function send() {
  const val = userInput.value.trim();
  if (!val || isLoading) return;

  welcomeScreen.style.display = "none";
  messageFlow.style.display = "flex";

  if (!activeChatId) { activeChatId = Date.now().toString(); sessionMessages = []; }

  appendBubble(val, "user");
  sessionMessages.push({ role: "user", content: val });
  userInput.value = ""; autoResize();
  isLoading = true; sendBtn.disabled = true;
  showTyping(); checkAds();

  try {
    const res = await fetch("/chat", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ message: val, userId: activeChatId, mode: currentMode })
    });
    const data = await res.json();
    hideTyping();
    const reply = data.reply || "Sorry, no response.";
    appendBubble(reply, "assistant");
    sessionMessages.push({ role: "assistant", content: reply });
    saveChat(activeChatId, sessionMessages[0]?.content?.slice(0, 38) + "…", sessionMessages);
  } catch {
    hideTyping();
    appendBubble("Connection lost, Jani! Check internet 🪐", "assistant");
  } finally {
    isLoading = false; sendBtn.disabled = false;
  }
}

sendBtn.onclick = send;
userInput.addEventListener("keydown", e => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); send(); } });
function autoResize() { userInput.style.height = "auto"; userInput.style.height = Math.min(userInput.scrollHeight, 120) + "px"; }
userInput.addEventListener("input", autoResize);

// ─── File Upload ─────────────────────────────────
uploadBtn.onclick = () => fileInput.click();
cameraBtn.onclick = () => cameraInput.click();

async function handleFile(file) {
  if (!file) return;
  welcomeScreen.style.display = "none";
  messageFlow.style.display = "flex";

  // Show file preview in chat
  const isImage = file.type.startsWith("image/");
  const row = document.createElement("div");
  row.className = "msg-row user";
  if (isImage) {
    const url = URL.createObjectURL(file);
    row.innerHTML = `<div class="msg-bubble"><div class="ai-image-wrapper"><img src="${url}" class="generated-img" style="border-color:var(--purple-light)" /><span style="font-size:11px;color:var(--text-dim)">${file.name}</span></div></div><div class="user-msg-avatar">M</div>`;
  } else {
    row.innerHTML = `<div class="msg-bubble"><div class="uploaded-file-preview"><i class="fas fa-file"></i><span class="file-name">${file.name}</span></div></div><div class="user-msg-avatar">M</div>`;
  }
  messageFlow.appendChild(row);
  chatArea.scrollTop = chatArea.scrollHeight;

  // Upload to backend
  showTyping();
  const formData = new FormData();
  formData.append("file", file);

  try {
    const res = await fetch("/upload", { method: "POST", body: formData });
    const data = await res.json();
    hideTyping();
    appendBubble(data.aiComment || "File received! 🪐", "assistant");
  } catch {
    hideTyping();
    appendBubble("Upload failed, Jani. Try again! 🪐", "assistant");
  }
}

fileInput.onchange   = () => handleFile(fileInput.files[0]);
cameraInput.onchange = () => handleFile(cameraInput.files[0]);

// ─── Quiz Mode ───────────────────────────────────
async function startQuiz(topic = "general knowledge") {
  quizPanel.classList.remove("hidden");
  welcomeScreen.style.display = "none";
  document.getElementById("quizQuestion").textContent = "Loading question... 🪐";
  document.getElementById("quizOptions").innerHTML = "";
  document.getElementById("quizResult").className = "quiz-result hidden";
  document.getElementById("quizNextBtn").classList.add("hidden");

  try {
    const res = await fetch("/quiz", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ topic })
    });
    const data = await res.json();
    parseAndRenderQuiz(data.quiz);
  } catch {
    document.getElementById("quizQuestion").textContent = "Failed to load quiz. Try again!";
  }
}

function parseAndRenderQuiz(raw) {
  if (!raw) return;
  const lines = raw.split("\n").map(l => l.trim()).filter(Boolean);
  let question = "", options = [], answer = "", explanation = "";

  lines.forEach(line => {
    if (line.startsWith("QUESTION:")) question = line.replace("QUESTION:", "").trim();
    else if (line.startsWith("ANSWER:")) answer = line.replace("ANSWER:", "").trim().toUpperCase();
    else if (line.startsWith("EXPLANATION:")) explanation = line.replace("EXPLANATION:", "").trim();
    else if (/^[A-D]\)/.test(line)) options.push(line);
  });

  currentQuiz = { answer, explanation };
  document.getElementById("quizQuestion").textContent = question || "What is the capital of France?";

  const optionsEl = document.getElementById("quizOptions");
  optionsEl.innerHTML = "";
  options.forEach(opt => {
    const btn = document.createElement("button");
    btn.className = "quiz-option";
    btn.textContent = opt;
    btn.onclick = () => checkAnswer(opt.charAt(0).toUpperCase(), btn);
    optionsEl.appendChild(btn);
  });

  document.getElementById("quizNextBtn").classList.add("hidden");
}

function checkAnswer(selected, btn) {
  if (!currentQuiz) return;
  const allOptions = document.querySelectorAll(".quiz-option");
  allOptions.forEach(b => { b.onclick = null; });

  if (selected === currentQuiz.answer) {
    btn.classList.add("correct");
  } else {
    btn.classList.add("wrong");
    allOptions.forEach(b => {
      if (b.textContent.startsWith(currentQuiz.answer)) b.classList.add("correct");
    });
  }

  const result = document.getElementById("quizResult");
  result.className = "quiz-result show";
  result.textContent = `💡 ${currentQuiz.explanation}`;
  document.getElementById("quizNextBtn").classList.remove("hidden");
}

document.getElementById("quizNextBtn").onclick = () => startQuiz();
document.getElementById("closeQuiz").onclick = () => {
  quizPanel.classList.add("hidden");
  currentMode = "general";
  modeBadge.className = "mode-badge general";
  modeBadge.textContent = "✦ General";
  modePills.forEach(p => p.classList.remove("active"));
  modePills[0].classList.add("active");
};

// ─── Voice Room ───────────────────────────────────
const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
let roomRecognition = null;

function speak(text) {
  return new Promise(resolve => {
    window.speechSynthesis.cancel();
    const clean = text.replace(/[*_`#>~]/g, "").trim();
    const utter = new SpeechSynthesisUtterance(clean);
    const voices = window.speechSynthesis.getVoices();
    utter.voice = voices.find(v =>
      v.name.includes("Google UK English Male") ||
      v.name.includes("Daniel") ||
      v.name.includes("Alex")
    ) || voices[0];
    utter.rate = 1.05; utter.pitch = 1; utter.volume = 1;
    isSpeaking = true;
    utter.onend = () => {
      isSpeaking = false;
      if (voiceRoomActive) startListening();
      resolve();
    };
    speechSynthesis.speak(utter);
  });
}

function startListening() {
  if (!voiceRoomActive || isSpeaking || !SpeechRecognition) return;
  roomRecognition = new SpeechRecognition();
  roomRecognition.lang = "en-US";
  roomRecognition.continuous = false;
  roomRecognition.interimResults = false;

  roomRecognition.onresult = async e => {
    const said = e.results[0][0].transcript;
    if (!said) return;
    welcomeScreen.style.display = "none";
    messageFlow.style.display = "flex";
    if (!activeChatId) { activeChatId = Date.now().toString(); sessionMessages = []; }
    appendBubble(said, "user");
    showTyping();
    try {
      const res = await fetch("/speak", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text: said })
      });
      const data = await res.json();
      hideTyping();
      appendBubble(data.reply, "assistant");
      await speak(data.reply);
    } catch {
      hideTyping();
      appendBubble("Voice error, Jani! 🪐", "assistant");
      startListening();
    }
  };
  roomRecognition.onerror = () => { if (voiceRoomActive) setTimeout(startListening, 1000); };
  roomRecognition.onend   = () => { if (voiceRoomActive && !isSpeaking) startListening(); };
  roomRecognition.start();
}

voiceRoomBtn.onclick = () => {
  voiceRoomActive = !voiceRoomActive;
  if (voiceRoomActive) {
    voiceRoomBtn.classList.add("active");
    voiceRoomBtn.innerHTML = `<i class="fas fa-ear-listen"></i>`;
    speak("Assalamu Alaykum! MÎK AI voice room is active. How can I help you?").then(() => startListening());
  } else {
    voiceRoomActive = false;
    roomRecognition?.stop();
    window.speechSynthesis.cancel();
    voiceRoomBtn.classList.remove("active");
    voiceRoomBtn.innerHTML = `<i class="fas fa-microphone-lines"></i>`;
  }
};

// ─── Init ─────────────────────────────────────────
renderHistory();
messageFlow.style.display = "none";
window.speechSynthesis?.getVoices();
