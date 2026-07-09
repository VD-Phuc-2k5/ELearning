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
import { MarkdownEditor } from './markdown-editor';
import { CodeInput } from './code-input';
import { DEFAULT_TEMPLATES, DEFAULT_WRAPPERS } from './default-code-presets';

interface EditProblemModalProps {
  problem: {
    id: string;
    title: string;
    description: string;
    difficulty: 'easy' | 'medium' | 'hard';
    timeLimitMs: number;
    memoryLimitMb: number;
    languages: string[];
    templates?: Record<string, string>;
    wrappers?: Record<string, string>;
  };
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
    languages: problem.languages || [],
    templates: problem.templates || {},
    wrappers: problem.wrappers || {},
  });
  const [err, setErr] = useState('');

  const availableLanguages = [
    { value: 'python', label: 'Python 3' },
    { value: 'javascript', label: 'JavaScript' },
    { value: 'typescript', label: 'TypeScript' },
    { value: 'cpp', label: 'C++ (GCC)' },
    { value: 'c', label: 'C (GCC)' },
    { value: 'java', label: 'Java (JDK 17)' },
    { value: 'go', label: 'Go' },
    { value: 'rust', label: 'Rust' },
    { value: 'csharp', label: 'C# (.NET 8)' },
    { value: 'swift', label: 'Swift' },
  ];

  const validateForm = () => {
    if (!form.title.trim()) {
      setErr('Tiêu đề không được để trống hoặc chỉ chứa khoảng trắng');
      return false;
    }
    if (form.title.trim().length > 200) {
      setErr('Tiêu đề không được vượt quá 200 ký tự');
      return false;
    }
    if (!form.description.trim()) {
      setErr('Mô tả không được để trống hoặc chỉ chứa khoảng trắng');
      return false;
    }
    if (form.description.trim().length > 10000) {
      setErr('Mô tả không được vượt quá 10000 ký tự');
      return false;
    }
    if (form.languages.length === 0) {
      setErr('Vui lòng chọn ít nhất 1 ngôn ngữ lập trình hỗ trợ');
      return false;
    }
    if (
      form.timeLimitMs === undefined ||
      form.timeLimitMs === null ||
      isNaN(form.timeLimitMs) ||
      form.timeLimitMs < 100
    ) {
      setErr('Thời gian giới hạn tối thiểu là 100ms');
      return false;
    }
    if (
      form.memoryLimitMb === undefined ||
      form.memoryLimitMb === null ||
      isNaN(form.memoryLimitMb) ||
      form.memoryLimitMb < 16
    ) {
      setErr('Bộ nhớ giới hạn tối thiểu là 16MB');
      return false;
    }
    // Kiểm tra cấu hình LeetCode-style bắt buộc cho các ngôn ngữ đã chọn
    for (const lang of form.languages) {
      const template = form.templates[lang]?.trim();
      const wrapper = form.wrappers[lang]?.trim();

      if (!template) {
        setErr(
          `Ngôn ngữ ${lang.toUpperCase()}: Bắt buộc phải nhập Mẫu Code học sinh nhìn thấy`,
        );
        return false;
      }
      if (!wrapper) {
        setErr(
          `Ngôn ngữ ${lang.toUpperCase()}: Bắt buộc phải nhập Mã bọc chạy chấm điểm (Driver Code)`,
        );
        return false;
      }
      if (!wrapper.includes('{{STUDENT_CODE}}')) {
        setErr(
          `Ngôn ngữ ${lang.toUpperCase()}: Mã bọc chạy (Driver Code) bắt buộc phải chứa placeholder {{STUDENT_CODE}} để ghép code`,
        );
        return false;
      }
    }

    setErr('');
    return true;
  };

  const mut = useMutation({
    mutationFn: () =>
      updateProblem(problem.id, {
        ...form,
        title: form.title.trim(),
        description: form.description.trim(),
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
      const isAdding = !p.languages.includes(lang);
      const languages = isAdding
        ? [...p.languages, lang]
        : p.languages.filter((l: string) => l !== lang);
      if (!isAdding) return { ...p, languages };
      return {
        ...p,
        languages,
        templates: p.templates[lang]?.trim()
          ? p.templates
          : { ...p.templates, [lang]: DEFAULT_TEMPLATES[lang] ?? '' },
        wrappers: p.wrappers[lang]?.trim()
          ? p.wrappers
          : { ...p.wrappers, [lang]: DEFAULT_WRAPPERS[lang] ?? '' },
      };
    });
  };

  return (
    <Modal title="Chỉnh sửa Đề bài lập trình" onClose={onClose} extraWide>
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
            Mô tả đề bài *
            <span className="ml-2 text-[11px] font-normal text-slate-400">
              Hỗ trợ Markdown — Bold, Italic, Code, Blockquote, ...
            </span>
          </label>
          <MarkdownEditor
            value={form.description}
            onChange={(val) => setForm((p) => ({ ...p, description: val }))}
            placeholder="Mô tả chi tiết yêu cầu đề bài..."
            height={280}
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
                  difficulty: e.target.value as 'easy' | 'medium' | 'hard',
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
              Cấu hình LeetCode-style *
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
                      <CodeInput
                        value={form.templates[lang] || ''}
                        onChange={(v) =>
                          setForm((p) => ({
                            ...p,
                            templates: {
                              ...p.templates,
                              [lang]: v,
                            },
                          }))
                        }
                        language={lang}
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] font-bold text-slate-500 mb-1">
                        Mã bọc chạy chấm điểm (Driver Code)
                      </label>
                      <CodeInput
                        value={form.wrappers[lang] || ''}
                        onChange={(v) =>
                          setForm((p) => ({
                            ...p,
                            wrappers: { ...p.wrappers, [lang]: v },
                          }))
                        }
                        language={lang}
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
            onClick={() => {
              if (validateForm()) {
                mut.mutate();
              }
            }}
            disabled={
              mut.isPending ||
              !form.title.trim() ||
              !form.description.trim() ||
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
