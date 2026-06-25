'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import type { ReactNode } from 'react';
import { Button } from '../ui';

const navigation = [
  { href: '/', label: 'Dashboard', icon: 'D' },
  { href: '/courses', label: 'Courses', icon: 'C' },
  { href: '/assignments', label: 'Assignments', icon: 'A' },
  { href: '/settings', label: 'Settings', icon: 'S' },
];

type AppShellProps = {
  children: ReactNode;
};

export function AppShell({ children }: AppShellProps) {
  const pathname = usePathname();

  if (pathname?.startsWith('/auth')) {
    return <>{children}</>;
  }


  return (
    <div className="min-h-screen bg-slate-50 text-slate-950">
      <aside className="fixed inset-y-0 left-0 z-20 hidden w-64 px-4 py-5 bg-white border-r border-slate-200 lg:block">
        <Brand />
        <nav className="mt-8 space-y-1" aria-label="Main navigation">
          {navigation.map((item) => (
            <NavLink
              href={item.href}
              icon={item.icon}
              isActive={pathname === item.href}
              key={item.href}
              label={item.label}
            />
          ))}
        </nav>
      </aside>

      <header className="sticky top-0 z-30 px-4 border-b border-slate-200 bg-white/95 backdrop-blur lg:ml-64 lg:px-8">
        <div className="flex items-center justify-between h-16 gap-3">
          <div className="flex items-center min-w-0 gap-3">
            <div className="lg:hidden">
              <Brand compact />
            </div>
            <div className="hidden min-w-0 lg:block">
              <p className="text-xs font-semibold uppercase text-slate-500">
                LearningHub
              </p>
              <h1 className="text-lg font-semibold truncate text-slate-950">
                Training workspace
              </h1>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Button size="sm" variant="ghost">
              Help
            </Button>
            <Button size="sm">New course</Button>
          </div>
        </div>
        <nav
          aria-label="Mobile navigation"
          className="flex gap-2 py-2 overflow-x-auto border-t border-slate-100 lg:hidden"
        >
          {navigation.map((item) => (
            <Link
              className={[
                'whitespace-nowrap rounded-md px-3 py-2 text-sm font-medium transition',
                pathname === item.href
                  ? 'bg-indigo-50 text-indigo-700'
                  : 'text-slate-600 hover:bg-slate-100 hover:text-slate-950',
              ].join(' ')}
              href={item.href}
              key={item.href}
            >
              {item.label}
            </Link>
          ))}
        </nav>
      </header>

      <main className="lg:ml-64">
        <div className="w-full px-4 py-6 mx-auto max-w-7xl sm:px-6 lg:px-8">
          {children}
        </div>
      </main>
    </div>
  );
}

function Brand({ compact = false }: { compact?: boolean }) {
  return (
    <Link className="flex items-center min-w-0 gap-3" href="/">
      <span className="grid w-10 h-10 text-sm font-bold text-white bg-indigo-600 rounded-md shrink-0 place-items-center">
        LH
      </span>
      {!compact ? (
        <span className="min-w-0">
          <span className="block text-base font-semibold truncate text-slate-950">
            LearningHub
          </span>
          <span className="block text-xs font-medium truncate text-slate-500">
            E-learning admin
          </span>
        </span>
      ) : null}
    </Link>
  );
}

function NavLink({
  href,
  icon,
  isActive,
  label,
}: {
  href: string;
  icon: string;
  isActive: boolean;
  label: string;
}) {
  return (
    <Link
      className={[
        'flex items-center gap-3 rounded-md px-3 py-2.5 text-sm font-medium transition',
        isActive
          ? 'bg-indigo-50 text-indigo-700'
          : 'text-slate-600 hover:bg-slate-100 hover:text-slate-950',
      ].join(' ')}
      href={href}
    >
      <span
        className={[
          'grid h-8 w-8 shrink-0 place-items-center rounded-md text-xs font-bold',
          isActive ? 'bg-white text-indigo-700' : 'bg-slate-100 text-slate-500',
        ].join(' ')}
      >
        {icon}
      </span>
      <span>{label}</span>
    </Link>
  );
}
