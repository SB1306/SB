
import { GoogleGenerativeAI } from "@google/generative-ai";

export default async function handler(req: any, res: any) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    const { videoUrl } = req.body;

    const ai = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);
    
    const model = ai.getGenerativeModel({ 
      model: "gemini-1.5-pro",
      generationConfig: {
        responseMimeType: "application/json"
      }
    });

    const result = await model.generateContent(`
คุณคือศึกษานิเทศก์ผู้เชี่ยวชาญ
วิเคราะห์วิดีโอการสอนจาก YouTube:
${videoUrl}

ตอบกลับเป็น JSON เท่านั้น
    `);

    const response = result.response;
    res.status(200).json(JSON.parse(response.text()));
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: "Gemini analysis failed" });
  }
}
