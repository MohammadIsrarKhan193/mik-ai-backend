const express = require("express");
const Groq = require("groq-sdk");
const cors = require("cors");
const fs = require("fs");
const path = require("path");
require("dotenv").config();

const app = express();
app.use(cors());
app.use(express.json());
app.use(express.static("public"));

// Memory Helper (Built-in so you don't need a separate file)
const memoryPath = path.join(__dirname, "memory.json");
function getMemory(userId) {
    if (!fs.existsSync(memoryPath)) return [];
    const data = JSON.parse(fs.readFileSync(memoryPath));
    return data[userId] || [];
}
function addMemory(userId, role, content) {
    let data = {};
    if (fs.existsSync(memoryPath)) data = JSON.parse(fs.readFileSync(memoryPath));
    if (!data[userId]) data[userId] = [];
    data[userId].push({ role, content });
    if (data[userId].length > 10) data[userId].shift();
    fs.writeFileSync(memoryPath, JSON.stringify(data));
}

const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

app.post("/chat", async (req, res) => {
  try {
    const { message, userId } = req.body;
    const id = userId || "Mohammad Israr";
    const history = getMemory(id);

    const completion = await groq.chat.completions.create({
      model: "llama-3.3-70b-versatile",
      messages: [
        { role: "system", content: "You are MÎK AI, a professional brand assistant created by Mohammad Israr." },
        ...history,
        { role: "user", content: message }
      ]
    });

    const reply = completion.choices[0].message.content;
    addMemory(id, "user", message);
    addMemory(id, "assistant", reply);
    res.json({ reply });
  } catch (error) {
    console.error(error);
    res.status(500).json({ reply: "⚠️ Brain connection error. Check your API Key in Render Environment Variables!" });
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`🚀 MÎK AI Brand Online on port ${PORT}`));
