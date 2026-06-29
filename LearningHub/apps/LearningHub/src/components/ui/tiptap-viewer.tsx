'use client';

import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Image from '@tiptap/extension-image';
import Link from '@tiptap/extension-link';
import Mention from '@tiptap/extension-mention';

interface TiptapViewerProps {
  content: Record<string, unknown>;
}

export function TiptapViewer({ content }: TiptapViewerProps) {
  const editor = useEditor({
    extensions: [
      StarterKit.configure({ heading: { levels: [1, 2, 3] } }),
      Image,
      Link.configure({ openOnClick: true, autolink: true }),
      Mention.configure({ suggestion: undefined }),
    ],
    content: content as never,
    editable: false,
    editorProps: {
      attributes: { class: 'prose prose-sm max-w-none' },
    },
  });
  if (!editor) return null;
  return <EditorContent editor={editor} />;
}
