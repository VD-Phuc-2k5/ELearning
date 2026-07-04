'use client';

import { useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { Modal } from './modal';
import {
  inputCls,
  btnPrimary,
  btnSecondary,
  getAxiosMessage,
} from '../../lib/admin-api';
import { updateProblem } from '../../app/actions/problem.actions';

interface EditProblemModalProps {
  problem: any;
  onClose: () => void;
}

export function EditProblemModal({ problem, onClose }: EditProblemModalProps) {
  const qc = useQueryClient();
  const [form, setForm] = useState({
    title: problem.title || '',
    description: problem.description || '',
    difficulty: problem.difficulty || 'easy',
    timeLimitMs: problem.timeLimitMs || 5000,
    memoryLimitMb: problem.memoryLimitMb || 256,
    sampleInput: problem.sampleInput || '',
    sampleOutput: problem.sampleOutput || '',
    languages: problem.languages || [],
    templates: problem.templates || {},
    wrappers: problem.wrappers || {},
  });
  const [err, setErr] = useState('');

  const availableLanguages = [
    { value: 'python', label: 'Python 3' },
    { value: 'javascript', label: 'Node.js' },
    { value: 'typescript', label: 'TypeScript' },
    { value: 'cpp', label: 'C++ (GCC)' },
    { value: 'c', label: 'C (GCC)' },
    { value: 'java', label: 'Java (JDK 17)' },
    { value: 'go', label: 'Go' },
    { value: 'rust', label: 'Rust' },
    { value: 'csharp', label: 'C# (.NET 8)' },
    { value: 'swift', label: 'Swift' },
  ];

  const mut = useMutation({
    mutationFn: () =>
      updateProblem(problem.id, {
        ...form,
        sampleInput: form.sampleInput || null,
        sampleOutput: form.sampleOutput || null,
      }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['admin-problems'] });
      onClose();
    },
    onError: (e: unknown) =>
      setErr(getAxiosMessage(e, 'Cập nhật đề bài thất bại')),
  });

  const toggleLanguage = (lang: string) => {
    setForm((p) => {
      const languages = p.languages.includes(lang)
        ? p.languages.filter((l: string) => l !== lang)
        : [...p.languages, lang];
      return { ...p, languages };
    });
  };

  return (
    <Modal title="Chỉnh sửa Đề bài lập trình" onClose={onClose}>
      <div className="space-y-4 max-h-[80vh] overflow-y-auto pr-1">
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">
            Tiêu đề bài tập *
          </label>
          <input
            type="text"
            value={form.title}
            onChange={(e) => setForm((p) => ({ ...p, title: e.target.value }))}
            placeholder="Ví dụ: Tính tổng 2 số"
            className={inputCls}
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">
            Mô tả đề bài * (Hỗ trợ Markdown)
          </label>
          <textarea
            value={form.description}
            onChange={(e) =>
              setForm((p) => ({ ...p, description: e.target.value }))
            }
            placeholder="Mô tả chi tiết yêu cầu đề bài..."
            className={`${inputCls} h-32`}
            required
          />
        </div>

        <div className="grid grid-cols-3 gap-3">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">
              Độ khó *
            </label>
            <select
              value={form.difficulty}
              onChange={(e) =>
                setForm((p) => ({
                  ...p,
                  difficulty: e.target.value as any,
                }))
              }
              className={inputCls}
            >
              <option value="easy">Dễ (Easy)</option>
              <option value="medium">Trung bình (Medium)</option>
              <option value="hard">Khó (Hard)</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">
              Giới hạn time (ms) *
            </label>
            <input
              type="number"
              value={form.timeLimitMs}
              onChange={(e) =>
                setForm((p) => ({
                  ...p,
                  timeLimitMs: parseInt(e.target.value) || 0,
                }))
              }
              className={inputCls}
              min={100}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">
              Giới hạn RAM (MB) *
            </label>
            <input
              type="number"
              value={form.memoryLimitMb}
              onChange={(e) =>
                setForm((p) => ({
                  ...p,
                  memoryLimitMb: parseInt(e.target.value) || 0,
                }))
              }
              className={inputCls}
              min={16}
            />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">
              Input Mẫu (Sample Input)
            </label>
            <textarea
              value={form.sampleInput}
              onChange={(e) =>
                setForm((p) => ({ ...p, sampleInput: e.target.value }))
              }
              placeholder="1 2"
              className={`${inputCls} h-20`}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">
              Output Mẫu (Sample Output)
            </label>
            <textarea
              value={form.sampleOutput}
              onChange={(e) =>
                setForm((p) => ({ ...p, sampleOutput: e.target.value }))
              }
              placeholder="3"
              className={`${inputCls} h-20`}
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-700 mb-2">
            Ngôn ngữ lập trình hỗ trợ * (Chọn ít nhất 1)
          </label>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-2 border border-slate-100 rounded-xl p-3 bg-slate-50">
            {availableLanguages.map((lang) => {
              const checked = form.languages.includes(lang.value);
              return (
                <label
                  key={lang.value}
                  className="flex items-center gap-2 text-sm text-slate-700 cursor-pointer select-none py-1 hover:text-indigo-600"
                >
                  <input
                    type="checkbox"
                    checked={checked}
                    onChange={() => toggleLanguage(lang.value)}
                    className="h-4 w-4 rounded text-indigo-600 border-slate-300 focus:ring-indigo-500 cursor-pointer"
                  />
                  {lang.label}
                </label>
              );
            })}
          </div>
        </div>

        {form.languages.length > 0 && (
          <div className="space-y-4 border-t border-slate-200 pt-4">
            <h4 className="text-sm font-bold text-slate-800">
              Cấu hình LeetCode-style (Tùy chọn)
            </h4>
            <div className="space-y-4">
              {form.languages.map((lang: string) => (
                <div
                  key={lang}
                  className="border border-slate-200 rounded-xl p-4 bg-slate-50 space-y-3"
                >
                  <div className="text-xs font-bold text-indigo-600 uppercase tracking-wider">
                    {lang} Configuration
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-[11px] font-bold text-slate-500 mb-1">
                        Mẫu Code học sinh nhìn thấy
                      </label>
                      <textarea
                        value={form.templates[lang] || ''}
                        onChange={(e) =>
                          setForm((p) => ({
                            ...p,
                            templates: {
                              ...p.templates,
                              [lang]: e.target.value,
                            },
                          }))
                        }
                        placeholder={
                          lang === 'python'
                            ? 'class Solution:\n    def solve(self, a: int, b: int) -> int:\n        pass'
                            : '// {{STUDENT_CODE}}\n...'
                        }
                        className={`${inputCls} h-28 text-xs font-mono`}
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] font-bold text-slate-500 mb-1">
                        Mã bọc chạy chấm điểm (Driver Code)
                      </label>
                      <textarea
                        value={form.wrappers[lang] || ''}
                        onChange={(e) =>
                          setForm((p) => ({
                            ...p,
                            wrappers: { ...p.wrappers, [lang]: e.target.value },
                          }))
                        }
                        placeholder={
                          lang === 'python'
                            ? '# {{STUDENT_CODE}}\nimport sys\n...\nprint(Solution().solve(a, b))'
                            : '// {{STUDENT_CODE}}\n...'
                        }
                        className={`${inputCls} h-28 text-xs font-mono`}
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {err && (
          <p className="text-sm text-red-600 bg-red-50 rounded-xl px-4 py-3 border border-red-100">
            {err}
          </p>
        )}

        <div className="flex gap-3 pt-2">
          <button type="button" onClick={onClose} className={btnSecondary}>
            Hủy
          </button>
          <button
            type="button"
            onClick={() => mut.mutate()}
            disabled={
              mut.isPending ||
              !form.title ||
              !form.description ||
              form.languages.length === 0
            }
            className={btnPrimary}
          >
            {mut.isPending ? 'Đang lưu...' : 'Lưu thay đổi'}
          </button>
        </div>
      </div>
    </Modal>
  );
}
