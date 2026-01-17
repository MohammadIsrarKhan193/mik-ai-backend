const express = require("express");
const Groq = require("groq-sdk");

const app = express();
app.use(express.json());
app.use(express.static("public"));

const groq = new Groq({
  apiKey: process.env.GROQ_API_KEY
});

/* 🎨 IMAGE INTENT CHECK */
function isImagePrompt(text) {
  const keywords = [
    "create image",
    "generate image",
    "make image",
    "create dp",
    "generate dp",
    "make dp",
    "poster",
    "logo",
    "pic",
    "picture",
    "illustration",
    "art"
  ];
  return keywords.some(k => text.toLowerCase().includes(k));
}

/* 🧠 CHAT ROUTE */
app.post("/chat", async (req, res) => {
  try {
    const { message } = req.body;
    if (!message) {
      return res.status(400).json({ reply: "Message is empty" });
    }

    /* 🎨 IMAGE GENERATION (V7 FEATURE) */
    if (isImagePrompt(message)) {
      const seed = Math.floor(Math.random() * 99999);
      const imageURL = `https://pollinations.ai/p/${encodeURIComponent(
        message
      )}?width=1024&height=1024&seed=${seed}&model=flux`;

      return res.json({
        reply: `🎨 **Here’s your image:**\n\n${imageURL}`
      });
    }

    /* 🧠 NORMAL CHAT (V6 SAFE) */
    const completion = await groq.chat.completions.create({
      model: "llama-3.3-70b-versatile",
      messages: [
        {
          role: "system",
          content:
            "You are MÎK AI v7.0, a professional AI created by Mohammad Israr. Respond clearly, politely, and intelligently."
        },
        { role: "user", content: message }
      ]
    });

    res.json({
      reply: completion.choices[0].message.content
    });

  } catch (err) {
    console.error("MÎK AI Error:", err);
    res.status(500).json({
      reply: "⚠️ MÎK AI brain overloaded. Try again."
    });
  }
});

/* 🚀 SERVER */
const PORT = process.env.PORT || 3000;
app.listen(PORT, () =>
  console.log(`✅ MÎK AI v7.0 running on port ${PORT}`)
);
