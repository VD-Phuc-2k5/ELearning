type LoadingProps = {
  label?: string;
};

export function Loading({ label = 'Loading' }: LoadingProps) {
  return (
    <div
      aria-live="polite"
      className="inline-flex items-center gap-3 rounded-md border border-slate-200 bg-white px-4 py-3 text-sm font-medium text-slate-600 shadow-sm"
      role="status"
    >
      <span className="h-4 w-4 animate-spin rounded-full border-2 border-indigo-600 border-r-transparent" />
      <span>{label}</span>
    </div>
  );
}
