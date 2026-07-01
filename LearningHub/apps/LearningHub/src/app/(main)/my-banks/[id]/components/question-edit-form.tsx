'use client';

import { Save, X } from 'lucide-react';
import { Button } from '../../../../../components/ui';

interface Option {
  id: string;
  optionLabel: string;
  content: string;
}

interface QuestionEditFormProps {
  questionId: string;
  content: string;
  explanation: string;
  options: Option[];
  correctLabels: string[];
  isSaving: boolean;
  onContentChange: (v: string) => void;
  onExplanationChange: (v: string) => void;
  onOptionContentChange: (index: number, value: string) => void;
  onCorrectLabelChange: (label: string) => void;
  onSave: () => void;
  onCancel: () => void;
}

export function QuestionEditForm({
  questionId,
  content,
  explanation,
  options,
  correctLabels,
  isSaving,
  onContentChange,
  onExplanationChange,
  onOptionContentChange,
  onCorrectLabelChange,
  onSave,
  onCancel,
}: QuestionEditFormProps) {
  return (
    <div className="flex-1 space-y-3">
      <textarea
        className="w-full rounded-xl border border-slate-200 px-3 py-2 text-sm focus:border-indigo-500 focus:ring-4 focus:ring-indigo-100 outline-none resize-none"
        rows={3}
        value={content}
        onChange={(e) => onContentChange(e.target.value)}
      />
      <div>
        <p className="text-xs font-semibold text-slate-500 mb-1">Giải thích</p>
        <textarea
          className="w-full rounded-xl border border-slate-200 px-3 py-2 text-sm focus:border-amber-500 focus:ring-4 focus:ring-amber-100 outline-none resize-none"
          rows={2}
          placeholder="Giải thích đáp án (hỗ trợ Markdown)"
          value={explanation}
          onChange={(e) => onExplanationChange(e.target.value)}
        />
      </div>
      <div className="space-y-2">
        <p className="text-xs font-semibold text-slate-500">Đáp án</p>
        {options.map((opt, oi) => (
          <div key={opt.id} className="flex items-center gap-2">
            <input
              type="radio"
              name={`correct-${questionId}`}
              checked={correctLabels.includes(opt.optionLabel)}
              onChange={() => onCorrectLabelChange(opt.optionLabel)}
              className="accent-emerald-600 shrink-0"
            />
            <span className="h-5 w-5 rounded-full bg-slate-200 text-slate-600 text-xs font-bold flex items-center justify-center shrink-0">
              {opt.optionLabel}
            </span>
            <input
              className="flex-1 text-sm border border-slate-200 rounded-lg px-2 py-1 focus:border-indigo-400 outline-none"
              value={opt.content}
              onChange={(e) => onOptionContentChange(oi, e.target.value)}
            />
          </div>
        ))}
      </div>
      <div className="flex gap-2">
        <Button
          size="sm"
          isLoading={isSaving}
          onClick={onSave}
          icon={<Save className="h-3 w-3" />}
        >
          Save
        </Button>
        <Button size="sm" variant="ghost" onClick={onCancel}>
          <X className="h-3 w-3" />
        </Button>
      </div>
    </div>
  );
}
