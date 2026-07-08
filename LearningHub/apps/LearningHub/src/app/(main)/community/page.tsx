'use client';

import { useState, useMemo, useCallback } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useRouter } from 'next/navigation';
import { getBanks, getTags, getBankRoadmaps } from '../../actions/quiz.actions';
import { enrollRoadmap } from '../../actions/roadmap.actions';
import { useCurrentUser } from '../../../components/hooks/use-current-user';
import type { QuestionBank, Tag } from '@learning-hub/domain';
import { Button } from '../../../components/ui';
import {
  Search,
  BookOpen,
  Clock,
  ChevronDown,
  X,
  AlertCircle,
} from 'lucide-react';
import Link from 'next/link';

function getInitials(name: string): string {
  return name
    .split(' ')
    .filter(Boolean)
    .map((p) => p[0]?.toUpperCase() ?? '')
    .slice(0, 2)
    .join('');
}

function timeAgo(dateStr: string | null | undefined): string {
  if (!dateStr) return '';
  const d = new Date(dateStr);
  if (isNaN(d.getTime())) return '';
  const diff = Date.now() - d.getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return 'just now';
  if (mins < 60) return `${mins}m ago`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  if (days < 30) return `${days}d ago`;
  return d.toLocaleDateString();
}

export default function CommunityPage() {
  const router = useRouter();
  const { user } = useCurrentUser();
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [selectedTagId, setSelectedTagId] = useState<number | undefined>();
  const [showTagDropdown, setShowTagDropdown] = useState(false);
  const [studyingId, setStudyingId] = useState<string | null>(null);
  const limit = 12;

  const { data: allTags, error: tagsError } = useQuery({
    queryKey: ['community-tags'],
    queryFn: () => getTags(),
  });

  const {
    data: banks,
    isLoading,
    error: banksError,
  } = useQuery({
    queryKey: ['community-banks', debouncedSearch, selectedTagId, page],
    queryFn: () =>
      getBanks({
        page,
        limit,
        statusId: 'approved',
        search: debouncedSearch || undefined,
        tagId: selectedTagId,
      }),
  });

  const totalPages = Math.ceil((banks?.total ?? 0) / limit);

  const handleSearch = useCallback(() => {
    setDebouncedSearch(search);
    setPage(1);
  }, [search]);

  const selectedTag = useMemo(
    () => allTags?.find((t: Tag) => t.id === selectedTagId),
    [allTags, selectedTagId],
  );

  const handleStudy = useCallback(
    async (bank: QuestionBank) => {
      setStudyingId(bank.id);
      try {
        const roadmaps = await getBankRoadmaps(bank.id);
        const firstRoadmap = roadmaps?.[0];
        if (firstRoadmap) {
          await enrollRoadmap(firstRoadmap.roadmapId).catch(() => undefined);
          router.push(`/quiz/${bank.id}?roadmapId=${firstRoadmap.roadmapId}`);
        } else {
          router.push(`/quiz/${bank.id}`);
        }
      } catch {
        router.push(`/quiz/${bank.id}`);
      }
    },
    [router],
  );

  return (
    <div className="space-y-10">
      <div className="relative overflow-hidden rounded-3xl bg-slate-900 px-8 py-16 text-white md:px-12">
        <div className="absolute top-0 right-0 -mr-20 -mt-20 h-80 w-80 rounded-full bg-indigo-500/20 blur-3xl" />
        <div className="absolute bottom-0 left-0 -ml-10 -mb-10 h-40 w-40 rounded-full bg-indigo-500/10 blur-2xl" />
        <div className="relative z-10 max-w-2xl">
          <p className="text-xs font-semibold uppercase tracking-widest text-indigo-400 mb-3">
            Community
          </p>
          <h2 className="text-4xl font-extrabold tracking-tight md:text-5xl">
            Shared Knowledge Hub
          </h2>
          <p className="mt-4 text-lg text-slate-300 leading-relaxed">
            Discover thousands of quality question sets from top educators and
            learners. Learn without limits.
          </p>

          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSearch();
            }}
            className="mt-10 flex max-w-md items-center gap-2 rounded-2xl bg-white/10 p-2 backdrop-blur-md border border-white/15"
          >
            <Search className="ml-3 h-5 w-5 text-slate-400 shrink-0" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search banks, topics..."
              className="w-full bg-transparent border-none text-white placeholder-slate-400 focus:ring-0 text-sm outline-none"
            />
            <Button type="submit" size="sm" className="shrink-0 rounded-xl">
              Search
            </Button>
          </form>
        </div>
      </div>

      {tagsError && (
        <p className="text-xs text-rose-600 flex items-center gap-1">
          <AlertCircle className="h-3 w-3" />
          Không thể tải thẻ
        </p>
      )}

      <div className="flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-3 flex-wrap">
          <div className="relative">
            <Button
              variant="secondary"
              size="sm"
              className="rounded-xl flex items-center gap-2"
              onClick={() => setShowTagDropdown(!showTagDropdown)}
              iconPosition="Right"
              icon={<ChevronDown className="h-3 w-3" />}
            >
              {selectedTag ? selectedTag.name : 'All Tags'}
            </Button>
            {showTagDropdown && (
              <>
                <div
                  className="fixed inset-0 z-10"
                  onClick={() => setShowTagDropdown(false)}
                />
                <div className="absolute top-full left-0 mt-1 z-20 w-48 rounded-xl border border-slate-200 bg-white shadow-xl max-h-60 overflow-y-auto">
                  <button
                    onClick={() => {
                      setSelectedTagId(undefined);
                      setShowTagDropdown(false);
                      setPage(1);
                    }}
                    className="w-full px-4 py-2.5 text-left text-sm hover:bg-slate-50 font-medium"
                  >
                    All Tags
                  </button>
                  {allTags?.map((tag: Tag) => (
                    <button
                      key={tag.id}
                      onClick={() => {
                        setSelectedTagId(tag.id);
                        setShowTagDropdown(false);
                        setPage(1);
                      }}
                      className={`w-full px-4 py-2.5 text-left text-sm hover:bg-slate-50 ${
                        selectedTagId === tag.id
                          ? 'text-indigo-600 font-semibold'
                          : 'text-slate-700'
                      }`}
                    >
                      {tag.name}
                    </button>
                  ))}
                </div>
              </>
            )}
          </div>

          {selectedTagId && (
            <button
              onClick={() => {
                setSelectedTagId(undefined);
                setPage(1);
              }}
              className="flex items-center gap-1 text-xs text-slate-500 hover:text-slate-700"
            >
              <X className="h-3 w-3" /> Clear
            </button>
          )}
        </div>
        <p className="text-sm text-slate-400 font-medium">
          {banks?.total ?? 0} results
        </p>
      </div>

      {banksError ? (
        <div className="flex flex-col items-center justify-center rounded-3xl border-2 border-rose-200 bg-rose-50 p-16 text-center">
          <AlertCircle className="h-12 w-12 text-rose-300 mb-4" />
          <h3 className="text-lg font-semibold text-slate-700">
            Không thể tải dữ liệu
          </h3>
          <p className="text-slate-500 text-sm mt-1">
            {(banksError as Error)?.message || 'Vui lòng thử lại sau.'}
          </p>
        </div>
      ) : isLoading ? (
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <div
              key={i}
              className="h-64 animate-pulse rounded-3xl bg-slate-100"
            />
          ))}
        </div>
      ) : banks?.data?.length ? (
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {banks.data.map((bank: QuestionBank) => {
            const isOwner = user?.id === bank.uploaderId;
            const initials = bank.uploaderName
              ? getInitials(bank.uploaderName)
              : 'U';

            return (
              <div
                key={bank.id}
                className="group flex flex-col rounded-3xl border border-slate-100 bg-white p-2 shadow-sm transition hover:shadow-xl hover:-translate-y-1 overflow-hidden"
              >
                <div className="aspect-[16/10] bg-gradient-to-br from-slate-50 to-indigo-50 rounded-2xl flex items-center justify-center relative">
                  <BookOpen className="h-10 w-10 text-indigo-200" />
                </div>
                <div className="p-4 flex-1 flex flex-col">
                  <h3 className="font-bold text-slate-900 text-base line-clamp-1">
                    {bank.title}
                  </h3>
                  <div className="mt-2 flex items-center gap-4 text-xs text-slate-400 font-medium">
                    <span className="flex items-center gap-1">
                      <Clock className="h-3 w-3" />
                      {bank.lastUploadedAt
                        ? timeAgo(bank.lastUploadedAt)
                        : 'Recent'}
                    </span>
                    <span>{bank.totalQuestions} questions</span>
                  </div>
                  <p className="mt-3 text-sm text-slate-500 line-clamp-2 flex-1">
                    {bank.description ||
                      'Build your foundational and advanced knowledge through this question set.'}
                  </p>
                  <div className="mt-4 pt-4 border-t border-slate-50 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="h-6 w-6 rounded-full bg-indigo-100 flex items-center justify-center text-[10px] text-indigo-600 font-bold">
                        {initials}
                      </div>
                    </div>
                    {isOwner ? (
                      <Link href={`/my-banks/${bank.id}`}>
                        <Button size="sm" variant="secondary">
                          Manage
                        </Button>
                      </Link>
                    ) : (
                      <Button
                        size="sm"
                        isLoading={studyingId === bank.id}
                        onClick={() => handleStudy(bank)}
                      >
                        Study
                      </Button>
                    )}
                  </div>
                  {bank.tags && bank.tags.length > 0 && (
                    <div className="mt-3 flex flex-wrap gap-1.5">
                      {bank.tags.map((tag) => (
                        <span
                          key={tag.id}
                          className="px-2 py-0.5 text-[10px] font-medium text-indigo-600 bg-indigo-50 rounded-full"
                        >
                          {tag.name}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center rounded-3xl border-2 border-dashed border-slate-200 bg-white p-16 text-center">
          <BookOpen className="h-12 w-12 text-slate-300 mb-4" />
          <h3 className="text-lg font-semibold text-slate-900">
            No approved question banks
          </h3>
          <p className="mt-2 text-slate-500 max-w-sm text-sm">
            No public question banks match your search. Try adjusting your
            filters or check back later.
          </p>
        </div>
      )}

      {totalPages > 1 && (
        <div className="flex items-center justify-between pt-2">
          <Button
            variant="secondary"
            size="sm"
            disabled={page <= 1}
            onClick={() => setPage((p) => p - 1)}
          >
            ← Previous
          </Button>
          <span className="text-sm text-slate-500">
            Page {page} / {totalPages}
          </span>
          <Button
            variant="secondary"
            size="sm"
            disabled={page >= totalPages}
            onClick={() => setPage((p) => p + 1)}
          >
            Next →
          </Button>
        </div>
      )}
    </div>
  );
}
