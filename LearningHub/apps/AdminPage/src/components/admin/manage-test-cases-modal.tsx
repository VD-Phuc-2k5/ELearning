'use client';

import { useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Modal } from './modal';
import { inputCls, btnSecondary, getAxiosMessage } from '../../lib/admin-api';
import {
  getTestCases,
  createTestCase,
  updateTestCase,
  deleteTestCase,
  importTestCases,
  getTestCasesTemplate,
  toggleProblemStatus,
} from '../../app/actions/problem.actions';
import {
  Trash2,
  Plus,
  Eye,
  EyeOff,
  FileSpreadsheet,
  Upload,
  AlertCircle,
  CheckCircle2,
  Save,
  X,
  Edit3,
} from 'lucide-react';

interface TestCaseItem {
  id: string;
  input: string;
  expectedOutput: string;
  isHidden: boolean;
  points: number;
  orderIndex: number;
}

interface ManageTestCasesModalProps {
  problemId: string;
  problemTitle: string;
  problemStatus: 'draft' | 'public';
  onClose: () => void;
}

export function ManageTestCasesModal({
  problemId,
  problemTitle,
  problemStatus,
  onClose,
}: ManageTestCasesModalProps) {
  const qc = useQueryClient();
  const [form, setForm] = useState({
    input: '',
    expectedOutput: '',
    isHidden: true,
    points: 1,
    orderIndex: 0,
  });
  const [err, setErr] = useState('');
  const [isImporting, setIsImporting] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editForm, setEditForm] = useState({
    input: '',
    expectedOutput: '',
    isHidden: true,
    points: 1,
    orderIndex: 0,
  });
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);
  const [notification, setNotification] = useState<{
    message: string;
    type: 'success' | 'error';
  } | null>(null);
  const [currentStatus, setCurrentStatus] = useState(problemStatus);

  const showNotification = (message: string, type: 'success' | 'error') => {
    setNotification({ message, type });
    setTimeout(() => setNotification(null), 3000);
  };

  const handleDownloadTemplate = async () => {
    try {
      setErr('');
      const template = await getTestCasesTemplate();
      const link = document.createElement('a');
      link.href = `data:${template.contentType};base64,${template.data}`;
      link.download = 'template_testcases.xlsx';
      link.click();
    } catch (e: unknown) {
      const err = e as Error;
      setErr(err.message || 'Tải file mẫu thất bại');
    }
  };

  const handleImportExcel = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const formData = new FormData();
    formData.append('file', file);

    setIsImporting(true);
    setErr('');
    try {
      const res = await importTestCases(problemId, formData);
      qc.invalidateQueries({ queryKey: ['admin-testcases', problemId] });
      qc.invalidateQueries({ queryKey: ['admin-problems'] });
      showNotification(
        (res as { message?: string }).message ||
          'Import test cases thành công!',
        'success',
      );
    } catch (err: unknown) {
      const e = err as Error;
      setErr(
        e.message || 'Import thất bại. Vui lòng kiểm tra lại định dạng file.',
      );
    } finally {
      setIsImporting(false);
      e.target.value = '';
    }
  };

  const { data: testCases, isLoading } = useQuery<TestCaseItem[]>({
    queryKey: ['admin-testcases', problemId],
    queryFn: () => getTestCases(problemId),
  });

  const addMut = useMutation({
    mutationFn: () => createTestCase(problemId, form),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['admin-testcases', problemId] });
      qc.invalidateQueries({ queryKey: ['admin-problems'] });
      setForm({
        input: '',
        expectedOutput: '',
        isHidden: true,
        points: 1,
        orderIndex: (testCases?.length ?? 0) + 1,
      });
      setErr('');
    },
    onError: (e: unknown) =>
      setErr(getAxiosMessage(e, 'Thêm test case thất bại')),
  });

  const updateMut = useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<TestCaseItem> }) =>
      updateTestCase(problemId, id, data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['admin-testcases', problemId] });
      qc.invalidateQueries({ queryKey: ['admin-problems'] });
      setEditingId(null);
      setErr('');
    },
    onError: (e: unknown) =>
      setErr(getAxiosMessage(e, 'Cập nhật test case thất bại')),
  });

  const deleteMut = useMutation({
    mutationFn: (id: string) => deleteTestCase(problemId, id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['admin-testcases', problemId] });
      qc.invalidateQueries({ queryKey: ['admin-problems'] });
      setDeleteConfirm(null);
    },
    onError: (e: unknown) =>
      setErr(getAxiosMessage(e, 'Xóa test case thất bại')),
  });

  const toggleStatusMut = useMutation({
    mutationFn: () => {
      const newStatus = currentStatus === 'public' ? 'draft' : 'public';
      return toggleProblemStatus(problemId, newStatus);
    },
    onSuccess: () => {
      setCurrentStatus((s) => (s === 'public' ? 'draft' : 'public'));
      qc.invalidateQueries({ queryKey: ['admin-problems'] });
      showNotification('Đã cập nhật trạng thái', 'success');
    },
    onError: (e: unknown) =>
      setErr(getAxiosMessage(e, 'Cập nhật trạng thái thất bại')),
  });

  const startEdit = (tc: TestCaseItem) => {
    setEditingId(tc.id);
    setEditForm({
      input: tc.input,
      expectedOutput: tc.expectedOutput,
      isHidden: tc.isHidden,
      points: tc.points,
      orderIndex: tc.orderIndex,
    });
  };

  const cancelEdit = () => {
    setEditingId(null);
    setErr('');
  };

  const saveEdit = (id: string) => {
    updateMut.mutate({ id, data: editForm });
  };

  return (
    <Modal
      title={`Cấu hình Test Cases: ${problemTitle}`}
      onClose={onClose}
      wide
    >
      <div className="space-y-6 max-h-[80vh] overflow-y-auto pr-2">
        {/* Notification banner */}
        {notification && (
          <div
            className={`px-4 py-3 rounded-xl text-sm font-bold ${
              notification.type === 'success'
                ? 'bg-emerald-50 text-emerald-700 border border-emerald-100'
                : 'bg-rose-50 text-rose-700 border border-rose-100'
            }`}
          >
            {notification.message}
          </div>
        )}

        {/* Status display */}
        <div className="flex items-center gap-3">
          <span className="text-xs font-semibold text-slate-600">
            Trạng thái:
          </span>
          <span
            className={`inline-flex items-center gap-1 text-[11px] font-bold px-2.5 py-0.5 rounded-full border ${
              currentStatus === 'public'
                ? 'bg-emerald-50 text-emerald-700 border-emerald-100'
                : 'bg-amber-50 text-amber-700 border-amber-100'
            }`}
          >
            {currentStatus === 'public' ? (
              <>
                <CheckCircle2 className="h-3.5 w-3.5" /> Công khai
              </>
            ) : (
              <>
                <AlertCircle className="h-3.5 w-3.5" /> Bản nháp
              </>
            )}
          </span>
          <button
            onClick={() => toggleStatusMut.mutate()}
            disabled={toggleStatusMut.isPending}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition border cursor-pointer disabled:opacity-60 bg-white text-slate-700 border-slate-200 hover:bg-slate-50"
          >
            {currentStatus === 'public' ? 'Đưa về bản nháp' : 'Công khai'}
          </button>
        </div>

        <div>
          <div className="flex justify-between items-center mb-3">
            <h3 className="text-sm font-semibold text-slate-800">
              Danh sách Test Cases ({testCases?.length ?? 0})
            </h3>
            <div className="flex gap-2">
              <button
                type="button"
                onClick={handleDownloadTemplate}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-slate-200 text-xs font-semibold text-slate-600 hover:bg-slate-50 transition cursor-pointer"
              >
                <FileSpreadsheet className="h-3.5 w-3.5 text-emerald-600" />
                Tải File Mẫu
              </button>
              <label
                title="Chọn file .xlsx để thêm nhiều test case cùng lúc"
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-50 border-2 border-dashed border-emerald-300 hover:bg-emerald-100 hover:border-emerald-400 text-xs font-bold text-emerald-700 transition cursor-pointer"
              >
                <Upload className="h-3.5 w-3.5" />
                {isImporting ? 'Đang import...' : 'Import Excel'}
                <input
                  type="file"
                  accept=".xlsx"
                  onChange={handleImportExcel}
                  className="hidden"
                  disabled={isImporting}
                />
              </label>
            </div>
          </div>

          {isLoading ? (
            <p className="text-sm text-slate-500 py-4 text-center">
              Đang tải...
            </p>
          ) : !testCases || testCases.length === 0 ? (
            <p className="text-sm text-slate-500 py-6 text-center border border-dashed border-slate-200 rounded-xl bg-slate-50">
              Chưa có test case nào cho bài tập này.
            </p>
          ) : (
            <div className="border border-slate-200 rounded-xl overflow-hidden bg-white max-h-60 overflow-y-auto">
              <table className="w-full text-left border-collapse">
                <thead className="bg-slate-50 border-b border-slate-200 sticky top-0">
                  <tr>
                    <th className="px-4 py-2 text-xs font-bold text-slate-500 uppercase">
                      Thứ tự
                    </th>
                    <th className="px-4 py-2 text-xs font-bold text-slate-500 uppercase">
                      Đầu vào
                    </th>
                    <th className="px-4 py-2 text-xs font-bold text-slate-500 uppercase">
                      Đầu ra
                    </th>
                    <th className="px-4 py-2 text-xs font-bold text-slate-500 uppercase">
                      Loại
                    </th>
                    <th className="px-4 py-2 text-xs font-bold text-slate-500 uppercase">
                      Điểm
                    </th>
                    <th className="px-4 py-2 text-xs font-bold text-slate-500 uppercase text-right">
                      Hành động
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {testCases.map((tc: TestCaseItem) => {
                    const isEditing = editingId === tc.id;
                    return (
                      <tr key={tc.id} className="hover:bg-slate-50 text-xs">
                        <td className="px-4 py-2 font-medium text-slate-600">
                          {isEditing ? (
                            <input
                              type="number"
                              value={editForm.orderIndex}
                              onChange={(e) =>
                                setEditForm((p) => ({
                                  ...p,
                                  orderIndex: Number(e.target.value),
                                }))
                              }
                              className={`${inputCls} py-1 px-2 text-xs w-16`}
                              min={0}
                            />
                          ) : (
                            `#${tc.orderIndex}`
                          )}
                        </td>
                        <td className="px-4 py-2 font-mono text-slate-600 max-w-[140px]">
                          {isEditing ? (
                            <textarea
                              value={editForm.input}
                              onChange={(e) =>
                                setEditForm((p) => ({
                                  ...p,
                                  input: e.target.value,
                                }))
                              }
                              className={`${inputCls} py-1 px-2 text-xs w-full h-16 font-mono`}
                            />
                          ) : (
                            <div className="truncate">
                              {tc.input || (
                                <span className="italic text-slate-400">
                                  Trống
                                </span>
                              )}
                            </div>
                          )}
                        </td>
                        <td className="px-4 py-2 font-mono text-slate-600 max-w-[140px]">
                          {isEditing ? (
                            <textarea
                              value={editForm.expectedOutput}
                              onChange={(e) =>
                                setEditForm((p) => ({
                                  ...p,
                                  expectedOutput: e.target.value,
                                }))
                              }
                              className={`${inputCls} py-1 px-2 text-xs w-full h-16 font-mono`}
                            />
                          ) : (
                            <div className="truncate">{tc.expectedOutput}</div>
                          )}
                        </td>
                        <td className="px-4 py-2">
                          {isEditing ? (
                            <label className="flex items-center gap-1.5 text-xs font-bold text-slate-600 cursor-pointer select-none">
                              <input
                                type="checkbox"
                                checked={editForm.isHidden}
                                onChange={(e) =>
                                  setEditForm((p) => ({
                                    ...p,
                                    isHidden: e.target.checked,
                                  }))
                                }
                                className="h-3.5 w-3.5 rounded text-indigo-600 border-slate-300 cursor-pointer"
                              />
                              Ẩn
                            </label>
                          ) : tc.isHidden ? (
                            <span className="inline-flex items-center gap-1 text-[10px] bg-slate-100 text-slate-600 px-2 py-0.5 rounded-full font-bold">
                              <EyeOff className="h-3 w-3" /> Ẩn
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1 text-[10px] bg-emerald-50 text-emerald-700 px-2 py-0.5 rounded-full font-bold">
                              <Eye className="h-3 w-3" /> Hiện
                            </span>
                          )}
                        </td>
                        <td className="px-4 py-2 font-bold text-slate-800">
                          {isEditing ? (
                            <input
                              type="number"
                              value={editForm.points}
                              onChange={(e) =>
                                setEditForm((p) => ({
                                  ...p,
                                  points: Number(e.target.value),
                                }))
                              }
                              className={`${inputCls} py-1 px-2 text-xs w-16`}
                              min={1}
                            />
                          ) : (
                            `${tc.points}đ`
                          )}
                        </td>
                        <td className="px-4 py-2 text-right">
                          {isEditing ? (
                            <div className="flex items-center justify-end gap-1">
                              <button
                                onClick={() => saveEdit(tc.id)}
                                disabled={updateMut.isPending}
                                className="text-emerald-600 hover:text-emerald-700 disabled:opacity-50 p-1 hover:bg-emerald-50 rounded cursor-pointer"
                                title="Lưu"
                              >
                                <Save className="h-4 w-4" />
                              </button>
                              <button
                                onClick={cancelEdit}
                                className="text-slate-400 hover:text-slate-600 p-1 hover:bg-slate-100 rounded cursor-pointer"
                                title="Hủy"
                              >
                                <X className="h-4 w-4" />
                              </button>
                            </div>
                          ) : (
                            <div className="flex items-center justify-end gap-1">
                              <button
                                onClick={() => startEdit(tc)}
                                className="text-indigo-500 hover:text-indigo-700 p-1 hover:bg-indigo-50 rounded cursor-pointer"
                                title="Sửa"
                              >
                                <Edit3 className="h-3.5 w-3.5" />
                              </button>
                              <button
                                onClick={() => setDeleteConfirm(tc.id)}
                                className="text-rose-500 hover:text-rose-700 p-1 hover:bg-rose-50 rounded cursor-pointer"
                                title="Xóa"
                              >
                                <Trash2 className="h-3.5 w-3.5" />
                              </button>
                            </div>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Add Test Case Form */}
        <div className="border-t border-slate-200 pt-4">
          <h3 className="text-sm font-semibold text-slate-800 mb-3 flex items-center gap-1">
            <Plus className="h-4 w-4 text-indigo-600" /> Thêm Test Case Mới
          </h3>

          <div className="space-y-3 bg-slate-50 border border-slate-100 rounded-xl p-4">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Đầu vào
                </label>
                <textarea
                  value={form.input}
                  onChange={(e) =>
                    setForm((p) => ({ ...p, input: e.target.value }))
                  }
                  placeholder="Nhập stdin đầu vào (nếu có)..."
                  className={`${inputCls} h-20 text-xs font-mono`}
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Đầu ra mong muốn *
                </label>
                <textarea
                  value={form.expectedOutput}
                  onChange={(e) =>
                    setForm((p) => ({ ...p, expectedOutput: e.target.value }))
                  }
                  placeholder="Nhập stdout kết quả..."
                  className={`${inputCls} h-20 text-xs font-mono`}
                  required
                />
              </div>
            </div>

            <div className="grid grid-cols-3 gap-3">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Số thứ tự chạy
                </label>
                <input
                  type="number"
                  value={form.orderIndex}
                  onChange={(e) =>
                    setForm((p) => ({
                      ...p,
                      orderIndex: Number(e.target.value),
                    }))
                  }
                  className={`${inputCls} py-2 text-xs`}
                  min={0}
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Điểm số testcase
                </label>
                <input
                  type="number"
                  value={form.points}
                  onChange={(e) =>
                    setForm((p) => ({ ...p, points: Number(e.target.value) }))
                  }
                  className={`${inputCls} py-2 text-xs`}
                  min={1}
                />
              </div>

              <div className="flex flex-col justify-center pt-3">
                <label className="flex items-center gap-2 text-xs font-bold text-slate-700 cursor-pointer select-none">
                  <input
                    type="checkbox"
                    checked={form.isHidden}
                    onChange={(e) =>
                      setForm((p) => ({ ...p, isHidden: e.target.checked }))
                    }
                    className="h-4 w-4 rounded text-indigo-600 border-slate-300 focus:ring-indigo-500 cursor-pointer"
                  />
                  Test case ẩn
                </label>
              </div>
            </div>

            {err && (
              <p className="text-xs text-red-600 bg-red-50 rounded-xl px-4 py-2">
                {err}
              </p>
            )}

            <div className="flex justify-end pt-1">
              <button
                type="button"
                onClick={() => addMut.mutate()}
                disabled={addMut.isPending || !form.expectedOutput}
                className="bg-indigo-600 text-white font-bold text-xs px-5 py-2.5 rounded-xl hover:bg-indigo-700 transition disabled:opacity-60 flex items-center gap-1 cursor-pointer"
              >
                {addMut.isPending ? 'Đang thêm...' : 'Thêm Test Case'}
              </button>
            </div>
          </div>
        </div>

        <div className="flex gap-3 border-t border-slate-100 pt-4">
          <button
            type="button"
            onClick={onClose}
            className={`${btnSecondary} py-2 text-xs cursor-pointer`}
          >
            Đóng
          </button>
        </div>
      </div>

      {/* Delete confirmation dialog */}
      {deleteConfirm && (
        <div className="fixed inset-0 bg-black/50 z-[60] flex items-center justify-center">
          <div className="bg-white rounded-2xl p-6 max-w-sm w-full mx-4 shadow-xl">
            <h3 className="text-slate-800 font-bold mb-2">Xác nhận xóa</h3>
            <p className="text-slate-600 text-sm mb-6">
              Bạn chắc chắn muốn xóa test case này? Hành động này không thể hoàn
              tác.
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => setDeleteConfirm(null)}
                className="flex-1 py-2.5 rounded-xl border border-slate-200 text-sm font-medium text-slate-600 hover:bg-slate-50 transition cursor-pointer"
              >
                Hủy
              </button>
              <button
                onClick={() => deleteMut.mutate(deleteConfirm)}
                disabled={deleteMut.isPending}
                className="flex-1 py-2.5 rounded-xl bg-rose-600 text-white text-sm font-bold hover:bg-rose-700 transition disabled:opacity-60 cursor-pointer"
              >
                {deleteMut.isPending ? 'Đang xóa...' : 'Xóa'}
              </button>
            </div>
          </div>
        </div>
      )}
    </Modal>
  );
}
