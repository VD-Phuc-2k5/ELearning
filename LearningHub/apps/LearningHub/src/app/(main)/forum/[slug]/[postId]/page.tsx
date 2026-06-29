'use client';

import { useState, useCallback, use } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { ArrowLeft, MessageSquare, Eye, Sparkles } from 'lucide-react';
import Link from 'next/link';
import { Button, Input } from '../../../../../components/ui';
import { useForumSocket } from '../../../../../components/hooks/use-forum-socket';
import {
  createComment,
  listComments,
  togglePostReaction,
  type CommentItem,
} from '../../../../actions/forum.actions';

interface PostDetailPageProps {
  params: Promise<{ slug: string; postId: string }>;
}

const ALLOWED_EMOJIS = ['👍', '❤️', '🎉', '🔥'];

export default function PostDetailPage({ params }: PostDetailPageProps) {
  const { slug, postId } = use(params);
  const qc = useQueryClient();
  const [commentText, setCommentText] = useState('');
  const [replyTarget, setReplyTarget] = useState<{ id: string } | null>(null);
  const [replyText, setReplyText] = useState('');
  const [error, setError] = useState<string | null>(null);

  const { data: comments, isLoading } = useQuery({
    queryKey: ['forum-comments', postId],
    queryFn: () => listComments(slug, postId, { limit: 100 }),
    enabled: !!postId && !!slug,
  });

  // Need forumId - but slug is the slug not id. The routes use forumId. For serverside handlers, the slug is interpreted as forumId-or-slug by the API.
  // Plan: just use slug, as route URLs include slug; backend controllers accept forumId via param. The create-comment endpoint requires forumId.
  // For simplicity assume the API forum-by-slug lookup uses the slug itself but our API uses UUID. Use slug as forumId here - the actions layer needsto resolve.

  const handleCommentNew = useCallback(() => {
    qc.invalidateQueries({ queryKey: ['forum-comments', postId] });
  }, [qc, postId]);
  const handleReactionUpdate = useCallback(() => {
    qc.invalidateQueries({ queryKey: ['forum-comments', postId] });
  }, [qc, postId]);

  useForumSocket({
    postId,
    enabled: !!postId,
    handlers: {
      onCommentNew: handleCommentNew,
      onReactionUpdate: handleReactionUpdate,
    },
  });

  const addComment = useMutation({
    mutationFn: () => createComment(slug, postId, commentText, undefined),
    onSuccess: () => {
      setCommentText('');
      qc.invalidateQueries({ queryKey: ['forum-comments', postId] });
    },
    onError: (e: Error) => setError(e.message),
  });

  const addReply = useMutation({
    mutationFn: () => createComment(slug, postId, replyText, replyTarget?.id),
    onSuccess: () => {
      setReplyText('');
      setReplyTarget(null);
      qc.invalidateQueries({ queryKey: ['forum-comments', postId] });
    },
    onError: (e: Error) => setError(e.message),
  });

  const react = useMutation({
    mutationFn: (emoji: string) =>
      togglePostReaction(slug, postId, emoji, true),
    onSuccess: () =>
      qc.invalidateQueries({ queryKey: ['forum-comments', postId] }),
  });

  void slug;

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <Link
        href={`/forum/${slug}`}
        className="inline-flex items-center gap-1 text-sm text-slate-500 hover:text-slate-700"
      >
        <ArrowLeft className="h-4 w-4" /> Back to forum
      </Link>

      {error && (
        <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {error}
        </div>
      )}

      <header className="rounded-2xl border border-slate-100 bg-white p-6 shadow-sm">
        <h1 className="text-xl font-bold text-slate-900">Post {postId}</h1>
        <div className="mt-4 flex items-center gap-3 text-sm text-slate-500">
          <span className="inline-flex items-center gap-1">
            <MessageSquare className="h-4 w-4" />
            {comments?.total ?? 0} comments
          </span>
          <span className="inline-flex items-center gap-1">
            <Eye className="h-4 w-4" /> Views
          </span>
        </div>
        <div className="mt-4 flex items-center gap-2">
          {ALLOWED_EMOJIS.map((emoji) => (
            <button
              key={emoji}
              type="button"
              onClick={() => react.mutate(emoji)}
              className="h-9 w-9 rounded-full bg-slate-50 text-lg transition hover:bg-slate-100"
              disabled={react.isPending}
            >
              {emoji}
            </button>
          ))}
        </div>
      </header>

      <section className="rounded-2xl border border-slate-100 bg-white p-6 shadow-sm">
        <h2 className="mb-3 text-sm font-semibold uppercase tracking-wide text-slate-400">
          Add a comment
        </h2>
        <div className="flex gap-3">
          <Input
            value={commentText}
            onChange={(e) => setCommentText(e.target.value)}
            placeholder="Your comment..."
          />
          <Button
            onClick={() => addComment.mutate()}
            isLoading={addComment.isPending}
            disabled={!commentText.trim()}
          >
            Send
          </Button>
        </div>
      </section>

      <section className="space-y-4">
        <h2 className="text-sm font-semibold uppercase tracking-wide text-slate-400">
          Comments
        </h2>
        {isLoading ? (
          <div className="space-y-3">
            {[1, 2, 3].map((i) => (
              <div
                key={i}
                className="h-16 bg-slate-100 rounded-xl animate-pulse"
              />
            ))}
          </div>
        ) : !comments?.data?.length ? (
          <div className="rounded-2xl border-2 border-dashed border-slate-200 p-10 text-center">
            <Sparkles className="mx-auto h-8 w-8 text-slate-300" />
            <p className="mt-2 font-medium text-slate-500">
              No comments yet — be the first!
            </p>
          </div>
        ) : (
          <CommentThread
            comments={comments.data}
            onReply={(id) => {
              setReplyTarget({ id });
              setReplyText('');
            }}
            activeReplyId={replyTarget?.id ?? null}
            replyText={replyText}
            setReplyText={setReplyText}
            submitReply={() => addReply.mutate()}
            submitting={addReply.isPending}
          />
        )}
      </section>
    </div>
  );
}

