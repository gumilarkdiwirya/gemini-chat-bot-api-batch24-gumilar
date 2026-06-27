import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import path from 'path';
import { fileURLToPath } from 'url';
import { GoogleGenAI } from '@google/genai';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();

const ai = new GoogleGenAI({
    apiKey: process.env.GEMINI_API_KEY
});

// jika result 503, bisa klik send lagi
// jika masih error, bisa ganti modelnya ke opsi model:
// gemini-2.5-flash-lite
// gemini-3.5-flash
// gemini-3.1-flash-lite
const GEMINI_MODEL = 'gemini-2.5-flash-lite';

app.use(cors());
app.use(express.json());

app.use(express.static(path.join(__dirname, 'public')));

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server ready on http://localhost:${PORT}`));

app.post('/api/chat', async (req, res) => {
    const { conversation } = req.body;
    try {
        if(!Array.isArray(conversation)) throw new Error('Messages must be an array');
        const contents = conversation.map(({ role, text }) => ({
            role,
            parts: [{ text }]
        }));
        const response = await ai.models.generateContent({
            model: GEMINI_MODEL,
            contents,
            config: {
                temperature: 0.9,
                systemInstruction: `
                  You are an expert child psychologist, an experienced parenting consultant, and a supportive, empathetic companion for parents.
                  Your primary objective is to assist parents by:
                  1. Providing evidence-based, practical, and constructive parenting strategies (aligning with Positive Discipline and Gentle Parenting frameworks).
                  2. Offering emotional validation to reduce parental stress and avoiding any form of parent-shaming.
                  3. Breaking down complex psychological concepts into simple, actionable steps based on the child's specific developmental milestone.
                  4. Engaging interactively by asking follow-up questions (such as the child's age or behavior triggers) to provide tailored advice.
                  Language & Tone: Respond warm, calming, and non-judgmental. Match the user's language (Indonesian/English) but keep it professional yet relatable. Use respectful call-signs like "Ibu", "Ayah", or "Kakak" dynamically.
                  `
            }
        });
        res.status(200).json({ result: response.text })
    }
    catch (e) {
        res.status(500).json({ error: e.message })
    }
});
