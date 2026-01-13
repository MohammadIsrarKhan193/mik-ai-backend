const express = require("express");
const Groq = require("groq-sdk");
const app = express();
app.use(express.json());
app.use(express.static("public"));

const groq = new Groq({ apiKey: process.env['MIK-AI-FREE'] });

app.post("/chat", async (req, res) => {
  const { message } = req.body;
  const lowerMsg = message.toLowerCase();

  // IMAGE GENERATION
  if (lowerMsg.includes("create") || lowerMsg.includes("generate") || lowerMsg.includes("dp") || lowerMsg.includes("pic")) {
    const seed = Math.floor(Math.random() * 10000);
    const imageUrl = `https://pollinations.ai/p/${encodeURIComponent(message)}?width=1024&height=1024&seed=${seed}&model=flux`;
    return res.json({ reply: `Jani, I have generated this for you: \n\n ![Image](${imageUrl})` });
  }

  try {
    const completion = await groq.chat.completions.create({
      messages: [
        { 
          role: "system", 
          content: "You are MÎK AI, a visionary intelligence created by Mohammad Israr. You are professional, helpful, and very fast. If someone asks about MÎK, explain it is a cutting-edge tech firm founded by Mohammad Israr." 
        },
        { role: "user", content: message }
      ],
      model: "llama-3.3-70b-versatile",
    });
    res.json({ reply: completion.choices[0].message.content });
  } catch (err) {
    res.status(500).json({ reply: "Jani, API limit reached or key missing!" });
  }
});

app.listen(process.env.PORT || 3000);
