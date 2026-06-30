'use client';

import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import Link from 'next/link';
import {
  AlertTriangle,
  MessageSquare,
  Plus,
  Users,
  Save,
  X,
} from 'lucide-react';
import { Button, Input } from '../../../components/ui';
import { listForums, updateForum } from '../../actions/forum.actions';
import type { ForumListItem } from '@learning-hub/domain';

export default function ForumListPage() {
  const { data, isLoading, error, isError } = useQuery({
    queryKey: ['forums'],
    queryFn: () => listForums({ limit: 50 }),
    retry: false,
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
      ) : isError ? (
        <div className="rounded-2xl border-2 border-red-200 bg-red-50 p-8 text-center">
          <AlertTriangle className="h-10 w-10 text-red-400 mx-auto mb-3" />
          <p className="font-semibold text-red-700 mb-1">
            Failed to load forums
          </p>
          <p className="text-sm text-red-500 break-all">
            {error instanceof Error ? error.message : String(error)}
          </p>
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
  const [editing, setEditing] = useState(false);
  const [name, setName] = useState(forum.name);
  const [desc, setDesc] = useState(forum.description ?? '');
  const qc = useQueryClient();

  const saveEdit = useMutation({
    mutationFn: () =>
      updateForum(forum.id, { name, description: desc || undefined }),
    onSuccess: () => {
      setEditing(false);
      qc.invalidateQueries({ queryKey: ['forums'] });
    },
  });

  const visibilityBadge = {
    public: 'bg-emerald-50 text-emerald-700',
    private: 'bg-amber-50 text-amber-700',
    hidden: 'bg-slate-100 text-slate-600',
  }[forum.visibility];

  if (editing) {
    return (
      <div className="rounded-2xl border border-indigo-200 bg-white p-5 shadow-sm">
        <div className="space-y-3">
          /
          <Input
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Forum name"
          />
          <textarea
            value={desc}
            onChange={(e) => setDesc(e.target.value)}
            rows={2}
            className="w-full rounded-xl border border-slate-200 px-3 py-2 text-sm focus:outline-indigo-600"
            placeholder="Description"
          />
          <div className="flex gap-2">
            <Button
              size="sm"
              onClick={() => saveEdit.mutate()}
              isLoading={saveEdit.isPending}
              disabled={!name.trim()}
            >
              <Save className="h-3.5 w-full mr-1" /> Save
            </Button>
            <Button
              size="sm"
              variant="secondary"
              onClick={() => {
                setName(forum.name);
                setDesc(forum.description ?? '');
                setEditing(false);
              }}
            >
              <X className="h-3.5 w-full mr-1" /> Cancel
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="group relative rounded-2xl border border-slate-100 bg-white shadow-sm transition hover:shadow-md overflow-hidden">
      {forum.bannerUrl ? (
        <Link href={`/forum/${forum.slug}`}>
          <div className="aspect-[3/1] bg-slate-100">
            <img
              src={forum.bannerUrl}
              alt={forum.name}
              className="w-full h-full object-cover"
            />
          </div>
        </Link>
      ) : (
        <Link href={`/forum/${forum.slug}`}>
          <div className="h-20 bg-gradient-to-br from-indigo-50 to-violet-50 flex items-center justify-center">
            <MessageSquare className="h-8 w-8 text-indigo-300" />
          </div>
        </Link>
      )}
      <div className="p-5">
        <Link href={`/forum/${forum.slug}`}>
          <div className="flex items-start justify-between gap-3">
            <p className="font-semibold text-slate-900 group-hover:text-indigo-700">
              {forum.name}
            </p>
            <span
              className={`rounded-full px-2 py-0.5 text-[10px] font-medium uppercase tracking-wide shrink-0 ${visibilityBadge}`}
            >
              {forum.visibility}
            </span>
          </div>
          <p className="mt-1 text-sm text-slate-500 line-clamp-2">
            {forum.description ?? 'No description'}
          </p>
        </Link>
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
      </div>
    </div>
  );
}
