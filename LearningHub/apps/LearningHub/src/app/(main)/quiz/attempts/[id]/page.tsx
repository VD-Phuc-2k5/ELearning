'use client';

import { useParams, useRouter } from 'next/navigation';
import { ReviewScreen } from '../../[bankId]/components/review-screen';

export default function AttemptReviewPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  return (
    <ReviewScreen attemptId={id} onBack={() => router.push('/quiz/history')} />
  );
}
