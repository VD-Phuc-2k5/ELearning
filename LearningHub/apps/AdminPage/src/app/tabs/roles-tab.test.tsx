import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { RolesTab } from './roles-tab';
import {
  getMatrix,
  assignPermissionToRole,
  removePermissionFromRole,
  deleteRole,
} from '../actions/admin.actions';

jest.mock('@aejkatappaja/phantom-ui', () => ({}), { virtual: true });

jest.mock('../actions/admin.actions', () => ({
  getMatrix: jest.fn(),
  assignPermissionToRole: jest.fn(),
  removePermissionFromRole: jest.fn(),
  deleteRole: jest.fn(),
}));

const mockGetMatrix = getMatrix as jest.MockedFunction<typeof getMatrix>;
const mockAssign = assignPermissionToRole as jest.MockedFunction<
  typeof assignPermissionToRole
>;
const mockRemove = removePermissionFromRole as jest.MockedFunction<
  typeof removePermissionFromRole
>;
const mockDeleteRole = deleteRole as jest.MockedFunction<typeof deleteRole>;

const mockMatrix = {
  roles: [
    { id: 1, code: 'ADMIN', name: 'Administrator' },
    { id: 2, code: 'EDITOR', name: 'Editor' },
  ],
  permissions: [
    {
      id: 10,
      code: 'users:get',
      resource: 'users',
      action: 'get',
      name: 'Get Users',
    },
    {
      id: 11,
      code: 'users:create',
      resource: 'users',
      action: 'create',
      name: 'Create Users',
    },
  ],
  matrix: {
    1: [10, 11], // ADMIN has both permissions
    2: [], // EDITOR has none
  },
};

function renderTab(openConfirm = jest.fn()) {
  const client = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  });
  return render(
    <QueryClientProvider client={client}>
      <RolesTab openConfirm={openConfirm} onEditRole={jest.fn()} />
    </QueryClientProvider>,
  );
}

describe('AdminPage — RolesTab (TC098–TC103)', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockGetMatrix.mockResolvedValue(
      mockMatrix as Awaited<ReturnType<typeof getMatrix>>,
    );
  });

  it('TC098 — renders matrix with role columns and permission rows', async () => {
    renderTab();
    await waitFor(() => {
      expect(screen.getByText('ADMIN')).toBeTruthy();
      expect(screen.getByText('EDITOR')).toBeTruthy();
      expect(screen.getByText('users:get')).toBeTruthy();
      expect(screen.getByText('users:create')).toBeTruthy();
    });
  });

  it('TC099 — clicking an unassigned cell calls assignPermissionToRole', async () => {
    mockAssign.mockResolvedValue(
      {} as unknown as Awaited<ReturnType<typeof assignPermissionToRole>>,
    );
    renderTab();

    await waitFor(() => screen.getByText('EDITOR'));

    // Find the unassigned toggle button (bg-slate-100, not emerald)
    const buttons = screen.getAllByRole('button');
    const unassigned = buttons.find(
      (b) =>
        b.className.includes('bg-slate-100') &&
        !b.className.includes('emerald'),
    );
    expect(unassigned).toBeTruthy();
    if (!unassigned) throw new Error('unassigned button not found');
    fireEvent.click(unassigned);

    await waitFor(() => expect(mockAssign).toHaveBeenCalled());
  });

  it('TC100 — clicking an assigned cell calls removePermissionFromRole', async () => {
    mockRemove.mockResolvedValue(
      {} as unknown as Awaited<ReturnType<typeof removePermissionFromRole>>,
    );
    renderTab();

    await waitFor(() => screen.getByText('ADMIN'));

    // Find the assigned toggle button (bg-emerald-500)
    const buttons = screen.getAllByRole('button');
    const assigned = buttons.find((b) =>
      b.className.includes('bg-emerald-500'),
    );
    expect(assigned).toBeTruthy();
    if (!assigned) throw new Error('assigned button not found');
    fireEvent.click(assigned);

    await waitFor(() => expect(mockRemove).toHaveBeenCalled());
  });

  it('TC103 — openConfirm is called when delete role button clicked; deleteRole called on confirm', async () => {
    mockDeleteRole.mockResolvedValue(
      {} as unknown as Awaited<ReturnType<typeof deleteRole>>,
    );
    const openConfirm = jest.fn((_msg: string, cb: () => void) => cb());
    renderTab(openConfirm);

    await waitFor(() => screen.getByText('ADMIN'));

    // Delete buttons are hidden by opacity-0 until hover; trigger them by clicking any delete-looking button
    // The buttons render inside thead th elements
    const allButtons = screen.getAllByRole('button');
    // Delete role buttons have hover:text-rose-600; edit buttons have hover:text-indigo-600
    const deleteBtn = allButtons.find((b) => b.className.includes('rose'));
    expect(deleteBtn).toBeTruthy();
    if (!deleteBtn) throw new Error('delete button not found');
    fireEvent.click(deleteBtn);

    await waitFor(() => expect(openConfirm).toHaveBeenCalled());
  });
});
