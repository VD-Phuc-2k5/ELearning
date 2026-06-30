'use client';

import { useState } from 'react';
import { useMutation } from '@tanstack/react-query';
import {
  BookOpen,
  Edit3,
  Trash2,
  ChevronDown,
  ChevronUp,
  Save,
  X,
  Lightbulb,
} from 'lucide-react';
import { clsx } from 'clsx';
import { Button, useConfirmModal } from '../../../../../components/ui';
import {
  deleteQuestion,
  updateQuestion,
} from '../../../../actions/quiz.actions';
import type { Question } from '@learning-hub/domain';

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
          Switch to the "Import Excel" tab to add questions.
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

interface QuestionCardProps {
  question: Question;
  index: number;
  onDeleted: () => void;
  onUpdated: () => void;
}

function QuestionCard({
  question,
  index,
  onDeleted,
  onUpdated,
}: QuestionCardProps) {
  const [expanded, setExpanded] = useState(false);
  const [editing, setEditing] = useState(false);
  const { modal: confirmModal, openConfirm } = useConfirmModal();
  const [content, setContent] = useState(question.content);
  const [options, setOptions] = useState(() =>
    [...question.answerOptions]
      .sort((a, b) => a.optionLabel.localeCompare(b.optionLabel))
      .map((o) => ({ ...o })),
  );
  const [correctLabels, setCorrectLabels] = useState<string[]>(() =>
    question.answerOptions
      .filter((o) => question.correctAnswerOptionIds?.includes(o.id))
      .map((o) => o.optionLabel),
  );
  const [explanation, setExplanation] = useState(question.explanation ?? '');

  const deleteMutation = useMutation({
    mutationFn: () => deleteQuestion(question.id),
    onSuccess: onDeleted,
  });

  const updateMutation = useMutation({
    mutationFn: () =>
      updateQuestion(question.id, {
        content,
        explanation,
        answerOptions: options.map((o) => ({
          optionLabel: o.optionLabel,
          content: o.content,
        })),
        correctOptionLabels: correctLabels,
      }),
    onSuccess: () => {
      setEditing(false);
      onUpdated();
    },
    onError: (err) => {
      console.error('Update question failed:', err);
    },
  });

  const cancelEdit = () => {
    setEditing(false);
    setContent(question.content);
    setExplanation(question.explanation ?? '');
    setOptions(question.answerOptions.map((o) => ({ ...o })));
    setCorrectLabels(
      question.answerOptions
        .filter((o) => question.correctAnswerOptionIds?.includes(o.id))
        .map((o) => o.optionLabel),
    );
  };

  return (
    <div className="rounded-2xl border border-slate-100 bg-slate-50/50">
      <div className="flex items-start gap-3 p-4">
        <span className="shrink-0 mt-0.5 h-6 w-6 rounded-full bg-indigo-100 text-indigo-700 text-xs font-bold flex items-center justify-center">
          {index + 1}
        </span>
        {editing ? (
          <div className="flex-1 space-y-3">
            <textarea
              className="w-full rounded-xl border border-slate-200 px-3 py-2 text-sm focus:border-indigo-500 focus:ring-4 focus:ring-indigo-100 outline-none resize-none"
              rows={3}
              value={content}
              onChange={(e) => setContent(e.target.value)}
            />
            <div>
              <p className="text-xs font-semibold text-slate-500 mb-1">
                Giải thích
              </p>
              <textarea
                className="w-full rounded-xl border border-slate-200 px-3 py-2 text-sm focus:border-amber-500 focus:ring-4 focus:ring-amber-100 outline-none resize-none"
                rows={2}
                placeholder="Giải thích đáp án (hỗ trợ Markdown)"
                value={explanation}
                onChange={(e) => setExplanation(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <p className="text-xs font-semibold text-slate-500">Đáp án</p>
              {options.map((opt, oi) => (
                <div key={opt.id} className="flex items-center gap-2">
                  <input
                    type="radio"
                    name={`correct-${question.id}`}
                    checked={correctLabels.includes(opt.optionLabel)}
                    onChange={() => setCorrectLabels([opt.optionLabel])}
                    className="accent-emerald-600 shrink-0"
                  />
                  <span className="h-5 w-5 rounded-full bg-slate-200 text-slate-600 text-xs font-bold flex items-center justify-center shrink-0">
                    {opt.optionLabel}
                  </span>
                  <input
                    className="flex-1 text-sm border border-slate-200 rounded-lg px-2 py-1 focus:border-indigo-400 outline-none"
                    value={opt.content}
                    onChange={(e) =>
                      setOptions((prev) =>
                        prev.map((o, idx) =>
                          idx === oi ? { ...o, content: e.target.value } : o,
                        ),
                      )
                    }
                  />
                </div>
              ))}
            </div>
            <div className="flex gap-2">
              <Button
                size="sm"
                isLoading={updateMutation.isPending}
                onClick={() => updateMutation.mutate()}
                icon={<Save className="h-3 w-3" />}
              >
                Save
              </Button>
              <Button size="sm" variant="ghost" onClick={cancelEdit}>
                <X className="h-3 w-3" />
              </Button>
            </div>
          </div>
        ) : (
          <p className="flex-1 text-sm text-slate-800 leading-relaxed">
            {question.content}
          </p>
        )}
        <div className="flex items-center gap-1 shrink-0">
          {!editing && (
            <button
              onClick={() => setEditing(true)}
              className="p-1.5 text-slate-400 hover:text-indigo-600 transition rounded-lg hover:bg-indigo-50"
            >
              <Edit3 className="h-4 w-4" />
            </button>
          )}
          <button
            onClick={() =>
              openConfirm('Delete this question?', () =>
                deleteMutation.mutate(),
              )
            }
            disabled={deleteMutation.isPending}
            className="p-1.5 text-slate-400 hover:text-red-600 transition rounded-lg hover:bg-red-50"
          >
            <Trash2 className="h-4 w-4" />
          </button>
          {!editing && (
            <button
              onClick={() => setExpanded((v) => !v)}
              className="p-1.5 text-slate-400 hover:text-slate-700 transition rounded-lg hover:bg-slate-100"
            >
              {expanded ? (
                <ChevronUp className="h-4 w-4" />
              ) : (
                <ChevronDown className="h-4 w-4" />
              )}
            </button>
          )}
        </div>
      </div>
      {!editing && expanded && (
        <div className="px-4 pb-4 border-t border-slate-100 pt-3 space-y-3">
          {question.answerOptions.length > 0 && (
            <div className="grid gap-1.5">
              {[...question.answerOptions]
                .sort((a, b) => a.optionLabel.localeCompare(b.optionLabel))
                .map((opt) => {
                  const isCorrect = question.correctAnswerOptionIds?.includes(
                    opt.id,
                  );
                  return (
                    <div
                      key={opt.id}
                      className={clsx(
                        'flex items-center gap-2 text-sm rounded-lg px-2 py-1.5',
                        isCorrect
                          ? 'bg-emerald-50 border border-emerald-200'
                          : 'border border-transparent',
                      )}
                    >
                      <span
                        className={clsx(
                          'h-6 w-6 rounded-full text-xs font-bold flex items-center justify-center shrink-0',
                          isCorrect
                            ? 'bg-emerald-500 text-white'
                            : 'bg-slate-200 text-slate-600',
                        )}
                      >
                        {opt.optionLabel}
                      </span>
                      <span
                        className={clsx(
                          'flex-1',
                          isCorrect
                            ? 'text-emerald-800 font-medium'
                            : 'text-slate-700',
                        )}
                      >
                        {opt.content}
                      </span>
                      {isCorrect && (
                        <span className="text-xs font-semibold text-emerald-600 bg-emerald-100 rounded-full px-2 py-0.5 shrink-0">
                          Đúng
                        </span>
                      )}
                    </div>
                  );
                })}
            </div>
          )}
          {question.explanation && (
            <div className="flex gap-2 rounded-xl bg-amber-50 border border-amber-200 p-3">
              <Lightbulb className="h-4 w-4 text-amber-500 mt-0.5 shrink-0" />
              <span className="text-sm text-amber-900 whitespace-pre-wrap">
                {question.explanation}
              </span>
            </div>
          )}
        </div>
      )}
      {confirmModal}
    </div>
  );
}
