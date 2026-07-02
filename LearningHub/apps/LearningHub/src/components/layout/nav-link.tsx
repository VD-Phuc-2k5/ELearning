'use client';

import Link from 'next/link';
import type { ElementType } from 'react';

interface NavLinkProps {
  href: string;
  Icon: ElementType;
  isActive: boolean;
  label: string;
}

export function NavLink({ href, Icon, isActive, label }: NavLinkProps) {
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
