import type { Metadata } from 'next';
import type { ReactNode } from 'react';
import QueryProvider from '../components/providers/query-provider';
import './global.css';

export const metadata: Metadata = {
  title: 'LearningHub',
  description: 'E-learning management workspace',
};

interface RootLayoutProps {
  children: ReactNode;
}

export default function RootLayout({ children }: RootLayoutProps) {
  return (
    <html lang="vi" suppressHydrationWarning data-scroll-behavior="smooth">
      <head>
        <script
          dangerouslySetInnerHTML={{
            __html: 'window.litDisableDevModeWarning=true;',
          }}
        />
      </head>
      <body>
        <QueryProvider>{children}</QueryProvider>
      </body>
    </html>
  );
}
