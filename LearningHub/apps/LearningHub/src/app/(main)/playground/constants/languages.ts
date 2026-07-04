export type Language =
  | 'python'
  | 'javascript'
  | 'c'
  | 'java'
  | 'go'
  | 'csharp'
  | 'cpp'
  | 'rust'
  | 'typescript'
  | 'swift';

export const LANGUAGES: { value: Language; label: string }[] = [
  { value: 'python', label: 'Python 3' },
  { value: 'javascript', label: 'Node.js (JavaScript)' },
  { value: 'typescript', label: 'Deno (TypeScript)' },
  { value: 'c', label: 'GCC (C)' },
  { value: 'cpp', label: 'G++ (C++)' },
  { value: 'java', label: 'Java 17' },
  { value: 'go', label: 'Go (Golang)' },
  { value: 'csharp', label: 'C# (.NET)' },
  { value: 'rust', label: 'Rust' },
  { value: 'swift', label: 'Swift' },
];
