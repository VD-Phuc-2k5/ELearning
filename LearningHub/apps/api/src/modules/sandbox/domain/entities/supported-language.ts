export const SUPPORTED_LANGUAGES = {
  python: {
    image: 'sandbox-python',
    fileExt: '.py',
    runCmd: (file: string) => ['python3', file],
  },
  javascript: {
    image: 'sandbox-node',
    fileExt: '.js',
    runCmd: (file: string) => ['node', file],
  },
  c: {
    image: 'sandbox-c',
    fileExt: '.c',
  },
  java: {
    image: 'sandbox-java',
    fileExt: '.java',
  },
  go: {
    image: 'sandbox-go',
    fileExt: '.go',
  },
  csharp: {
    image: 'sandbox-csharp',
    fileExt: '.cs',
  },
  cpp: {
    image: 'sandbox-c', // same image but compiles with g++
    fileExt: '.cpp',
  },
  rust: {
    image: 'sandbox-rust',
    fileExt: '.rs',
  },
  typescript: {
    image: 'sandbox-typescript',
    fileExt: '.ts',
  },
  swift: {
    image: 'sandbox-swift',
    fileExt: '.swift',
  },
} as const;
