'use client';

import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Search, Lock, Unlock } from 'lucide-react';
import type { User } from '@learning-hub/domain';
import { searchUsers, toggleUserLock } from '../../app/actions/admin.actions';
import { getAxiosMessage } from '../../lib/admin-api';

export function UserAdminTab() {
  const qc = useQueryClient();
  const [input, setInput] = useState('');
  const [email, setEmail] = useState('');
  const [err, setErr] = useState('');

  const { data: users = [], isFetching } = useQuery<User[]>({
    queryKey: ['admin-search-users', email],
    queryFn: () => searchUsers(email),
  });

  const toggleMut = useMutation({
    mutationFn: ({ id, isActive }: { id: string; isActive: boolean }) =>
      toggleUserLock(id, isActive),
    onSuccess: () =>
      qc.invalidateQueries({ queryKey: ['admin-search-users', email] }),
    onError: (e: unknown) =>
      setErr(getAxiosMessage(e, 'Khóa/mở khóa thất bại')),
  });

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap gap-3">
        <div className="relative flex-1 min-w-[280px] max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                e.preventDefault();
                setEmail(input.trim());
              }
            }}
            placeholder="Tìm người dùng theo email..."
            className="w-full h-11 pl-9 pr-3 rounded-xl border border-slate-200 text-sm bg-white focus:border-indigo-500 focus:ring-4 focus:ring-indigo-100 outline-none"
          />
        </div>
        <button
          onClick={() => setEmail(input.trim())}
          disabled={isFetching}
          className="px-5 h-11 rounded-xl bg-indigo-600 text-white text-sm font-bold hover:bg-indigo-700 transition disabled:opacity-60"
        >
          {isFetching ? 'Đang tìm...' : 'Tìm kiếm'}
        </button>
        {email && (
          <button
            onClick={() => {
              setInput('');
              setEmail('');
            }}
            className="px-4 h-11 rounded-xl border border-slate-200 text-sm text-slate-600 hover:bg-slate-50"
          >
            Xóa lọc
          </button>
        )}
      </div>

      {err && (
        <div className="flex items-start justify-between rounded-xl bg-red-50 border border-red-100 px-4 py-3">
          <p className="text-sm text-red-700">{err}</p>
          <button
            onClick={() => setErr('')}
            className="text-red-500 hover:text-red-700 text-sm"
          >
            ✕
          </button>
        </div>
      )}

      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        <table className="w-full text-left">
          <thead className="bg-slate-50 border-b border-slate-200">
            <tr>
              <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-widest">
                Người dùng
              </th>
              <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-widest">
                Trạng thái
              </th>
              <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-widest text-right">
                Hành động
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {users.map((u: User) => {
              const locked = !u.isActive;
              return (
                <tr key={u.id} className="hover:bg-slate-50 transition">
                  <td className="px-6 py-4">
                    <div className="font-bold text-slate-900">
                      {u.username || '—'}
                    </div>
                    <div className="text-xs text-slate-500">{u.email}</div>
                  </td>
                  <td className="px-6 py-4">
                    <span
                      className={`inline-flex items-center gap-1.5 text-xs font-bold px-2.5 py-1 rounded-full ${locked ? 'bg-red-100 text-red-700' : 'bg-emerald-100 text-emerald-700'}`}
                    >
                      <span
                        className={`h-1.5 w-1.5 rounded-full ${locked ? 'bg-red-500' : 'bg-emerald-500'}`}
                      />
                      {locked ? 'Đã khóa' : 'Đang hoạt động'}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <button
                      onClick={() =>
                        toggleMut.mutate({
                          id: u.id,
                          isActive: u.isActive ? false : true,
                        })
                      }
                      disabled={
                        toggleMut.isPending && toggleMut.variables?.id === u.id
                      }
                      className={`inline-flex items-center gap-1.5 px-3 h-9 rounded-lg text-sm font-medium transition disabled:opacity-50 ${locked ? 'bg-emerald-600 text-white hover:bg-emerald-700' : 'bg-red-600 text-white hover:bg-red-700'}`}
                    >
                      {locked ? (
                        <>
                          <Unlock className="h-4 w-4" /> Mở khóa
                        </>
                      ) : (
                        <>
                          <Lock className="h-4 w-4" /> Khóa
                        </>
                      )}
                    </button>
                  </td>
                </tr>
              );
            })}
            {!isFetching && users.length === 0 && (
              <tr>
                <td
                  colSpan={3}
                  className="px-6 py-12 text-center text-slate-400 text-sm"
                >
                  {email
                    ? 'Không tìm thấy người dùng phù hợp.'
                    : 'Nhập email để tìm người dùng vi phạm.'}
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
