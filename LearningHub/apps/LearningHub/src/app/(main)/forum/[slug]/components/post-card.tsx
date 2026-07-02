'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import type { PostListItem } from '@learning-hub/domain';
import { MessageSquare, Clock, Edit3, Trash2 } from 'lucide-react';
import { TiptapViewer } from '../../../../../components/ui';
import {
  togglePostReaction,
  getTargetReactions,
} from '../../../../actions/forum.actions';
import { ReactionBar } from './reaction-bar';
import { CommentSection } from './comment-section';

interface PostCardProps {
  post: PostListItem;
  forumId: string;
  memberRole?: string;
  currentUserId?: string;
  onStartEdit: (p: PostListItem) => void;
  onDelete: (postId: string) => void;
}

export function PostCard({
  post,
  forumId,
  memberRole,
  currentUserId,
  onStartEdit,
  onDelete,
}: PostCardProps) {
  const qc = useQueryClient();
  const isAuthor = currentUserId ? post.authorId === currentUserId : false;
  const isOwner = memberRole === 'owner' || memberRole === 'moderator';
  const canEdit = isAuthor;
  const canDelete = isAuthor || isOwner;

  const { data: reactions } = useQuery({
    queryKey: ['forum-post-reactions', forumId, post.id],
    queryFn: () =>
      getTargetReactions({ targetType: 'post', targetId: post.id, forumId }),
    staleTime: 5000,
  });

  const react = useMutation({
    mutationFn: ({ emoji, add }: { emoji: string; add: boolean }) =>
      togglePostReaction(forumId, post.id, emoji, add),
    onSuccess: () => {
      qc.invalidateQueries({
        queryKey: ['forum-post-reactions', forumId, post.id],
      });
      qc.invalidateQueries({ queryKey: ['forum-posts', forumId] });
    },
  });

  return (
    <article className="rounded-2xl border border-slate-100 bg-white shadow-sm">
      <div className="p-5 pb-3">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-2 flex-wrap">
              <h3 className="text-xl font-semibold text-slate-900">
                {post.title}
              </h3>
            </div>
            <div className="mt-2 flex items-center gap-3 text-xs text-slate-400">
              <span>{post.authorName}</span>
              <span>
                <Clock className="inline h-3 w-3 mr-0.5" />
                {new Date(post.createdAt).toLocaleDateString('vi-VN')}
              </span>
            </div>
          </div>
        </div>

        {post.tags?.length ? (
          <div className="mt-2 flex flex-wrap gap-1">
            {post.tags.map((t) => (
              <span
                key={t.id}
                className="rounded-full px-2 py-0.5 text-[10px] font-medium"
                style={{
                  backgroundColor: t.color ? `${t.color}20` : '#f1f5f9',
                  color: '#111111',
                }}
              >
                {t.name}
              </span>
            ))}
          </div>
        ) : null}

        {post.content && Object.keys(post.content).length > 0 && (
          <div className="mt-3 text-sm text-slate-700">
            <TiptapViewer content={post.content} />
          </div>
        )}
      </div>

      <div className="flex items-center gap-3 border-t border-slate-50 px-5 py-2.5 overflow-visible">
        <button
          type="button"
          className="inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-medium transition text-slate-400 hover:text-indigo-600 hover:bg-indigo-50"
        >
          <MessageSquare className="h-3.5 w-3.5" />
          {post.commentCount} comments
        </button>
        {reactions && (
          <ReactionBar
            reactions={reactions.groups}
            onReact={(emoji) => {
              const existing = reactions?.groups.find(
                (r: any) => r.emoji === emoji,
              );
              react.mutate({ emoji, add: !existing?.reacted });
            }}
            disabled={react.isPending}
          />
        )}
        {canEdit && (
          <button
            type="button"
            onClick={() => onStartEdit(post)}
            className="inline-flex items-center gap-1 text-xs text-slate-400 hover:text-indigo-600 transition"
          >
            <Edit3 className="h-3.5 w-3.5" />
          </button>
        )}
        {canDelete && (
          <button
            type="button"
            onClick={() => onDelete(post.id)}
            className="ml-auto inline-flex items-center gap-1 text-xs text-slate-400 hover:text-red-600 transition"
          >
            <Trash2 className="h-3.5 w-3.5" />
          </button>
        )}
      </div>
      <CommentSection
        postId={post.id}
        forumId={forumId}
        currentUserId={currentUserId}
      />
    </article>
  );
}
