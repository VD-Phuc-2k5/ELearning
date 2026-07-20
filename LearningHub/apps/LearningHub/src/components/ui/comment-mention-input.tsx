'use client';

import { useState, useRef, useCallback, useEffect } from 'react';
import {
  searchForumMembers,
  type MemberSuggestion,
} from '../../app/actions/forum.actions';

interface CommentMentionInputProps {
  forumId: string;
  placeholder?: string;
  initialValue?: string;
  onSubmit: (text: string, mentionIds: string[]) => void;
  submitLabel?: string;
  disabled?: boolean;
  onCancel?: () => void;
  className?: string;
  currentUserId?: string;
}

export function CommentMentionInput({
  forumId,
  placeholder = 'Write a comment...',
  initialValue = '',
  currentUserId,
  onSubmit,
  submitLabel = 'Send',
  disabled = false,
  onCancel,
  className = '',
}: CommentMentionInputProps) {
  const editorRef = useRef<HTMLDivElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const [showDropdown, setShowDropdown] = useState(false);
  const [suggestions, setSuggestions] = useState<MemberSuggestion[]>([]);
  const [selectedIdx, setSelectedIdx] = useState(0);
  const [mentionQuery, setMentionQuery] = useState('');
  const [isEmpty, setIsEmpty] = useState(true);
  const mentionStartRef = useRef<{ node: Node; offset: number } | null>(null);
  const abortRef = useRef<AbortController | null>(null);

  const getMentionIds = useCallback((): string[] => {
    const editor = editorRef.current;
    if (!editor) return [];
    const ids: string[] = [];
    editor
      .querySelectorAll<HTMLSpanElement>('[data-mention-id]')
      .forEach((span) => {
        const id = span.dataset.mentionId;
        if (id) ids.push(id);
      });
    return ids;
  }, []);

  const getPlainText = useCallback((): string => {
    const editor = editorRef.current;
    if (!editor) return '';
    let text = '';
    function walk(node: Node) {
      if (node.nodeType === Node.TEXT_NODE) {
        text += node.textContent || '';
      } else if (node.nodeType === Node.ELEMENT_NODE) {
        const el = node as HTMLElement;
        if (el.dataset.mentionId) {
          text += el.dataset.mentionLabel || '';
        } else {
          for (const child of node.childNodes) {
            walk(child);
          }
        }
      }
    }
    for (const child of editor.childNodes) {
      walk(child);
    }
    return text.trim();
  }, []);

  const createMentionSpan = (
    userId: string,
    username: string,
  ): HTMLSpanElement => {
    const span = document.createElement('span');
    span.dataset.mentionId = userId;
    span.dataset.mentionLabel = `@${username}`;
    span.className =
      'bg-indigo-100 text-indigo-700 font-semibold rounded px-0.5 whitespace-nowrap select-all';
    span.contentEditable = 'false';
    span.textContent = `@${username}`;
    return span;
  };

  const insertMention = useCallback((userId: string, username: string) => {
    const editor = editorRef.current;
    if (!editor) return;

    const start = mentionStartRef.current;
    if (!start) return;

    const sel = window.getSelection();
    if (!sel || !sel.rangeCount) return;

    const range = document.createRange();
    range.setStart(start.node, start.offset);
    const endOffset =
      (sel.focusNode === start.node
        ? sel.focusOffset
        : start.node.textContent?.length) ?? 0;
    range.setEnd(start.node, Math.max(range.startOffset, endOffset));

    range.deleteContents();

    const span = createMentionSpan(userId, username);
    const space = document.createTextNode(' ');

    range.insertNode(space);
    range.insertNode(span);

    const newRange = document.createRange();
    newRange.setStartAfter(space);
    newRange.collapse(true);
    sel.removeAllRanges();
    sel.addRange(newRange);

    editor.focus();
    setShowDropdown(false);
    setMentionQuery('');
    mentionStartRef.current = null;
    setIsEmpty(false);
  }, []);

  const fetchSuggestions = useCallback(
    (query: string) => {
      abortRef.current?.abort();
      const controller = new AbortController();
      abortRef.current = controller;
      setSelectedIdx(0);

      if (!forumId) return;

      searchForumMembers(forumId, query, 5)
        .then((results) => {
          if (controller.signal.aborted) return;
          const filtered = currentUserId
            ? results.filter((m) => m.userId !== currentUserId)
            : results;
          setSuggestions(filtered);
          setShowDropdown(filtered.length > 0);
        })
        .catch(() => {
          if (!controller.signal.aborted) {
            setSuggestions([]);
            setShowDropdown(false);
          }
        });
    },
    [forumId, currentUserId],
  );

  const detectMention = useCallback(() => {
    const sel = window.getSelection();
    if (!sel || !sel.rangeCount) {
      setShowDropdown(false);
      return;
    }

    const range = sel.getRangeAt(0);
    const node = range.startContainer;
    const offset = range.startOffset;

    if (node.nodeType !== Node.TEXT_NODE) {
      setShowDropdown(false);
      return;
    }

    const text = node.textContent || '';
    const beforeCursor = text.slice(0, offset);
    const atIdx = beforeCursor.lastIndexOf('@');

    if (atIdx === -1) {
      setShowDropdown(false);
      return;
    }

    const afterAt = beforeCursor.slice(atIdx + 1);
    if (afterAt.includes(' ') || afterAt.includes('\n')) {
      setShowDropdown(false);
      return;
    }

    setMentionQuery(afterAt);
    mentionStartRef.current = { node, offset: atIdx };
    fetchSuggestions(afterAt);
  }, [fetchSuggestions]);

  const handleInput = useCallback(() => {
    const editor = editorRef.current;
    setIsEmpty(!editor?.textContent?.trim());
    detectMention();
  }, [detectMention]);

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (!showDropdown || suggestions.length === 0) {
        if (e.key === 'Enter' && !e.shiftKey) {
          e.preventDefault();
          const text = getPlainText();
          const ids = getMentionIds();
          if (text) onSubmit(text, ids);
        }
        return;
      }

      if (e.key === 'ArrowDown') {
        e.preventDefault();
        setSelectedIdx((prev) => (prev + 1) % suggestions.length);
      } else if (e.key === 'ArrowUp') {
        e.preventDefault();
        setSelectedIdx(
          (prev) => (prev - 1 + suggestions.length) % suggestions.length,
        );
      } else if (e.key === 'Enter' || e.key === 'Tab') {
        e.preventDefault();
        const item = suggestions[selectedIdx];
        if (item) insertMention(item.userId, item.username);
      } else if (e.key === 'Escape') {
        e.preventDefault();
        setShowDropdown(false);
      }
    },
    [
      showDropdown,
      suggestions,
      selectedIdx,
      insertMention,
      getPlainText,
      getMentionIds,
      onSubmit,
    ],
  );

  const handleSelect = useCallback(
    (userId: string, username: string) => {
      insertMention(userId, username);
    },
    [insertMention],
  );

  const handleBlur = useCallback(() => {
    setTimeout(() => {
      if (!dropdownRef.current?.contains(document.activeElement)) {
        setShowDropdown(false);
      }
    }, 150);
  }, []);

  const handleSubmit = useCallback(() => {
    const text = getPlainText();
    const ids = getMentionIds();
    if (text) {
      onSubmit(text, ids);
      if (editorRef.current) {
        editorRef.current.textContent = '';
        setIsEmpty(true);
      }
    }
  }, [getPlainText, getMentionIds, onSubmit]);

  useEffect(() => {
    const editor = editorRef.current;
    if (editor && initialValue) {
      editor.textContent = initialValue;
      setIsEmpty(false);
    }
  }, [initialValue]);

  useEffect(() => {
    return () => abortRef.current?.abort();
  }, []);

  return (
    <div className={className}>
      <div className="relative">
        {isEmpty && (
          <div className="pointer-events-none absolute inset-0 px-3 py-2.5 text-xs text-slate-400 select-none z-10">
            {placeholder}
          </div>
        )}
        <div
          ref={editorRef}
          contentEditable
          suppressContentEditableWarning
          role="textbox"
          aria-placeholder={placeholder}
          className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 text-xs text-slate-700 focus:outline-none focus:border-indigo-400 focus:bg-white transition min-h-[1.75rem] max-h-[8rem] overflow-y-auto whitespace-pre-wrap relative"
          onInput={handleInput}
          onKeyDown={handleKeyDown}
          onBlur={handleBlur}
        />
        {showDropdown && suggestions.length > 0 && (
          <div
            ref={dropdownRef}
            className="absolute left-0 top-full mt-1 z-50 w-56 rounded-lg border border-slate-200 bg-white shadow-lg overflow-hidden"
          >
            {suggestions.map((member, idx) => (
              <button
                key={member.userId}
                type="button"
                className={`flex w-full items-center gap-2 px-3 py-2 text-left text-xs transition ${
                  idx === selectedIdx
                    ? 'bg-indigo-50 text-indigo-700'
                    : 'text-slate-700 hover:bg-slate-50'
                }`}
                onMouseDown={(e) => {
                  e.preventDefault();
                  handleSelect(member.userId, member.username);
                }}
                onMouseEnter={() => setSelectedIdx(idx)}
              >
                <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-indigo-100 text-[10px] font-semibold text-indigo-600">
                  {member.username.charAt(0).toUpperCase()}
                </span>
                <span className="font-medium">{member.username}</span>
              </button>
            ))}
          </div>
        )}
        {showDropdown && mentionQuery && suggestions.length === 0 && (
          <div className="absolute left-0 top-full mt-1 z-50 w-56 rounded-lg border border-slate-200 bg-white shadow-lg p-3 text-xs text-slate-400">
            No members found
          </div>
        )}
      </div>
      <div className="mt-2 flex items-center gap-2">
        <button
          type="button"
          onClick={handleSubmit}
          disabled={disabled || isEmpty}
          className="rounded-xl bg-indigo-600 px-3 py-1.5 text-xs font-medium text-white transition hover:bg-indigo-700 disabled:opacity-40"
        >
          {disabled ? '...' : submitLabel}
        </button>
        {onCancel && (
          <button
            type="button"
            onClick={onCancel}
            className="rounded-xl border border-slate-200 px-3 py-1.5 text-xs text-slate-500 hover:bg-slate-50 transition"
          >
            Cancel
          </button>
        )}
      </div>
    </div>
  );
}
