import type { ReactNode } from 'react';

type EmptyStateProps = {
  icon?: ReactNode;
  title: string;
  description?: string;
  action?: ReactNode;
  className?: string;
};

export function EmptyState({
  icon,
  title,
  description,
  action,
  className = '',
}: EmptyStateProps) {
  return (
    <div
      className={`rounded-2xl border-2 border-dashed border-slate-200 p-8 text-center ${className}`}
    >
      {icon && (
        <div className="mx-auto mb-3 flex h-10 w-10 items-center justify-center text-slate-300">
          {icon}
        </div>
      )}
      <p className="font-semibold text-slate-500">{title}</p>
      {description && (
        <p className="mt-1 text-sm text-slate-400">{description}</p>
      )}
      {action && <div className="mt-4">{action}</div>}
    </div>
  );
}
