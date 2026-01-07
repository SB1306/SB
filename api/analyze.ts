
import { GoogleGenAI, Type } from "@google/genai";

export default async function handler(req: any, res: any) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    const { videoUrl } = req.body;

    const ai = new GoogleGenAI({
      apiKey: process.env.GEMINI_API_KEY!
    });

    const response = await ai.models.generateContent({
      model: "gemini-1.5-pro",
      contents: [{
        parts: [{
          text: `
คุณคือศึกษานิเทศก์ผู้เชี่ยวชาญ
วิเคราะห์วิดีโอการสอนจาก YouTube:
${videoUrl}

ตอบกลับเป็น JSON เท่านั้น
          `
        }]
      }],
      config: {
        responseMimeType: "application/json"
      }
    });

    res.status(200).json(JSON.parse(response.text));
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: "Gemini analysis failed" });
  }
}
