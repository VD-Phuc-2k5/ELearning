'use client';

import { useEffect } from 'react';

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error('Global error:', error);
  }, [error]);

  return (
    <html>
      <body>
        <div style={{ padding: 40, fontFamily: 'monospace' }}>
          <h2>Global Error</h2>
          <pre style={{ whiteSpace: 'pre-wrap', wordBreak: 'break-word' }}>
            {error.message}
          </pre>
          <pre style={{ color: '#666', fontSize: 12 }}>
            digest: {error.digest}
          </pre>
          <pre style={{ color: '#666', fontSize: 12 }}>
            stack: {error.stack}
          </pre>
          <button
            onClick={reset}
            style={{ marginTop: 16, padding: '8px 16px' }}
          >
            Try again
          </button>
        </div>
      </body>
    </html>
  );
}
