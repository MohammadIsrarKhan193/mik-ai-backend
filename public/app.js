const chatArea = document.getElementById("chatArea");
const input = document.getElementById("userInput");
const sendBtn = document.getElementById("sendBtn");
const typing = document.getElementById("typing");
const welcome = document.getElementById("welcome");
const sidebar = document.getElementById("sidebar");
const profileModal = document.getElementById("profileModal");

document.getElementById("menuBtn").onclick = () =>
  sidebar.classList.toggle("open");

document.getElementById("profileBtn").onclick = () =>
  profileModal.style.display = "flex";

function closeProfile() {
  profileModal.style.display = "none";
}

sendBtn.onclick = send;
input.addEventListener("keypress", e => {
  if (e.key === "Enter") send();
});

function send() {
  const text = input.value.trim();
  if (!text) return;

  welcome.style.display = "none";

  addMsg(text, "user");
  input.value = "";

  typing.style.display = "block";

  setTimeout(() => {
    typing.style.display = "none";
    addMsg(
      "I'm MÎK AI v12.0 💚 A step closer to a real assistant. Big upgrades ahead 🚀",
      "ai"
    );
  }, 1200);
}

function addMsg(text, type) {
  const div = document.createElement("div");
  div.className = `msg ${type}`;
  div.textContent = text;
  chatArea.appendChild(div);
  chatArea.scrollTop = chatArea.scrollHeight;
}
