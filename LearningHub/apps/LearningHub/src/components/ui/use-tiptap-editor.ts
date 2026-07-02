'use client';

import { useEditor } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import ImageExtension from '@tiptap/extension-image';
import CodeBlockLowlightExtension from '@tiptap/extension-code-block-lowlight';
import TaskListExtension from '@tiptap/extension-task-list';
import TaskItemExtension from '@tiptap/extension-task-item';
import PlaceholderExtension from '@tiptap/extension-placeholder';
import MentionExtension from '@tiptap/extension-mention';
import { common, createLowlight } from 'lowlight';
import { createMentionSuggestion } from './mention-list';
import {
  useCallback,
  useEffect,
  useImperativeHandle,
  useRef,
  useState,
} from 'react';

const lowlight = createLowlight(common);

export const ACCEPTED_IMAGE_TYPES = [
  'image/png',
  'image/jpeg',
  'image/gif',
  'image/webp',
];

interface PendingImage {
  blobUrl: string;
  file: File;
}

export interface TiptapEditorHandle {
  getPendingImages: () => PendingImage[];
  replaceImageSrc: (oldSrc: string, newSrc: string) => void;
  getContent: () => Record<string, unknown> | undefined;
}

interface UseTiptapEditorOptions {
  content?: Record<string, unknown>;
  onChange: (json: Record<string, unknown>) => void;
  placeholder?: string;
  forumId?: string;
  ref: React.ForwardedRef<TiptapEditorHandle>;
}

const EDITOR_CLASSES =
  'min-h-[200px] max-h-[70vh] overflow-y-auto px-4 py-3 outline-none ' +
  '[&_h1]:text-2xl [&_h1]:font-bold [&_h1]:mt-3 [&_h1]:mb-1 ' +
  '[&_h2]:text-xl [&_h2]:font-semibold [&_h2]:mt-2 [&_h2]:mb-1 ' +
  '[&_h3]:text-lg [&_h3]:font-medium [&_h3]:mt-2 [&_h3]:mb-1 ' +
  '[&_p]:my-1 ' +
  '[&_ul]:list-disc [&_ol]:list-decimal [&_ul]:pl-5 [&_ol]:pl-5 [&_li>p]:my-0 ' +
  '[&_a]:text-blue-600 [&_a]:underline [&_a]:decoration-blue-300 [&_a]:underline-offset-2 [&_a]:cursor-pointer [&_a]:transition [&_a]:hover:text-blue-700 [&_a]:hover:decoration-blue-500 ' +
  '[&_u]:underline [&_s]:line-through ' +
  '[&_blockquote]:border-l-4 [&_blockquote]:border-indigo-200 [&_blockquote]:pl-4 [&_blockquote]:my-2 [&_blockquote]:text-slate-600 ' +
  '[&_pre]:bg-[#282a36] [&_pre]:text-[#f8f8f2] [&_pre]:rounded-lg [&_pre]:px-4 [&_pre]:py-3 [&_pre]:my-2 [&_pre]:overflow-x-auto ' +
  '[&_pre_code]:bg-transparent [&_pre_code]:text-inherit [&_pre_code]:p-0 ' +
  '[&_code]:bg-slate-100 [&_code]:text-rose-600 [&_code]:px-1 [&_code]:rounded ' +
  '[&_hr]:my-4 [&_hr]:border-slate-200 ' +
  '[&_img]:max-w-full [&_img]:h-auto [&_img]:rounded-lg [&_img]:my-2 [&_img]:inline-block ' +
  '[&_ul[data-type=taskList]]:list-none [&_ul[data-type=taskList]]:pl-0 ' +
  '[&_li[data-type=taskItem]>label]:mr-1 [&_li[data-type=taskItem]>div]:inline';

function ensureImageAttrs(
  editorState: any,
  json: Record<string, unknown>,
): Record<string, unknown> {
  if (!json || json.type !== 'doc' || !json.content) return json;
  const imageAttrs: Record<string, unknown>[] = [];
  (editorState.doc as any).descendants?.((node: any) => {
    if ((node.type as Record<string, unknown>).name === 'image') {
      imageAttrs.push(JSON.parse(JSON.stringify(node.attrs)));
    }
  });
  if (imageAttrs.length === 0) return json;
  let idx = 0;
  function walk(nodes: Record<string, unknown>[]) {
    for (const node of nodes) {
      if (node.type === 'image') {
        node.attrs = imageAttrs[idx] ?? imageAttrs[imageAttrs.length - 1];
        idx++;
      }
      if (node.content) walk(node.content as Record<string, unknown>[]);
    }
  }
  walk(json.content as Record<string, unknown>[]);
  return json;
}

