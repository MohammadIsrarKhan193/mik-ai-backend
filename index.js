const express = require("express");
const Groq = require("groq-sdk");
const fs = require("fs");

const app = express();
app.use(express.json());
app.use(express.static("public"));

const groq = new Groq({
  apiKey: process.env.GROQ_API_KEY
});

// 📦 Load memory
let memory = JSON.parse(fs.readFileSync("memory.json", "utf8"));

app.post("/chat", async (req, res) => {
  try {
    const { message } = req.body;
    if (!message) return res.json({ reply: "Say something, Jani 🙂" });

    // 🧠 NAME MEMORY
    if (message.toLowerCase().includes("my name is")) {
      memory.name = message.split("is")[1].trim();
      fs.writeFileSync("memory.json", JSON.stringify(memory, null, 2));
      return res.json({ reply: `Got it ❤️ I'll remember your name: ${memory.name}` });
    }

    const systemPrompt = `
You are MÎK AI.
User name: ${memory.name || "Unknown"}
Always remember the user's name and use it naturally.
`;

    const completion = await groq.chat.completions.create({
      model: "llama-3.3-70b-versatile",
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: message }
      ]
    });

    res.json({ reply: completion.choices[0].message.content });

  } catch (err) {
    console.error(err);
    res.json({ reply: "Brain tired 🧠⚡" });
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log("MÎK AI v5.0 running 🚀"));
