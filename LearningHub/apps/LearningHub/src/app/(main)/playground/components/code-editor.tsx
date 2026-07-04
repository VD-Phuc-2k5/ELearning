'use client';

import { FileCode2, RefreshCw } from 'lucide-react';
import Editor from '@monaco-editor/react';

interface CodeEditorProps {
  code: string;
  setCode: (value: string) => void;
  onReset: () => void;
  language?: string;
}

export function CodeEditor({
  code,
  setCode,
  onReset,
  language = 'python',
}: CodeEditorProps) {
  // Map our internal language values to Monaco Editor languages
  const getMonacoLanguage = (lang: string) => {
    switch (lang) {
      case 'python':
        return 'python';
      case 'javascript':
        return 'javascript';
      case 'typescript':
        return 'typescript';
      case 'cpp':
        return 'cpp';
      case 'c':
        return 'c';
      case 'java':
        return 'java';
      case 'go':
        return 'go';
      case 'rust':
        return 'rust';
      case 'csharp':
        return 'csharp';
      case 'swift':
        return 'swift';
      default:
        return 'plaintext';
    }
  };

  return (
    <div className="rounded-3xl border border-slate-200 bg-white shadow-sm overflow-hidden flex flex-col h-[500px]">
      <div className="bg-slate-50 px-6 py-4 border-b border-slate-100 flex justify-between items-center">
        <span className="text-sm font-semibold text-slate-700 flex items-center gap-2">
          <FileCode2 className="h-4 w-4 text-indigo-500" />
          Source Code
        </span>
        <button
          onClick={onReset}
          className="text-xs font-medium text-slate-500 hover:text-indigo-600 flex items-center gap-1"
        >
          <RefreshCw className="h-3 w-3" /> Reset template
        </button>
      </div>

      <div className="flex-1 w-full relative min-h-[300px] bg-[#1e1e1e]">
        <Editor
          height="100%"
          language={getMonacoLanguage(language)}
          theme="vs-dark"
          value={code}
          onChange={(val) => setCode(val || '')}
          options={{
            minimap: { enabled: false },
            fontSize: 14,
            fontFamily: 'Consolas, "Courier New", monospace',
            automaticLayout: true,
            scrollBeyondLastLine: false,
            padding: { top: 16, bottom: 16 },
            tabSize: 4,
            cursorBlinking: 'smooth',
            lineNumbersMinChars: 3,
            formatOnType: true,
          }}
        />
      </div>
    </div>
  );
}
