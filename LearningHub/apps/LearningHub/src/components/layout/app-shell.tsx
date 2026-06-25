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

  return (
    <div className="min-h-screen bg-slate-50 text-slate-950">
      <aside className="fixed inset-y-0 left-0 z-20 hidden w-64 border-r border-slate-200 bg-white px-4 py-5 lg:block">
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

      <header className="sticky top-0 z-30 border-b border-slate-200 bg-white/95 px-4 backdrop-blur lg:ml-64 lg:px-8">
        <div className="flex h-16 items-center justify-between gap-3">
          <div className="flex min-w-0 items-center gap-3">
            <div className="lg:hidden">
              <Brand compact />
            </div>
            <div className="hidden min-w-0 lg:block">
              <p className="text-xs font-semibold uppercase text-slate-500">
                LearningHub
              </p>
              <h1 className="truncate text-lg font-semibold text-slate-950">
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
          className="flex gap-2 overflow-x-auto border-t border-slate-100 py-2 lg:hidden"
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
        <div className="mx-auto w-full max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
          {children}
        </div>
      </main>
    </div>
  );
}

function Brand({ compact = false }: { compact?: boolean }) {
  return (
    <Link className="flex min-w-0 items-center gap-3" href="/">
      <span className="grid h-10 w-10 shrink-0 place-items-center rounded-md bg-indigo-600 text-sm font-bold text-white">
        LH
      </span>
      {!compact ? (
        <span className="min-w-0">
          <span className="block truncate text-base font-semibold text-slate-950">
            LearningHub
          </span>
          <span className="block truncate text-xs font-medium text-slate-500">
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
