import { Terminal, Clock, AlertCircle } from 'lucide-react';
import { StatusBadge } from './status-badge';

interface OutputPanelProps {
  mutation: any;
}

export function OutputPanel({ mutation }: OutputPanelProps) {
  const { isPending, data, error } = mutation;

  return (
    <div className="rounded-3xl border border-slate-200 bg-slate-900 shadow-xl overflow-hidden flex flex-col h-[640px] text-slate-200">
      <div className="bg-slate-800 px-6 py-4 border-b border-slate-700/60 flex justify-between items-center">
        <span className="text-sm font-semibold text-slate-300 flex items-center gap-2">
          <Terminal className="h-4 w-4 text-indigo-400" />
          Console Output
        </span>
        {data && <StatusBadge status={data.status} />}
      </div>

      {/* Terminal display */}
      <div className="flex-1 p-6 font-mono text-sm overflow-y-auto space-y-4">
        {isPending && (
          <div className="flex items-center gap-2 text-slate-400 animate-pulse">
            <span className="h-2 w-2 rounded-full bg-indigo-500 animate-ping" />
            Running inside isolated sandbox...
          </div>
        )}

        {!isPending && !data && !error && (
          <div className="text-slate-500 italic py-12 text-center">
            Press 'Run Code' to execute your program.
          </div>
        )}

        {error && (
          <div className="text-red-400 border border-red-500/20 bg-red-500/5 p-4 rounded-xl flex items-start gap-2">
            <AlertCircle className="h-4 w-4 shrink-0 mt-0.5" />
            <div>
              <div className="font-bold">Execution Error:</div>
              <div className="text-xs mt-1 whitespace-pre-wrap">
                {error.message}
              </div>
            </div>
          </div>
        )}

        {data && (
          <div className="space-y-4">
            {/* Stats bar */}
            <div className="grid grid-cols-3 gap-2 bg-slate-800/40 border border-slate-700/30 p-3 rounded-xl text-xs text-slate-400">
              <div>
                <span className="block text-slate-500 uppercase tracking-widest text-[9px]">
                  Execution Time
                </span>
                <span className="font-semibold text-slate-300 flex items-center gap-1">
                  <Clock className="h-3 w-3 text-slate-400" />
                  {data.executionTimeMs} ms
                </span>
              </div>
              <div>
                <span className="block text-slate-500 uppercase tracking-widest text-[9px]">
                  Exit Code
                </span>
                <span className="font-semibold text-slate-300">
                  {data.exitCode !== null ? data.exitCode : 'N/A'}
                </span>
              </div>
              <div>
                <span className="block text-slate-500 uppercase tracking-widest text-[9px]">
                  OOM Status
                </span>
                <span className="font-semibold text-slate-300">
                  {data.status === 'memory_limit' ? 'Killed' : 'Healthy'}
                </span>
              </div>
            </div>

            {/* Stdout */}
            {data.stdout && (
              <div className="space-y-1">
                <span className="text-[10px] text-slate-500 font-bold uppercase tracking-wider block">
                  Standard Output
                </span>
                <pre className="bg-slate-950 p-4 rounded-xl border border-slate-800/40 text-emerald-400 overflow-x-auto whitespace-pre-wrap">
                  {data.stdout}
                </pre>
              </div>
            )}

            {/* Stderr */}
            {data.stderr && (
              <div className="space-y-1">
                <span className="text-[10px] text-slate-500 font-bold uppercase tracking-wider block">
                  Standard Error
                </span>
                <pre className="bg-slate-950 p-4 rounded-xl border border-slate-800/40 text-rose-400 overflow-x-auto whitespace-pre-wrap">
                  {data.stderr}
                </pre>
              </div>
            )}

            {!data.stdout && !data.stderr && (
              <div className="text-slate-500 italic text-center py-6">
                (Program exited with no output)
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
