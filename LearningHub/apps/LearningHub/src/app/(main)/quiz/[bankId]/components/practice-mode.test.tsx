import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { PracticeMode } from './practice-mode';
import { verifyAnswer } from '../../../../actions/quiz.actions';

jest.mock('gsap', () => ({ fromTo: jest.fn() }));

jest.mock('../../../../../components/ui', () => ({
  Button: ({ children, disabled, ...props }: any) => (
    <button {...props} disabled={disabled}>
      {children}
    </button>
  ),
}));

jest.mock('../../../../actions/quiz.actions', () => ({
  verifyAnswer: jest.fn(),
}));

jest.mock('lucide-react', () => ({
  ArrowLeft: () => null,
  CheckCircle2: () => <span data-testid="check-icon" />,
  XCircle: () => <span data-testid="x-icon" />,
  ChevronLeft: () => null,
  ChevronRight: () => null,
  Lightbulb: () => null,
}));

const mockVerifyAnswer = verifyAnswer as jest.MockedFunction<
  typeof verifyAnswer
>;

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

function renderPractice(questions = [Q1, Q2], onExit = jest.fn()) {
  const client = new QueryClient({
    defaultOptions: { queries: { retry: false }, mutations: { retry: false } },
  });
  return render(
    <QueryClientProvider client={client}>
      <PracticeMode questions={questions as any} onExit={onExit} />
    </QueryClientProvider>,
  );
}

describe('LearningHub — PracticeMode (TC141–TC145)', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('TC141 — renders question content and answer options', () => {
    renderPractice();
    expect(screen.getByText('What is 2+2?')).toBeTruthy();
    expect(screen.getByText('Three')).toBeTruthy();
    expect(screen.getByText('Four')).toBeTruthy();
  });

  it('TC142 — selecting an option calls verifyAnswer with question and option ids', async () => {
    mockVerifyAnswer.mockResolvedValue({
      success: true,
      data: {
        isCorrect: true,
        correctOptionIds: ['opt-b'],
        explanation: null,
      },
    } as any);
    renderPractice();

    fireEvent.click(screen.getByText('Four'));

    await waitFor(() => {
      expect(mockVerifyAnswer).toHaveBeenCalledWith('q1', 'opt-b');
    });
  });

  it('TC143 — shows correct feedback icon when answer is correct', async () => {
    mockVerifyAnswer.mockResolvedValue({
      success: true,
      data: {
        isCorrect: true,
        correctOptionIds: ['opt-b'],
        explanation: null,
      },
    } as any);
    renderPractice();

    fireEvent.click(screen.getByText('Four'));

    await waitFor(() => {
      expect(screen.getByTestId('check-icon')).toBeTruthy();
    });
  });

  it('TC143b — shows wrong feedback icon and explanation when answer is incorrect', async () => {
    mockVerifyAnswer.mockResolvedValue({
      success: true,
      data: {
        isCorrect: false,
        correctOptionIds: ['opt-b'],
        explanation: 'Hint: try adding more carefully',
      },
    } as any);
    renderPractice();

    fireEvent.click(screen.getByText('Three'));

    await waitFor(() => {
      expect(screen.getByTestId('x-icon')).toBeTruthy();
      expect(screen.getByText('Hint: try adding more carefully')).toBeTruthy();
    });
  });

  it('TC144 — answer options are disabled after submitting', async () => {
    mockVerifyAnswer.mockResolvedValue({
      success: true,
      data: {
        isCorrect: true,
        correctOptionIds: ['opt-b'],
        explanation: null,
      },
    } as any);
    renderPractice();

    fireEvent.click(screen.getByText('Four'));

    await waitFor(() => {
      expect(mockVerifyAnswer).toHaveBeenCalled();
    });

    const optionButtons = screen
      .getAllByRole('button')
      .filter((b) => ['Three', 'Four'].includes(b.textContent?.trim() ?? ''));
    optionButtons.forEach((btn) => {
      expect((btn as HTMLButtonElement).disabled).toBe(true);
    });
  });

  it('TC145 — Next button navigates to second question', () => {
    renderPractice();
    fireEvent.click(screen.getByText('Next'));
    expect(screen.getByText('What is 3+3?')).toBeTruthy();
  });

  it('TC145b — Previous button is disabled on first question', () => {
    renderPractice();
    const prevBtn = screen.getByText('Previous').closest('button')!;
    expect((prevBtn as HTMLButtonElement).disabled).toBe(true);
  });

  it('TC145c — clicking Exit calls onExit', () => {
    const onExit = jest.fn();
    renderPractice([Q1, Q2], onExit);
    fireEvent.click(screen.getByText('Exit'));
    expect(onExit).toHaveBeenCalled();
  });

  it('TC145d — last question shows Finish button instead of Next', () => {
    renderPractice([Q1]);
    expect(screen.queryByText('Next')).toBeNull();
    expect(screen.getByText('Finish')).toBeTruthy();
  });
});
