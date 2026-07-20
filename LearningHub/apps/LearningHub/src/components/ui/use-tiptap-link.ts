'use client';

import type { Editor } from '@tiptap/react';
import { useEffect, useRef } from 'react';

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

interface UseTiptapLinkParams {
  editor: Editor | null;
  open: boolean;
  url: string;
  setOpen: (v: boolean) => void;
  setUrl: (v: string) => void;
  setError: (v: boolean) => void;
}

export function useTiptapLink({
  editor,
  open,
  url,
  setOpen,
  setUrl,
  setError,
}: UseTiptapLinkParams) {
  const boxRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const handleClick = (e: MouseEvent) => {
      if (boxRef.current && !boxRef.current.contains(e.target as Node)) {
        setOpen(false);
        setUrl('');
        setError(false);
      }
    };
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, [open, setOpen, setUrl, setError]);

  const openLink = () => {
    if (!editor || editor.isDestroyed) return;
    const prev = editor.getAttributes('link').href;
    setUrl(prev || '');
    setError(false);
    setOpen(true);
  };

  const confirmLink = () => {
    if (!editor || editor.isDestroyed) return;
    if (!url) {
      editor.chain().focus().unsetLink().run();
      setOpen(false);
      setUrl('');
      setError(false);
      return;
    }
    if (!isLikelyValidUrl(url)) {
      setError(true);
      return;
    }
    const finalUrl = normalizeUrl(url);
    const { from, to } = editor.state.selection;
    if (from === to) {
      editor
        .chain()
        .focus()
        .insertContent(url)
        .setLink({ href: finalUrl })
        .run();
    } else {
      editor.chain().focus().setLink({ href: finalUrl }).run();
    }
    setOpen(false);
    setUrl('');
    setError(false);
  };

  const removeLink = () => {
    if (!editor || editor.isDestroyed) return;
    editor.chain().focus().unsetLink().run();
    setOpen(false);
    setUrl('');
    setError(false);
  };

  return { boxRef, openLink, confirmLink, removeLink };
}
