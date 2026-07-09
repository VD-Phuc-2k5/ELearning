'use client';

import { useEffect, useState, useRef } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useParams } from 'next/navigation';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import {
  getStudentProblemDetail,
  submitStudentCode,
  getSubmissionStatus,
  getSampleTestCases,
} from '../../../actions/problem.actions';
import { executeCodeAction } from '../../../actions/sandbox.actions';
import { CodeEditor } from '../../playground/components/code-editor';
import { DEFAULT_TEMPLATES } from '../../playground/constants/templates';
import {
  ArrowLeft,
  Play,
  RotateCcw,
  CheckCircle,
  XCircle,
  Clock,
  Cpu,
  Loader2,
} from 'lucide-react';
import Link from 'next/link';

export default function SolveProblemPage() {
  const params = useParams();
  const problemId = params.id as string;

  const getLanguageLabel = (lang: string) => {
    switch (lang) {
      case 'python':
        return 'Python 3';
      case 'javascript':
        return 'Node.js';
      case 'typescript':
        return 'TypeScript';
      case 'cpp':
        return 'C++ (GCC)';
      case 'c':
        return 'C (GCC)';
      case 'java':
        return 'Java (JDK 17)';
      case 'go':
        return 'Go';
      case 'rust':
        return 'Rust';
      case 'csharp':
        return 'C# (.NET 8)';
      case 'swift':
        return 'Swift';
      default:
        return lang.toUpperCase();
    }
  };

  const [language, setLanguage] = useState<string>('python');
  const [code, setCode] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submission, setSubmission] = useState<any | null>(null);
  const [err, setErr] = useState('');

  // Sandbox testing states
  const [customInput, setCustomInput] = useState<string>('');
  const [isRunningCode, setIsRunningCode] = useState(false);
  const [runResult, setRunResult] = useState<any | null>(null);
  const [activeTab, setActiveTab] = useState<'input' | 'output'>('input');

  const pollTimerRef = useRef<NodeJS.Timeout | null>(null);

  const {
    data: problem,
    isLoading: isProblemLoading,
    error: problemError,
  } = useQuery<any>({
    queryKey: ['student-problem', problemId],
    queryFn: () => getStudentProblemDetail(problemId),
  });

  const { data: sampleTestCases } = useQuery<
    { input: string; expectedOutput: string }[]
  >({
    queryKey: ['problem-samples', problemId],
    queryFn: () => getSampleTestCases(problemId),
    enabled: !!problemId,
  });

  // Load sample input into custom input text area when problem loads
  useEffect(() => {
    if (sampleTestCases?.[0]?.input) {
      setCustomInput(sampleTestCases[0].input);
    }
  }, [sampleTestCases]);

  const handleRun = async () => {
    setIsRunningCode(true);
    setRunResult(null);
    setErr('');
    setActiveTab('output');
    try {
      // Apply driver wrapper if configured
      let codeToRun = code;
      const wrapper = problem?.wrappers?.[language];
      if (wrapper) {
        if (wrapper.includes('// {{STUDENT_CODE}}')) {
          codeToRun = wrapper.replace('// {{STUDENT_CODE}}', code);
        } else if (wrapper.includes('# {{STUDENT_CODE}}')) {
          codeToRun = wrapper.replace('# {{STUDENT_CODE}}', code);
        } else if (wrapper.includes('/* {{STUDENT_CODE}} */')) {
          codeToRun = wrapper.replace('/* {{STUDENT_CODE}} */', code);
        } else {
          codeToRun = `${code}\n\n${wrapper}`;
        }
      }

      const res = await executeCodeAction({
        language,
        sourceCode: codeToRun,
        stdin: customInput,
      });

      if (res.success) {
        setRunResult(res.data);
      } else {
        setErr(res.error || 'Chạy thử thất bại');
      }
    } catch (error: any) {
      setErr(error.message || 'Lỗi hệ thống khi chạy thử');
    } finally {
      setIsRunningCode(false);
    }
  };

  // Automatically initialize language and template code
  useEffect(() => {
    if (problem?.languages && problem.languages.length > 0) {
      const defaultLang = problem.languages[0];
      setLanguage(defaultLang);
      const customTemplate = problem.templates?.[defaultLang];
      setCode(customTemplate || (DEFAULT_TEMPLATES as any)[defaultLang] || '');
    }
  }, [problem]);

  const handleLanguageChange = (lang: string) => {
    setLanguage(lang);
    const customTemplate = problem.templates?.[lang];
    setCode(customTemplate || (DEFAULT_TEMPLATES as any)[lang] || '');
  };

  const handleReset = () => {
    if (confirm('Bạn chắc chắn muốn khôi phục code mẫu ban đầu?')) {
      const customTemplate = problem?.templates?.[language];
      setCode(customTemplate || (DEFAULT_TEMPLATES as any)[language] || '');
    }
  };

  // Poll submission status until completed
  const startPolling = (subId: string) => {
    if (pollTimerRef.current) clearInterval(pollTimerRef.current);

    pollTimerRef.current = setInterval(async () => {
      try {
        const res = await getSubmissionStatus(subId);
        if (res.status !== 'queued' && res.status !== 'running') {
          // Completed
          if (pollTimerRef.current) clearInterval(pollTimerRef.current);
          setSubmission(res);
          setIsSubmitting(false);
        } else {
          setSubmission(res); // Keep updating for running status
        }
      } catch (error) {
        console.error('Polling error:', error);
        if (pollTimerRef.current) clearInterval(pollTimerRef.current);
        setIsSubmitting(false);
      }
    }, 1000);
  };

  useEffect(() => {
    return () => {
      if (pollTimerRef.current) clearInterval(pollTimerRef.current);
    };
  }, []);

  const handleSubmit = async () => {
    setIsSubmitting(true);
    setSubmission(null);
    setErr('');
    try {
      const res = await submitStudentCode(problemId, {
        language,
        sourceCode: code,
      });
      setSubmission(res);
      startPolling(res.id);
    } catch (error: any) {
      setErr(error.message || 'Nộp bài thất bại');
      setIsSubmitting(false);
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'accepted':
        return (
          <span className="inline-flex items-center gap-1 bg-emerald-50 text-emerald-700 text-sm font-bold px-3 py-1 rounded-full border border-emerald-200">
            <CheckCircle className="h-4 w-4" /> Accepted (Chấp nhận)
          </span>
        );
      case 'wrong_answer':
        return (
          <span className="inline-flex items-center gap-1 bg-rose-50 text-rose-700 text-sm font-bold px-3 py-1 rounded-full border border-rose-200">
            <XCircle className="h-4 w-4" /> Wrong Answer (Sai kết quả)
          </span>
        );
      case 'time_limit_exceeded':
        return (
          <span className="inline-flex items-center gap-1 bg-amber-50 text-amber-700 text-sm font-bold px-3 py-1 rounded-full border border-amber-200">
            <Clock className="h-4 w-4" /> Time Limit Exceeded (Quá thời gian)
          </span>
        );
      case 'compilation_error':
        return (
          <span className="inline-flex items-center gap-1 bg-red-50 text-red-700 text-sm font-bold px-3 py-1 rounded-full border border-red-200">
            <XCircle className="h-4 w-4" /> Compilation Error (Lỗi biên dịch)
          </span>
        );
      case 'runtime_error':
        return (
          <span className="inline-flex items-center gap-1 bg-red-50 text-red-700 text-sm font-bold px-3 py-1 rounded-full border border-red-200">
            <XCircle className="h-4 w-4" /> Runtime Error (Lỗi thực thi)
          </span>
        );
      case 'memory_limit_exceeded':
        return (
          <span className="inline-flex items-center gap-1 bg-rose-50 text-rose-700 text-sm font-bold px-3 py-1 rounded-full border border-rose-200">
            <Cpu className="h-4 w-4" /> Memory Limit Exceeded (Quá bộ nhớ)
          </span>
        );
      case 'running':
        return (
          <span className="inline-flex items-center gap-1 bg-blue-50 text-blue-700 text-sm font-bold px-3 py-1 rounded-full border border-blue-200 animate-pulse">
            <Loader2 className="h-4 w-4 animate-spin" /> Judging (Đang chấm...)
          </span>
        );
      case 'queued':
        return (
          <span className="inline-flex items-center gap-1 bg-slate-100 text-slate-700 text-sm font-bold px-3 py-1 rounded-full border border-slate-200">
            Queued (Đang xếp hàng...)
          </span>
        );
      default:
        return null;
    }
  };

  if (isProblemLoading) {
    return (
      <div className="flex flex-col items-center justify-center py-20 gap-4">
        <Loader2 className="h-8 w-8 text-indigo-600 animate-spin" />
        <p className="text-slate-500 text-sm">Đang tải đề bài...</p>
      </div>
    );
  }

  if (problemError) {
    return (
      <div className="text-center py-16 px-4">
        <h3 className="text-slate-800 font-bold text-lg mb-1">
          Lỗi tải đề bài
        </h3>
        <p className="text-slate-500 text-sm mb-6">
          {(problemError as Error)?.message ||
            'Không thể tải đề bài. Vui lòng thử lại sau.'}
        </p>
        <Link
          href="/problems"
          className="text-indigo-600 hover:underline text-sm"
        >
          Quay lại danh sách đề bài
        </Link>
      </div>
    );
  }

  if (!problem) {
    return (
      <div className="text-center py-16 px-4">
        <h3 className="text-slate-800 font-bold text-lg mb-1">
          Đề bài không tồn tại
        </h3>
        <Link
          href="/problems"
          className="text-indigo-600 hover:underline text-sm"
        >
          Quay lại danh sách đề bài
        </Link>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6">
      {/* Back button */}
      <div>
        <Link
          href="/problems"
          className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-500 hover:text-indigo-600 transition"
        >
          <ArrowLeft className="h-4 w-4" /> Quay lại danh sách
        </Link>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left pane: Description */}
        <div className="lg:col-span-5 space-y-6">
          <div className="bg-white border border-slate-200 rounded-3xl p-6 space-y-4">
            <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">
              {problem.title}
            </h1>

            <div className="flex gap-4 text-xs font-medium text-slate-500 border-b border-slate-100 pb-3">
              <div className="flex items-center gap-1">
                <Clock className="h-4 w-4 text-slate-400" />
                Giới hạn: {problem.timeLimitMs}ms
              </div>
              <div className="flex items-center gap-1">
                <Cpu className="h-4 w-4 text-slate-400" />
                RAM: {problem.memoryLimitMb}MB
              </div>
            </div>

            <div className="prose prose-slate max-w-none text-sm text-slate-600 leading-relaxed">
              <ReactMarkdown remarkPlugins={[remarkGfm]}>
                {problem.description}
              </ReactMarkdown>
            </div>
          </div>

          {sampleTestCases && sampleTestCases.length > 0 && (
            <div className="bg-white border border-slate-200 rounded-3xl p-6 space-y-4">
              <h3 className="text-sm font-bold text-slate-800">Ví dụ mẫu</h3>
              <div className="space-y-5">
                {sampleTestCases.map((sample, idx) => (
                  <div key={idx} className="space-y-3">
                    {sampleTestCases.length > 1 && (
                      <div className="text-xs font-bold text-slate-400">
                        Ví dụ {idx + 1}
                      </div>
                    )}
                    <div>
                      <div className="text-xs font-bold text-slate-500 mb-1">
                        Sample Input
                      </div>
                      <pre className="bg-slate-950 text-slate-100 p-3 rounded-xl font-mono text-xs overflow-x-auto">
                        {sample.input || <span className="italic">—</span>}
                      </pre>
                    </div>
                    <div>
                      <div className="text-xs font-bold text-slate-500 mb-1">
                        Sample Output
                      </div>
                      <pre className="bg-slate-950 text-slate-100 p-3 rounded-xl font-mono text-xs overflow-x-auto">
                        {sample.expectedOutput}
                      </pre>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Right pane: Editor & Results */}
        <div className="lg:col-span-7 space-y-6">
          {/* Editor Header / Select Language */}
          <div className="bg-white border border-slate-200 rounded-3xl p-4 flex justify-between items-center gap-4">
            <div className="flex items-center gap-2">
              <label className="text-xs font-bold text-slate-700">
                Ngôn ngữ:
              </label>
              <select
                value={language}
                onChange={(e) => handleLanguageChange(e.target.value)}
                className="rounded-xl border border-slate-200 px-3 py-1.5 text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
              >
                {problem.languages.map((lang: string) => (
                  <option key={lang} value={lang}>
                    {getLanguageLabel(lang)}
                  </option>
                ))}
              </select>
            </div>

            <button
              onClick={handleReset}
              className="text-xs font-medium text-slate-500 hover:text-indigo-600 flex items-center gap-1"
            >
              <RotateCcw className="h-3 w-3" /> Khôi phục mẫu
            </button>
          </div>

          {/* Editor */}
          <CodeEditor
            code={code}
            setCode={setCode}
            language={language}
            onReset={handleReset}
          />

          {/* Submit Action */}
          <div className="flex justify-end gap-3">
            <button
              onClick={handleRun}
              disabled={isRunningCode || isSubmitting || !code.trim()}
              className="inline-flex items-center gap-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-sm py-3 px-6 rounded-2xl transition disabled:opacity-60 cursor-pointer"
            >
              {isRunningCode ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin text-slate-500" />{' '}
                  Đang chạy...
                </>
              ) : (
                <>
                  <Play className="h-4 w-4 text-slate-500" /> Chạy thử
                </>
              )}
            </button>
            <button
              onClick={handleSubmit}
              disabled={isRunningCode || isSubmitting || !code.trim()}
              className="inline-flex items-center gap-1.5 bg-indigo-600 text-white font-bold text-sm py-3 px-6 rounded-2xl hover:bg-indigo-700 transition disabled:opacity-60 shadow-sm cursor-pointer"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" /> Đang chấm điểm...
                </>
              ) : (
                <>
                  <CheckCircle className="h-4 w-4" /> Nộp bài (Submit)
                </>
              )}
            </button>
          </div>

          {/* Sandbox Running / Custom input Panel */}
          <div className="bg-white border border-slate-200 rounded-3xl p-6 space-y-4 shadow-sm">
            <div className="flex border-b border-slate-100 pb-2 gap-4">
              <button
                type="button"
                onClick={() => setActiveTab('input')}
                className={`text-sm font-bold pb-2 border-b-2 transition ${
                  activeTab === 'input'
                    ? 'border-indigo-600 text-indigo-600'
                    : 'border-transparent text-slate-400 hover:text-slate-600'
                }`}
              >
                Dữ liệu chạy thử (Custom Input)
              </button>
              {(runResult || isRunningCode) && (
                <button
                  type="button"
                  onClick={() => setActiveTab('output')}
                  className={`text-sm font-bold pb-2 border-b-2 transition ${
                    activeTab === 'output'
                      ? 'border-indigo-600 text-indigo-600'
                      : 'border-transparent text-slate-400 hover:text-slate-600'
                  }`}
                >
                  Kết quả chạy thử
                </button>
              )}
            </div>

            {activeTab === 'input' && (
              <div className="space-y-2">
                <label className="block text-xs font-semibold text-slate-500">
                  Nhập Standard Input (stdin) để chạy thử code của bạn:
                </label>
                <textarea
                  value={customInput}
                  onChange={(e) => setCustomInput(e.target.value)}
                  placeholder="Dữ liệu đầu vào..."
                  className="w-full h-24 p-4 font-mono text-sm border border-slate-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-indigo-500/20 bg-slate-50 text-slate-800"
                />
              </div>
            )}

            {activeTab === 'output' && (
              <div className="space-y-4">
                {isRunningCode && (
                  <div className="flex items-center gap-2 text-sm text-slate-500 justify-center py-6">
                    <Loader2 className="h-4 w-4 animate-spin text-indigo-600" />
                    Đang gửi code lên Sandbox chạy thử...
                  </div>
                )}

                {!isRunningCode && runResult && (
                  <div className="space-y-3">
                    <div className="flex items-center justify-between text-xs font-semibold text-slate-500">
                      <span>
                        Trạng thái:
                        <span
                          className={`ml-1 font-bold ${
                            runResult.status === 'success'
                              ? 'text-emerald-600'
                              : 'text-rose-600'
                          }`}
                        >
                          {runResult.status.toUpperCase()}
                        </span>
                      </span>
                      {runResult.executionTimeMs !== undefined && (
                        <span>Thời gian: {runResult.executionTimeMs} ms</span>
                      )}
                    </div>

                    {runResult.stdout !== undefined && (
                      <div className="space-y-1">
                        <span className="block text-xs font-bold text-slate-500">
                          Dữ liệu ra (stdout):
                        </span>
                        <pre className="bg-slate-950 text-emerald-400 p-4 rounded-2xl font-mono text-xs overflow-x-auto whitespace-pre-wrap max-h-48">
                          {runResult.stdout || (
                            <span className="italic text-slate-500">
                              Không có dữ liệu ra
                            </span>
                          )}
                        </pre>
                      </div>
                    )}

                    {runResult.stderr ? (
                      <div className="space-y-1">
                        <span className="block text-xs font-bold text-rose-500">
                          Lỗi thực thi (stderr):
                        </span>
                        <pre className="bg-slate-950 text-rose-400 p-4 rounded-2xl font-mono text-xs overflow-x-auto whitespace-pre-wrap max-h-48">
                          {runResult.stderr}
                        </pre>
                      </div>
                    ) : null}
                  </div>
                )}
              </div>
            )}
          </div>

          {err && (
            <p className="text-sm text-red-600 bg-red-50 rounded-2xl px-6 py-4 border border-red-100">
              {err}
            </p>
          )}

          {/* Judged Outcomes Panel */}
          {submission && (
            <div className="bg-white border border-slate-200 rounded-3xl p-6 space-y-4">
              <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-100 pb-3">
                <h3 className="text-sm font-bold text-slate-800">
                  Kết quả chấm bài
                </h3>
                {getStatusBadge(submission.status)}
              </div>

              {submission.status === 'compilation_error' && (
                <div className="space-y-1">
                  <div className="text-xs font-bold text-red-600">
                    Console Compile Error Output:
                  </div>
                  <pre className="bg-slate-950 text-rose-400 p-4 rounded-2xl font-mono text-xs overflow-x-auto whitespace-pre-wrap">
                    {submission.errorMessage}
                  </pre>
                </div>
              )}

              {submission.status !== 'queued' &&
                submission.status !== 'running' &&
                submission.status !== 'compilation_error' && (
                  <div className="space-y-4">
                    {/* General diagnostics */}
                    <div className="grid grid-cols-3 gap-4 border border-slate-100 rounded-2xl p-4 bg-slate-50">
                      <div className="text-center">
                        <div className="text-[10px] font-bold text-slate-500 uppercase">
                          Điểm số
                        </div>
                        <div className="text-lg font-black text-slate-800">
                          {submission.score}đ
                        </div>
                      </div>
                      <div className="text-center">
                        <div className="text-[10px] font-bold text-slate-500 uppercase">
                          Thời gian tối đa
                        </div>
                        <div className="text-lg font-black text-slate-800">
                          {submission.executionTimeMs || 0} ms
                        </div>
                      </div>
                      <div className="text-center">
                        <div className="text-[10px] font-bold text-slate-500 uppercase">
                          Bộ nhớ tối đa
                        </div>
                        <div className="text-lg font-black text-slate-800">
                          {submission.memoryUsedKb || 0} KB
                        </div>
                      </div>
                    </div>

                    {/* Detailed Test Cases */}
                    {submission.results && submission.results.length > 0 && (
                      <div className="space-y-2">
                        <div className="text-xs font-bold text-slate-500">
                          Đánh giá chi tiết từng Test Case:
                        </div>
                        <div className="space-y-2">
                          {submission.results.map((res: any, idx: number) => {
                            const isHidden = res.testCase?.isHidden ?? true;
                            return (
                              <div
                                key={res.id}
                                className="border border-slate-100 rounded-2xl p-4 space-y-3 bg-white"
                              >
                                <div className="flex items-center justify-between">
                                  <span className="text-xs font-bold text-slate-700">
                                    Test Case #{idx + 1}{' '}
                                    {isHidden && (
                                      <span className="text-[10px] text-slate-400 font-medium font-sans ml-1">
                                        (Ẩn)
                                      </span>
                                    )}
                                  </span>
                                  <span
                                    className={`text-xs font-extrabold uppercase px-2 py-0.5 rounded-md ${
                                      res.status === 'accepted'
                                        ? 'bg-emerald-50 text-emerald-700'
                                        : 'bg-rose-50 text-rose-700'
                                    }`}
                                  >
                                    {res.status === 'accepted'
                                      ? 'Passed'
                                      : res.status.toUpperCase()}
                                  </span>
                                </div>

                                {!isHidden && (
                                  <div className="grid grid-cols-2 gap-3 text-[11px] font-mono border-t border-slate-50 pt-2">
                                    <div>
                                      <div className="text-[10px] font-bold text-slate-400 mb-0.5 font-sans">
                                        Input:
                                      </div>
                                      <pre className="bg-slate-950 text-slate-100 p-2 rounded-lg truncate">
                                        {res.testCase?.input || (
                                          <span className="italic text-slate-400">
                                            None
                                          </span>
                                        )}
                                      </pre>
                                    </div>
                                    <div>
                                      <div className="text-[10px] font-bold text-slate-400 mb-0.5 font-sans">
                                        Expected Output:
                                      </div>
                                      <pre className="bg-slate-950 text-slate-100 p-2 rounded-lg truncate">
                                        {res.testCase?.expectedOutput}
                                      </pre>
                                    </div>
                                    <div className="col-span-2">
                                      <div className="text-[10px] font-bold text-slate-400 mb-0.5 font-sans">
                                        Actual Output:
                                      </div>
                                      <pre
                                        className={`bg-slate-950 p-2 rounded-lg overflow-x-auto ${res.status === 'accepted' ? 'text-emerald-400' : 'text-rose-400'}`}
                                      >
                                        {res.actualOutput || (
                                          <span className="italic text-slate-500">
                                            None
                                          </span>
                                        )}
                                      </pre>
                                    </div>
                                  </div>
                                )}

                                {isHidden && (
                                  <div className="text-center text-xs italic text-slate-400 py-1 bg-slate-50/50 rounded-xl">
                                    Các dữ liệu vào/ra chi tiết của test case ẩn
                                    được giấu để đảm bảo tính khách quan.
                                  </div>
                                )}
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    )}
                  </div>
                )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
