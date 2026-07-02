'use client';

import { useState, useCallback, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import {
  keepPreviousData,
  useInfiniteQuery,
  useQuery,
  useQueryClient,
} from '@tanstack/react-query';
import { use } from 'react';
import { BookOpen, ChevronDown, Filter, Search } from 'lucide-react';
import type { TiptapEditorHandle } from '../../../../components/ui/tiptap-editor';
import { useCurrentUser } from '../../../../components/hooks/use-current-user';
import { useForumSocket } from '../../../../components/hooks/use-forum-socket';
import {
  getForumDetail,
  listForumPosts,
  listTags,
} from '../../../actions/forum.actions';
import { useForumMutations } from './hooks/use-forum-mutations';
import { ForumBanner } from './components/forum-banner';
import { ForumHeader } from './components/forum-header';
import { ForumSidebar } from './components/forum-sidebar';
import { ForumInvitePanel } from './components/forum-invite-panel';
import { PostCard } from './components/post-card';
import { PostEditForm } from './components/post-edit-form';
import { DeletePostModal } from './components/delete-post-modal';

const POSTS_PER_PAGE = 10;

interface ForumDetailPageProps {
  params: Promise<{ slug: string }>;
}

export default function ForumDetailPage({ params }: ForumDetailPageProps) {
  const { slug } = use(params);
  const qc = useQueryClient();
  const [error, setError] = useState<string | null>(null);
  const [editingName, setEditingName] = useState(false);
  const [editingDesc, setEditingDesc] = useState(false);
  const [editName, setEditName] = useState('');
  const [editDesc, setEditDesc] = useState('');
  const [editingRules, setEditingRules] = useState(false);
  const [rulesDraft, setRulesDraft] = useState<
    Array<{ title: string; body: string }>
  >([]);
  const [showVisDropdown, setShowVisDropdown] = useState(false);
  const visDropdownRef = useRef<HTMLDivElement>(null);
  const [tagFilterId, setTagFilterId] = useState<number | undefined>(undefined);
  const [showTagManager, setShowTagManager] = useState(false);
  const [newTagName, setNewTagName] = useState('');
  const [newTagColor, setNewTagColor] = useState('#3b82f6');
  const [searchQuery, setSearchQuery] = useState('');
  const [deletingPostId, setDeletingPostId] = useState<string | null>(null);
  const [editingPostId, setEditingPostId] = useState<string | null>(null);
  const [editTitle, setEditTitle] = useState('');
  const [editContent, setEditContent] = useState<Record<
    string,
    unknown
  > | null>(null);
  const [editTagIds, setEditTagIds] = useState<Set<number>>(new Set());
  const editorRef = useRef<TiptapEditorHandle>(null);
  const loadMoreRef = useRef<HTMLDivElement>(null);
  const iconInputRef = useRef<HTMLInputElement>(null);
  const router = useRouter();
  const { user: currentUser } = useCurrentUser();

  const {
    data: detail,
    isLoading: detailLoading,
    isError: detailIsError,
    error: detailError,
  } = useQuery({
    queryKey: ['forum', slug],
    queryFn: () => getForumDetail(slug),
    retry: false,
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
    placeholderData: keepPreviousData,
    enabled: !!forumId,
  });

  const { data: tags = [] } = useQuery({
    queryKey: ['forum-tags'],
    queryFn: () => listTags(),
    enabled: !!forumId,
  });

  const posts = postsData?.pages.flatMap((p) => p.data) ?? [];

  const mutations = useForumMutations({
    forumId,
    slug,
    tagFilterId,
    searchQuery,
    editorRef,
    onError: setError,
  });

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
    if (!showVisDropdown) return;
    const handler = (e: MouseEvent) => {
      if (
        visDropdownRef.current &&
        !visDropdownRef.current.contains(e.target as Node)
      ) {
        setShowVisDropdown(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [showVisDropdown]);

  const handlePostNew = useCallback(() => {
    qc.invalidateQueries({ queryKey: ['forum-posts', forumId] });
    qc.invalidateQueries({ queryKey: ['forum', slug] });
  }, [qc, forumId, slug]);

  const handleCommentNew = useCallback(() => {
    qc.invalidateQueries({ queryKey: ['forum-comments', forumId] });
    qc.invalidateQueries({ queryKey: ['forum-posts', forumId] });
  }, [qc, forumId]);

  const handleCommentDeleted = useCallback(() => {
    qc.invalidateQueries({ queryKey: ['forum-comments', forumId] });
    qc.invalidateQueries({ queryKey: ['forum-posts', forumId] });
  }, [qc, forumId]);

  const handleReactionUpdate = useCallback(() => {
    qc.invalidateQueries({ queryKey: ['forum-post-reactions', forumId] });
    qc.invalidateQueries({ queryKey: ['forum-comment-reactions', forumId] });
    qc.invalidateQueries({ queryKey: ['forum-posts', forumId] });
  }, [qc, forumId]);

  const handlePostVisibilityChange = useCallback(() => {
    qc.invalidateQueries({ queryKey: ['forum-posts', forumId] });
    qc.invalidateQueries({ queryKey: ['forum', slug] });
  }, [qc, forumId, slug]);

  useForumSocket({
    forumId,
    enabled: !!forumId,
    handlers: {
      onPostNew: handlePostNew,
      onCommentNew: handleCommentNew,
      onCommentDeleted: handleCommentDeleted,
      onReactionUpdate: handleReactionUpdate,
      onPostHidden: handlePostVisibilityChange,
      onPostRestored: handlePostVisibilityChange,
    },
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

  const postArticleRefs = useRef<Map<string, HTMLElement>>(new Map());
  const startEditPost = (p: (typeof posts)[number]) => {
    setEditingPostId(p.id);
    setEditTitle(p.title);
    setEditContent(p.content);
    setEditTagIds(new Set((p.tags ?? []).map((t) => t.id)));
    setError(null);
  };

  useEffect(() => {
    if (!editingPostId) return;
    const el = postArticleRefs.current.get(editingPostId);
    el?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }, [editingPostId]);
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

  const handleSaveEdit = () => {
    mutations.saveEdit.mutate({
      name: editName,
      description: editDesc || undefined,
    });
    setEditingName(false);
    setEditingDesc(false);
  };

  const handleSavePost = () => {
    if (!editingPostId) return;
    mutations.updatePostMutation.mutate(
      {
        postId: editingPostId,
        title: editTitle,
        tagIds: Array.from(editTagIds),
      },
      {
        onSuccess: () => setEditingPostId(null),
      },
    );
  };

  const handleDeleteForum = () => {
    if (
      !window.confirm(
        'Are you sure you want to delete this forum? This action cannot be undone.',
      )
    )
      return;
    mutations.deleteForumMutation.mutate(undefined, {
      onSuccess: () => router.push('/'),
      onError: (e: Error) => setError(e.message),
    });
  };

  if (detailLoading) {
    return (
      <div className="space-y-4">
        <div className="h-24 rounded-2xl bg-slate-100 animate-pulse" />
        <div className="h-10 rounded-xl bg-slate-100 animate-pulse" />
      </div>
    );
  }

  if (detailIsError || !detail) {
    return (
      <div className="rounded-2xl border-2 border-red-200 bg-red-50 p-8 text-center">
        <BookOpen className="mx-auto h-10 w-10 text-red-400 mb-3" />
        <p className="font-semibold text-red-700 mb-1">
          {detailIsError
            ? detailError instanceof Error
              ? detailError.message
              : 'Failed to load forum'
            : 'Forum not found'}
        </p>
        {detailIsError && (
          <p className="text-sm text-red-500 mb-2">
            The forum may be private or the server is unreachable.
          </p>
        )}
      </div>
    );
  }

  const { forum, memberRole: role, rules } = detail;
  const memberRole = role ?? undefined;

  const isPrivateNonMember = forum.visibility === 'private' && !memberRole;
  const isJoining = mutations.join.isPending;

  if (isPrivateNonMember) {
    return (
      <div className="max-w-2xl mx-auto mt-20">
        <div className="rounded-2xl border border-amber-200 bg-white shadow-sm overflow-hidden">
          <div className="relative h-32 bg-gradient-to-br from-amber-50 to-orange-50 flex items-center justify-center">
            {forum.bannerUrl ? (
              <img
                src={forum.bannerUrl}
                alt={forum.name}
                className="w-full h-full object-cover"
              />
            ) : (
              <BookOpen className="h-12 w-12 text-amber-300" />
            )}
          </div>
          <div className="p-8 text-center">
            {forum.iconUrl && (
              <img
                src={forum.iconUrl}
                alt=""
                className="mx-auto -mt-14 h-16 w-16 rounded-2xl border-4 border-white shadow object-cover"
              />
            )}
            <h2 className="mt-4 text-2xl font-bold text-slate-900">
              {forum.name}
            </h2>
            <span className="inline-block mt-1 rounded-full bg-amber-50 px-3 py-1 text-xs font-medium text-amber-700">
              Private Forum
            </span>
            {forum.description && (
              <p className="mt-4 text-slate-600 text-sm max-w-md mx-auto">
                {forum.description}
              </p>
            )}
            <div className="mt-2 flex items-center justify-center gap-4 text-xs text-slate-400">
              <span>{forum.memberCount} members</span>
              <span>{forum.postCount} posts</span>
            </div>
            <div className="mt-8 rounded-xl border border-amber-100 bg-amber-50 p-5">
              <p className="text-sm font-medium text-amber-800 mb-4">
                This forum is private. You need to be a member to view and
                participate in discussions.
              </p>
              <button
                type="button"
                onClick={() => {
                  mutations.join.mutate();
                  qc.invalidateQueries({ queryKey: ['forum', slug] });
                }}
                disabled={isJoining}
                className="inline-flex items-center gap-2 rounded-xl bg-amber-600 px-6 py-2.5 text-sm font-semibold text-white hover:bg-amber-700 transition disabled:opacity-60"
              >
                {isJoining ? 'Requesting...' : 'Request to Join'}
              </button>
            </div>
          </div>
        </div>
        {error && (
          <div className="mt-4 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700 text-center">
            {error}
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {error && (
        <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {error}
        </div>
      )}

      <header className="rounded-2xl border border-slate-100 bg-white shadow-sm overflow-hidden">
        <ForumBanner
          bannerUrl={forum.bannerUrl ?? undefined}
          isOwner={memberRole === 'owner'}
          isUploading={mutations.uploadBanner.isPending}
          isRemoving={mutations.removeBanner.isPending}
          onUpload={(file) => mutations.uploadBanner.mutate(file)}
          onRemove={() => mutations.removeBanner.mutate()}
        />
        <ForumHeader
          forum={forum}
          memberRole={memberRole}
          slug={slug}
          editingName={editingName}
          editName={editName}
          onEditNameChange={setEditName}
          onStartEditName={startEditName}
          onCancelEditName={() => setEditingName(false)}
          editingDesc={editingDesc}
          editDesc={editDesc}
          onEditDescChange={setEditDesc}
          onStartEditDesc={startEditDesc}
          onCancelEditDesc={() => setEditingDesc(false)}
          isSaving={mutations.saveEdit.isPending}
          onSave={handleSaveEdit}
          iconInputRef={iconInputRef}
          isUploadingIcon={mutations.uploadIcon.isPending}
          onUploadIcon={(file) => mutations.uploadIcon.mutate(file)}
          isRemovingIcon={mutations.removeIcon.isPending}
          onRemoveIcon={() => mutations.removeIcon.mutate()}
          showVisDropdown={showVisDropdown}
          visDropdownRef={visDropdownRef}
          onToggleVisDropdown={() => setShowVisDropdown(!showVisDropdown)}
          onChangeVisibility={(vis) => {
            mutations.changeVisibility.mutate(vis);
            setShowVisDropdown(false);
          }}
          isChangingVis={mutations.changeVisibility.isPending}
          isJoining={mutations.join.isPending}
          isLeaving={mutations.leave.isPending}
          onJoin={() => mutations.join.mutate()}
          onLeave={() => mutations.leave.mutate()}
          isDeletingForum={mutations.deleteForumMutation.isPending}
          onDeleteForum={handleDeleteForum}
        />
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
            {tags.map((t: any) => (
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
        <div className="relative w-full md:w-[300px]">
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
          {postsLoading && !posts.length ? (
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
                  ref={(el) => {
                    if (el) postArticleRefs.current.set(p.id, el);
                    else postArticleRefs.current.delete(p.id);
                  }}
                  className="rounded-2xl border border-slate-100 bg-white shadow-sm"
                >
                  {editingPostId === p.id ? (
                    <PostEditForm
                      title={editTitle}
                      onTitleChange={setEditTitle}
                      content={editContent}
                      onContentChange={(json) => setEditContent(json)}
                      editorRef={editorRef}
                      tags={tags}
                      selectedTagIds={editTagIds}
                      onToggleTag={toggleEditTag}
                      isSaving={mutations.updatePostMutation.isPending}
                      onSave={handleSavePost}
                      onCancel={cancelEditPost}
                      forumId={forumId}
                    />
                  ) : (
                    <PostCard
                      post={p}
                      forumId={forumId}
                      memberRole={memberRole}
                      currentUserId={currentUser?.id}
                      onStartEdit={startEditPost}
                      onDelete={setDeletingPostId}
                    />
                  )}
                </article>
              ))}
              {deletingPostId && (
                <DeletePostModal
                  postId={deletingPostId}
                  isDeleting={mutations.deletePostMutation.isPending}
                  onCancel={() => setDeletingPostId(null)}
                  onDelete={(pid) =>
                    mutations.deletePostMutation.mutate(pid, {
                      onSuccess: () => setDeletingPostId(null),
                    })
                  }
                />
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

        <div className="space-y-4">
          <ForumSidebar
            memberCount={forum.memberCount}
            postCount={forum.postCount}
            rules={rules}
            isOwner={memberRole === 'owner'}
            isMember={!!memberRole}
            onEditRules={startEditRules}
            editingRules={editingRules}
            rulesDraft={rulesDraft}
            setRulesDraft={setRulesDraft}
            onSaveRules={() =>
              mutations.saveRules.mutate(rulesDraft, {
                onSuccess: () => setEditingRules(false),
              })
            }
            saving={mutations.saveRules.isPending}
            onCancelRules={() => setEditingRules(false)}
            tags={tags}
            showTagManager={showTagManager}
            setShowTagManager={setShowTagManager}
            newTagName={newTagName}
            setNewTagName={setNewTagName}
            newTagColor={newTagColor}
            setNewTagColor={setNewTagColor}
            onCreateTag={() =>
              mutations.createTagMutation.mutate({
                name: newTagName,
                color: newTagColor,
              })
            }
            creatingTag={mutations.createTagMutation.isPending}
            onDeleteTag={(id: number) => mutations.deleteTagMutation.mutate(id)}
          />
          {memberRole && (
            <div className="rounded-2xl border border-slate-100 bg-white p-4 shadow-sm">
              <ForumInvitePanel forumId={forumId} />
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
