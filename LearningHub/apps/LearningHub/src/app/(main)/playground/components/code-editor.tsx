'use client';

import { useMemo } from 'react';
import { FileCode2, RefreshCw } from 'lucide-react';
import Editor, { loader } from '@monaco-editor/react';
import * as monaco from 'monaco-editor';

loader.config({ monaco });

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
          value={code}
          onChange={(val) => setCode(val || '')}
          options={editorOptions}
          beforeMount={(monaco) => {
            monaco.languages.typescript.typescriptDefaults.setCompilerOptions({
              target: monaco.languages.typescript.ScriptTarget.ESNext,
              module: monaco.languages.typescript.ModuleKind.ESNext,
              strict: true,
              noUnusedLocals: true,
              noUnusedParameters: true,
              noImplicitReturns: true,
              noFallthroughCasesInSwitch: true,
            });
            monaco.languages.typescript.typescriptDefaults.setDiagnosticsOptions(
              {
                noSemanticValidation: false,
                noSyntaxValidation: false,
              },
            );
            monaco.languages.typescript.javascriptDefaults.setCompilerOptions({
              target: monaco.languages.typescript.ScriptTarget.ESNext,
              module: monaco.languages.typescript.ModuleKind.ESNext,
              strict: true,
              noUnusedLocals: true,
              noUnusedParameters: true,
              noImplicitReturns: true,
              noFallthroughCasesInSwitch: true,
            });
            monaco.languages.typescript.javascriptDefaults.setDiagnosticsOptions(
              {
                noSemanticValidation: false,
                noSyntaxValidation: false,
              },
            );
          }}
        />
      </div>
    </div>
  );
}
