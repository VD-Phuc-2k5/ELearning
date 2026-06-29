'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import Link from 'next/link';
import { use } from 'react';
import { Plus, Users, BookOpen, Lock } from 'lucide-react';
import { Button } from '../../../../components/ui';
import {
  getForumDetail,
  joinForum,
  leaveForum,
  listForumPosts,
  type ForumRule,
} from '../../../actions/forum.actions';

interface ForumDetailPageProps {
  params: Promise<{ slug: string }>;
}

export default function ForumDetailPage({ params }: ForumDetailPageProps) {
  const { slug } = use(params);
  const qc = useQueryClient();

  const { data: detail, isLoading: detailLoading } = useQuery({
    queryKey: ['forum', slug],
    queryFn: () => getForumDetail(slug),
  });
  const forumId = detail?.forum.id ?? '';
  const { data: posts, isLoading: postsLoading } = useQuery({
    queryKey: ['forum-posts', forumId],
    queryFn: () => listForumPosts(forumId, { limit: 30 }),
    enabled: !!forumId,
  });

  const join = useMutation({
    mutationFn: () => joinForum(forumId),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['forum', slug] }),
  });
  const leave = useMutation({
    mutationFn: () => leaveForum(forumId),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['forum', slug] }),
  });

  if (detailLoading || !detail) {
    return (
      <div className="space-y-4">
        <div className="h-24 rounded-2xl bg-slate-100 animate-pulse" />
        <div className="h-10 rounded-xl bg-slate-100 animate-pulse" />
      </div>
    );
  }

  const { forum, memberRole, rules } = detail;

  return (
    <div className="space-y-6">
      <header className="rounded-2xl border border-slate-100 bg-white p-6 shadow-sm">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <div className="flex items-center gap-2">
              <h1 className="text-2xl font-bold text-slate-900 truncate">
                {forum.name}
              </h1>
              {forum.isLocked && (
                <span className="inline-flex items-center gap-1 rounded-md bg-slate-100 px-2 py-0.5 text-xs text-slate-500">
                  <Lock className="h-3.5 w-3.5" /> Locked
                </span>
              )}
            </div>
            <p className="mt-1 text-sm text-slate-500">
              {forum.description ?? 'No description'}
            </p>
          </div>
          <div className="flex gap-2 shrink-0">
            {memberRole ? (
              <>
                <Link href={`/forum/${slug}/new-post`}>
                  <Button
                    size="sm"
                    icon={<Plus className="h-4 w-4" />}
                    disabled={forum.isLocked}
                  >
                    New Post
                  </Button>
                </Link>
                {memberRole !== 'owner' && (
                  <Button
                    size="sm"
                    variant="secondary"
                    isLoading={leave.isPending}
                    onClick={() => leave.mutate()}
                  >
                    Leave
                  </Button>
                )}
              </>
            ) : (
              <Button
                size="sm"
                isLoading={join.isPending}
                onClick={() => join.mutate()}
                disabled={forum.isLocked}
              >
                Join
              </Button>
            )}
          </div>
        </div>
      </header>

      <div className="grid gap-6 lg:grid-cols-[1fr_300px]">
        <section>
          <h2 className="mb-3 text-sm font-semibold uppercase tracking-wide text-slate-400">
            Posts
          </h2>
          {postsLoading ? (
            <div className="space-y-3">
              {[1, 2, 3].map((i) => (
                <div
                  key={i}
                  className="h-16 rounded-xl bg-slate-100 animate-pulse"
                />
              ))}
            </div>
          ) : !posts?.data?.length ? (
            <div className="rounded-2xl border-2 border-dashed border-slate-200 p-10 text-center">
              <BookOpen className="mx-auto h-8 w-8 text-slate-300" />
              <p className="mt-2 font-medium text-slate-500">No posts yet</p>
            </div>
          ) : (
            <div className="space-y-3">
              {posts.data.map((p) => (
                <Link
                  key={p.id}
                  href={`/forum/${slug}/${p.id}`}
                  className="block rounded-2xl border border-slate-100 bg-white p-4 shadow-sm transition hover:shadow-md"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      {p.isPinned && (
                        <span className="mr-2 rounded bg-amber-50 px-1.5 py-0.5 text-[10px] font-semibold text-amber-700">
                          PINNED
                        </span>
                      )}
                      <p className="font-semibold text-slate-900 truncate">
                        {p.title}
                      </p>
                      <p className="mt-1 text-xs text-slate-400">
                        {p.commentCount} comments · {p.reactionCount} reactions
                        · {p.viewCount} views
                      </p>
                    </div>
                    <span className="rounded-md bg-slate-100 px-2 py-0.5 text-[10px] text-slate-500 uppercase">
                      {p.postType}
                    </span>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </section>

        <ForumSidebar
          memberCount={forum.memberCount}
          postCount={forum.postCount}
          rules={rules}
        />
      </div>
    </div>
  );
}

function ForumSidebar({
  memberCount,
  postCount,
  rules,
}: {
  memberCount: number;
  postCount: number;
  rules: ForumRule[];
}) {
  return (
    <aside className="space-y-4">
      <div className="rounded-2xl border border-slate-100 bg-white p-4 shadow-sm">
        <h3 className="text-sm font-semibold text-slate-900">Stats</h3>
        <ul className="mt-2 space-y-1.5 text-sm text-slate-600">
          <li className="flex items-center justify-between">
            <span className="inline-flex items-center gap-2">
              <Users className="h-4 w-4 text-slate-400" /> Members
            </span>
            <span className="font-medium">{memberCount}</span>
          </li>
          <li className="flex items-center justify-between">
            <span className="inline-flex items-center gap-2">
              <BookOpen className="h-4 w-4 text-slate-400" /> Posts
            </span>
            <span className="font-medium">{postCount}</span>
          </li>
        </ul>
      </div>
      <div className="rounded-2xl border border-slate-100 bg-white p-4 shadow-sm">
        <h3 className="text-sm font-semibold text-slate-900">Rules</h3>
        {!rules.length ? (
          <p className="mt-2 text-xs text-slate-400">No rules posted.</p>
        ) : (
          <ol className="mt-2 space-y-2">
            {rules.map((r, i) => (
              <li key={r.id} className="text-sm">
                <p className="font-medium text-slate-700">
                  {i + 1}. {r.title}
                </p>
                <p className="text-xs text-slate-500">{r.body}</p>
              </li>
            ))}
          </ol>
        )}
      </div>
    </aside>
  );
}
