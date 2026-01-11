const express = require("express");
const cors = require("cors");
const { OpenAI } = require("openai");
require("dotenv").config();

const app = express();

app.use(cors());
app.use(express.json());

// ✅ SERVE FRONTEND
app.use(express.static("public"));

const client = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

// ✅ PING (for UptimeRobot)
app.get("/ping", (req, res) => {
  res.send("MÎK AI is Alive ✅");
});

// ✅ CHAT API
app.post("/chat", async (req, res) => {
  try {
    const { message } = req.body;

    if (!message) {
      return res.json({ reply: "Say something, Jani 🙂" });
    }

    const response = await client.responses.create({
      model: "gpt-4o-mini",
      input: message,
    });

    res.json({
      reply: response.output_text,
    });

  } catch (err) {
    console.error(err);
    res.status(500).json({
      reply: "⚠️ AI is tired. Check API credits.",
    });
  }
});

// ✅ RENDER PORT FIX
const PORT = process.env.PORT || 10000;
app.listen(PORT, () => {
  console.log(`🚀 MÎK AI running on port ${PORT}`);
});
