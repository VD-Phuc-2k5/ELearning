import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { PermissionsTab } from './permissions-tab';
import { getPermissions, deletePermission } from '../actions/admin.actions';

jest.mock('@aejkatappaja/phantom-ui', () => ({}), { virtual: true });

jest.mock('../actions/admin.actions', () => ({
  getPermissions: jest.fn(),
  deletePermission: jest.fn(),
}));

const mockGetPermissions = getPermissions as jest.MockedFunction<
  typeof getPermissions
>;
const mockDeletePermission = deletePermission as jest.MockedFunction<
  typeof deletePermission
>;

const mockPermissions = [
  {
    id: 1,
    code: 'users:get',
    resource: 'users',
    action: 'get',
    name: 'Get Users',
  },
  {
    id: 2,
    code: 'users:create',
    resource: 'users',
    action: 'create',
    name: 'Create Users',
  },
  {
    id: 3,
    code: 'quiz:manage',
    resource: 'quiz',
    action: 'manage',
    name: 'Manage Quiz',
  },
];

function renderTab(openConfirm = jest.fn()) {
  const client = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  });
  return render(
    <QueryClientProvider client={client}>
      <PermissionsTab openConfirm={openConfirm} />
    </QueryClientProvider>,
  );
}

describe('AdminPage — PermissionsTab', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockGetPermissions.mockResolvedValue(
      mockPermissions as Awaited<ReturnType<typeof getPermissions>>,
    );
  });

  it('renders permission codes', async () => {
    renderTab();
    await waitFor(() => {
      expect(screen.getByText('users:get')).toBeTruthy();
      expect(screen.getByText('users:create')).toBeTruthy();
      expect(screen.getByText('quiz:manage')).toBeTruthy();
    });
  });

  it('renders resource labels', async () => {
    renderTab();
    await waitFor(() => {
      const usersLabels = screen.getAllByText('users');
      expect(usersLabels.length).toBe(2);
      expect(screen.getByText('quiz')).toBeTruthy();
    });
  });

  it('renders action names in uppercase', async () => {
    renderTab();
    await waitFor(() => {
      expect(screen.getByText('GET')).toBeTruthy();
      expect(screen.getByText('CREATE')).toBeTruthy();
      expect(screen.getByText('MANAGE')).toBeTruthy();
    });
  });

  it('renders permission display names', async () => {
    renderTab();
    await waitFor(() => {
      expect(screen.getByText('Get Users')).toBeTruthy();
      expect(screen.getByText('Create Users')).toBeTruthy();
      expect(screen.getByText('Manage Quiz')).toBeTruthy();
    });
  });

  it('clicking delete calls openConfirm', async () => {
    const openConfirm = jest.fn((_msg: string, cb: () => void) => cb());
    renderTab(openConfirm);
    await waitFor(() => screen.getByText('users:get'));

    const delBtns = screen.getAllByRole('button');
    const delBtn = delBtns.find((b) => b.className.includes('top-4'));
    expect(delBtn).toBeTruthy();
    if (!delBtn) throw new Error('delete button not found');
    fireEvent.click(delBtn);

    await waitFor(() => {
      expect(openConfirm).toHaveBeenCalled();
    });
  });

  it('deletePermission is called after confirm', async () => {
    mockDeletePermission.mockResolvedValue(
      {} as unknown as Awaited<ReturnType<typeof deletePermission>>,
    );
    const openConfirm = jest.fn((_msg: string, cb: () => void) => cb());
    renderTab(openConfirm);
    await waitFor(() => screen.getByText('users:get'));

    const delBtns = screen.getAllByRole('button');
    const delBtn = delBtns.find((b) => b.className.includes('top-4'));
    expect(delBtn).toBeTruthy();
    if (!delBtn) throw new Error('delete button not found');
    fireEvent.click(delBtn);

    await waitFor(() => {
      expect(mockDeletePermission).toHaveBeenCalled();
    });
  });
});
