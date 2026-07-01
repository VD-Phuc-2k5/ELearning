'use client';

import type { RefObject } from 'react';
import { Upload, Trash2, Image } from 'lucide-react';

interface ForumIconManagerProps {
  iconUrl?: string;
  inputRef: RefObject<HTMLInputElement | null>;
  isUploading: boolean;
  isRemoving: boolean;
  onUpload: (file: File) => void;
  onRemove: () => void;
}

export function ForumIconManager({
  iconUrl,
  inputRef,
  isUploading,
  isRemoving,
  onUpload,
  onRemove,
}: ForumIconManagerProps) {
  return (
    <div className="relative shrink-0">
      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={(e) => {
          const file = e.target.files?.[0];
          if (file) onUpload(file);
          e.target.value = '';
        }}
      />
      {iconUrl ? (
        <div className="relative group">
          <img
            src={iconUrl}
            alt="Forum icon"
            className="h-10 w-10 rounded-xl object-cover"
          />
          <div className="absolute inset-0 rounded-xl bg-black/40 opacity-0 group-hover:opacity-100 transition flex items-center justify-center gap-0.5">
            <button
              type="button"
              onClick={() => inputRef.current?.click()}
              disabled={isUploading}
              className="text-white hover:text-indigo-200 transition"
              title="Change icon"
            >
              <Upload className="h-3.5 w-3.5" />
            </button>
            <button
              type="button"
              onClick={onRemove}
              disabled={isRemoving}
              className="text-white hover:text-red-300 transition"
              title="Remove icon"
            >
              <Trash2 className="h-3.5 w-3.5" />
            </button>
          </div>
        </div>
      ) : (
        <div className="relative">
          <div className="h-10 w-10 rounded-xl bg-slate-100 flex items-center justify-center">
            <Image className="h-5 w-5 text-slate-400" />
          </div>
          <button
            type="button"
            onClick={() => inputRef.current?.click()}
            disabled={isUploading}
            className="absolute inset-0 rounded-xl bg-black/30 opacity-0 hover:opacity-100 transition flex items-center justify-center"
            title="Add icon"
          >
            <Upload className="h-3.5 w-3.5 text-white" />
          </button>
        </div>
      )}
    </div>
  );
}
