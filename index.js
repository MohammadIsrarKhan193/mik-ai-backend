const express = require('express');
const cors = require('cors');
const { OpenAI } = require('openai');
require('dotenv').config();

const app = express();
app.use(cors());
app.use(express.json());

// 1. Setup OpenAI with your Secret Key
const client = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY,
});

// 2. THE HOME PAGE (This fixes the "Application Loading" screen)
app.get('/', (req, res) => {
    res.send(`
        <div style="font-family: sans-serif; text-align: center; padding-top: 50px;">
            <h1 style="color: #4A90E2;">MÎK AI Professional ✅</h1>
            <p>Status: <b>24/7 Active</b></p>
            <p>Engine: GPT-4o & DALL-E 3</p>
            <div style="margin-top: 20px; color: #666;">Ready to serve MÎK Messenger</div>
        </div>
    `);
});

// 3. THE AI BRAIN (Chat + Image Generation)
app.post('/chat', async (req, res) => {
    try {
        const { message, userName } = req.body;
        const lowerMsg = message.toLowerCase();

        // --- FEATURE: IMAGE GENERATION (DPS/ART) ---
        if (lowerMsg.includes("generate image") || lowerMsg.includes("draw") || lowerMsg.includes("make a picture")) {
            const imageResponse = await client.images.generate({
                model: "dall-e-3",
                prompt: message, // DALL-E 3 works best with the full user description
                n: 1,
                size: "1024x1024",
            });

            return res.json({ 
                reply: `Jani, I've generated that image for you!`,
                imageUrl: imageResponse.data[0].url 
            });
        }

        // --- FEATURE: PROFESSIONAL CHAT ---
        const chatResponse = await client.chat.completions.create({
            model: "gpt-4o", // The pro model
            messages: [
                { 
                    role: "system", 
                    content: `You are MÎK AI, a world-class AI assistant. 
                    Your creator is Jani. You are brilliant, kind, and professional.
                    If the user is ${userName || 'User'}, greet them warmly. 
                    You can generate images if asked.` 
                },
                { role: "user", content: message }
            ],
        });

        res.json({ reply: chatResponse.choices[0].message.content });

    } catch (error) {
        console.error("Error:", error);
        res.status(500).json({ reply: "MÎK AI is updating its brain. Try again in a moment!" });
    }
});

// 4. PING ROUTE (For UptimeRobot)
app.get('/ping', (req, res) => res.send("Awake"));

const PORT = process.env.PORT || 10000;
app.listen(PORT, () => console.log(`MÎK AI is running on port ${PORT}`));
