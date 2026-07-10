import { Terminal } from 'lucide-react';

interface StdinEditorProps {
  stdin: string;
  setStdin: (value: string) => void;
}

export function StdinEditor({ stdin, setStdin }: StdinEditorProps) {
  return (
    <div className="rounded-3xl border border-slate-200 bg-white shadow-sm overflow-hidden">
      <div className="bg-slate-50 px-6 py-3 border-b border-slate-100">
        <span className="text-sm font-semibold text-slate-700 flex items-center gap-2">
          <Terminal className="h-4 w-4 text-indigo-500" />
          Standard Input (stdin)
        </span>
      </div>
      <textarea
        value={stdin}
        onChange={(e) => setStdin(e.target.value)}
        className="w-full p-4 font-mono text-sm bg-slate-50 text-slate-800 outline-none focus:ring-2 focus:ring-inset focus:ring-indigo-500 border-t border-slate-100 h-24 resize-none"
        placeholder="Provide program inputs here (one per line)..."
      />
    </div>
  );
}
