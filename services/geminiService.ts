
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
  const prompt = "Analyze the clothing in the second image and realistically place it on the person in the first image. Maintain the person's pose and the background. The clothing should fit naturally on the person.";

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
  try {
    const response: GenerateContentResponse = await ai.models.generateContent({
        model: 'gemini-2.5-flash-image',
        contents: {
          parts: [
            baseImage,
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
