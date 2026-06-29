import { forwardRef, useState, type InputHTMLAttributes } from 'react';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';
import { Eye, EyeOff } from 'lucide-react';

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export type InputProps = InputHTMLAttributes<HTMLInputElement> & {
  label?: string;
  helperText?: string;
  error?: string;
};

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ className, helperText, error, id, label, type, ...props }, ref) => {
    const inputId = id ?? props.name;
    const [showPassword, setShowPassword] = useState(false);
    const isPassword = type === 'password';
    const resolvedType = isPassword ? (showPassword ? 'text' : 'password') : type;

    return (
      <div className="w-full">
        <label
          className="block text-sm font-medium text-slate-700"
          htmlFor={inputId}
        >
          {label ? <span className="mb-2 block">{label}</span> : null}
          <div className="relative">
            <input
              ref={ref}
              type={resolvedType}
              className={cn(
                'h-11 w-full rounded-md border border-slate-200 bg-white px-3 text-sm text-slate-950 shadow-sm outline-none transition',
                'placeholder:text-slate-400 focus:border-indigo-500 focus:ring-4 focus:ring-indigo-100',
                error && 'border-red-500 focus:border-red-500 focus:ring-red-100',
                isPassword && 'pr-10',
                className
              )}
              id={inputId}
              {...props}
            />
            {isPassword && (
              <button
                type="button"
                onClick={() => setShowPassword((v) => !v)}
                className="absolute inset-y-0 right-3 flex items-center text-slate-400 hover:text-slate-600"
                tabIndex={-1}
                aria-label={showPassword ? 'Hide password' : 'Show password'}
              >
                {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            )}
          </div>
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
