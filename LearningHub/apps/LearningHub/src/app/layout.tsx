import './global.css';

export const metadata = {
  title: 'LearningHub',
  description: 'E-learning management workspace',
};

import QueryProvider from '../components/providers/query-provider';

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="vi" suppressHydrationWarning>
      <body>
        <QueryProvider>{children}</QueryProvider>
      </body>
    </html>
  );
}
