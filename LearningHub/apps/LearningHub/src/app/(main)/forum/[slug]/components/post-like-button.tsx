'use client';

import { useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { Heart, X } from 'lucide-react';
import { togglePostReaction } from '../../../../actions/forum.actions';

const ALLOWED_EMOJIS = ['👍', '❤️', '🎉', '🔥'];

interface PostLikeButtonProps {
  postId: string;
  forumId: string;
}

export function PostLikeButton({ postId, forumId }: PostLikeButtonProps) {
  const qc = useQueryClient();
  const [open, setOpen] = useState(false);
  const react = useMutation({
    mutationFn: (emoji: string) =>
      togglePostReaction(forumId, postId, emoji, true),
    onSuccess: () => {
      setOpen(false);
      qc.invalidateQueries({ queryKey: ['forum-posts', forumId] });
    },
  });

  return (
    <div className="relative">
      <button
        type="button"
        onClick={() => setOpen(!open)}
        className="inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-medium text-slate-500 hover:text-indigo-600 hover:bg-indigo-50 transition"
      >
        <Heart className="h-3.5 w-3.5" />
        Like
      </button>
      {open && (
        <div className="absolute bottom-full left-0 mb-2 flex gap-1 rounded-2xl border border-slate-200 bg-white p-1.5 shadow-lg z-10">
          {ALLOWED_EMOJIS.map((emoji) => (
            <button
              key={emoji}
              type="button"
              onClick={() => react.mutate(emoji)}
              disabled={react.isPending}
              className="h-9 w-9 flex items-center justify-center rounded-full text-lg transition-all hover:scale-125 hover:bg-slate-100 active:scale-95"
            >
              {emoji}
            </button>
          ))}
          <button
            type="button"
            onClick={() => setOpen(false)}
            className="h-9 w-9 flex items-center justify-center rounded-full text-xs text-slate-400 hover:bg-slate-100"
          >
            <X className="h-3.5 w-3.5" />
          </button>
        </div>
      )}
    </div>
  );
}
