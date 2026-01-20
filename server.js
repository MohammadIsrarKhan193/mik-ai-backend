import express from "express";
import fetch from "node-fetch";
import cors from "cors";

const app = express();
app.use(cors());
app.use(express.json());

const GROQ_API_KEY = "PASTE_YOUR_GROQ_KEY_HERE";

app.post("/chat", async (req, res) => {
  const userMsg = req.body.message;

  try {
    const response = await fetch(
      "https://api.groq.com/openai/v1/chat/completions",
      {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${GROQ_API_KEY}`,
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          model: "llama3-8b-8192",
          messages: [
            { role: "system", content: "You are MÎK AI, smart, calm, helpful." },
            { role: "user", content: userMsg }
          ]
        })
      }
    );

    const data = await response.json();
    res.json({ reply: data.choices[0].message.content });

  } catch (err) {
    res.status(500).json({ reply: "Brain overload 😵 Try again." });
  }
});

app.listen(3000, () => console.log("🧠 MÎK AI brain running on port 3000"));
