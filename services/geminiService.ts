import { GoogleGenAI, GenerateContentResponse, VideoGenerationReferenceImage, VideoGenerationReferenceType, Type } from "@google/genai";
import { BusinessEntity, BusinessGap, ChatMessage, ServiceLayer, MarketAnalysis, ThemeId, MoodType } from "../types";
import { ENVIRONMENT_DESCRIPTIONS } from "../constants";

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

  const layerContext = entity.layer ? `Entity Layer: ${entity.layer} (Part of the Discovery Model).` : "";

  const prompt = `
    You are 'Sidekick', a strategic creative director for Big Muddy.
    
    Target Context:
    - Entity: '${entity.name}' (${entity.description}).
    - ${layerContext}
    - Gap: ${gap.description}.
    - Visual Style: ${themeDescription}.
    
    Task:
    Provide 3 strategic solutions to close this gap.
    1. Include competitive analysis framing (how this sets us apart).
    2. Include rough estimated costs and timelines for each solution.
    3. Ensure solutions drive towards the revenue target of 200 bookings/quarter @ $500 avg.

    ${userGuidance ? `Director's Note: "${userGuidance}". Expand on this specific direction.` : ``}
    
    Keep the output structured as bullet points.
  `;

  try {
    const response: GenerateContentResponse = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: prompt,
      config: { thinkingConfig: { thinkingBudget: 0 } }
    });

    const text = response.text || "";
    // Clean up response for UI display
    return text.split(/\n/).filter(line => line.trim().length > 0 && (line.trim().startsWith('-') || line.trim().match(/^\d/))).slice(0, 3);
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

export const performMarketAnalysis = async (
  location: string,
  category: string
): Promise<MarketAnalysis | null> => {
  const ai = getAI();
  const apiKey = process.env.API_KEY;
  if (!apiKey) return null;

  const prompt = `
    Conduct a Comparative Market Analysis (CMA) for:
    Region: ${location}
    Venture Category: ${category}

    Step 1: Identify 2 REAL, existing top competitors in this specific area for this category using Google Search.
    Step 2: Invent a 3rd "Ghost Concept" (The "Brand Imprint"). This is a hypothetical venture owned by 'Chase Pierson Productions'.
            - It should use the "Big Muddy" brand network (Music, Art, Media) to win.
            - It should find a capital inefficiency (e.g., buying cheap real estate) and amplifying it with vibe/network.
            - Example: "Tiny House Village Festival Hub" or "Artist Residency Multifamily".

    Step 3: Analyze the Capital Strategy.
            - How do we use network value to amplify returns rather than just spending cash?
    
    Output JSON format only.
  `;

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash', // Using 2.5 for search tool availability and speed
      contents: prompt,
      config: {
        tools: [{ googleSearch: {} }],
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            region: { type: Type.STRING },
            category: { type: Type.STRING },
            competitors: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  name: { type: Type.STRING },
                  type: { type: Type.STRING, enum: ["EXISTING", "CONCEPT"] },
                  description: { type: Type.STRING },
                  pricePoint: { type: Type.STRING },
                  strengths: { type: Type.ARRAY, items: { type: Type.STRING } },
                  weaknesses: { type: Type.ARRAY, items: { type: Type.STRING } }
                }
              }
            },
            ourConcept: {
               type: Type.OBJECT,
               properties: {
                  name: { type: Type.STRING },
                  type: { type: Type.STRING, enum: ["EXISTING", "CONCEPT"] },
                  description: { type: Type.STRING },
                  pricePoint: { type: Type.STRING },
                  strengths: { type: Type.ARRAY, items: { type: Type.STRING } },
                  weaknesses: { type: Type.ARRAY, items: { type: Type.STRING } }
               }
            },
            capitalStrategy: {
              type: Type.OBJECT,
              properties: {
                estimatedEntryCost: { type: Type.STRING },
                valueLeverage: { type: Type.STRING },
                capitalRatio: { type: Type.STRING },
                verdict: { type: Type.STRING }
              }
            }
          }
        }
      }
    });

    if (response.text) {
      return JSON.parse(response.text) as MarketAnalysis;
    }
    return null;
  } catch (error) {
    console.error("Market Analysis Error:", error);
    return null;
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
    
    CRITICAL KNOWLEDGE BASE:
    You have access to the full "Discovery Model" spreadsheet structure:
    1. Ecosystem Map (The Cards)
    2. Layer Analysis (Foundation, Network, Machine, Business)
    3. Gap Tracker (Current blockers)
    4. Revenue Model (Target: 200 bookings/quarter @ $500 avg, 20% occupancy increase)
    5. Entity Registry (All business units including Hotel, Venue, Packages, Residencies, Development)
    
    Your Mission:
    1. Act as the specific notebook/brain for '${entity.name}' but understand its dependency on the wider network.
    2. Prioritize regional sourcing from the Delta (MS, TN, LA, AR, AL).
    3. Retell the brand story to attract the right customers.
    4. Maintain the brand voice: sophisticated, authentic, rooted in heritage but modern.
    
    Your answers should be strategic, actionable, and concise.
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

// ============================================
// [CC + GA] PANORAMIC ENVIRONMENT GENERATION
// For Three.js skybox rendering in ImmersiveWorld
// Uses ENVIRONMENT_DESCRIPTIONS from constants.ts
// ============================================

/**
 * Generate an equirectangular panoramic image for a Three.js skybox.
 * Uses ENVIRONMENT_DESCRIPTIONS for rich, theme-aware prompts.
 *
 * Primary: Gemini 2.5 Flash Image (high-quality equirectangular)
 * Fallback: Returns null → UI shows gradient from FALLBACK_GRADIENTS
 */
export const generatePanoramicEnvironment = async (
  entity: BusinessEntity,
  themeDescription: string,
  mood: MoodType = 'evening',
  themeId?: ThemeId
): Promise<string | null> => {
  const ai = getAI();
  const apiKey = process.env.API_KEY;
  if (!apiKey) return null;

  // Use rich descriptions from ENVIRONMENT_DESCRIPTIONS if themeId provided
  let envBackdrop = '';
  let moodLighting = '';
  let baseDescription = themeDescription;
  let negativePrompt = 'text, watermark, frames, borders, distortion at poles, cartoon, anime, low quality, blurry';

  if (themeId && ENVIRONMENT_DESCRIPTIONS[themeId]) {
    const envDesc = ENVIRONMENT_DESCRIPTIONS[themeId];
    baseDescription = envDesc.base;
    envBackdrop = envDesc.entityBackdrops[entity.type] || envDesc.entityBackdrops['VENUE'] || '';
    moodLighting = envDesc.moods[mood] || envDesc.moods.evening;
    negativePrompt = envDesc.negativePrompt;
  } else {
    // Fallback to inline descriptions if no themeId
    const fallbackStyles: Record<string, string> = {
      'VENUE': 'Interior architectural space, luxury boutique hotel, detailed furnishings, warm ambient lighting',
      'EXPERIENCE': 'Atmospheric performance space, stage lighting, audience perspective, intimate music venue',
      'BRAND': 'Abstract brand world, floating elements, logo-inspired geometry, clean infinite space',
      'DEVELOPMENT': 'Construction site meets architectural rendering, blueprints come to life',
      'PACKAGE': 'Luxury gift arrangement, premium unboxing experience, velvet and gold',
      'PROGRAM': 'Creative workshop space, instruments, art supplies, collaborative energy',
      'ROOM_CATEGORY': 'Luxury hotel room interior, premium bedding, atmospheric lighting',
    };
    const fallbackMoods: Record<string, string> = {
      'day': 'Bright natural light streaming through windows, warm afternoon sun, golden hour warmth',
      'evening': 'Warm tungsten lighting, candles, amber glow, intimate atmosphere, blue hour outside windows',
      'night': 'Moody low lighting, neon accents, spotlight drama, deep shadows, after-midnight energy',
    };
    envBackdrop = fallbackStyles[entity.type] || fallbackStyles['VENUE'];
    moodLighting = fallbackMoods[mood];
  }

  const prompt = `360 degree equirectangular projection, seamless panoramic HDRI environment map, 8k resolution.

