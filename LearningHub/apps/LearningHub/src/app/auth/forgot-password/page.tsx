'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useMutation } from '@tanstack/react-query';
import Link from 'next/link';
import {
  forgotPasswordSchema,
  type ForgotPasswordInput,
} from '../../../lib/schemas';
import { forgotPasswordAction } from '../../actions/auth.actions';
import { Button, Input } from '../../../components/ui';
import { useState } from 'react';
import { AlertCircle, CheckCircle2, ArrowLeft } from 'lucide-react';

export default function ForgotPasswordPage() {
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<boolean>(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ForgotPasswordInput>({
    resolver: zodResolver(forgotPasswordSchema),
  });

  const mutation = useMutation({
    mutationFn: forgotPasswordAction,
    onSuccess: (result) => {
      if (!result.success) {
        setError(result.error);
        return;
      }
      setSuccess(true);
    },
    onError: () => {
      setError('An error occurred. Please try again.');
    },
  });

  const onSubmit = (data: ForgotPasswordInput) => {
    setError(null);
    mutation.mutate(data.email);
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-slate-50 to-indigo-50 px-4 py-12">
      <div className="w-full max-w-md space-y-8 rounded-3xl bg-white p-10 shadow-xl shadow-slate-200/60 border border-slate-100">
        <div className="text-center">
          <div className="inline-flex h-14 w-14 items-center justify-center rounded-2xl bg-indigo-600 text-white font-bold text-2xl shadow-lg shadow-indigo-200 mb-6">
            L
          </div>
          <h2 className="text-3xl font-bold tracking-tight text-slate-900">
            Forgot password
          </h2>
          <p className="mt-2 text-sm text-slate-500">
            Enter your email address and we will send you a reset link.
          </p>
        </div>

        {error && (
          <div className="flex items-start gap-3 rounded-2xl bg-red-50 border border-red-100 p-4 text-sm text-red-700">
            <AlertCircle className="h-4 w-4 shrink-0 mt-0.5" />
            {error}
          </div>
        )}

        {success ? (
          <div className="space-y-6 text-center">
            <div className="flex flex-col items-center gap-3 rounded-2xl bg-emerald-50 border border-emerald-100 p-6 text-sm text-emerald-800">
              <CheckCircle2 className="h-10 w-10 text-emerald-600 mb-2" />
              <p className="font-semibold text-base">Check your email</p>
              <p className="text-emerald-700/80">
                If the email address exists, we have sent a link to reset your
                password. Please check your inbox and spam folders.
              </p>
            </div>
            <Link
              href="/auth"
              className="inline-flex items-center justify-center gap-2 text-sm font-semibold text-indigo-600 hover:text-indigo-500"
            >
              <ArrowLeft className="h-4 w-4" />
              Back to sign in
            </Link>
          </div>
        ) : (
          <form className="space-y-5" onSubmit={handleSubmit(onSubmit)}>
            <Input
              label="Email address"
              type="email"
              placeholder="you@example.com"
              autoComplete="email"
              error={errors.email?.message}
              {...register('email')}
            />

            <Button
              type="submit"
              className="w-full"
              isLoading={mutation.isPending}
            >
              Send reset link
            </Button>

            <div className="text-center mt-4">
              <Link
                href="/auth"
                className="inline-flex items-center justify-center gap-2 text-sm font-semibold text-indigo-600 hover:text-indigo-500"
              >
                <ArrowLeft className="h-4 w-4" />
                Back to sign in
              </Link>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
