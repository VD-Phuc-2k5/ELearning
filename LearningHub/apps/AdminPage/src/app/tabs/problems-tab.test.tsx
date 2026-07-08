import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ProblemsTab } from './problems-tab';
import { getProblems, deleteProblem } from '../actions/problem.actions';

jest.mock('@aejkatappaja/phantom-ui', () => ({}), { virtual: true });

jest.mock('../actions/problem.actions', () => ({
  getProblems: jest.fn(),
  deleteProblem: jest.fn(),
}));

jest.mock('../../components/admin/manage-test-cases-modal', () => ({
  ManageTestCasesModal: ({ problemTitle, onClose }: any) => (
    <div data-testid="test-cases-modal">
      <p>{problemTitle}</p>
      <button onClick={onClose}>Close Modal</button>
    </div>
  ),
}));

jest.mock('../../components/admin/edit-problem-modal', () => ({
  EditProblemModal: ({ problem, onClose }: any) => (
    <div data-testid="edit-problem-modal">
      <p>{problem.title}</p>
      <button onClick={onClose}>Close Edit</button>
    </div>
  ),
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
  window.confirm = jest.fn().mockReturnValue(true);
  return render(
    <QueryClientProvider client={client}>
      <ProblemsTab />
    </QueryClientProvider>,
  );
}

describe('AdminPage — ProblemsTab', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockGetProblems.mockResolvedValue(mockProblems as any);
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
      expect(screen.getByText('Dễ (Easy)')).toBeTruthy();
      expect(screen.getByText('Trung bình (Medium)')).toBeTruthy();
      expect(screen.getByText('Khó (Hard)')).toBeTruthy();
    });
  });

  it('renders time and memory limits', async () => {
    renderTab();
    await waitFor(() => {
      expect(screen.getByText('1000 ms')).toBeTruthy();
      expect(screen.getByText('256 MB RAM')).toBeTruthy();
    });
  });

  it('renders language tags', async () => {
    renderTab();
    await waitFor(() => {
      const pythonTags = screen.getAllByText('python');
      expect(pythonTags.length).toBeGreaterThanOrEqual(2);
    });
  });

  it('renders Sửa, Test Cases, Xóa buttons', async () => {
    renderTab();
    await waitFor(() => {
      const suaButtons = screen.getAllByText('Sửa');
      const testCaseButtons = screen.getAllByText('Test Cases');
      const xoaButtons = screen.getAllByText('Xóa');
      expect(suaButtons.length).toBe(3);
      expect(testCaseButtons.length).toBe(3);
      expect(xoaButtons.length).toBe(3);
    });
  });

  it('clicking Test Cases shows the modal', async () => {
    renderTab();
    await waitFor(() => screen.getAllByText('Test Cases'));
    const testCaseButtons = screen.getAllByText('Test Cases');
    fireEvent.click(testCaseButtons[0]);
    await waitFor(() => {
      expect(screen.getByText('Close Modal')).toBeTruthy();
    });
  });

  it('clicking Xóa triggers confirm dialog', async () => {
    mockDeleteProblem.mockResolvedValue({} as any);
    renderTab();
    await waitFor(() => screen.getAllByText('Xóa'));
    const deleteButtons = screen.getAllByText('Xóa');
    fireEvent.click(deleteButtons[0]);
    await waitFor(() => {
      expect(window.confirm).toHaveBeenCalled();
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
    mockGetProblems.mockResolvedValue({ data: [], total: 0 } as any);
    renderTab();
    await waitFor(() => {
      expect(screen.getByText('Chưa có đề bài lập trình nào')).toBeTruthy();
    });
  });
});
