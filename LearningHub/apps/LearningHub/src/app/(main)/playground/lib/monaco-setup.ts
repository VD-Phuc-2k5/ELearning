import { loader } from '@monaco-editor/react';
import * as monaco from 'monaco-editor';

loader.config({ monaco });

// Self-hosted monaco-editor needs its workers wired up manually, otherwise
// the language services fall back to a lazy main-thread path and squiggly
// diagnostics only appear once something (e.g. hover) forces a recompute.
if (typeof window !== 'undefined') {
  self.MonacoEnvironment = {
    getWorker(_workerId: string, label: string) {
      switch (label) {
        case 'json':
          return new Worker(
            new URL(
              'monaco-editor/esm/vs/language/json/json.worker.js',
              import.meta.url,
            ),
          );
        case 'css':
        case 'scss':
        case 'less':
          return new Worker(
            new URL(
              'monaco-editor/esm/vs/language/css/css.worker.js',
              import.meta.url,
            ),
          );
        case 'html':
        case 'handlebars':
        case 'razor':
          return new Worker(
            new URL(
              'monaco-editor/esm/vs/language/html/html.worker.js',
              import.meta.url,
            ),
          );
        case 'typescript':
        case 'javascript':
          return new Worker(
            new URL(
              'monaco-editor/esm/vs/language/typescript/ts.worker.js',
              import.meta.url,
            ),
          );
        default:
          return new Worker(
            new URL(
              'monaco-editor/esm/vs/editor/editor.worker.js',
              import.meta.url,
            ),
          );
      }
    },
  };

  monaco.typescript.typescriptDefaults.setCompilerOptions({
    target: monaco.typescript.ScriptTarget.ESNext,
    module: monaco.typescript.ModuleKind.ESNext,
    strict: true,
    noUnusedLocals: true,
    noUnusedParameters: true,
    noImplicitReturns: true,
    noFallthroughCasesInSwitch: true,
  });
  monaco.typescript.typescriptDefaults.setDiagnosticsOptions({
    noSemanticValidation: false,
    noSyntaxValidation: false,
  });
  monaco.typescript.javascriptDefaults.setCompilerOptions({
    target: monaco.typescript.ScriptTarget.ESNext,
    module: monaco.typescript.ModuleKind.ESNext,
    strict: true,
    noUnusedLocals: true,
    noUnusedParameters: true,
    noImplicitReturns: true,
    noFallthroughCasesInSwitch: true,
  });
  monaco.typescript.javascriptDefaults.setDiagnosticsOptions({
    noSemanticValidation: false,
    noSyntaxValidation: false,
  });
}
