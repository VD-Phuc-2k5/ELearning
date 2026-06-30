'use client';

import { EditorContent, useEditor } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import ImageExtension from '@tiptap/extension-image';
import CodeBlockLowlightExtension from '@tiptap/extension-code-block-lowlight';
import TaskListExtension from '@tiptap/extension-task-list';
import TaskItemExtension from '@tiptap/extension-task-item';
import { common, createLowlight } from 'lowlight';
import 'highlight.js/styles/github.css';

const lowlight = createLowlight(common);

interface TiptapViewerProps {
  content: Record<string, unknown>;
}

export function TiptapViewer({ content }: TiptapViewerProps) {
  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        heading: { levels: [1, 2, 3] },
        codeBlock: false,
        link: { openOnClick: true, autolink: true },
      }),
      ImageExtension,
      CodeBlockLowlightExtension.configure({ lowlight }),
      TaskListExtension,
      TaskItemExtension.configure({ nested: true }),
    ],
    content: content as never,
    editable: false,
    immediatelyRender: true,
    editorProps: {
      attributes: {
        class:
          'prose prose-sm max-w-none [&_img]:max-w-full [&_img]:h-auto [&_img]:rounded-lg [&_img]:my-4',
      },
    },
  });
  if (!editor) return null;
  return <EditorContent editor={editor} />;
}
