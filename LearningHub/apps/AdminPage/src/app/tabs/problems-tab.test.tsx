import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ProblemsTab } from './problems-tab';
import { getProblems, deleteProblem } from '../actions/problem.actions';

jest.mock('@aejkatappaja/phantom-ui', () => ({}), { virtual: true });

jest.mock('react-markdown', () => ({
  __esModule: true,
  default: ({ children }: { children: string }) => <div>{children}</div>,
}));

jest.mock('remark-gfm', () => ({
  __esModule: true,
  default: jest.fn(),
}));

jest.mock('../actions/problem.actions', () => ({
  getProblems: jest.fn(),
  deleteProblem: jest.fn(),
}));

jest.mock('../../components/admin/manage-test-cases-modal', () => ({
  ManageTestCasesModal: ({
    problemTitle,
    onClose,
  }: {
    problemTitle: string;
    onClose: () => void;
  }) => (
    <div data-testid="test-cases-modal">
      <p>{problemTitle}</p>
      <button onClick={onClose}>Close Modal</button>
    </div>
  ),
}));

jest.mock('../../components/admin/edit-problem-modal', () => ({
  EditProblemModal: ({
    problem,
    onClose,
  }: {
    problem: { title: string };
    onClose: () => void;
  }) => (
    <div data-testid="edit-problem-modal">
      <p>{problem.title}</p>
      <button onClick={onClose}>Close Edit</button>
    </div>
  ),
}));

const mockOpenConfirm = jest.fn();

jest.mock('../../components/admin/modal', () => ({
  useConfirmModal: () => ({ modal: null, openConfirm: mockOpenConfirm }),
  Modal: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
}));

const mockGetProblems = getProblems as jest.MockedFunction<typeof getProblems>;
const mockDeleteProblem = deleteProblem as jest.MockedFunction<
  typeof deleteProblem
>;

const mockProblems = {
  data: [
    {
      id: 'prob-1',
      title: 'Two Sum',
      description: 'Find two numbers that add up to target',
      difficulty: 'easy',
      timeLimitMs: 1000,
      memoryLimitMb: 256,
      languages: ['python', 'javascript'],
    },
    {
      id: 'prob-2',
      title: 'Merge Sort',
      description: 'Implement merge sort algorithm',
      difficulty: 'medium',
      timeLimitMs: 2000,
      memoryLimitMb: 512,
      languages: ['python', 'cpp'],
    },
    {
      id: 'prob-3',
      title: 'N-Queens',
      description: 'Solve N-Queens problem',
      difficulty: 'hard',
      timeLimitMs: 5000,
      memoryLimitMb: 1024,
      languages: ['python'],
    },
  ],
  total: 3,
};

function renderTab() {
  const client = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  });
  return render(
    <QueryClientProvider client={client}>
      <ProblemsTab />
    </QueryClientProvider>,
  );
}

describe('AdminPage — ProblemsTab', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockGetProblems.mockResolvedValue(
      mockProblems as Awaited<ReturnType<typeof getProblems>>,
    );
  });

  it('renders problem titles', async () => {
    renderTab();
    await waitFor(() => {
      expect(screen.getByText('Two Sum')).toBeTruthy();
      expect(screen.getByText('Merge Sort')).toBeTruthy();
      expect(screen.getByText('N-Queens')).toBeTruthy();
    });
  });

  it('renders difficulty badges', async () => {
    renderTab();
    await waitFor(() => {
      expect(screen.getByText('Dễ')).toBeTruthy();
      expect(screen.getByText('Trung bình')).toBeTruthy();
      expect(screen.getByText('Khó')).toBeTruthy();
    });
  });

  it('renders time and memory limits', async () => {
    renderTab();
    await waitFor(() => {
      expect(screen.getByText('1000ms')).toBeTruthy();
      expect(screen.getByText('256MB')).toBeTruthy();
    });
  });

  it('renders language tags', async () => {
    renderTab();
    await waitFor(() => {
      const pythonTags = screen.getAllByText('python');
      expect(pythonTags.length).toBeGreaterThanOrEqual(2);
    });
  });

  it('renders Sửa, Tests dropdown buttons', async () => {
    renderTab();
    await waitFor(() => {
      const suaButtons = screen.getAllByText('Sửa');
      const testsButtons = screen.getAllByText('Tests');
      expect(suaButtons.length).toBe(3);
      expect(testsButtons.length).toBe(3);
    });
  });

  it('clicking Tests shows the modal', async () => {
    renderTab();
    await waitFor(() => screen.getAllByText('Tests'));
    const testsButtons = screen.getAllByText('Tests');
    fireEvent.click(testsButtons[0]);
    await waitFor(() => {
      expect(screen.getByText('Close Modal')).toBeTruthy();
    });
  });

  it('clicking delete icon triggers confirm dialog', async () => {
    mockDeleteProblem.mockResolvedValue(
      {} as unknown as Awaited<ReturnType<typeof deleteProblem>>,
    );
    renderTab();
    await waitFor(() => screen.getAllByText('Sửa'));
    const deleteButtons = document.querySelectorAll('.lucide-trash2');
    expect(deleteButtons.length).toBeGreaterThan(0);
    const button = deleteButtons[0].closest('button');
    if (!button) throw new Error('Delete button not found');
    mockOpenConfirm.mockClear();
    fireEvent.click(button);
    await waitFor(() => {
      expect(mockOpenConfirm).toHaveBeenCalledWith(
        expect.stringContaining('Bạn chắc chắn muốn xóa đề bài'),
        expect.any(Function),
      );
    });
    // Simulate confirm callback
    const confirmCallback = mockOpenConfirm.mock.calls[0][1];
    confirmCallback();
    await waitFor(() => {
      expect(mockDeleteProblem).toHaveBeenCalled();
    });
  });

  it('clicking Sửa opens edit modal with problem title visible', async () => {
    renderTab();
    await waitFor(() => screen.getAllByText('Sửa'));
    fireEvent.click(screen.getAllByText('Sửa')[0]);
    await waitFor(() => {
      expect(screen.getByText('Close Edit')).toBeTruthy();
    });
  });

  it('renders empty state when no problems', async () => {
    mockGetProblems.mockResolvedValue({ data: [], total: 0 } as Awaited<
      ReturnType<typeof getProblems>
    >);
    renderTab();
    await waitFor(() => {
      expect(screen.getByText('Chưa có đề bài lập trình nào')).toBeTruthy();
    });
  });
});
