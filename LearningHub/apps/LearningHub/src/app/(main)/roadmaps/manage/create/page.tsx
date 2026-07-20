'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useMutation } from '@tanstack/react-query';
import { ArrowLeft } from 'lucide-react';
import { Button, Input } from '../../../../../components/ui';
import { createRoadmap } from '../../../../actions/roadmap.actions';

export default function CreateRoadmapPage() {
  const router = useRouter();
  const [form, setForm] = useState({ title: '', description: '' });

  const create = useMutation({
    mutationFn: async () => {
      const result = await createRoadmap({ ...form });
      if (!result.success) throw new Error(result.message);
      return result.data;
    },
    onSuccess: (r) => router.push(`/roadmaps/manage/${r.id}`),
  });

  return (
    <div className="max-w-xl mx-auto space-y-6">
      <div className="flex items-center gap-3">
        <button
          onClick={() => router.back()}
          className="p-2 rounded-xl hover:bg-slate-100 transition"
        >
          <ArrowLeft className="h-4 w-4 text-slate-600" />
        </button>
        <h1 className="text-xl font-bold text-slate-900">Create Roadmap</h1>
      </div>

      <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6 space-y-4">
        <div>
          <label className="block text-sm font-semibold text-slate-700 mb-1.5">
            Title *
          </label>
          <Input
            placeholder="e.g. Backend Developer"
            value={form.title}
            onChange={(e) => setForm((p) => ({ ...p, title: e.target.value }))}
          />
        </div>
        <div>
          <label className="block text-sm font-semibold text-slate-700 mb-1.5">
            Description
          </label>
          <textarea
            className="w-full rounded-xl border border-slate-200 px-3 py-2.5 text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 resize-none"
            rows={3}
            placeholder="What will learners achieve?"
            value={form.description}
            onChange={(e) =>
              setForm((p) => ({ ...p, description: e.target.value }))
            }
          />
        </div>
        <div className="flex gap-3 pt-2">
          <Button variant="secondary" onClick={() => router.back()}>
            Cancel
          </Button>
          <Button
            onClick={() => create.mutate()}
            isLoading={create.isPending}
            disabled={!form.title.trim()}
          >
            Create & Add Banks →
          </Button>
        </div>
      </div>
    </div>
  );
}