export function useTiptapEditor({
  content,
  onChange,
  placeholder,
  forumId,
  ref,
}: UseTiptapEditorOptions) {
  const pendingImagesRef = useRef<PendingImage[]>([]);
  const [toast, setToast] = useState<string | null>(null);
  const [linkOpen, setLinkOpen] = useState(false);
  const [linkUrl, setLinkUrl] = useState('');
  const [linkError, setLinkError] = useState(false);

  const showToast = useCallback((message: string) => {
    setToast(message);
    window.setTimeout(
      () => setToast((current) => (current === message ? null : current)),
      3000,
    );
  }, []);

  const insertImageAtSelection = useCallback(
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (file: File, view: { state: any; dispatch: (tr: any) => void }) => {
      if (!ACCEPTED_IMAGE_TYPES.includes(file.type)) {
        showToast('Only PNG, JPEG, GIF, or WEBP images are supported.');
        return false;
      }
      const blobUrl = URL.createObjectURL(file);
      pendingImagesRef.current.push({ blobUrl, file });
      const node = view.state.schema.nodes.image.create({
        src: blobUrl,
        alt: null,
        title: null,
      });
      view.dispatch(view.state.tr.replaceSelectionWith(node));
      return true;
    },
    [showToast],
  );

  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        heading: { levels: [1, 2, 3] },
        codeBlock: false,
        link: { openOnClick: false, autolink: true },
      }),
      ImageExtension.configure({ allowBase64: false }),
      CodeBlockLowlightExtension.configure({ lowlight }),
      TaskListExtension,
      TaskItemExtension.configure({ nested: true }),
      PlaceholderExtension.configure({
        placeholder: placeholder ?? 'Write your content...',
      }),
      ...(forumId
        ? [
            MentionExtension.configure({
              HTMLAttributes: { class: 'text-indigo-600 font-medium' },
              suggestion: {
                char: '@',
                allowSpaces: false,
                render: () => createMentionSuggestion({ forumId }) as any,
              } as any,
            }),
          ]
        : []),
    ],
    content: content ?? undefined,
    editable: true,
    autofocus: false,
    immediatelyRender: true,
    editorProps: {
      attributes: { class: EDITOR_CLASSES },
      handlePaste: (view, event) => {
        const items = event.clipboardData?.items;
        if (!items) return false;
        for (const item of items) {
          if (item.type.startsWith('image/')) {
            const file = item.getAsFile();
            if (file) return insertImageAtSelection(file, view);
          }
        }
        return false;
      },
      handleDrop: (view, event) => {
        const files = event.dataTransfer?.files;
        if (!files?.length) return false;
        for (const file of files) {
          if (file.type.startsWith('image/'))
            return insertImageAtSelection(file, view);
        }
        return false;
      },
      handleKeyDown: (view, event) => {
        if (event.key === 'Escape') {
          view.dom.blur();
          return true;
        }
        if (event.key === 'Tab') {
          const { $from } = view.state.selection;
          if ($from.parent.type.name === 'codeBlock') {
            event.preventDefault();
            const tr = view.state.tr.insertText('  ');
            view.dispatch(tr);
            return true;
          }
        }
        return false;
      },
    },
    onUpdate: ({ editor }) => {
      const json = editor.getJSON();
      onChange(json as Record<string, unknown>);
      const currentBlobUrls = new Set<string>();
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      editor.state.doc.descendants((node: any) => {
        if (
          node.type.name === 'image' &&
          typeof node.attrs.src === 'string' &&
          node.attrs.src.startsWith('blob:')
        ) {
          currentBlobUrls.add(node.attrs.src);
        }
      });
      pendingImagesRef.current = pendingImagesRef.current.filter((p) => {
        const keep = currentBlobUrls.has(p.blobUrl);
        if (!keep) URL.revokeObjectURL(p.blobUrl);
        return keep;
      });
    },
    onDestroy: () => {
      for (const { blobUrl } of pendingImagesRef.current) {
        URL.revokeObjectURL(blobUrl);
      }
      pendingImagesRef.current = [];
    },
  });

  useEffect(() => {
    if (!editor || editor.isDestroyed || !content) return;
    const editorJSON = JSON.stringify(editor.getJSON());
    const newJSON = JSON.stringify(content);
    if (editorJSON !== newJSON) {
      editor.commands.setContent(content);
    }
  }, [editor, content]);

  useImperativeHandle(
    ref,
    () => ({
      getPendingImages: () => [...pendingImagesRef.current],
      getContent: () => {
        if (!editor || editor.isDestroyed) return undefined;
        const raw = editor.getJSON();
        const clean = JSON.parse(JSON.stringify(raw));
        return ensureImageAttrs(editor.state, clean) as Record<string, unknown>;
      },
      replaceImageSrc: (oldSrc: string, newSrc: string) => {
        if (!editor || editor.isDestroyed) return;
        const { state } = editor;
        let found = false;
        state.doc.descendants((node) => {
          if (node.type.name === 'image' && node.attrs.src === oldSrc) {
            found = true;
          }
        });
        if (!found) return;
        editor
          .chain()
          .command(({ tr }: any) => {
            state.doc.descendants((node: any, pos: any) => {
              if (node.type.name === 'image' && node.attrs.src === oldSrc) {
                tr.setNodeMarkup(pos, undefined, {
                  ...node.attrs,
                  src: newSrc,
                });
              }
            });
            return true;
          })
          .run();
      },
    }),
    [editor],
  );

  return {
    editor,
    toast,
    setToast,
    linkOpen,
    setLinkOpen,
    linkUrl,
    setLinkUrl,
    linkError,
    setLinkError,
    pendingImagesRef,
    showToast,
  };
}
