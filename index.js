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
    const { messages } = req.body;

    const completion = await groq.chat.completions.create({
      model: "llama-3.3-70b-versatile",
      messages: [
        {
          role: "system",
          content:
            "You are MÎK AI, a helpful, smart assistant created by Mohammad Israr Khan (MÎK). Be friendly, clear, and intelligent."
        },
        ...messages
      ]
    });

    res.json({
      reply: completion.choices[0].message.content
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ reply: "Brain overload 😵 Try again." });
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () =>
  console.log("✅ MÎK AI v14 running on port " + PORT)
);
