import { cookies } from 'next/headers';

export function createTokenStore() {
  return {
    async getAccessToken() {
      return (await cookies()).get('accessToken')?.value ?? '';
    },
    async getRefreshToken() {
      return (await cookies()).get('refreshToken')?.value;
    },
    async setTokens(accessToken: string, refreshToken: string) {
      const jar = await cookies();
      jar.set('accessToken', accessToken, {
        maxAge: 900,
        path: '/',
        sameSite: 'lax',
      });
      jar.set('refreshToken', refreshToken, {
        maxAge: 7 * 24 * 60 * 60,
        path: '/',
        sameSite: 'lax',
        httpOnly: true,
      });
    },
  };
}
