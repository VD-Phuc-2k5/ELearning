import { forwardRef, type InputHTMLAttributes } from 'react';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export type InputProps = InputHTMLAttributes<HTMLInputElement> & {
  label?: string;
  helperText?: string;
  error?: string;
};

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ className, helperText, error, id, label, ...props }, ref) => {
    const inputId = id ?? props.name;

    return (
      <div className="w-full">
        <label
          className="block text-sm font-medium text-slate-700"
          htmlFor={inputId}
        >
          {label ? <span className="mb-2 block">{label}</span> : null}
          <input
            ref={ref}
            className={cn(
              'h-11 w-full rounded-md border border-slate-200 bg-white px-3 text-sm text-slate-950 shadow-sm outline-none transition',
              'placeholder:text-slate-400 focus:border-indigo-500 focus:ring-4 focus:ring-indigo-100',
              error && 'border-red-500 focus:border-red-500 focus:ring-red-100',
              className
            )}
            id={inputId}
            {...props}
          />
        </label>
        {error ? (
          <span className="mt-2 block text-xs font-medium text-red-500">
            {error}
          </span>
        ) : helperText ? (
          <span className="mt-2 block text-xs font-normal text-slate-500">
            {helperText}
          </span>
        ) : null}
      </div>
    );
  }
);

Input.displayName = 'Input';
