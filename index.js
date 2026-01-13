const express = require("express");
const Groq = require("groq-sdk");
const app = express();
app.use(express.json());
app.use(express.static("public"));

// Key from your screenshot
const groq = new Groq({ apiKey: process.env['MIK-AI-FREE'] });

app.post("/chat", async (req, res) => {
  const { message } = req.body;
  try {
    const completion = await groq.chat.completions.create({
      messages: [
        { role: "system", content: "You are MÎK AI, an elite assistant created by Mohammad Israr. You use Gemini-style intelligence. Be concise, helpful, and professional." },
        { role: "user", content: message }
      ],
      model: "llama-3.3-70b-versatile",
    });
    res.json({ reply: completion.choices[0].message.content });
  } catch (err) {
    res.status(500).json({ reply: "Jani, brain is offline. Check API key!" });
  }
});

app.listen(process.env.PORT || 3000);
