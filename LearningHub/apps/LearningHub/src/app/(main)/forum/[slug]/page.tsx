'use client';

import { useState, useCallback, useEffect, useRef } from 'react';
import {
  useInfiniteQuery,
  useMutation,
  useQuery,
  useQueryClient,
} from '@tanstack/react-query';
import Link from 'next/link';
import { use } from 'react';
import {
  Plus,
  Users,
  BookOpen,
  Lock,
  Save,
  X,
  Shield,
  MessageSquare,
  Heart,
  Clock,
  ChevronDown,
  Filter,
  Trash2,
  Globe,
  Edit3,
  Search,
  Image,
  Upload,
} from 'lucide-react';
import {
  Button,
  Input,
  TiptapEditor,
  TiptapViewer,
} from '../../../../components/ui';
import type { TiptapEditorHandle } from '../../../../components/ui/tiptap-editor';
import { useForumSocket } from '../../../../components/hooks/use-forum-socket';
import {
  getForumDetail,
  joinForum,
  leaveForum,
  listForumPosts,
  updateForum,
  setForumRules,
  listTags,
  createTag,
  deleteTag,
  createComment,
  togglePostReaction,
  deletePost,
  updatePost,
  uploadForumImage,
} from '../../../actions/forum.actions';
import type { ForumRule, ForumTag } from '@learning-hub/domain';

const POSTS_PER_PAGE = 10;
const ALLOWED_EMOJIS = ['👍', '❤️', '🎉', '🔥'];

interface ForumDetailPageProps {
  params: Promise<{ slug: string }>;
}

const ROLE_LABEL: Record<string, string> = {
  owner: 'Owner',
  moderator: 'Moderator',
  member: 'Member',
};

const ROLE_COLOR: Record<string, string> = {
  owner: 'bg-indigo-50 text-indigo-700',
  moderator: 'bg-emerald-50 text-emerald-700',
  member: 'bg-slate-100 text-slate-600',
};

const VISIBILITY_LABEL: Record<string, string> = {
  public: 'Public',
  private: 'Private',
};

const VISIBILITY_ICON: Record<string, React.ReactNode> = {
  public: <Globe className="h-3 w-3" />,
  private: <Lock className="h-3 w-3" />,
};

