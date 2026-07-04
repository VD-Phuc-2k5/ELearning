'use client';

import { useQuery } from '@tanstack/react-query';
import { getCurrentUser } from '../../app/actions/auth.actions';

export function useCurrentUser() {
  const {
    data: user = null,
    isLoading,
    isFetching,
  } = useQuery({
    queryKey: ['current-user'],
    queryFn: () => getCurrentUser(),
  });

  return { user, isLoading, isFetching };
}
