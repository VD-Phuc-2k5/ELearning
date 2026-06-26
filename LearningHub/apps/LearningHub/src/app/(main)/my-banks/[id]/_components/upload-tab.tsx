'use client';

import { useRef, useState, type ChangeEvent } from 'react';
import { useMutation } from '@tanstack/react-query';
import { Upload, FileText, AlertCircle, CheckCircle2, X } from 'lucide-react';
import { clsx } from 'clsx';
import { Button } from '../../../../../components/ui';
import QuizService, { type ParsedQuestion } from '../../../../../services/quiz.service';

interface UploadTabProps {
    bankId: string;
    onSuccess: () => void;
}

export function UploadTab({ bankId, onSuccess }: UploadTabProps) {
    const [file, setFile] = useState<File | null>(null);
    const [fileHash, setFileHash] = useState<string | null>(null);
    const [isDuplicate, setIsDuplicate] = useState(false);
    const [preview, setPreview] = useState<ParsedQuestion[] | null>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const calculateHash = async (f: File) => {
        const buf = await f.arrayBuffer();
        const hashBuf = await crypto.subtle.digest('SHA-256', buf);
        return Array.from(new Uint8Array(hashBuf)).map(b => b.toString(16).padStart(2, '0')).join('');
    };

    const checkHashMutation = useMutation({
        mutationFn: (hash: string) => QuizService.checkHash(hash),
        onSuccess: (data) => setIsDuplicate(data.exists),
    });

    const parseMutation = useMutation({
        mutationFn: () => QuizService.parseExcel(bankId, file!),
        onSuccess: (data) => setPreview(data.questions),
    });

    const uploadMutation = useMutation({
        mutationFn: () => QuizService.uploadExcel(bankId, file!, fileHash ?? undefined),
        onSuccess: () => { setFile(null); setFileHash(null); setIsDuplicate(false); setPreview(null); onSuccess(); },
    });

    const onFileChange = async (e: ChangeEvent<HTMLInputElement>) => {
        const f = e.target.files?.[0];
        if (!f) return;
        setFile(f);
        setPreview(null);
        const hash = await calculateHash(f);
        setFileHash(hash);
        checkHashMutation.mutate(hash);
    };

    const reset = () => { setFile(null); setFileHash(null); setIsDuplicate(false); setPreview(null); };

    if (preview) {
        return (
            <div className="space-y-4">
                <div className="flex items-center justify-between">
                    <div>
                        <p className="text-sm font-semibold text-slate-800">Xem trước — {preview.length} câu hỏi</p>
                        <p className="text-xs text-slate-500 mt-0.5">Chỉnh sửa nội dung nếu cần, sau đó bấm "Lưu vào ngân hàng".</p>
                    </div>
                    <button onClick={reset} className="text-xs text-slate-500 hover:text-slate-700 underline">Chọn file khác</button>
                </div>

                <div className="border border-slate-200 rounded-2xl overflow-hidden max-h-[480px] overflow-y-auto">
                    <table className="w-full text-sm">
                        <thead className="bg-slate-50 border-b border-slate-200 sticky top-0 z-10">
                            <tr>
                                <th className="px-4 py-3 text-left text-xs font-bold text-slate-500 w-10">#</th>
                                <th className="px-4 py-3 text-left text-xs font-bold text-slate-500">Nội dung câu hỏi</th>
                                <th className="px-4 py-3 text-left text-xs font-bold text-slate-500 w-28">Đáp án đúng</th>
                                <th className="px-4 py-3 w-10" />
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                            {preview.map((q, i) => (
                                <tr key={i} className="hover:bg-slate-50/50">
                                    <td className="px-4 py-3 text-slate-400 font-medium align-top pt-4">{i + 1}</td>
                                    <td className="px-4 py-3">
                                        <textarea
                                            className="w-full text-sm text-slate-800 bg-transparent resize-none outline-none focus:bg-white focus:ring-2 focus:ring-indigo-100 rounded-lg px-2 py-1 -mx-2 -my-1 min-h-[3rem]"
                                            rows={2}
                                            value={q.content}
                                            onChange={e => setPreview(prev => prev!.map((item, idx) =>
                                                idx === i ? { ...item, content: e.target.value } : item
                                            ))}
                                        />
                                    </td>
                                    <td className="px-4 py-3 space-y-1.5">
                                        {q.answerOptions.map(opt => (
                                            <label key={opt.optionLabel} className="flex items-center gap-1.5 cursor-pointer">
                                                <input
                                                    type="radio"
                                                    name={`preview-correct-${i}`}
                                                    checked={q.correctOptionLabels.includes(opt.optionLabel)}
                                                    onChange={() => setPreview(prev => prev!.map((item, idx) =>
                                                        idx === i ? { ...item, correctOptionLabels: [opt.optionLabel] } : item
                                                    ))}
                                                    className="accent-emerald-600 shrink-0"
                                                />
                                                <span className={clsx('text-xs font-bold', q.correctOptionLabels.includes(opt.optionLabel) ? 'text-emerald-700' : 'text-slate-500')}>
                                                    {opt.optionLabel}
                                                </span>
                                            </label>
                                        ))}
                                    </td>
                                    <td className="px-4 py-3 align-top pt-3">
                                        <button
                                            onClick={() => setPreview(prev => prev!.filter((_, idx) => idx !== i))}
                                            className="p-1 text-slate-300 hover:text-red-500 transition rounded"
                                        >
                                            <X className="h-4 w-4" />
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>

                {uploadMutation.isError && (
                    <div className="flex gap-3 rounded-2xl bg-red-50 border border-red-200 p-4">
                        <AlertCircle className="h-5 w-5 text-red-600 shrink-0 mt-0.5" />
                        <p className="text-sm text-red-700">Import thất bại. Vui lòng kiểm tra lại file.</p>
                    </div>
                )}

                <Button
                    onClick={() => uploadMutation.mutate()}
                    isLoading={uploadMutation.isPending}
                    disabled={preview.length === 0}
                    icon={<Upload className="h-4 w-4" />}
                >
                    Lưu {preview.length} câu hỏi vào ngân hàng
                </Button>
            </div>
        );
    }

    return (
        <div className="space-y-6 max-w-xl">
            <div className="flex items-center justify-between">
                <p className="text-sm text-slate-500">Chọn file Excel để import câu hỏi vào ngân hàng này.</p>
                <a href="/mau_import_cau_hoi.xlsx" download className="text-sm font-medium text-indigo-600 hover:text-indigo-500 flex items-center gap-1 shrink-0">
                    <FileText className="h-4 w-4" /> Tải template
                </a>
            </div>

            <div
                onClick={() => fileInputRef.current?.click()}
                className={clsx(
                    'relative flex flex-col items-center justify-center border-2 border-dashed rounded-3xl p-10 cursor-pointer transition-all',
                    file ? 'bg-indigo-50/50 border-indigo-200' : 'bg-slate-50/50 border-slate-200 hover:border-slate-300'
                )}
            >
                <input type="file" ref={fileInputRef} onChange={onFileChange} className="hidden" accept=".xlsx" />
                {!file ? (
                    <>
                        <Upload className="h-10 w-10 text-slate-300 mb-3" />
                        <p className="text-sm font-medium text-slate-700">Bấm để chọn file .xlsx</p>
                        <p className="text-xs text-slate-400 mt-1">Tối đa 5MB</p>
                    </>
                ) : (
                    <div className="flex items-center gap-3 w-full">
                        <FileText className="h-10 w-10 text-indigo-600 shrink-0" />
                        <div className="flex-1 min-w-0">
                            <p className="font-semibold text-slate-900 truncate">{file.name}</p>
                            <p className="text-xs text-slate-500">{(file.size / 1024).toFixed(1)} KB</p>
                        </div>
                        <button onClick={e => { e.stopPropagation(); reset(); }} className="p-2 text-red-400 hover:text-red-600 transition">
                            <X className="h-4 w-4" />
                        </button>
                    </div>
                )}
            </div>

            {checkHashMutation.isPending && (
                <div className="flex items-center gap-2 text-sm text-slate-500">
                    <div className="h-4 w-4 animate-spin rounded-full border-2 border-indigo-600 border-r-transparent" />
                    Đang kiểm tra file...
                </div>
            )}
            {isDuplicate && (
                <div className="flex gap-3 rounded-2xl bg-amber-50 border border-amber-200 p-4">
                    <AlertCircle className="h-5 w-5 text-amber-600 shrink-0 mt-0.5" />
                    <p className="text-sm text-amber-700">File này đã được import trước đó. Bạn vẫn có thể tiếp tục nếu muốn.</p>
                </div>
            )}
            {file && !checkHashMutation.isPending && (
                <div className="flex gap-3 rounded-2xl bg-emerald-50 border border-emerald-200 p-4">
                    <CheckCircle2 className="h-5 w-5 text-emerald-600 shrink-0 mt-0.5" />
                    <p className="text-sm text-emerald-700">{isDuplicate ? 'File hợp lệ (đã tồn tại).' : 'File hợp lệ. Sẵn sàng preview.'}</p>
                </div>
            )}
            {parseMutation.isError && (
                <div className="flex gap-3 rounded-2xl bg-red-50 border border-red-200 p-4">
                    <AlertCircle className="h-5 w-5 text-red-600 shrink-0 mt-0.5" />
                    <p className="text-sm text-red-700">Không thể đọc file. Vui lòng kiểm tra định dạng.</p>
                </div>
            )}

            <Button onClick={() => parseMutation.mutate()} disabled={!file} isLoading={parseMutation.isPending} icon={<FileText className="h-4 w-4" />}>
                Xem trước câu hỏi
            </Button>
        </div>
    );
}
