'use client';

import { usePlayground } from './hooks/use-playground';
import { PlaygroundHeader } from './components/playground-header';
import { CodeEditor } from './components/code-editor';
import { WebEditor } from './components/web-editor';
import { WebPreview } from './components/web-preview';
import { StdinEditor } from './components/stdin-editor';
import { OutputPanel } from './components/output-panel';

export default function PlaygroundPage() {
  const playground = usePlayground();
  const isWeb = playground.language === 'web';

  return (
    <div className="space-y-6 max-w-7xl mx-auto px-4 py-8">
      {playground.modal}

      {/* Header containing title and runtime selector */}
      <PlaygroundHeader
        language={playground.language}
        setLanguage={playground.setLanguage}
        handleRun={playground.handleRun}
        isRunning={playground.executeMutation.isPending}
        showRunButton={!isWeb}
      />

      {/* Main Workspace Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Editor panel & input panel */}
        <div className="lg:col-span-7 space-y-6">
          {isWeb ? (
            <WebEditor
              files={playground.webFiles}
              setFiles={playground.setWebFiles}
              onReset={playground.resetCode}
              resetToken={playground.resetToken}
            />
          ) : (
            <CodeEditor
              code={playground.code}
              setCode={playground.setCode}
              language={playground.language}
              onReset={playground.resetCode}
              resetToken={playground.resetToken}
            />
          )}
          {!isWeb && (
            <StdinEditor
              stdin={playground.stdin}
              setStdin={playground.setStdin}
            />
          )}
        </div>

        {/* Right Column: Console output panel */}
        <div className="lg:col-span-5">
          {isWeb ? (
            <WebPreview files={playground.webFiles} />
          ) : (
            <OutputPanel mutation={playground.executeMutation} />
          )}
        </div>
      </div>
    </div>
  );
}
