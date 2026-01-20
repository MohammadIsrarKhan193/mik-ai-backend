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
    if (!message) return res.json({ reply: "Say something Jani 😊" });

    const completion = await groq.chat.completions.create({
      messages: [
        { role: "system", content: "You are MÎK AI, created by Mohammad Israr." },
        { role: "user", content: message }
      ],
      model: "llama-3.3-70b-versatile"
    });

    res.json({ reply: completion.choices[0].message.content });

  } catch (err) {
    console.error("AI ERROR:", err);
    res.status(500).json({ reply: "Brain busy 🧠 Try again." });
  }
});

app.listen(process.env.PORT || 3000, () =>
  console.log("MÎK AI backend running")
);
