'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

const navigation = [
  { href: '/', label: 'Dashboard' },
  { href: '/community', label: 'Community' },
  { href: '/my-banks', label: 'Workshop' },
  { href: '/roadmaps/manage', label: 'Roadmaps' },
  { href: '/forum', label: 'Forum' },
  { href: '/playground', label: 'Playground' },
  { href: '/problems', label: 'Coding Problems' },
];

export function MobileNav() {
  const pathname = usePathname();

  return (
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
  );
}
