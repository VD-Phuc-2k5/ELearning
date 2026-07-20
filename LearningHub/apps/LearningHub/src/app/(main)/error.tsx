'use client';

import { useEffect } from 'react';

export default function ErrorPage({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error('Page error:', error);
  }, [error]);

  return (
    <div style={{ padding: 40, fontFamily: 'monospace' }}>
      <h2>Something went wrong</h2>
      <pre style={{ whiteSpace: 'pre-wrap', wordBreak: 'break-word' }}>
        {error.message}
      </pre>
      <pre style={{ color: '#666', fontSize: 12 }}>digest: {error.digest}</pre>
      <pre style={{ color: '#666', fontSize: 12 }}>stack: {error.stack}</pre>
      <button onClick={reset} style={{ marginTop: 16, padding: '8px 16px' }}>
        Try again
      </button>
    </div>
  );
}
