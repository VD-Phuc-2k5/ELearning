'use client';

interface CommentContentProps {
  content: string;
}

export function CommentContent({ content }: CommentContentProps) {
  const parts = content.split(/(@[\w.-]+)/g).filter(Boolean);

  return (
    <p className="mt-1 text-xs text-slate-700 whitespace-pre-wrap">
      {parts.map((part, i) => {
        if (part.startsWith('@')) {
          return (
            <span
              key={i}
              className="bg-indigo-100 text-indigo-700 font-semibold rounded px-0.5 whitespace-nowrap"
            >
              {part}
            </span>
          );
        }
        return <span key={i}>{part}</span>;
      })}
    </p>
  );
}
