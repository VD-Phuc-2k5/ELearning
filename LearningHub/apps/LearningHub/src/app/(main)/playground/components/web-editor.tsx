'use client';

import { useEffect, useRef, useState } from 'react';
import { RefreshCw } from 'lucide-react';
import Editor, { OnMount } from '@monaco-editor/react';
import '../lib/monaco-setup';
import { WebFiles } from '../hooks/use-playground';

interface WebEditorProps {
  files: WebFiles;
  setFiles: (files: WebFiles | ((prev: WebFiles) => WebFiles)) => void;
  onReset: () => void;
  resetToken: number;
}

const TABS: { key: keyof WebFiles; label: string; language: string }[] = [
  { key: 'html', label: 'HTML', language: 'html' },
  { key: 'css', label: 'CSS', language: 'css' },
  { key: 'js', label: 'JavaScript', language: 'javascript' },
];

export function WebEditor({
  files,
  setFiles,
  onReset,
  resetToken,
}: WebEditorProps) {
  const [activeTab, setActiveTab] = useState<keyof WebFiles>('html');
  const editorRefs = useRef<
    Record<keyof WebFiles, Parameters<OnMount>[0] | null>
  >({
    html: null,
    css: null,
    js: null,
  });
  const initialFiles = useRef(files);
  const isFirstReset = useRef(true);

  useEffect(() => {
    if (isFirstReset.current) {
      isFirstReset.current = false;
      return;
    }
    (Object.keys(editorRefs.current) as (keyof WebFiles)[]).forEach((key) => {
      editorRefs.current[key]?.setValue(files[key]);
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [resetToken]);

  return (
    <div className="rounded-3xl border border-slate-200 bg-white shadow-sm overflow-hidden flex flex-col h-[500px]">
      <div className="bg-slate-50 px-4 py-2 border-b border-slate-100 flex justify-between items-center">
        <div className="flex gap-1">
          {TABS.map((tab) => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition ${
                activeTab === tab.key
                  ? 'bg-indigo-600 text-white'
                  : 'text-slate-500 hover:text-indigo-600'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
        <button
          onClick={onReset}
          className="text-xs font-medium text-slate-500 hover:text-indigo-600 flex items-center gap-1"
        >
          <RefreshCw className="h-3 w-3" /> Reset template
        </button>
      </div>

      <div className="flex-1 w-full relative min-h-[300px] bg-[#1e1e1e]">
        {TABS.map((tab) => (
          <div
            key={tab.key}
            className="absolute inset-0"
            style={{ display: activeTab === tab.key ? 'block' : 'none' }}
          >
            <Editor
              height="100%"
              language={tab.language}
              theme="vs-dark"
              defaultValue={initialFiles.current[tab.key]}
              onMount={(editor) => {
                editorRefs.current[tab.key] = editor;
              }}
              onChange={(val) =>
                setFiles((prev) => ({ ...prev, [tab.key]: val ?? '' }))
              }
              options={{
                minimap: { enabled: false },
                fontSize: 14,
                fontFamily: 'Consolas, "Courier New", monospace',
                automaticLayout: true,
                scrollBeyondLastLine: false,
                padding: { top: 16, bottom: 16 },
                tabSize: 2,
              }}
            />
          </div>
        ))}
      </div>
    </div>
  );
}
