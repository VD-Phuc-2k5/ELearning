'use client';

import { useQuery } from '@tanstack/react-query';
import Link from 'next/link';
import { MessageSquare, Plus, Users } from 'lucide-react';
import { Button } from '../../../components/ui';
import { listForums, type ForumListItem } from '../../actions/forum.actions';

export default function ForumListPage() {
  const { data, isLoading } = useQuery({
    queryKey: ['forums'],
    queryFn: () => listForums({ limit: 50 }),
  });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-slate-900">Forum</h1>
        <Link href="/forum/create">
          <Button icon={<Plus className="h-4 w-4" />}>New Forum</Button>
        </Link>
      </div>

      {isLoading ? (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <div
              key={i}
              className="h-40 rounded-2xl bg-slate-100 animate-pulse"
            />
          ))}
        </div>
      ) : !data?.data?.length ? (
        <div className="rounded-2xl border-2 border-dashed border-slate-200 p-16 text-center">
          <MessageSquare className="h-10 w-10 text-slate-300 mx-auto mb-3" />
          <p className="font-semibold text-slate-500">No forums yet</p>
          <Link href="/forum/create" className="mt-4 inline-block">
            <Button size="sm">Create the first forum</Button>
          </Link>
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {data.data.map((forum) => (
            <ForumCard key={forum.id} forum={forum} />
          ))}
        </div>
      )}
    </div>
  );
}

function ForumCard({ forum }: { forum: ForumListItem }) {
  const visibilityBadge = {
    public: 'bg-emerald-50 text-emerald-700',
    private: 'bg-amber-50 text-amber-700',
    hidden: 'bg-slate-100 text-slate-600',
  }[forum.visibility];

  return (
    <Link
      href={`/forum/${forum.slug}`}
      className="group block rounded-2xl border border-slate-100 bg-white p-5 shadow-sm transition hover:shadow-md"
    >
      <div className="flex items-start justify-between gap-3">
        <div className="h-10 w-10 rounded-xl bg-indigo-50 flex items-center justify-center shrink-0">
          <MessageSquare className="h-5 w-5 text-indigo-600" />
        </div>
        <span
          className={`rounded-full px-2 py-0.5 text-[10px] font-medium uppercase tracking-wide ${visibilityBadge}`}
        >
          {forum.visibility}
        </span>
      </div>
      <p className="mt-3 font-semibold text-slate-900 group-hover:text-indigo-700">
        {forum.name}
      </p>
      <p className="mt-1 text-sm text-slate-500 line-clamp-2">
        {forum.description ?? 'No description'}
      </p>
      <div className="mt-4 flex items-center gap-4 text-xs text-slate-400">
        <span className="inline-flex items-center gap-1">
          <Users className="h-3.5 w-3.5" />
          {forum.memberCount}
        </span>
        <span className="inline-flex items-center gap-1">
          <MessageSquare className="h-3.5 w-3.5" />
          {forum.postCount}
        </span>
      </div>
    </Link>
  );
}
