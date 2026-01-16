const chat = document.getElementById("chat");
const input = document.getElementById("input");
const welcome = document.getElementById("welcome");

function addMessage(text, type) {
  const div = document.createElement("div");
  div.className = `msg ${type}`;
  div.innerText = text;
  chat.appendChild(div);
  chat.scrollTop = chat.scrollHeight;
}

async function send() {
  const text = input.value.trim();
  if (!text) return;

  welcome.style.display = "none";

  addMessage(text, "user");
  input.value = "";

  const thinking = document.createElement("div");
  thinking.className = "msg ai thinking";
  thinking.innerText = "MÎK AI is thinking…";
  chat.appendChild(thinking);

  try {
    const res = await fetch("/chat", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ message: text })
    });

    const data = await res.json();
    thinking.remove();
    addMessage(data.reply || data.error, "ai");

  } catch {
    thinking.remove();
    addMessage("Connection error.", "ai");
  }
}
