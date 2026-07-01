'use client';

import { useRef } from 'react';
import { Image, Upload, Trash2 } from 'lucide-react';

interface ForumBannerProps {
  bannerUrl?: string;
  isOwner: boolean;
  isUploading: boolean;
  isRemoving: boolean;
  onUpload: (file: File) => void;
  onRemove: () => void;
}

export function ForumBanner({
  bannerUrl,
  isOwner,
  isUploading,
  isRemoving,
  onUpload,
  onRemove,
}: ForumBannerProps) {
  const inputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) onUpload(file);
    e.target.value = '';
  };

  if (isOwner) {
    return (
      <div className="relative">
        <input
          ref={inputRef}
          type="file"
          accept="image/*"
          className="hidden"
          onChange={handleFileChange}
        />
        {bannerUrl ? (
          <div className="w-full bg-slate-100">
            <img
              src={bannerUrl}
              alt="Forum banner"
              className="w-full object-contain border border-slate-100"
            />
            <div className="absolute top-2 right-2 flex gap-1">
              <button
                type="button"
                onClick={() => inputRef.current?.click()}
                disabled={isUploading}
                className="rounded-md bg-white/90 px-2 py-1 text-xs font-medium text-slate-700 shadow hover:bg-white transition"
              >
                <Upload className="h-3 w-3 inline mr-1" />
                Change
              </button>
              <button
                type="button"
                onClick={onRemove}
                disabled={isRemoving}
                className="rounded-md bg-white/90 px-2 py-1 text-xs font-medium text-red-600 shadow hover:bg-white transition"
              >
                <Trash2 className="h-3 w-3 inline mr-1" />
                Remove
              </button>
            </div>
          </div>
        ) : (
          <div className="relative h-20 bg-slate-50 flex items-center justify-center border-b border-slate-100">
            <button
              type="button"
              onClick={() => inputRef.current?.click()}
              disabled={isUploading}
              className="flex items-center gap-1.5 rounded-lg border border-dashed border-slate-300 px-3 py-1.5 text-xs text-slate-400 hover:border-slate-400 hover:text-slate-600 transition"
            >
              <Image className="h-3.5 w-3.5" />
              {isUploading ? 'Uploading...' : 'Add banner'}
            </button>
          </div>
        )}
      </div>
    );
  }

  if (!bannerUrl) return null;

  return (
    <div className="w-full bg-slate-100">
      <img
        src={bannerUrl}
        alt="Forum banner"
        className="w-full object-contain border border-slate-100"
      />
    </div>
  );
}
