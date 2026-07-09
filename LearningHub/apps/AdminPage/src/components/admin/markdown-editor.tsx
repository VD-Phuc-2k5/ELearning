'use client';

import { useRef, useState } from 'react';
import dynamic from 'next/dynamic';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import {
  Bold,
  Italic,
  Code,
  Heading2,
  Link,
  List,
  ListOrdered,
  Quote,
  Eye,
  SplitSquareHorizontal,
  PenLine,
  Minus,
} from 'lucide-react';

const MonacoEditor = dynamic(
  () => import('@monaco-editor/react').then((m) => m.default),
  { ssr: false },
);

type ViewMode = 'write' | 'preview' | 'split';

interface MarkdownEditorProps {
  value: string;
  onChange: (val: string) => void;
  placeholder?: string;
  height?: number;
}

interface ToolbarAction {
  icon: React.ReactNode;
  title: string;
  action: (selected: string) => { text: string; offset: number };
  separator?: never;
}
interface ToolbarSeparator {
  separator: true;
  icon?: never;
  title?: never;
  action?: never;
}
type ToolbarItem = ToolbarAction | ToolbarSeparator;

export function MarkdownEditor({
  value,
  onChange,
  placeholder = 'Nhập nội dung Markdown...',
  height = 280,
}: MarkdownEditorProps) {
  const [mode, setMode] = useState<ViewMode>('split');
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const editorRef = useRef<any>(null);

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const handleEditorMount = (editor: any) => {
    editorRef.current = editor;
  };

  const toolbarItems: ToolbarItem[] = [
    {
      icon: <Heading2 className="h-3.5 w-3.5" />,
      title: 'Tiêu đề (H2)',
      action: (sel) => ({ text: `## ${sel || 'Tiêu đề'}`, offset: 3 }),
    },
    { separator: true },
    {
      icon: <Bold className="h-3.5 w-3.5" />,
      title: 'In đậm',
      action: (sel) => ({ text: `**${sel || 'text'}**`, offset: 2 }),
    },
    {
      icon: <Italic className="h-3.5 w-3.5" />,
      title: 'In nghiêng',
      action: (sel) => ({ text: `_${sel || 'text'}_`, offset: 1 }),
    },
    { separator: true },
    {
      icon: <Code className="h-3.5 w-3.5" />,
      title: 'Code inline',
      action: (sel) => ({ text: `\`${sel || 'code'}\``, offset: 1 }),
    },
    {
      icon: <Quote className="h-3.5 w-3.5" />,
      title: 'Blockquote',
      action: (sel) => {
        if (!sel) return { text: '> Trích dẫn', offset: 8 };
        const lines = sel.split('\n');
        const text = lines.map((line) => `> ${line}`).join('\n');
        return { text, offset: 0 };
      },
    },
    { separator: true },
    {
      icon: <List className="h-3.5 w-3.5" />,
      title: 'Danh sách bullet',
      action: (sel) => ({ text: `- ${sel || 'Item'}`, offset: 2 }),
    },
    {
      icon: <ListOrdered className="h-3.5 w-3.5" />,
      title: 'Danh sách số',
      action: (sel) => ({ text: `1. ${sel || 'Item'}`, offset: 3 }),
    },
    { separator: true },
    {
      icon: <Link className="h-3.5 w-3.5" />,
      title: 'Link',
      action: (sel) => ({
        text: `[${sel || 'label'}](url)`,
        offset: sel ? 6 : 12,
      }),
    },
    {
      icon: <Minus className="h-3.5 w-3.5" />,
      title: 'Đường kẻ ngang',
      action: () => ({ text: '\n---\n', offset: 0 }),
    },
  ];

  const handleToolbarClick = (item: ToolbarAction) => {
    const editor = editorRef.current;
    if (!editor) return;
    const selection = editor.getSelection();
    const selectedText = editor.getModel()?.getValueInRange(selection) ?? '';
    const { text, offset } = item.action(selectedText);

    editor.executeEdits('toolbar', [{ range: selection, text }]);

    if (!selectedText && offset > 0) {
      const pos = editor.getPosition();
      editor.setPosition({
        lineNumber: pos.lineNumber,
        column: pos.column - offset,
      });
    }
    editor.focus();
  };

  const modesConfig: { key: ViewMode; icon: React.ReactNode; label: string }[] =
    [
      {
        key: 'write',
        icon: <PenLine className="h-3.5 w-3.5" />,
        label: 'Viết',
      },
      {
        key: 'split',
        icon: <SplitSquareHorizontal className="h-3.5 w-3.5" />,
        label: 'Split',
      },
      {
        key: 'preview',
        icon: <Eye className="h-3.5 w-3.5" />,
        label: 'Preview',
      },
    ];

  return (
    <div className="rounded-xl border border-slate-200 overflow-hidden bg-white shadow-sm">
      {/* ── Toolbar ─────────────────────────────────────────────── */}
      <div className="flex items-center gap-0.5 px-2 py-1.5 border-b border-slate-200 bg-slate-50 flex-wrap">
        {toolbarItems.map((item, i) =>
          'separator' in item ? (
            <div
              key={`sep-${i}`}
              className="w-px h-4 bg-slate-200 mx-1 shrink-0"
            />
          ) : (
            <button
              key={item.title}
              type="button"
              title={item.title}
              onClick={() => handleToolbarClick(item as ToolbarAction)}
              className="p-1.5 rounded-lg text-slate-500 hover:text-indigo-600 hover:bg-indigo-50 transition-colors cursor-pointer"
            >
              {item.icon}
            </button>
          ),
        )}

        {/* Mode toggle (pushed to right) */}
        <div className="ml-auto flex items-center gap-0.5 bg-white rounded-lg border border-slate-200 p-0.5">
          {modesConfig.map(({ key, icon, label }) => (
            <button
              key={key}
              type="button"
              onClick={() => setMode(key)}
              title={label}
              className={`flex items-center gap-1 px-2 py-1 rounded-md text-[11px] font-semibold transition-all cursor-pointer ${
                mode === key
                  ? 'bg-indigo-600 text-white shadow-sm'
                  : 'text-slate-500 hover:text-slate-700'
              }`}
            >
              {icon}
              <span className="hidden sm:inline">{label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* ── Panes ───────────────────────────────────────────────── */}
      <div className="flex" style={{ height }}>
        {/* Editor pane */}
        {(mode === 'write' || mode === 'split') && (
          <div
            className={`flex-1 min-w-0 ${mode === 'split' ? 'border-r border-slate-200' : ''}`}
          >
            <MonacoEditor
              height="100%"
              language="markdown"
              theme="light"
              value={value}
              onChange={(v) => onChange(v ?? '')}
              onMount={handleEditorMount}
              options={{
                minimap: { enabled: false },
                fontSize: 13,
                lineHeight: 20,
                wordWrap: 'on',
                padding: { top: 12, bottom: 12 },
                scrollbar: { verticalScrollbarSize: 6 },
                overviewRulerLanes: 0,
                renderLineHighlight: 'none',
                scrollBeyondLastLine: false,
                placeholder,
                lineNumbers: 'off',
                folding: false,
                glyphMargin: false,
                contextmenu: false,
              }}
            />
          </div>
        )}

        {/* Preview pane */}
        {(mode === 'preview' || mode === 'split') && (
          <div
            className="flex-1 min-w-0 overflow-y-auto px-4 py-3"
            style={{ height }}
          >
            {value.trim() ? (
              <div className="markdown-preview prose prose-sm max-w-none text-slate-800">
                <ReactMarkdown remarkPlugins={[remarkGfm]}>
                  {value}
                </ReactMarkdown>
              </div>
            ) : (
              <p className="text-slate-400 text-sm italic">
                Preview sẽ hiển thị ở đây...
              </p>
            )}
          </div>
        )}
      </div>

      {/* ── Preview styles (scoped) ──────────────────────────────── */}
      <style>{`
        .markdown-preview h1,
        .markdown-preview h2,
        .markdown-preview h3,
        .markdown-preview h4 {
          font-weight: 700;
          margin-top: 1em;
          margin-bottom: 0.4em;
          color: #1e293b;
        }
        .markdown-preview h1 { font-size: 1.3rem; }
        .markdown-preview h2 { font-size: 1.1rem; }
        .markdown-preview h3 { font-size: 0.95rem; }

        .markdown-preview p {
          margin-bottom: 0.6em;
          line-height: 1.7;
          color: #334155;
          font-size: 0.875rem;
          white-space: pre-wrap;
        }

        .markdown-preview ul,
        .markdown-preview ol {
          padding-left: 1.4em;
          margin-bottom: 0.6em;
          font-size: 0.875rem;
          color: #334155;
        }
        .markdown-preview li { margin-bottom: 0.25em; }

        .markdown-preview code {
          background: #f1f5f9;
          border: 1px solid #e2e8f0;
          border-radius: 4px;
          padding: 1px 5px;
          font-size: 0.8rem;
          font-family: 'Fira Mono', 'Cascadia Code', monospace;
          color: #7c3aed;
        }

        .markdown-preview pre {
          background: #1e293b;
          border-radius: 8px;
          padding: 12px 16px;
          overflow-x: auto;
          margin-bottom: 0.75em;
        }
        .markdown-preview pre code {
          background: transparent;
          border: none;
          color: #e2e8f0;
          font-size: 0.8rem;
          padding: 0;
        }

        .markdown-preview blockquote {
          border-left: 3px solid #cbd5e1;
          background: #f8fafc;
          margin: 0.75em 0;
          padding: 8px 16px;
          border-radius: 4px;
          color: #475569;
          font-size: 0.875rem;
        }
        .markdown-preview blockquote p { margin: 0; color: inherit; }

        .markdown-preview hr {
          border: none;
          border-top: 1px solid #e2e8f0;
          margin: 1em 0;
        }

        .markdown-preview a {
          color: #4f46e5;
          text-decoration: underline;
        }

        .markdown-preview strong { color: #1e293b; }
        .markdown-preview em { color: #475569; }

        .markdown-preview table {
          width: 100%;
          border-collapse: collapse;
          font-size: 0.8rem;
          margin-bottom: 0.75em;
        }
        .markdown-preview th,
        .markdown-preview td {
          border: 1px solid #e2e8f0;
          padding: 6px 10px;
          text-align: left;
        }
        .markdown-preview th {
          background: #f8fafc;
          font-weight: 700;
          color: #1e293b;
        }
      `}</style>
    </div>
  );
}
