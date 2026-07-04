'use client';

import { useState, useEffect, useRef } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  AlertTriangle,
  CheckCircle,
  XCircle,
  EyeOff,
  Eye,
  ChevronDown,
  ChevronUp,
  ExternalLink,
  X,
} from 'lucide-react';
import type { AdminReportDetail } from '@learning-hub/domain';
import { TiptapViewer } from '../../components/ui/tiptap-viewer';
import {
  getAdminReports,
  adminResolveReport,
  adminDismissReport,
  adminHidePost,
  adminRestorePost,
  getPostDetail,
} from '../actions/forum-moderation.actions';
import { getAxiosMessage } from '../../lib/admin-api';
import { getSocketToken } from '../actions/auth.actions';

const LEARNINGHUB_URL =
  process.env.NEXT_PUBLIC_LEARNINGHUB_URL ?? 'http://localhost:3002';

const REASON_LABELS: Record<string, string> = {
  SPAM: 'Spam',
  INAPPROPRIATE_CONTENT: 'Nội dung không phù hợp',
  HARASSMENT: 'Quấy rối',
  COPYRIGHT: 'Vi phạm bản quyền',
  MISLEADING: 'Thông tin sai lệch',
  OTHER: 'Khác',
};

function PostDetailModal({
  forumId,
  postId,
  onClose,
}: {
  forumId: string;
  postId: string;
  onClose: () => void;
}) {
  const {
    data: post,
    isLoading,
    error,
  } = useQuery({
    queryKey: ['admin-post-detail', forumId, postId],
    queryFn: () => getPostDetail(forumId, postId),
    staleTime: 30000,
  });

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center pt-10 bg-black/40 overflow-y-auto">
      <div className="bg-white rounded-2xl shadow-xl max-w-2xl w-full mx-4 mb-10">
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100">
          <h3 className="text-lg font-bold text-slate-900">
            Chi tiết bài viết
          </h3>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition"
          >
            <X className="h-5 w-5" />
          </button>
        </div>
        <div className="px-6 py-4">
          {isLoading ? (
            <p className="text-sm text-slate-400">Đang tải...</p>
          ) : error ? (
            <p className="text-sm text-red-600">Lỗi tải bài viết</p>
          ) : post ? (
            <div className="space-y-4">
              <div>
                <h2 className="text-xl font-semibold text-slate-900">
                  {post.title}
                </h2>
                <div className="mt-2 flex items-center gap-3 text-xs text-slate-400">
                  <span>{post.author?.fullName ?? 'Ẩn danh'}</span>
                  <span>
                    {new Date(post.createdAt).toLocaleDateString('vi-VN')}
                  </span>
                  <span className="rounded-full bg-slate-100 px-2 py-0.5 text-[10px] font-medium text-slate-600">
                    {post.status === 'hidden'
                      ? 'Đã ẩn'
                      : post.status === 'published'
                        ? 'Đã đăng'
                        : post.status}
                  </span>
                </div>
              </div>
              {post.tags?.length ? (
                <div className="flex flex-wrap gap-1">
                  {post.tags.map((t) => (
                    <span
                      key={t.id}
                      className="rounded-full px-2 py-0.5 text-[10px] font-medium bg-slate-100 text-slate-700"
                    >
                      {t.name}
                    </span>
                  ))}
                </div>
              ) : null}
              {post.content ? (
                <div className="border-t border-slate-100 pt-4">
                  <TiptapViewer content={post.content} />
                </div>
              ) : (
                <p className="text-sm text-slate-400 italic">
                  Bài viết không có nội dung.
                </p>
              )}
              <div className="border-t border-slate-100 pt-3 flex gap-4 text-xs text-slate-400">
                <span>{post.commentCount} bình luận</span>
                <span>{post.reactionCount} lượt thích</span>
                <span>{post.viewCount} lượt xem</span>
              </div>
            </div>
          ) : null}
        </div>
      </div>
    </div>
  );
}

