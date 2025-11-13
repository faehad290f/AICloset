import { GoogleGenAI, Modality, GenerateContentResponse } from '@google/genai';
import { ImagePart, GroundingSource } from '../types';

const API_KEY = process.env.API_KEY;

if (!API_KEY) {
  // In a real app, you might want to show a graceful message to the user
  console.error("API_KEY environment variable not set");
}

const ai = new GoogleGenAI({ apiKey: API_KEY! });

export const generateVirtualTryOn = async (
  modelImage: ImagePart,
  clothingImage: ImagePart
): Promise<string> => {
  const prompt = `You are a professional virtual stylist performing a virtual try-on.
Image 1: A person (the model).
Image 2: A clothing item.

Task: Realistically place the clothing from Image 2 onto the person in Image 1.

**Key Instructions:**
- **Preserve Identity & Pose:** Do not alter the person's face, body shape, or posture.
- **Preserve Background:** The background of Image 1 must remain completely unchanged.
- **Realistic Fit:** The clothing must conform to the person's body contours, with natural folds, wrinkles, and shadows consistent with the lighting in Image 1.
- **Maintain Clothing Details:** Preserve the texture, color, and patterns of the clothing item.
- **Seamless Integration:** The final image should look like a real photograph without editing artifacts.

Output only the final image.`;

  try {
    const response: GenerateContentResponse = await ai.models.generateContent({
      model: 'gemini-2.5-flash-image',
      contents: {
        parts: [
          modelImage,
          clothingImage,
          { text: prompt },
        ],
      },
      config: {
        responseModalities: [Modality.IMAGE],
      },
    });

    const firstPart = response.candidates?.[0]?.content?.parts?.[0];
    if (firstPart && firstPart.inlineData) {
      return firstPart.inlineData.data;
    }
    
    throw new Error("No image data in response. The model may not have been able to process the request.");
  } catch (error) {
    console.error("Error in generateVirtualTryOn:", error);
    throw new Error("Failed to generate the virtual try-on image. Please try different images.");
  }
};

export const editGeneratedImage = async (
  baseImage: ImagePart,
  prompt: string
): Promise<string> => {
  const editInstruction = `You are an expert photo editor. The user wants to edit the provided image. Apply the following instruction: "${prompt}". Maintain realism and high quality. Focus only on the requested change.`;
  try {
    const response: GenerateContentResponse = await ai.models.generateContent({
        model: 'gemini-2.5-flash-image',
        contents: {
          parts: [
            baseImage,
            { text: editInstruction },
          ],
        },
        config: {
          responseModalities: [Modality.IMAGE],
        },
      });

    const firstPart = response.candidates?.[0]?.content?.parts?.[0];
    if (firstPart && firstPart.inlineData) {
      return firstPart.inlineData.data;
    }

    throw new Error("No image data in response. The model may not have been able to process the edit.");
  } catch (error) {
    console.error("Error in editGeneratedImage:", error);
    throw new Error("Failed to edit the image. Please try a different prompt.");
  }
};

export const getStyleAdvice = async (
  prompt: string
): Promise<{ text: string; sources: GroundingSource[] }> => {
  try {
    const response: GenerateContentResponse = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
      config: {
        systemInstruction: "You are 'Zenth', a friendly and knowledgeable AI style advisor. Provide helpful, concise, and encouraging fashion advice. When possible, cite your sources from the web search results.",
        tools: [{ googleSearch: {} }],
      },
    });

    const text = response.text;
    const rawSources = response.candidates?.[0]?.groundingMetadata?.groundingChunks || [];
    
    const sources: GroundingSource[] = rawSources
      .filter((s: any) => s.web && s.web.uri && s.web.title)
      .map((s: any) => s as GroundingSource);
      
    return { text, sources };
  } catch (error) {
    console.error("Error in getStyleAdvice:", error);
    throw new Error("Sorry, I couldn't get any style advice at the moment. Please try again.");
  }
};