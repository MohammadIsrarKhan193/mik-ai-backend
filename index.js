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

    if (!message) {
      return res.status(400).json({ error: "Message is required" });
    }

    const completion = await groq.chat.completions.create({
      model: "llama-3.3-70b-versatile",
      messages: [
        {
          role: "system",
          content:
            "You are MÎK AI v1.0, a professional AI assistant created by Mohammad Israr. Respond clearly, accurately, and politely."
        },
        { role: "user", content: message }
      ],
    });

    res.json({
      reply: completion.choices[0].message.content
    });

  } catch (err) {
    console.error("MÎK AI Error:", err);
    res.status(500).json({
      error: "MÎK AI is temporarily unavailable. Please try again."
    });
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () =>
  console.log(`✅ MÎK AI v1.0 running on port ${PORT}`)
);
