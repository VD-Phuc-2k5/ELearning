import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import RegisterPage from './page';
import { registerAction } from '../../actions/auth.actions';

jest.mock('next/navigation', () => ({
  useRouter: () => ({ push: jest.fn() }),
}));

jest.mock('../../actions/auth.actions', () => ({
  registerAction: jest.fn(),
}));

// ponytail: mock components/ui to avoid loading tiptap ESM-only deps
jest.mock('../../../components/ui', () => ({
  Button: ({ children, isLoading, ...props }: any) => (
    <button {...props} disabled={isLoading || props.disabled}>
      {children}
    </button>
  ),
  // ponytail: type="email" in JSDOM blocks native form validation before zodResolver runs
  Input: ({
    error,
    label: _label,
    type,
    helperText: _helperText,
    ...props
  }: any) => (
    <>
      <input {...props} type={type === 'email' ? 'text' : type} />
      {error && <span>{error}</span>}
    </>
  ),
}));

const mockRegisterAction = registerAction as jest.MockedFunction<
  typeof registerAction
>;

function renderPage() {
  const client = new QueryClient({
    defaultOptions: { queries: { retry: false }, mutations: { retry: false } },
  });
  return render(
    <QueryClientProvider client={client}>
      <RegisterPage />
    </QueryClientProvider>,
  );
}

function getUsernameInput() {
  return screen.getByPlaceholderText('John Doe') as HTMLInputElement;
}

function getEmailInput() {
  return screen.getByPlaceholderText('you@example.com') as HTMLInputElement;
}

function getPasswordInput() {
  return document.querySelector('input[type="password"]') as HTMLInputElement;
}

function getSubmitButton() {
  return screen.getByRole('button', { name: /create account/i });
}