export default function ForumDetailPage({ params }: ForumDetailPageProps) {
  const { slug } = use(params);
  const qc = useQueryClient();
  const loadMoreRef = useRef<HTMLDivElement>(null);
  const [editingName, setEditingName] = useState(false);
  const [editingDesc, setEditingDesc] = useState(false);
  const [editName, setEditName] = useState('');
  const [editDesc, setEditDesc] = useState('');
  const bannerInputRef = useRef<HTMLInputElement>(null);
  const iconInputRef = useRef<HTMLInputElement>(null);
  const [editingRules, setEditingRules] = useState(false);
  const [rulesDraft, setRulesDraft] = useState<
    Array<{ title: string; body: string }>
  >([]);
  const [error, setError] = useState<string | null>(null);

  const [tagFilterId, setTagFilterId] = useState<number | undefined>(undefined);
  const [showTagManager, setShowTagManager] = useState(false);
  const [newTagName, setNewTagName] = useState('');
  const [newTagColor, setNewTagColor] = useState('#3b82f6');
  const [showVisDropdown, setShowVisDropdown] = useState(false);
  const visDropdownRef = useRef<HTMLDivElement>(null);
  const [deletingPostId, setDeletingPostId] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [editingPostId, setEditingPostId] = useState<string | null>(null);
  const [editTitle, setEditTitle] = useState('');
  const [editContent, setEditContent] = useState<Record<
    string,
    unknown
  > | null>(null);
  const [editTagIds, setEditTagIds] = useState<Set<number>>(new Set());
  const editorRef = useRef<TiptapEditorHandle>(null);

  const { data: detail, isLoading: detailLoading } = useQuery({
    queryKey: ['forum', slug],
    queryFn: () => getForumDetail(slug),
  });
  const forumId = detail?.forum.id ?? '';

  const {
    data: postsData,
    isLoading: postsLoading,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
  } = useInfiniteQuery({
    queryKey: ['forum-posts', forumId, tagFilterId, searchQuery],
    queryFn: ({ pageParam }) =>
      listForumPosts(forumId, {
        page: pageParam,
        limit: POSTS_PER_PAGE,
        tagId: tagFilterId,
        search: searchQuery || undefined,
      }),
    initialPageParam: 1,
    getNextPageParam: (lastPage, allPages) => {
      const totalFetched = allPages.reduce((sum, p) => sum + p.data.length, 0);
      return totalFetched < lastPage.total ? allPages.length + 1 : undefined;
    },
    enabled: !!forumId,
  });

  const { data: tags = [] } = useQuery({
    queryKey: ['forum-tags'],
    queryFn: () => listTags(),
    enabled: !!forumId,
  });

  const posts = postsData?.pages.flatMap((p) => p.data) ?? [];

  useEffect(() => {
    const el = loadMoreRef.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && hasNextPage && !isFetchingNextPage) {
          fetchNextPage();
        }
      },
      { rootMargin: '200px' },
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, [hasNextPage, isFetchingNextPage, fetchNextPage]);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (
        visDropdownRef.current &&
        !visDropdownRef.current.contains(e.target as Node)
      ) {
        setShowVisDropdown(false);
      }
    };
    if (showVisDropdown) {
      document.addEventListener('mousedown', handler);
      return () => document.removeEventListener('mousedown', handler);
    }
  }, [showVisDropdown]);

  const join = useMutation({
    mutationFn: () => joinForum(forumId),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['forum', slug] }),
  });
  const leave = useMutation({
    mutationFn: () => leaveForum(forumId),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['forum', slug] }),
  });

  const saveEdit = useMutation({
    mutationFn: () =>
      updateForum(forumId, {
        name: editName,
        description: editDesc || undefined,
      }),
    onSuccess: () => {
      setEditingName(false);
      setEditingDesc(false);
      qc.invalidateQueries({ queryKey: ['forum', slug] });
    },
    onError: (e: Error) => setError(e.message),
  });

  const uploadBanner = useMutation({
    mutationFn: async (file: File) => {
      const formData = new FormData();
      formData.append('file', file);
      const result = await uploadForumImage(formData);
      if (!result?.url) throw new Error('Failed to upload banner');
      await updateForum(forumId, { bannerUrl: result.url });
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['forum', slug] });
    },
    onError: (e: Error) => setError(e.message),
  });

  const uploadIcon = useMutation({
    mutationFn: async (file: File) => {
      const formData = new FormData();
      formData.append('file', file);
      const result = await uploadForumImage(formData);
      if (!result?.url) throw new Error('Failed to upload icon');
      await updateForum(forumId, { iconUrl: result.url });
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['forum', slug] });
    },
    onError: (e: Error) => setError(e.message),
  });

  const removeBanner = useMutation({
    mutationFn: () => updateForum(forumId, { bannerUrl: '' }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['forum', slug] }),
    onError: (e: Error) => setError(e.message),
  });

  const removeIcon = useMutation({
    mutationFn: () => updateForum(forumId, { iconUrl: '' }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['forum', slug] }),
    onError: (e: Error) => setError(e.message),
  });

  const changeVisibility = useMutation({
    mutationFn: (vis: 'public' | 'private') =>
      updateForum(forumId, { visibility: vis }),
    onSuccess: () => {
      setShowVisDropdown(false);
      qc.invalidateQueries({ queryKey: ['forum', slug] });
    },
    onError: (e: Error) => setError(e.message),
  });

  const saveRules = useMutation({
    mutationFn: () => setForumRules(forumId, rulesDraft),
    onSuccess: () => {
      setEditingRules(false);
      qc.invalidateQueries({ queryKey: ['forum', slug] });
    },
    onError: (e: Error) => setError(e.message),
  });

  const createTagMutation = useMutation({
    mutationFn: () => createTag({ name: newTagName, color: newTagColor }),
    onSuccess: () => {
      setNewTagName('');
      qc.invalidateQueries({ queryKey: ['forum-tags'] });
    },
    onError: (e: Error) => setError(e.message),
  });

  const deleteTagMutation = useMutation({
    mutationFn: (tagId: number) => deleteTag(tagId),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['forum-tags'] });
      qc.invalidateQueries({ queryKey: ['forum-posts', forumId] });
    },
    onError: (e: Error) => setError(e.message),
  });

  const deletePostMutation = useMutation({
    mutationFn: (pid: string) => deletePost(forumId, pid),
    onSuccess: () => {
      setDeletingPostId(null);
      qc.invalidateQueries({ queryKey: ['forum-posts', forumId] });
      qc.invalidateQueries({ queryKey: ['forum', slug] });
    },
    onError: (e: Error) => setError(e.message),
  });

  const startEditPost = (p: (typeof posts)[number]) => {
    setEditingPostId(p.id);
    setEditTitle(p.title);
    setEditContent(p.content);
    setEditTagIds(new Set(p.tags.map((t) => t.id)));
    setError(null);
  };

  const cancelEditPost = () => {
    setEditingPostId(null);
    setError(null);
  };

  const toggleEditTag = (tagId: number) => {
    setEditTagIds((prev) => {
      const next = new Set(prev);
      if (next.has(tagId)) next.delete(tagId);
      else next.add(tagId);
      return next;
    });
  };

  const replaceBlobUrls = (
    json: Record<string, unknown> | null,
    urlMap: Map<string, string>,
  ): void => {
    if (!json) return;
    for (const key of Object.keys(json)) {
      const val = json[key];
      if (
        typeof val === 'string' &&
        val.startsWith('blob:') &&
        urlMap.has(val)
      ) {
        json[key] = urlMap.get(val);
      } else if (Array.isArray(val)) {
        for (const item of val) {
          if (typeof item === 'object' && item !== null) {
            replaceBlobUrls(item as Record<string, unknown>, urlMap);
          }
        }
      } else if (typeof val === 'object' && val !== null) {
        replaceBlobUrls(val as Record<string, unknown>, urlMap);
      }
    }
  };

  const updatePostMutation = useMutation({
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

      if (!editingPostId) return undefined;

      return updatePost(forumId, editingPostId, {
        title: editTitle,
        content: finalContent,
        tagIds: Array.from(editTagIds),
      });
    },
    onSuccess: (data) => {
      const postId = editingPostId;
      if (data && postId) {
        qc.setQueryData(
          ['forum-posts', forumId, tagFilterId, searchQuery],
          (old: any) => {
            if (!old) return old;
            return {
              ...old,
              pages: old.pages.map((page: any) => ({
                ...page,
                data: page.data.map((p: any) =>
                  p.id === postId ? { ...p, ...data } : p,
                ),
              })),
            };
          },
        );
      }
      setEditingPostId(null);
      qc.invalidateQueries({ queryKey: ['forum-posts', forumId] });
      qc.invalidateQueries({ queryKey: ['forum', slug] });
    },
    onError: (e: Error) => setError(e.message),
  });

  const handlePostNew = useCallback(() => {
    qc.invalidateQueries({ queryKey: ['forum-posts', forumId] });
    qc.invalidateQueries({ queryKey: ['forum', slug] });
  }, [qc, forumId, slug]);

  useForumSocket({
    forumId,
    enabled: !!forumId,
    handlers: { onPostNew: handlePostNew },
  });

  const startEditName = () => {
    if (!detail) return;
    setEditName(detail.forum.name);
    setEditingName(true);
  };

  const startEditDesc = () => {
    if (!detail) return;
    setEditDesc(detail.forum.description ?? '');
    setEditingDesc(true);
  };

  const startEditRules = () => {
    setRulesDraft(
      (detail?.rules ?? []).map((r: { title: string; body: string }) => ({
        title: r.title,
        body: r.body,
      })),
    );
    setEditingRules(true);
  };

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
      {error && (
        <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {error}
        </div>
      )}

      <header className="rounded-2xl border border-slate-100 bg-white shadow-sm overflow-hidden">
        {memberRole === 'owner' ? (
          <div className="relative">
            {forum.bannerUrl ? (
              <div className="relative aspect-[21/9] bg-slate-100">
                <img
                  src={forum.bannerUrl}
                  alt="Forum banner"
                  className="w-full h-full object-cover"
                />
                <input
                  ref={bannerInputRef}
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) uploadBanner.mutate(file);
                    e.target.value = '';
                  }}
                />
                <div className="absolute top-2 right-2 flex gap-1">
                  <button
                    type="button"
                    onClick={() => bannerInputRef.current?.click()}
                    disabled={uploadBanner.isPending}
                    className="rounded-md bg-white/90 px-2 py-1 text-xs font-medium text-slate-700 shadow hover:bg-white transition"
                  >
                    <Upload className="h-3 w-3 inline mr-1" />
                    Change
                  </button>
                  <button
                    type="button"
                    onClick={() => removeBanner.mutate()}
                    disabled={removeBanner.isPending}
                    className="rounded-md bg-white/90 px-2 py-1 text-xs font-medium text-red-600 shadow hover:bg-white transition"
                  >
                    <Trash2 className="h-3 w-3 inline mr-1" />
                    Remove
                  </button>
                </div>
              </div>
            ) : (
              <div className="relative h-20 bg-slate-50 flex items-center justify-center border-b border-slate-100">
                <input
                  ref={bannerInputRef}
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) uploadBanner.mutate(file);
                    e.target.value = '';
                  }}
                />
                <button
                  type="button"
                  onClick={() => bannerInputRef.current?.click()}
                  disabled={uploadBanner.isPending}
                  className="flex items-center gap-1.5 rounded-lg border border-dashed border-slate-300 px-3 py-1.5 text-xs text-slate-400 hover:border-slate-400 hover:text-slate-600 transition"
                >
                  <Image className="h-3.5 w-3.5" />
                  {uploadBanner.isPending ? 'Uploading...' : 'Add banner'}
                </button>
              </div>
            )}
          </div>
        ) : forum.bannerUrl ? (
          <div className="aspect-[21/9] bg-slate-100">
            <img
              src={forum.bannerUrl}
              alt="Forum banner"
              className="w-full h-full object-cover"
            />
          </div>
        ) : null}
        <div className="p-6">
          <div className="flex items-start justify-between gap-3">
            <div className="min-w-0 flex-1 space-y-2">
              <div className="flex items-center gap-2">
                {memberRole === 'owner' ? (
                  <div className="relative shrink-0">
                    {forum.iconUrl ? (
                      <div className="relative group">
                        <img
                          src={forum.iconUrl}
                          alt="Forum icon"
                          className="h-10 w-10 rounded-xl object-cover"
                        />
                        <input
                          ref={iconInputRef}
                          type="file"
                          accept="image/*"
                          className="hidden"
                          onChange={(e) => {
                            const file = e.target.files?.[0];
                            if (file) uploadIcon.mutate(file);
                            e.target.value = '';
                          }}
                        />
                        <div className="absolute inset-0 rounded-xl bg-black/40 opacity-0 group-hover:opacity-100 transition flex items-center justify-center gap-0.5">
                          <button
                            type="button"
                            onClick={() => iconInputRef.current?.click()}
                            disabled={uploadIcon.isPending}
                            className="text-white hover:text-indigo-200 transition"
                            title="Change icon"
                          >
                            <Upload className="h-3.5 w-3.5" />
                          </button>
                          <button
                            type="button"
                            onClick={() => removeIcon.mutate()}
                            disabled={removeIcon.isPending}
                            className="text-white hover:text-red-300 transition"
                            title="Remove icon"
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                          </button>
                        </div>
                      </div>
                    ) : (
                      <div className="relative">
                        <div className="h-10 w-10 rounded-xl bg-slate-100 flex items-center justify-center">
                          <Image className="h-5 w-5 text-slate-400" />
                        </div>
                        <input
                          ref={iconInputRef}
                          type="file"
                          accept="image/*"
                          className="hidden"
                          onChange={(e) => {
                            const file = e.target.files?.[0];
                            if (file) uploadIcon.mutate(file);
                            e.target.value = '';
                          }}
                        />
                        <button
                          type="button"
                          onClick={() => iconInputRef.current?.click()}
                          disabled={uploadIcon.isPending}
                          className="absolute inset-0 rounded-xl bg-black/30 opacity-0 hover:opacity-100 transition flex items-center justify-center"
                          title="Add icon"
                        >
                          <Upload className="h-3.5 w-3.5 text-white" />
                        </button>
                      </div>
                    )}
                  </div>
                ) : forum.iconUrl ? (
                  <img
                    src={forum.iconUrl}
                    alt="Forum icon"
                    className="h-10 w-10 rounded-xl object-cover shrink-0"
                  />
                ) : null}
                {editingName ? (
                  <div className="flex-1 flex items-center gap-2">
                    <Input
                      value={editName}
                      onChange={(e) => setEditName(e.target.value)}
                      placeholder="Forum name"
                      className="text-2xl font-bold"
                    />
                    <Button
                      size="sm"
                      onClick={() => saveEdit.mutate()}
                      isLoading={saveEdit.isPending}
                      disabled={!editName.trim()}
                    >
                      <Save className="h-3.5 w-3.5" />
                    </Button>
                    <Button
                      size="sm"
                      variant="secondary"
                      onClick={() => setEditingName(false)}
                    >
                      <X className="h-3.5 w-3.5" />
                    </Button>
                  </div>
                ) : (
                  <h1
                    className="text-2xl font-bold text-slate-900 truncate cursor-pointer hover:text-indigo-600 transition"
                    onDoubleClick={
                      memberRole === 'owner' ? startEditName : undefined
                    }
                    title={
                      memberRole === 'owner'
                        ? 'Double-click to edit'
                        : undefined
                    }
                  >
                    {forum.name}
                  </h1>
                )}
                {memberRole === 'owner' ? (
                  <div ref={visDropdownRef} className="relative shrink-0">
                    <button
                      type="button"
                      onClick={() => setShowVisDropdown(!showVisDropdown)}
                      className="inline-flex items-center gap-1 rounded-md bg-slate-100 px-2 py-0.5 text-[10px] text-slate-500 capitalize hover:bg-slate-200 transition"
                    >
                      {VISIBILITY_ICON[forum.visibility] ??
                        VISIBILITY_ICON.public}
                      {VISIBILITY_LABEL[forum.visibility] ?? forum.visibility}
                      <ChevronDown className="h-3 w-3" />
                    </button>
                    {showVisDropdown && (
                      <div className="absolute top-full left-0 mt-1 rounded-lg border border-slate-200 bg-white shadow-lg z-20 py-1 min-w-[120px]">
                        {(['public', 'private'] as const).map((v) => (
                          <button
                            key={v}
                            type="button"
                            onClick={() => changeVisibility.mutate(v)}
                            disabled={changeVisibility.isPending}
                            className={[
                              'w-full flex items-center gap-2 px-3 py-1.5 text-xs transition',
                              forum.visibility === v
                                ? 'bg-indigo-50 text-indigo-700'
                                : 'text-slate-600 hover:bg-slate-50',
                            ].join(' ')}
                          >
                            {VISIBILITY_ICON[v]}
                            {VISIBILITY_LABEL[v]}
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                ) : (
                  <span className="inline-flex items-center gap-1 rounded-md bg-slate-100 px-2 py-0.5 text-[10px] text-slate-500 capitalize shrink-0">
                    {VISIBILITY_ICON[forum.visibility] ??
                      VISIBILITY_ICON.public}
                    {VISIBILITY_LABEL[forum.visibility] ?? forum.visibility}
                  </span>
                )}
                {forum.isLocked && (
                  <span className="inline-flex items-center gap-1 rounded-md bg-slate-100 px-2 py-0.5 text-xs text-slate-500 shrink-0">
                    <Lock className="h-3.5 w-3.5" /> Locked
                  </span>
                )}
                {memberRole && (
                  <span
                    className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-medium uppercase shrink-0 ${ROLE_COLOR[memberRole] ?? 'bg-slate-100 text-slate-600'}`}
                  >
                    <Shield className="h-3 w-3" />
                    {ROLE_LABEL[memberRole] ?? memberRole}
                  </span>
                )}
              </div>

              {editingDesc ? (
                <div className="flex items-start gap-2">
                  <textarea
                    value={editDesc}
                    onChange={(e) => setEditDesc(e.target.value)}
                    rows={3}
                    className="flex-1 rounded-xl border border-slate-200 px-3 py-2 text-sm focus:outline-indigo-600"
                    placeholder="Description"
                  />
                  <div className="flex gap-1.5 pt-1">
                    <Button
                      size="sm"
                      onClick={() => saveEdit.mutate()}
                      isLoading={saveEdit.isPending}
                    >
                      <Save className="h-3.5 w-3.5" />
                    </Button>
                    <Button
                      size="sm"
                      variant="secondary"
                      onClick={() => setEditingDesc(false)}
                    >
                      <X className="h-3.5 w-3.5" />
                    </Button>
                  </div>
                </div>
              ) : (
                <p
                  className="text-sm text-slate-500 cursor-pointer hover:text-slate-700 transition"
                  onDoubleClick={
                    memberRole === 'owner' ? startEditDesc : undefined
                  }
                  title={
                    memberRole === 'owner' ? 'Double-click to edit' : undefined
                  }
                >
                  {forum.description ?? 'No description'}
                </p>
              )}
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
        </div>
      </header>

      <div className="flex items-center gap-3 flex-wrap">
        {tags.length > 0 && (
          <div className="flex items-center gap-2 flex-1 min-w-0 flex-wrap">
            <Filter className="h-4 w-4 text-slate-400 shrink-0" />
            <button
              type="button"
              onClick={() => setTagFilterId(undefined)}
              className={`rounded-full px-3 py-1 text-xs font-medium transition shrink-0 ${
                !tagFilterId
                  ? 'bg-indigo-600 text-white'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              All
            </button>
            {tags.map((t: ForumTag) => (
              <button
                key={t.id}
                type="button"
                onClick={() => setTagFilterId(t.id)}
                className={`rounded-full px-3 py-1 text-xs font-medium transition shrink-0 ${
                  tagFilterId === t.id
                    ? 'border-2 text-white'
                    : 'border-2 border-transparent text-slate-600 hover:bg-slate-200'
                }`}
                style={{
                  backgroundColor:
                    tagFilterId === t.id
                      ? (t.color ?? '#3b82f6')
                      : `${t.color ?? '#3b82f6'}15`,
                }}
              >
                {t.name}
              </button>
            ))}
          </div>
        )}
        <div className="relative w-full sm:w-56 lg:w-64">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search..."
            className="w-full rounded-xl border border-slate-200 bg-white pl-10 pr-4 py-2 text-sm text-slate-700 placeholder:text-slate-400 focus:outline-none focus:border-indigo-400 transition"
          />
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-[1fr_300px]">
        <section>
          {postsLoading ? (
            <div className="space-y-3">
              {[1, 2, 3].map((i) => (
                <div
                  key={i}
                  className="h-16 rounded-xl bg-slate-100 animate-pulse"
                />
              ))}
            </div>
          ) : !posts.length ? (
            <div className="rounded-2xl border-2 border-dashed border-slate-200 p-10 text-center">
              <BookOpen className="mx-auto h-8 w-8 text-slate-300" />
              <p className="mt-2 font-medium text-slate-500">No posts yet</p>
            </div>
          ) : (
            <div className="space-y-4">
              {posts.map((p) => (
                <article
                  key={p.id}
                  className="rounded-2xl border border-slate-100 bg-white shadow-sm"
                >
                  {editingPostId === p.id ? (
                    <div className="p-5 space-y-4">
                      <Input
                        value={editTitle}
                        onChange={(e) => setEditTitle(e.target.value)}
                        placeholder="Post title"
                        className="text-lg font-bold"
                      />
                      <TiptapEditor
                        ref={editorRef}
                        content={editContent ?? undefined}
                        onChange={(json) => setEditContent(json)}
                        placeholder="Edit your post..."
                      />
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
                                onClick={() => toggleEditTag(t.id)}
                                className={`rounded-full px-3 py-1 text-xs font-medium border transition ${
                                  editTagIds.has(t.id)
                                    ? 'text-white border-transparent'
                                    : 'text-slate-600 border-slate-200 hover:border-slate-300'
                                }`}
                                style={
                                  editTagIds.has(t.id)
                                    ? { backgroundColor: t.color ?? '#3b82f6' }
                                    : {
                                        backgroundColor: t.color
                                          ? `${t.color}15`
                                          : '#f8fafc',
                                      }
                                }
                              >
                                {t.name}
                              </button>
                            ))}
                          </div>
                        </div>
                      )}
                      <div className="flex gap-2">
                        <Button
                          onClick={() => updatePostMutation.mutate()}
                          isLoading={updatePostMutation.isPending}
                          disabled={!editTitle.trim()}
                          icon={<Save className="h-4 w-4" />}
                        >
                          Save
                        </Button>
                        <Button variant="secondary" onClick={cancelEditPost}>
                          <X className="h-4 w-4" /> Cancel
                        </Button>
                      </div>
                    </div>
                  ) : (
                    <>
                      <div className="p-5 pb-3">
                        <div className="flex items-start justify-between gap-3">
                          <div className="min-w-0 flex-1">
                            <div className="flex items-center gap-2 flex-wrap">
                              {p.isPinned && (
                                <span className="rounded bg-amber-50 px-1.5 py-0.5 text-[10px] font-semibold text-amber-700">
                                  PINNED
                                </span>
                              )}
                              <h3 className="text-lg font-semibold text-slate-900">
                                {p.title}
                              </h3>
                            </div>
                            <div className="mt-2 flex items-center gap-3 text-xs text-slate-400">
                              <span>{p.authorName}</span>
                              <span>
                                <Clock className="inline h-3 w-3 mr-0.5" />
                                {new Date(p.createdAt).toLocaleDateString()}
                              </span>
                            </div>
                          </div>
                          <span className="rounded-md bg-slate-100 px-2 py-0.5 text-[10px] text-slate-500 uppercase shrink-0">
                            {p.postType}
                          </span>
                        </div>

                        {p.tags.length > 0 && (
                          <div className="mt-2 flex flex-wrap gap-1">
                            {p.tags.map((t) => (
                              <span
                                key={t.id}
                                className="rounded-full px-2 py-0.5 text-[10px] font-medium"
                                style={{
                                  backgroundColor: t.color
                                    ? `${t.color}20`
                                    : '#f1f5f9',
                                  color: t.color ?? '#64748b',
                                }}
                              >
                                {t.name}
                              </span>
                            ))}
                          </div>
                        )}

                        {p.content && Object.keys(p.content).length > 0 && (
                          <div className="mt-3 text-sm text-slate-700">
                            <TiptapViewer content={p.content} />
                          </div>
                        )}
                      </div>

                      <div className="flex items-center gap-3 border-t border-slate-50 px-5 py-2.5">
                        <span className="inline-flex items-center gap-1.5 text-xs text-slate-400">
                          <MessageSquare className="h-3.5 w-3.5" />
                          {p.commentCount} comments
                        </span>
                        <PostLikeButton postId={p.id} forumId={forumId} />
                        {(memberRole === 'owner' ||
                          memberRole === 'moderator') && (
                          <>
                            <button
                              type="button"
                              onClick={() => startEditPost(p)}
                              className="inline-flex items-center gap-1 text-xs text-slate-400 hover:text-indigo-600 transition"
                            >
                              <Edit3 className="h-3.5 w-3.5" />
                            </button>
                            <button
                              type="button"
                              onClick={() => setDeletingPostId(p.id)}
                              className="ml-auto inline-flex items-center gap-1 text-xs text-slate-400 hover:text-red-600 transition"
                            >
                              <Trash2 className="h-3.5 w-3.5" />
                            </button>
                          </>
                        )}
                      </div>
                      <PostCommentBox postId={p.id} forumId={forumId} />
                    </>
                  )}
                </article>
              ))}
              {deletingPostId && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30">
                  <div className="rounded-2xl bg-white p-6 shadow-xl max-w-sm w-full mx-4 space-y-4">
                    <h3 className="text-lg font-semibold text-slate-900">
                      Delete Post
                    </h3>
                    <p className="text-sm text-slate-600">
                      Are you sure you want to delete this post? This action
                      cannot be undone.
                    </p>
                    <div className="flex justify-end gap-2">
                      <Button
                        variant="secondary"
                        onClick={() => setDeletingPostId(null)}
                        disabled={deletePostMutation.isPending}
                      >
                        Cancel
                      </Button>
                      <Button
                        onClick={() =>
                          deletePostMutation.mutate(deletingPostId)
                        }
                        isLoading={deletePostMutation.isPending}
                      >
                        <Trash2 className="h-4 w-4" />
                        Delete
                      </Button>
                    </div>
                  </div>
                </div>
              )}
              <div ref={loadMoreRef} className="flex justify-center py-4">
                {isFetchingNextPage ? (
                  <span className="text-xs text-slate-400">
                    Loading more...
                  </span>
                ) : hasNextPage ? (
                  <ChevronDown className="h-4 w-4 text-slate-300 animate-bounce" />
                ) : null}
              </div>
            </div>
          )}
        </section>

        <ForumSidebar
          memberCount={forum.memberCount}
          postCount={forum.postCount}
          rules={rules}
          isOwner={memberRole === 'owner'}
          isModerator={memberRole === 'moderator' || memberRole === 'owner'}
          isMember={!!memberRole}
          onEditRules={startEditRules}
          editingRules={editingRules}
          rulesDraft={rulesDraft}
          setRulesDraft={setRulesDraft}
          onSaveRules={() => saveRules.mutate()}
          saving={saveRules.isPending}
          onCancelRules={() => setEditingRules(false)}
          tags={tags}
          showTagManager={showTagManager}
          setShowTagManager={setShowTagManager}
          newTagName={newTagName}
          setNewTagName={setNewTagName}
          newTagColor={newTagColor}
          setNewTagColor={setNewTagColor}
          onCreateTag={() => createTagMutation.mutate()}
          creatingTag={createTagMutation.isPending}
          onDeleteTag={(id: number) => deleteTagMutation.mutate(id)}
        />
      </div>
    </div>
  );
}

