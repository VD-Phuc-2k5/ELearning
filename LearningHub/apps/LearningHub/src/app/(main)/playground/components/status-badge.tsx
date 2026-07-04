export const getStatusColor = (status: string) => {
  switch (status) {
    case 'success':
      return 'bg-emerald-500/10 text-emerald-600 border border-emerald-500/20';
    case 'timeout':
      return 'bg-amber-500/10 text-amber-600 border border-amber-500/20';
    case 'memory_limit':
      return 'bg-rose-500/10 text-rose-600 border border-rose-500/20';
    case 'error':
    default:
      return 'bg-red-500/10 text-red-600 border border-red-500/20';
  }
};

export const getStatusLabel = (status: string) => {
  switch (status) {
    case 'success':
      return 'SUCCESS';
    case 'timeout':
      return 'TIMEOUT';
    case 'memory_limit':
      return 'OOM KILLED';
    case 'error':
    default:
      return 'RUNTIME ERROR';
  }
};

interface StatusBadgeProps {
  status: string;
}

export function StatusBadge({ status }: StatusBadgeProps) {
  return (
    <span
      className={`text-xs px-2.5 py-1 rounded-full font-bold uppercase tracking-wider ${getStatusColor(
        status,
      )}`}
    >
      {getStatusLabel(status)}
    </span>
  );
}
