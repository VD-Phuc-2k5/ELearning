'use client';

import { useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Modal } from './modal';
import { inputCls, btnSecondary, getAxiosMessage } from '../../lib/admin-api';
import {
  getTestCases,
  createTestCase,
  deleteTestCase,
} from '../../app/actions/problem.actions';
import { Trash2, Plus, Eye, EyeOff } from 'lucide-react';

interface ManageTestCasesModalProps {
  problemId: string;
  problemTitle: string;
  onClose: () => void;
}

export function ManageTestCasesModal({
  problemId,
  problemTitle,
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

  const { data: testCases, isLoading } = useQuery<any[]>({
    queryKey: ['admin-testcases', problemId],
    queryFn: () => getTestCases(problemId),
  });

  const addMut = useMutation({
    mutationFn: () => createTestCase(problemId, form),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['admin-testcases', problemId] });
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

  const deleteMut = useMutation({
    mutationFn: (id: string) => deleteTestCase(problemId, id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['admin-testcases', problemId] });
    },
    onError: (e: unknown) =>
      setErr(getAxiosMessage(e, 'Xóa test case thất bại')),
  });

  return (
    <Modal title={`Cấu hình Test Cases: ${problemTitle}`} onClose={onClose}>
      <div className="space-y-6 max-h-[80vh] overflow-y-auto pr-2">
        {/* Test Cases List */}
        <div>
          <h3 className="text-sm font-semibold text-slate-800 mb-2">
            Danh sách Test Cases hiện có ({testCases?.length ?? 0})
          </h3>

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
                      Đầu vào (Input)
                    </th>
                    <th className="px-4 py-2 text-xs font-bold text-slate-500 uppercase">
                      Đầu ra (Output)
                    </th>
                    <th className="px-4 py-2 text-xs font-bold text-slate-500 uppercase">
                      Loại
                    </th>
                    <th className="px-4 py-2 text-xs font-bold text-slate-500 uppercase">
                      Điểm
                    </th>
                    <th className="px-4 py-2 text-xs font-bold text-slate-500 uppercase text-right">
                      Xóa
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {testCases.map((tc) => (
                    <tr key={tc.id} className="hover:bg-slate-50 text-xs">
                      <td className="px-4 py-2 font-medium text-slate-600">
                        #{tc.orderIndex}
                      </td>
                      <td className="px-4 py-2 font-mono text-slate-600 truncate max-w-[120px]">
                        {tc.input || (
                          <span className="italic text-slate-400">Empty</span>
                        )}
                      </td>
                      <td className="px-4 py-2 font-mono text-slate-600 truncate max-w-[120px]">
                        {tc.expectedOutput}
                      </td>
                      <td className="px-4 py-2">
                        {tc.isHidden ? (
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
                        {tc.points}đ
                      </td>
                      <td className="px-4 py-2 text-right">
                        <button
                          onClick={() => {
                            if (
                              confirm('Bạn chắc chắn muốn xóa test case này?')
                            ) {
                              deleteMut.mutate(tc.id);
                            }
                          }}
                          disabled={deleteMut.isPending}
                          className="text-red-500 hover:text-red-700 disabled:opacity-50 p-1 hover:bg-red-50 rounded"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </td>
                    </tr>
                  ))}
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
                  Đầu vào (Input)
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
                  Đầu ra mong muốn (Expected Output) *
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

              <div className="flex items-center pt-5">
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
                className="bg-indigo-600 text-white font-bold text-xs px-5 py-2.5 rounded-xl hover:bg-indigo-700 transition disabled:opacity-60 flex items-center gap-1"
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
            className={`${btnSecondary} py-2 text-xs`}
          >
            Đóng
          </button>
        </div>
      </div>
    </Modal>
  );
}
