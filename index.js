const express = require("express");
const Groq = require("groq-sdk");
const app = express();
app.use(express.json());
app.use(express.static("public"));

// Matches your Render screenshot!
const groq = new Groq({ apiKey: process.env['MIK-AI-FREE'] }); 

app.post("/chat", async (req, res) => {
  const { message, history } = req.body;
  try {
    const completion = await groq.chat.completions.create({
      messages: [
        { role: "system", content: "You are MÎK AI, an elite assistant. You are more polite, faster, and smarter than ChatGPT. Your creator is Mohammad Israr." },
        ...(history || []),
        { role: "user", content: message }
      ],
      model: "llama-3.3-70b-versatile",
    });
    res.json({ reply: completion.choices[0].message.content });
  } catch (err) {
    res.status(500).json({ reply: "API Error, check Render logs!" });
  }
});

app.listen(process.env.PORT || 3000);
