import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import CODEDTECHS_CONTEXT from "./context/codedtechs.context.js";


dotenv.config();

const app = express();

app.use(cors());
app.use(express.json());

const HF_MODEL_URL = "https://api-inference.huggingface.co/models/mistralai/Mistral-7B-Instruct-v0.2";

app.post("/chat", async (req, res) => {
  const userMessage = req.body.message;

  if (!userMessage) {
    return res.status(400).json({ error: "Message is required" });
  }

  const prompt = `
${CODEDTECHS_CONTEXT}

User Question:
${userMessage}

Answer as CodedTechs AI:
`;

  try {
    const response = await fetch(HF_MODEL_URL, {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${process.env.HF_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        inputs: prompt,
        parameters: {
          max_new_tokens: 300,
          temperature: 0.2,
        },
      }),
    });

    const data = await response.json();

    res.json({
      reply: data[0].generated_text,
    });

  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Inference failed" });
  }
});

app.listen(3000, () => {
  console.log("🚀 Backend running at http://localhost:3000");
});
