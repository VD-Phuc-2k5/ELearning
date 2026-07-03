'use client';

import { usePlayground } from './hooks/use-playground';
import { PlaygroundHeader } from './components/playground-header';
import { CodeEditor } from './components/code-editor';
import { StdinEditor } from './components/stdin-editor';
import { OutputPanel } from './components/output-panel';
import { DEFAULT_TEMPLATES } from './constants/templates';

export default function PlaygroundPage() {
  const playground = usePlayground();

  return (
    <div className="space-y-6 max-w-7xl mx-auto px-4 py-8">
      {/* Header containing title and runtime selector */}
      <PlaygroundHeader
        language={playground.language}
        setLanguage={playground.setLanguage}
        handleRun={playground.handleRun}
        isRunning={playground.executeMutation.isPending}
      />

      {/* Main Workspace Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Editor panel & input panel */}
        <div className="lg:col-span-7 space-y-6">
          <CodeEditor
            code={playground.code}
            setCode={playground.setCode}
            onReset={() =>
              playground.setCode(DEFAULT_TEMPLATES[playground.language])
            }
          />
          <StdinEditor
            stdin={playground.stdin}
            setStdin={playground.setStdin}
          />
        </div>

        {/* Right Column: Console output panel */}
        <div className="lg:col-span-5">
          <OutputPanel mutation={playground.executeMutation} />
        </div>
      </div>
    </div>
  );
}