function PostLikeButton({
  postId,
  forumId,
}: {
  postId: string;
  forumId: string;
}) {
  const qc = useQueryClient();
  const [open, setOpen] = useState(false);
  const react = useMutation({
    mutationFn: (emoji: string) =>
      togglePostReaction(forumId, postId, emoji, true),
    onSuccess: () => {
      setOpen(false);
      qc.invalidateQueries({ queryKey: ['forum-posts', forumId] });
    },
  });

  return (
    <div className="relative">
      <button
        type="button"
        onClick={() => setOpen(!open)}
        className="inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-medium text-slate-500 hover:text-indigo-600 hover:bg-indigo-50 transition"
      >
        <Heart className="h-3.5 w-3.5" />
        Like
      </button>
      {open && (
        <div className="absolute bottom-full left-0 mb-2 flex gap-1 rounded-2xl border border-slate-200 bg-white p-1.5 shadow-lg z-10">
          {ALLOWED_EMOJIS.map((emoji) => (
            <button
              key={emoji}
              type="button"
              onClick={() => react.mutate(emoji)}
              disabled={react.isPending}
              className="h-9 w-9 flex items-center justify-center rounded-full text-lg transition-all hover:scale-125 hover:bg-slate-100 active:scale-95"
            >
              {emoji}
            </button>
          ))}
          <button
            type="button"
            onClick={() => setOpen(false)}
            className="h-9 w-9 flex items-center justify-center rounded-full text-xs text-slate-400 hover:bg-slate-100"
          >
            <X className="h-3.5 w-3.5" />
          </button>
        </div>
      )}
    </div>
  );
}

