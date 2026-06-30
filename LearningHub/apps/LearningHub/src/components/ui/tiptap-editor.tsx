'use client';

import { EditorContent, useEditor } from '@tiptap/react';
import { BubbleMenu } from '@tiptap/react/menus';
import StarterKit from '@tiptap/starter-kit';
import ImageExtension from '@tiptap/extension-image';
import CodeBlockLowlightExtension from '@tiptap/extension-code-block-lowlight';
import TaskListExtension from '@tiptap/extension-task-list';
import TaskItemExtension from '@tiptap/extension-task-item';
import PlaceholderExtension from '@tiptap/extension-placeholder';
import { common, createLowlight } from 'lowlight';
import {
  forwardRef,
  useCallback,
  useEffect,
  useImperativeHandle,
  useRef,
  useState,
} from 'react';
import {
  Bold,
  Code2,
  Heading1,
  Heading2,
  Heading3,
  ImageIcon,
  Italic,
  LinkIcon,
  List,
  ListChecks,
  ListOrdered,
  Minus,
  Quote,
  Redo2,
  Strikethrough,
  UnderlineIcon,
  Undo2,
  X,
} from 'lucide-react';

const lowlight = createLowlight(common);

const ACCEPTED_IMAGE_TYPES = [
  'image/png',
  'image/jpeg',
  'image/gif',
  'image/webp',
];

interface PendingImage {
  blobUrl: string;
  file: File;
}

interface TiptapEditorHandle {
  getPendingImages: () => PendingImage[];
  replaceImageSrc: (oldSrc: string, newSrc: string) => void;
  getContent: () => Record<string, unknown> | undefined;
}

interface TiptapEditorProps {
  content?: Record<string, unknown>;
  onChange: (json: Record<string, unknown>) => void;
  placeholder?: string;
}

interface ToolbarButtonProps {
  icon: React.ReactNode;
  title: string;
  onClick: () => void;
  active?: boolean;
  disabled?: boolean;
}

export { type TiptapEditorHandle };

function isLikelyValidUrl(value: string): boolean {
  if (!value) return false;
  try {
    const candidate = /^[a-zA-Z][a-zA-Z\d+\-.]*:\/\//.test(value)
      ? value
      : `https://${value}`;
    const url = new URL(candidate);
    return Boolean(url.hostname && url.hostname.includes('.'));
  } catch {
    return false;
  }
}

function normalizeUrl(value: string): string {
  return /^[a-zA-Z][a-zA-Z\d+\-.]*:\/\//.test(value)
    ? value
    : `https://${value}`;
}

function ensureImageAttrs(editorState: any, json: any): any {
  if (!json || json.type !== 'doc' || !json.content) return json;
  const imageAttrs: any[] = [];
  editorState.doc.descendants((node: any) => {
    if (node.type.name === 'image') {
      imageAttrs.push(JSON.parse(JSON.stringify(node.attrs)));
    }
  });
  if (imageAttrs.length === 0) return json;
  let idx = 0;
  function walk(nodes: any[]) {
    for (const node of nodes) {
      if (node.type === 'image') {
        node.attrs = imageAttrs[idx] ?? imageAttrs[imageAttrs.length - 1];
        idx++;
      }
      if (node.content) walk(node.content);
    }
  }
  walk(json.content);
  return json;
}

