'use client';

import { useEffect, useMemo, useRef } from 'react';
import { FileCode2, RefreshCw } from 'lucide-react';
import Editor, { OnMount } from '@monaco-editor/react';
import '../lib/monaco-setup';

interface CodeEditorProps {
  code: string;
  setCode: (value: string) => void;
  onReset: () => void;
  language?: string;
  // Bumped by the parent whenever `code` must be force-pushed into the editor
  // from outside (Reset button, confirmed language switch). The editor is
  // otherwise uncontrolled so React re-renders don't fight the user's cursor
  // position while typing.
  resetToken: number;
}

export function CodeEditor({
  code,
  setCode,
  onReset,
  language = 'python',
  resetToken,
}: CodeEditorProps) {
  const editorRef = useRef<Parameters<OnMount>[0] | null>(null);
  const initialCode = useRef(code);
  const isFirstReset = useRef(true);

  useEffect(() => {
    if (isFirstReset.current) {
      isFirstReset.current = false;
      return;
    }
    editorRef.current?.setValue(code);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [resetToken]);

  const monacoLanguage = useMemo(() => {
    switch (language) {
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
  }, [language]);

  const editorOptions = useMemo(
    () => ({
      minimap: { enabled: false },
      fontSize: 14,
      fontFamily: 'Consolas, "Courier New", monospace',
      automaticLayout: true,
      scrollBeyondLastLine: false,
      padding: { top: 16, bottom: 16 },
      tabSize: 4,
      cursorBlinking: 'smooth' as const,
      lineNumbersMinChars: 3,
      formatOnType: true,
    }),
    [],
  );

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
          language={monacoLanguage}
          theme="vs-dark"
          defaultValue={initialCode.current}
          onMount={(editor) => {
            editorRef.current = editor;
          }}
          onChange={(val) => setCode(val || '')}
          options={editorOptions}
        />
      </div>
    </div>
  );
}
