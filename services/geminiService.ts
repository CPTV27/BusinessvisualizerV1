import { GoogleGenAI, GenerateContentResponse, VideoGenerationReferenceImage, VideoGenerationReferenceType } from "@google/genai";
import { BusinessEntity, BusinessGap, ChatMessage } from "../types";

// Helper to get fresh instance (important for Veo key switching)
const getAI = () => new GoogleGenAI({ apiKey: process.env.API_KEY || '' });

export const generateGapSolutions = async (
  entity: BusinessEntity,
  gap: BusinessGap,
  themeDescription: string,
  userGuidance?: string
): Promise<string[]> => {
  const ai = getAI();
  const apiKey = process.env.API_KEY;
  if (!apiKey) return ["API Key missing."];

  const prompt = `
    You are 'Sidekick', a strategic creative director.
    Context: Entity '${entity.name}' (${entity.description}).
    Gap: ${gap.description}.
    Style: ${themeDescription}.
    ${userGuidance ? `Director's Note: "${userGuidance}". Expand on this.` : `Task: 3 creative solutions.`}
    Keep it brief.
  `;

  try {
    const response: GenerateContentResponse = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: prompt,
      config: { thinkingConfig: { thinkingBudget: 0 } }
    });

    const text = response.text || "";
    return text.split(/\n/).filter(line => line.trim().length > 0).map(line => line.replace(/^[-\d.]+\s*/, '')).slice(0, 3);
  } catch (error) {
    console.error("Gemini API Error:", error);
    return ["AI Offline."];
  }
};

export const generateEntityVisual = async (
  entity: BusinessEntity,
  themeDescription: string,
  visualType: 'ENVIRONMENT' | 'WHITEBOARD'
): Promise<string | null> => {
  const ai = getAI();
  const apiKey = process.env.API_KEY;
  if (!apiKey) return null;

  let prompt = '';

  if (visualType === 'ENVIRONMENT') {
    prompt = `
      Create a photorealistic, 8k architectural visualization of "${entity.name}".
      Context: ${entity.description}.
      Location: ${entity.location}.
      Style Territory: ${themeDescription}.
      Vibe: Cinematic lighting, immersive, depth of field, Unreal Engine 5 render, architectural digest photography.
      NO TEXT.
    `;
  } else {
    prompt = `
      A photorealistic close-up shot of a glass whiteboard in a modern, dim creative office.
      The whiteboard is filled with complex flowcharts, diagrams, and sticky notes explaining the business strategy for "${entity.name}".
      Details: Marker drawings, connection lines, strategy maps, messy but genius.
      Lighting: Moody, ambient office lighting, reflection on glass.
      Style Territory: ${themeDescription}.
      NO TEXT OVERLAYS.
    `;
  }

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash-image',
      contents: {
        parts: [{ text: prompt }]
      },
      config: {
        imageConfig: {
          aspectRatio: "4:3",
        }
      }
    });

    for (const part of response.candidates?.[0]?.content?.parts || []) {
      if (part.inlineData) {
        return `data:image/png;base64,${part.inlineData.data}`;
      }
    }
    return null;
  } catch (error) {
    console.error("Image Gen Error:", error);
    return null;
  }
};

export const modifyRoomScenario = async (
  baseImage: string,
  scenarioPrompt: string
): Promise<string | null> => {
  const ai = getAI();
  const apiKey = process.env.API_KEY;
  if (!apiKey || !baseImage) return null;

  const prompt = `
    Modify this architectural space to match the following scenario: ${scenarioPrompt}.
    Maintain the same room geometry and architectural features (walls, windows, ceiling) exactly.
    Only change the furniture, lighting, people, and atmosphere.
    Make it look photorealistic and high-end.
  `;

  try {
    // Strip header if present
    const cleanB64 = baseImage.includes('base64,') ? baseImage.split('base64,')[1] : baseImage;

    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash-image',
      contents: {
        parts: [
          {
            inlineData: {
              mimeType: 'image/png',
              data: cleanB64
            }
          },
          { text: prompt }
        ]
      },
      config: {
        imageConfig: {
          aspectRatio: "4:3",
        }
      }
    });

    for (const part of response.candidates?.[0]?.content?.parts || []) {
      if (part.inlineData) {
        return `data:image/png;base64,${part.inlineData.data}`;
      }
    }
    return null;
  } catch (error) {
    console.error("Image Edit Error:", error);
    return null;
  }
};

export const scoutRegionalBusinesses = async (
  location: string,
  demographic: string
): Promise<{ text: string, chunks: any[] }> => {
  const ai = getAI();
  const apiKey = process.env.API_KEY;
  if (!apiKey) return { text: "API Key Missing", chunks: [] };

  try {
    // Robust prompt to handle if user enters a URL or weird text
    const prompt = `
      User Input: "${location}".
      Task: If the input is a URL or invalid location, try to infer the region or default to "Natchez, MS".
      Then, find 5 real businesses in that region that match: ${demographic}.
      Focus on hospitality, music venues, and high-end retail.
    `;

    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
      config: { tools: [{googleMaps: {}}] }
    });

    return {
      text: response.text || "No results found.",
      chunks: response.candidates?.[0]?.groundingMetadata?.groundingChunks || []
    };
  } catch (error) {
    console.error("Scouting Error:", error);
    return { text: "Error scouting region.", chunks: [] };
  }
};

export const generateReel = async (
  imagesBase64: string[],
  vision: string
): Promise<string | null> => {
  const ai = getAI();
  // Veo requires a paid key. 
  
  if (imagesBase64.length === 0) return null;

  // Prepare reference images (Max 3 for veo-3.1-generate-preview)
  const referenceImagesPayload: VideoGenerationReferenceImage[] = [];
  const limitedImages = imagesBase64.slice(0, 3);

  for (const b64 of limitedImages) {
    // Strip data url prefix if present
    const cleanB64 = b64.includes('base64,') ? b64.split('base64,')[1] : b64;
    
    referenceImagesPayload.push({
      image: {
        imageBytes: cleanB64,
        mimeType: 'image/png', // Assuming PNG from canvas/upload, Veo is flexible
      },
      referenceType: VideoGenerationReferenceType.ASSET,
    });
  }

  try {
    let operation = await ai.models.generateVideos({
      model: 'veo-3.1-generate-preview',
      prompt: vision || "A cinematic sizzle reel featuring these elements, high quality, 4k.", 
      config: {
        numberOfVideos: 1,
        referenceImages: referenceImagesPayload,
        resolution: '720p',
        aspectRatio: '16:9'
      }
    });

    // Poll for completion
    while (!operation.done) {
      await new Promise(resolve => setTimeout(resolve, 5000)); // Poll every 5s
      operation = await ai.operations.getVideosOperation({operation: operation});
    }

    const downloadLink = operation.response?.generatedVideos?.[0]?.video?.uri;
    if (downloadLink && process.env.API_KEY) {
      // The URI needs the key appended for direct browser fetch/playback
      return `${downloadLink}&key=${process.env.API_KEY}`;
    }
    return null;

  } catch (error) {
    console.error("Video Gen Error:", error);
    throw error; // Re-throw to handle UI state specific to billing errors
  }
};

export const sendEntityChatMessage = async (
  entity: BusinessEntity,
  history: ChatMessage[],
  newMessage: string
): Promise<string> => {
  const ai = getAI();
  const apiKey = process.env.API_KEY;
  if (!apiKey) return "API Key missing.";

  const systemInstruction = `
    You are the Director of Operations and Brand Strategy for '${entity.name}'.
    Location: ${entity.location}.
    Description: ${entity.description}.
    
    Mission:
    1. Help the user build this specific business ecosystem.
    2. Prioritize regional sourcing from the Delta (Mississippi, Tennessee, Louisiana, Arkansas, Alabama).
    3. Retell the brand story to attract the right customers.
    4. Maintain the brand voice: sophisticated, authentic, rooted in heritage but modern.
    
    Your answers should be strategic, actionable, and concise. You are a notebook for this specific entity.
  `;

  try {
    const chat = ai.chats.create({
      model: 'gemini-3-flash-preview',
      config: {
        systemInstruction: systemInstruction,
        thinkingConfig: { thinkingBudget: 0 } 
      },
      history: history.map(h => ({
        role: h.role,
        parts: [{ text: h.text }]
      }))
    });

    const result = await chat.sendMessage({ message: newMessage });
    return result.text || "No response.";
  } catch (error) {
    console.error("Chat Error:", error);
    return "I'm having trouble connecting to the network right now.";
  }
};
