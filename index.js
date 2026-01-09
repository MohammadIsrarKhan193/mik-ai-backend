const express = require('express');
const cors = require('cors');
const { OpenAI } = require('openai');
require('dotenv').config();

const app = express();
app.use(cors());
app.use(express.json());

const client = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY, // Set this in Render Env Vars
});

app.post('/chat', async (req, res) => {
    try {
        const { message, userName } = req.body;

        const response = await client.chat.completions.create({
            model: "gpt-4o-mini", // Fast and cheap for a messenger app
            messages: [
                { 
                    role: "system", 
                    content: `You are MÎK AI, the intelligent backbone of the MÎK Messenger ecosystem. 
                    Your personality is helpful, visionary, and slightly tech-savvy. 
                    You know the user's name is ${userName || 'User'}. 
                    Always be concise and supportive.` 
                },
                { role: "user", content: message }
            ],
            temperature: 0.7, // Makes the AI more creative/natural
        });

        res.json({ reply: response.choices[0].message.content });
    } catch (error) {
        console.error("MÎK AI Error:", error);
        res.status(500).json({ error: "MÎK AI is resting right now. Try again soon!" });
    }
});

const PORT = process.env.PORT || 10000;
app.listen(PORT, () => console.log(`MÎK AI active on port ${PORT}`));
