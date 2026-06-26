'use client';

import { useQuery } from '@tanstack/react-query';
import QuizService from '../../services/quiz.service';
import { BookOpen, Users, Star, TrendingUp, ArrowUpRight } from 'lucide-react';
import Link from 'next/link';
import { Button } from '../../components/ui';

export default function DashboardPage() {
  const { data: myBanks } = useQuery({
    queryKey: ['my-banks-stats'],
    queryFn: () => QuizService.getBanks({ limit: 3 }),
  });

  return (
    <div className="space-y-10">
      <section>
        <div className="flex items-start justify-between gap-4">
          <div>
            <h2 className="text-3xl font-extrabold text-slate-900 tracking-tight">Good day! 👋</h2>
            <p className="text-slate-500 mt-1">What would you like to learn or share today?</p>
          </div>
          <Link href="/my-banks/create" className="shrink-0">
            <Button icon={<ArrowUpRight className="h-4 w-4" />}>Quick Create</Button>
          </Link>
        </div>

        <div className="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          <StatCard
            title="My Banks"
            value={myBanks?.total ?? 0}
            icon={<BookOpen className="h-6 w-6" />}
            color="bg-indigo-600"
          />
          <StatCard
            title="Students"
            value="1.2k"
            icon={<Users className="h-6 w-6" />}
            color="bg-emerald-600"
          />
          <StatCard
            title="Avg. Rating"
            value="4.8"
            icon={<Star className="h-6 w-6" />}
            color="bg-amber-500"
          />
          <StatCard
            title="Community Rank"
            value="#12"
            icon={<TrendingUp className="h-6 w-6" />}
            color="bg-rose-500"
          />
        </div>
      </section>

      <section className="grid gap-8 lg:grid-cols-2">
        <div className="space-y-5">
          <div className="flex items-center justify-between">
            <h3 className="text-xl font-bold text-slate-900">Recent</h3>
            <Link href="/my-banks" className="text-sm font-semibold text-indigo-600 hover:underline flex items-center gap-1">
              View all <ArrowUpRight className="h-3.5 w-3.5" />
            </Link>
          </div>
          <div className="space-y-3">
            {myBanks?.data?.length ? myBanks.data.map((bank: any) => (
              <div key={bank.id} className="flex items-center gap-4 p-4 rounded-2xl border border-slate-100 bg-white shadow-sm hover:shadow-md transition group">
                <div className="h-11 w-11 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center shrink-0 group-hover:bg-indigo-600 group-hover:text-white transition">
                  <BookOpen className="h-5 w-5" />
                </div>
                <div className="flex-1 min-w-0">
                  <h4 className="font-semibold text-slate-900 truncate text-sm">{bank.title}</h4>
                  <p className="text-xs text-slate-400 mt-0.5">
                    {bank.totalQuestions} questions · Updated {new Date(bank.updatedAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                  </p>
                </div>
                <Link href={`/my-banks/${bank.id}`}>
                  <button className="p-2 text-slate-300 hover:text-indigo-600 transition rounded-lg hover:bg-indigo-50">
                    <ArrowUpRight className="h-4 w-4" />
                  </button>
                </Link>
              </div>
            )) : (
              <div className="rounded-2xl border-2 border-dashed border-slate-200 p-8 text-center">
                <BookOpen className="h-8 w-8 text-slate-300 mx-auto mb-3" />
                <p className="text-sm text-slate-500 font-medium">No banks yet</p>
                <Link href="/my-banks/create">
                  <button className="mt-3 text-sm font-semibold text-indigo-600 hover:underline">Create your first bank</button>
                </Link>
              </div>
            )}
          </div>
        </div>

        <div className="rounded-3xl bg-gradient-to-br from-indigo-600 to-indigo-700 p-8 text-white relative overflow-hidden">
          <div className="absolute -top-12 -right-12 h-48 w-48 rounded-full bg-white/10" />
          <div className="absolute -bottom-8 -left-8 h-32 w-32 rounded-full bg-white/5" />
          <div className="relative z-10 space-y-5">
            <div className="inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-white/10 backdrop-blur-sm">
              <TrendingUp className="h-6 w-6 text-indigo-200" />
            </div>
            <h3 className="text-2xl font-bold">Become a Creator!</h3>
            <p className="text-indigo-200 leading-relaxed text-sm">
              Share your knowledge with the community. Build question banks, import from Excel, and help thousands of others learn better.
            </p>
            <Link href="/my-banks/create">
              <button className="mt-2 bg-white text-indigo-700 font-bold px-6 py-2.5 rounded-xl shadow-lg hover:shadow-xl hover:scale-105 transition text-sm">
                Get started
              </button>
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}

function StatCard({ title, value, icon, color }: { title: string; value: string | number; icon: React.ReactNode; color: string }) {
  return (
    <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm flex items-center gap-4">
      <div className={`h-12 w-12 rounded-xl ${color} text-white flex items-center justify-center shadow-md shrink-0`}>
        {icon}
      </div>
      <div>
        <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">{title}</p>
        <p className="text-2xl font-extrabold text-slate-900 mt-0.5">{value}</p>
      </div>
    </div>
  );
}
