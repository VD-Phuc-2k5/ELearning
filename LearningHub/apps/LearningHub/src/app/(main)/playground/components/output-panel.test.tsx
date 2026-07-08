import React from 'react';
import { render, screen } from '@testing-library/react';
import { OutputPanel } from './output-panel';

jest.mock('lucide-react', () => ({
  Terminal: () => null,
  Clock: () => null,
  AlertCircle: () => null,
}));

jest.mock('./status-badge', () => ({
  StatusBadge: ({ status }: { status: string }) => (
    <span data-testid="status-badge">{status}</span>
  ),
}));

describe('LearningHub — OutputPanel (TC155–TC159)', () => {
  it('TC155 — renders idle state with prompt text when no execution yet', () => {
    render(
      <OutputPanel mutation={{ isPending: false, data: null, error: null }} />,
    );
    expect(screen.getByText(/Press 'Run Code'/i)).toBeTruthy();
  });

  it('TC156 — renders Console Output heading', () => {
    render(
      <OutputPanel mutation={{ isPending: false, data: null, error: null }} />,
    );
    expect(screen.getByText('Console Output')).toBeTruthy();
  });

  it('TC157 — shows loading indicator when isPending is true', () => {
    render(
      <OutputPanel mutation={{ isPending: true, data: null, error: null }} />,
    );
    expect(screen.getByText(/Running inside isolated sandbox/i)).toBeTruthy();
  });

  it('TC158 — shows stdout output after successful execution', () => {
    const data = {
      status: 'success',
      stdout: 'Hello, World!',
      stderr: null,
      executionTimeMs: 42,
      exitCode: 0,
    };
    render(<OutputPanel mutation={{ isPending: false, data, error: null }} />);
    expect(screen.getByText('Hello, World!')).toBeTruthy();
    expect(screen.getByText('42 ms')).toBeTruthy();
    expect(screen.getByTestId('status-badge')).toBeTruthy();
  });

  it('TC159 — shows execution error message when mutation errors', () => {
    const error = new Error('Syntax error on line 3');
    render(<OutputPanel mutation={{ isPending: false, data: null, error }} />);
    expect(screen.getByText('Execution Error:')).toBeTruthy();
    expect(screen.getByText('Syntax error on line 3')).toBeTruthy();
  });

  it('TC159b — shows stderr section when execution produces stderr', () => {
    const data = {
      status: 'runtime_error',
      stdout: null,
      stderr: 'NameError: name "x" is not defined',
      executionTimeMs: 10,
      exitCode: 1,
    };
    render(<OutputPanel mutation={{ isPending: false, data, error: null }} />);
    expect(screen.getByText('Standard Error')).toBeTruthy();
    expect(screen.getByText('NameError: name "x" is not defined')).toBeTruthy();
  });

  it('TC159c — shows no output message when stdout and stderr are both empty', () => {
    const data = {
      status: 'success',
      stdout: null,
      stderr: null,
      executionTimeMs: 5,
      exitCode: 0,
    };
    render(<OutputPanel mutation={{ isPending: false, data, error: null }} />);
    expect(screen.getByText(/Program exited with no output/i)).toBeTruthy();
  });
});
