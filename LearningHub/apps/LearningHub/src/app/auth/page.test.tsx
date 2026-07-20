import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import LoginPage from './page';
import { loginAction } from '../actions/auth.actions';

jest.mock('next/navigation', () => ({
  useRouter: () => ({ push: jest.fn() }),
}));

jest.mock('../actions/auth.actions', () => ({
  loginAction: jest.fn(),
}));

// ponytail: mock components/ui to avoid loading tiptap ESM-only deps
jest.mock('../../components/ui', () => ({
  Button: ({ children, isLoading, ...props }: any) => (
    <button {...props} disabled={isLoading || props.disabled}>
      {children}
    </button>
  ),
  // ponytail: type="email" in JSDOM blocks native form validation before zodResolver runs;
  // convert to "text" so zod validates instead of the browser.
  Input: ({ error, label: _label, type, ...props }: any) => (
    <>
      <input {...props} type={type === 'email' ? 'text' : type} />
      {error && <span>{error}</span>}
    </>
  ),
}));

const mockLoginAction = loginAction as jest.MockedFunction<typeof loginAction>;

function renderPage() {
  const client = new QueryClient({
    defaultOptions: { queries: { retry: false }, mutations: { retry: false } },
  });
  return render(
    <QueryClientProvider client={client}>
      <LoginPage />
    </QueryClientProvider>,
  );
}

function getEmailInput() {
  return screen.getByPlaceholderText('you@example.com') as HTMLInputElement;
}

function getPasswordInput() {
  return document.querySelector('input[type="password"]') as HTMLInputElement;
}

function getSubmitButton() {
  return screen.getByRole('button', { name: /sign in/i });
}

describe('LearningHub — Login Page (TC116–TC125)', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('TC116 — renders email input, password input, and submit button', () => {
    renderPage();
    expect(getEmailInput()).toBeTruthy();
    expect(getPasswordInput()).toBeTruthy();
    expect(getSubmitButton()).toBeTruthy();
  });

  it('TC117 — calls loginAction with valid credentials and redirects', async () => {
    const mockPush = jest.fn();
    jest
      .spyOn(require('next/navigation'), 'useRouter')
      .mockReturnValue({ push: mockPush });
    mockLoginAction.mockResolvedValue({
      success: true,
      accessToken: 'at',
      refreshToken: 'rt',
    });
    renderPage();

    fireEvent.change(getEmailInput(), { target: { value: 'user@gmail.com' } });
    fireEvent.change(getPasswordInput(), { target: { value: 'Pass@123' } });
    fireEvent.click(getSubmitButton());

    await waitFor(() => {
      expect(mockLoginAction).toHaveBeenCalled();
      expect(mockLoginAction.mock.calls[0][0]).toMatchObject({
        email: 'user@gmail.com',
        password: 'Pass@123',
      });
    });
  });

  it('TC118 — does not call loginAction when email is empty', async () => {
    renderPage();
    fireEvent.change(getPasswordInput(), { target: { value: 'Pass@123' } });
    fireEvent.click(getSubmitButton());

    await waitFor(() => {
      expect(mockLoginAction).not.toHaveBeenCalled();
    });
  });

  it('TC119 — shows validation error for invalid email format', async () => {
    renderPage();
    fireEvent.change(getEmailInput(), { target: { value: 'notanemail' } });
    fireEvent.change(getPasswordInput(), { target: { value: 'Pass@123' } });
    fireEvent.click(getSubmitButton());

    await waitFor(() => {
      expect(screen.getByText(/invalid email/i)).toBeTruthy();
    });
    expect(mockLoginAction).not.toHaveBeenCalled();
  });

  it('TC120 — does not call loginAction when password is empty', async () => {
    renderPage();
    fireEvent.change(getEmailInput(), { target: { value: 'user@gmail.com' } });
    fireEvent.click(getSubmitButton());

    await waitFor(() => {
      expect(mockLoginAction).not.toHaveBeenCalled();
    });
  });

  it('TC121 — shows validation error when password is 7 characters (min - 1)', async () => {
    renderPage();
    fireEvent.change(getEmailInput(), { target: { value: 'user@gmail.com' } });
    fireEvent.change(getPasswordInput(), { target: { value: 'pass123' } });
    fireEvent.click(getSubmitButton());

    await waitFor(() => {
      expect(screen.getByText(/at least 8/i)).toBeTruthy();
    });
    expect(mockLoginAction).not.toHaveBeenCalled();
  });

  it('TC122 — calls loginAction when password is exactly 8 characters (min)', async () => {
    mockLoginAction.mockResolvedValue({
      success: true,
      accessToken: 'at',
      refreshToken: 'rt',
    });
    renderPage();

    fireEvent.change(getEmailInput(), { target: { value: 'user@gmail.com' } });
    fireEvent.change(getPasswordInput(), { target: { value: 'pass1234' } });
    fireEvent.click(getSubmitButton());

    await waitFor(() => {
      expect(mockLoginAction).toHaveBeenCalled();
    });
  });

  it('TC123 — shows server error message when loginAction returns failure', async () => {
    mockLoginAction.mockResolvedValue({
      success: false,
      error: 'Invalid credentials',
    });
    renderPage();

    fireEvent.change(getEmailInput(), { target: { value: 'user@gmail.com' } });
    fireEvent.change(getPasswordInput(), { target: { value: 'Pass@123' } });
    fireEvent.click(getSubmitButton());

    await waitFor(() => {
      expect(screen.getByText('Invalid credentials')).toBeTruthy();
    });
  });

  it('TC124 — submit button is disabled while mutation is pending', async () => {
    mockLoginAction.mockImplementation(() => new Promise<any>(() => undefined)); // never resolves
    renderPage();

    fireEvent.change(getEmailInput(), { target: { value: 'user@gmail.com' } });
    fireEvent.change(getPasswordInput(), { target: { value: 'Pass@123' } });
    fireEvent.click(getSubmitButton());

    await waitFor(() => {
      expect((getSubmitButton() as HTMLButtonElement).disabled).toBe(true);
    });
  });

  it('TC125 — has a link to the register page', () => {
    renderPage();
    const link = screen.getByRole('link', {
      name: /sign up/i,
    }) as HTMLAnchorElement;
    expect(link).toBeTruthy();
    expect(link.href).toContain('/auth/register');
  });
});
