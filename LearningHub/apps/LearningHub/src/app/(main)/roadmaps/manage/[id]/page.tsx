'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  DragDropContext,
  Droppable,
  Draggable,
  DropResult,
} from '@hello-pangea/dnd';
import {
  ArrowLeft,
  GripVertical,
  Trash2,
  Plus,
  X,
  AlertCircle,
} from 'lucide-react';
import { Button, Input, useConfirmModal } from '../../../../../components/ui';
import {
  getRoadmapDetail,
  updateRoadmap,
  setRoadmapItems,
  deleteRoadmap,
} from '../../../../actions/roadmap.actions';
import { getBanks } from '../../../../actions/quiz.actions';
import type { QuestionBank } from '@learning-hub/domain';

export default function EditRoadmapPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const qc = useQueryClient();

  const { data, isLoading } = useQuery({
    queryKey: ['roadmap', id],
    queryFn: () => getRoadmapDetail(id),
  });

  const { data: allBanks } = useQuery({
    queryKey: ['banks-picker'],
    queryFn: () => getBanks({ limit: 100, statusId: 'published' }),
  });

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [items, setItems] = useState<
    Array<{ id: string; bankId: string; title: string }>
  >([]);
  const [showPicker, setShowPicker] = useState(false);
  const [pickerSearch, setPickerSearch] = useState('');
  const [deleteErr, setDeleteErr] = useState('');
  const { modal: confirmModal, openConfirm } = useConfirmModal();

  useEffect(() => {
    if (!data) return;
    setTitle(data.roadmap.title);
    setDescription(data.roadmap.description ?? '');
    setItems(
      data.items.map((it) => ({
        id: it.id,
        bankId: it.questionBankId,
        title: it.bankTitle ?? it.questionBankId,
      })),
    );
  }, [data]);

  const save = useMutation({
    mutationFn: async () => {
      await updateRoadmap(id, { title, description });
      await setRoadmapItems(
        id,
        items.map((i) => i.bankId),
      );
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['roadmap', id] });
      router.push(`/roadmaps/${id}`);
    },
  });

  const delRoadmap = useMutation({
    mutationFn: () => deleteRoadmap(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['my-roadmaps'] });
      router.push('/roadmaps/manage');
    },
    onError: (e: unknown) => {
      setDeleteErr(
        e instanceof Error
          ? e.message
          : 'Xóa roadmap thất bại. Vui lòng thử lại.',
      );
    },
  });

  const handleDeleteRoadmap = () => {
    openConfirm(
      `Xóa roadmap "${data?.roadmap.title}"? Tất cả question banks và tiến độ học sẽ bị xoá.`,
      () => delRoadmap.mutate(),
    );
  };

  const onDragEnd = (result: DropResult) => {
    if (!result.destination) return;
    const next = [...items];
    const [moved] = next.splice(result.source.index, 1);
    next.splice(result.destination.index, 0, moved);
    setItems(next);
  };

  const addBank = (bank: QuestionBank) => {
    if (items.some((i) => i.bankId === bank.id)) return;
    setItems((prev) => [
      ...prev,
      { id: `new-${bank.id}`, bankId: bank.id, title: bank.title },
    ]);
    setShowPicker(false);
    setPickerSearch('');
  };

  const removeItem = (bankId: string) =>
    setItems((prev) => prev.filter((i) => i.bankId !== bankId));

  const availableBanks = (allBanks?.data ?? []).filter(
    (b: QuestionBank) =>
      !items.some((i) => i.bankId === b.id) &&
      b.title.toLowerCase().includes(pickerSearch.toLowerCase()),
  );

  if (isLoading)
    return (
      <div className="animate-pulse space-y-4 max-w-2xl mx-auto">
        <div className="h-8 bg-slate-200 rounded-lg" />
        <div className="h-64 bg-slate-100 rounded-2xl" />
      </div>
    );

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div className="flex items-center gap-3">
        <button
          onClick={() => router.back()}
          className="p-2 rounded-xl hover:bg-slate-100 transition"
        >
          <ArrowLeft className="h-4 w-4 text-slate-600" />
        </button>
        <h1 className="text-xl font-bold text-slate-900">Edit Roadmap</h1>
        <div className="ml-auto">
          <Button
            variant="secondary"
            size="sm"
            isLoading={delRoadmap.isPending}
            onClick={handleDeleteRoadmap}
            icon={<Trash2 className="h-4 w-4 text-red-500" />}
          >
            Delete
          </Button>
        </div>
      </div>

      {deleteErr && (
        <div className="flex items-start justify-between rounded-2xl bg-red-50 border border-red-100 px-4 py-3">
          <div className="flex items-start gap-2 text-sm text-red-700">
            <AlertCircle className="h-4 w-4 shrink-0 mt-0.5" />
            <span>{deleteErr}</span>
          </div>
          <button
            onClick={() => setDeleteErr('')}
            className="text-red-500 hover:text-red-700"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      )}

      <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6 space-y-4">
        <div>
          <label className="block text-sm font-semibold text-slate-700 mb-1.5">
            Title
          </label>
          <Input value={title} onChange={(e) => setTitle(e.target.value)} />
        </div>
        <div>
          <label className="block text-sm font-semibold text-slate-700 mb-1.5">
            Description
          </label>
          <textarea
            className="w-full rounded-xl border border-slate-200 px-3 py-2.5 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500 resize-none"
            rows={2}
            value={description}
            onChange={(e) => setDescription(e.target.value)}
          />
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6 space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="font-bold text-slate-900">
            Question Banks ({items.length})
          </h2>
          <Button
            size="sm"
            variant="secondary"
            icon={<Plus className="h-3.5 w-3.5" />}
            onClick={() => setShowPicker(true)}
          >
            Add Bank
          </Button>
        </div>

        {showPicker && (
          <div className="border border-slate-200 rounded-xl p-3 space-y-2 bg-slate-50">
            <div className="flex gap-2">
              <Input
                placeholder="Search banks..."
                value={pickerSearch}
                onChange={(e) => setPickerSearch(e.target.value)}
                className="flex-1"
              />
              <button
                onClick={() => setShowPicker(false)}
                className="p-2 text-slate-400 hover:text-slate-700"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
            <div className="max-h-48 overflow-y-auto space-y-1">
              {availableBanks.length === 0 ? (
                <p className="text-sm text-slate-400 py-3 text-center">
                  No banks available
                </p>
              ) : (
                availableBanks.map((b: QuestionBank) => (
                  <button
                    key={b.id}
                    onClick={() => addBank(b)}
                    className="w-full text-left px-3 py-2 rounded-lg text-sm font-medium text-slate-700 hover:bg-indigo-50 hover:text-indigo-700 transition"
                  >
                    {b.title}{' '}
                    <span className="text-slate-400 font-normal">
                      · {b.totalQuestions} questions
                    </span>
                  </button>
                ))
              )}
            </div>
          </div>
        )}

        {items.length === 0 ? (
          <p className="text-sm text-slate-400 text-center py-6">
            No banks added yet. Click "Add Bank" to get started.
          </p>
        ) : (
          <DragDropContext onDragEnd={onDragEnd}>
            <Droppable droppableId="roadmap-items">
              {(provided) => (
                <div
                  ref={provided.innerRef}
                  {...provided.droppableProps}
                  className="space-y-2"
                >
                  {items.map((item, index) => (
                    <Draggable
                      key={item.bankId}
                      draggableId={item.bankId}
                      index={index}
                    >
                      {(drag, snap) => (
                        <div
                          ref={drag.innerRef}
                          {...drag.draggableProps}
                          className={[
                            'flex items-center gap-3 p-3 rounded-xl border bg-white transition',
                            snap.isDragging
                              ? 'border-indigo-300 shadow-lg'
                              : 'border-slate-200',
                          ].join(' ')}
                        >
                          <span
                            {...drag.dragHandleProps}
                            className="text-slate-300 hover:text-slate-500 cursor-grab active:cursor-grabbing"
                          >
                            <GripVertical className="h-4 w-4" />
                          </span>
                          <span className="text-xs font-bold text-slate-400 w-5 shrink-0">
                            {index + 1}
                          </span>
                          <span className="flex-1 text-sm font-medium text-slate-800 truncate">
                            {item.title}
                          </span>
                          <button
                            onClick={() => removeItem(item.bankId)}
                            className="text-slate-300 hover:text-red-500 transition p-1 rounded"
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                          </button>
                        </div>
                      )}
                    </Draggable>
                  ))}
                  {provided.placeholder}
                </div>
              )}
            </Droppable>
          </DragDropContext>
        )}
      </div>

      <div className="flex gap-3 pb-8">
        <Button variant="secondary" onClick={() => router.back()}>
          Cancel
        </Button>
        <Button
          onClick={() => save.mutate()}
          isLoading={save.isPending}
          disabled={!title.trim()}
        >
          Save Changes
        </Button>
      </div>
      {confirmModal}
    </div>
  );
}
