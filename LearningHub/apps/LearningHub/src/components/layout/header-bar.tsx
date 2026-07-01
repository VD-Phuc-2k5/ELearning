'use client';

import Link from 'next/link';
import { LogOut, Plus, HelpCircle } from 'lucide-react';
import { Button } from '../ui';
import { Brand } from './brand';

interface HeaderBarProps {
  onLogout: () => void;
}

export function HeaderBar({ onLogout }: HeaderBarProps) {
  return (
    <>
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
          <button
            onClick={onLogout}
            className="p-2 text-slate-400 hover:text-red-600 transition-colors rounded-lg hover:bg-red-50 lg:hidden"
            aria-label="Sign out"
          >
            <LogOut className="h-4 w-4" />
          </button>
        </div>
      </div>
    </>
  );
}
