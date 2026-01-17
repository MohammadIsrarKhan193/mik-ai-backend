const express = require("express");
const Groq = require("groq-sdk");
const cors = require("cors");
const { getMemory, addMemory } = require("./memory");

const app = express();
app.use(cors());
app.use(express.json());
app.use(express.static("public"));

const groq = new Groq({
  apiKey: process.env["GROQ_API_KEY"]
});

// Health check
app.get("/ping", (req, res) => res.send("MÎK AI v10.0 Active"));

app.post("/chat", async (req, res) => {
  try {
    const { message } = req.body;
    if (!message) return res.json({ reply: "Say something, Jani 😊" });

    // User ID (later will be auth-based)
    const userId = "mik";

    // Load memory
    const memory = getMemory(userId);

    // Save memory triggers
    if (
      message.toLowerCase().includes("my name is") ||
      message.toLowerCase().includes("remember that") ||
      message.toLowerCase().includes("i am")
    ) {
      addMemory(message, userId);
    }

    const completion = await groq.chat.completions.create({
      model: "llama-3.3-70b-versatile",
      messages: [
        {
          role: "system",
          content: `
You are MÎK AI v10.0.
You have MEMORY.
Here is what you remember about the user:
${memory.join("\n") || "No memory yet."}

Behave like ChatGPT.
Be friendly, professional, and intelligent.
`
        },
        { role: "user", content: message }
      ]
    });

    res.json({ reply: completion.choices[0].message.content });

  } catch (err) {
    console.error(err);
    res.json({ reply: "⚠️ Brain overload, try again!" });
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () =>
  console.log(`🚀 MÎK AI v10.0 running on port ${PORT}`)
);
