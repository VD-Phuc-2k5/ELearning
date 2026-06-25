import type { InputHTMLAttributes } from 'react';

export type InputProps = InputHTMLAttributes<HTMLInputElement> & {
  label?: string;
  helperText?: string;
};

export function Input({
  className = '',
  helperText,
  id,
  label,
  ...props
}: InputProps) {
  const inputId = id ?? props.name;

  return (
    <label className="block text-sm font-medium text-slate-700" htmlFor={inputId}>
      {label ? <span className="mb-2 block">{label}</span> : null}
      <input
        className={[
          'h-11 w-full rounded-md border border-slate-200 bg-white px-3 text-sm text-slate-950 shadow-sm outline-none transition',
          'placeholder:text-slate-400 focus:border-indigo-500 focus:ring-4 focus:ring-indigo-100',
          className,
        ].join(' ')}
        id={inputId}
        {...props}
      />
      {helperText ? (
        <span className="mt-2 block text-xs font-normal text-slate-500">
          {helperText}
        </span>
      ) : null}
    </label>
  );
}