export function ForumModerationTab() {
  const qc = useQueryClient();
  const [err, setErr] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('pending');
  const [expandedGroups, setExpandedGroups] = useState<Set<string>>(new Set());
  const [viewingPost, setViewingPost] = useState<{
    forumId: string;
    postId: string;
  } | null>(null);

  const { data: reportsData, isLoading } = useQuery({
    queryKey: ['admin-reports', statusFilter],
    queryFn: () => getAdminReports({ status: statusFilter, limit: 50 }),
  });

  const resolveMut = useMutation({
    mutationFn: ({ reportId, note }: { reportId: string; note: string }) =>
      adminResolveReport(reportId, note),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['admin-reports'] });
      setErr('');
    },
    onError: (e: unknown) =>
      setErr(getAxiosMessage(e, 'Giải quyết báo cáo thất bại')),
  });

  const dismissMut = useMutation({
    mutationFn: (reportId: string) => adminDismissReport(reportId),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['admin-reports'] });
      setErr('');
    },
    onError: (e: unknown) =>
      setErr(getAxiosMessage(e, 'Bỏ qua báo cáo thất bại')),
  });

  const hideMut = useMutation({
    mutationFn: (postId: string) => adminHidePost(postId, 'OTHER'),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['admin-reports'] });
      setErr('');
    },
    onError: (e: unknown) => setErr(getAxiosMessage(e, 'Ẩn bài viết thất bại')),
  });

  const restoreMut = useMutation({
    mutationFn: (postId: string) => adminRestorePost(postId),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['admin-reports'] });
      setErr('');
    },
    onError: (e: unknown) =>
      setErr(getAxiosMessage(e, 'Khôi phục bài viết thất bại')),
  });

  const socketRef = useRef<ReturnType<
    typeof import('socket.io-client').io
  > | null>(null);

  useEffect(() => {
    let cancelled = false;
    const connect = async () => {
      const token = await getSocketToken();
      if (cancelled) return;
      const { io } = await import('socket.io-client');
      const socketUrl = (
        process.env.NEXT_PUBLIC_NEST_API_URL ?? 'http://localhost:8080'
      ).replace(/\/api\/?$/, '');
      const socket = io(`${socketUrl}/forum`, {
        auth: { token },
        transports: ['websocket'],
        autoConnect: false,
      });
      if (cancelled) {
        return;
      }
      socketRef.current = socket;

      socket.on('connect', () => {
        socket.emit('join:admin');
      });

      socket.on('report:new', () => {
        qc.invalidateQueries({ queryKey: ['admin-reports'] });
      });

      socket.connect();
    };

    connect();
    return () => {
      cancelled = true;
      socketRef.current?.disconnect();
      socketRef.current = null;
    };
  }, [qc]);

  const reports = reportsData?.data ?? [];
  const pendingCount = reports.filter((r) => r.status === 'pending').length;

  const groups = new Map<
    string,
    { post: AdminReportDetail; reports: AdminReportDetail[] }
  >();
  for (const r of reports) {
    const key = r.targetId;
    if (!groups.has(key)) {
      groups.set(key, { post: r, reports: [] });
    }
    groups.get(key)!.reports.push(r);
  }

  const toggleGroup = (key: string) => {
    setExpandedGroups((prev) => {
      const next = new Set(prev);
      if (next.has(key)) {
        next.delete(key);
      } else {
        next.add(key);
      }
      return next;
    });
  };

  return (
    <div className="space-y-6">
      {err && (
        <div className="flex items-start justify-between rounded-xl bg-red-50 border border-red-100 px-4 py-3">
          <p className="text-sm text-red-700">{err}</p>
          <button
            onClick={() => setErr('')}
            className="text-red-500 hover:text-red-700 text-sm shrink-0 ml-2"
          >
            ✕
          </button>
        </div>
      )}

      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <AlertTriangle className="h-5 w-5 text-amber-500" />
            <h3 className="text-lg font-bold text-slate-900">Tất cả báo cáo</h3>
            {pendingCount > 0 && (
              <span className="rounded-full bg-red-100 px-2.5 py-0.5 text-xs font-bold text-red-700">
                {pendingCount} pending
              </span>
            )}
          </div>
          <div className="flex gap-1">
            {['pending', 'resolved', 'dismissed'].map((s) => (
              <button
                key={s}
                type="button"
                onClick={() => setStatusFilter(s)}
                className={`rounded-lg px-3 py-1.5 text-xs font-bold transition ${
                  statusFilter === s
                    ? 'bg-indigo-600 text-white'
                    : 'bg-slate-100 text-slate-500 hover:bg-slate-200'
                }`}
              >
                {s === 'pending'
                  ? 'Chờ xử lý'
                  : s === 'resolved'
                    ? 'Đã xử lý'
                    : 'Bỏ qua'}
              </button>
            ))}
          </div>
        </div>

        {isLoading ? (
          <div className="px-6 py-12 text-center text-slate-400 text-sm">
            Đang tải...
          </div>
        ) : groups.size === 0 ? (
          <div className="px-6 py-12 text-center text-slate-400 text-sm">
            Không có báo cáo nào.
          </div>
        ) : (
          <div className="divide-y divide-slate-100">
            {Array.from(groups.entries()).map(
              ([key, { post, reports: groupReports }]) => (
                <ReportGroupCard
                  key={key}
                  post={post}
                  reports={groupReports}
                  isExpanded={expandedGroups.has(key)}
                  onToggleExpand={() => toggleGroup(key)}
                  onResolve={resolveMut.mutate}
                  isResolving={resolveMut.isPending}
                  onDismiss={(reportId) => dismissMut.mutate(reportId)}
                  isDismissing={dismissMut.isPending}
                  onHidePost={() => hideMut.mutate(key)}
                  isHiding={hideMut.isPending}
                  onRestorePost={() => restoreMut.mutate(key)}
                  isRestoring={restoreMut.isPending}
                  onViewPost={() =>
                    setViewingPost({ forumId: post.forumId ?? '', postId: key })
                  }
                />
              ),
            )}
          </div>
        )}
      </div>
      {viewingPost && (
        <PostDetailModal
          forumId={viewingPost.forumId}
          postId={viewingPost.postId}
          onClose={() => setViewingPost(null)}
        />
      )}
    </div>
  );
}

