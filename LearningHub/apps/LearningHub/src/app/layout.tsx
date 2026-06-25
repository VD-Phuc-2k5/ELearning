import './global.css';
import { AppShell } from '../components/layout/app-shell';

export const metadata = {
  title: 'LearningHub',
  description: 'E-learning management workspace',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="vi">
      <body>
        <AppShell>{children}</AppShell>
      </body>
    </html>
  );
}
