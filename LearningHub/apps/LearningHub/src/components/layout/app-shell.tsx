'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import type { ReactNode } from 'react';
import { useState, useEffect } from 'react';
import {
  LayoutDashboard,
  Users,
  BookOpen,
  Map,
  MessageSquare,
  LogOut,
  Plus,
  HelpCircle,
} from 'lucide-react';
import type { User } from '@learning-hub/domain';
import { Button } from '../ui';
import { logoutAction } from '../../app/actions/auth.actions';

const navigation = [
  { href: '/', label: 'Dashboard', Icon: LayoutDashboard },
  { href: '/community', label: 'Community', Icon: Users },
  { href: '/my-banks', label: 'Workshop', Icon: BookOpen },
  { href: '/roadmaps/manage', label: 'Roadmaps', Icon: Map },
  { href: '/forum', label: 'Forum', Icon: MessageSquare },
];

type AppShellProps = { children: ReactNode };

export function AppShell({ children }: AppShellProps) {
  const pathname = usePathname();
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    const raw = localStorage.getItem('user');
    const currentUser: User | null = raw ? JSON.parse(raw) : null;
    if (!currentUser && !pathname?.startsWith('/auth')) {
      router.replace('/auth');
      return;
    }
    setUser(currentUser);
  }, [pathname, router]);

  const handleLogout = async () => {
    await logoutAction();
    localStorage.removeItem('refreshToken');
    localStorage.removeItem('user');
    localStorage.removeItem('accessToken');
    router.push('/auth');
  };

  if (pathname?.startsWith('/auth')) {
    return <>{children}</>;
  }

  if (!user) {
    return null;
  }

  return (
    <div className="min-h-screen bg-slate-50 text-slate-950">
      <aside className="fixed inset-y-0 left-0 z-20 hidden w-64 flex-col px-4 py-5 bg-white border-r border-slate-100 lg:flex">
        <Brand />
        <nav className="mt-8 flex-1 space-y-1" aria-label="Main navigation">
          {navigation.map((item) => (
            <NavLink
              key={item.href}
              href={item.href}
              Icon={item.Icon}
              isActive={
                pathname === item.href ||
                (item.href !== '/' && pathname?.startsWith(item.href))
              }
              label={item.label}
            />
          ))}
        </nav>
        <div className="border-t border-slate-100 pt-4 mt-4">
          {user && (
            <div className="flex items-center gap-3 px-3 py-2 mb-2">
              <div className="h-8 w-8 rounded-full bg-indigo-100 flex items-center justify-center text-xs font-bold text-indigo-700 shrink-0">
                {user.email[0].toUpperCase()}
              </div>
              <span className="text-sm font-medium text-slate-700 truncate">
                {user.email}
              </span>
            </div>
          )}
          <button
            onClick={handleLogout}
            className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium text-slate-600 hover:bg-red-50 hover:text-red-600 transition"
          >
            <span className="grid h-8 w-8 shrink-0 place-items-center rounded-lg bg-slate-100 text-slate-500">
              <LogOut className="h-4 w-4" />
            </span>
            <span>Sign out</span>
          </button>
        </div>
      </aside>

      <header className="sticky top-0 z-30 p-6 border-b border-slate-100 bg-white/95 backdrop-blur lg:ml-64 lg:px-8">
        <div className="flex items-center justify-between gap-3">
          <div className="flex items-center min-w-0 gap-3">
            <div className="lg:hidden">
              <Brand compact />
            </div>
            <div className="hidden min-w-0 lg:block">
              <h1 className="text-lg font-semibold truncate text-slate-900">
                Learning & Creative Space
              </h1>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Button size="sm" variant="ghost">
              <HelpCircle className="h-4 w-full" />
              <span className="hidden sm:inline">Help</span>
            </Button>
            <Link href="/my-banks/create">
              <Button size="sm" icon={<Plus className="h-4 w-4" />}>
                <span className="hidden sm:inline">New Bank</span>
              </Button>
            </Link>
          </div>
        </div>
        <nav
          aria-label="Mobile navigation"
          className="flex gap-2 py-2 overflow-x-auto border-t border-slate-100 lg:hidden"
        >
          {navigation.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={[
                'whitespace-nowrap rounded-lg px-3 py-2 text-sm font-medium transition',
                pathname === item.href ||
                (item.href !== '/' && pathname?.startsWith(item.href))
                  ? 'bg-indigo-50 text-indigo-700'
                  : 'text-slate-600 hover:bg-slate-100 hover:text-slate-950',
              ].join(' ')}
            >
              {item.label}
            </Link>
          ))}
        </nav>
      </header>

      <main className="lg:ml-64">
        <div className="w-full px-4 py-8 mx-auto max-w-7xl sm:px-6 lg:px-8">
          {children}
        </div>
      </main>
    </div>
  );
}

function Brand({ compact = false }: { compact?: boolean }) {
  return (
    <Link className="flex items-center min-w-0 gap-3" href="/">
      <span className="grid w-10 h-10 text-sm font-bold text-white bg-indigo-600 rounded-xl shrink-0 place-items-center shadow-sm">
        LH
      </span>
      {!compact ? (
        <span className="min-w-0">
          <span className="block text-base font-bold truncate text-slate-900">
            LearningHub
          </span>
          <span className="block text-xs font-medium truncate text-slate-400">
            E-learning Platform
          </span>
        </span>
      ) : null}
    </Link>
  );
}

function NavLink({
  href,
  Icon,
  isActive,
  label,
}: {
  href: string;
  Icon: React.ElementType;
  isActive: boolean;
  label: string;
}) {
  return (
    <Link
      href={href}
      className={[
        'flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition',
        isActive
          ? 'bg-indigo-50 text-indigo-700'
          : 'text-slate-500 hover:bg-slate-50 hover:text-slate-900',
      ].join(' ')}
    >
      <span
        className={[
          'grid h-8 w-8 shrink-0 place-items-center rounded-lg',
          isActive
            ? 'bg-white text-indigo-700 shadow-sm'
            : 'bg-slate-100 text-slate-400',
        ].join(' ')}
      >
        <Icon className="h-4 w-4" />
      </span>
      <span>{label}</span>
    </Link>
  );
}
