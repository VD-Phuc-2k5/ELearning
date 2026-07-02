'use client';

import type { RefObject } from 'react';
import { Save, X } from 'lucide-react';
import type { ForumTag } from '@learning-hub/domain';
import { Button, Input, TiptapEditor } from '../../../../../components/ui';
import type { TiptapEditorHandle } from '../../../../../components/ui/tiptap-editor';

interface PostEditFormProps {
  title: string;
  onTitleChange: (v: string) => void;
  content: Record<string, unknown> | null;
  onContentChange: (json: Record<string, unknown>) => void;
  editorRef: RefObject<TiptapEditorHandle | null>;
  tags: ForumTag[];
  selectedTagIds: Set<number>;
  onToggleTag: (tagId: number) => void;
  isSaving: boolean;
  onSave: () => void;
  onCancel: () => void;
  forumId: string;
}

export function PostEditForm({
  title,
  onTitleChange,
  content,
  onContentChange,
  editorRef,
  tags,
  selectedTagIds,
  onToggleTag,
  isSaving,
  onSave,
  onCancel,
  forumId,
}: PostEditFormProps) {
  return (
    <div className="p-5 space-y-4">
      <Input
        value={title}
        onChange={(e) => onTitleChange(e.target.value)}
        placeholder="Post title"
        className="text-lg font-bold"
      />
      <TiptapEditor
        ref={editorRef}
        content={content ?? undefined}
        onChange={(json) => onContentChange(json)}
        placeholder="Edit your post..."
        forumId={forumId}
      />
      {tags.length > 0 && (
        <div className="space-y-1.5">
          <span className="block text-sm font-medium text-slate-700">Tags</span>
          <div className="flex flex-wrap gap-2">
            {tags.map((t) => (
              <button
                key={t.id}
                type="button"
                onClick={() => onToggleTag(t.id)}
                className={`rounded-full px-3 py-1 text-xs font-medium border transition ${
                  selectedTagIds.has(t.id)
                    ? 'text-white border-transparent'
                    : 'text-slate-600 border-slate-200 hover:border-slate-300'
                }`}
                style={
                  selectedTagIds.has(t.id)
                    ? { backgroundColor: t.color ?? '#3b82f6' }
                    : { backgroundColor: t.color ? `${t.color}15` : '#f8fafc' }
                }
              >
                {t.name}
              </button>
            ))}
          </div>
        </div>
      )}
      <div className="flex gap-2">
        <Button
          onClick={onSave}
          isLoading={isSaving}
          disabled={!title.trim()}
          icon={<Save className="h-4 w-4" />}
        >
          Save
        </Button>
        <Button variant="secondary" onClick={onCancel}>
          <X className="h-4 w-full" /> Cancel
        </Button>
      </div>
    </div>
  );
}
