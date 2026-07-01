'use client';

import { useMutation, useQueryClient } from '@tanstack/react-query';
import type { InfiniteData } from '@tanstack/react-query';
import type { RefObject } from 'react';
import type { PostListItem } from '@learning-hub/domain';
import type { PaginatedResponse } from '@learning-hub/domain';
import type { TiptapEditorHandle } from '../../../../../components/ui/tiptap-editor';
import {
  joinForum,
  leaveForum,
  updateForum,
  setForumRules,
  createTag,
  deleteTag,
  deletePost,
  updatePost,
  uploadForumImage,
} from '../../../../actions/forum.actions';

interface UseForumMutationsParams {
  forumId: string;
  slug: string;
  tagFilterId?: number;
  searchQuery: string;
  editorRef: RefObject<TiptapEditorHandle | null>;
  onError: (msg: string) => void;
}

export function useForumMutations({
  forumId,
  slug,
  tagFilterId,
  searchQuery,
  editorRef,
  onError,
}: UseForumMutationsParams) {
  const qc = useQueryClient();

  const join = useMutation({
    mutationFn: () => joinForum(forumId),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['forum', slug] }),
  });

  const leave = useMutation({
    mutationFn: () => leaveForum(forumId),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['forum', slug] }),
  });

  const saveEdit = useMutation({
    mutationFn: (params: { name: string; description?: string }) =>
      updateForum(forumId, params),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['forum', slug] }),
    onError: (e: Error) => onError(e.message),
  });

  const uploadBanner = useMutation({
    mutationFn: async (file: File) => {
      const formData = new FormData();
      formData.append('file', file);
      const result = await uploadForumImage(formData);
      if (!result?.url) throw new Error('Failed to upload banner');
      await updateForum(forumId, { bannerUrl: result.url });
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['forum', slug] }),
    onError: (e: Error) => onError(e.message),
  });

  const uploadIcon = useMutation({
    mutationFn: async (file: File) => {
      const formData = new FormData();
      formData.append('file', file);
      const result = await uploadForumImage(formData);
      if (!result?.url) throw new Error('Failed to upload icon');
      await updateForum(forumId, { iconUrl: result.url });
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['forum', slug] }),
    onError: (e: Error) => onError(e.message),
  });

  const removeBanner = useMutation({
    mutationFn: () => updateForum(forumId, { bannerUrl: '' }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['forum', slug] }),
    onError: (e: Error) => onError(e.message),
  });

  const removeIcon = useMutation({
    mutationFn: () => updateForum(forumId, { iconUrl: '' }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['forum', slug] }),
    onError: (e: Error) => onError(e.message),
  });

  const changeVisibility = useMutation({
    mutationFn: (vis: 'public' | 'private') =>
      updateForum(forumId, { visibility: vis }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['forum', slug] }),
    onError: (e: Error) => onError(e.message),
  });

  const saveRules = useMutation({
    mutationFn: (draft: Array<{ title: string; body: string }>) =>
      setForumRules(forumId, draft),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['forum', slug] }),
    onError: (e: Error) => onError(e.message),
  });

  const createTagMutation = useMutation({
    mutationFn: (params: { name: string; color: string }) => createTag(params),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['forum-tags'] }),
    onError: (e: Error) => onError(e.message),
  });

  const deleteTagMutation = useMutation({
    mutationFn: (tagId: number) => deleteTag(tagId),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['forum-tags'] });
      qc.invalidateQueries({ queryKey: ['forum-posts', forumId] });
    },
    onError: (e: Error) => onError(e.message),
  });

  const deletePostMutation = useMutation({
    mutationFn: (pid: string) => deletePost(forumId, pid),
    onSuccess: () =>
      qc.invalidateQueries({ queryKey: ['forum-posts', forumId] }),
  });

  const updatePostMutation = useMutation({
    mutationFn: async (params: {
      postId: string;
      title: string;
      tagIds: number[];
    }) => {
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
      return updatePost(forumId, params.postId, {
        title: params.title,
        content: finalContent,
        tagIds: params.tagIds,
      });
    },
    onSuccess: (data, variables) => {
      if (data) {
        qc.setQueryData(
          ['forum-posts', forumId, tagFilterId, searchQuery],
          (old: InfiniteData<PaginatedResponse<PostListItem>> | undefined) => {
            if (!old) return old;
            return {
              ...old,
              pages: old.pages.map((page) => ({
                ...page,
                data: page.data.map((p) =>
                  p.id === variables.postId ? { ...p, ...data } : p,
                ),
              })),
            };
          },
        );
      }
      qc.invalidateQueries({ queryKey: ['forum-posts', forumId] });
      qc.invalidateQueries({ queryKey: ['forum', slug] });
    },
    onError: (e: Error) => onError(e.message),
  });

  return {
    join,
    leave,
    saveEdit,
    uploadBanner,
    uploadIcon,
    removeBanner,
    removeIcon,
    changeVisibility,
    saveRules,
    createTagMutation,
    deleteTagMutation,
    deletePostMutation,
    updatePostMutation,
  };
}
