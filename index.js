const express = require("express");
const cors = require("cors");
const { OpenAI } = require("openai");
require("dotenv").config();
const path = require("path");

const app = express();
app.use(cors());
app.use(express.json());

// Serve frontend
app.use(express.static(path.join(__dirname, "public")));

const client = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

// HOME
app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "public", "index.html"));
});

// CHAT API
app.post("/chat", async (req, res) => {
  try {
    const message = req.body.message;
    const lower = message.toLowerCase();

    // IMAGE GENERATION
    if (
      lower.includes("draw") ||
      lower.includes("generate") ||
      lower.includes("image") ||
      lower.includes("picture")
    ) {
      const seed = Math.floor(Math.random() * 100000);
      const imageUrl = `https://pollinations.ai/p/${encodeURIComponent(
        message
      )}?width=1024&height=1024&seed=${seed}&model=flux`;

      return res.json({
        type: "image",
        text: "✨ Here is your image, Jani",
        image: imageUrl,
      });
    }

    // TEXT CHAT
    const response = await client.chat.completions.create({
      model: "gpt-4o",
      messages: [
        {
          role: "system",
          content:
            "You are MÎK AI, a futuristic, professional assistant created by Jani. Respond clearly and intelligently.",
        },
        { role: "user", content: message },
      ],
    });

    res.json({
      type: "text",
      reply: response.choices[0].message.content,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({
      type: "text",
      reply: "⚠️ Server busy. Try again later.",
    });
  }
});

const PORT = process.env.PORT || 10000;
app.listen(PORT, () =>
  console.log(`🚀 MÎK AI Backend Live on port ${PORT}`)
);
