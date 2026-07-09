import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ExamMode } from './exam-mode';
import { submitQuiz } from '../../../../actions/quiz.actions';

jest.mock('gsap', () => ({ fromTo: jest.fn() }));

jest.mock('../../../../../components/ui', () => ({
  Button: ({ children, isLoading, disabled, ...props }: any) => (
    <button {...props} disabled={isLoading || disabled}>
      {children}
    </button>
  ),
}));

jest.mock('../../../../../components/ui/confirm-modal', () => ({
  useConfirmModal: () => ({ modal: null, openConfirm: jest.fn() }),
}));

jest.mock('../../../../actions/quiz.actions', () => ({
  submitQuiz: jest.fn(),
}));

jest.mock('./use-exam-lockdown', () => ({
  useExamLockdown: () => ({
    pendingSubmit: false,
    onConfirmSubmit: jest.fn(),
    onCancelSubmit: jest.fn(),
  }),
}));

jest.mock('lucide-react', () => ({
  ArrowLeft: () => null,
  Clock: () => null,
  ChevronLeft: () => null,
  ChevronRight: () => null,
}));

const mockSubmitQuiz = submitQuiz as jest.MockedFunction<typeof submitQuiz>;

const Q1 = {
  id: 'q1',
  content: 'What is 2+2?',
  answerOptions: [
    { id: 'opt-a', optionLabel: 'A', content: 'Three' },
    { id: 'opt-b', optionLabel: 'B', content: 'Four' },
  ],
};

const Q2 = {
  id: 'q2',
  content: 'What is 3+3?',
  answerOptions: [
    { id: 'opt-c', optionLabel: 'A', content: 'Five' },
    { id: 'opt-d', optionLabel: 'B', content: 'Six' },
  ],
};

function renderExam(questions = [Q1, Q2], onFinish = jest.fn()) {
  const client = new QueryClient({
    defaultOptions: { queries: { retry: false }, mutations: { retry: false } },
  });
  return render(
    <QueryClientProvider client={client}>
      <ExamMode
        bankId="bank-1"
        questions={questions as any}
        onFinish={onFinish}
      />
    </QueryClientProvider>,
  );
}

describe('LearningHub — ExamMode (TC144–TC145)', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('TC144 — renders question content and answer options', () => {
    renderExam();
    expect(screen.getByText('What is 2+2?')).toBeTruthy();
    expect(screen.getByText('Three')).toBeTruthy();
    expect(screen.getByText('Four')).toBeTruthy();
  });

  it('TC144b — selecting an answer increments answered count', () => {
    renderExam();
    expect(screen.getByText(/0\/2/)).toBeTruthy();
    fireEvent.click(screen.getByText('Four'));
    expect(screen.getByText(/1\/2/)).toBeTruthy();
  });

  it('TC144c — submit with all questions answered calls submitQuiz without confirm', async () => {
    mockSubmitQuiz.mockResolvedValue({
      success: true,
      data: {
        correctCount: 1,
        totalQuestions: 1,
        scorePercent: 100,
      },
    } as any);
    renderExam([Q1]);

    fireEvent.click(screen.getByText('Four'));
    fireEvent.click(screen.getByText('Submit'));

    await waitFor(() => {
      expect(mockSubmitQuiz).toHaveBeenCalled();
    });
  });

  it('TC145 — submit with unanswered questions shows browser confirm', () => {
    const confirmSpy = jest.spyOn(window, 'confirm').mockReturnValue(false);
    renderExam([Q1, Q2]);

    // Navigate to last question without answering
    fireEvent.click(screen.getByText('Next'));
    fireEvent.click(screen.getByText('Submit'));

    expect(confirmSpy).toHaveBeenCalledWith(
      expect.stringContaining('chưa trả lời'),
    );
    expect(mockSubmitQuiz).not.toHaveBeenCalled();
    confirmSpy.mockRestore();
  });

  it('TC145b — calls submitQuiz when user confirms submission with unanswered questions', async () => {
    jest.spyOn(window, 'confirm').mockReturnValue(true);
    mockSubmitQuiz.mockResolvedValue({
      success: true,
      data: {
        correctCount: 0,
        totalQuestions: 2,
        scorePercent: 0,
      },
    } as any);
    renderExam([Q1, Q2]);

    fireEvent.click(screen.getByText('Next'));
    fireEvent.click(screen.getByText('Submit'));

    await waitFor(() => {
      expect(mockSubmitQuiz).toHaveBeenCalled();
    });
    jest.restoreAllMocks();
  });

  it('TC145c — Submit button is disabled while submitting', async () => {
    jest.spyOn(window, 'confirm').mockReturnValue(true);
    mockSubmitQuiz.mockImplementation(() => new Promise<any>(() => undefined));
    renderExam([Q1, Q2]);

    fireEvent.click(screen.getByText('Next'));
    fireEvent.click(screen.getByText('Submit'));

    await waitFor(() => {
      const submitBtn = screen.getByText('Submit').closest('button')!;
      expect((submitBtn as HTMLButtonElement).disabled).toBe(true);
    });
    jest.restoreAllMocks();
  });
});
