const chatFlow = document.getElementById("chat-flow");
const userInput = document.getElementById("userInput");
const sendBtn = document.getElementById("sendBtn");
const voiceBtn = document.getElementById("voiceBtn");
const mainSidebar = document.getElementById('mainSidebar');
const settingsPanel = document.getElementById('settings-panel');

// --- 🚀 NAVIGATION LOGIC ---
document.getElementById('sidebarToggle').onclick = () => mainSidebar.classList.add('open');
document.getElementById('sidebarClose').onclick = () => mainSidebar.classList.remove('open');

// NEW CHAT FUNCTION (Both Sidebar and Header)
const resetChat = () => {
    chatFlow.innerHTML = `<div class="welcome-screen"><div class="big-logo">MÎK</div><h1>Welcome, Israr Jani</h1><p>MÎK AI is refreshed and ready.</p></div>`;
    mainSidebar.classList.remove('open');
    window.speechSynthesis.cancel();
};
document.getElementById('headerNewChat').onclick = resetChat;

// SETTINGS & HISTORY ACTIONS
document.getElementById('navSettings').onclick = () => {
    settingsPanel.style.display = 'flex';
    mainSidebar.classList.remove('open');
};
document.querySelector('.close-panel-btn').onclick = () => settingsPanel.style.display = 'none';

document.getElementById('navHistory').onclick = () => {
    alert("History feature coming in v2.0 Jani! For now, your chats are local.");
    mainSidebar.classList.remove('open');
};

// --- 🤖 TYPING & MESSAGING ---
function showTyping() {
    const div = document.createElement("div");
    div.id = "typing-indicator";
    div.className = "msg ai";
    div.innerHTML = `<div class="ai-ico"></div><div class="typing"><span></span><span></span><span></span></div>`;
    chatFlow.appendChild(div);
    chatFlow.scrollTop = chatFlow.scrollHeight;
}

function removeTyping() {
    const indicator = document.getElementById("typing-indicator");
    if (indicator) indicator.remove();
}

async function send() {
    let val = userInput.value.trim();
    if (!val) return;
    
    document.querySelector(".welcome-screen")?.remove();
    addMsg(val, "user");
    userInput.value = "";
    showTyping();
    
    // Get selected model from settings
    const selectedModel = document.getElementById('modelSelect').value;

    try {
        const res = await fetch("/chat", { 
            method: "POST", 
            headers: { "Content-Type": "application/json" }, 
            body: JSON.stringify({ 
                message: val, 
                userId: "Israr",
                model: selectedModel // Send model choice to backend
            }) 
        });
        const data = await res.json();
        removeTyping();
        addMsg(data.reply, "ai");
    } catch { 
        removeTyping();
        addMsg("Server busy Jani, try again!", "ai"); 
    }
}

// ... (keep the rest of your Speak, AddMsg, and Voice logic from previous step)
sendBtn.onclick = send;
userInput.onkeydown = (e) => e.key === "Enter" && send();
