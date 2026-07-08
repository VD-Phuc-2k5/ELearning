import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { LoginScreen } from './login-screen';
import { adminLoginAction } from '../../app/actions/auth.actions';

jest.mock('../../app/actions/auth.actions', () => ({
  adminLoginAction: jest.fn(),
}));

jest.mock('../../lib/admin-api', () => ({
  getAxiosMessage: (_e: unknown, fallback: string) => fallback,
}));

const mockAdminLoginAction = adminLoginAction as jest.MockedFunction<
  typeof adminLoginAction
>;

function renderLoginScreen(onLogin = jest.fn()) {
  return render(<LoginScreen onLogin={onLogin} />);
}

function getEmailInput() {
  return screen.getByPlaceholderText('admin@example.com') as HTMLInputElement;
}

function getPasswordInput() {
  return document.querySelector('input[type="password"]') as HTMLInputElement;
}

function getSubmitButton() {
  return screen.getByRole('button', { name: /đăng nhập/i });
}

describe('AdminPage — LoginScreen (TC074–TC081)', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('TC074 — renders email input, password input, and submit button', () => {
    renderLoginScreen();
    expect(getEmailInput()).toBeTruthy();
    expect(getPasswordInput()).toBeTruthy();
    expect(getSubmitButton()).toBeTruthy();
  });

  it('TC075 — calls adminLoginAction and onLogin callback with valid credentials', async () => {
    const onLogin = jest.fn();
    mockAdminLoginAction.mockResolvedValue({
      success: true,
      accessToken: 'at',
      refreshToken: 'rt',
    });
    renderLoginScreen(onLogin);

    fireEvent.change(getEmailInput(), { target: { value: 'admin@gmail.com' } });
    fireEvent.change(getPasswordInput(), { target: { value: 'Pass@123' } });
    fireEvent.click(getSubmitButton());

    await waitFor(() => {
      expect(mockAdminLoginAction).toHaveBeenCalledWith(
        expect.objectContaining({
          email: 'admin@gmail.com',
          password: 'Pass@123',
        }),
      );
      expect(onLogin).toHaveBeenCalled();
    });
  });

  it('TC076 — does not call adminLoginAction when email is empty (native required validation)', async () => {
    renderLoginScreen();
    // ponytail: click the button, not fireEvent.submit — submit bypasses native validation
    fireEvent.change(getPasswordInput(), { target: { value: 'Pass@123' } });
    fireEvent.click(getSubmitButton());

    await waitFor(() => {
      expect(mockAdminLoginAction).not.toHaveBeenCalled();
    });
  });

  it('TC079 — shows error message when adminLoginAction returns failure', async () => {
    mockAdminLoginAction.mockResolvedValue({
      success: false,
      error: 'Sai tài khoản hoặc mật khẩu',
    });
    renderLoginScreen();

    fireEvent.change(getEmailInput(), { target: { value: 'admin@gmail.com' } });
    fireEvent.change(getPasswordInput(), { target: { value: 'WrongPass@1' } });
    fireEvent.click(getSubmitButton());

    await waitFor(() => {
      expect(screen.getByText('Sai tài khoản hoặc mật khẩu')).toBeTruthy();
    });
  });

  it('TC080 — toggles password visibility when eye icon button is clicked', () => {
    renderLoginScreen();
    const pwInput = getPasswordInput();
    expect(pwInput.type).toBe('password');

    // Eye toggle button is type="button" — find by exclusion from submit
    const buttons = screen.getAllByRole('button');
    const toggleButton = buttons.find(
      (b) => (b as HTMLButtonElement).type === 'button',
    )!;
    fireEvent.click(toggleButton);
    expect(pwInput.type).toBe('text');

    fireEvent.click(toggleButton);
    expect(pwInput.type).toBe('password');
  });

  it('TC081 — submit button is disabled while request is loading', async () => {
    mockAdminLoginAction.mockImplementation(
      () => new Promise<void>(() => undefined),
    ); // never resolves
    renderLoginScreen();

    fireEvent.change(getEmailInput(), { target: { value: 'admin@gmail.com' } });
    fireEvent.change(getPasswordInput(), { target: { value: 'Pass@123' } });
    fireEvent.click(getSubmitButton());

    await waitFor(() => {
      expect((getSubmitButton() as HTMLButtonElement).disabled).toBe(true);
    });
  });
});
