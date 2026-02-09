const chatFlow = document.getElementById("chat-flow");
const userInput = document.getElementById("userInput");
const sendBtn = document.getElementById("sendBtn");
const mainSidebar = document.getElementById('mainSidebar');
const settingsOverlay = document.getElementById('settingsOverlay');

// --- 🧭 NAVIGATION ---
document.getElementById('sidebarToggle').onclick = () => mainSidebar.classList.add('open');
document.getElementById('sidebarClose').onclick = () => mainSidebar.classList.remove('open');

// NEW CHAT (Top Right Button)
document.getElementById('headerNewChat').onclick = () => {
    if(confirm("Fresh chat, Jani?")) {
        chatFlow.innerHTML = `<div class="welcome-screen"><div class="big-logo">MÎK</div><h1>MÎK AI Refreshed</h1></div>`;
    }
};

// SETTINGS CONTROL
document.getElementById('navSettings').onclick = () => {
    settingsOverlay.style.display = 'flex';
    mainSidebar.classList.remove('open');
};
document.getElementById('closeSettings').onclick = () => settingsOverlay.style.display = 'none';

// HISTORY
document.getElementById('navHistory').onclick = () => {
    alert("History is being synced to your MÎK account...");
    mainSidebar.classList.remove('open');
};

// --- 💬 CORE SEND LOGIC ---
async function send() {
    let val = userInput.value.trim();
    if (!val) return;
    
    document.querySelector(".welcome-screen")?.remove();
    // Add User Message
    const uMsg = document.createElement("div");
    uMsg.className = "msg user";
    uMsg.textContent = val;
    chatFlow.appendChild(uMsg);
    
    userInput.value = "";
    chatFlow.scrollTop = chatFlow.scrollHeight;

    try {
        const model = document.getElementById('modelSelect').value;
        const res = await fetch("/chat", { 
            method: "POST", 
            headers: { "Content-Type": "application/json" }, 
            body: JSON.stringify({ message: val, model: model }) 
        });
        const data = await res.json();
        
        // Add AI Message (Simplified for now)
        const aMsg = document.createElement("div");
        aMsg.className = "msg ai";
        aMsg.innerHTML = `<div class="ai-ico"></div><div class="txt">${marked.parse(data.reply)}</div>`;
        chatFlow.appendChild(aMsg);
        chatFlow.scrollTop = chatFlow.scrollHeight;
    } catch (e) {
        console.error(e);
    }
}

sendBtn.onclick = send;
userInput.onkeydown = (e) => e.key === "Enter" && send();

