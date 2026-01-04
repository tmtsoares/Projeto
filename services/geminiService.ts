
import { GoogleGenAI, Type } from "@google/genai";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY || '' });

export const suggestSongs = async (theme: string) => {
  const response = await ai.models.generateContent({
    model: 'gemini-3-flash-preview',
    contents: `Sugira um repertório de 4 músicas de louvor contemporâneo (Gospel/Worship) baseado no tema: "${theme}". 
    Retorne apenas os dados no formato JSON.`,
    config: {
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.ARRAY,
        items: {
          type: Type.OBJECT,
          properties: {
            title: { type: Type.STRING },
            artist: { type: Type.STRING },
            key: { type: Type.STRING },
            reason: { type: Type.STRING, description: "Por que essa música combina com o tema?" }
          },
          required: ["title", "artist", "key"]
        }
      }
    }
  });
  
  return JSON.parse(response.text);
};

export const generateConfirmationMessage = (eventTitle: string, date: string, time: string, role: string) => {
  return `Olá! Passando para confirmar sua escala para o *${eventTitle}*.\n\n📅 Data: *${date}*\n⏰ Horário: *${time}*\n🎸 Função: *${role}*\n\nPodemos contar com você? Responda com um ✅ para confirmar ou ❌ se tiver algum imprevisto.`;
};
