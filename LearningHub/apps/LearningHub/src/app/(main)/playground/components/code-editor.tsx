import { FileCode2, RefreshCw } from 'lucide-react';

interface CodeEditorProps {
  code: string;
  setCode: (value: string) => void;
  onReset: () => void;
}

export function CodeEditor({ code, setCode, onReset }: CodeEditorProps) {
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
      <textarea
        value={code}
        onChange={(e) => setCode(e.target.value)}
        className="flex-1 w-full p-6 font-mono text-sm bg-slate-900 text-slate-100 focus:outline-none resize-none"
        spellCheck="false"
        placeholder="Write your code here..."
      />
    </div>
  );
}
