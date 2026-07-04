import { Either, unwrap } from './constants/either';
import {
  Failure,
  AuthenticationFailure,
  NetworkFailure,
} from './errors/failures';

export interface TokenStore {
  getAccessToken(): Promise<string>;
  getRefreshToken(): Promise<string | undefined>;
  setTokens(accessToken: string, refreshToken: string): Promise<void>;
}

export async function withTokenRefresh<T>(
  tokenStore: TokenStore,
  refreshFn: (
    refreshToken: string,
  ) => Promise<{ accessToken: string; refreshToken: string }>,
  fn: (accessToken: string) => Promise<Either<Failure, T>>,
  onNetworkError?: (e: Error) => never,
): Promise<T> {
  const accessToken = await tokenStore.getAccessToken();
  const result = await fn(accessToken);

  if (result.type === 'left' && result.value instanceof AuthenticationFailure) {
    const refreshToken = await tokenStore.getRefreshToken();
    if (refreshToken) {
      try {
        const newTokens = await refreshFn(refreshToken);
        await tokenStore.setTokens(
          newTokens.accessToken,
          newTokens.refreshToken,
        );
        const retryResult = await fn(newTokens.accessToken);
        return unwrap(retryResult);
      } catch {
        // refresh failed — fall through to throw original auth error
      }
    }
  }

  if (result.type === 'left' && result.value instanceof NetworkFailure) {
    if (onNetworkError) {
      onNetworkError(new Error(result.value.message));
    }
  }

  return unwrap(result);
}
