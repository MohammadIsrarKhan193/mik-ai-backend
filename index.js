const express = require("express");
const Groq = require("groq-sdk");
const app = express();
app.use(express.json());
app.use(express.static("public"));

// Use your specific key from the screenshot
const groq = new Groq({ apiKey: process.env['MIK-AI-FREE'] });

app.post("/chat", async (req, res) => {
  const { message } = req.body;
  const lowerMsg = message.toLowerCase();

  // IMAGE GENERATION LOGIC
  if (lowerMsg.includes("create") || lowerMsg.includes("generate") || lowerMsg.includes("photo") || lowerMsg.includes("dp")) {
    const prompt = encodeURIComponent(message);
    // Using a high-quality free image generator API
    const imageUrl = `https://pollinations.ai/p/${prompt}?width=1024&height=1024&seed=42&model=flux`;
    return res.json({ reply: imageUrl, isImage: true });
  }

  // REGULAR CHAT LOGIC
  try {
    const completion = await groq.chat.completions.create({
      messages: [
        { role: "system", content: "You are MÎK AI, created by Mohammad Israr. You are an elite AI." },
        { role: "user", content: message }
      ],
      model: "llama-3.3-70b-versatile",
    });
    res.json({ reply: completion.choices[0].message.content, isImage: false });
  } catch (err) {
    res.status(500).json({ reply: "Jani, check your Groq API key!" });
  }
});

app.listen(process.env.PORT || 3000);
