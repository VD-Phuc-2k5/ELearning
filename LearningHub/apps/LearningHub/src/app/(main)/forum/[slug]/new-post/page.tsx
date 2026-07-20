'use client';

import { use, useEffect, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { ArrowLeft } from 'lucide-react';
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

  const {
    data,
    isLoading: forumLoading,
    isError: forumError,
  } = useQuery({
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

  if (forumError || (!forumLoading && !data)) {
    return (
      <div className="max-w-2xl mx-auto mt-20 rounded-2xl border border-red-200 bg-red-50 p-8 text-center">
        <p className="font-semibold text-red-700 mb-2">Forum not found</p>
        <p className="text-sm text-red-500 mb-4">
          The forum may have been deleted or you do not have access.
        </p>
        <Link href="/forum" className="text-sm text-indigo-600 hover:underline">
          Back to forums
        </Link>
      </div>
    );
  }

  if (forumLoading) {
    return (
      <div className="max-w-3xl mx-auto space-y-4">
        <div className="h-8 w-48 rounded bg-slate-100 animate-pulse" />
        <div className="h-12 rounded-xl bg-slate-100 animate-pulse" />
        <div className="h-64 rounded-xl bg-slate-100 animate-pulse" />
      </div>
    );
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    if (!title.trim()) {
      setError('Title is required');
      return;
    }
    const extractText = (node: Record<string, unknown>): string =>
      node.type === 'text'
        ? String(node.text ?? '')
        : ((node.content as Record<string, unknown>[]) ?? [])
            .map(extractText)
            .join('');
    if (!content || !extractText(content).trim()) {
      setError('Content is required');
      return;
    }
    createMutation.mutate();
  };

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div>
        <Link
          href={`/forum/${slug}`}
          className="inline-flex items-center gap-1 text-sm text-slate-500 hover:text-indigo-600 transition mb-2"
        >
          <ArrowLeft className="h-3.5 w-3.5" />
          {data?.forum.name ?? slug}
        </Link>
        <h1 className="text-2xl font-bold text-slate-900">New Post</h1>
      </div>

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
            forumId={forumId}
          />
        </div>

        {tags.length > 0 && (
          <div className="space-y-1.5">
            <span className="block text-sm font-medium text-slate-700">
              Tags
            </span>
            <div className="flex flex-wrap gap-2">
              {tags.map((t: any) => (
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
