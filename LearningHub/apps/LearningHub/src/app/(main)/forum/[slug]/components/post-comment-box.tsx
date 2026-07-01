'use client';

import { useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { MessageSquare } from 'lucide-react';
import { createComment } from '../../../../actions/forum.actions';

interface PostCommentBoxProps {
  postId: string;
  forumId: string;
}

export function PostCommentBox({ postId, forumId }: PostCommentBoxProps) {
  const qc = useQueryClient();
  const [text, setText] = useState('');
  const [commentError, setCommentError] = useState<string | null>(null);
  const addComment = useMutation({
    mutationFn: () => createComment(forumId, postId, text, undefined),
    onSuccess: () => {
      setText('');
      setCommentError(null);
      qc.invalidateQueries({ queryKey: ['forum-posts', forumId] });
    },
    onError: (e: Error) => setCommentError(e.message),
  });
  return (
    <div className="border-t border-slate-50 px-5 py-3">
      {commentError && (
        <p className="mb-2 text-xs text-red-500">{commentError}</p>
      )}
      <div className="flex items-start gap-2.5">
        <div className="h-7 w-7 shrink-0 rounded-full bg-indigo-100 flex items-center justify-center">
          <MessageSquare className="h-3.5 w-3.5 text-indigo-500" />
        </div>
        <div className="flex-1 flex items-center gap-2">
          <input
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder="Write a quick comment..."
            className="flex-1 rounded-xl border border-slate-200 bg-slate-50 px-3 py-1.5 text-xs text-slate-700 placeholder:text-slate-400 focus:outline-none focus:border-indigo-400 focus:bg-white transition"
            onKeyDown={(e) => {
              if (e.key === 'Enter' && text.trim()) addComment.mutate();
            }}
          />
          <button
            type="button"
            onClick={() => addComment.mutate()}
            disabled={!text.trim() || addComment.isPending}
            className="shrink-0 rounded-xl bg-indigo-600 px-3 py-1.5 text-xs font-medium text-white transition hover:bg-indigo-700 disabled:opacity-40"
          >
            {addComment.isPending ? '...' : 'Send'}
          </button>
        </div>
      </div>
    </div>
  );
}
