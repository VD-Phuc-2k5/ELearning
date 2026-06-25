'use client';

import { useMemo, useState } from 'react';
import Link from 'next/link';
import { Button, Input } from '../../components/ui';

type AuthMode = 'login' | 'register';

const fieldHints = {
  login: {
    title: 'Welcome back',
    subtitle: 'Log in to continue learning with DevLearning Hub.',
    action: 'Log in',
    switchCopy: "Don't have an account?",
    switchAction: 'Create one',
  },
  register: {
    title: 'Create account',
    subtitle: 'Start building your developer learning path today.',
    action: 'Register',
    switchCopy: 'Already have an account?',
    switchAction: 'Log in',
  },
};

const learningStats = [
  { value: '12k+', label: 'learners' },
  { value: '320', label: 'lessons' },
  { value: '48', label: 'paths' },
];

export default function AuthPage() {
  const [mode, setMode] = useState<AuthMode>('login');
  const copy = fieldHints[mode];

  const tabClass = useMemo(
    () => (value: AuthMode) =>
      [
        'h-10 flex-1 rounded-md text-sm font-semibold transition',
        mode === value
          ? 'bg-slate-950 text-white shadow-sm'
          : 'text-slate-500 hover:bg-white hover:text-slate-950',
      ].join(' '),
    [mode]
  );

  return (
    <main className="min-h-screen bg-[#f7f9fc] text-slate-950">
      <div className="mx-auto grid min-h-screen w-full max-w-7xl gap-10 px-4 py-6 sm:px-6 lg:grid-cols-[minmax(0,1fr)_520px] lg:px-8">
        <section className="relative hidden min-h-[720px] overflow-hidden rounded-lg border border-slate-200 bg-white shadow-soft lg:block">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_24%_18%,rgba(79,70,229,0.18),transparent_30%),linear-gradient(145deg,#ffffff_0%,#edf4ff_54%,#eefdf7_100%)]" />
          <div className="relative flex h-full flex-col justify-between p-10">
            <Link className="flex w-fit items-center gap-3" href="/">
              <span className="grid h-11 w-11 place-items-center rounded-md bg-indigo-600 text-sm font-bold text-white">
                DH
              </span>
              <span>
                <span className="block text-lg font-semibold text-slate-950">
                  DevLearning Hub
                </span>
                <span className="block text-sm font-medium text-slate-500">
                  Developer learning workspace
                </span>
              </span>
            </Link>

            <div className="max-w-xl">
              <div className="mb-8 grid w-full max-w-lg gap-3 rounded-lg border border-white/80 bg-white/70 p-4 shadow-sm backdrop-blur">
                <div className="flex items-center justify-between gap-4 rounded-md bg-white p-4 shadow-sm">
                  <div>
                    <p className="text-sm font-semibold text-slate-950">
                      Frontend fundamentals
                    </p>
                    <p className="mt-1 text-xs font-medium text-slate-500">
                      8 lessons completed
                    </p>
                  </div>
                  <span className="rounded-md bg-emerald-50 px-2.5 py-1 text-xs font-bold text-emerald-700">
                    84%
                  </span>
                </div>
                <div className="grid grid-cols-3 gap-3">
                  {learningStats.map((stat) => (
                    <div
                      className="rounded-md border border-slate-100 bg-white p-3"
                      key={stat.label}
                    >
                      <p className="text-lg font-semibold text-slate-950">
                        {stat.value}
                      </p>
                      <p className="mt-1 text-xs font-medium text-slate-500">
                        {stat.label}
                      </p>
                    </div>
                  ))}
                </div>
              </div>

              <p className="text-sm font-semibold uppercase text-indigo-700">
                Skill-based learning
              </p>
              <h1 className="mt-4 max-w-2xl text-5xl font-semibold leading-tight tracking-normal text-slate-950">
                Learn, practice, and track your developer growth.
              </h1>
              <p className="mt-5 max-w-lg text-base leading-7 text-slate-600">
                Join guided paths, measure progress, and keep every coding
                milestone in one focused light workspace.
              </p>
            </div>
          </div>
        </section>

        <section className="flex min-h-[calc(100vh-48px)] items-center justify-center">
          <div className="w-full max-w-[448px]">
            <div className="mb-8 flex items-center justify-between gap-4 lg:hidden">
              <Link className="flex items-center gap-3" href="/">
                <span className="grid h-10 w-10 place-items-center rounded-md bg-indigo-600 text-sm font-bold text-white">
                  DH
                </span>
                <span className="text-base font-semibold text-slate-950">
                  DevLearning Hub
                </span>
              </Link>
            </div>

            <div className="rounded-lg border border-slate-200 bg-white p-6 shadow-soft sm:p-8">
              <div className="mb-8">
                <p className="text-sm font-semibold text-indigo-700">
                  {mode === 'login' ? 'Login' : 'Register'}
                </p>
                <h2 className="mt-2 text-3xl font-semibold tracking-normal text-slate-950">
                  {copy.title}
                </h2>
                <p className="mt-3 text-sm leading-6 text-slate-500">
                  {copy.subtitle}
                </p>
              </div>

              <div
                className="mb-6 flex rounded-lg bg-slate-100 p-1"
                role="tablist"
                aria-label="Authentication mode"
              >
                <button
                  aria-selected={mode === 'login'}
                  className={tabClass('login')}
                  onClick={() => setMode('login')}
                  role="tab"
                  type="button"
                >
                  Login
                </button>
                <button
                  aria-selected={mode === 'register'}
                  className={tabClass('register')}
                  onClick={() => setMode('register')}
                  role="tab"
                  type="button"
                >
                  Register
                </button>
              </div>

              <div className="grid gap-3 sm:grid-cols-2">
                <Button className="w-full" variant="secondary">
                  Google
                </Button>
                <Button className="w-full" variant="secondary">
                  GitHub
                </Button>
              </div>

              <div className="my-6 flex items-center gap-3">
                <span className="h-px flex-1 bg-slate-200" />
                <span className="text-xs font-semibold uppercase text-slate-400">
                  or continue with email
                </span>
                <span className="h-px flex-1 bg-slate-200" />
              </div>

              <form className="space-y-4">
                {mode === 'register' ? (
                  <Input
                    autoComplete="name"
                    label="Full name"
                    name="name"
                    placeholder="Nguyen Van A"
                  />
                ) : null}
                <Input
                  autoComplete="email"
                  label="Email"
                  name="email"
                  placeholder="you@example.com"
                  type="email"
                />
                <Input
                  autoComplete={
                    mode === 'login' ? 'current-password' : 'new-password'
                  }
                  label="Password"
                  name="password"
                  placeholder="Enter your password"
                  type="password"
                />
                {mode === 'register' ? (
                  <Input
                    autoComplete="new-password"
                    label="Confirm password"
                    name="confirmPassword"
                    placeholder="Confirm your password"
                    type="password"
                  />
                ) : null}

                <div className="flex flex-col gap-3 text-sm sm:flex-row sm:items-center sm:justify-between">
                  <label className="flex items-center gap-2 font-medium text-slate-600">
                    <input
                      className="h-4 w-4 rounded border-slate-300 text-indigo-600 focus:ring-indigo-500"
                      type="checkbox"
                    />
                    <span>
                      {mode === 'login' ? 'Remember me' : 'Agree to terms'}
                    </span>
                  </label>
                  {mode === 'login' ? (
                    <Link
                      className="font-semibold text-indigo-700 hover:text-indigo-800"
                      href="/auth"
                    >
                      Forgot password?
                    </Link>
                  ) : null}
                </div>

                <Button className="mt-2 w-full" type="submit">
                  {copy.action}
                </Button>
              </form>

              <p className="mt-6 text-center text-sm text-slate-500">
                {copy.switchCopy}{' '}
                <button
                  className="font-semibold text-indigo-700 hover:text-indigo-800"
                  onClick={() =>
                    setMode(mode === 'login' ? 'register' : 'login')
                  }
                  type="button"
                >
                  {copy.switchAction}
                </button>
              </p>
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}
