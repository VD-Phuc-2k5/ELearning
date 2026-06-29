'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { use, useEffect } from 'react';
import { useMutation, useQuery } from '@tanstack/react-query';
import { Button, Input, TiptapEditor } from '../../../../../components/ui';
import { createPost, getForumDetail } from '../../../../actions/forum.actions';

interface NewPostPageProps {
  params: Promise<{ slug: string }>;
}

export default function NewPostPage({ params }: NewPostPageProps) {
  const { slug } = use(params);
  const router = useRouter();
  const [title, setTitle] = useState('');
  const [content, setContent] = useState<Record<string, unknown> | null>(null);
  const [error, setError] = useState<string | null>(null);

  const { data } = useQuery({
    queryKey: ['forum', slug],
    queryFn: () => getForumDetail(slug),
  });
  const forumId = data?.forum.id ?? '';

  const createMutation = useMutation({
    mutationFn: () =>
      createPost(forumId, {
        title,
        content: content ?? undefined,
        postType: 'text',
      }),
    onSuccess: (post) => {
      if (post?.id) router.push(`/forum/${slug}/${post.id}`);
      else setError('Failed to create post');
    },
    onError: (e: Error) => setError(e.message),
  });

  useEffect(() => {
    if (data && !data.memberRole) {
      setError('You are not a member of this forum');
    }
  }, [data]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    if (!title.trim()) {
      setError('Title is required');
      return;
    }
    createMutation.mutate();
  };

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <h1 className="text-2xl font-bold text-slate-900">New Post</h1>

      {error && (
        <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        <label className="block space-y-1">
          <span className="text-sm font-medium text-slate-700">Title</span>
          <Input
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="What's this post about?"
          />
        </label>

        <div className="space-y-1">
          <span className="block text-sm font-medium text-slate-700">
            Content
          </span>
          <TiptapEditor
            content={content ?? undefined}
            onChange={(json) => setContent(json)}
            placeholder="Write your post..."
          />
        </div>

        <div className="flex justify-end gap-3 pt-4">
          <Button
            type="button"
            variant="secondary"
            onClick={() => router.push(`/forum/${slug}`)}
          >
            Cancel
          </Button>
          <Button type="submit" isLoading={createMutation.isPending}>
            Publish
          </Button>
        </div>
      </form>
    </div>
  );
}
