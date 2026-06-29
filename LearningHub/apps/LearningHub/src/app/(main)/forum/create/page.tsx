'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useMutation } from '@tanstack/react-query';
import { Button, Input } from '../../../../components/ui';
import { createForum } from '../../../actions/forum.actions';

export default function CreateForumPage() {
  const router = useRouter();
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [visibility, setVisibility] = useState<'public' | 'private' | 'hidden'>(
    'public',
  );
  const [error, setError] = useState<string | null>(null);

  const createMutation = useMutation({
    mutationFn: () =>
      createForum({ name, description: description || undefined, visibility }),
    onSuccess: (forum) => {
      if (forum?.slug) router.push(`/forum/${forum.slug}`);
      else setError('Failed to create forum');
    },
    onError: (err: Error) => setError(err.message),
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    if (!name.trim()) {
      setError('Forum name is required');
      return;
    }
    createMutation.mutate();
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <h1 className="text-2xl font-bold text-slate-900">Create a Forum</h1>

      {error && (
        <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {error}
        </div>
      )}

      <form
        onSubmit={handleSubmit}
        className="space-y-4 rounded-2xl border border-slate-100 bg-white p-6 shadow-sm"
      >
        <label className="block space-y-1">
          <span className="text-sm font-medium text-slate-700">Name</span>
          <Input
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="e.g. NestJS Beginners"
          />
        </label>

        <label className="block space-y-1">
          <span className="text-sm font-medium text-slate-700">
            Description
          </span>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            rows={4}
            className="w-full rounded-xl border border-slate-200 px-3 py-2 text-sm focus:outline-indigo-600"
            placeholder="What is this forum about?"
          />
        </label>

        <div className="space-y-1">
          <span className="block text-sm font-medium text-slate-700">
            Visibility
          </span>
          <div className="flex gap-2">
            {(['public', 'private', 'hidden'] as const).map((v) => (
              <button
                key={v}
                type="button"
                onClick={() => setVisibility(v)}
                className={[
                  'rounded-xl px-3 py-2 text-sm font-medium transition',
                  visibility === v
                    ? 'bg-indigo-600 text-white'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200',
                ].join(' ')}
              >
                {v}
              </button>
            ))}
          </div>
          <p className="text-xs text-slate-400">
            public = listed for everyone · private = members-only view · hidden
            = direct-link only
          </p>
        </div>

        <div className="flex justify-end gap-3 pt-4">
          <Button
            type="button"
            variant="secondary"
            onClick={() => router.push('/forum')}
          >
            Cancel
          </Button>
          <Button type="submit" isLoading={createMutation.isPending}>
            Create Forum
          </Button>
        </div>
      </form>
    </div>
  );
}
