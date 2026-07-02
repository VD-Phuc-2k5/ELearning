'use client';

import { Suspense, useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useMutation } from '@tanstack/react-query';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import {
  resetPasswordSchema,
  type ResetPasswordInput,
} from '../../../lib/schemas';
import {
  resetPasswordAction,
  verifyResetTokenAction,
} from '../../actions/auth.actions';
import { Button, Input } from '../../../components/ui';
import { AlertCircle, CheckCircle2, ArrowLeft } from 'lucide-react';

function ResetPasswordForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get('token') || '';
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<boolean>(false);
  const [isValidating, setIsValidating] = useState<boolean>(true);
  const [isValidToken, setIsValidToken] = useState<boolean>(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ResetPasswordInput>({
    resolver: zodResolver(resetPasswordSchema),
  });

  useEffect(() => {
    if (!token) {
      setIsValidating(false);
      return;
    }
    verifyResetTokenAction(token).then((res) => {
      if (!res.success) {
        setError(res.error);
      } else {
        setIsValidToken(true);
      }
      setIsValidating(false);
    });
  }, [token]);

  const mutation = useMutation({
    mutationFn: resetPasswordAction,
    onSuccess: (result) => {
      if (!result.success) {
        setError(result.error);
        return;
      }
      setSuccess(true);
      setTimeout(() => {
        router.push('/auth');
      }, 3000);
    },
    onError: () => {
      setError('An error occurred. Please try again.');
    },
  });

  const onSubmit = (data: ResetPasswordInput) => {
    setError(null);
    if (!token) {
      setError('Invalid or missing password reset token.');
      return;
    }
    mutation.mutate({
      token,
      newPassword: data.password,
    });
  };

  if (!token) {
    return (
      <div className="text-center space-y-4">
        <div className="flex items-start gap-3 rounded-2xl bg-red-50 border border-red-100 p-4 text-sm text-red-700">
          <AlertCircle className="h-4 w-4 shrink-0 mt-0.5" />
          Invalid or missing reset token. Please check your link or request a
          new reset request.
        </div>
        <Link
          href="/auth/forgot-password"
          className="inline-flex items-center justify-center gap-2 text-sm font-semibold text-indigo-600 hover:text-indigo-500"
        >
          <ArrowLeft className="h-4 w-4" />
          Request a new link
        </Link>
      </div>
    );
  }

  if (isValidating) {
    return (
      <div className="text-center py-4 text-slate-500 text-sm space-y-2">
        <div
          className="animate-spin inline-block w-6 h-6 border-[3px] border-current border-t-transparent text-indigo-600 rounded-full"
          role="status"
          aria-label="loading"
        >
          <span className="sr-only">Loading...</span>
        </div>
        <p>Verifying your reset link...</p>
      </div>
    );
  }

  if (!isValidToken) {
    return (
      <div className="text-center space-y-6">
        <div className="flex items-start gap-3 rounded-2xl bg-red-50 border border-red-100 p-4 text-sm text-red-700">
          <AlertCircle className="h-4 w-4 shrink-0 mt-0.5" />
          {error ||
            'This reset link is invalid, has expired, or has already been used.'}
        </div>
        <Link
          href="/auth/forgot-password"
          className="inline-flex items-center justify-center gap-2 text-sm font-semibold text-indigo-600 hover:text-indigo-500"
        >
          <ArrowLeft className="h-4 w-4" />
          Request a new link
        </Link>
      </div>
    );
  }

  return (
    <>
      {error && (
        <div className="flex items-start gap-3 rounded-2xl bg-red-50 border border-red-100 p-4 text-sm text-red-700">
          <AlertCircle className="h-4 w-4 shrink-0 mt-0.5" />
          {error}
        </div>
      )}

      {success ? (
        <div className="space-y-4 text-center">
          <div className="flex flex-col items-center gap-3 rounded-2xl bg-emerald-50 border border-emerald-100 p-6 text-sm text-emerald-800">
            <CheckCircle2 className="h-10 w-10 text-emerald-600 mb-2" />
            <p className="font-semibold text-base">
              Password reset successfully
            </p>
            <p className="text-emerald-700/80">
              Your password has been reset. Redirecting you to the login page in
              a few seconds...
            </p>
          </div>
          <Link
            href="/auth"
            className="inline-flex items-center justify-center gap-2 text-sm font-semibold text-indigo-600 hover:text-indigo-500"
          >
            <ArrowLeft className="h-4 w-4" />
            Go to sign in page
          </Link>
        </div>
      ) : (
        <form className="space-y-5" onSubmit={handleSubmit(onSubmit)}>
          <Input
            label="New Password"
            type="password"
            placeholder="••••••••"
            error={errors.password?.message}
            {...register('password')}
          />

          <Input
            label="Confirm Password"
            type="password"
            placeholder="••••••••"
            error={errors.confirmPassword?.message}
            {...register('confirmPassword')}
          />

          <Button
            type="submit"
            className="w-full"
            isLoading={mutation.isPending}
          >
            Reset Password
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
    </>
  );
}

export default function ResetPasswordPage() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-slate-50 to-indigo-50 px-4 py-12">
      <div className="w-full max-w-md space-y-8 rounded-3xl bg-white p-10 shadow-xl shadow-slate-200/60 border border-slate-100">
        <div className="text-center">
          <div className="inline-flex h-14 w-14 items-center justify-center rounded-2xl bg-indigo-600 text-white font-bold text-2xl shadow-lg shadow-indigo-200 mb-6">
            L
          </div>
          <h2 className="text-3xl font-bold tracking-tight text-slate-900">
            Reset Password
          </h2>
          <p className="mt-2 text-sm text-slate-500">
            Create a new password for your account.
          </p>
        </div>

        <Suspense
          fallback={
            <div className="text-center text-slate-500 text-sm">
              Loading reset form...
            </div>
          }
        >
          <ResetPasswordForm />
        </Suspense>
      </div>
    </div>
  );
}