export const TiptapEditor = forwardRef<TiptapEditorHandle, TiptapEditorProps>(
  function TiptapEditor({ content, onChange, placeholder }, ref) {
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
        console.log(
          '[insertImage] attrs:',
          JSON.stringify(node.attrs),
          'toJSON:',
          JSON.stringify(node.toJSON()),
        );
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
      ],
      content: content ?? undefined,
      editable: true,
      immediatelyRender: true,
      editorProps: {
        attributes: {
          class:
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
            '[&_li[data-type=taskItem]>label]:mr-1 [&_li[data-type=taskItem]>div]:inline',
        },
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
          console.log(
            '[getContent] RAW     :',
            JSON.stringify(raw).substring(0, 500),
          );
          const result = ensureImageAttrs(editor.state, clean);
          console.log(
            '[getContent] RESULT  :',
            JSON.stringify(result).substring(0, 500),
          );
          return result as Record<string, unknown>;
        },
        replaceImageSrc: (oldSrc: string, newSrc: string) => {
          if (!editor || editor.isDestroyed) return;
          const { state } = editor;
          let found = false;
          state.doc.descendants((node, pos) => {
            if (node.type.name === 'image' && node.attrs.src === oldSrc) {
              console.log(
                '[replaceImageSrc] found at pos',
                pos,
                'old:',
                oldSrc,
                'new:',
                newSrc,
              );
              found = true;
            }
          });
          if (!found) {
            console.error(
              '[replaceImageSrc] image not found for blobUrl:',
              oldSrc,
              'doc:',
              JSON.stringify(state.doc.toJSON()).substring(0, 500),
            );
            return;
          }
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
          console.log(
            '[replaceImageSrc] after replace, attrs:',
            JSON.stringify(
              (editor.getJSON() as any)?.content?.find?.(
                (c: any) => c.type === 'image',
              )?.attrs,
            ),
          );
        },
      }),
      [editor],
    );

    const fileInputRef = useRef<HTMLInputElement>(null);
    const linkBoxRef = useRef<HTMLDivElement>(null);
    const triggerFilePicker = useCallback(
      () => fileInputRef.current?.click(),
      [],
    );

    const onFilePicked = useCallback(
      (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file && editor && !editor.isDestroyed) {
          if (!ACCEPTED_IMAGE_TYPES.includes(file.type)) {
            showToast('Only PNG, JPEG, GIF, or WEBP images are supported.');
          } else {
            const blobUrl = URL.createObjectURL(file);
            pendingImagesRef.current.push({ blobUrl, file });
            const node = editor.view.state.schema.nodes.image.create({
              src: blobUrl,
              alt: null,
              title: null,
            });
            editor.view.dispatch(
              editor.view.state.tr.replaceSelectionWith(node),
            );
          }
        }
        if (fileInputRef.current) fileInputRef.current.value = '';
      },
      [editor, showToast],
    );

    const toggleMarkPreservingSelection = useCallback(
      (markName: string, attrs?: Record<string, unknown>) => {
        if (!editor || editor.isDestroyed) return;
        const { from, to } = editor.state.selection;
        const hadRange = from !== to;
        editor.chain().toggleMark(markName, attrs).run();
        if (hadRange) {
          requestAnimationFrame(() => {
            if (!editor.isDestroyed) {
              editor.commands.setTextSelection({ from, to });
            }
          });
        }
      },
      [editor],
    );

    useEffect(() => {
      if (!linkOpen) return;
      const handleClick = (e: MouseEvent) => {
        if (
          linkBoxRef.current &&
          !linkBoxRef.current.contains(e.target as Node)
        ) {
          setLinkOpen(false);
          setLinkUrl('');
          setLinkError(false);
        }
      };
      document.addEventListener('mousedown', handleClick);
      return () => document.removeEventListener('mousedown', handleClick);
    }, [linkOpen]);

    if (!editor) return null;

    const openLink = () => {
      const prev = editor.getAttributes('link').href;
      setLinkUrl(prev || '');
      setLinkError(false);
      setLinkOpen(true);
    };

    const confirmLink = () => {
      if (!linkUrl) {
        editor.chain().focus().unsetLink().run();
        setLinkOpen(false);
        setLinkUrl('');
        setLinkError(false);
        return;
      }
      if (!isLikelyValidUrl(linkUrl)) {
        setLinkError(true);
        return;
      }
      const finalUrl = normalizeUrl(linkUrl);
      const { from, to } = editor.state.selection;
      if (from === to) {
        editor
          .chain()
          .focus()
          .insertContent(linkUrl)
          .setLink({ href: finalUrl })
          .run();
      } else {
        editor.chain().focus().setLink({ href: finalUrl }).run();
      }
      setLinkOpen(false);
      setLinkUrl('');
      setLinkError(false);
    };

    const removeLink = () => {
      editor.chain().focus().unsetLink().run();
      setLinkOpen(false);
      setLinkUrl('');
      setLinkError(false);
    };

    const hasExistingLink = editor.isActive('link');

    return (
      <div className="isolate w-full">
        {/* Toolbar */}
        <div className="sticky top-0 z-20 overflow-hidden rounded-t-2xl border border-slate-200 border-b-0 bg-slate-50/95 backdrop-blur supports-[backdrop-filter]:bg-slate-50/80">
          <div className="overflow-x-auto">
            <div className="flex w-max items-center gap-0.5 whitespace-nowrap px-2 py-1.5">
              <ToolbarButton
                icon={<Bold className="h-3.5 w-3.5" />}
                title="Bold (Ctrl+B)"
                onClick={() => toggleMarkPreservingSelection('bold')}
                active={editor.isActive('bold')}
              />
              <ToolbarButton
                icon={<Italic className="h-3.5 w-3.5" />}
                title="Italic (Ctrl+I)"
                onClick={() => toggleMarkPreservingSelection('italic')}
                active={editor.isActive('italic')}
              />
              <ToolbarButton
                icon={<UnderlineIcon className="h-3.5 w-3.5" />}
                title="Underline (Ctrl+U)"
                onClick={() => toggleMarkPreservingSelection('underline')}
                active={editor.isActive('underline')}
              />
              <ToolbarButton
                icon={<Strikethrough className="h-3.5 w-3.5" />}
                title="Strikethrough"
                onClick={() => toggleMarkPreservingSelection('strike')}
                active={editor.isActive('strike')}
              />
              <Divider />
              <ToolbarButton
                icon={<Heading1 className="h-3.5 w-3.5" />}
                title="Heading 1"
                onClick={() => editor.chain().toggleHeading({ level: 1 }).run()}
                active={editor.isActive('heading', { level: 1 })}
              />
              <ToolbarButton
                icon={<Heading2 className="h-3.5 w-3.5" />}
                title="Heading 2"
                onClick={() => editor.chain().toggleHeading({ level: 2 }).run()}
                active={editor.isActive('heading', { level: 2 })}
              />
              <ToolbarButton
                icon={<Heading3 className="h-3.5 w-3.5" />}
                title="Heading 3"
                onClick={() => editor.chain().toggleHeading({ level: 3 }).run()}
                active={editor.isActive('heading', { level: 3 })}
              />
              <Divider />
              <ToolbarButton
                icon={<List className="h-3.5 w-3.5" />}
                title="Bullet list"
                onClick={() => editor.chain().toggleBulletList().run()}
                active={editor.isActive('bulletList')}
              />
              <ToolbarButton
                icon={<ListOrdered className="h-3.5 w-3.5" />}
                title="Ordered list"
                onClick={() => editor.chain().toggleOrderedList().run()}
                active={editor.isActive('orderedList')}
              />
              <ToolbarButton
                icon={<ListChecks className="h-3.5 w-3.5" />}
                title="Task list"
                onClick={() => editor.chain().toggleTaskList().run()}
                active={editor.isActive('taskList')}
              />
              <Divider />
              <ToolbarButton
                icon={<Quote className="h-3.5 w-3.5" />}
                title="Blockquote"
                onClick={() => editor.chain().toggleBlockquote().run()}
                active={editor.isActive('blockquote')}
              />
              <ToolbarButton
                icon={<Code2 className="h-3.5 w-3.5" />}
                title="Code block"
                onClick={() => editor.chain().toggleCodeBlock().run()}
                active={editor.isActive('codeBlock')}
              />
              <ToolbarButton
                icon={<Minus className="h-3.5 w-3.5" />}
                title="Horizontal rule"
                onClick={() => editor.chain().setHorizontalRule().run()}
              />
              <ToolbarButton
                icon={<LinkIcon className="h-3.5 w-3.5" />}
                title="Insert link"
                onClick={openLink}
                active={editor.isActive('link')}
              />
              <ToolbarButton
                icon={<ImageIcon className="h-3.5 w-3.5" />}
                title="Upload image"
                onClick={triggerFilePicker}
              />
              <Divider />
              <ToolbarButton
                icon={<Undo2 className="h-3.5 w-3.5" />}
                title="Undo (Ctrl+Z)"
                onClick={() => editor.chain().undo().run()}
                disabled={!editor.can().undo()}
              />
              <ToolbarButton
                icon={<Redo2 className="h-3.5 w-3.5" />}
                title="Redo (Ctrl+Shift+Z)"
                onClick={() => editor.chain().redo().run()}
                disabled={!editor.can().redo()}
              />
            </div>
          </div>
        </div>

        {/* Editor area */}
        <div className="relative rounded-b-2xl border-x border-b border-slate-200 bg-white">
          <BubbleMenu
            editor={editor}
            updateDelay={100}
            appendTo={document.body}
            options={{ placement: 'top', offset: true }}
            shouldShow={({ editor: ed, state, from, to }) => {
              if (!ed.isFocused) return false;
              if (state.selection.$from.parent.type.name === 'codeBlock')
                return false;
              if (from !== to) return true;
              const marks = state.storedMarks || state.selection.$from.marks();
              return marks.length > 0;
            }}
          >
            <div
              className="flex items-center gap-0.5 rounded-xl border border-slate-200 bg-white p-1 shadow-lg"
              style={{ zIndex: 9999 }}
            >
              <ToolbarButton
                icon={<Bold className="h-3.5 w-3.5" />}
                title="Bold"
                onClick={() => toggleMarkPreservingSelection('bold')}
                active={editor.isActive('bold')}
              />
              <ToolbarButton
                icon={<Italic className="h-3.5 w-3.5" />}
                title="Italic"
                onClick={() => toggleMarkPreservingSelection('italic')}
                active={editor.isActive('italic')}
              />
              <ToolbarButton
                icon={<UnderlineIcon className="h-3.5 w-3.5" />}
                title="Underline"
                onClick={() => toggleMarkPreservingSelection('underline')}
                active={editor.isActive('underline')}
              />
              <ToolbarButton
                icon={<Strikethrough className="h-3.5 w-3.5" />}
                title="Strikethrough"
                onClick={() => toggleMarkPreservingSelection('strike')}
                active={editor.isActive('strike')}
              />
              <ToolbarButton
                icon={<Code2 className="h-3.5 w-3.5" />}
                title="Inline code"
                onClick={() => toggleMarkPreservingSelection('code')}
                active={editor.isActive('code')}
              />
            </div>
          </BubbleMenu>

          {/* Link popover */}
          {linkOpen && (
            <div
              ref={linkBoxRef}
              className="relative z-30 border-b border-slate-200 px-4 py-2"
            >
              <div className="flex items-center gap-2 rounded-xl border border-indigo-200 bg-indigo-50 p-2">
                <input
                  autoFocus
                  type="text"
                  value={linkUrl}
                  onChange={(e) => {
                    setLinkUrl(e.target.value);
                    setLinkError(false);
                  }}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') confirmLink();
                    if (e.key === 'Escape') {
                      setLinkOpen(false);
                      setLinkUrl('');
                      setLinkError(false);
                    }
                  }}
                  placeholder="https://example.com"
                  className={[
                    'h-9 flex-1 rounded-lg border bg-white px-3 text-sm outline-none focus:ring-2',
                    linkError
                      ? 'border-rose-300 focus:border-rose-400 focus:ring-rose-100'
                      : 'border-slate-200 focus:border-indigo-400 focus:ring-indigo-100',
                  ].join(' ')}
                />
                <button
                  type="button"
                  onClick={confirmLink}
                  className="h-9 shrink-0 rounded-lg bg-indigo-600 px-4 text-xs font-medium text-white hover:bg-indigo-700 transition"
                >
                  Apply
                </button>
                {hasExistingLink && (
                  <button
                    type="button"
                    onClick={removeLink}
                    title="Remove link"
                    className="h-9 w-9 shrink-0 rounded-lg border border-slate-200 bg-white text-slate-500 hover:text-rose-600 transition inline-flex items-center justify-center"
                  >
                    <X className="h-3.5 w-3.5" />
                  </button>
                )}
                <button
                  type="button"
                  onClick={() => {
                    setLinkOpen(false);
                    setLinkUrl('');
                    setLinkError(false);
                  }}
                  className="h-9 shrink-0 rounded-lg border border-slate-200 bg-white px-3 text-xs text-slate-500 hover:text-slate-700 transition"
                >
                  Cancel
                </button>
              </div>
              {linkError && (
                <p className="mt-1 px-1 text-xs text-rose-600">
                  Please enter a valid URL.
                </p>
              )}
            </div>
          )}

          <EditorContent editor={editor} />
        </div>

        <input
          ref={fileInputRef}
          type="file"
          accept="image/png,image/jpeg,image/gif,image/webp"
          onChange={onFilePicked}
          className="hidden"
          aria-label="Upload image"
        />

        {toast && (
          <div className="pointer-events-none fixed bottom-4 left-1/2 z-50 -translate-x-1/2 rounded-lg bg-slate-900 px-4 py-2 text-xs text-white shadow-lg">
            {toast}
          </div>
        )}

        <style suppressHydrationWarning>{`
          .hljs-comment,.hljs-quote{color:#6272a4}
          .hljs-deletion,.hljs-name,.hljs-regexp,.hljs-selector-class,.hljs-selector-id,.hljs-tag,.hljs-template-variable,.hljs-variable{color:#ff5555}
          .hljs-attr,.hljs-built_in,.hljs-link,.hljs-literal,.hljs-meta,.hljs-number,.hljs-params,.hljs-type{color:#bd93f9}
          .hljs-attribute,.hljs-selector-tag,.hljs-title{color:#50fa7b}
          .hljs-addition,.hljs-bullet,.hljs-string,.hljs-symbol{color:#f1fa8c}
          .hljs-keyword,.hljs-selector-tag{color:#ff79c6}
          .hljs-section,.hljs-strong{color:#ffb86c}
          .hljs-emphasis{font-style:italic}
          .hljs-strong{font-weight:700}
        `}</style>
      </div>
    );
  },
);

function Divider() {
  return <div className="mx-1 h-6 w-px shrink-0 bg-slate-200" />;
}

function ToolbarButton({
  icon,
  title,
  onClick,
  active = false,
  disabled = false,
}: ToolbarButtonProps) {
  return (
    <button
      type="button"
      onMouseDown={(e) => {
        e.preventDefault();
        onClick();
      }}
      disabled={disabled}
      title={title}
      aria-label={title}
      className={[
        'h-8 w-8 shrink-0 rounded-lg inline-flex items-center justify-center transition',
        disabled
          ? 'opacity-30 cursor-not-allowed text-slate-400'
          : active
            ? 'bg-white text-indigo-600 shadow-sm ring-1 ring-slate-200'
            : 'text-slate-500 hover:bg-white hover:text-slate-700 hover:shadow-sm',
      ].join(' ')}
    >
      {icon}
    </button>
  );
}