function ReportGroupCard({
  post,
  reports,
  isExpanded,
  onToggleExpand,
  onResolve,
  isResolving,
  onDismiss,
  isDismissing,
  onHidePost,
  isHiding,
  onRestorePost,
  isRestoring,
  onViewPost,
}: {
  post: AdminReportDetail;
  reports: AdminReportDetail[];
  isExpanded: boolean;
  onToggleExpand: () => void;
  onResolve: (params: { reportId: string; note: string }) => void;
  isResolving: boolean;
  onDismiss: (reportId: string) => void;
  isDismissing: boolean;
  onHidePost: () => void;
  isHiding: boolean;
  onRestorePost: () => void;
  isRestoring: boolean;
  onViewPost: () => void;
}) {
  const isPostHidden = post.postStatus === 'hidden';
  const pendingCount = reports.filter((r) => r.status === 'pending').length;
  const isPost = post.targetType === 'post';

  return (
    <div className="hover:bg-slate-50 transition">
      <div className="px-6 py-4">
        <div className="flex items-start justify-between gap-4">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 flex-wrap mb-2">
              <button
                type="button"
                onClick={onToggleExpand}
                className="flex items-center gap-1.5 text-left"
              >
                {isExpanded ? (
                  <ChevronUp className="h-4 w-4 text-slate-400 shrink-0" />
                ) : (
                  <ChevronDown className="h-4 w-4 text-slate-400 shrink-0" />
                )}
                <span className="text-sm font-semibold text-slate-900">
                  {isPost && post.postTitle
                    ? post.postTitle
                    : `${post.targetType === 'post' ? 'Bài viết' : post.targetType === 'comment' ? 'Bình luận' : 'Forum'} ${post.targetId.slice(0, 8)}…`}
                </span>
              </button>
              <span className="text-xs text-slate-500 bg-slate-100 rounded-lg px-2 py-0.5">
                {post.targetType === 'post'
                  ? 'Bài viết'
                  : post.targetType === 'comment'
                    ? 'Bình luận'
                    : 'Forum'}
              </span>
              {isPostHidden && (
                <span className="text-xs font-bold text-amber-700 bg-amber-100 rounded-lg px-2 py-0.5">
                  Đã ẩn
                </span>
              )}
              <span className="rounded-full bg-amber-100 px-2 py-0.5 text-[10px] font-semibold text-amber-700">
                {reports.length} báo cáo
              </span>
              {pendingCount > 0 && (
                <span className="text-[10px] text-red-500 font-medium">
                  ({pendingCount} chờ xử lý)
                </span>
              )}
            </div>

            <div className="text-xs text-slate-500 space-y-0.5">
              {post.forumSlug && (
                <p>
                  Forum:{' '}
                  <button
                    type="button"
                    onClick={() => {
                      const url = new URL(
                        `${LEARNINGHUB_URL}/forum/${post.forumSlug}`,
                      );
                      window.open(url.toString(), '_blank');
                    }}
                    className="inline-flex items-center gap-0.5 text-blue-600 hover:text-blue-800"
                  >
                    {post.forumName ?? post.forumSlug}
                    <ExternalLink className="h-3 w-3" />
                  </button>
                </p>
              )}
            </div>

            {isExpanded && (
              <div className="mt-3 space-y-2">
                {reports.map((r) => (
                  <div
                    key={r.id}
                    className="flex items-start gap-3 bg-slate-50 rounded-lg border border-slate-200 px-3 py-2"
                  >
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="text-xs font-medium text-slate-700">
                          {r.reporterName}
                        </span>
                        <span className="text-xs text-slate-500">
                          {REASON_LABELS[r.reason] ?? r.reason}
                        </span>
                        {!['pending'].includes(r.status) && (
                          <span
                            className={`text-[10px] font-bold px-1.5 py-0.5 rounded-full ${
                              r.status === 'resolved'
                                ? 'bg-emerald-100 text-emerald-700'
                                : 'bg-slate-100 text-slate-500'
                            }`}
                          >
                            {r.status === 'resolved' ? 'Đã xử lý' : 'Đã bỏ qua'}
                          </span>
                        )}
                      </div>
                      {r.description && (
                        <p className="mt-0.5 text-[11px] text-slate-400 italic">
                          &ldquo;{r.description}&rdquo;
                        </p>
                      )}
                      <p className="mt-0.5 text-[10px] text-slate-400">
                        {new Date(r.createdAt).toLocaleString('vi-VN')}
                      </p>
                    </div>
                    {r.status === 'pending' && (
                      <div className="flex items-center gap-1 shrink-0">
                        <ResolveButton
                          reportId={r.id}
                          isPending={isResolving}
                          onResolve={onResolve}
                        />
                        <button
                          onClick={() => onDismiss(r.id)}
                          disabled={isDismissing}
                          className="inline-flex items-center gap-1 px-2 h-7 rounded-lg text-[10px] font-medium border border-slate-200 text-slate-600 hover:bg-slate-100 transition disabled:opacity-50"
                        >
                          <XCircle className="h-3 w-3" /> Bỏ qua
                        </button>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}

            {isExpanded && isPost && (
              <div className="mt-3 p-3 bg-slate-50 rounded-lg border border-slate-200">
                <p className="text-xs text-slate-600">
                  <span className="font-bold">Post ID:</span>{' '}
                  <code className="text-[11px] font-mono">{post.targetId}</code>
                </p>
                {post.forumSlug && (
                  <p className="text-xs text-slate-600 mt-1">
                    <span className="font-bold">Link:</span>{' '}
                    <button
                      type="button"
                      onClick={onViewPost}
                      className="inline-flex items-center gap-0.5 text-blue-600 hover:text-blue-800"
                    >
                      Xem bài viết
                    </button>
                  </p>
                )}
              </div>
            )}
          </div>

          {isPost && (
            <div className="flex items-center gap-1.5 shrink-0">
              {isPostHidden ? (
                <button
                  onClick={onRestorePost}
                  disabled={isRestoring}
                  className="inline-flex items-center gap-1 px-2.5 h-8 rounded-lg text-xs font-bold bg-emerald-600 text-white hover:bg-emerald-700 transition disabled:opacity-50"
                >
                  <Eye className="h-3.5 w-3.5" /> Khôi phục
                </button>
              ) : (
                <button
                  onClick={onHidePost}
                  disabled={isHiding}
                  className="inline-flex items-center gap-1 px-2.5 h-8 rounded-lg text-xs font-bold bg-amber-500 text-white hover:bg-amber-600 transition disabled:opacity-50"
                >
                  <EyeOff className="h-3.5 w-3.5" /> Ẩn
                </button>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function ResolveButton({
  reportId,
  isPending,
  onResolve,
}: {
  reportId: string;
  isPending: boolean;
  onResolve: (params: { reportId: string; note: string }) => void;
}) {
  const [showInput, setShowInput] = useState(false);
  const [note, setNote] = useState('');

  if (!showInput) {
    return (
      <button
        onClick={() => setShowInput(true)}
        className="inline-flex items-center gap-1 px-2 h-7 rounded-lg text-[10px] font-bold bg-indigo-600 text-white hover:bg-indigo-700 transition"
      >
        <CheckCircle className="h-3 w-3" /> Xử lý
      </button>
    );
  }

  return (
    <div className="flex items-center gap-1">
      <input
        type="text"
        value={note}
        onChange={(e) => setNote(e.target.value)}
        onKeyDown={(e) => {
          if (e.key === 'Enter' && note.trim()) {
            onResolve({ reportId, note: note.trim() });
            setNote('');
            setShowInput(false);
          }
          if (e.key === 'Escape') {
            setShowInput(false);
            setNote('');
          }
        }}
        placeholder="Ghi chú..."
        className="w-32 h-7 rounded-lg border border-slate-200 px-2 text-xs focus:border-indigo-500 outline-none"
        autoFocus
      />
      <button
        onClick={() => {
          onResolve({ reportId, note: note.trim() });
          setNote('');
          setShowInput(false);
        }}
        disabled={isPending}
        className="inline-flex items-center gap-1 px-2 h-7 rounded-lg text-[10px] font-bold bg-indigo-600 text-white hover:bg-indigo-700 transition disabled:opacity-50"
      >
        OK
      </button>
      <button
        onClick={() => {
          setShowInput(false);
          setNote('');
        }}
        className="h-7 w-7 rounded-lg border border-slate-200 flex items-center justify-center text-slate-400 hover:text-slate-600 text-xs"
      >
        ✕
      </button>
    </div>
  );
}
