import { GoogleGenerativeAI, SchemaType } from "@google/generative-ai";
import { ObservationResult, GroundingSource } from "../types";

export const analyzeTeachingVideo = async (videoUrl: string): Promise<ObservationResult> => {
  // ดึง API Key จาก environment variable ที่ตั้งไว้ใน Vercel
  const apiKey = import.meta.env.VITE_GEMINI_API_KEY || "";
  
  if (!apiKey) {
    throw new Error("กรุณาตั้งค่า GEMINI_API_KEY ใน Vercel Environment Variables");
  }
  
  const genAI = new GoogleGenerativeAI(apiKey);
const model = genAI.getGenerativeModel({ 
  model: "gemini-2.0-flash-exp",
  
  
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
        type: SchemaType.OBJECT,
        properties: {
          overview: { type: SchemaType.STRING },
          events: {
            type: SchemaType.OBJECT,
            properties: {
              teacherBehavior: { type: SchemaType.STRING },
              studentBehavior: { type: SchemaType.STRING },
              activeLearning: { type: SchemaType.STRING },
              questioning: { type: SchemaType.STRING },
              relationships: { type: SchemaType.STRING },
              engagement: { type: SchemaType.STRING },
              technology: { type: SchemaType.STRING },
              assessment: { type: SchemaType.STRING },
              conclusion: { type: SchemaType.STRING },
            },
            required: ["teacherBehavior", "studentBehavior", "activeLearning", "questioning", "relationships", "engagement", "technology", "assessment", "conclusion"]
          },
          tableSummary: {
            type: SchemaType.ARRAY,
            items: {
              type: SchemaType.OBJECT,
              properties: {
                item: { type: SchemaType.STRING },
                observation: { type: SchemaType.STRING },
                result: { type: SchemaType.STRING, enum: ["ดีมาก", "ดี", "ควรพัฒนา"] }
              },
              required: ["item", "observation", "result"]
            }
          },
          strengths: { type: SchemaType.ARRAY, items: { type: SchemaType.STRING } },
          recommendations: { type: SchemaType.ARRAY, items: { type: SchemaType.STRING } }
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
