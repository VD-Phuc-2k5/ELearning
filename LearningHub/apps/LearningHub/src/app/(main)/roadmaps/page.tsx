'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import Link from 'next/link';
import { Map, Plus, ArrowUpRight, Users } from 'lucide-react';
import { Button } from '../../../components/ui';
import { listRoadmaps, enrollRoadmap } from '../../actions/roadmap.actions';
import '@aejkatappaja/phantom-ui';

export default function RoadmapsPage() {
  const qc = useQueryClient();
  const { data, isLoading } = useQuery({
    queryKey: ['roadmaps'],
    queryFn: () => listRoadmaps({ limit: 20 }),
  });
  const enroll = useMutation({
    mutationFn: (id: string) => enrollRoadmap(id),
    onSuccess: () =>
      qc.invalidateQueries({ queryKey: ['my-roadmap-progress'] }),
  });

  if (isLoading)
    return (
      <phantom-ui loading animation="pulse" reveal={0.2} className="block">
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="h-40 rounded-2xl bg-slate-200" />
          ))}
        </div>
      </phantom-ui>
    );

  const roadmaps = data?.data ?? [];

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">
            Learning Roadmaps
          </h1>
          <p className="text-slate-500 mt-1 text-sm">
            Follow a structured path to master your skills
          </p>
        </div>
        <Link href="/roadmaps/manage/create">
          <Button icon={<Plus className="h-4 w-4" />}>Create Roadmap</Button>
        </Link>
      </div>

      {roadmaps.length === 0 ? (
        <div className="rounded-2xl border-2 border-dashed border-slate-200 p-16 text-center">
          <Map className="h-10 w-10 text-slate-300 mx-auto mb-3" />
          <p className="font-semibold text-slate-500">No roadmaps yet</p>
          <p className="text-sm text-slate-400 mt-1">
            Create the first learning roadmap
          </p>
          <Link href="/roadmaps/manage/create" className="mt-4 inline-block">
            <Button size="sm">Create Roadmap</Button>
          </Link>
        </div>
      ) : (
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {roadmaps.map((r) => (
            <div
              key={r.id}
              className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6 space-y-4 hover:shadow-md transition"
            >
              <div className="flex items-start justify-between gap-3">
                <div className="h-10 w-10 rounded-xl bg-indigo-50 flex items-center justify-center shrink-0">
                  <Map className="h-5 w-5 text-indigo-600" />
                </div>
                <span
                  className={[
                    'text-xs font-semibold px-2 py-1 rounded-full',
                    r.status === 'published'
                      ? 'bg-emerald-100 text-emerald-700'
                      : 'bg-slate-100 text-slate-500',
                  ].join(' ')}
                >
                  {r.status}
                </span>
              </div>
              <div>
                <h3 className="font-bold text-slate-900 truncate">{r.title}</h3>
                {r.description && (
                  <p className="text-sm text-slate-500 mt-1 line-clamp-2">
                    {r.description}
                  </p>
                )}
              </div>
              <div className="flex gap-2 pt-2">
                <Link href={`/roadmaps/${r.id}`} className="flex-1">
                  <Button
                    variant="secondary"
                    className="w-full"
                    size="sm"
                    icon={<ArrowUpRight className="h-3.5 w-3.5" />}
                  >
                    View
                  </Button>
                </Link>
                <Button
                  size="sm"
                  onClick={() => enroll.mutate(r.id)}
                  isLoading={enroll.isPending}
                  icon={<Users className="h-3.5 w-3.5" />}
                >
                  Enroll
                </Button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
