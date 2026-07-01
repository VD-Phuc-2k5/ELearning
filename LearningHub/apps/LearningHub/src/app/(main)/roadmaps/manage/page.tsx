'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import Link from 'next/link';
import { Plus, Map, ArrowUpRight, Edit2, Trash2 } from 'lucide-react';
import { Button, useConfirmModal } from '../../../../components/ui';
import {
  listMyRoadmaps,
  deleteRoadmap,
} from '../../../actions/roadmap.actions';

export default function ManageRoadmapsPage() {
  const qc = useQueryClient();
  const { modal: confirmModal, openConfirm } = useConfirmModal();
  const { data, isLoading } = useQuery({
    queryKey: ['my-roadmaps'],
    queryFn: () => listMyRoadmaps({ limit: 50 }),
  });

  const del = useMutation({
    mutationFn: (id: string) => deleteRoadmap(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['my-roadmaps'] }),
  });

  const handleDelete = (id: string, title: string) => {
    openConfirm(`Xóa roadmap "${title}"? Tất cả tiến độ học sẽ bị mất.`, () =>
      del.mutate(id),
    );
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-slate-900">Manage Roadmaps</h1>
        <Link href="/roadmaps/manage/create">
          <Button icon={<Plus className="h-4 w-4" />}>New Roadmap</Button>
        </Link>
      </div>

      {isLoading ? (
        <div className="space-y-3">
          {[1, 2, 3].map((i) => (
            <div
              key={i}
              className="h-16 rounded-xl bg-slate-100 animate-pulse"
            />
          ))}
        </div>
      ) : !data?.data?.length ? (
        <div className="rounded-2xl border-2 border-dashed border-slate-200 p-16 text-center">
          <Map className="h-10 w-10 text-slate-300 mx-auto mb-3" />
          <p className="font-semibold text-slate-500">No roadmaps yet</p>
          <Link href="/roadmaps/manage/create" className="mt-4 inline-block">
            <Button size="sm">Create first roadmap</Button>
          </Link>
        </div>
      ) : (
        <div className="space-y-3">
          {data.data.map((r: any) => (
            <div
              key={r.id}
              className="flex items-center gap-4 p-4 rounded-2xl border border-slate-100 bg-white shadow-sm"
            >
              <div className="h-10 w-10 rounded-xl bg-indigo-50 flex items-center justify-center shrink-0">
                <Map className="h-5 w-5 text-indigo-600" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-semibold text-slate-900 truncate">
                  {r.title}
                </p>
                <p className="text-xs text-slate-400">{r.status}</p>
              </div>
              <div className="flex gap-2">
                <Link href={`/roadmaps/${r.id}`}>
                  <Button
                    variant="ghost"
                    size="sm"
                    icon={<ArrowUpRight className="h-3.5 w-3.5" />}
                  >
                    View
                  </Button>
                </Link>
                <Link href={`/roadmaps/manage/${r.id}`}>
                  <Button
                    variant="secondary"
                    size="sm"
                    icon={<Edit2 className="h-3.5 w-3.5" />}
                  >
                    Edit
                  </Button>
                </Link>
                <Button
                  variant="ghost"
                  size="sm"
                  icon={<Trash2 className="h-3.5 w-3.5 text-red-500" />}
                  isLoading={del.isPending && del.variables === r.id}
                  onClick={() => handleDelete(r.id, r.title)}
                />
              </div>
            </div>
          ))}
        </div>
      )}
      {confirmModal}
    </div>
  );
}
