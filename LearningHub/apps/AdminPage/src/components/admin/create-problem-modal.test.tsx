import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { CreateProblemModal } from './create-problem-modal';
import { createProblem } from '../../app/actions/problem.actions';

jest.mock('../../app/actions/problem.actions', () => ({
  createProblem: jest.fn(),
}));

jest.mock('../../lib/admin-api', () => ({
  inputCls: 'input-cls',
  btnPrimary: 'btn-primary',
  btnSecondary: 'btn-secondary',
  getAxiosMessage: (_e: unknown, fallback: string) => fallback,
}));

jest.mock('./modal', () => ({
  Modal: ({
    children,
    title,
  }: {
    children: React.ReactNode;
    title: string;
  }) => (
    <div data-testid="modal">
      <h2>{title}</h2>
      {children}
    </div>
  ),
}));

jest.mock('./markdown-editor', () => ({
  MarkdownEditor: ({
    value,
    onChange,
    placeholder,
  }: {
    value: string;
    onChange: (v: string) => void;
    placeholder?: string;
  }) => (
    <textarea
      data-testid="markdown-editor"
      value={value}
      onChange={(e) => onChange(e.target.value)}
      placeholder={placeholder}
    />
  ),
}));

jest.mock('./code-input', () => ({
  CodeInput: ({
    value,
    onChange,
  }: {
    value: string;
    onChange: (v: string) => void;
  }) => <textarea value={value} onChange={(e) => onChange(e.target.value)} />,
}));

jest.mock('./manage-test-cases-modal', () => ({
  ManageTestCasesModal: ({ problemTitle }: { problemTitle: string }) => (
    <div data-testid="manage-test-cases-modal">{problemTitle}</div>
  ),
}));

const mockCreateProblem = createProblem as jest.MockedFunction<
  typeof createProblem
>;

function renderModal(onClose = jest.fn()) {
  const client = new QueryClient({
    defaultOptions: { queries: { retry: false }, mutations: { retry: false } },
  });
  return render(
    <QueryClientProvider client={client}>
      <CreateProblemModal onClose={onClose} />
    </QueryClientProvider>,
  );
}

function getTitleInput() {
  return screen.getByPlaceholderText(/Tính tổng/i) as HTMLInputElement;
}

function getDescriptionEditor() {
  return screen.getByTestId('markdown-editor') as HTMLTextAreaElement;
}

function getSubmitButton() {
  return screen.getByRole('button', { name: /Tạo đề bài/i });
}

function getNumberInputs() {
  return document.querySelectorAll('input[type="number"]');
}

// Returns all non-editor textareas (language template/wrapper fields)
function getLangTextareas() {
  return Array.from(document.querySelectorAll('textarea')).filter(
    (t) => !t.dataset.testid,
  );
}

// Fill the minimum valid form. Default langs are python + javascript.
async function fillAllRequired() {
  fireEvent.change(getTitleInput(), { target: { value: 'Two Sum' } });
  fireEvent.change(getDescriptionEditor(), {
    target: { value: 'Given an array, return indices.' },
  });

  // timeLimitMs (index 0), memoryLimitMb (index 1)
  const numInputs = getNumberInputs();
  if (numInputs[0])
    fireEvent.change(numInputs[0], { target: { value: '1000' } });
  if (numInputs[1])
    fireEvent.change(numInputs[1], { target: { value: '256' } });

  // getLangTextareas() returns: [0]=python-template, [1]=python-wrapper, [2]=js-template, [3]=js-wrapper
  const langTAs = getLangTextareas();
  if (langTAs[0])
    fireEvent.change(langTAs[0], {
      target: { value: 'class Solution:\n    def solve(self): pass' },
    });
  if (langTAs[1])
    fireEvent.change(langTAs[1], {
      target: { value: '{{STUDENT_CODE}}\nprint(Solution().solve())' },
    });
  if (langTAs[2])
    fireEvent.change(langTAs[2], { target: { value: 'function solve() {}' } });
  if (langTAs[3])
    fireEvent.change(langTAs[3], {
      target: { value: '{{STUDENT_CODE}}\nconsole.log(solve())' },
    });
}

