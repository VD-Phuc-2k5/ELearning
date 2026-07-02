'use client';

import { Save, X } from 'lucide-react';
import { Button } from '../../../../../components/ui';

interface ForumDescriptionProps {
  description?: string;
  isOwner: boolean;
  editing: boolean;
  editValue: string;
  onEditChange: (v: string) => void;
  onStartEdit: () => void;
  onCancelEdit: () => void;
  onSave: () => void;
  isSaving: boolean;
}

export function ForumDescription({
  description,
  isOwner,
  editing,
  editValue,
  onEditChange,
  onStartEdit,
  onCancelEdit,
  onSave,
  isSaving,
}: ForumDescriptionProps) {
  if (editing) {
    return (
      <div className="flex items-start gap-2">
        <textarea
          value={editValue}
          onChange={(e) => onEditChange(e.target.value)}
          rows={3}
          className="flex-1 rounded-xl border border-slate-200 px-3 py-2 text-sm focus:outline-indigo-600"
          placeholder="Description"
        />
        <div className="flex gap-1.5 pt-1">
          <Button size="sm" onClick={onSave} isLoading={isSaving}>
            <Save className="h-3.5 w-3.5" />
          </Button>
          <Button size="sm" variant="secondary" onClick={onCancelEdit}>
            <X className="h-3.5 w-3.5" />
          </Button>
        </div>
      </div>
    );
  }

  return (
    <p
      className="text-sm text-slate-500 cursor-pointer hover:text-slate-700 transition"
      onDoubleClick={isOwner ? onStartEdit : undefined}
      title={isOwner ? 'Double-click to edit' : undefined}
    >
      {description ?? 'No description'}
    </p>
  );
}
