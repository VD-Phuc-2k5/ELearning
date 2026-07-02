'use client';

import type { RefObject } from 'react';
import Link from 'next/link';
import { Plus, Lock, Save, X, Shield, Trash2 } from 'lucide-react';
import type { ForumDetail } from '@learning-hub/domain';
import { Button, Input } from '../../../../../components/ui';
import { ForumIconManager } from './forum-icon-manager';
import { ForumVisibilityControl } from './forum-visibility-control';
import { ForumDescription } from './forum-description';

const ROLE_LABEL: Record<string, string> = {
  owner: 'Owner',
  moderator: 'Moderator',
  member: 'Member',
};

const ROLE_COLOR: Record<string, string> = {
  owner: 'bg-indigo-50 text-indigo-700',
  moderator: 'bg-emerald-50 text-emerald-700',
  member: 'bg-slate-100 text-slate-600',
};

interface ForumHeaderProps {
  forum: ForumDetail;
  memberRole?: string;
  slug: string;
  editingName: boolean;
  editName: string;
  onEditNameChange: (v: string) => void;
  onStartEditName: () => void;
  onCancelEditName: () => void;
  editingDesc: boolean;
  editDesc: string;
  onEditDescChange: (v: string) => void;
  onStartEditDesc: () => void;
  onCancelEditDesc: () => void;
  isSaving: boolean;
  onSave: () => void;
  iconInputRef: RefObject<HTMLInputElement | null>;
  isUploadingIcon: boolean;
  onUploadIcon: (file: File) => void;
  isRemovingIcon: boolean;
  onRemoveIcon: () => void;
  showVisDropdown: boolean;
  visDropdownRef: RefObject<HTMLDivElement | null>;
  onToggleVisDropdown: () => void;
  onChangeVisibility: (vis: 'public' | 'private') => void;
  isChangingVis: boolean;
  isJoining: boolean;
  isLeaving: boolean;
  onJoin: () => void;
  onLeave: () => void;
  isDeletingForum: boolean;
  onDeleteForum: () => void;
}

export function ForumHeader({
  forum,
  memberRole,
  slug,
  editingName,
  editName,
  onEditNameChange,
  onStartEditName,
  onCancelEditName,
  editingDesc,
  editDesc,
  onEditDescChange,
  onStartEditDesc,
  onCancelEditDesc,
  isSaving,
  onSave,
  iconInputRef,
  isUploadingIcon,
  onUploadIcon,
  isRemovingIcon,
  onRemoveIcon,
  showVisDropdown,
  visDropdownRef,
  onToggleVisDropdown,
  onChangeVisibility,
  isChangingVis,
  isJoining,
  isLeaving,
  onJoin,
  onLeave,
  isDeletingForum,
  onDeleteForum,
}: ForumHeaderProps) {
  return (
    <div className="p-6">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0 flex-1 space-y-2">
          <div className="flex items-center gap-2">
            {memberRole === 'owner' ? (
              <ForumIconManager
                iconUrl={forum.iconUrl ?? undefined}
                inputRef={iconInputRef}
                isUploading={isUploadingIcon}
                isRemoving={isRemovingIcon}
                onUpload={onUploadIcon}
                onRemove={onRemoveIcon}
              />
            ) : forum.iconUrl ? (
              <img
                src={forum.iconUrl}
                alt="Forum icon"
                className="h-10 w-10 rounded-xl object-cover shrink-0"
              />
            ) : null}
            {editingName ? (
              <div className="flex-1 flex items-center gap-2">
                <Input
                  value={editName}
                  onChange={(e) => onEditNameChange(e.target.value)}
                  placeholder="Forum name"
                  className="text-2xl font-bold"
                />
                <Button
                  size="sm"
                  onClick={onSave}
                  isLoading={isSaving}
                  disabled={!editName.trim()}
                >
                  <Save className="h-3.5 w-3.5" />
                </Button>
                <Button
                  size="sm"
                  variant="secondary"
                  onClick={onCancelEditName}
                >
                  <X className="h-3.5 w-3.5" />
                </Button>
              </div>
            ) : (
              <h1
                className="text-2xl font-bold text-slate-900 truncate cursor-pointer hover:text-indigo-600 transition"
                onDoubleClick={
                  memberRole === 'owner' ? onStartEditName : undefined
                }
                title={
                  memberRole === 'owner' ? 'Double-click to edit' : undefined
                }
              >
                {forum.name}
              </h1>
            )}
            <ForumVisibilityControl
              currentVis={forum.visibility}
              isOwner={memberRole === 'owner'}
              showDropdown={showVisDropdown}
              dropdownRef={visDropdownRef}
              onToggle={onToggleVisDropdown}
              onChange={onChangeVisibility}
              isPending={isChangingVis}
            />
            {forum.isLocked && (
              <span className="inline-flex items-center gap-1 rounded-md bg-slate-100 px-2 py-0.5 text-xs text-slate-500 shrink-0">
                <Lock className="h-3.5 w-3.5" /> Locked
              </span>
            )}
            {memberRole && (
              <span
                className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-medium uppercase shrink-0 ${ROLE_COLOR[memberRole] ?? 'bg-slate-100 text-slate-600'}`}
              >
                <Shield className="h-3 w-3" />
                {ROLE_LABEL[memberRole] ?? memberRole}
              </span>
            )}
          </div>

          <ForumDescription
            description={forum.description ?? undefined}
            isOwner={memberRole === 'owner'}
            editing={editingDesc}
            editValue={editDesc}
            onEditChange={onEditDescChange}
            onStartEdit={onStartEditDesc}
            onCancelEdit={onCancelEditDesc}
            onSave={onSave}
            isSaving={isSaving}
          />
        </div>
        <div className="flex gap-2 shrink-0">
          {memberRole ? (
            <>
              <Link href={`/forum/${slug}/new-post`}>
                <Button
                  size="sm"
                  icon={<Plus className="h-4 w-4" />}
                  disabled={forum.isLocked}
                >
                  New Post
                </Button>
              </Link>
              {memberRole !== 'owner' && (
                <Button
                  size="sm"
                  variant="secondary"
                  isLoading={isLeaving}
                  onClick={onLeave}
                >
                  Leave
                </Button>
              )}
              {memberRole === 'owner' && (
                <Button
                  size="sm"
                  variant="secondary"
                  className="text-red-600 border-red-200 hover:bg-red-50 hover:text-red-700"
                  isLoading={isDeletingForum}
                  onClick={onDeleteForum}
                  icon={<Trash2 className="h-3.5 w-3.5" />}
                >
                  Delete
                </Button>
              )}
            </>
          ) : (
            <Button
              size="sm"
              isLoading={isJoining}
              onClick={onJoin}
              disabled={forum.isLocked}
            >
              Join
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}
