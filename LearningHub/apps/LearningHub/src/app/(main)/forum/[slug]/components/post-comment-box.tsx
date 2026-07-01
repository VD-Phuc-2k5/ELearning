'use client';

import { useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { MessageSquare } from 'lucide-react';
import { createComment } from '../../../../actions/forum.actions';
import { CommentMentionInput } from '@/components/ui/comment-mention-input';

interface PostCommentBoxProps {
  postId: string;
  forumId: string;
}

export function PostCommentBox({ postId, forumId }: PostCommentBoxProps) {
  const qc = useQueryClient();
  const [commentError, setCommentError] = useState<string | null>(null);
  const addComment = useMutation({
    mutationFn: ({
      text,
      mentionIds,
    }: {
      text: string;
      mentionIds: string[];
    }) => createComment(forumId, postId, text, undefined, mentionIds),
    onSuccess: () => {
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
        <div className="flex-1">
          <CommentMentionInput
            forumId={forumId}
            placeholder="Write a quick comment..."
            onSubmit={(text, mentionIds) =>
              addComment.mutate({ text, mentionIds })
            }
            disabled={addComment.isPending}
          />
        </div>
      </div>
    </div>
  );
}
