import './global.css';

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
      <body>{children}</body>
    </html>
  );
}
