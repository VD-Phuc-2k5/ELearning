'use client';

import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  UserPlus,
  Copy,
  X,
  Clock,
  CheckCircle,
  AlertCircle,
  Users,
} from 'lucide-react';
import { Button } from '../../../../../components/ui';
import {
  createInvite,
  getInvites,
  revokeInvite,
} from '../../../../actions/forum.actions';
import type { ForumInvite } from '@learning-hub/domain';

const STATUS_ICON: Record<string, React.ReactNode> = {
  pending: <Clock className="h-3.5 w-3.5 text-amber-500" />,
  closed: <X className="h-3.5 w-3.5 text-slate-400" />,
  expired: <AlertCircle className="h-3.5 w-3.5 text-slate-400" />,
};

const STATUS_LABEL: Record<string, string> = {
  pending: 'Pending',
  closed: 'Closed',
  expired: 'Expired',
};

function formatTimeLeft(expiresAt: string): string {
  const diff = new Date(expiresAt).getTime() - Date.now();
  if (diff <= 0) return 'Expired';
  const minutes = Math.floor(diff / 60000);
  if (minutes < 1) return 'Expiring soon';
  return `${minutes}m left`;
}

interface ForumInvitePanelProps {
  forumId: string;
}

export function ForumInvitePanel({ forumId }: ForumInvitePanelProps) {
  const qc = useQueryClient();
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const { data: invitesData, isLoading } = useQuery({
    queryKey: ['forum-invites', forumId],
    queryFn: () => getInvites(forumId, 1, 2),
    refetchInterval: 30000,
  });

  const [createError, setCreateError] = useState<string | null>(null);

  const createMutation = useMutation({
    mutationFn: async () => {
      const result = await createInvite(forumId);
      if (!result.success) throw new Error(result.message);
      return result.data;
    },
    onSuccess: () => {
      setCreateError(null);
      qc.invalidateQueries({ queryKey: ['forum-invites', forumId] });
    },
    onError: (e: Error) => setCreateError(e.message),
  });

  const revokeMutation = useMutation({
    mutationFn: (inviteId: string) => revokeInvite(forumId, inviteId),
    onSuccess: () =>
      qc.invalidateQueries({ queryKey: ['forum-invites', forumId] }),
  });

  const invites: ForumInvite[] = invitesData?.data ?? [];
  const activeInvites = invites.filter(
    (i: ForumInvite) => i.status === 'pending',
  );

  const copyLink = async (invite: ForumInvite) => {
    const link = `${window.location.origin}/invite/${invite.token}`;
    await navigator.clipboard.writeText(link);
    setCopiedId(invite.id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-semibold text-slate-700">Invite Members</h3>
        {activeInvites.length < 2 && (
          <Button
            size="sm"
            variant="secondary"
            onClick={() => createMutation.mutate()}
            isLoading={createMutation.isPending}
            icon={<UserPlus className="h-3.5 w-3.5" />}
          >
            Generate Link
          </Button>
        )}
      </div>

      {isLoading ? (
        <div className="space-y-2">
          {[1, 2].map((i) => (
            <div
              key={i}
              className="h-10 rounded-lg bg-slate-100 animate-pulse"
            />
          ))}
        </div>
      ) : invites.length === 0 ? (
        <p className="text-xs text-slate-400">
          No invites yet. Generate an invite link to share with users.
        </p>
      ) : (
        <div className="space-y-2">
          {invites.map((invite: ForumInvite) => (
            <div
              key={invite.id}
              className="flex items-center gap-2 rounded-lg border border-slate-100 bg-white px-3 py-2"
            >
              {STATUS_ICON[invite.status] ?? STATUS_ICON.pending}
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-medium text-slate-700">
                    {STATUS_LABEL[invite.status] ?? invite.status}
                  </span>
                  {invite.status === 'pending' && (
                    <span className="text-[10px] text-amber-600">
                      {formatTimeLeft(invite.expiresAt)}
                    </span>
                  )}
                  {invite.acceptedCount > 0 && (
                    <span className="inline-flex items-center gap-0.5 text-[10px] text-emerald-600">
                      <Users className="h-3 w-3" />
                      {invite.acceptedCount}
                    </span>
                  )}
                </div>
              </div>
              {invite.status === 'pending' && (
                <div className="flex items-center gap-1 shrink-0">
                  <button
                    type="button"
                    onClick={() => copyLink(invite)}
                    className="rounded-md p-1 text-slate-400 hover:bg-slate-100 hover:text-indigo-600 transition"
                    title="Copy invite link"
                  >
                    {copiedId === invite.id ? (
                      <CheckCircle className="h-3.5 w-3.5 text-emerald-500" />
                    ) : (
                      <Copy className="h-3.5 w-3.5" />
                    )}
                  </button>
                  <button
                    type="button"
                    onClick={() => revokeMutation.mutate(invite.id)}
                    className="rounded-md p-1 text-slate-400 hover:bg-red-50 hover:text-red-500 transition"
                    title="Close invite"
                  >
                    <X className="h-3.5 w-3.5" />
                  </button>
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {activeInvites.length > 0 && (
        <div className="rounded-lg bg-indigo-50 px-3 py-2">
          <p className="text-[11px] text-indigo-700">
            Share the invite link with users. It expires in 15 minutes and can
            be used by multiple people.
          </p>
        </div>
      )}

      {createError && <p className="text-xs text-red-500">{createError}</p>}
    </div>
  );
}
