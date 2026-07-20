import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { UserAdminTab } from './user-admin-tab';
import { searchUsers, toggleUserLock } from '../../app/actions/admin.actions';

jest.mock('../../app/actions/admin.actions', () => ({
  searchUsers: jest.fn(),
  toggleUserLock: jest.fn(),
}));
jest.mock('../../lib/admin-api', () => ({
  getAxiosMessage: jest.fn().mockReturnValue('Error'),
}));

const mockSearchUsers = searchUsers as jest.MockedFunction<typeof searchUsers>;
const mockToggleUserLock = toggleUserLock as jest.MockedFunction<
  typeof toggleUserLock
>;

const activeUser = {
  id: 'user-1',
  username: 'jdoe',
  email: 'jdoe@test.com',
  isActive: true,
};
const lockedUser = {
  id: 'user-2',
  username: 'locked',
  email: 'locked@test.com',
  isActive: false,
};

function renderTab() {
  const client = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  });
  return render(
    <QueryClientProvider client={client}>
      <UserAdminTab />
    </QueryClientProvider>,
  );
}

describe('AdminPage — UserAdminTab (TC113–TC115)', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockSearchUsers.mockResolvedValue([activeUser] as Awaited<
      ReturnType<typeof searchUsers>
    >);
    mockToggleUserLock.mockResolvedValue(
      {} as Awaited<ReturnType<typeof toggleUserLock>>,
    );
  });

  it('TC113 — typing email and clicking search calls searchUsers with that email', async () => {
    renderTab();
    const input = screen.getByPlaceholderText(/tìm người dùng theo email/i);
    fireEvent.change(input, { target: { value: 'jdoe@test.com' } });
    // wait for initial query to settle so button shows "Tìm kiếm" not "Đang tìm..."
    const btn = await waitFor(() =>
      screen.getByRole('button', { name: /tìm kiếm/i }),
    );
    fireEvent.click(btn);
    await waitFor(() =>
      expect(mockSearchUsers).toHaveBeenCalledWith('jdoe@test.com'),
    );
  });

  it('TC114 — active user shows Khóa button; clicking calls toggleUserLock with false', async () => {
    mockSearchUsers.mockResolvedValue([activeUser] as Awaited<
      ReturnType<typeof searchUsers>
    >);
    renderTab();
    await waitFor(() => screen.getByText('jdoe'));
    fireEvent.click(screen.getByText('Khóa'));
    await waitFor(() =>
      expect(mockToggleUserLock).toHaveBeenCalledWith('user-1', false),
    );
  });

  it('TC115 — locked user shows Mở khóa button; clicking calls toggleUserLock with true', async () => {
    mockSearchUsers.mockResolvedValue([lockedUser] as Awaited<
      ReturnType<typeof searchUsers>
    >);
    renderTab();
    await waitFor(() => screen.getByText('locked'));
    fireEvent.click(screen.getByText('Mở khóa'));
    await waitFor(() =>
      expect(mockToggleUserLock).toHaveBeenCalledWith('user-2', true),
    );
  });
});
