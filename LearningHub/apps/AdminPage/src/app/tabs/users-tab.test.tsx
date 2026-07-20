import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { UsersTab } from './users-tab';
import { getUsers, deleteAdmin } from '../actions/admin.actions';

jest.mock('@aejkatappaja/phantom-ui', () => ({}), { virtual: true });
jest.mock('../actions/admin.actions', () => ({
  getUsers: jest.fn(),
  deleteAdmin: jest.fn(),
  getMatrix: jest.fn(),
  assignPermissionToRole: jest.fn(),
  removePermissionFromRole: jest.fn(),
  deleteRole: jest.fn(),
  searchUsers: jest.fn(),
  toggleUserLock: jest.fn(),
}));

const mockGetUsers = getUsers as jest.MockedFunction<typeof getUsers>;
const mockDeleteAdmin = deleteAdmin as jest.MockedFunction<typeof deleteAdmin>;

const mockUsers = [
  {
    id: 'user-1',
    username: 'admin1',
    email: 'admin1@test.com',
    isActive: true,
  },
];

function renderTab() {
  const client = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  });
  const openConfirm = jest.fn((_msg: string, cb: () => void) => cb());
  return {
    openConfirm,
    ...render(
      <QueryClientProvider client={client}>
        <UsersTab
          onSelectUser={jest.fn()}
          onEditUser={jest.fn()}
          openConfirm={openConfirm}
        />
      </QueryClientProvider>,
    ),
  };
}

describe('AdminPage — UsersTab (TC110, TC112)', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockGetUsers.mockResolvedValue(
      mockUsers as Awaited<ReturnType<typeof getUsers>>,
    );
  });

  it('TC110 — renders admin users table with username and email', async () => {
    renderTab();
    await waitFor(() => {
      expect(screen.getByText('admin1')).toBeTruthy();
      expect(screen.getByText('admin1@test.com')).toBeTruthy();
    });
  });

  it('TC112 — clicking delete triggers openConfirm then calls deleteAdmin', async () => {
    mockDeleteAdmin.mockResolvedValue(
      {} as unknown as Awaited<ReturnType<typeof deleteAdmin>>,
    );
    const { openConfirm } = renderTab();
    await waitFor(() => screen.getByText('admin1'));

    fireEvent.click(screen.getByTitle('Xóa'));

    await waitFor(() => {
      expect(openConfirm).toHaveBeenCalled();
      expect(mockDeleteAdmin).toHaveBeenCalledWith('user-1');
    });
  });
});
