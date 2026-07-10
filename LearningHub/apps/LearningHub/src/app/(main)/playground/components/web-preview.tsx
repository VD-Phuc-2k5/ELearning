'use client';

import { useEffect, useState } from 'react';
import { Monitor } from 'lucide-react';
import { WebFiles } from '../hooks/use-playground';

interface WebPreviewProps {
  files: WebFiles;
}

export function WebPreview({ files }: WebPreviewProps) {
  const [srcDoc, setSrcDoc] = useState('');

  useEffect(() => {
    const timeout = setTimeout(() => {
      setSrcDoc(
        `<!DOCTYPE html><html><head><style>${files.css}</style></head><body>${files.html}<script>${files.js}</script></body></html>`,
      );
    }, 300);
    return () => clearTimeout(timeout);
  }, [files.html, files.css, files.js]);

  return (
    <div className="rounded-3xl border border-slate-200 bg-white shadow-xl overflow-hidden flex flex-col h-[640px]">
      <div className="bg-slate-50 px-6 py-4 border-b border-slate-100 flex items-center gap-2">
        <Monitor className="h-4 w-4 text-indigo-500" />
        <span className="text-sm font-semibold text-slate-700">
          Live Preview
        </span>
      </div>
      <iframe
        title="web-preview"
        srcDoc={srcDoc}
        sandbox="allow-scripts"
        className="flex-1 w-full bg-white"
      />
    </div>
  );
}
