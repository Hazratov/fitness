
import React, { useRef, useState } from "react";
import { ImagePlus, X } from "lucide-react";

interface ImageUploaderProps {
  imageUrl: string | null;
  onImageUpload: (file: File) => void;
  placeholder?: string;
  className?: string;
  icon?: React.ReactNode;
}

const ImageUploader: React.FC<ImageUploaderProps> = ({
  imageUrl,
  onImageUpload,
  placeholder = "Rasm yuklash",
  className = "h-64",
  icon = <ImagePlus size={48} className="mx-auto mb-2 text-gray-400" />
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);

  return (
    <div
      className={`
        border-2 border-dashed rounded-lg p-4 ${className} flex flex-col items-center justify-center
        ${imageUrl ? 'border-[#2c3855]' : 'border-[#3b82f6] border-opacity-50 hover:border-opacity-100'}
        transition-all cursor-pointer bg-[#131c2e]
      `}
      onClick={() => fileInputRef.current?.click()}
    >
      {imageUrl ? (
        <div className="relative w-full h-full">
          <img 
            src={imageUrl} 
            alt="Upload preview" 
            className="w-full h-full object-cover rounded-md"
          />
          <button 
            className="absolute top-2 right-2 bg-black bg-opacity-50 rounded-full p-1"
            onClick={(e) => {
              e.stopPropagation();
              onImageUpload(new File([], ""));
            }}
          >
            <X size={16} />
          </button>
        </div>
      ) : (
        <div className="text-center">
          {icon}
          <p className="text-sm text-gray-400">{placeholder}</p>
          <p className="text-xs text-gray-500 mt-1">Rasmning formati JPG yoki PNG, o'lchami max: 5MB</p>
        </div>
      )}
      <input 
        type="file" 
        ref={fileInputRef}
        className="hidden" 
        accept="image/*"
        onChange={(e) => {
          const file = e.target.files?.[0];
          if (file) onImageUpload(file);
        }}
      />
    </div>
  );
};

export default ImageUploader;
