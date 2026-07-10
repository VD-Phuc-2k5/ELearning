'use client';

import { useRef } from 'react';
import dynamic from 'next/dynamic';
import type { BeforeMount } from '@monaco-editor/react';

const MonacoEditor = dynamic(
  () => import('@monaco-editor/react').then((m) => m.default),
  { ssr: false },
);

// Monaco has no built-in Dracula theme — register the standard Dracula
// palette (draculatheme.com) once before mount.
const handleBeforeMount: BeforeMount = (monaco) => {
  monaco.editor.defineTheme('dracula', {
    base: 'vs-dark',
    inherit: true,
    rules: [
      { token: 'comment', foreground: '6272a4' },
      { token: 'string', foreground: 'f1fa8c' },
      { token: 'number', foreground: 'bd93f9' },
      { token: 'keyword', foreground: 'ff79c6' },
      { token: 'identifier', foreground: 'f8f8f2' },
      { token: 'type', foreground: '8be9fd' },
      { token: 'function', foreground: '50fa7b' },
    ],
    colors: {
      'editor.background': '#282a36',
      'editor.foreground': '#f8f8f2',
      'editorLineNumber.foreground': '#6272a4',
      'editorLineNumber.activeForeground': '#f8f8f2',
      'editor.selectionBackground': '#44475a',
      'editor.lineHighlightBackground': '#44475a',
      'editorCursor.foreground': '#f8f8f2',
      'editorIndentGuide.background': '#44475a',
    },
  });
};

const LANG_MAP: Record<string, string> = {
  python: 'python',
  javascript: 'javascript',
  typescript: 'typescript',
  cpp: 'cpp',
  c: 'c',
  java: 'java',
  go: 'go',
  rust: 'rust',
  csharp: 'csharp',
  swift: 'swift',
};

interface CodeInputProps {
  value: string;
  onChange: (val: string) => void;
  language: string;
  height?: number;
}

export function CodeInput({
  value,
  onChange,
  language,
  height = 220,
}: CodeInputProps) {
  const initialValue = useRef(value);

  return (
    <div className="rounded-xl border border-slate-200 overflow-hidden">
      <MonacoEditor
        height={height}
        language={LANG_MAP[language] ?? 'plaintext'}
        theme="dracula"
        beforeMount={handleBeforeMount}
        defaultValue={initialValue.current}
        onChange={(v) => onChange(v ?? '')}
        options={{
          minimap: { enabled: false },
          fontSize: 12,
          lineNumbers: 'on',
          scrollBeyondLastLine: false,
          padding: { top: 8, bottom: 8 },
          folding: false,
          glyphMargin: false,
          contextmenu: false,
          scrollbar: { verticalScrollbarSize: 6 },
          quickSuggestions: true,
          suggestOnTriggerCharacters: true,
          tabCompletion: 'on',
        }}
      />
    </div>
  );
}
