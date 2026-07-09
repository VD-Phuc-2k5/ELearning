export const VALID_ACTIONS = ['create', 'get', 'update', 'delete'] as const;

export const inputCls =
  'w-full rounded-xl border border-slate-200 px-4 py-3 text-sm focus:border-indigo-500 focus:ring-4 focus:ring-indigo-100 outline-none';
export const btnPrimary =
  'flex-1 py-3 rounded-xl bg-indigo-600 text-white text-sm font-bold hover:bg-indigo-700 transition disabled:opacity-60';
export const btnSecondary =
  'flex-1 py-3 rounded-xl border border-slate-200 text-sm font-medium text-slate-600 hover:bg-slate-50';

interface ApiError {
  response?: {
    data?: {
      message?: string | string[];
      errors?: { field: string; message: string }[];
    };
  };
}
export function getAxiosMessage(e: unknown, fallback: string): string {
  const axiosErr = e as ApiError;
  const data = axiosErr.response?.data;
  if (data?.errors && Array.isArray(data.errors)) {
    return data.errors.map((err) => `${err.field}: ${err.message}`).join(', ');
  }
  const message = data?.message;
  if (Array.isArray(message)) {
    return message.join(', ');
  }
  if (message) return message;
  const plainMessage = (e as Error).message;
  return plainMessage && plainMessage !== fallback ? plainMessage : fallback;
}
