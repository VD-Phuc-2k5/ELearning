'use client';

import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  AlertTriangle,
  CheckCircle,
  XCircle,
  ChevronDown,
  ChevronUp,
} from 'lucide-react';
import { Button } from '../../../../../components/ui';
import {
  getForumReports,
  resolveReport,
  dismissReport,
} from '../../../../actions/forum.actions';
import type { ForumReport } from '@learning-hub/domain';

interface ForumReportsPanelProps {
  forumId: string;
  isModerator: boolean;
}

const REASON_LABELS: Record<string, string> = {
  SPAM: 'Spam',
  INAPPROPRIATE_CONTENT: 'Nội dung không phù hợp',
  HARASSMENT: 'Quấy rối',
  COPYRIGHT: 'Vi phạm bản quyền',
  MISLEADING: 'Thông tin sai lệch',
  OTHER: 'Khác',
};

function ReportItem({
  report,
  forumId,
  onResolve,
  onDismiss,
  resolving,
  dismissing,
}: {
  report: ForumReport;
  forumId: string;
  onResolve: (reportId: string, note: string) => void;
  onDismiss: (reportId: string) => void;
  resolving: boolean;
  dismissing: boolean;
}) {
  const [note, setNote] = useState('');
  const [showActions, setShowActions] = useState(false);

  return (
    <div className="rounded-lg border border-slate-100 bg-slate-50 p-3 text-xs">
      <div className="flex items-start justify-between gap-2">
        <div className="min-w-0 flex-1">
          <span className="font-medium text-slate-700">
            {REASON_LABELS[report.reason] ?? report.reason}
          </span>
          {report.description && (
            <p className="mt-1 text-slate-500 break-words">
              {report.description}
            </p>
          )}
          <p className="mt-1 text-[10px] text-slate-400">
            {new Date(report.createdAt).toLocaleString('vi-VN')} &middot;{' '}
            {report.targetType === 'post'
              ? 'Bài viết'
              : report.targetType === 'comment'
                ? 'Bình luận'
                : 'Forum'}
          </p>
        </div>
        {report.status === 'pending' && (
          <button
            type="button"
            onClick={() => setShowActions(!showActions)}
            className="shrink-0 text-slate-400 hover:text-slate-600"
          >
            {showActions ? (
              <ChevronUp className="h-4 w-4" />
            ) : (
              <ChevronDown className="h-4 w-4" />
            )}
          </button>
        )}
        {report.status === 'resolved' && (
          <CheckCircle className="h-4 w-4 text-green-500 shrink-0" />
        )}
        {report.status === 'dismissed' && (
          <XCircle className="h-4 w-4 text-slate-300 shrink-0" />
        )}
      </div>
      {showActions && (
        <div className="mt-2 space-y-2 border-t border-slate-200 pt-2">
          <textarea
            value={note}
            onChange={(e) => setNote(e.target.value)}
            placeholder="Ghi chú giải quyết..."
            className="w-full rounded-lg border border-slate-200 px-2 py-1 text-xs text-slate-700 placeholder:text-slate-400 focus:outline-none focus:border-indigo-400 resize-none"
            rows={2}
          />
          <div className="flex gap-1.5">
            <Button
              size="sm"
              onClick={() => {
                onResolve(report.id, note);
                setShowActions(false);
                setNote('');
              }}
              disabled={resolving}
              isLoading={resolving}
            >
              <CheckCircle className="h-3 w-3" />
              Resolve
            </Button>
            <Button
              size="sm"
              variant="secondary"
              onClick={() => {
                onDismiss(report.id);
                setShowActions(false);
                setNote('');
              }}
              disabled={dismissing}
            >
              Dismiss
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}

function ReportGroup({
  groupKey,
  reports,
  forumId,
  onResolve,
  onDismiss,
  resolving,
  dismissing,
}: {
  groupKey: string;
  reports: ForumReport[];
  forumId: string;
  onResolve: (reportId: string, note: string) => void;
  onDismiss: (reportId: string) => void;
  resolving: boolean;
  dismissing: boolean;
}) {
  const [expanded, setExpanded] = useState(false);
  const [targetType, targetId] = groupKey.split(':');
  const label =
    targetType === 'post'
      ? 'Bài viết'
      : targetType === 'comment'
        ? 'Bình luận'
        : 'Forum';

  return (
    <div className="rounded-lg border border-slate-200 bg-white overflow-hidden">
      <button
        type="button"
        onClick={() => setExpanded(!expanded)}
        className="w-full flex items-center justify-between px-3 py-2 text-xs hover:bg-slate-50 transition"
      >
        <span className="font-medium text-slate-700 truncate">
          {label} · {targetId.slice(0, 8)}…
        </span>
        <span className="flex items-center gap-1.5 shrink-0 ml-2">
          <span className="rounded-full bg-amber-100 px-1.5 py-0.5 text-[10px] font-semibold text-amber-700">
            {reports.length} báo cáo
          </span>
          {expanded ? (
            <ChevronUp className="h-3 w-3 text-slate-400" />
          ) : (
            <ChevronDown className="h-3 w-3 text-slate-400" />
          )}
        </span>
      </button>
      {expanded && (
        <div className="border-t border-slate-100 px-2 pb-2 pt-1.5 space-y-1.5 bg-slate-50">
          {reports.map((r) => (
            <ReportItem
              key={r.id}
              report={r}
              forumId={forumId}
              onResolve={onResolve}
              onDismiss={onDismiss}
              resolving={resolving}
              dismissing={dismissing}
            />
          ))}
        </div>
      )}
    </div>
  );
}

export function ForumReportsPanel({
  forumId,
  isModerator,
}: ForumReportsPanelProps) {
  const [statusFilter, setStatusFilter] = useState<string>('pending');
  const qc = useQueryClient();

  const { data: reportsData, isLoading } = useQuery({
    queryKey: ['forum-reports', forumId, statusFilter],
    queryFn: () =>
      getForumReports(forumId, { status: statusFilter, limit: 50 }),
    enabled: isModerator,
    refetchInterval: 30000,
  });

  const resolveMutation = useMutation({
    mutationFn: ({ reportId, note }: { reportId: string; note: string }) =>
      resolveReport(forumId, reportId, note),
    onSuccess: () =>
      qc.invalidateQueries({ queryKey: ['forum-reports', forumId] }),
  });

  const dismissMutation = useMutation({
    mutationFn: (reportId: string) => dismissReport(forumId, reportId),
    onSuccess: () =>
      qc.invalidateQueries({ queryKey: ['forum-reports', forumId] }),
  });

  if (!isModerator) return null;

  const reports = reportsData?.data ?? [];
  const pendingCount = reports.filter(
    (r: ForumReport) => r.status === 'pending',
  ).length;

  // Group reports by target so multiple reporters on the same post show as one entry
  const groups = new Map<string, ForumReport[]>();
  for (const r of reports) {
    const key = `${r.targetType}:${r.targetId}`;
    if (!groups.has(key)) groups.set(key, []);
    groups.get(key)!.push(r);
  }
  const sortedGroups = Array.from(groups.entries()).sort(
    ([, a], [, b]) => b.length - a.length,
  );

  return (
    <div className="rounded-2xl border border-slate-100 bg-white p-4 shadow-sm">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-semibold text-slate-900 flex items-center gap-1.5">
          <AlertTriangle className="h-4 w-4 text-amber-500" />
          Báo cáo
        </h3>
        {pendingCount > 0 && (
          <span className="rounded-full bg-red-100 px-2 py-0.5 text-[10px] font-medium text-red-700">
            {pendingCount} pending
          </span>
        )}
      </div>
      <div className="mt-2 flex gap-1">
        {['pending', 'resolved', 'dismissed'].map((s) => (
          <button
            key={s}
            type="button"
            onClick={() => setStatusFilter(s)}
            className={`rounded-full px-2 py-0.5 text-[10px] font-medium transition ${
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
      <div className="mt-2 max-h-64 overflow-y-auto space-y-1.5">
        {isLoading ? (
          <p className="text-xs text-slate-400">Đang tải...</p>
        ) : sortedGroups.length === 0 ? (
          <p className="text-xs text-slate-400">Không có báo cáo nào.</p>
        ) : (
          sortedGroups.map(([key, groupReports]) => (
            <ReportGroup
              key={key}
              groupKey={key}
              reports={groupReports}
              forumId={forumId}
              onResolve={(reportId, note) =>
                resolveMutation.mutate({ reportId, note })
              }
              onDismiss={(reportId) => dismissMutation.mutate(reportId)}
              resolving={resolveMutation.isPending}
              dismissing={dismissMutation.isPending}
            />
          ))
        )}
      </div>
    </div>
  );
}
