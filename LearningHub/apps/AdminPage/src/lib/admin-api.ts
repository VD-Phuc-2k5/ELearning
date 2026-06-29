import type { ApiErrorShape } from '@learning-hub/core';

export const VALID_ACTIONS = ['create', 'get', 'update', 'delete'] as const;

export const inputCls =
  'w-full rounded-xl border border-slate-200 px-4 py-3 text-sm focus:border-indigo-500 focus:ring-4 focus:ring-indigo-100 outline-none';
export const btnPrimary =
  'flex-1 py-3 rounded-xl bg-indigo-600 text-white text-sm font-bold hover:bg-indigo-700 transition disabled:opacity-60';
export const btnSecondary =
  'flex-1 py-3 rounded-xl border border-slate-200 text-sm font-medium text-slate-600 hover:bg-slate-50';

export function getAxiosMessage(e: unknown, fallback: string): string {
  return (e as ApiErrorShape).response?.data?.message ?? fallback;
}
