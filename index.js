const express = require("express");
const Groq = require("groq-sdk");
const app = express();
app.use(express.json());
app.use(express.static("public"));

const groq = new Groq({ apiKey: process.env['MIK-AI-FREE'] });

app.post("/chat", async (req, res) => {
  const { message } = req.body;
  const lowerMsg = message.toLowerCase();

  // IMAGE GENERATION TRIGGER
  if (lowerMsg.includes("create") || lowerMsg.includes("generate") || lowerMsg.includes("dp") || lowerMsg.includes("pic")) {
    const prompt = encodeURIComponent(message);
    // Flux model for high quality
    const imageUrl = `https://pollinations.ai/p/${prompt}?width=1024&height=1024&seed=${Math.floor(Math.random() * 1000)}&model=flux`;
    return res.json({ reply: imageUrl, isImage: true });
  }

  try {
    const completion = await groq.chat.completions.create({
      messages: [
        { role: "system", content: "You are MÎK AI, a genius assistant created by Mohammad Israr. You can solve math, coding, and provide expert advice." },
        { role: "user", content: message }
      ],
      model: "llama-3.3-70b-versatile",
    });
    res.json({ reply: completion.choices[0].message.content, isImage: false });
  } catch (err) {
    res.status(500).json({ reply: "Jani, API limit reached or key error!" });
  }
});

app.listen(process.env.PORT || 3000);
