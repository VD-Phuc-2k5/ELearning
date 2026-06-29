import type { ReactNode } from 'react';
import { AppShell } from '../../components/layout/app-shell';

interface MainLayoutProps { children: ReactNode; }

export default function MainLayout({ children }: MainLayoutProps) {
  return <AppShell>{children}</AppShell>;
}