describe('AdminPage — CreateProblemModal validation (TC082–TC097)', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('TC083 — renders modal with title input and submit button', () => {
    renderModal();
    expect(getTitleInput()).toBeTruthy();
    expect(getDescriptionEditor()).toBeTruthy();
    expect(getSubmitButton()).toBeTruthy();
  });

  it('TC085 — submit button is disabled when title is empty (default state)', () => {
    renderModal();
    expect((getSubmitButton() as HTMLButtonElement).disabled).toBe(true);
  });

  it('TC086 — shows error when title exceeds 200 characters', async () => {
    renderModal();
    fireEvent.change(getTitleInput(), { target: { value: 'a'.repeat(201) } });
    fireEvent.change(getDescriptionEditor(), { target: { value: 'desc' } });
    fireEvent.click(getSubmitButton());

    await waitFor(() => {
      expect(screen.getByText(/200 ký tự/i)).toBeTruthy();
    });
    expect(mockCreateProblem).not.toHaveBeenCalled();
  });

  it('TC087 — no title-length error when title is exactly 200 characters', async () => {
    renderModal();
    fireEvent.change(getTitleInput(), { target: { value: 'a'.repeat(200) } });
    fireEvent.change(getDescriptionEditor(), { target: { value: 'desc' } });
    fireEvent.click(getSubmitButton());

    await waitFor(() => {
      expect(screen.queryByText(/200 ký tự/i)).toBeNull();
    });
  });

  it('TC088 — shows error when timeLimitMs is 99 (min - 1)', async () => {
    renderModal();
    fireEvent.change(getTitleInput(), { target: { value: 'Valid Title' } });
    fireEvent.change(getDescriptionEditor(), { target: { value: 'desc' } });
    const numInputs = getNumberInputs();
    if (numInputs[0])
      fireEvent.change(numInputs[0], { target: { value: '99' } });
    fireEvent.click(getSubmitButton());

    await waitFor(() => {
      expect(screen.getByText(/100ms/i)).toBeTruthy();
    });
    expect(mockCreateProblem).not.toHaveBeenCalled();
  });

  it('TC090 — shows error when memoryLimitMb is 15 (min - 1)', async () => {
    renderModal();
    fireEvent.change(getTitleInput(), { target: { value: 'Valid Title' } });
    fireEvent.change(getDescriptionEditor(), { target: { value: 'desc' } });
    const numInputs = getNumberInputs();
    if (numInputs[0])
      fireEvent.change(numInputs[0], { target: { value: '1000' } });
    if (numInputs[1])
      fireEvent.change(numInputs[1], { target: { value: '15' } });
    fireEvent.click(getSubmitButton());

    await waitFor(() => {
      expect(screen.getByText(/16MB/i)).toBeTruthy();
    });
    expect(mockCreateProblem).not.toHaveBeenCalled();
  });

  it('TC092 — shows error when a selected language has no template filled', async () => {
    renderModal();
    fireEvent.change(getTitleInput(), { target: { value: 'Two Sum' } });
    fireEvent.change(getDescriptionEditor(), { target: { value: 'desc' } });
    // Python + JavaScript are pre-checked with default template/wrapper code —
    // clear the python template to trigger the "missing template" validation
    const langTAs = getLangTextareas();
    if (langTAs[0]) fireEvent.change(langTAs[0], { target: { value: '' } });
    fireEvent.click(getSubmitButton());

    await waitFor(() => {
      // Error: "Ngôn ngữ PYTHON: Bắt buộc phải nhập Mẫu Code học sinh nhìn thấy"
      // /Mẫu Code/i also matches labels — use /Bắt buộc/i which only appears in error text
      expect(screen.getByText(/Bắt buộc/i)).toBeTruthy();
    });
    expect(mockCreateProblem).not.toHaveBeenCalled();
  });

  it('TC093 — shows error when wrapper does not contain {{STUDENT_CODE}}', async () => {
    renderModal();
    fireEvent.change(getTitleInput(), { target: { value: 'Two Sum' } });
    fireEvent.change(getDescriptionEditor(), { target: { value: 'desc' } });

    const langTAs = getLangTextareas();
    // [0]=python-template, [1]=python-wrapper
    if (langTAs[0])
      fireEvent.change(langTAs[0], {
        target: { value: 'class Solution: pass' },
      });
    // Fill wrapper WITHOUT {{STUDENT_CODE}}
    if (langTAs[1])
      fireEvent.change(langTAs[1], {
        target: { value: 'no placeholder here' },
      });

    fireEvent.click(getSubmitButton());

    await waitFor(() => {
      // JS wrapper still has the default {{STUDENT_CODE}} placeholder in its
      // textarea, so match the specific error text rather than the raw token
      expect(screen.getByText(/bắt buộc phải chứa placeholder/i)).toBeTruthy();
    });
    expect(mockCreateProblem).not.toHaveBeenCalled();
  });

  it('TC084 — calls createProblem when all required fields are valid, then opens test-case setup', async () => {
    mockCreateProblem.mockResolvedValue({
      id: 'prob-1',
      title: 'Two Sum',
    } as Awaited<ReturnType<typeof createProblem>>);
    renderModal();

    await fillAllRequired();
    fireEvent.click(getSubmitButton());

    await waitFor(() => {
      expect(mockCreateProblem).toHaveBeenCalled();
    });
    await waitFor(() => {
      expect(screen.getByTestId('manage-test-cases-modal')).toBeTruthy();
    });
  });
});
