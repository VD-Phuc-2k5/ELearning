'use client';

import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { MessageSquare } from 'lucide-react';
import type { CommentItem, PaginatedResponse } from '@learning-hub/domain';
import { listComments, createComment } from '../../../../actions/forum.actions';
import { CommentMentionInput } from '@/components/ui/comment-mention-input';
import { CommentThreadItem } from './comment-thread-item';

interface CommentSectionProps {
  postId: string;
  forumId: string;
  currentUserId?: string;
}

export function CommentSection({
  postId,
  forumId,
  currentUserId,
}: CommentSectionProps) {
  const qc = useQueryClient();
  const [error, setError] = useState<string | null>(null);

  const queryKey = ['forum-comments', forumId, postId];

  const { data, isLoading } = useQuery<PaginatedResponse<CommentItem>>({
    queryKey,
    queryFn: () => listComments(forumId, postId),
  });

  const topLevelComments =
    data?.data.filter((c: CommentItem) => !c.parentId) ?? [];

  const addComment = useMutation({
    mutationFn: ({
      text,
      mentionIds,
    }: {
      text: string;
      mentionIds: string[];
    }) => createComment(forumId, postId, text, undefined, mentionIds),
    onSuccess: () => {
      setError(null);
      qc.invalidateQueries({ queryKey });
      qc.invalidateQueries({ queryKey: ['forum-posts', forumId] });
    },
    onError: (e: Error) => setError(e.message),
  });

  return (
    <div className="border-t border-slate-100 px-5 py-4">
      {error && <p className="mb-2 text-xs text-red-500">{error}</p>}
      <div className="flex items-start gap-2.5 mb-4">
        <div className="h-7 w-7 shrink-0 rounded-full bg-indigo-100 flex items-center justify-center">
          <MessageSquare className="h-4 w-4 text-indigo-500" />
        </div>
        <div className="flex-1">
          <CommentMentionInput
            forumId={forumId}
            placeholder="Write a comment..."
            onSubmit={(text, mentionIds) =>
              addComment.mutate({ text, mentionIds })
            }
            disabled={addComment.isPending}
            currentUserId={currentUserId}
          />
        </div>
      </div>

      {topLevelComments.length === 0 && !isLoading && (
        <p className="text-center text-xs text-slate-400 py-4">
          No comments yet. Be the first!
        </p>
      )}

      <div className="space-y-1">
        {topLevelComments.map((comment: CommentItem) => (
          <CommentThreadItem
            key={comment.id}
            comment={comment}
            forumId={forumId}
            postId={postId}
            currentUserId={currentUserId}
            depth={0}
          />
        ))}
      </div>
    </div>
  );
}
