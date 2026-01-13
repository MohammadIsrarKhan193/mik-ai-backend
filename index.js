const express = require("express");
const Groq = require("groq-sdk");
const app = express();
app.use(express.json());
app.use(express.static("public"));

const groq = new Groq({ apiKey: process.env['MIK-AI-FREE'] }); // Your specific key

app.post("/chat", async (req, res) => {
  const { message } = req.body;
  const lowerMsg = message.toLowerCase();

  // Trigger for Images/DP
  if (lowerMsg.includes("create") || lowerMsg.includes("generate") || lowerMsg.includes("dp")) {
    const imageUrl = `https://pollinations.ai/p/${encodeURIComponent(message)}?width=1024&height=1024&model=flux`;
    return res.json({ reply: `Jani, here is your generated image: \n\n ![Generated Image](${imageUrl})` });
  }

  try {
    const completion = await groq.chat.completions.create({
      messages: [
        { role: "system", content: "You are MÎK AI, a world-class assistant like Gemini. Your creator is Mohammad Israr. You can solve coding, math, and analyze files with genius speed." },
        { role: "user", content: message }
      ],
      model: "llama-3.3-70b-versatile",
    });
    res.json({ reply: completion.choices[0].message.content });
  } catch (err) {
    res.status(500).json({ reply: "API Error, Jani! Check Render Environment Variables." });
  }
});

app.listen(process.env.PORT || 3000);
