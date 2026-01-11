const express = require("express");
const cors = require("cors");
const { OpenAI } = require("openai");
require("dotenv").config();

const app = express();
app.use(cors());
app.use(express.json());
app.use(express.static("public"));

const client = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

// ✅ Home Route for UptimeRobot
app.get("/ping", (req, res) => res.send("MÎK AI is Alive ✅"));

// ✅ Professional Chat & Image API
app.post("/chat", async (req, res) => {
  try {
    const { message } = req.body;
    if (!message) return res.json({ reply: "Say something, Jani 🙂" });

    // Detect if user wants an image
    if (message.toLowerCase().includes("draw") || message.toLowerCase().includes("generate image")) {
        const image = await client.images.generate({
            model: "dall-e-3",
            prompt: message,
            n: 1,
            size: "1024x1024",
        });
        return res.json({ reply: "Here is your image, Jani!", imageUrl: image.data[0].url });
    }

    // Standard GPT-4o-mini Chat
    const response = await client.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
          { role: "system", content: "You are MÎK AI, a professional assistant created by Jani. You are smart, helpful, and polite." },
          { role: "user", content: message }
      ],
    });

    res.json({ reply: response.choices[0].message.content });

  } catch (err) {
    console.error(err);
    res.status(500).json({ reply: "⚠️ Error: Please check if you have $5 credits in OpenAI Billing!" });
  }
});

const PORT = process.env.PORT || 10000;
app.listen(PORT, () => console.log(`🚀 MÎK AI Live on port ${PORT}`));
