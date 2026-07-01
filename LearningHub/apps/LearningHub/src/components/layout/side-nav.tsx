'use client';

import { usePathname } from 'next/navigation';
import {
  LayoutDashboard,
  Users,
  BookOpen,
  Map,
  MessageSquare,
  LogOut,
} from 'lucide-react';
import type { User } from '@learning-hub/domain';
import { Brand } from './brand';
import { NavLink } from './nav-link';

const navigation = [
  { href: '/', label: 'Dashboard', Icon: LayoutDashboard },
  { href: '/community', label: 'Community', Icon: Users },
  { href: '/my-banks', label: 'Workshop', Icon: BookOpen },
  { href: '/roadmaps/manage', label: 'Roadmaps', Icon: Map },
  { href: '/forum', label: 'Forum', Icon: MessageSquare },
];

interface SideNavProps {
  user: User;
  onLogout: () => void;
}

export function SideNav({ user, onLogout }: SideNavProps) {
  const pathname = usePathname();

  return (
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
          onClick={onLogout}
          className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium text-slate-600 hover:bg-red-50 hover:text-red-600 transition"
        >
          <span className="grid h-8 w-8 shrink-0 place-items-center rounded-lg bg-slate-100 text-slate-500">
            <LogOut className="h-4 w-4" />
          </span>
          <span>Sign out</span>
        </button>
      </div>
    </aside>
  );
}
