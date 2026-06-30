'use client';

import { use, useEffect, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Button, Input, TiptapEditor } from '../../../../../components/ui';
import type { TiptapEditorHandle } from '../../../../../components/ui/tiptap-editor';
import {
  createPost,
  getForumDetail,
  listTags,
  uploadForumImage,
} from '../../../../actions/forum.actions';

interface NewPostPageProps {
  params: Promise<{ slug: string }>;
}

export default function NewPostPage({ params }: NewPostPageProps) {
  const { slug } = use(params);
  const router = useRouter();
  const qc = useQueryClient();
  const editorRef = useRef<TiptapEditorHandle>(null);
  const [title, setTitle] = useState('');
  const [content, setContent] = useState<Record<string, unknown> | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [selectedTagIds, setSelectedTagIds] = useState<Set<number>>(new Set());

  const { data } = useQuery({
    queryKey: ['forum', slug],
    queryFn: () => getForumDetail(slug),
  });
  const { data: tags = [] } = useQuery({
    queryKey: ['forum-tags'],
    queryFn: () => listTags(),
    enabled: !!data?.forum.id,
  });
  const forumId = data?.forum.id ?? '';

  const toggleTag = (tagId: number) => {
    setSelectedTagIds((prev) => {
      const next = new Set(prev);
      if (next.has(tagId)) next.delete(tagId);
      else next.add(tagId);
      return next;
    });
  };

  const createMutation = useMutation({
    mutationFn: async () => {
      const pendingImages = editorRef.current?.getPendingImages() ?? [];

      if (pendingImages.length > 0) {
        for (const { blobUrl, file } of pendingImages) {
          const formData = new FormData();
          formData.append('file', file);
          const result = await uploadForumImage(formData);
          if (!result?.url) {
            throw new Error(
              'Failed to upload one or more images. Please try again.',
            );
          }
          editorRef.current?.replaceImageSrc(blobUrl, result.url);
        }
      }

      const finalContent = editorRef.current?.getContent();
      return createPost(forumId, {
        title,
        content: finalContent,
        postType: 'text',
        tagIds: [...selectedTagIds],
      });
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['forum-posts'] });
      qc.invalidateQueries({ queryKey: ['forum', slug] });
      qc.invalidateQueries({ queryKey: ['forums'] });
      router.push(`/forum/${slug}`);
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
            ref={editorRef}
            content={content ?? undefined}
            onChange={(json) => setContent(json)}
            placeholder="Write your post..."
          />
        </div>

        {tags.length > 0 && (
          <div className="space-y-1.5">
            <span className="block text-sm font-medium text-slate-700">
              Tags
            </span>
            <div className="flex flex-wrap gap-2">
              {tags.map((t) => (
                <button
                  key={t.id}
                  type="button"
                  onClick={() => toggleTag(t.id)}
                  className={`rounded-full px-3 py-1 text-xs font-medium border transition ${
                    selectedTagIds.has(t.id)
                      ? 'text-white border-transparent'
                      : 'text-slate-600 border-slate-200 hover:border-slate-300'
                  }`}
                  style={
                    selectedTagIds.has(t.id)
                      ? { backgroundColor: t.color ?? '#3b82f6' }
                      : {
                          backgroundColor: t.color ? `${t.color}15` : '#f8fafc',
                        }
                  }
                >
                  {t.name}
                </button>
              ))}
            </div>
          </div>
        )}

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
