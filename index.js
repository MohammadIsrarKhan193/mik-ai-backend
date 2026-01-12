const express = require("express");
const Groq = require("groq-sdk");
const cors = require("cors");
const path = require("path");

const app = express();
app.use(express.json());
app.use(cors());
app.use(express.static("public"));

// Initialize Groq with your Environment Variable
const groq = new Groq({
  apiKey: process.env.GROQ_API_KEY, 
});

app.post("/chat", async (req, res) => {
  const { message, persona, history } = req.body;

  // 1. SYSTEM PROMPT LOGIC (The "Brain" Instructions)
  let systemInstructions = "You are MÎK AI, a professional AI assistant created by MÎK CEO. You are polite, smart, and helpful.";

  if (persona === "Coding Expert") {
    systemInstructions += " You are now in Coding Mode. Provide clean, efficient code and technical explanations.";
  } else if (persona === "Religious Scholar") {
    systemInstructions += " You are now an Islamic Scholar. Answer with wisdom, reference the Quran/Hadith where appropriate, and use a kind tone.";
  } else if (persona === "News Explorer") {
    systemInstructions += " You are a News Journalist. Focus on providing factual, up-to-date information and current events.";
  }

  try {
    // 2. BUILD MESSAGES ARRAY (Including History for Memory)
    const messages = [
      { role: "system", content: systemInstructions },
      ...(history || []).map(msg => ({ role: msg.role, content: msg.content })),
      { role: "user", content: message }
    ];

    // 3. CALL GROQ API
    const chatCompletion = await groq.chat.completions.create({
      messages: messages,
      model: "llama-3.3-70b-versatile", // Using the fast, powerful Llama model
      temperature: 0.7,
      max_tokens: 1024,
    });

    const aiReply = chatCompletion.choices[0].message.content;
    res.json({ reply: aiReply });

  } catch (error) {
    console.error("Groq Error:", error);
    res.status(500).json({ 
      reply: "Jani, my brain is a bit tired. Check if the Groq API Key is set correctly in Render! ⚠️" 
    });
  }
});

// Serve the frontend
app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "public", "index.html"));
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`MÎK AI is running on port ${PORT}`);
});