function PostCommentBox({
  postId,
  forumId,
}: {
  postId: string;
  forumId: string;
}) {
  const qc = useQueryClient();
  const [text, setText] = useState('');
  const [commentError, setCommentError] = useState<string | null>(null);
  const addComment = useMutation({
    mutationFn: () => createComment(forumId, postId, text, undefined),
    onSuccess: () => {
      setText('');
      setCommentError(null);
      qc.invalidateQueries({ queryKey: ['forum-posts', forumId] });
    },
    onError: (e: Error) => setCommentError(e.message),
  });
  return (
    <div className="border-t border-slate-50 px-5 py-3">
      {commentError && (
        <p className="mb-2 text-xs text-red-500">{commentError}</p>
      )}
      <div className="flex items-start gap-2.5">
        <div className="h-7 w-7 shrink-0 rounded-full bg-indigo-100 flex items-center justify-center">
          <MessageSquare className="h-3.5 w-3.5 text-indigo-500" />
        </div>
        <div className="flex-1 flex items-center gap-2">
          <input
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder="Write a quick comment..."
            className="flex-1 rounded-xl border border-slate-200 bg-slate-50 px-3 py-1.5 text-xs text-slate-700 placeholder:text-slate-400 focus:outline-none focus:border-indigo-400 focus:bg-white transition"
            onKeyDown={(e) => {
              if (e.key === 'Enter' && text.trim()) addComment.mutate();
            }}
          />
          <button
            type="button"
            onClick={() => addComment.mutate()}
            disabled={!text.trim() || addComment.isPending}
            className="shrink-0 rounded-xl bg-indigo-600 px-3 py-1.5 text-xs font-medium text-white transition hover:bg-indigo-700 disabled:opacity-40"
          >
            {addComment.isPending ? '...' : 'Send'}
          </button>
        </div>
      </div>
    </div>
  );
}