Scene: "${entity.name}" — ${entity.description}
Location: ${entity.location || 'Mississippi Delta'}

Art Direction: ${baseDescription}

Entity Environment: ${envBackdrop}

Lighting & Mood: ${moodLighting}

Technical Requirements:
- This is an equirectangular panoramic image for a Three.js skybox sphere
- The image MUST wrap seamlessly at left and right edges (360 degree continuous)
- Camera is at eye level, centered in the space
- Photorealistic architectural photography quality
- Cinematic depth of field, volumetric lighting
- Rich detail in all directions (left, right, up, down, forward, behind)

DO NOT include: ${negativePrompt}`;

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash-image',
      contents: {
        parts: [{ text: prompt }]
      },
      config: {
        imageConfig: {
          aspectRatio: "16:9", // Closest available to equirectangular 2:1
        }
      }
    });

    for (const part of response.candidates?.[0]?.content?.parts || []) {
      if (part.inlineData) {
        return `data:image/png;base64,${part.inlineData.data}`;
      }
    }
    // Fallback: return null — UI shows gradient
    return null;
  } catch (error) {
    console.error("Panoramic Gen Error:", error);
    // Always return null on failure — UI handles gradient fallback
    return null;
  }
};

/**
 * Batch generate environments for all entities in a layer.
 * Processes sequentially with rate limiting to avoid API throttling.
 */
export const generateLayerEnvironments = async (
  entities: BusinessEntity[],
  themeDescription: string,
  themeId?: ThemeId,
  mood: MoodType = 'evening',
  onProgress?: (entityId: string, imageUrl: string) => void
): Promise<Map<string, string>> => {
  const results = new Map<string, string>();

  for (const entity of entities) {
    try {
      const imageUrl = await generatePanoramicEnvironment(entity, themeDescription, mood, themeId);
      if (imageUrl) {
        results.set(entity.id, imageUrl);
        onProgress?.(entity.id, imageUrl);
      }
      // Rate limit: 1.5s between requests
      await new Promise(resolve => setTimeout(resolve, 1500));
    } catch (error) {
      console.error(`Failed to generate environment for ${entity.name}:`, error);
    }
  }

  return results;
};
