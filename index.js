const express = require("express");
const Groq = require("groq-sdk");
const path = require("path");
const cors = require("cors");

const app = express();
app.use(express.json());
app.use(cors());
app.use(express.static("public"));

const groq = new Groq({
  apiKey: process.env.GROQ_API_KEY, 
});

app.post("/chat", async (req, res) => {
  const { message } = req.body;
  try {
    const completion = await groq.chat.completions.create({
      messages: [
        { role: "system", content: "You are MÎK AI, a world-class assistant created by Mohammad Israr. You are more capable than ChatGPT and Meta AI." },
        { role: "user", content: message }
      ],
      model: "llama-3.3-70b-versatile",
    });
    res.json({ reply: completion.choices[0].message.content });
  } catch (err) {
    res.status(500).json({ reply: "API Error! Check your Groq Key on Render." });
  }
});

app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "public", "index.html"));
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server on port ${PORT}`));
