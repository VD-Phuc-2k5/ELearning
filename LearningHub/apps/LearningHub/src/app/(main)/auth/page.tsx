'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useMutation } from '@tanstack/react-query';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { loginSchema, type LoginInput } from '../../../lib/schemas';
import { loginAction } from '../../actions/auth.actions';
import { setAccessToken } from '../../../lib/api';
import { Button, Input } from '../../../components/ui';
import { useState } from 'react';
import { AlertCircle } from 'lucide-react';
import { jwtDecode } from 'jwt-decode';

export default function LoginPage() {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginInput>({
    resolver: zodResolver(loginSchema),
  });

  const loginMutation = useMutation({
    mutationFn: loginAction,
    onSuccess: (result) => {
      if (!result.success) {
        setError(result.error);
        return;
      }
      setAccessToken(result.accessToken);
      localStorage.setItem('refreshToken', result.refreshToken);
      try {
        const payload = jwtDecode<{ sub: string; email: string }>(
          result.accessToken,
        );
        localStorage.setItem(
          'user',
          JSON.stringify({
            id: payload.sub,
            email: payload.email,
            username: payload.email.split('@')[0],
          }),
        );
      } catch {
        /* empty */
      }
      router.push('/');
    },
    onError: () => {
      setError('Sign in failed. Please try again.');
    },
  });

  const onSubmit = (data: LoginInput) => {
    setError(null);
    loginMutation.mutate(data);
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-slate-50 to-indigo-50 px-4 py-12">
      <div className="w-full max-w-md space-y-8 rounded-3xl bg-white p-10 shadow-xl shadow-slate-200/60 border border-slate-100">
        <div className="text-center">
          <div className="inline-flex h-14 w-14 items-center justify-center rounded-2xl bg-indigo-600 text-white font-bold text-2xl shadow-lg shadow-indigo-200 mb-6">
            L
          </div>
          <h2 className="text-3xl font-bold tracking-tight text-slate-900">
            Welcome back
          </h2>
          <p className="mt-2 text-sm text-slate-500">
            Don&apos;t have an account?{' '}
            <Link
              href="/auth/register"
              className="font-semibold text-indigo-600 hover:text-indigo-500"
            >
              Sign up for free
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
            label="Email address"
            type="email"
            placeholder="you@example.com"
            autoComplete="email"
            error={errors.email?.message}
            {...register('email')}
          />
          <Input
            label="Password"
            type="password"
            placeholder="••••••••"
            autoComplete="current-password"
            error={errors.password?.message}
            {...register('password')}
          />

          <div className="flex items-center justify-between text-sm">
            <label className="flex items-center gap-2 cursor-pointer select-none">
              <input
                type="checkbox"
                className="h-4 w-4 rounded border-slate-300 text-indigo-600 focus:ring-indigo-600"
              />
              <span className="text-slate-600">Remember me</span>
            </label>
            <a
              href="#"
              className="font-medium text-indigo-600 hover:text-indigo-500"
            >
              Forgot password?
            </a>
          </div>

          <Button
            type="submit"
            className="w-full"
            isLoading={loginMutation.isPending}
          >
            Sign in
          </Button>
        </form>
      </div>
    </div>
  );
}
