'use client';

import type { PostListItem } from '@learning-hub/domain';
import { MessageSquare, Clock, Edit3, Trash2 } from 'lucide-react';
import { TiptapViewer } from '../../../../../components/ui';
import { PostLikeButton } from './post-like-button';
import { PostCommentBox } from './post-comment-box';

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
  const isAuthor = currentUserId ? post.authorId === currentUserId : false;
  const isAdmin = memberRole === 'owner' || memberRole === 'moderator';
  const canEdit = isAuthor;
  const canDelete = isAuthor || isAdmin;

  return (
    <article className="rounded-2xl border border-slate-100 bg-white shadow-sm">
      <div className="p-5 pb-3">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-2 flex-wrap">
              {post.isPinned && (
                <span className="rounded bg-amber-50 px-1.5 py-0.5 text-[10px] font-semibold text-amber-700">
                  PINNED
                </span>
              )}
              <h3 className="text-lg font-semibold text-slate-900">
                {post.title}
              </h3>
            </div>
            <div className="mt-2 flex items-center gap-3 text-xs text-slate-400">
              <span>{post.authorName}</span>
              <span>
                <Clock className="inline h-3 w-3 mr-0.5" />
                {new Date(post.createdAt).toLocaleDateString()}
              </span>
            </div>
          </div>
          <span className="rounded-md bg-slate-100 px-2 py-0.5 text-[10px] text-slate-500 uppercase shrink-0">
            {post.postType}
          </span>
        </div>

        {post.tags?.length ? (
          <div className="mt-2 flex flex-wrap gap-1">
            {post.tags.map((t) => (
              <span
                key={t.id}
                className="rounded-full px-2 py-0.5 text-[10px] font-medium"
                style={{
                  backgroundColor: t.color ? `${t.color}20` : '#f1f5f9',
                  color: t.color ?? '#64748b',
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

      <div className="flex items-center gap-3 border-t border-slate-50 px-5 py-2.5">
        <span className="inline-flex items-center gap-1.5 text-xs text-slate-400">
          <MessageSquare className="h-3.5 w-3.5" />
          {post.commentCount} comments
        </span>
        <PostLikeButton postId={post.id} forumId={forumId} />
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
      <PostCommentBox postId={post.id} forumId={forumId} />
    </article>
  );
}
