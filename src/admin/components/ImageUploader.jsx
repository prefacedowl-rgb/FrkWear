import React, { useState, useRef } from 'react';
import { Upload, X, Loader2, ArrowLeft, ArrowRight } from 'lucide-react';
import { uploadImage } from '../../lib/api';

export default function ImageUploader({ images = [], onChange, maxImages = 6 }) {
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef(null);

  const handleFileChange = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    try {
      const response = await uploadImage(file);
      if (response && response.url) {
        onChange([...images, response.url]);
      }
    } catch (err) {
      console.error('Upload failed:', err);
      alert(err.message || 'Image upload failed');
    } finally {
      setUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const removeImage = (indexToRemove) => {
    onChange(images.filter((_, idx) => idx !== indexToRemove));
  };

  // Reorder images by shifting position left or right
  const moveImage = (index, direction) => {
    const nextIndex = index + direction;
    if (nextIndex < 0 || nextIndex >= images.length) return;
    
    const newImages = [...images];
    const temp = newImages[index];
    newImages[index] = newImages[nextIndex];
    newImages[nextIndex] = temp;
    onChange(newImages);
  };

  return (
    <div className="space-y-4 text-left">
      <div className="flex justify-between items-center">
        <label className="font-mono text-xs text-gray-400 font-bold uppercase tracking-widest">
          IMAGES CATALOG (MAX {maxImages})
        </label>
        <span className="font-mono text-xs text-gray-500 font-bold">{images.length}/{maxImages}</span>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-4">
        {images.map((url, idx) => (
          <div
            key={url + idx}
            className="aspect-[4/5] bg-[#0F0F0F] border border-[#C8FF00]/15 relative group overflow-hidden"
          >
            <img src={url} alt="" className="w-full h-full object-cover" />
            
            {/* Cover Badge */}
            {idx === 0 ? (
              <span className="absolute bottom-1.5 left-1.5 bg-[#C8FF00] text-[#0F0F0F] font-mono text-[9px] px-1.5 py-0.5 font-bold uppercase z-10">
                COVER
              </span>
            ) : (
              <span className="absolute bottom-1.5 left-1.5 bg-black/60 text-gray-400 font-mono text-[9px] px-1.5 py-0.5 font-bold uppercase z-10">
                #{idx + 1}
              </span>
            )}
            
            {/* Top Control Panel */}
            <div className="absolute top-1.5 left-1.5 right-1.5 flex justify-between items-center opacity-0 group-hover:opacity-100 transition-opacity bg-black/80 p-1">
              <div className="flex gap-1">
                {idx > 0 && (
                  <button
                    type="button"
                    onClick={() => moveImage(idx, -1)}
                    className="text-white hover:text-[#C8FF00] p-0.5 transition-colors cursor-pointer"
                    title="Move Left"
                  >
                    <ArrowLeft className="w-3 h-3" />
                  </button>
                )}
                {idx < images.length - 1 && (
                  <button
                    type="button"
                    onClick={() => moveImage(idx, 1)}
                    className="text-white hover:text-[#C8FF00] p-0.5 transition-colors cursor-pointer"
                    title="Move Right"
                  >
                    <ArrowRight className="w-3 h-3" />
                  </button>
                )}
              </div>
              <button
                type="button"
                onClick={() => removeImage(idx)}
                className="text-gray-400 hover:text-[#FF2D78] p-0.5 transition-colors cursor-pointer"
                title="Remove image"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        ))}

        {images.length < maxImages && (
          <button
            type="button"
            disabled={uploading}
            onClick={() => fileInputRef.current?.click()}
            className="aspect-[4/5] bg-[#1A1A1A] border border-dashed border-[#C8FF00]/30 hover:border-[#C8FF00] flex flex-col items-center justify-center gap-2 cursor-pointer transition-colors text-gray-400 hover:text-[#C8FF00] p-4 text-center disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {uploading ? (
              <>
                <Loader2 className="w-6 h-6 animate-spin text-[#C8FF00]" />
                <span className="font-mono text-[9px] uppercase tracking-wider">UPLOADING...</span>
              </>
            ) : (
              <>
                <Upload className="w-5 h-5" />
                <span className="font-mono text-[9px] uppercase tracking-wider font-bold">ADD IMAGE</span>
              </>
            )}
          </button>
        )}
      </div>

      <input
        type="file"
        ref={fileInputRef}
        onChange={handleFileChange}
        accept="image/*"
        className="hidden"
      />
    </div>
  );
}
