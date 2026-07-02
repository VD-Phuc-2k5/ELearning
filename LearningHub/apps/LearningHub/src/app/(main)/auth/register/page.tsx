'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useMutation } from '@tanstack/react-query';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { registerSchema, type RegisterInput } from '../../../../lib/schemas';
import { registerAction } from '../../../actions/auth.actions';
import { Button, Input } from '../../../../components/ui';
import { useState } from 'react';
import { AlertCircle } from 'lucide-react';

export default function RegisterPage() {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<RegisterInput>({
    resolver: zodResolver(registerSchema),
  });

  const registerMutation = useMutation({
    mutationFn: registerAction,
    onSuccess: (result) => {
      if (!result.success) {
        setError(result.error);
        return;
      }
      router.push('/auth?registered=true');
    },
    onError: () => {
      setError('Registration failed. Please try again.');
    },
  });

  const onSubmit = (data: RegisterInput) => {
    setError(null);
    registerMutation.mutate(data);
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-slate-50 to-indigo-50 px-4 py-12">
      <div className="w-full max-w-md space-y-8 rounded-3xl bg-white p-10 shadow-xl shadow-slate-200/60 border border-slate-100">
        <div className="text-center">
          <div className="inline-flex h-14 w-14 items-center justify-center rounded-2xl bg-indigo-600 text-white font-bold text-2xl shadow-lg shadow-indigo-200 mb-6">
            L
          </div>
          <h2 className="text-3xl font-bold tracking-tight text-slate-900">
            Create your account
          </h2>
          <p className="mt-2 text-sm text-slate-500">
            Already have an account?{' '}
            <Link
              href="/auth"
              className="font-semibold text-indigo-600 hover:text-indigo-500"
            >
              Sign in
            </Link>
          </p>
        </div>

        {error && (
          <div className="flex items-start gap-3 rounded-2xl bg-red-50 border border-red-100 p-4 text-sm text-red-700">
            <AlertCircle className="h-4 w-4 shrink-0 mt-0.5" />
            {error}
          </div>
        )}

        <form className="space-y-5" onSubmit={handleSubmit(onSubmit)}>
          <Input
            label="Display name"
            type="text"
            placeholder="John Doe"
            error={errors.username?.message}
            {...register('username')}
          />
          <Input
            label="Email address"
            type="email"
            placeholder="you@example.com"
            error={errors.email?.message}
            {...register('email')}
          />
          <Input
            label="Password"
            type="password"
            placeholder="••••••••"
            helperText="Min. 8 characters with uppercase, lowercase, and special character"
            error={errors.password?.message}
            {...register('password')}
          />

          <Button
            type="submit"
            className="w-full"
            isLoading={registerMutation.isPending}
          >
            Create account
          </Button>

          <p className="text-center text-xs text-slate-400">
            By signing up, you agree to our{' '}
            <a href="#" className="underline hover:text-slate-600">
              Terms of Service
            </a>{' '}
            and{' '}
            <a href="#" className="underline hover:text-slate-600">
              Privacy Policy
            </a>
            .
          </p>
        </form>
      </div>
    </div>
  );
}
