'use client';

import type { Editor } from '@tiptap/react';
import { EditorContent } from '@tiptap/react';
import { BubbleMenu } from '@tiptap/react/menus';
import { forwardRef, useCallback, useRef } from 'react';
import { useTiptapEditor } from './use-tiptap-editor';
import type { TiptapEditorHandle } from './use-tiptap-editor';
import { TiptapToolbar } from './tiptap-toolbar';
import { TiptapLinkPopover } from './tiptap-link-popover';
import { useTiptapLink } from './use-tiptap-link';

export { type TiptapEditorHandle };

interface TiptapEditorProps {
  content?: Record<string, unknown>;
  onChange: (json: Record<string, unknown>) => void;
  placeholder?: string;
  forumId?: string;
}

export const TiptapEditor = forwardRef<TiptapEditorHandle, TiptapEditorProps>(
  function TiptapEditor({ content, onChange, placeholder, forumId }, ref) {
    const fileInputRef = useRef<HTMLInputElement>(null);

    const {
      editor,
      toast,
      linkOpen,
      setLinkOpen,
      linkUrl,
      setLinkUrl,
      linkError,
      setLinkError,
      pendingImagesRef,
    } = useTiptapEditor({ content, onChange, placeholder, forumId, ref });

    const {
      boxRef: linkBoxRef,
      openLink,
      confirmLink,
      removeLink,
    } = useTiptapLink({
      editor,
      open: linkOpen,
      url: linkUrl,
      setOpen: setLinkOpen,
      setUrl: setLinkUrl,
      setError: setLinkError,
    });

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

    const triggerFilePicker = useCallback(
      () => fileInputRef.current?.click(),
      [],
    );

    const onFilePicked = useCallback(
      (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file && editor && !editor.isDestroyed) {
          if (
            !['image/png', 'image/jpeg', 'image/gif', 'image/webp'].includes(
              file.type,
            )
          ) {
            return;
          }
          const blobUrl = URL.createObjectURL(file);
          pendingImagesRef.current.push({ blobUrl, file });
          const node = editor.view.state.schema.nodes.image.create({
            src: blobUrl,
            alt: null,
            title: null,
          });
          editor.view.dispatch(editor.view.state.tr.replaceSelectionWith(node));
        }
        if (fileInputRef.current) fileInputRef.current.value = '';
      },
      [editor, pendingImagesRef],
    );

    if (!editor) return null;

    return (
      <div className="isolate w-full">
        <div className="sticky top-0 z-20 overflow-hidden rounded-t-2xl border border-slate-200 border-b-0 bg-slate-50/95 backdrop-blur supports-[backdrop-filter]:bg-slate-50/80">
          <TiptapToolbar
            editor={editor}
            onBold={() => toggleMarkPreservingSelection('bold')}
            onItalic={() => toggleMarkPreservingSelection('italic')}
            onUnderline={() => toggleMarkPreservingSelection('underline')}
            onStrike={() => toggleMarkPreservingSelection('strike')}
            onTriggerFilePicker={triggerFilePicker}
            onOpenLink={openLink}
          />
        </div>

        <div className="relative rounded-b-2xl border-x border-b border-slate-200 bg-white">
          <BubbleMenu
            editor={editor}
            updateDelay={100}
            appendTo={document.body}
            options={{ placement: 'top', offset: true }}
            shouldShow={({
              editor: ed,
              state,
              from,
              to,
            }: {
              editor: Editor;
              state: any;
              from: number;
              to: number;
            }) => {
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
              <TiptapToolbar
                editor={editor}
                onBold={() => toggleMarkPreservingSelection('bold')}
                onItalic={() => toggleMarkPreservingSelection('italic')}
                onUnderline={() => toggleMarkPreservingSelection('underline')}
                onStrike={() => toggleMarkPreservingSelection('strike')}
                onTriggerFilePicker={triggerFilePicker}
                onOpenLink={openLink}
                bubble
              />
            </div>
          </BubbleMenu>

          <TiptapLinkPopover
            open={linkOpen}
            url={linkUrl}
            hasExistingLink={editor.isActive('link')}
            error={linkError}
            boxRef={linkBoxRef}
            onUrlChange={(v) => {
              setLinkUrl(v);
              setLinkError(false);
            }}
            onApply={confirmLink}
            onRemoveLink={removeLink}
            onCancel={() => {
              setLinkOpen(false);
              setLinkUrl('');
              setLinkError(false);
            }}
          />

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
