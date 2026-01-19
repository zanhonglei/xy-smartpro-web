
import { GoogleGenAI, Type } from "@google/genai";
import { Product } from "./types";
import { Language } from "./i18n";

export interface SpatialRequest {
  image: string; // base64
  needs: string[];
  budget: number; 
  lang: Language;
}

// 1. Analyze floor plan image and suggest X,Y coordinates
// Using gemini-3-pro-preview for advanced reasoning tasks as per guidelines
export const generateSpatialSolution = async (req: SpatialRequest, availableProducts: Product[]) => {
  if (!req.image) {
    throw new Error("No image data provided to Spatial AI");
  }

  // Create new GoogleGenAI instance right before call as per guidelines
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

  const systemInstruction = `You are a Smart Home Architect. 
  Analyze the provided floor plan image carefully. 
  Identify rooms (Living, Bedroom, etc.) and suggest precise device placements.
  Return JSON only. For each device, specify: 
  - productId (from the provided list)
  - x (0-100 coordinate on image)
  - y (0-100 coordinate on image)
  - roomName
  Also provide 'reasoning' for the overall design in ${req.lang === 'zh' ? 'Chinese' : 'English'}.
  The total cost of devices should aim to be within the user's budget of ${req.budget}.`;

  const prompt = `
    Needs: ${req.needs.join(', ')}.
    Target Budget: ${req.budget}.
    
    Catalog:
    ${availableProducts.map(p => `- [${p.id}] ${p.name} (${p.category}) - Price: ${p.price}`).join('\n')}
  `;

  try {
    const imageData = req.image.includes(',') ? req.image.split(',')[1] : req.image;
    // Standardize mimeType for Gemini API
    const rawMime = req.image.match(/data:([^;]+);base64/)?.[1] || 'image/png';
    const mimeType = rawMime === 'image/svg+xml' ? 'image/png' : rawMime;

    const response = await ai.models.generateContent({
      model: 'gemini-3-pro-preview',
      contents: {
        parts: [
          { inlineData: { data: imageData, mimeType } },
          { text: prompt }
        ]
      },
      config: {
        systemInstruction,
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            devices: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  productId: { type: Type.STRING },
                  x: { type: Type.NUMBER },
                  y: { type: Type.NUMBER },
                  roomName: { type: Type.STRING }
                },
                required: ["productId", "x", "y", "roomName"]
              }
            },
            reasoning: { type: Type.STRING }
          },
          required: ["devices", "reasoning"]
        }
      }
    });

    // Directly access .text property as per guidelines (do not call as a function)
    return JSON.parse(response.text || '{}');
  } catch (error) {
    console.error("Spatial AI Error:", error);
    throw error;
  }
};

// 2. Generate 3D Effect Preview images
export const generateRoomVisual = async (roomName: string, devices: string[], lang: Language) => {
  // Create new GoogleGenAI instance right before call as per guidelines
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

  const prompt = `A cinematic, ultra-realistic 3D architectural rendering of a modern ${roomName} featuring integrated smart home technology. 
  The room has ${devices.join(', ')} visible. 
  Lighting is warm and high-end. 8k resolution, photorealistic, interior design magazine style.`;

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash-image',
      contents: { parts: [{ text: prompt }] },
      config: {
        imageConfig: {
          aspectRatio: "16:9"
        }
      }
    });

    // Iterate through candidates and parts to find the image part as per guidelines
    if (response.candidates?.[0]?.content?.parts) {
      for (const part of response.candidates[0].content.parts) {
        if (part.inlineData) {
          return `data:image/png;base64,${part.inlineData.data}`;
        }
      }
    }
    return null;
  } catch (error) {
    console.error("Image Gen Error:", error);
    return null;
  }
};
