'use client';

import { Save, X } from 'lucide-react';
import type { ForumRule } from '@learning-hub/domain';
import { Button, Input } from '../../../../../components/ui';

interface ForumRulesSectionProps {
  rules: ForumRule[];
  isOwner: boolean;
  editing: boolean;
  draft: Array<{ title: string; body: string }>;
  onEditRules: () => void;
  onDraftChange: (draft: Array<{ title: string; body: string }>) => void;
  onSave: () => void;
  saving: boolean;
  onCancel: () => void;
}

export function ForumRulesSection({
  rules,
  isOwner,
  editing,
  draft,
  onEditRules,
  onDraftChange,
  onSave,
  saving,
  onCancel,
}: ForumRulesSectionProps) {
  return (
    <div className="rounded-2xl border border-slate-100 bg-white p-4 shadow-sm">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-semibold text-slate-900">Rules</h3>
        {isOwner && !editing && (
          <button
            type="button"
            onClick={onEditRules}
            className="text-xs text-indigo-600 hover:text-indigo-700"
          >
            Edit
          </button>
        )}
      </div>

      {editing ? (
        <div className="mt-2 space-y-3">
          {draft.map((r, i) => (
            <div key={i} className="space-y-1">
              <Input
                value={r.title}
                onChange={(e) => {
                  const next = [...draft];
                  next[i] = { ...next[i], title: e.target.value };
                  onDraftChange(next);
                }}
                placeholder="Rule title"
              />
              <textarea
                value={r.body}
                onChange={(e) => {
                  const next = [...draft];
                  next[i] = { ...next[i], body: e.target.value };
                  onDraftChange(next);
                }}
                rows={2}
                className="w-full rounded-lg border border-slate-200 px-2 py-1 text-xs focus:outline-indigo-600"
                placeholder="Rule description"
              />
              <button
                type="button"
                onClick={() => onDraftChange(draft.filter((_, j) => j !== i))}
                className="text-[10px] text-red-500 hover:text-red-700"
              >
                Remove
              </button>
            </div>
          ))}
          <button
            type="button"
            onClick={() => onDraftChange([...draft, { title: '', body: '' }])}
            className="text-xs text-indigo-600 hover:text-indigo-700"
          >
            + Add rule
          </button>
          <div className="flex gap-2 pt-1">
            <Button
              size="md"
              className="flex-1"
              onClick={onSave}
              isLoading={saving}
            >
              <Save className="h-3.5 w-full mr-1" /> Save
            </Button>
            <Button
              size="md"
              variant="secondary"
              className="flex-1"
              onClick={onCancel}
            >
              <X className="h-3.5 w-full mr-1" /> Cancel
            </Button>
          </div>
        </div>
      ) : !rules.length ? (
        <p className="mt-2 text-xs text-slate-400">No rules posted.</p>
      ) : (
        <ol className="mt-2 space-y-2">
          {rules.map((r, i) => (
            <li key={r.id} className="text-sm">
              <p className="font-medium text-slate-700">
                {i + 1}. {r.title}
              </p>
              <p className="text-xs text-slate-500">{r.body}</p>
            </li>
          ))}
        </ol>
      )}
    </div>
  );
}
