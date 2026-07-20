import { Cpu, Play } from 'lucide-react';
import { Button } from '../../../../components/ui';
import { Language } from '../constants/languages';
import { LanguageSelector } from './language-selector';

interface PlaygroundHeaderProps {
  language: Language;
  setLanguage: (value: Language) => void;
  handleRun: () => void;
  isRunning: boolean;
  showRunButton?: boolean;
}

export function PlaygroundHeader({
  language,
  setLanguage,
  handleRun,
  isRunning,
  showRunButton = true,
}: PlaygroundHeaderProps) {
  return (
    <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 border-b border-slate-100 pb-6">
      <div>
        <h1 className="text-3xl font-bold text-slate-900 tracking-tight flex items-center gap-2">
          <Cpu className="h-8 w-8 text-indigo-600 animate-pulse" />
          Code Sandbox Playground
        </h1>
        <p className="text-slate-500 text-sm mt-1">
          Run your code in a secure, isolated Docker container with real-time
          feedback.
        </p>
      </div>

      <div className="flex items-center gap-4">
        <LanguageSelector value={language} onChange={setLanguage} />

        {showRunButton && (
          <Button
            onClick={handleRun}
            isLoading={isRunning}
            icon={<Play className="h-4 w-4 fill-current" />}
            className="rounded-xl font-semibold shadow-lg shadow-indigo-100"
          >
            Run Code
          </Button>
        )}
      </div>
    </div>
  );
}
