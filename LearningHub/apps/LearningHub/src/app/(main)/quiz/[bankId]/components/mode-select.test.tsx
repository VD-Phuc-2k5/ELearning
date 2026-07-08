import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { ModeSelect, ModeCard } from './mode-select';
import type { QuizMode } from './types';

jest.mock('@aejkatappaja/phantom-ui', () => ({}), { virtual: true });

jest.mock('next/link', () => {
  return function Link({
    children,
    href,
  }: {
    children: React.ReactNode;
    href: string;
  }) {
    return <a href={href}>{children}</a>;
  };
});

jest.mock('next/navigation', () => ({
  useRouter: () => ({ push: jest.fn(), back: jest.fn() }),
  useSearchParams: () => new URLSearchParams(),
  useParams: () => ({}),
}));

describe('LearningHub — ModeSelect', () => {
  const mockBank = {
    id: 'bank-1',
    title: 'JavaScript Basics',
    description: 'Learn JS fundamentals',
    totalQuestions: 20,
    status: 'approved',
    tags: [],
    uploaderName: 'tester',
    createdAt: '2024-01-01T00:00:00Z',
  };

  it('renders bank title and question count', () => {
    render(
      <ModeSelect
        bank={mockBank as any}
        onSelectMode={jest.fn()}
        onBack={jest.fn()}
      />,
    );
    expect(screen.getByText('JavaScript Basics')).toBeTruthy();
    expect(screen.getByText('20 câu hỏi')).toBeTruthy();
  });

  it('renders loading state when bank is undefined', () => {
    render(
      <ModeSelect
        bank={undefined}
        onSelectMode={jest.fn()}
        onBack={jest.fn()}
      />,
    );
    expect(screen.getByText('Loading...')).toBeTruthy();
  });

  it('renders practice mode option', () => {
    render(
      <ModeSelect
        bank={mockBank as any}
        onSelectMode={jest.fn()}
        onBack={jest.fn()}
      />,
    );
    expect(screen.getByText('Luyện tập')).toBeTruthy();
  });

  it('renders exam mode option', () => {
    render(
      <ModeSelect
        bank={mockBank as any}
        onSelectMode={jest.fn()}
        onBack={jest.fn()}
      />,
    );
    expect(screen.getByText('Thi thử')).toBeTruthy();
  });

  it('renders timed exam option', () => {
    render(
      <ModeSelect
        bank={mockBank as any}
        onSelectMode={jest.fn()}
        onBack={jest.fn()}
      />,
    );
    expect(screen.getByText('Thi có tính giờ')).toBeTruthy();
  });

  it('calls onSelectMode with practice when Luyện tập clicked', () => {
    const onSelectMode = jest.fn();
    render(
      <ModeSelect
        bank={mockBank as any}
        onSelectMode={onSelectMode}
        onBack={jest.fn()}
      />,
    );
    fireEvent.click(screen.getByText('Luyện tập'));
    expect(onSelectMode).toHaveBeenCalledWith('practice');
  });

  it('calls onSelectMode with exam when Thi thử clicked', () => {
    const onSelectMode = jest.fn();
    render(
      <ModeSelect
        bank={mockBank as any}
        onSelectMode={onSelectMode}
        onBack={jest.fn()}
      />,
    );
    fireEvent.click(screen.getByText('Thi thử'));
    expect(onSelectMode).toHaveBeenCalledWith('exam');
  });

  it('calls onBack when back button clicked', () => {
    const onBack = jest.fn();
    render(
      <ModeSelect
        bank={mockBank as any}
        onSelectMode={jest.fn()}
        onBack={onBack}
      />,
    );
    const backBtn = screen.getByRole('button', { name: '' });
    fireEvent.click(backBtn);
    expect(onBack).toHaveBeenCalled();
  });

  it('calls onSelectMode with timed-exam and computed seconds', () => {
    const onSelectMode = jest.fn();
    render(
      <ModeSelect
        bank={mockBank as any}
        onSelectMode={onSelectMode}
        onBack={jest.fn()}
      />,
    );
    const startBtn = screen.getByText('Bắt đầu');
    fireEvent.click(startBtn);
    expect(onSelectMode).toHaveBeenCalledWith('timed-exam', 30 * 60);
  });

  it('timed exam input changes time when modified', () => {
    render(
      <ModeSelect
        bank={mockBank as any}
        onSelectMode={jest.fn()}
        onBack={jest.fn()}
      />,
    );
    const timeInput = screen.getByRole('spinbutton');
    fireEvent.change(timeInput, { target: { value: '45' } });
    expect((timeInput as HTMLInputElement).value).toBe('45');
  });
});

describe('LearningHub — ModeCard', () => {
  it('renders title, description and calls onClick', () => {
    const onClick = jest.fn();
    render(
      <ModeCard
        icon={<span data-testid="icon">*</span>}
        title="Test Mode"
        description="A test description"
        color="bg-blue-500"
        onClick={onClick}
      />,
    );
    expect(screen.getByText('Test Mode')).toBeTruthy();
    expect(screen.getByText('A test description')).toBeTruthy();
    fireEvent.click(screen.getByText('Test Mode'));
    expect(onClick).toHaveBeenCalledTimes(1);
  });
});