describe('LearningHub — Register Page (TC126–TC137)', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('TC126 — renders username, email, and password inputs', () => {
    renderPage();
    expect(getUsernameInput()).toBeTruthy();
    expect(getEmailInput()).toBeTruthy();
    expect(getPasswordInput()).toBeTruthy();
  });

  it('TC127 — calls registerAction with all valid fields', async () => {
    mockRegisterAction.mockResolvedValue({ success: true });
    renderPage();

    fireEvent.change(getUsernameInput(), { target: { value: 'newuser' } });
    fireEvent.change(getEmailInput(), { target: { value: 'new@gmail.com' } });
    fireEvent.change(getPasswordInput(), { target: { value: 'Pass@123' } });
    fireEvent.click(getSubmitButton());

    await waitFor(() => {
      expect(mockRegisterAction).toHaveBeenCalled();
      expect(mockRegisterAction.mock.calls[0][0]).toMatchObject({
        username: 'newuser',
        email: 'new@gmail.com',
        password: 'Pass@123',
      });
    });
  });

  it('TC128 — does not call registerAction when username is empty', async () => {
    renderPage();
    fireEvent.change(getEmailInput(), { target: { value: 'new@gmail.com' } });
    fireEvent.change(getPasswordInput(), { target: { value: 'Pass@123' } });
    fireEvent.click(getSubmitButton());

    await waitFor(() => {
      expect(mockRegisterAction).not.toHaveBeenCalled();
    });
  });

  it('TC129 — shows validation error when username is 2 characters (min - 1)', async () => {
    renderPage();
    fireEvent.change(getUsernameInput(), { target: { value: 'ab' } });
    fireEvent.change(getEmailInput(), { target: { value: 'new@gmail.com' } });
    fireEvent.change(getPasswordInput(), { target: { value: 'Pass@123' } });
    fireEvent.click(getSubmitButton());

    await waitFor(() => {
      expect(screen.getByText(/at least 3/i)).toBeTruthy();
    });
    expect(mockRegisterAction).not.toHaveBeenCalled();
  });

  it('TC130 — calls registerAction when username is exactly 3 characters (min)', async () => {
    mockRegisterAction.mockResolvedValue({ success: true });
    renderPage();

    fireEvent.change(getUsernameInput(), { target: { value: 'abc' } });
    fireEvent.change(getEmailInput(), { target: { value: 'new@gmail.com' } });
    fireEvent.change(getPasswordInput(), { target: { value: 'Pass@123' } });
    fireEvent.click(getSubmitButton());

    await waitFor(() => {
      expect(mockRegisterAction).toHaveBeenCalled();
    });
  });

  it('TC131 — shows validation error for invalid email format', async () => {
    renderPage();
    fireEvent.change(getUsernameInput(), { target: { value: 'newuser' } });
    fireEvent.change(getEmailInput(), { target: { value: 'notanemail' } });
    fireEvent.change(getPasswordInput(), { target: { value: 'Pass@123' } });
    fireEvent.click(getSubmitButton());

    await waitFor(() => {
      expect(screen.getByText(/invalid email/i)).toBeTruthy();
    });
    expect(mockRegisterAction).not.toHaveBeenCalled();
  });

  it('TC132 — shows error when password has no uppercase letter', async () => {
    renderPage();
    fireEvent.change(getUsernameInput(), { target: { value: 'newuser' } });
    fireEvent.change(getEmailInput(), { target: { value: 'new@gmail.com' } });
    fireEvent.change(getPasswordInput(), { target: { value: 'pass@123' } });
    fireEvent.click(getSubmitButton());

    await waitFor(() => {
      expect(screen.getByText(/uppercase/i)).toBeTruthy();
    });
    expect(mockRegisterAction).not.toHaveBeenCalled();
  });

  it('TC133 — shows error when password has no lowercase letter', async () => {
    renderPage();
    fireEvent.change(getUsernameInput(), { target: { value: 'newuser' } });
    fireEvent.change(getEmailInput(), { target: { value: 'new@gmail.com' } });
    fireEvent.change(getPasswordInput(), { target: { value: 'PASS@123' } });
    fireEvent.click(getSubmitButton());

    await waitFor(() => {
      expect(screen.getByText(/lowercase/i)).toBeTruthy();
    });
    expect(mockRegisterAction).not.toHaveBeenCalled();
  });

  it('TC134 — shows error when password has no special character', async () => {
    renderPage();
    fireEvent.change(getUsernameInput(), { target: { value: 'newuser' } });
    fireEvent.change(getEmailInput(), { target: { value: 'new@gmail.com' } });
    fireEvent.change(getPasswordInput(), { target: { value: 'Password1' } });
    fireEvent.click(getSubmitButton());

    await waitFor(() => {
      expect(screen.getByText(/special character/i)).toBeTruthy();
    });
    expect(mockRegisterAction).not.toHaveBeenCalled();
  });

  it('TC135 — shows validation error when password is 7 characters (min - 1)', async () => {
    renderPage();
    fireEvent.change(getUsernameInput(), { target: { value: 'newuser' } });
    fireEvent.change(getEmailInput(), { target: { value: 'new@gmail.com' } });
    fireEvent.change(getPasswordInput(), { target: { value: 'Pas@123' } });
    fireEvent.click(getSubmitButton());

    await waitFor(() => {
      expect(screen.getByText(/at least 8/i)).toBeTruthy();
    });
    expect(mockRegisterAction).not.toHaveBeenCalled();
  });

  it('TC136 — calls registerAction when password is exactly 8 valid characters (min)', async () => {
    mockRegisterAction.mockResolvedValue({ success: true });
    renderPage();

    fireEvent.change(getUsernameInput(), { target: { value: 'newuser' } });
    fireEvent.change(getEmailInput(), { target: { value: 'new@gmail.com' } });
    fireEvent.change(getPasswordInput(), { target: { value: 'Pass@123' } });
    fireEvent.click(getSubmitButton());

    await waitFor(() => {
      expect(mockRegisterAction).toHaveBeenCalled();
    });
  });

  it('TC137 — shows server error message when registerAction returns failure', async () => {
    mockRegisterAction.mockResolvedValue({
      success: false,
      error: 'Email already exists',
    });
    renderPage();

    fireEvent.change(getUsernameInput(), { target: { value: 'newuser' } });
    fireEvent.change(getEmailInput(), {
      target: { value: 'existing@gmail.com' },
    });
    fireEvent.change(getPasswordInput(), { target: { value: 'Pass@123' } });
    fireEvent.click(getSubmitButton());

    await waitFor(() => {
      expect(screen.getByText('Email already exists')).toBeTruthy();
    });
  });
});
