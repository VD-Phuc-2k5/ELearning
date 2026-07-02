'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useRouter } from 'next/navigation';
import { z } from 'zod';
import { Button, Input } from '../../../../components/ui';
import {
  checkBankHash,
  createBank,
  uploadExcel,
} from '../../../actions/quiz.actions';
import type { BankHashResult, QuestionBank } from '@learning-hub/domain';
import { useState, useRef } from 'react';
import {
  Upload,
  FileText,
  CheckCircle2,
  AlertCircle,
  Trash2,
  ShieldCheck,
} from 'lucide-react';
import { clsx } from 'clsx';

const createBankSchema = z.object({
  title: z.string().min(3, 'Title must be at least 3 characters'),
  description: z.string().optional(),
});

type CreateBankInput = z.infer<typeof createBankSchema>;

export default function CreateBankPage() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const [file, setFile] = useState<File | null>(null);
  const [fileHash, setFileHash] = useState<string | null>(null);
  const [isDuplicate, setIsDuplicate] = useState<boolean>(false);
  const [duplicateBank, setDuplicateBank] = useState<QuestionBank | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<CreateBankInput>({
    resolver: zodResolver(createBankSchema),
  });

  const calculateHash = async (file: File) => {
    const buffer = await file.arrayBuffer();
    const hashBuffer = await crypto.subtle.digest('SHA-256', buffer);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    return hashArray.map((b) => b.toString(16).padStart(2, '0')).join('');
  };

  const checkHashMutation = useMutation({
    mutationFn: (hash: string) => checkBankHash(hash),
    onSuccess: (data: BankHashResult) => {
      if (data.exists) {
        setIsDuplicate(true);
        setDuplicateBank(data.bank ?? null);
      } else {
        setIsDuplicate(false);
        setDuplicateBank(null);
      }
    },
  });

  const createMutation = useMutation({
    mutationFn: async (data: CreateBankInput) => {
      const bank = await createBank(data);
      if (file) {
        await uploadExcel(bank.id, file, fileHash ?? undefined);
      }
      return bank;
    },
    onSuccess: (bank) => {
      queryClient.invalidateQueries({ queryKey: ['my-banks'] });
      router.push(`/my-banks/${bank.id}`);
    },
  });

  const onFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      setFile(selectedFile);
      const hash = await calculateHash(selectedFile);
      setFileHash(hash);
      checkHashMutation.mutate(hash);
    }
  };

  const onSubmit = (data: CreateBankInput) => {
    createMutation.mutate(data);
  };

  return (
    <div className="max-w-3xl mx-auto space-y-8 py-4">
      <div>
        <h2 className="text-3xl font-bold text-slate-900">
          Create New Question Bank
        </h2>
        <p className="mt-1 text-slate-500">
          Build a question set and optionally import questions from Excel.
        </p>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        <div className="bg-white rounded-3xl border border-slate-200 p-8 shadow-sm space-y-8">
          <div className="space-y-6">
            <h3 className="text-xs font-semibold text-slate-400 uppercase tracking-wide">
              Basic Information
            </h3>
            <Input
              label="Bank Title"
              placeholder="e.g. Final Exam — Math Grade 12"
              error={errors.title?.message}
              {...register('title')}
            />
            <div className="space-y-2">
              <label className="block text-sm font-medium text-slate-700">
                Description{' '}
                <span className="text-slate-400 font-normal">(optional)</span>
              </label>
              <textarea
                className="w-full min-h-[100px] rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-950 focus:border-indigo-500 focus:ring-4 focus:ring-indigo-100 outline-none transition resize-none"
                placeholder="Brief description of this question bank..."
                {...register('description')}
              />
            </div>
          </div>

          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <h3 className="text-base font-semibold text-slate-900">
                Import from Excel
              </h3>
              <a
                href="/mau_import_cau_hoi.xlsx"
                download
                className="text-sm font-medium text-indigo-600 hover:text-indigo-500 flex items-center gap-1.5"
              >
                <FileText className="h-4 w-4" /> Download template
              </a>
            </div>

            <div
              onClick={() => fileInputRef.current?.click()}
              className={clsx(
                'relative flex flex-col items-center justify-center border-2 border-dashed rounded-3xl p-10 cursor-pointer transition-all',
                file
                  ? 'bg-indigo-50/50 border-indigo-200'
                  : 'bg-slate-50/50 border-slate-200 hover:bg-slate-50 hover:border-slate-300',
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
                  <div className="h-14 w-14 bg-white rounded-2xl shadow-sm border border-slate-100 flex items-center justify-center text-slate-300 mb-4">
                    <Upload className="h-7 w-7" />
                  </div>
                  <p className="text-sm font-medium text-slate-800">
                    Click to select or drag & drop an Excel file
                  </p>
                  <p className="text-xs text-slate-400 mt-1">
                    Supports .xlsx format (max 5 MB)
                  </p>
                </>
              ) : (
                <div className="flex items-center gap-4 w-full">
                  <div className="h-13 w-13 bg-indigo-600 rounded-2xl flex items-center justify-center text-white shadow-md shrink-0 p-3">
                    <FileText className="h-7 w-7" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-slate-900 truncate">
                      {file.name}
                    </p>
                    <p className="text-xs text-slate-400">
                      {(file.size / 1024).toFixed(1)} KB ·{' '}
                      {fileHash?.substring(0, 8)}...
                    </p>
                  </div>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      setFile(null);
                      setFileHash(null);
                      setIsDuplicate(false);
                    }}
                    className="h-9 w-9 flex items-center justify-center rounded-xl bg-white border border-red-100 text-red-400 hover:bg-red-50 transition"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              )}
            </div>

            {checkHashMutation.isPending && (
              <div className="flex items-center gap-2 text-sm text-slate-400">
                <div className="h-4 w-4 animate-spin rounded-full border-2 border-indigo-600 border-r-transparent" />
                Checking file integrity...
              </div>
            )}

            {isDuplicate && (
              <div className="rounded-2xl bg-amber-50 border border-amber-200 p-4 flex gap-3">
                <AlertCircle className="h-5 w-5 text-amber-600 shrink-0 mt-0.5" />
                <div>
                  <p className="text-sm font-bold text-amber-800">
                    Warning: Duplicate file detected
                  </p>
                  <p className="text-sm text-amber-700 mt-0.5">
                    This file was already uploaded in bank:{' '}
                    <span className="font-semibold">
                      &ldquo;{duplicateBank?.title}&rdquo;
                    </span>
                    . You can still continue creating a new bank.
                  </p>
                </div>
              </div>
            )}

            {file && !isDuplicate && !checkHashMutation.isPending && (
              <div className="rounded-2xl bg-emerald-50 border border-emerald-200 p-4 flex gap-3">
                <CheckCircle2 className="h-5 w-5 text-emerald-600 shrink-0 mt-0.5" />
                <div>
                  <p className="text-sm font-bold text-emerald-800">
                    File verified
                  </p>
                  <p className="text-sm text-emerald-700 mt-0.5">
                    Hash:{' '}
                    <code className="bg-emerald-100 px-1.5 py-0.5 rounded text-xs">
                      {fileHash?.substring(0, 16)}...
                    </code>{' '}
                    · Ready to import.
                  </p>
                </div>
              </div>
            )}
          </div>

          <div className="pt-6 border-t border-slate-100 flex gap-3">
            <Button
              variant="secondary"
              onClick={() => router.back()}
              className="flex-1"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              isLoading={createMutation.isPending}
              className="flex-1"
            >
              Create Bank
            </Button>
          </div>
        </div>

        <div className="bg-slate-900 rounded-3xl p-6 text-white flex gap-5 items-center">
          <div className="h-12 w-12 rounded-2xl bg-white/10 flex items-center justify-center shrink-0">
            <ShieldCheck className="h-6 w-6 text-slate-300" />
          </div>
          <div>
            <p className="font-semibold">Your content, your ownership</p>
            <p className="text-sm text-slate-400 mt-0.5">
              Every bank you create is owned by you. You control sharing
              permissions at any time.
            </p>
          </div>
        </div>
      </form>
    </div>
  );
}
