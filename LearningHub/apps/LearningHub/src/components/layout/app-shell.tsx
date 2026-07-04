'use client';

import { useEffect, useCallback } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import type { ReactNode } from 'react';
import { logoutAction } from '../../app/actions/auth.actions';
import { useCurrentUser } from '../hooks/use-current-user';
import { SideNav } from './side-nav';
import { HeaderBar } from './header-bar';
import { MobileNav } from './mobile-nav';

function decodeJwtPayload(token: string): Record<string, unknown> | null {
  try {
    const parts = token.split('.');
    if (parts.length !== 3) return null;
    return JSON.parse(atob(parts[1]));
  } catch {
    return null;
  }
}

type AppShellProps = { children: ReactNode };

export function AppShell({ children }: AppShellProps) {
  const pathname = usePathname();
  const router = useRouter();
  const { user, isLoading } = useCurrentUser();

  const handleLogout = async () => {
    await logoutAction();
    localStorage.removeItem('user');
    router.push('/auth');
  };

  const checkTokenIdentity = useCallback(() => {
    if (typeof document === 'undefined') return;
    const storedId = sessionStorage.getItem('__activeUserId');
    if (!storedId) return;
    const cookies = document.cookie;
    const match = cookies.match(/(?:^|;\s*)accessToken=([^;]*)/);
    if (!match) return;
    const payload = decodeJwtPayload(match[1]);
    if (!payload?.sub) return;
    if (payload.sub !== storedId) {
      sessionStorage.clear();
      window.location.reload();
    }
  }, []);

  useEffect(() => {
    if (!user?.id) return;
    sessionStorage.setItem('__activeUserId', user.id);
  }, [user?.id]);

  useEffect(() => {
    const onVisible = () => {
      if (document.visibilityState === 'visible') {
        checkTokenIdentity();
      }
    };
    document.addEventListener('visibilitychange', onVisible);
    return () => document.removeEventListener('visibilitychange', onVisible);
  }, [checkTokenIdentity]);

  if (pathname?.startsWith('/auth')) {
    return <>{children}</>;
  }

  useEffect(() => {
    if (!isLoading && !user) {
      router.replace('/auth');
    }
  }, [isLoading, user, router]);

  if (isLoading || !user) {
    return null;
  }

  return (
    <div className="min-h-screen bg-slate-50 text-slate-950">
      <SideNav user={user} onLogout={handleLogout} />

      <header className="sticky top-0 z-30 p-6 border-b border-slate-100 bg-white/95 backdrop-blur lg:ml-64 lg:px-8">
        <HeaderBar onLogout={handleLogout} />
        <MobileNav />
      </header>

      <main className="lg:ml-64">
        <div className="w-full px-4 py-8 mx-auto max-w-7xl sm:px-6 lg:px-8">
          {children}
        </div>
      </main>
    </div>
  );
}
