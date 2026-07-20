'use client';

import { useState } from 'react';
import { AlertTriangle } from 'lucide-react';
import { Button } from '../../../../../components/ui';
import { MODERATION_REASONS } from '@learning-hub/domain';

interface ReportDialogProps {
  targetType: 'post' | 'comment';
  targetTitle: string;
  isSubmitting: boolean;
  onSubmit: (reason: string, description?: string) => void;
  onCancel: () => void;
  error?: string | null;
}

export function ReportDialog({
  targetType,
  targetTitle,
  isSubmitting,
  onSubmit,
  onCancel,
  error,
}: ReportDialogProps) {
  const [reason, setReason] = useState('');
  const [description, setDescription] = useState('');

  const reasonLabels: Record<string, string> = {
    SPAM: 'Spam',
    INAPPROPRIATE_CONTENT: 'Inappropriate content',
    HARASSMENT: 'Harassment',
    COPYRIGHT: 'Copyright violation',
    MISLEADING: 'Misleading information',
    OTHER: 'Other',
  };

  const handleSubmit = () => {
    if (!reason) return;
    onSubmit(reason, description || undefined);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30">
      <div className="rounded-2xl bg-white p-6 shadow-xl max-w-sm w-full mx-4 space-y-4">
        <div className="flex items-center gap-2">
          <AlertTriangle className="h-5 w-5 text-amber-500" />
          <h3 className="text-lg font-semibold text-slate-900">
            Report {targetType}
          </h3>
        </div>
        <p className="text-sm text-slate-600 break-words">
          &ldquo;{targetTitle}&rdquo;
        </p>
        {error && (
          <p className="text-sm text-red-600 bg-red-50 rounded-lg px-3 py-2">
            {error}
          </p>
        )}
        <div className="space-y-2">
          <label className="text-xs font-medium text-slate-600">Reason</label>
          <div className="space-y-1">
            {MODERATION_REASONS.map((r) => (
              <label
                key={r}
                className={`flex items-center gap-2 rounded-lg border px-3 py-2 cursor-pointer text-sm transition ${
                  reason === r
                    ? 'border-indigo-400 bg-indigo-50 text-indigo-700'
                    : 'border-slate-200 text-slate-600 hover:border-slate-300'
                }`}
              >
                <input
                  type="radio"
                  name="reportReason"
                  value={r}
                  checked={reason === r}
                  onChange={() => setReason(r)}
                  className="sr-only"
                />
                <span
                  className={`h-3.5 w-3.5 rounded-full border-2 flex items-center justify-center shrink-0 ${
                    reason === r ? 'border-indigo-500' : 'border-slate-300'
                  }`}
                >
                  {reason === r && (
                    <span className="h-2 w-2 rounded-full bg-indigo-500" />
                  )}
                </span>
                {reasonLabels[r]}
              </label>
            ))}
          </div>
        </div>
        <div className="space-y-1">
          <label className="text-xs font-medium text-slate-600">
            Description (optional)
          </label>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            className="w-full rounded-xl border border-slate-200 px-3 py-2 text-sm text-slate-700 placeholder:text-slate-400 focus:outline-none focus:border-indigo-400 resize-none"
            rows={3}
            placeholder="Additional details..."
          />
        </div>
        <div className="flex justify-end gap-2">
          <Button
            variant="secondary"
            onClick={onCancel}
            disabled={isSubmitting}
          >
            Cancel
          </Button>
          <Button
            onClick={handleSubmit}
            disabled={!reason}
            isLoading={isSubmitting}
          >
            Submit Report
          </Button>
        </div>
      </div>
    </div>
  );
}
