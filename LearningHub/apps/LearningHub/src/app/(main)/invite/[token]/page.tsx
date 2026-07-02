'use client';

import { useEffect, useRef, useState } from 'react';
import { use } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { CheckCircle, XCircle, Loader2 } from 'lucide-react';
import { acceptInvite } from '../../../actions/forum.actions';
import { Button } from '../../../../components/ui';

const processedTokens = new Set<string>();

interface InviteAcceptPageProps {
  params: Promise<{ token: string }>;
}

type State =
  | { status: 'loading' }
  | { status: 'success'; forumSlug: string; forumName: string }
  | { status: 'error'; message: string };

export default function InviteAcceptPage({ params }: InviteAcceptPageProps) {
  const { token } = use(params);
  const router = useRouter();
  const [state, setState] = useState<State>({ status: 'loading' });
  const mounted = useRef(true);

  useEffect(() => {
    mounted.current = true;
    if (processedTokens.has(token)) return;
    processedTokens.add(token);

    async function doAccept() {
      try {
        const result = await acceptInvite(token);
        if (!mounted.current) return;
        setState({
          status: 'success',
          forumSlug: result.forumSlug,
          forumName: result.forumSlug,
        });
      } catch (e) {
        if (!mounted.current) return;
        const msg = e instanceof Error ? e.message : 'Failed to accept invite';
        if (msg === 'Already a member') {
          setState({
            status: 'success',
            forumSlug: '',
            forumName: '',
          });
        } else {
          setState({ status: 'error', message: msg });
        }
      }
    }
    doAccept();

    return () => {
      mounted.current = false;
    };
  }, [token, router]);

  return (
    <div className="flex items-center justify-center min-h-[60vh]">
      <div className="rounded-2xl border border-slate-100 bg-white shadow-sm p-8 text-center max-w-md w-full">
        {state.status === 'loading' && (
          <div className="space-y-4">
            <Loader2 className="h-10 w-10 text-indigo-500 animate-spin mx-auto" />
            <p className="text-lg font-semibold text-slate-700">
              Accepting invite...
            </p>
            <p className="text-sm text-slate-400">
              Please wait while we process your invitation.
            </p>
          </div>
        )}

        {state.status === 'success' && (
          <div className="flex flex-col justify-center gap-2">
            <CheckCircle className="h-10 w-10 text-emerald-500 mx-auto" />
            {state.forumSlug ? (
              <>
                <p className="text-lg font-semibold text-slate-700">
                  Welcome to {state.forumName}!
                </p>
                <p className="mb-2 text-sm text-slate-400">
                  You have successfully joined this forum.
                </p>
                <Button
                  onClick={() => router.push(`/forum/${state.forumSlug}`)}
                >
                  Go to Forum
                </Button>
              </>
            ) : (
              <>
                <p className="text-lg font-semibold text-slate-700">
                  You are already a member
                </p>
                <p className="text-sm text-slate-400">
                  This invite has already been used or you are already in this
                  forum.
                </p>
                <Link href="/forum">
                  <Button>Go to Forums</Button>
                </Link>
              </>
            )}
          </div>
        )}

        {state.status === 'error' && (
          <div className="flex flex-col justify-center gap-2">
            <XCircle className="h-10 w-10 text-red-400 mx-auto" />
            <p className="text-lg font-semibold text-slate-700">Invite Error</p>
            <p className="text-sm text-red-500">{state.message}</p>
            <Link href="/forum">
              <Button variant="secondary">Go to Forums</Button>
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}
