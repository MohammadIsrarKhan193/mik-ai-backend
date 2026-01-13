const express = require("express");
const Groq = require("groq-sdk");
const app = express();
app.use(express.json());
app.use(express.static("public"));

const groq = new Groq({ apiKey: process.env['MIK-AI-FREE'] });

app.post("/chat", async (req, res) => {
  const { message } = req.body;
  const lowerMsg = message.toLowerCase();

  // 🎨 FIXED IMAGE GENERATION LOGIC
  if (lowerMsg.includes("create") || lowerMsg.includes("generate") || lowerMsg.includes("dp") || lowerMsg.includes("pic")) {
    const seed = Math.floor(Math.random() * 99999);
    const imageUrl = `https://pollinations.ai/p/${encodeURIComponent(message)}?width=1024&height=1024&seed=${seed}&model=flux`;
    
    // Return structured data instead of just text
    return res.json({ 
      type: "image", 
      text: "Jani, your MÎK AI has generated this masterpiece for you: ✨", 
      image: imageUrl 
    });
  }

  try {
    const completion = await groq.chat.completions.create({
      messages: [
        { role: "system", content: "You are MÎK AI, an elite intelligence created by Mohammad Israr. You are professional and helpful." },
        { role: "user", content: message }
      ],
      model: "llama-3.3-70b-versatile",
    });
    res.json({ type: "text", reply: completion.choices[0].message.content });
  } catch (err) {
    res.status(500).json({ type: "text", reply: "API Key error, Jani!" });
  }
});

app.listen(process.env.PORT || 3000);
