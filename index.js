const express = require("express");
const cors = require("cors");
const { OpenAI } = require("openai");
require("dotenv").config();

const app = express();

// MIDDLEWARE
app.use(cors());
app.use(express.json());

// SERVE FRONTEND
app.use(express.static("public"));

// OPENAI CLIENT
const client = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

// HOME STATUS (OPTIONAL)
app.get("/status", (req, res) => {
  res.json({
    name: "MÎK AI",
    status: "ONLINE",
    uptime: "24/7",
  });
});

// CHAT API
app.post("/chat", async (req, res) => {
  try {
    const { message } = req.body;

    if (!message) {
      return res.status(400).json({ reply: "Message is required" });
    }

    // IMAGE GENERATION
    const lower = message.toLowerCase();
    if (
      lower.includes("draw") ||
      lower.includes("generate image") ||
      lower.includes("make a picture")
    ) {
      const image = await client.images.generate({
        model: "dall-e-3",
        prompt: message,
        size: "1024x1024",
      });

      return res.json({
        reply: "Here is your image, Jani ✨",
        imageUrl: image.data[0].url,
      });
    }

    // CHAT RESPONSE
    const response = await client.chat.completions.create({
      model: "gpt-4o",
      messages: [
        {
          role: "system",
          content:
            "You are MÎK AI, a powerful, professional, friendly assistant created by Jani.",
        },
        { role: "user", content: message },
      ],
    });

    res.json({
      reply: response.choices[0].message.content,
    });
  } catch (error) {
    console.error("AI ERROR:", error);
    res.status(500).json({
      reply: "MÎK AI is overloaded. Try again later.",
    });
  }
});

// PORT (RENDER SAFE)
const PORT = process.env.PORT || 10000;
app.listen(PORT, () => {
  console.log(`🚀 MÎK AI running on port ${PORT}`);
});
