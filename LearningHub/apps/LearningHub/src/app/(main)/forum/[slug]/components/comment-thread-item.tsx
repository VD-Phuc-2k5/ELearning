'use client';

import { useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Edit3, Trash2, Reply, ChevronDown, ChevronRight } from 'lucide-react';
import type { CommentItem } from '@learning-hub/domain';
import {
  listComments,
  toggleCommentReaction,
  getTargetReactions,
  deleteComment,
} from '../../../../actions/forum.actions';
import { CommentMentionInput } from '@/components/ui/comment-mention-input';
import { CommentContent } from '@/components/ui/comment-content';
import { ReactionBar } from './reaction-bar';
import { DeleteCommentModal } from './delete-comment-modal';

const MAX_DEPTH = 2;

interface CommentThreadItemProps {
  comment: CommentItem;
  forumId: string;
  postId: string;
  currentUserId?: string;
  depth?: number;
}

export function CommentThreadItem({
  comment,
  forumId,
  postId,
  currentUserId,
  depth = 0,
}: CommentThreadItemProps) {
  const qc = useQueryClient();
  const [showReply, setShowReply] = useState(false);
  const [showReplies, setShowReplies] = useState(depth < MAX_DEPTH);
  const [deleting, setDeleting] = useState(false);
  const [editing, setEditing] = useState(false);

  const isAuthor = currentUserId === comment.authorId;

  const queryKey = ['forum-comments', forumId, postId];

  const { data: reactions } = useQuery({
    queryKey: ['forum-comment-reactions', forumId, postId, comment.id],
    queryFn: () =>
      getTargetReactions({
        targetType: 'comment',
        targetId: comment.id,
        forumId,
        postId,
      }),
    staleTime: 5000,
  });

  const react = useMutation({
    mutationFn: ({ emoji, add }: { emoji: string; add: boolean }) =>
      toggleCommentReaction(forumId, postId, comment.id, emoji, add),
    onSuccess: () => {
      qc.invalidateQueries({
        queryKey: ['forum-comment-reactions', forumId, postId, comment.id],
      });
      qc.invalidateQueries({ queryKey });
    },
  });

  const replyMutation = useMutation({
    mutationFn: async ({
      text,
      mentionIds,
    }: {
      text: string;
      mentionIds: string[];
    }) => {
      const { createComment } = await import(
        '../../../../actions/forum.actions'
      );
      return createComment(forumId, postId, text, comment.id, mentionIds);
    },
    onSuccess: () => {
      setShowReply(false);
      qc.invalidateQueries({ queryKey });
      qc.invalidateQueries({ queryKey: ['forum-posts', forumId] });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: () => deleteComment(forumId, postId, comment.id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey });
      qc.invalidateQueries({ queryKey: ['forum-posts', forumId] });
    },
  });

  const { data: childComments } = useQuery({
    queryKey,
    queryFn: () => listComments(forumId, postId),
    select: (data) => data.data.filter((c) => c.parentId === comment.id),
    enabled: showReplies,
  });

  const canReply = depth < MAX_DEPTH;

  const handleEdit = async (text: string, _mentionIds: string[]) => {
    const { updateComment } = await import('../../../../actions/forum.actions');
    try {
      await updateComment(forumId, postId, comment.id, text);
      setEditing(false);
      qc.invalidateQueries({ queryKey });
    } catch {
      /* ignore */
    }
  };

  return (
    <div
      className={`${depth > 0 ? 'ml-8 border-l-2 border-slate-100 pl-4' : ''}`}
    >
      <div className="group relative rounded-xl p-3 transition hover:bg-slate-50">
        <div className="flex items-start justify-between gap-2">
          <div className="flex items-center gap-2 min-w-0">
            <div className="h-6 w-6 shrink-0 rounded-full bg-indigo-100 flex items-center justify-center">
              <span className="text-[10px] font-semibold text-indigo-600">
                {comment.authorName.charAt(0).toUpperCase()}
              </span>
            </div>
            <span className="text-xs font-medium text-slate-700 truncate">
              {comment.authorName}
            </span>
            <span className="text-[10px] text-slate-400">
              {new Date(comment.createdAt).toLocaleDateString()}
            </span>
          </div>
          <div className="flex items-center gap-0.5 opacity-0 group-hover:opacity-100 transition">
            {canReply && (
              <button
                type="button"
                onClick={() => setShowReply(!showReply)}
                className="rounded p-1 text-xs text-slate-400 hover:text-indigo-600 hover:bg-indigo-50"
              >
                <Reply className="h-3.5 w-3.5" />
              </button>
            )}
            {isAuthor && !editing && (
              <button
                type="button"
                onClick={() => setEditing(true)}
                className="rounded p-1 text-xs text-slate-400 hover:text-amber-600 hover:bg-amber-50"
              >
                <Edit3 className="h-3.5 w-3.5" />
              </button>
            )}
            {isAuthor && (
              <button
                type="button"
                onClick={() => setDeleting(true)}
                className="rounded p-1 text-xs text-slate-400 hover:text-red-600 hover:bg-red-50"
              >
                <Trash2 className="h-3.5 w-3.5" />
              </button>
            )}
          </div>
        </div>

        {editing ? (
          <div className="mt-2">
            <CommentMentionInput
              forumId={forumId}
              initialValue={comment.content}
              placeholder="Edit comment..."
              submitLabel="Save"
              onSubmit={handleEdit}
              onCancel={() => setEditing(false)}
              currentUserId={currentUserId}
            />
          </div>
        ) : (
          <CommentContent content={comment.content} />
        )}

        <div className="mt-1.5 flex items-center gap-2">
          <ReactionBar
            reactions={reactions?.groups ?? []}
            onReact={(emoji) => {
              const existing = reactions?.groups.find(
                (r: any) => r.emoji === emoji,
              );
              react.mutate({ emoji, add: !existing?.reacted });
            }}
            disabled={react.isPending}
          />
          {canReply && comment.replyCount > 0 && depth >= MAX_DEPTH && (
            <button
              type="button"
              onClick={() => setShowReplies(!showReplies)}
              className="inline-flex items-center gap-1 text-[10px] text-slate-400 hover:text-indigo-600 transition"
            >
              {showReplies ? (
                <ChevronDown className="h-3 w-3" />
              ) : (
                <ChevronRight className="h-3 w-3" />
              )}
              {comment.replyCount}{' '}
              {comment.replyCount === 1 ? 'reply' : 'replies'}
            </button>
          )}
        </div>

        {showReply && (
          <div className="mt-2">
            <CommentMentionInput
              forumId={forumId}
              placeholder="Write a reply..."
              onSubmit={(text, mentionIds) =>
                replyMutation.mutate({ text, mentionIds })
              }
              submitLabel="Reply"
              disabled={replyMutation.isPending}
              onCancel={() => setShowReply(false)}
              currentUserId={currentUserId}
            />
          </div>
        )}
      </div>

      {showReplies && childComments && childComments.length > 0 && (
        <div className="space-y-0.5">
          {childComments.map((child: CommentItem) => (
            <CommentThreadItem
              key={child.id}
              comment={child}
              forumId={forumId}
              postId={postId}
              currentUserId={currentUserId}
              depth={depth + 1}
            />
          ))}
        </div>
      )}

      {deleting && (
        <DeleteCommentModal
          isDeleting={deleteMutation.isPending}
          onCancel={() => setDeleting(false)}
          onDelete={() => deleteMutation.mutate()}
        />
      )}
    </div>
  );
}
