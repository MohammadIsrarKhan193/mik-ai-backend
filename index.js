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
    const { message, history } = req.body;

    if (!message) return res.json({ reply: "Say something 🙂" });

    const lower = message.toLowerCase();

    // 🎨 Image generation
    if (
      lower.includes("image") ||
      lower.includes("logo") ||
      lower.includes("generate") ||
      lower.includes("create")
    ) {
      const seed = Math.floor(Math.random() * 100000);
      return res.json({
        type: "image",
        image: `https://pollinations.ai/p/${encodeURIComponent(
          message
        )}?width=1024&height=1024&seed=${seed}`
      });
    }

    const messages = [
      { role: "system", content: "You are MÎK AI, created by Mohammad Israr." },
      ...(history || []),
      { role: "user", content: message }
    ];

    const completion = await groq.chat.completions.create({
      model: "llama-3.3-70b-versatile",
      messages
    });

    res.json({
      type: "text",
      reply: completion.choices[0].message.content
    });

  } catch (err) {
    res.json({ reply: "Brain overload 😵 Try again." });
  }
});

app.listen(3000, () => console.log("MÎK AI running 🚀"));
