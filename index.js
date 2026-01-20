const express = require("express");
const Groq = require("groq-sdk");
const app = express();

app.use(express.json());
app.use(express.static("public"));

const groq = new Groq({
  apiKey: process.env.GROQ_API_KEY
});

app.post("/chat", async (req, res) => {
  try {
    const { message } = req.body;
    if (!message) return res.json({ reply: "Say something, Jani 🙂" });

    const lower = message.toLowerCase();

    // 🎨 IMAGE GENERATION (ChatGPT-style)
    if (
      lower.includes("create") ||
      lower.includes("generate") ||
      lower.includes("make") ||
      lower.includes("logo") ||
      lower.includes("image") ||
      lower.includes("dp")
    ) {
      const seed = Math.floor(Math.random() * 100000);
      const imageUrl = `https://pollinations.ai/p/${encodeURIComponent(
        message
      )}?width=1024&height=1024&seed=${seed}&model=flux`;

      return res.json({
        type: "image",
        prompt: message,
        image: imageUrl
      });
    }

    // 💬 TEXT CHAT
    const completion = await groq.chat.completions.create({
      model: "llama-3.3-70b-versatile",
      messages: [
        {
          role: "system",
          content:
            "You are MÎK AI, a professional, friendly assistant created by Mohammad Israr. Keep replies clear and helpful."
        },
        { role: "user", content: message }
      ]
    });

    res.json({
      type: "text",
      reply: completion.choices[0].message.content
    });

  } catch (err) {
    console.error(err);
    res.json({ reply: "Brain overload 😵 Try again." });
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () =>
  console.log("MÎK AI V18.0 running 🚀")
);
