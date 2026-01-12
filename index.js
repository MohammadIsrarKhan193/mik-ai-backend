const express = require("express");
const Groq = require("groq-sdk");
const cors = require("cors");

const app = express();
app.use(express.json());
app.use(cors());
app.use(express.static("public"));

const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

app.post("/chat", async (req, res) => {
  const { message, persona, history } = req.body;

  // 🛠️ SET PERSONALITY
  let systemPrompt = `You are MÎK AI, a world-class assistant created by Mohammad Israr Khan (MÎK CEO). Current Mode: ${persona}. `;
  
  if (persona === "Coding Expert") systemPrompt += "Provide professional code, debugging tips, and technical logic.";
  if (persona === "Religious Scholar") systemPrompt += "Provide wisdom based on Islamic teachings with a kind and humble tone.";

  try {
    const completion = await groq.chat.completions.create({
      messages: [
        { role: "system", content: systemPrompt },
        ...(history || []) // This is the Long-Term Memory!
      ],
      model: "llama-3.3-70b-versatile",
    });

    res.json({ reply: completion.choices[0].message.content });
  } catch (err) {
    console.error(err);
    res.status(500).json({ reply: "Jani, my brain is lagging. Check Groq API!" });
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`MÎK AI Live on ${PORT}`));
