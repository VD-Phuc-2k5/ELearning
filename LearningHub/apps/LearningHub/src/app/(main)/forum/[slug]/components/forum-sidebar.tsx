'use client';

import { Users, BookOpen, Trash2 } from 'lucide-react';
import type { ForumTag } from '@learning-hub/domain';
import { Button } from '../../../../../components/ui';
import { ForumRulesSection } from './forum-rules-section';
import type { ForumRule } from '@learning-hub/domain';

interface ForumSidebarProps {
  memberCount: number;
  postCount: number;
  rules: ForumRule[];
  isOwner: boolean;
  isMember: boolean;
  onEditRules: () => void;
  editingRules: boolean;
  rulesDraft: Array<{ title: string; body: string }>;
  setRulesDraft: (r: Array<{ title: string; body: string }>) => void;
  onSaveRules: () => void;
  saving: boolean;
  onCancelRules: () => void;
  tags: ForumTag[];
  showTagManager: boolean;
  setShowTagManager: (v: boolean) => void;
  newTagName: string;
  setNewTagName: (v: string) => void;
  newTagColor: string;
  setNewTagColor: (v: string) => void;
  onCreateTag: () => void;
  creatingTag: boolean;
  onDeleteTag: (id: number) => void;
}

export function ForumSidebar({
  memberCount,
  postCount,
  rules,
  isOwner,
  isMember,
  onEditRules,
  editingRules,
  rulesDraft,
  setRulesDraft,
  onSaveRules,
  saving,
  onCancelRules,
  tags,
  showTagManager,
  setShowTagManager,
  newTagName,
  setNewTagName,
  newTagColor,
  setNewTagColor,
  onCreateTag,
  creatingTag,
  onDeleteTag,
}: ForumSidebarProps) {
  return (
    <aside className="space-y-4">
      <div className="rounded-2xl border border-slate-100 bg-white p-4 shadow-sm">
        <h3 className="text-sm font-semibold text-slate-900">Stats</h3>
        <ul className="mt-2 space-y-1.5 text-sm text-slate-600">
          <li className="flex items-center justify-between">
            <span className="inline-flex items-center gap-2">
              <Users className="h-4 w-4 text-slate-400" /> Members
            </span>
            <span className="font-medium">{memberCount}</span>
          </li>
          <li className="flex items-center justify-between">
            <span className="inline-flex items-center gap-2">
              <BookOpen className="h-4 w-4 text-slate-400" /> Posts
            </span>
            <span className="font-medium">{postCount}</span>
          </li>
        </ul>
      </div>

      {isMember && (
        <div className="rounded-2xl border border-slate-100 bg-white p-4 shadow-sm">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-semibold text-slate-900">Tags</h3>
            <button
              type="button"
              onClick={() => setShowTagManager(!showTagManager)}
              className="text-xs text-indigo-600 hover:text-indigo-700"
            >
              {showTagManager ? 'Close' : 'Manage'}
            </button>
          </div>
          {tags.length === 0 && !showTagManager ? (
            <p className="mt-2 text-xs text-slate-400">No tags yet.</p>
          ) : (
            <div className="mt-2 flex flex-wrap gap-1">
              {tags.map((t) => (
                <span
                  key={t.id}
                  className="inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-medium"
                  style={{
                    backgroundColor: t.color ? `${t.color}20` : '#f1f5f9',
                    color: '#111111',
                  }}
                >
                  {t.name}
                </span>
              ))}
            </div>
          )}
          {showTagManager && (
            <div className="mt-3 space-y-2 border-t border-slate-50 pt-3">
              <div className="flex gap-2">
                <input
                  value={newTagName}
                  onChange={(e) => setNewTagName(e.target.value)}
                  placeholder="Tag name"
                  className="flex-1 rounded-lg border border-slate-200 px-2 py-1 text-xs focus:outline-indigo-600"
                />
                <input
                  type="color"
                  value={newTagColor}
                  onChange={(e) => setNewTagColor(e.target.value)}
                  className="h-7 w-7 cursor-pointer rounded border border-slate-200"
                />
                <Button
                  size="sm"
                  onClick={onCreateTag}
                  isLoading={creatingTag}
                  disabled={!newTagName.trim()}
                >
                  Add
                </Button>
              </div>
              {tags.length > 0 && (
                <div className="space-y-1 max-h-32 overflow-y-auto">
                  {tags.map((t) => (
                    <div
                      key={t.id}
                      className="flex items-center justify-between rounded-lg bg-slate-50 px-2 py-1"
                    >
                      <div className="flex items-center gap-1.5">
                        <span
                          className="h-2.5 w-2.5 rounded-full"
                          style={{ backgroundColor: t.color ?? '#64748b' }}
                        />
                        <span className="text-xs text-slate-700">{t.name}</span>
                      </div>
                      <button
                        type="button"
                        onClick={() => onDeleteTag(t.id)}
                        className="text-slate-300 hover:text-red-500 transition"
                      >
                        <Trash2 className="h-3 w-3" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      )}
      <ForumRulesSection
        rules={rules}
        isOwner={isOwner}
        editing={editingRules}
        draft={rulesDraft}
        onEditRules={onEditRules}
        onDraftChange={setRulesDraft}
        onSave={onSaveRules}
        saving={saving}
        onCancel={onCancelRules}
      />
    </aside>
  );
}
