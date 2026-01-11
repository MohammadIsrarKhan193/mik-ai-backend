const express = require('express');
const cors = require('cors');
const { OpenAI } = require('openai');
require('dotenv').config();

const app = express();
app.use(cors());
app.use(express.json());

const client = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

// PROFESSIONAL HOME SCREEN
app.get('/', (req, res) => {
    res.send(`
        <body style="background: #000; color: #0f0; font-family: 'Courier New', monospace; text-align: center; padding: 100px;">
            <h1 style="border: 2px solid #0f0; display: inline-block; padding: 20px;">MÎK AI PROFESSIONAL ✅</h1>
            <p style="margin-top: 20px; font-size: 1.5rem;">STATUS: <span style="color: white;">24/7 ENCRYPTED & ACTIVE</span></p>
            <p style="color: #888;">System: GPT-4o | DALL-E 3 | MÎK Ecosystem</p>
        </body>
    `);
});

// PING ROUTE FOR UPTIMEROBOT
app.get('/ping', (req, res) => res.send("System Active"));

app.post('/chat', async (req, res) => {
    try {
        const { message } = req.body;
        const input = message.toLowerCase();

        // IMAGE GENERATION
        if (input.includes("draw") || input.includes("generate image") || input.includes("make a picture")) {
            const image = await client.images.generate({
                model: "dall-e-3",
                prompt: message,
                n: 1,
                size: "1024x1024",
            });
            return res.json({ reply: "Here is your generation, Jani!", imageUrl: image.data[0].url });
        }

        // PROFESSIONAL CHAT
        const response = await client.chat.completions.create({
            model: "gpt-4o",
            messages: [
                { role: "system", content: "You are MÎK AI, a world-class assistant created by Jani. Be brilliant and professional." },
                { role: "user", content: message }
            ],
        });

        res.json({ reply: response.choices[0].message.content });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: "System overload. Check API credits!" });
    }
});

const PORT = process.env.PORT || 10000;
app.listen(PORT, () => console.log(`MÎK AI Professional Live`));
