
import { GoogleGenAI, Type } from "@google/genai";

// Initialize the Google GenAI client with the API key from environment variables.
const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

/**
 * Finds song details using the Gemini model.
 * Removed googleSearch when requesting JSON to ensure the response format is strictly valid.
 */
export const findSongDetails = async (title: string, artist: string) => {
  // Use gemini-3-pro-preview for tasks involving information retrieval and reasoning.
  const response = await ai.models.generateContent({
    model: 'gemini-3-pro-preview',
    contents: `Encontre os detalhes da música "${title}" do artista "${artist}". 
    Preciso obrigatoriamente do link da letra no site letras.mus.br, do link do vídeo oficial no YouTube, o tom original do vídeo/música e o BPM aproximado.`,
    config: {
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          lyricsUrl: { type: Type.STRING, description: "URL do site letras.mus.br" },
          youtubeUrl: { type: Type.STRING, description: "URL do vídeo no YouTube" },
          videoKey: { type: Type.STRING, description: "Tom do vídeo original (ex: C#, G, Am)" },
          bpm: { type: Type.NUMBER, description: "Batidas por minuto aproximadas" }
        },
        required: ["lyricsUrl", "youtubeUrl", "videoKey", "bpm"]
      }
    }
  });

  // Safe access to .text property and parsing
  return JSON.parse(response.text || '{}');
};

/**
 * Suggests songs based on a theme using the Gemini model.
 */
export const suggestSongs = async (theme: string) => {
  // Use gemini-3-pro-preview for tasks involving creative repertoire suggestion.
  const response = await ai.models.generateContent({
    model: 'gemini-3-pro-preview',
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
  
  // Safe access to .text property and parsing
  return JSON.parse(response.text || '[]');
};

export const generateConfirmationMessage = (eventTitle: string, date: string, time: string, role: string) => {
  return `Olá! Passando para confirmar sua escala para o *${eventTitle}*.\n\n📅 Data: *${date}*\n⏰ Horário: *${time}*\n🎸 Função: *${role}*\n\nPodemos contar com você? Responda com um ✅ para confirmar ou ❌ se tiver algum imprevisto.`;
};