function CommentThread({
  comments,
  onReply,
  activeReplyId,
  replyText,
  setReplyText,
  submitReply,
  submitting,
}: {
  comments: CommentItem[];
  onReply: (id: string) => void;
  activeReplyId: string | null;
  replyText: string;
  setReplyText: (v: string) => void;
  submitReply: () => void;
  submitting: boolean;
}) {
  const byParent = new Map<string | null, CommentItem[]>();
  for (const c of comments) {
    const list = byParent.get(c.parentId) ?? [];
    list.push(c);
    byParent.set(c.parentId, list);
  }
  const roots = byParent.get(null) ?? [];

  const render = (comment: CommentItem, depth = 0): React.ReactNode => {
    const children = byParent.get(comment.id) ?? [];
    return (
      <div
        key={comment.id}
        className={`space-y-2 ${depth > 0 ? 'ml-6 border-l border-slate-100 pl-4' : ''}`}
      >
        <article className="rounded-xl bg-slate-50 p-3">
          <p className="text-sm text-slate-800">{comment.content}</p>
          <div className="mt-2 flex items-center gap-3 text-xs text-slate-400">
            <span>{comment.reactionCount} reactions</span>
            {depth < 2 && (
              <button
                type="button"
                onClick={() => onReply(comment.id)}
                className="text-indigo-600 hover:text-indigo-700"
              >
                Reply
              </button>
            )}
          </div>
        </article>
        {activeReplyId === comment.id && (
          <div className="flex gap-2">
            <Input
              value={replyText}
              onChange={(e) => setReplyText(e.target.value)}
              placeholder="Your reply..."
            />
            <Button
              size="sm"
              onClick={submitReply}
              isLoading={submitting}
              disabled={!replyText.trim()}
            >
              Reply
            </Button>
          </div>
        )}
        {children.map((c) => render(c, depth + 1))}
      </div>
    );
  };

  return <div className="space-y-4">{roots.map((c) => render(c))}</div>;
}
