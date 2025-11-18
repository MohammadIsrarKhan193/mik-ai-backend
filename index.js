import express from "express";
import OpenAI from "openai";
import dotenv from "dotenv";
import cors from "cors";

dotenv.config();

const app = express();
app.use(express.json());
app.use(cors());

const client = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

app.get("/", (req, res) => {
  res.send("MÎK AI Backend is Running 🚀");
});

app.post("/chat", async (req, res) => {
  try {
    const { message } = req.body;

    const response = await client.responses.create({
      model: "gpt-4o-mini",
      input: message,
    });

    res.json({ reply: response.output_text });

  } catch (error) {
    console.error("AI Error:", error);
    res.status(500).json({ error: "AI Backend Error" });
  }
});

app.listen(3000, () => {
  console.log("MÎK AI Server Running on port 3000 🌐");
});