function ForumSidebar({
  memberCount,
  postCount,
  rules,
  isOwner,
  isModerator,
  isMember,
  onEditRules,
  editingRules,
  rulesDraft,
  setRulesDraft,
  onSaveRules,
  saving,
  onCancelRules,
  tags,
  showTagManager,
  setShowTagManager,
  newTagName,
  setNewTagName,
  newTagColor,
  setNewTagColor,
  onCreateTag,
  creatingTag,
  onDeleteTag,
}: {
  memberCount: number;
  postCount: number;
  rules: ForumRule[];
  isOwner: boolean;
  isModerator: boolean;
  isMember: boolean;
  onEditRules: () => void;
  editingRules: boolean;
  rulesDraft: Array<{ title: string; body: string }>;
  setRulesDraft: (r: Array<{ title: string; body: string }>) => void;
  onSaveRules: () => void;
  saving: boolean;
  onCancelRules: () => void;
  tags: ForumTag[];
  showTagManager: boolean;
  setShowTagManager: (v: boolean) => void;
  newTagName: string;
  setNewTagName: (v: string) => void;
  newTagColor: string;
  setNewTagColor: (v: string) => void;
  onCreateTag: () => void;
  creatingTag: boolean;
  onDeleteTag: (id: number) => void;
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

      {isMember && (
        <div className="rounded-2xl border border-slate-100 bg-white p-4 shadow-sm">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-semibold text-slate-900">Tags</h3>
            <button
              type="button"
              onClick={() => setShowTagManager(!showTagManager)}
              className="text-xs text-indigo-600 hover:text-indigo-700"
            >
              {showTagManager ? 'Close' : 'Manage'}
            </button>
          </div>
          {tags.length === 0 && !showTagManager ? (
            <p className="mt-2 text-xs text-slate-400">No tags yet.</p>
          ) : (
            <div className="mt-2 flex flex-wrap gap-1">
              {tags.map((t: ForumTag) => (
                <span
                  key={t.id}
                  className="inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-medium"
                  style={{
                    backgroundColor: t.color ? `${t.color}20` : '#f1f5f9',
                    color: t.color ?? '#64748b',
                  }}
                >
                  {t.name}
                </span>
              ))}
            </div>
          )}
          {showTagManager && (
            <div className="mt-3 space-y-2 border-t border-slate-50 pt-3">
              <div className="flex gap-2">
                <input
                  value={newTagName}
                  onChange={(e) => setNewTagName(e.target.value)}
                  placeholder="Tag name"
                  className="flex-1 rounded-lg border border-slate-200 px-2 py-1 text-xs focus:outline-indigo-600"
                />
                <input
                  type="color"
                  value={newTagColor}
                  onChange={(e) => setNewTagColor(e.target.value)}
                  className="h-7 w-7 cursor-pointer rounded border border-slate-200"
                />
                <Button
                  size="sm"
                  onClick={onCreateTag}
                  isLoading={creatingTag}
                  disabled={!newTagName.trim()}
                >
                  Add
                </Button>
              </div>
              {tags.length > 0 && (
                <div className="space-y-1 max-h-32 overflow-y-auto">
                  {tags.map((t: ForumTag) => (
                    <div
                      key={t.id}
                      className="flex items-center justify-between rounded-lg bg-slate-50 px-2 py-1"
                    >
                      <div className="flex items-center gap-1.5">
                        <span
                          className="h-2.5 w-2.5 rounded-full"
                          style={{ backgroundColor: t.color ?? '#64748b' }}
                        />
                        <span className="text-xs text-slate-700">{t.name}</span>
                      </div>
                      <button
                        type="button"
                        onClick={() => onDeleteTag(t.id)}
                        className="text-slate-300 hover:text-red-500 transition"
                      >
                        <Trash2 className="h-3 w-3" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      )}
      <div className="rounded-2xl border border-slate-100 bg-white p-4 shadow-sm">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-semibold text-slate-900">Rules</h3>
          {isOwner && !editingRules && (
            <button
              type="button"
              onClick={onEditRules}
              className="text-xs text-indigo-600 hover:text-indigo-700"
            >
              Edit
            </button>
          )}
        </div>

        {editingRules ? (
          <div className="mt-2 space-y-3">
            {rulesDraft.map((r, i) => (
              <div key={i} className="space-y-1">
                <Input
                  value={r.title}
                  onChange={(e) => {
                    const next = [...rulesDraft];
                    next[i] = { ...next[i], title: e.target.value };
                    setRulesDraft(next);
                  }}
                  placeholder="Rule title"
                />
                <textarea
                  value={r.body}
                  onChange={(e) => {
                    const next = [...rulesDraft];
                    next[i] = { ...next[i], body: e.target.value };
                    setRulesDraft(next);
                  }}
                  rows={2}
                  className="w-full rounded-lg border border-slate-200 px-2 py-1 text-xs focus:outline-indigo-600"
                  placeholder="Rule description"
                />
                <button
                  type="button"
                  onClick={() => {
                    setRulesDraft(rulesDraft.filter((_, j) => j !== i));
                  }}
                  className="text-[10px] text-red-500 hover:text-red-700"
                >
                  Remove
                </button>
              </div>
            ))}
            <button
              type="button"
              onClick={() =>
                setRulesDraft([...rulesDraft, { title: '', body: '' }])
              }
              className="text-xs text-indigo-600 hover:text-indigo-700"
            >
              + Add rule
            </button>
            <div className="flex gap-2 pt-1">
              <Button
                size="md"
                className="flex-1"
                onClick={onSaveRules}
                isLoading={saving}
              >
                <Save className="h-3.5 w-full mr-1" /> Save
              </Button>
              <Button
                size="md"
                variant="secondary"
                className="flex-1"
                onClick={onCancelRules}
              >
                <X className="h-3.5 w-full mr-1" /> Cancel
              </Button>
            </div>
          </div>
        ) : !rules.length ? (
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
