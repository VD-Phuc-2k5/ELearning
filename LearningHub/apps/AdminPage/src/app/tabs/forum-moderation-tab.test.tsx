import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ForumModerationTab } from './forum-moderation-tab';
import {
  getAdminReports,
  adminResolveReport,
  adminDismissReport,
  adminHidePost,
  adminRestorePost,
  getPostDetail,
} from '../actions/forum-moderation.actions';

jest.mock('socket.io-client', () => ({
  io: jest.fn().mockReturnValue({
    on: jest.fn(),
    emit: jest.fn(),
    connect: jest.fn(),
    disconnect: jest.fn(),
  }),
}));

jest.mock('../actions/auth.actions', () => ({
  getSocketToken: jest.fn().mockResolvedValue('mock-token'),
}));

jest.mock('../actions/forum-moderation.actions', () => ({
  getAdminReports: jest.fn(),
  adminResolveReport: jest.fn(),
  adminDismissReport: jest.fn(),
  adminHidePost: jest.fn(),
  adminRestorePost: jest.fn(),
  getPostDetail: jest.fn(),
}));

jest.mock('../../lib/admin-api', () => ({
  getAxiosMessage: jest.fn().mockReturnValue('Error'),
}));

jest.mock('../../components/ui/tiptap-viewer', () => ({
  TiptapViewer: ({ content }: { content: Record<string, unknown> }) => (
    <div data-testid="tiptap-viewer">{JSON.stringify(content)}</div>
  ),
}));

const mockGetAdminReports = getAdminReports as jest.MockedFunction<
  typeof getAdminReports
>;
const mockAdminResolveReport = adminResolveReport as jest.MockedFunction<
  typeof adminResolveReport
>;
const mockAdminDismissReport = adminDismissReport as jest.MockedFunction<
  typeof adminDismissReport
>;
const mockAdminHidePost = adminHidePost as jest.MockedFunction<
  typeof adminHidePost
>;
const mockAdminRestorePost = adminRestorePost as jest.MockedFunction<
  typeof adminRestorePost
>;
const mockGetPostDetail = getPostDetail as jest.MockedFunction<
  typeof getPostDetail
>;

const mockReports = {
  data: [
    {
      id: 'report-1',
      targetType: 'post',
      targetId: 'post-abc-12345678',
      reason: 'SPAM',
      description: 'This is spam content',
      status: 'pending',
      reporterName: 'user1',
      postTitle: 'Suspicious Post Title',
      postStatus: 'published',
      forumId: 'forum-1',
      forumSlug: 'general-discussion',
      forumName: 'General Discussion',
      createdAt: '2024-01-01T00:00:00Z',
    },
    {
      id: 'report-2',
      targetType: 'post',
      targetId: 'post-abc-12345678',
      reason: 'INAPPROPRIATE_CONTENT',
      description: 'Contains inappropriate content',
      status: 'pending',
      reporterName: 'user2',
      postTitle: 'Suspicious Post Title',
      postStatus: 'published',
      forumId: 'forum-1',
      forumSlug: 'general-discussion',
      forumName: 'General Discussion',
      createdAt: '2024-01-02T00:00:00Z',
    },
  ],
};

function renderTab() {
  const client = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  });
  return render(
    <QueryClientProvider client={client}>
      <ForumModerationTab />
    </QueryClientProvider>,
  );
}

describe('AdminPage — ForumModerationTab', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockGetAdminReports.mockResolvedValue(
      mockReports as Awaited<ReturnType<typeof getAdminReports>>,
    );
    mockAdminResolveReport.mockResolvedValue(
      {} as Awaited<ReturnType<typeof adminResolveReport>>,
    );
    mockAdminDismissReport.mockResolvedValue(
      {} as Awaited<ReturnType<typeof adminDismissReport>>,
    );
    mockAdminHidePost.mockResolvedValue(
      {} as Awaited<ReturnType<typeof adminHidePost>>,
    );
    mockAdminRestorePost.mockResolvedValue(
      {} as Awaited<ReturnType<typeof adminRestorePost>>,
    );
    mockGetPostDetail.mockResolvedValue(
      {} as Awaited<ReturnType<typeof getPostDetail>>,
    );
  });

  it('renders heading with report count', async () => {
    renderTab();
    await waitFor(() => {
      expect(screen.getByText('Tất cả báo cáo')).toBeTruthy();
    });
  });

  it('renders status filter tabs', async () => {
    renderTab();
    await waitFor(() => {
      expect(screen.getByText('Chờ xử lý')).toBeTruthy();
      expect(screen.getByText('Đã xử lý')).toBeTruthy();
      expect(screen.getByText('Bỏ qua')).toBeTruthy();
    });
  });

  it('renders report post title', async () => {
    renderTab();
    await waitFor(() => {
      expect(screen.getByText('Suspicious Post Title')).toBeTruthy();
    });
  });

  it('renders report count badge', async () => {
    renderTab();
    await waitFor(() => {
      expect(screen.getByText('2 báo cáo')).toBeTruthy();
    });
  });

  it('renders target type badge', async () => {
    renderTab();
    await waitFor(() => {
      expect(screen.getByText('Bài viết')).toBeTruthy();
    });
  });

  it('renders hide post button', async () => {
    renderTab();
    await waitFor(() => {
      expect(screen.getByText('Ẩn')).toBeTruthy();
    });
  });

  it('clicking Ẩn calls adminHidePost', async () => {
    renderTab();
    await waitFor(() => screen.getByText('Ẩn'));
    fireEvent.click(screen.getByText('Ẩn'));
    await waitFor(() => {
      expect(mockAdminHidePost).toHaveBeenCalledWith(
        'post-abc-12345678',
        'OTHER',
      );
    });
  });

  it('clicking expand shows report details', async () => {
    renderTab();
    await waitFor(() => screen.getByText('Suspicious Post Title'));
    fireEvent.click(screen.getByText('Suspicious Post Title'));
    await waitFor(() => {
      expect(screen.getByText('2 báo cáo')).toBeTruthy();
    });
  });

  it('renders empty state message when no reports', async () => {
    mockGetAdminReports.mockResolvedValue({ data: [] } as Awaited<
      ReturnType<typeof getAdminReports>
    >);
    renderTab();
    await waitFor(() => {
      expect(screen.getByText('Không có báo cáo nào.')).toBeTruthy();
    });
  });
});
