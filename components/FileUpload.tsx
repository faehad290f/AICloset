
import React, { useState, useRef, useCallback } from 'react';
import { ImageFile } from '../types';

interface FileUploadProps {
  label: string;
  onFileSelect: (file: ImageFile | null) => void;
}

const FileUpload: React.FC<FileUploadProps> = ({ label, onFileSelect }) => {
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file && file.type.startsWith('image/')) {
      const previewUrl = URL.createObjectURL(file);
      setImagePreview(previewUrl);
      onFileSelect({ file, previewUrl });
    } else {
      setImagePreview(null);
      onFileSelect(null);
    }
  }, [onFileSelect]);
  
  const handleClick = () => {
    fileInputRef.current?.click();
  };

  return (
    <div className="bg-slate-800 p-4 rounded-lg text-center">
      <h3 className="text-lg font-semibold mb-2">{label}</h3>
      <div 
        onClick={handleClick}
        className="aspect-square bg-slate-900/50 rounded-lg flex items-center justify-center cursor-pointer border-2 border-dashed border-slate-600 hover:border-amber-500 transition-colors"
      >
        <input
          type="file"
          ref={fileInputRef}
          onChange={handleFileChange}
          accept="image/*"
          className="hidden"
        />
        {imagePreview ? (
          <img src={imagePreview} alt={label} className="object-contain h-full w-full rounded-md p-1" />
        ) : (
          <div className="text-slate-500 flex flex-col items-center">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10 mb-2" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
            <span>Click to upload</span>
          </div>
        )}
      </div>
    </div>
  );
};

export default FileUpload;
