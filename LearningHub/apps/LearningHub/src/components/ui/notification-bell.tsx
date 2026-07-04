'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { io } from 'socket.io-client';
import { useRouter } from 'next/navigation';
import { Bell, Check, Trash2 } from 'lucide-react';
import {
  listNotifications,
  markNotificationRead,
  markAllNotificationsRead,
  deleteReadNotifications,
  getUnreadNotificationCount,
} from '../../app/actions/notification.actions';
import type { NotificationItem } from '@learning-hub/domain';
import { cookie } from '@learning-hub/core';

function timeAgo(dateStr: string): string {
  const seconds = Math.floor((Date.now() - new Date(dateStr).getTime()) / 1000);
  if (seconds < 60) return 'just now';
  const mins = Math.floor(seconds / 60);
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  const days = Math.floor(hrs / 24);
  if (days < 7) return `${days}d ago`;
  return new Date(dateStr).toLocaleDateString();
}

function notificationText(n: NotificationItem): string {
  const name = n.actorName ?? 'Someone';
  if (n.type === 'mention') return `${name} mentioned you in a comment`;
  if (n.type === 'reply') return `${name} replied to your comment`;
  if (n.type === 'comment') return `${name} commented on your post`;
  if (n.type === 'report_resolved')
    return `Báo cáo của bạn đã được giải quyết${n.metadata?.note ? `: ${n.metadata.note}` : ''}`;
  if (n.type === 'report_dismissed')
    return `Báo cáo của bạn đã bị bỏ qua${n.metadata?.note ? `: ${n.metadata.note}` : ''}`;
  return `${name} sent a notification`;
}

export function NotificationBell() {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [count, setCount] = useState(0);
  const [items, setItems] = useState<NotificationItem[]>([]);
  const [loading, setLoading] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const socketRef = useRef<ReturnType<typeof io> | null>(null);

  const fetchCount = useCallback(async () => {
    const n = await getUnreadNotificationCount();
    setCount(n);
  }, []);

  const fetchItems = useCallback(async (openDropdown: boolean) => {
    if (!openDropdown) return;
    setLoading(true);
    try {
      const page = await listNotifications(undefined, 1, 20);
      setItems(page.data);
    } catch {
      /* ignore */
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchCount();
    fetchItems(open);
  }, [open, fetchCount, fetchItems]);

  useEffect(() => {
    const timer = setInterval(fetchCount, 30000);
    return () => clearInterval(timer);
  }, [fetchCount]);

  useEffect(() => {
    const connectSocket = async () => {
      const { io } = await import('socket.io-client');
      const socketUrl = (
        process.env.NEXT_PUBLIC_NEST_API_URL ?? 'http://localhost:8080'
      ).replace(/\/api\/?$/, '');
      const socket = io(`${socketUrl}/forum`, {
        auth: (cb: (data: { token: string }) => void) => {
          cb({ token: cookie.read('accessToken') ?? '' });
        },
        transports: ['websocket'],
      });
      socketRef.current = socket;
      socket.on('notification', () => {
        setCount((prev) => prev + 1);
      });
      socket.connect();
      return () => {
        socket.disconnect();
        socketRef.current = null;
      };
    };
    const cleanup = connectSocket();
    return () => {
      cleanup.then((fn) => fn?.());
    };
  }, []);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(e.target as Node)
      ) {
        setOpen(false);
      }
    };
    if (open) document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [open]);

  const handleClick = async (n: NotificationItem) => {
    if (!n.isRead) {
      const ok = await markNotificationRead(n.id);
      if (ok) {
        setCount((prev) => Math.max(0, prev - 1));
        setItems((prev) =>
          prev.map((item) =>
            item.id === n.id ? { ...item, isRead: true } : item,
          ),
        );
      }
    }
    setOpen(false);
    const slug = (n.metadata as Record<string, unknown> | null)?.forumSlug;
    if (slug) {
      router.push(`/forum/${slug}`);
    }
  };

  const handleMarkAll = async () => {
    const ok = await markAllNotificationsRead();
    if (ok) {
      setCount(0);
      setItems((prev) => prev.map((n) => ({ ...n, isRead: true })));
    }
  };

  const handleDeleteRead = async () => {
    try {
      await deleteReadNotifications();
      setItems((prev) => prev.filter((n) => !n.isRead));
    } catch {
      // API failed, keep current state
    }
  };

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={() => setOpen(!open)}
        className="relative p-2 text-slate-500 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors"
      >
        <Bell className="h-4 w-4" />
        {count > 0 && (
          <span className="absolute -top-0.5 -right-0.5 flex h-4 min-w-[1rem] items-center justify-center rounded-full bg-red-500 px-0.5 text-[9px] font-bold text-white">
            {count > 99 ? '99+' : count}
          </span>
        )}
      </button>

      {open && (
        <div className="absolute right-0 top-full mt-2 w-80 rounded-xl border border-slate-200 bg-white shadow-xl z-50 overflow-hidden">
          <div className="flex items-center justify-between px-4 py-3 border-b border-slate-100">
            <span className="text-sm font-semibold text-slate-800">
              Notifications
            </span>
            <div className="flex items-center gap-2">
              {items.some((n) => !n.isRead) && (
                <button
                  onClick={handleMarkAll}
                  className="inline-flex items-center gap-1 text-xs text-indigo-600 hover:text-indigo-700 font-medium"
                >
                  <Check className="h-3 w-3" />
                  Mark all read
                </button>
              )}
              {items.some((n) => n.isRead) && (
                <button
                  onClick={handleDeleteRead}
                  className="inline-flex items-center gap-1 text-xs text-slate-400 hover:text-red-500 font-medium"
                >
                  <Trash2 className="h-3 w-3" />
                  Clear read
                </button>
              )}
            </div>
          </div>
          <div className="max-h-[360px] overflow-y-auto">
            {loading && (
              <div className="px-4 py-8 text-center text-xs text-slate-400">
                Loading...
              </div>
            )}
            {!loading && items.length === 0 && (
              <div className="px-4 py-8 text-center text-xs text-slate-400">
                No notifications
              </div>
            )}
            {items.map((n) => (
              <button
                key={n.id}
                onClick={() => handleClick(n)}
                className={`w-full px-4 py-3 text-left transition hover:bg-slate-50 border-b border-slate-50 last:border-0 ${
                  !n.isRead ? 'bg-indigo-50/50' : ''
                }`}
              >
                <div className="flex items-start gap-3">
                  <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-indigo-100 text-[11px] font-semibold text-indigo-600">
                    {(n.actorName ?? '?').charAt(0).toUpperCase()}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs text-slate-700 leading-relaxed">
                      {notificationText(n)}
                    </p>
                    <p className="mt-0.5 text-[10px] text-slate-400">
                      {timeAgo(n.createdAt)}
                    </p>
                  </div>
                  {!n.isRead && (
                    <span className="mt-1.5 h-2 w-2 shrink-0 rounded-full bg-indigo-500" />
                  )}
                </div>
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
