
import { ImagePart } from '../types';

export const fileToGenerativePart = async (file: File): Promise<ImagePart> => {
  const base64encodedData = await new Promise<string>((resolve, reject) => {
    const reader = new FileReader();
    reader.onloadend = () => {
      if (typeof reader.result === 'string') {
        resolve(reader.result.split(',')[1]);
      } else {
        reject(new Error("Failed to read file as a data URL."));
      }
    };
    reader.onerror = (error) => reject(error);
    reader.readAsDataURL(file);
  });

  return {
    inlineData: {
      data: base64encodedData,
      mimeType: file.type,
    },
  };
};
