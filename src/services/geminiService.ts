import { GoogleGenerativeAI, SchemaType } from "@google/generative-ai";
import { ObservationResult, GroundingSource } from "../types";

export const analyzeTeachingVideo = async (videoUrl: string): Promise<ObservationResult> => {
  // ดึง API Key จาก environment variable
  const apiKey = import.meta.env.VITE_GEMINI_API_KEY || "";
  
  if (!apiKey) {
    throw new Error("กรุณาตั้งค่า VITE_GEMINI_API_KEY ใน Vercel Environment Variables");
  }
  
  // สร้าง instance ของ GoogleGenerativeAI
  const genAI = new GoogleGenerativeAI(apiKey);
  
  const prompt = `คุณคือผู้เชี่ยวชาญด้านการนิเทศการเรียนการสอน (Educational Supervisor) 
  ภารกิจ: วิเคราะห์คลิปวิดีโอการสอนจากลิงก์นี้: ${videoUrl}
  
  คำสั่งสำคัญ:
  1. ใช้เครื่องมือ Google Search เพื่อตรวจสอบข้อมูลจริงของวิดีโอ (ชื่อคลิป, คำอธิบาย, ผู้สอน, เนื้อหาที่สอน)
  2. หากไม่สามารถเข้าถึงข้อมูลได้ ให้ระบุว่า "ไม่พบข้อมูลเนื้อหาในวิดีโอนี้" 
  3. วิเคราะห์ภาพรวม พฤติกรรมครู/นักเรียน การจัด Active Learning การตั้งคำถาม สื่อการสอน การวัดผล และสรุปความรู้
  4. ให้ความสำคัญกับความถูกต้องของเนื้อหาตามที่ปรากฏในวิดีโอจริงเท่านั้น
  
  ตอบกลับเป็น JSON ตามโครงสร้างที่กำหนด`;

  // สร้าง model พร้อม configuration
  const model = genAI.getGenerativeModel({ 
    model: "gemini-1.5-flash",
    generationConfig: {
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
          strengths: { 
            type: SchemaType.ARRAY, 
            items: { type: SchemaType.STRING } 
          },
          recommendations: { 
            type: SchemaType.ARRAY, 
            items: { type: SchemaType.STRING } 
          }
        },
        required: ["overview", "events", "tableSummary", "strengths", "recommendations"]
      }
    }
  });

  try {
    // เรียกใช้ AI ให้วิเคราะห์
    const result = await model.generateContent(prompt);
    const response = result.response;
    const text = response.text();
    
    // Parse JSON response
    const data = JSON.parse(text) as ObservationResult;
    
    // Extract grounding sources if available (สำหรับอ้างอิง)
    const candidates = result.response.candidates;
    if (candidates && candidates[0]?.groundingMetadata?.groundingChunks) {
      const groundingChunks = candidates[0].groundingMetadata.groundingChunks;
      data.sources = groundingChunks
        .map((chunk: any) => ({
          title: chunk.web?.title,
          uri: chunk.web?.uri
        }))
        .filter((s: GroundingSource) => s.uri);
    }
    
    return data;
  } catch (e) {
    console.error("Analysis Error:", e);
    throw new Error("ระบบวิเคราะห์ขัดข้องชั่วคราว กรุณาลองใหม่อีกครั้ง");
  }
};
