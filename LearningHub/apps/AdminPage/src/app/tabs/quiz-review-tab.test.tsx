import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { QuizReviewTab } from './quiz-review-tab';
import {
  getPendingBanks,
  approveBank,
  rejectBank,
  getBankQuestions,
} from '../actions/quiz-bank-review.actions';

jest.mock('@aejkatappaja/phantom-ui', () => ({}), { virtual: true });
jest.mock('socket.io-client', () => ({
  io: jest.fn().mockReturnValue({
    on: jest.fn(),
    emit: jest.fn(),
    connect: jest.fn(),
    disconnect: jest.fn(),
  }),
}));
jest.mock('../actions/quiz-bank-review.actions', () => ({
  getPendingBanks: jest.fn(),
  approveBank: jest.fn(),
  rejectBank: jest.fn(),
  getBankQuestions: jest.fn(),
}));
jest.mock('../actions/auth.actions', () => ({
  getSocketToken: jest.fn().mockResolvedValue('mock-token'),
}));

const mockGetPendingBanks = getPendingBanks as jest.MockedFunction<
  typeof getPendingBanks
>;
const mockApproveBank = approveBank as jest.MockedFunction<typeof approveBank>;
const mockRejectBank = rejectBank as jest.MockedFunction<typeof rejectBank>;
const mockGetBankQuestions = getBankQuestions as jest.MockedFunction<
  typeof getBankQuestions
>;

const mockBanks = [
  {
    id: 'bank-1',
    title: 'JavaScript Basics',
    description: 'Fundamental JS concepts',
    totalQuestions: 10,
    uploaderName: 'testuser',
    createdAt: '2024-01-01T00:00:00Z',
    tags: [],
  },
];

function renderTab() {
  const client = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  });
  return render(
    <QueryClientProvider client={client}>
      <QuizReviewTab />
    </QueryClientProvider>,
  );
}

describe('AdminPage — QuizReviewTab (TC104–TC109)', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockGetPendingBanks.mockResolvedValue(
      mockBanks as unknown as Awaited<ReturnType<typeof getPendingBanks>>,
    );
    mockGetBankQuestions.mockResolvedValue([]);
  });

  it('TC104 — renders list of pending banks with title and uploader', async () => {
    renderTab();
    await waitFor(() => {
      expect(screen.getByText('JavaScript Basics')).toBeTruthy();
      expect(screen.getByText('testuser')).toBeTruthy();
    });
  });

  it('TC105 — clicking Duyệt calls approveBank with bankId', async () => {
    mockApproveBank.mockResolvedValue(
      {} as unknown as Awaited<ReturnType<typeof approveBank>>,
    );
    renderTab();
    await waitFor(() => screen.getByText('Duyệt'));
    fireEvent.click(screen.getByText('Duyệt'));
    await waitFor(() => expect(mockApproveBank).toHaveBeenCalledWith('bank-1'));
  });

  it('TC106 — reject without reason calls rejectBank with undefined', async () => {
    mockRejectBank.mockResolvedValue(
      {} as unknown as Awaited<ReturnType<typeof rejectBank>>,
    );
    renderTab();
    await waitFor(() => screen.getByText('Từ chối'));
    fireEvent.click(screen.getByText('Từ chối'));
    await waitFor(() => screen.getByText('Xác nhận từ chối'));
    fireEvent.click(screen.getByText('Xác nhận từ chối'));
    await waitFor(() =>
      expect(mockRejectBank).toHaveBeenCalledWith('bank-1', undefined),
    );
  });

  it('TC107 — reject with reason passes reason string to rejectBank', async () => {
    mockRejectBank.mockResolvedValue(
      {} as unknown as Awaited<ReturnType<typeof rejectBank>>,
    );
    renderTab();
    await waitFor(() => screen.getByText('Từ chối'));
    fireEvent.click(screen.getByText('Từ chối'));
    await waitFor(() => screen.getByPlaceholderText(/nhập lý do/i));
    fireEvent.change(screen.getByPlaceholderText(/nhập lý do/i), {
      target: { value: 'Nội dung chưa đạt' },
    });
    fireEvent.click(screen.getByText('Xác nhận từ chối'));
    await waitFor(() =>
      expect(mockRejectBank).toHaveBeenCalledWith(
        'bank-1',
        'Nội dung chưa đạt',
      ),
    );
  });

  it('TC108 — clicking expand button triggers getBankQuestions', async () => {
    mockGetBankQuestions.mockResolvedValue(
      [] as unknown as Awaited<ReturnType<typeof getBankQuestions>>,
    );
    renderTab();
    await waitFor(() => screen.getByText('JavaScript Basics'));
    const buttons = screen.getAllByRole('button');
    const toggleBtn = buttons.find((b) => b.className.includes('bg-slate-100'));
    expect(toggleBtn).toBeTruthy();
    if (!toggleBtn) throw new Error('toggle button not found');
    fireEvent.click(toggleBtn);
    await waitFor(() =>
      expect(mockGetBankQuestions).toHaveBeenCalledWith('bank-1'),
    );
  });

  it('TC109 — shows empty state when no pending banks', async () => {
    mockGetPendingBanks.mockResolvedValue([]);
    renderTab();
    await waitFor(() => {
      expect(
        screen.getByText(/không có ngân hàng câu hỏi chờ duyệt/i),
      ).toBeTruthy();
    });
  });
});
