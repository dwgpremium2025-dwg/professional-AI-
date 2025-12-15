
import { GoogleGenAI } from "@google/genai";

// Fix for TS2580: Cannot find name 'process'
declare const process: {
  env: {
    API_KEY: string;
    [key: string]: string | undefined;
  }
};

const getApiKey = (): string => {
  // 1. Check Environment Variable (Preferred)
  if (process.env.API_KEY) {
    return process.env.API_KEY;
  }
  
  // 2. Check LocalStorage (User Input backup)
  const storedKey = localStorage.getItem('gemini_api_key');
  if (storedKey) {
    return storedKey;
  }

  throw new Error("API_KEY_MISSING");
};

export const geminiService = {
  /**
   * Generates an image or edits an image using Gemini.
   * Now supports both Main Image (structure) and Reference Image (style/background) simultaneously.
   * @param useProModel If true, uses gemini-3-pro-image-preview (2K). If false, uses gemini-2.5-flash-image (Free/Standard).
   */
  generateImage: async (
    prompt: string,
    mainImageBase64?: string,
    mainMimeType?: string,
    refImageBase64?: string,
    refMimeType?: string,
    useProModel: boolean = false
  ): Promise<string> => {
    
    let apiKey = '';
    try {
      apiKey = getApiKey();
    } catch (e) {
      throw new Error("API_KEY_MISSING");
    }

    // Initialize with determined key
    const ai = new GoogleGenAI({ apiKey });
    
    // Switch Model based on user selection
    // Standard (Free): 'gemini-2.5-flash-image'
    // Pro (High Quality): 'gemini-3-pro-image-preview'
    const model = useProModel ? 'gemini-3-pro-image-preview' : 'gemini-2.5-flash-image';

    const parts: any[] = [];
    
    // Construct strict instruction
    let finalPrompt = prompt;
    if (mainImageBase64 && refImageBase64) {
      finalPrompt = `
      TASK: Generate a high-quality architectural image.
      
      INPUTS:
      1. [First Image provided]: STRUCTURE REFERENCE.
      2. [Second Image provided]: STYLE/ENVIRONMENT REFERENCE.
      3. User Instruction: "${prompt}"

      STRICT CONSTRAINTS:
      - STRUCTURE: You MUST preserve the architectural form, perspective, geometry, and main subject of the First Image. Do not hallucinate a different building shape.
      - STYLE: You MUST apply the lighting, color palette, sky, mood, and surrounding landscape style of the Second Image to the First Image.
      - OUTPUT: A seamless blend where the building from Image 1 sits naturally in the world of Image 2.
      `;
    }

    // 1. Prompt (Text First is often better for instruction following in multimodal)
    parts.push({ text: finalPrompt });

    // 2. Main Image (Structure/Subject)
    if (mainImageBase64 && mainMimeType) {
      parts.push({
        inlineData: {
          data: mainImageBase64,
          mimeType: mainMimeType
        }
      });
    }

    // 3. Reference Image (Style/Background)
    if (refImageBase64 && refMimeType) {
      parts.push({
        inlineData: {
          data: refImageBase64,
          mimeType: refMimeType
        }
      });
    }

    try {
      // Configuration depends on model
      const config: any = {};
      
      if (useProModel) {
        // Pro model supports explicit imageSize "2K"
        config.imageConfig = {
          imageSize: "2K"
        };
      } else {
        // Flash model supports aspectRatio, but not imageSize 2K/4K specifically in the same way.
        // We leave it default (1:1) or can add aspectRatio if needed. 
        // For editing/blending, keeping defaults is safer for Flash.
      }

      const response = await ai.models.generateContent({
        model: model,
        contents: { parts },
        config: config
      });

      // Extract image from response
      if (response.candidates?.[0]?.content?.parts) {
        for (const part of response.candidates[0].content.parts) {
          if (part.inlineData && part.inlineData.data) {
            return part.inlineData.data;
          }
        }
      }
      
      throw new Error("No image generated.");
    } catch (error) {
      console.error("Gemini Image Gen Error:", error);
      throw error;
    }
  },

  /**
   * Upscales an image to 4K using the Pro model.
   */
  upscaleImage4K: async (imageBase64: string, mimeType: string): Promise<string> => {
    let apiKey = '';
    try {
      apiKey = getApiKey();
    } catch (e) {
      throw new Error("API_KEY_MISSING");
    }

    // Initialize with determined key
    const ai = new GoogleGenAI({ apiKey });
    
    // High-Quality Image Generation/Editing Tasks -> 'gemini-3-pro-image-preview'
    const model = 'gemini-3-pro-image-preview';

    try {
      const response = await ai.models.generateContent({
        model: model,
        contents: {
          parts: [
            {
              inlineData: {
                data: imageBase64,
                mimeType: mimeType
              }
            },
            {
              text: "Upscale this image to 4K resolution, enhancing details while preserving the original composition and style."
            }
          ]
        },
        config: {
            // @ts-ignore: imageConfig not yet in strict types
            imageConfig: {
                imageSize: "4K" // Explicitly requesting 4K
            }
        }
      });

      if (response.candidates?.[0]?.content?.parts) {
        for (const part of response.candidates[0].content.parts) {
          if (part.inlineData && part.inlineData.data) {
            return part.inlineData.data;
          }
        }
      }
      
      throw new Error("Failed to upscale image.");
    } catch (error) {
      console.error("Upscale Error:", error);
      throw error;
    }
  }
};
