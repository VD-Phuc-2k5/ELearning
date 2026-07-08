'use client';

import { useRef, useState, type ChangeEvent } from 'react';
import { useMutation } from '@tanstack/react-query';
import { Upload, FileText, AlertCircle, CheckCircle2, X } from 'lucide-react';
import { clsx } from 'clsx';
import { Button } from '../../../../../components/ui';
import type { ParsedQuestion } from '@learning-hub/domain';
import {
  checkBankHash,
  parseExcel,
  uploadExcel,
} from '../../../../actions/quiz.actions';
import { PreviewTable } from './PreviewTable';
import { buildExcelFileFromPreview } from '../../../../../lib/buildExcelFileFromPreview';

async function computeFileHash(f: File) {
  const buf = await f.arrayBuffer();
  const hashBuf = await crypto.subtle.digest('SHA-256', buf);
  return Array.from(new Uint8Array(hashBuf))
    .map((b) => b.toString(16).padStart(2, '0'))
    .join('');
}

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

  const [parseError, setParseError] = useState<string | null>(null);
  const [uploadError, setUploadError] = useState<string | null>(null);

  const checkHashMutation = useMutation({
    mutationFn: (hash: string) => checkBankHash(hash),
    onSuccess: (data) => setIsDuplicate(data.exists),
  });

  const parseMutation = useMutation({
    mutationFn: () => {
      if (!file) throw new Error('No file selected');
      return parseExcel(bankId, file);
    },
    onSuccess: (data) => {
      setParseError(null);
      setPreview(data.questions);
    },
    onError: (e: unknown) => {
      setParseError(
        e instanceof Error
          ? e.message
          : 'Không thể đọc file. Vui lòng kiểm tra định dạng.',
      );
    },
  });

  const uploadMutation = useMutation({
    mutationFn: async () => {
      const excelFile: File | null = preview
        ? await buildExcelFileFromPreview(preview)
        : file;
      if (!excelFile) {
        throw new Error('No file to upload');
      }
      return uploadExcel(bankId, excelFile, fileHash ?? undefined);
    },
    onSuccess: () => {
      setFile(null);
      setFileHash(null);
      setIsDuplicate(false);
      setPreview(null);
      setUploadError(null);
      onSuccess();
    },
    onError: (e: unknown) => {
      setUploadError(
        e instanceof Error ? e.message : 'Import thất bại. Vui lòng thử lại.',
      );
    },
  });

  const onFileChange = async (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setFile(file);
    setPreview(null);
    setParseError(null);
    const hash = await computeFileHash(file);
    setFileHash(hash);
    checkHashMutation.mutate(hash);
  };

  const reset = () => {
    setFile(null);
    setFileHash(null);
    setIsDuplicate(false);
    setPreview(null);
    setParseError(null);
    setUploadError(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  if (preview) {
    return (
      <PreviewTable
        preview={preview}
        onChange={setPreview}
        onReset={reset}
        onSave={() => uploadMutation.mutate()}
        isSaving={uploadMutation.isPending}
        isSaveError={uploadMutation.isError}
        saveError={uploadError}
      />
    );
  }

  return (
    <div className="space-y-6 w-full">
      <div className="flex items-center justify-between">
        <p className="text-sm text-slate-500">
          Chọn file Excel để import câu hỏi vào ngân hàng này.
        </p>
        <a
          href="/mau_import_cau_hoi.xlsx"
          download
          className="text-sm font-medium text-indigo-600 hover:text-indigo-500 flex items-center gap-1 shrink-0"
        >
          <FileText className="h-4 w-4" /> Tải template
        </a>
      </div>

      <div
        onClick={() => fileInputRef.current?.click()}
        className={clsx(
          'relative flex flex-col items-center justify-center border-2 border-dashed rounded-3xl p-10 cursor-pointer transition-all',
          file
            ? 'bg-indigo-50/50 border-indigo-200'
            : 'bg-slate-50/50 border-slate-200 hover:border-slate-300',
        )}
      >
        <input
          type="file"
          ref={fileInputRef}
          onChange={onFileChange}
          className="hidden"
          accept=".xlsx"
        />
        {!file ? (
          <>
            <Upload className="h-10 w-10 text-slate-300 mb-3" />
            <p className="text-sm font-medium text-slate-700">
              Bấm để chọn file .xlsx
            </p>
            <p className="text-xs text-slate-400 mt-1">Tối đa 5MB</p>
          </>
        ) : (
          <div className="flex items-center gap-3 w-full">
            <FileText className="h-10 w-10 text-indigo-600 shrink-0" />
            <div className="flex-1 min-w-0">
              <p className="font-semibold text-slate-900 truncate">
                {file.name}
              </p>
              <p className="text-xs text-slate-500">
                {(file.size / 1024).toFixed(1)} KB
              </p>
            </div>
            <button
              onClick={(e) => {
                e.stopPropagation();
                reset();
              }}
              className="p-2 text-red-400 hover:text-red-600 transition"
            >
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
          <p className="text-sm text-amber-700">
            File này đã được import trước đó. Bạn vẫn có thể tiếp tục nếu muốn.
          </p>
        </div>
      )}
      {file && !checkHashMutation.isPending && !parseError && (
        <div className="flex gap-3 rounded-2xl bg-emerald-50 border border-emerald-200 p-4">
          <CheckCircle2 className="h-5 w-5 text-emerald-600 shrink-0 mt-0.5" />
          <p className="text-sm text-emerald-700">
            {isDuplicate
              ? 'File hợp lệ (đã tồn tại).'
              : 'File hợp lệ. Sẵn sàng preview.'}
          </p>
        </div>
      )}
      {parseError && (
        <div className="flex gap-3 rounded-2xl bg-red-50 border border-red-200 p-4">
          <AlertCircle className="h-5 w-5 text-red-600 shrink-0 mt-0.5" />
          <div>
            <p className="text-sm text-red-700 font-medium">Lỗi khi đọc file</p>
            <p className="text-xs text-red-600 mt-1">{parseError}</p>
          </div>
        </div>
      )}

      <Button
        onClick={() => parseMutation.mutate()}
        disabled={!file}
        isLoading={parseMutation.isPending}
        icon={<FileText className="h-4 w-4" />}
      >
        Xem trước câu hỏi
      </Button>
    </div>
  );
}
