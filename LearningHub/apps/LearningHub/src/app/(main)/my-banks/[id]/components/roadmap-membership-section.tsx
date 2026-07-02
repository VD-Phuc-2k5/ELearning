'use client';

import { useQuery } from '@tanstack/react-query';
import Link from 'next/link';
import { Map, ArrowUpRight, BookOpen } from 'lucide-react';
import { getBankRoadmaps } from '../../../../actions/quiz.actions';
import { getRoadmapDetail } from '../../../../actions/roadmap.actions';
import { EmptyState } from '../../../../../components/ui';
import '@aejkatappaja/phantom-ui';

interface RoadmapMembership {
  roadmapId: string;
  roadmapTitle: string;
  description: string | null;
  totalBanks: number;
  position: number;
}

export function RoadmapMembershipSection({ bankId }: { bankId: string }) {
  const { data, isLoading } = useQuery({
    queryKey: ['bank-roadmap-membership', bankId],
    queryFn: async (): Promise<RoadmapMembership[]> => {
      const items = await getBankRoadmaps(bankId);
      if (items.length === 0) return [];
      const details = await Promise.all(
        items.map((i) => getRoadmapDetail(i.roadmapId)),
      );
      return items.map((item, idx) => ({
        roadmapId: item.roadmapId,
        roadmapTitle: item.roadmapTitle,
        description: details[idx].roadmap.description,
        totalBanks: details[idx].items.length,
        position: item.position,
      }));
    },
  });

  const memberships = data ?? [];

  return (
    <section className="space-y-4">
      <div className="flex items-center gap-2">
        <Map className="h-5 w-5 text-indigo-500" />
        <h2 className="text-lg font-bold text-slate-900">Used in Roadmaps</h2>
      </div>

      {isLoading ? (
        <phantom-ui
          loading
          animation="pulse"
          reveal={0.2}
          className="block space-y-3"
        >
          {[1, 2].map((i) => (
            <div key={i} className="h-24 rounded-2xl bg-slate-100" />
          ))}
        </phantom-ui>
      ) : memberships.length === 0 ? (
        <EmptyState
          icon={<Map className="h-8 w-full" />}
          title="Not used in any roadmap"
          description="This question bank hasn't been added to a roadmap yet."
        />
      ) : (
        <div className="grid gap-4 sm:grid-cols-2">
          {memberships.map((m: RoadmapMembership) => (
            <Link
              key={m.roadmapId}
              href={`/roadmaps/${m.roadmapId}`}
              className="group block rounded-2xl border border-slate-100 bg-white p-5 shadow-sm hover:shadow-md hover:border-indigo-200 transition"
            >
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <p className="font-semibold text-slate-900 truncate group-hover:text-indigo-700 transition">
                    {m.roadmapTitle}
                  </p>
                  <p className="mt-0.5 text-xs text-slate-400">
                    Step {m.position}
                  </p>
                </div>
                <ArrowUpRight className="h-4 w-4 shrink-0 text-slate-300 group-hover:text-indigo-600 transition" />
              </div>
              <p className="mt-2 min-h-[2.5rem] text-sm text-slate-500 line-clamp-2">
                {m.description ?? 'No description'}
              </p>
              <div className="mt-3 flex items-center gap-1.5 text-xs text-slate-500">
                <BookOpen className="h-3.5 w-3.5" />
                <span>
                  {m.totalBanks} question bank{m.totalBanks !== 1 ? 's' : ''}
                </span>
              </div>
            </Link>
          ))}
        </div>
      )}
    </section>
  );
}
