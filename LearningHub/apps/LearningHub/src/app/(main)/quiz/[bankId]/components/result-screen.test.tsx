import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { ResultScreen } from './result-screen';

jest.mock('gsap', () => ({ fromTo: jest.fn() }));

// ponytail: mock components/ui to avoid loading tiptap ESM-only deps
jest.mock('../../../../../components/ui', () => ({
  Button: ({ children, ...props }: any) => (
    <button {...props}>{children}</button>
  ),
}));

jest.mock('next/navigation', () => ({
  useRouter: () => ({ push: jest.fn() }),
}));

const buildResult = (overrides: Partial<Record<string, unknown>> = {}) => ({
  correctCount: 4,
  totalQuestions: 5,
  scorePercent: 80,
  nextBank: null,
  ...overrides,
});

describe('LearningHub — ResultScreen (TC146–TC147)', () => {
  it('TC146 — displays score percentage and correct/total counts', () => {
    render(
      <ResultScreen
        result={buildResult() as any}
        bankId="bank-1"
        onRetry={jest.fn()}
        onReview={jest.fn()}
      />,
    );
    expect(screen.getByText('80%')).toBeTruthy();
    // correctCount and totalQuestions appear in multiple elements (summary + stats)
    expect(screen.getAllByText('4').length).toBeGreaterThan(0);
    expect(screen.getAllByText('5').length).toBeGreaterThan(0);
  });

  it('TC146b — shows "Excellent!" when score >= 80%', () => {
    render(
      <ResultScreen
        result={buildResult({ scorePercent: 80 }) as any}
        bankId="bank-1"
        onRetry={jest.fn()}
        onReview={jest.fn()}
      />,
    );
    expect(screen.getByText('Excellent!')).toBeTruthy();
  });

  it('TC146c — shows "Good job!" when score is 60–79%', () => {
    render(
      <ResultScreen
        result={buildResult({ scorePercent: 60, correctCount: 3 }) as any}
        bankId="bank-1"
        onRetry={jest.fn()}
        onReview={jest.fn()}
      />,
    );
    expect(screen.getByText('Good job!')).toBeTruthy();
  });

  it('TC146d — shows "Keep practicing!" when score < 60%', () => {
    render(
      <ResultScreen
        result={buildResult({ scorePercent: 40, correctCount: 2 }) as any}
        bankId="bank-1"
        onRetry={jest.fn()}
        onReview={jest.fn()}
      />,
    );
    expect(screen.getByText('Keep practicing!')).toBeTruthy();
  });

  it('TC146e — computes percentage from correctCount/totalQuestions when scorePercent absent', () => {
    render(
      <ResultScreen
        result={
          buildResult({
            scorePercent: undefined,
            correctCount: 3,
            totalQuestions: 4,
          }) as any
        }
        bankId="bank-1"
        onRetry={jest.fn()}
        onReview={jest.fn()}
      />,
    );
    // 3/4 = 75%
    expect(screen.getByText('75%')).toBeTruthy();
  });

  it('TC147 — clicking "Review Answers" calls onReview', () => {
    const onReview = jest.fn();
    render(
      <ResultScreen
        result={buildResult() as any}
        bankId="bank-1"
        onRetry={jest.fn()}
        onReview={onReview}
      />,
    );
    fireEvent.click(screen.getByRole('button', { name: /Review Answers/i }));
    expect(onReview).toHaveBeenCalled();
  });

  it('TC147b — clicking "Retry" calls onRetry', () => {
    const onRetry = jest.fn();
    render(
      <ResultScreen
        result={buildResult() as any}
        bankId="bank-1"
        onRetry={onRetry}
        onReview={jest.fn()}
      />,
    );
    fireEvent.click(screen.getByRole('button', { name: /Retry/i }));
    expect(onRetry).toHaveBeenCalled();
  });
});
