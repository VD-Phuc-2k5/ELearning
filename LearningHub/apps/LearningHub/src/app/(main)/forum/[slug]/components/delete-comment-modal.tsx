'use client';

import { Trash2 } from 'lucide-react';
import { Button } from '../../../../../components/ui';

interface DeleteCommentModalProps {
  isDeleting: boolean;
  onCancel: () => void;
  onDelete: () => void;
}

export function DeleteCommentModal({
  isDeleting,
  onCancel,
  onDelete,
}: DeleteCommentModalProps) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30">
      <div className="rounded-2xl bg-white p-6 shadow-xl max-w-sm w-full mx-4 space-y-4">
        <h3 className="text-lg font-semibold text-slate-900">Delete Comment</h3>
        <p className="text-sm text-slate-600">
          Are you sure you want to delete this comment? This action cannot be
          undone.
        </p>
        <div className="flex justify-end gap-2">
          <Button variant="secondary" onClick={onCancel} disabled={isDeleting}>
            Cancel
          </Button>
          <Button onClick={onDelete} isLoading={isDeleting}>
            <Trash2 className="h-4 w-full" />
            Delete
          </Button>
        </div>
      </div>
    </div>
  );
}
