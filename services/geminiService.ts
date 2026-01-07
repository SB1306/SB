
import { GoogleGenAI, Type } from "@google/genai";
import { ObservationResult, GroundingSource } from "../types";

export const analyzeTeachingVideo = async (videoUrl: string): Promise<ObservationResult> => {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY || "" });
  const model = "gemini-3-pro-preview";
  
  const prompt = `คุณคือผู้เชี่ยวชาญด้านการนิเทศการเรียนการสอน (Educational Supervisor) 
  ภารกิจ: วิเคราะห์คลิปวิดีโอการสอนจากลิงก์นี้: ${videoUrl}
  
  คำสั่งสำคัญ:
  1. ใช้เครื่องมือ Google Search เพื่อตรวจสอบข้อมูลจริงของวิดีโอ (ชื่อคลิป, คำอธิบาย, ผู้สอน, เนื้อหาที่สอน) เพื่อป้องกันการคาดเดาผิดพลาด
  2. หากไม่สามารถเข้าถึงข้อมูลของวิดีโอนี้ได้ ให้ตอบกลับโดยระบุว่า "ไม่พบข้อมูลเนื้อหาในวิดีโอนี้" ในส่วน overview และไม่ต้องวิเคราะห์ส่วนที่เหลือ
  3. วิเคราะห์ภาพรวม พฤติกรรมครู/นักเรียน การจัด Active Learning การตั้งคำถาม สื่อการสอน การวัดผล และสรุปความรู้
  4. ให้ความสำคัญกับความถูกต้องของเนื้อหาตามที่ปรากฏในวิดีโอจริงเท่านั้น
  
  ตอบกลับเป็น JSON ตาม Schema นี้เท่านั้น`;

  const response = await ai.models.generateContent({
    model: model,
    contents: [{ parts: [{ text: prompt }] }],
    config: {
      thinkingConfig: { thinkingBudget: 4000 },
      tools: [{ googleSearch: {} }],
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          overview: { type: Type.STRING },
          events: {
            type: Type.OBJECT,
            properties: {
              teacherBehavior: { type: Type.STRING },
              studentBehavior: { type: Type.STRING },
              activeLearning: { type: Type.STRING },
              questioning: { type: Type.STRING },
              relationships: { type: Type.STRING },
              engagement: { type: Type.STRING },
              technology: { type: Type.STRING },
              assessment: { type: Type.STRING },
              conclusion: { type: Type.STRING },
            },
            required: ["teacherBehavior", "studentBehavior", "activeLearning", "questioning", "relationships", "engagement", "technology", "assessment", "conclusion"]
          },
          tableSummary: {
            type: Type.ARRAY,
            items: {
              type: Type.OBJECT,
              properties: {
                item: { type: Type.STRING },
                observation: { type: Type.STRING },
                result: { type: Type.STRING, enum: ["ดีมาก", "ดี", "ควรพัฒนา"] }
              },
              required: ["item", "observation", "result"]
            }
          },
          strengths: { type: Type.ARRAY, items: { type: Type.STRING } },
          recommendations: { type: Type.ARRAY, items: { type: Type.STRING } }
        },
        required: ["overview", "events", "tableSummary", "strengths", "recommendations"]
      }
    }
  });

  try {
    const result = JSON.parse(response.text) as ObservationResult;
    
    // Extract grounding sources if available
    const groundingChunks = response.candidates?.[0]?.groundingMetadata?.groundingChunks;
    if (groundingChunks) {
      result.sources = groundingChunks
        .map((chunk: any) => ({
          title: chunk.web?.title,
          uri: chunk.web?.uri
        }))
        .filter((s: GroundingSource) => s.uri);
    }
    
    return result;
  } catch (e) {
    console.error("Analysis Error:", e);
    throw new Error("ระบบวิเคราะห์ขัดข้องชั่วคราว กรุณาลองใหม่อีกครั้ง");
  }
};
