'use client';

import { useEffect, useRef, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import Link from 'next/link';
import gsap from 'gsap';
import QuizService, { type Question, type Tag, type UploadHistory } from '../../../../services/quiz.service';
import { Button, useConfirmModal } from '../../../../components/ui';
import {
    ArrowLeft,
    BookOpen,
    Upload,
    History,
    Trash2,
    Edit3,
    Play,
    CheckCircle2,
    AlertCircle,
    FileText,
    Clock,
    ChevronDown,
    ChevronUp,
    X,
    Save,
} from 'lucide-react';
import { clsx } from 'clsx';

type Tab = 'questions' | 'upload' | 'history';

export default function BankDetailPage() {
    const { id } = useParams<{ id: string }>();
    const router = useRouter();
    const queryClient = useQueryClient();
    const pageRef = useRef<HTMLDivElement>(null);
    const [tab, setTab] = useState<Tab>('questions');
    const [tagOpen, setTagOpen] = useState(false);
    const { modal: confirmModal, openConfirm } = useConfirmModal();

    const { data: bank, isLoading: bankLoading } = useQuery({
        queryKey: ['bank', id],
        queryFn: () => QuizService.getBankDetail(id),
    });

    const { data: questions = [], isLoading: questionsLoading } = useQuery({
        queryKey: ['bank-questions', id],
        queryFn: () => QuizService.getQuestionsForQuiz(id, true),
        enabled: tab === 'questions',
    });

    const { data: history = [], isLoading: historyLoading } = useQuery({
        queryKey: ['bank-history', id],
        queryFn: () => QuizService.getUploadHistory(id),
        enabled: tab === 'history',
    });

    const { data: allTags = [] } = useQuery({
        queryKey: ['tags'],
        queryFn: () => QuizService.getTags(),
    });

    const invalidateBank = () => {
        queryClient.invalidateQueries({ queryKey: ['bank', id] });
        queryClient.invalidateQueries({ queryKey: ['my-banks'] });
    };

    const updateTagsMutation = useMutation({
        mutationFn: (tagIds: number[]) => QuizService.updateBank(id, { tagIds }),
        onSuccess: invalidateBank,
    });

    const publishMutation = useMutation({
        mutationFn: (statusId: string) => QuizService.updateBank(id, { statusId }),
        onSuccess: invalidateBank,
    });

    const [title, setTitle] = useState('');
    const [description, setDescription] = useState('');
    useEffect(() => {
        if (bank) { setTitle(bank.title); setDescription(bank.description ?? ''); }
    }, [bank?.id]);

    const updateInfoMutation = useMutation({
        mutationFn: (data: { title?: string; description?: string }) => QuizService.updateBank(id, data),
        onSuccess: invalidateBank,
    });

    const [newTagName, setNewTagName] = useState('');
    const [tagSearch, setTagSearch] = useState('');
    const createTagMutation = useMutation({
        mutationFn: (name: string) => QuizService.createTag(name),
        onSuccess: (tag) => {
            queryClient.invalidateQueries({ queryKey: ['tags'] });
            updateTagsMutation.mutate([...(bank?.tags ?? []).map((t: Tag) => t.id), tag.id]);
            setNewTagName('');
        },
    });
    const deleteTagMutation = useMutation({
        mutationFn: (tagId: number) => QuizService.deleteTag(tagId),
        onSuccess: () => queryClient.invalidateQueries({ queryKey: ['tags'] }),
    });

    useEffect(() => {
        if (!pageRef.current) return;
        gsap.fromTo(pageRef.current, { opacity: 0, y: 16 }, { opacity: 1, y: 0, duration: 0.4, ease: 'power2.out' });
    }, []);

    const deleteBankMutation = useMutation({
        mutationFn: () => QuizService.deleteBank(id),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['my-banks'] });
            router.push('/my-banks');
        },
    });

    const handleDeleteBank = () => {
        openConfirm(`Delete bank "${bank?.title}"? All questions will be permanently deleted.`, () => deleteBankMutation.mutate());
    };

    if (bankLoading) {
        return (
            <div className="space-y-6 animate-pulse">
                <div className="h-10 bg-slate-100 rounded-xl w-64" />
                <div className="h-40 bg-slate-100 rounded-3xl" />
                <div className="h-64 bg-slate-100 rounded-3xl" />
            </div>
        );
    }

    if (!bank) {
        return (
            <div className="flex flex-col items-center justify-center py-32 text-center">
                <AlertCircle className="h-12 w-12 text-slate-300 mb-4" />
                <h3 className="text-lg font-semibold text-slate-700">Question bank not found</h3>
                <Link href="/my-banks" className="mt-4 text-sm text-indigo-600 hover:underline">← Back to list</Link>
            </div>
        );
    }

    return (
        <div ref={pageRef} className="space-y-8">
            {/* Header */}
            <div className="flex items-start gap-4">
                <Link href="/my-banks" className="mt-1 p-2 rounded-xl hover:bg-slate-100 text-slate-500 hover:text-slate-900 transition shrink-0">
                    <ArrowLeft className="h-5 w-5" />
                </Link>
                <div className="flex-1 min-w-0">
                    <input
                        className="text-3xl font-bold text-slate-900 bg-transparent outline-none border-b-2 border-transparent focus:border-indigo-400 w-full truncate"
                        value={title}
                        onChange={e => setTitle(e.target.value)}
                        onBlur={() => { if (title.trim() && title !== bank.title) updateInfoMutation.mutate({ title: title.trim() }); }}
                    />
                    <input
                        className="text-slate-500 mt-1 bg-transparent outline-none border-b border-transparent focus:border-slate-300 w-full text-sm"
                        value={description}
                        onChange={e => setDescription(e.target.value)}
                        onBlur={() => { if (description !== (bank.description ?? '')) updateInfoMutation.mutate({ description }); }}
                        placeholder="No description"
                    />
                    <div className="flex flex-wrap items-center gap-2 mt-2 relative">
                        {(bank.tags ?? []).map((t: Tag) => (
                            <span key={t.id} className="flex items-center gap-1 text-xs bg-indigo-100 text-indigo-700 rounded-full px-2.5 py-0.5 font-medium">
                                {t.name}
                                <button onClick={() => updateTagsMutation.mutate((bank.tags ?? []).filter((x: Tag) => x.id !== t.id).map((x: Tag) => x.id))} className="hover:text-red-500 transition">
                                    <X className="h-3 w-3" />
                                </button>
                            </span>
                        ))}
                        <div className="relative">
                            <button onClick={() => setTagOpen(o => !o)} className="text-xs text-slate-500 border border-dashed border-slate-300 rounded-full px-2.5 py-0.5 hover:border-indigo-400 hover:text-indigo-600 transition">
                                + Tag
                            </button>
                            {tagOpen && (
                                <div className="absolute left-0 top-7 z-20 min-w-[200px] bg-white border border-slate-200 rounded-xl shadow-lg p-2 space-y-1">
                                    <input
                                        value={tagSearch}
                                        onChange={(e) => setTagSearch(e.target.value)}
                                        placeholder="Tìm tag…"
                                        className="w-full text-xs px-2 py-1.5 border border-slate-200 rounded-lg outline-none focus:border-indigo-400 mb-1"
                                        autoFocus
                                    />
                                    <div className="max-h-40 overflow-y-auto space-y-0.5">
                                        {allTags.filter((t: Tag) => t.name.toLowerCase().includes(tagSearch.toLowerCase())).map((t: Tag) => {
                                            const active = (bank.tags ?? []).some((x: Tag) => x.id === t.id);
                                            return (
                                                <div key={t.id} className="flex items-center gap-1">
                                                    <button
                                                        onClick={() => {
                                                            const next = active
                                                                ? (bank.tags ?? []).filter((x: Tag) => x.id !== t.id).map((x: Tag) => x.id)
                                                                : [...(bank.tags ?? []).map((x: Tag) => x.id), t.id];
                                                            updateTagsMutation.mutate(next);
                                                        }}
                                                        className={clsx('flex-1 text-left text-xs px-2 py-1.5 rounded-lg transition', active ? 'bg-indigo-50 text-indigo-700 font-medium' : 'hover:bg-slate-50 text-slate-700')}
                                                    >
                                                        {active ? '✓ ' : ''}{t.name}
                                                    </button>
                                                    <button
                                                        onClick={() => openConfirm(`Xóa tag "${t.name}" khỏi hệ thống?`, () => deleteTagMutation.mutate(t.id))}
                                                        className="p-1 text-slate-300 hover:text-red-500 transition rounded shrink-0"
                                                        title="Xóa tag"
                                                    >
                                                        <X className="h-3 w-3" />
                                                    </button>
                                                </div>
                                            );
                                        })}
                                    </div>
                                    <div className="border-t border-slate-100 pt-1 mt-1">
                                        <form onSubmit={(e) => { e.preventDefault(); if (newTagName.trim()) createTagMutation.mutate(newTagName.trim()); }} className="flex gap-1">
                                            <input
                                                value={newTagName}
                                                onChange={(e) => setNewTagName(e.target.value)}
                                                placeholder="Tạo tag mới…"
                                                className="flex-1 text-xs px-2 py-1 border border-slate-200 rounded-lg outline-none focus:border-indigo-400"
                                            />
                                            <button type="submit" disabled={!newTagName.trim() || createTagMutation.isPending} className="text-xs px-2 py-1 bg-indigo-600 text-white rounded-lg disabled:opacity-40 hover:bg-indigo-700 transition">
                                                +
                                            </button>
                                        </form>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                    <Link href={`/quiz/${id}`}>
                        <Button size="md" icon={<Play className="h-4 w-4" />}>Start quiz</Button>
                    </Link>
                    <Button
                        variant="secondary"
                        size="md"
                        onClick={() => publishMutation.mutate(bank.statusId === 'published' ? 'draft' : 'published')}
                        isLoading={publishMutation.isPending}
                        className={bank.statusId === 'published' ? 'text-amber-600 border-amber-300 hover:bg-amber-50' : 'text-emerald-600 border-emerald-300 hover:bg-emerald-50'}
                    >
                        {bank.statusId === 'published' ? 'Unpublish' : 'Publish'}
                    </Button>
                    <Button variant="secondary" size="md" onClick={handleDeleteBank} isLoading={deleteBankMutation.isPending}>
                        <Trash2 className="h-4 w-4 text-red-500" />
                    </Button>
                </div>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-3 gap-4">
                {[
                    { label: 'Total questions', value: bank.totalQuestions },
                    { label: 'Status', value: bank.statusId === 'published' ? 'Published' : 'Draft' },
                    { label: 'Updated', value: new Date(bank.updatedAt).toLocaleDateString('en-US') },
                ].map(({ label, value }) => (
                    <div key={label} className="bg-white rounded-2xl border border-slate-100 p-5 text-center shadow-sm">
                        <p className="text-xs text-slate-500 font-medium">{label}</p>
                        <p className="text-xl font-bold text-slate-900 mt-1">{value}</p>
                    </div>
                ))}
            </div>

            {/* Tabs */}
            <div className="bg-white rounded-3xl border border-slate-100 shadow-sm overflow-hidden">
                <div className="flex border-b border-slate-100">
                    {([
                        { key: 'questions', label: 'Questions', Icon: BookOpen },
                        { key: 'upload', label: 'Import Excel', Icon: Upload },
                        { key: 'history', label: 'Import History', Icon: History },
                    ] as { key: Tab; label: string; Icon: React.ElementType }[]).map(({ key, label, Icon }) => (
                        <button
                            key={key}
                            onClick={() => setTab(key)}
                            className={clsx(
                                'flex items-center gap-2 px-6 py-4 text-sm font-medium border-b-2 transition',
                                tab === key
                                    ? 'border-indigo-600 text-indigo-700 bg-indigo-50/50'
                                    : 'border-transparent text-slate-500 hover:text-slate-900 hover:bg-slate-50'
                            )}
                        >
                            <Icon className="h-4 w-4" />
                            {label}
                        </button>
                    ))}
                </div>

                <div className="p-6">
                    {tab === 'questions' && (
                        <QuestionsTab
                            questions={questions}
                            isLoading={questionsLoading}
                            onDeleted={() => {
                                queryClient.invalidateQueries({ queryKey: ['bank-questions', id] });
                                queryClient.invalidateQueries({ queryKey: ['bank', id] });
                            }}
                            onUpdated={() => queryClient.invalidateQueries({ queryKey: ['bank-questions', id] })}
                        />
                    )}
                    {tab === 'upload' && (
                        <UploadTab bankId={id} onSuccess={() => {
                            queryClient.invalidateQueries({ queryKey: ['bank', id] });
                            queryClient.invalidateQueries({ queryKey: ['bank-questions', id] });
                            queryClient.invalidateQueries({ queryKey: ['bank-history', id] });
                            setTab('questions');
                        }} />
                    )}
                    {tab === 'history' && (
                        <HistoryTab history={history} isLoading={historyLoading} />
                    )}
                </div>
            </div>
        {confirmModal}
        </div>
    );
}

// ─── Questions Tab ─────────────────────────────────────────────────────────────

function QuestionsTab({ questions, isLoading, onDeleted, onUpdated }: {
    questions: Question[];
    isLoading: boolean;
    onDeleted: () => void;
    onUpdated: () => void;
}) {
    if (isLoading) {
        return (
            <div className="space-y-3">
                {[1, 2, 3].map(i => <div key={i} className="h-16 animate-pulse bg-slate-100 rounded-xl" />)}
            </div>
        );
    }
    if (!questions.length) {
        return (
            <div className="flex flex-col items-center py-12 text-center text-slate-500">
                <BookOpen className="h-10 w-10 mb-3 text-slate-300" />
                <p className="font-medium">No questions yet</p>
                <p className="text-sm mt-1">Switch to the "Import Excel" tab to add questions.</p>
            </div>
        );
    }

    return (
        <div className="space-y-3">
            <p className="text-sm text-slate-500 font-medium">{questions.length} questions</p>
            {questions.map((q, idx) => (
                <QuestionCard key={q.id} question={q} index={idx} onDeleted={onDeleted} onUpdated={onUpdated} />
            ))}
        </div>
    );
}

function QuestionCard({ question, index, onDeleted, onUpdated }: {
    question: Question;
    index: number;
    onDeleted: () => void;
    onUpdated: () => void;
}) {
    const [expanded, setExpanded] = useState(false);
    const [editing, setEditing] = useState(false);
    const { modal: confirmModal, openConfirm } = useConfirmModal();
    const [content, setContent] = useState(question.content);
    const [options, setOptions] = useState(() => [...question.answerOptions].sort((a, b) => a.optionLabel.localeCompare(b.optionLabel)).map(o => ({ ...o })));
    const [correctLabels, setCorrectLabels] = useState<string[]>(() =>
        question.answerOptions
            .filter(o => question.correctAnswerOptionIds?.includes(o.id))
            .map(o => o.optionLabel)
    );

    const deleteMutation = useMutation({
        mutationFn: () => QuizService.deleteQuestion(question.id),
        onSuccess: onDeleted,
    });

    const updateMutation = useMutation({
        mutationFn: () => QuizService.updateQuestion(question.id, {
            content,
            answerOptions: options.map(o => ({ optionLabel: o.optionLabel, content: o.content })),
            correctOptionLabels: correctLabels,
        }),
        onSuccess: () => { setEditing(false); onUpdated(); },
    });

    const cancelEdit = () => {
        setEditing(false);
        setContent(question.content);
        setOptions(question.answerOptions.map(o => ({ ...o })));
        setCorrectLabels(question.answerOptions.filter(o => question.correctAnswerOptionIds?.includes(o.id)).map(o => o.optionLabel));
    };

    return (
        <div className="rounded-2xl border border-slate-100 bg-slate-50/50">
            <div className="flex items-start gap-3 p-4">
                <span className="shrink-0 mt-0.5 h-6 w-6 rounded-full bg-indigo-100 text-indigo-700 text-xs font-bold flex items-center justify-center">
                    {index + 1}
                </span>
                {editing ? (
                    <div className="flex-1 space-y-3">
                        <textarea
                            className="w-full rounded-xl border border-slate-200 px-3 py-2 text-sm focus:border-indigo-500 focus:ring-4 focus:ring-indigo-100 outline-none resize-none"
                            rows={3}
                            value={content}
                            onChange={e => setContent(e.target.value)}
                        />
                        <div className="space-y-2">
                            <p className="text-xs font-semibold text-slate-500">Đáp án (click radio để chọn đáp án đúng)</p>
                            {options.map((opt, oi) => (
                                <div key={opt.id} className="flex items-center gap-2">
                                    <input
                                        type="radio"
                                        name={`correct-${question.id}`}
                                        checked={correctLabels.includes(opt.optionLabel)}
                                        onChange={() => setCorrectLabels([opt.optionLabel])}
                                        className="accent-emerald-600 shrink-0"
                                    />
                                    <span className="h-5 w-5 rounded-full bg-slate-200 text-slate-600 text-xs font-bold flex items-center justify-center shrink-0">
                                        {opt.optionLabel}
                                    </span>
                                    <input
                                        className="flex-1 text-sm border border-slate-200 rounded-lg px-2 py-1 focus:border-indigo-400 outline-none"
                                        value={opt.content}
                                        onChange={e => setOptions(prev => prev.map((o, idx) => idx === oi ? { ...o, content: e.target.value } : o))}
                                    />
                                </div>
                            ))}
                        </div>
                        <div className="flex gap-2">
                            <Button size="sm" isLoading={updateMutation.isPending} onClick={() => updateMutation.mutate()} icon={<Save className="h-3 w-3" />}>
                                Save
                            </Button>
                            <Button size="sm" variant="ghost" onClick={cancelEdit}>
                                <X className="h-3 w-3" />
                            </Button>
                        </div>
                    </div>
                ) : (
                    <p className="flex-1 text-sm text-slate-800 leading-relaxed">{question.content}</p>
                )}
                <div className="flex items-center gap-1 shrink-0">
                    {!editing && (
                        <button onClick={() => setEditing(true)} className="p-1.5 text-slate-400 hover:text-indigo-600 transition rounded-lg hover:bg-indigo-50">
                            <Edit3 className="h-4 w-4" />
                        </button>
                    )}
                    <button
                        onClick={() => openConfirm('Delete this question?', () => deleteMutation.mutate())}
                        disabled={deleteMutation.isPending}
                        className="p-1.5 text-slate-400 hover:text-red-600 transition rounded-lg hover:bg-red-50"
                    >
                        <Trash2 className="h-4 w-4" />
                    </button>
                    {!editing && (
                        <button onClick={() => setExpanded(v => !v)} className="p-1.5 text-slate-400 hover:text-slate-700 transition rounded-lg hover:bg-slate-100">
                            {expanded ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                        </button>
                    )}
                </div>
            </div>
            {!editing && expanded && question.answerOptions.length > 0 && (
                <div className="px-4 pb-4 border-t border-slate-100 pt-3">
                    <div className="grid gap-1.5">
                        {[...question.answerOptions].sort((a, b) => a.optionLabel.localeCompare(b.optionLabel)).map(opt => {
                            const isCorrect = question.correctAnswerOptionIds?.includes(opt.id);
                            return (
                                <div key={opt.id} className={clsx('flex items-center gap-2 text-sm rounded-lg px-2 py-1.5', isCorrect ? 'bg-emerald-50 border border-emerald-200' : 'border border-transparent')}>
                                    <span className={clsx('h-6 w-6 rounded-full text-xs font-bold flex items-center justify-center shrink-0', isCorrect ? 'bg-emerald-500 text-white' : 'bg-slate-200 text-slate-600')}>
                                        {opt.optionLabel}
                                    </span>
                                    <span className={clsx('flex-1', isCorrect ? 'text-emerald-800 font-medium' : 'text-slate-700')}>{opt.content}</span>
                                    {isCorrect && <span className="text-xs font-semibold text-emerald-600 bg-emerald-100 rounded-full px-2 py-0.5 shrink-0">Đúng</span>}
                                </div>
                            );
                        })}
                    </div>
                </div>
            )}
            {confirmModal}
        </div>
    );
}

// ─── Upload Tab ────────────────────────────────────────────────────────────────

type ParsedQuestion = {
    content: string;
    explanation?: string;
    answerOptions: { optionLabel: string; content: string }[];
    correctOptionLabels: string[];
};

function UploadTab({ bankId, onSuccess }: { bankId: string; onSuccess: () => void }) {
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

    const onFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const f = e.target.files?.[0];
        if (!f) return;
        setFile(f);
        setPreview(null);
        const hash = await calculateHash(f);
        setFileHash(hash);
        checkHashMutation.mutate(hash);
    };

    const reset = () => { setFile(null); setFileHash(null); setIsDuplicate(false); setPreview(null); };

    // ── Step 2: Preview & edit before saving ──
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

    // ── Step 1: Pick file ──
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

// ─── History Tab ───────────────────────────────────────────────────────────────

function HistoryTab({ history, isLoading }: { history: UploadHistory[]; isLoading: boolean }) {
    if (isLoading) {
        return (
            <div className="space-y-3">
                {[1, 2, 3].map(i => <div key={i} className="h-14 animate-pulse bg-slate-100 rounded-xl" />)}
            </div>
        );
    }
    if (!history.length) {
        return (
            <div className="flex flex-col items-center py-12 text-center text-slate-500">
                <History className="h-10 w-10 mb-3 text-slate-300" />
                <p className="font-medium">No import history yet</p>
            </div>
        );
    }

    return (
        <div className="space-y-3">
            {history.map(h => (
                <div key={h.id} className="flex items-center gap-4 rounded-2xl border border-slate-100 bg-slate-50/50 p-4">
                    <div className="h-10 w-10 rounded-xl bg-indigo-100 text-indigo-600 flex items-center justify-center shrink-0">
                        <FileText className="h-5 w-5" />
                    </div>
                    <div className="flex-1 min-w-0">
                        <p className="text-sm font-semibold text-slate-900">{h.fileName || 'Manual import'}</p>
                        <p className="text-xs text-slate-500 flex items-center gap-1 mt-0.5">
                            <Clock className="h-3 w-3" />
                            {new Date(h.uploadedAt).toLocaleString('vi-VN')}
                        </p>
                    </div>
                    <span className="shrink-0 text-sm font-bold text-emerald-600 bg-emerald-50 rounded-full px-3 py-1">
                        +{h.totalQuestionsImported} questions
                    </span>
                </div>
            ))}
        </div>
    );
}
