import React, { useState, useMemo, useRef, useEffect } from 'react';
import { ImageFile, ImagePart } from '../types';
import { fileToGenerativePart } from '../utils/fileUtils';
import { generateVirtualTryOn, editGeneratedImage } from '../services/geminiService';
import FileUpload from './FileUpload';
import Spinner from './Spinner';

const VirtualTryOn: React.FC = () => {
  const [modelImage, setModelImage] = useState<ImageFile | null>(null);
  const [clothingImage, setClothingImage] = useState<ImageFile | null>(null);
  const [generatedImage, setGeneratedImage] = useState<ImagePart | null>(null);
  const [editPrompt, setEditPrompt] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [loadingMessage, setLoadingMessage] = useState<string>('');
  const [error, setError] = useState<string | null>(null);
  const loadingIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const canGenerate = useMemo(() => modelImage && clothingImage, [modelImage, clothingImage]);
  const canEdit = useMemo(() => generatedImage && editPrompt.trim() !== '', [generatedImage, editPrompt]);

  const loadingMessages = useMemo(() => [
    'Warming up the AI stylist...',
    'Analyzing the fit and fabric...',
    'Draping the clothing onto your photo...',
    'Adding realistic lighting and shadows...',
    'Putting the final touches on your look...'
  ], []);

  const editLoadingMessages = useMemo(() => [
    'Reading your instructions...',
    'Making the magic happen...',
    'Perfecting the details...',
  ], []);

  useEffect(() => {
    // Cleanup interval on component unmount
    return () => {
      if (loadingIntervalRef.current) {
        clearInterval(loadingIntervalRef.current);
      }
    };
  }, []);

  const startLoadingAnimation = (messages: string[], interval: number) => {
    if (loadingIntervalRef.current) clearInterval(loadingIntervalRef.current);
    
    setLoadingMessage(messages[0]);
    
    loadingIntervalRef.current = setInterval(() => {
      setLoadingMessage(prev => {
        const currentIndex = messages.indexOf(prev);
        if (currentIndex === -1) return messages[0]; // Fallback
        const nextIndex = (currentIndex + 1) % messages.length;
        return messages[nextIndex];
      });
    }, interval);
  };
  
  const stopLoadingAnimation = () => {
    if (loadingIntervalRef.current) {
      clearInterval(loadingIntervalRef.current);
      loadingIntervalRef.current = null;
    }
    setIsLoading(false);
    setLoadingMessage('');
  };

  const handleGenerate = async () => {
    if (!canGenerate) return;

    setIsLoading(true);
    setError(null);
    setGeneratedImage(null);
    startLoadingAnimation(loadingMessages, 2500);

    try {
      const modelPart = await fileToGenerativePart(modelImage!.file);
      const clothingPart = await fileToGenerativePart(clothingImage!.file);
      const newImageBase64 = await generateVirtualTryOn(modelPart, clothingPart);
      setGeneratedImage({
        inlineData: {
          data: newImageBase64,
          mimeType: 'image/png' // Gemini may return different types, png is a safe bet
        }
      });
    } catch (e) {
      setError(e instanceof Error ? e.message : 'An unknown error occurred.');
    } finally {
      stopLoadingAnimation();
    }
  };

  const handleEdit = async () => {
    if (!canEdit || !generatedImage) return;

    setIsLoading(true);
    setError(null);
    startLoadingAnimation(editLoadingMessages, 1800);

    try {
      const editedImageBase64 = await editGeneratedImage(generatedImage, editPrompt);
      setGeneratedImage({
        inlineData: {
          data: editedImageBase64,
          mimeType: 'image/png'
        }
      });
      setEditPrompt('');
    } catch (e) {
      setError(e instanceof Error ? e.message : 'An unknown error occurred.');
    } finally {
      stopLoadingAnimation();
    }
  };

  return (
    <div className="w-full max-w-4xl mx-auto flex flex-col items-center space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 w-full">
        <FileUpload label="Your Photo" onFileSelect={setModelImage} />
        <FileUpload label="Clothing Item" onFileSelect={setClothingImage} />
      </div>

      <button
        onClick={handleGenerate}
        disabled={!canGenerate || isLoading}
        className="w-full md:w-1/2 bg-amber-600 text-white font-bold py-3 px-4 rounded-lg transition-all duration-300 ease-in-out hover:bg-amber-500 disabled:bg-slate-700 disabled:text-slate-400 disabled:cursor-not-allowed focus:outline-none focus:ring-2 focus:ring-amber-500 focus:ring-offset-2 focus:ring-offset-slate-900 shadow-lg transform hover:scale-105 disabled:scale-100"
      >
        {isLoading ? 'Generating...' : 'Generate Style'}
      </button>

      {error && <div className="bg-red-900/50 text-red-300 p-3 rounded-lg w-full text-center">{error}</div>}

      <div className="w-full bg-slate-800 rounded-lg p-4 mt-6">
        <h2 className="text-xl font-bold text-center mb-4 text-amber-400">Your Virtual Look</h2>
        <div className="aspect-square bg-slate-900/50 rounded-lg flex items-center justify-center relative overflow-hidden">
          {isLoading && (
            <div className="absolute inset-0 bg-black/70 flex flex-col items-center justify-center z-10">
              <Spinner />
              <p className="mt-4 text-slate-300">{loadingMessage}</p>
            </div>
          )}
          {generatedImage ? (
            <img 
              src={`data:${generatedImage.inlineData.mimeType};base64,${generatedImage.inlineData.data}`} 
              alt="Generated virtual try-on"
              className="object-contain h-full w-full"
            />
          ) : (
             <p className="text-slate-500">Your generated image will appear here.</p>
          )}
        </div>
      </div>
      
      {generatedImage && !isLoading && (
        <div className="w-full bg-slate-800 rounded-lg p-4 mt-2">
          <h3 className="text-lg font-bold mb-3 text-center">Refine Your Style</h3>
          <div className="flex flex-col sm:flex-row gap-2">
            <input
              type="text"
              value={editPrompt}
              onChange={(e) => setEditPrompt(e.target.value)}
              placeholder='e.g., "Add a retro filter" or "Change shirt to blue"'
              className="flex-grow bg-slate-700 border border-slate-600 rounded-md py-2 px-3 text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-amber-500"
            />
            <button
              onClick={handleEdit}
              disabled={!canEdit || isLoading}
              className="bg-sky-600 text-white font-semibold py-2 px-4 rounded-md transition-colors hover:bg-sky-500 disabled:bg-slate-600 disabled:cursor-not-allowed"
            >
              Apply Edit
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default VirtualTryOn;