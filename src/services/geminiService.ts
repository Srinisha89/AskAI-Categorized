import { GoogleGenAI, Type } from "@google/genai";

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

export interface AISearchResult {
  isAIRequest: boolean;
  explanation?: string;
  recommendedKeywords?: string[];
  followUpQuestions?: string[];
  summary?: string;
}

export async function processSearchIntent(query: string): Promise<AISearchResult> {
  if (!query || query.length < 3) {
    return { isAIRequest: false };
  }

  try {
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: query,
      config: {
        systemInstruction: `You are an AI assistant for CurioVid, a video streaming platform. 
        Analyze the user's search query. Determine if it is a simple keyword search (e.g., "fitness") or a natural language question (e.g., "how to start yoga").
        
        If it's a question or a complex request:
        1. Set isAIRequest to true.
        2. Provide a concise explanation or summary of the topic.
        3. Suggest 3-4 specific keywords that would help find the best videos on our platform.
        4. Provide 3 follow-up questions the user might want to ask.

        Response format must be valid JSON matching the schema.`,
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            isAIRequest: { type: Type.BOOLEAN },
            explanation: { type: Type.STRING },
            recommendedKeywords: { 
              type: Type.ARRAY,
              items: { type: Type.STRING }
            },
            followUpQuestions: {
              type: Type.ARRAY,
              items: { type: Type.STRING }
            },
            summary: { type: Type.STRING }
          },
          required: ["isAIRequest"]
        }
      }
    });

    const result = JSON.parse(response.text || "{}");
    return result;
  } catch (error) {
    console.error("AI Search Error:", error);
    return { isAIRequest: false };
  }
}
