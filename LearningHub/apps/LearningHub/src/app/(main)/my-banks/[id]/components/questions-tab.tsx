'use client';

import { BookOpen } from 'lucide-react';
import type { Question } from '@learning-hub/domain';
import { QuestionCard } from './question-card';

interface QuestionsTabProps {
  questions: Question[];
  isLoading: boolean;
  onDeleted: () => void;
  onUpdated: () => void;
}

export function QuestionsTab({
  questions,
  isLoading,
  onDeleted,
  onUpdated,
}: QuestionsTabProps) {
  if (isLoading) {
    return (
      <div className="space-y-3">
        {[1, 2, 3].map((i) => (
          <div key={i} className="h-16 animate-pulse bg-slate-100 rounded-xl" />
        ))}
      </div>
    );
  }
  if (!questions.length) {
    return (
      <div className="flex flex-col items-center py-12 text-center text-slate-500">
        <BookOpen className="h-10 w-10 mb-3 text-slate-300" />
        <p className="font-medium">No questions yet</p>
        <p className="text-sm mt-1">
          Switch to the &quot;Import Excel&quot; tab to add questions.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      <p className="text-sm text-slate-500 font-medium">
        {questions.length} questions
      </p>
      {questions.map((q, idx) => (
        <QuestionCard
          key={q.id}
          question={q}
          index={idx}
          onDeleted={onDeleted}
          onUpdated={onUpdated}
        />
      ))}
    </div>
  );
}
