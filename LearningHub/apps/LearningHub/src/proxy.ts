import { NextRequest, NextResponse } from 'next/server';

export async function proxy(request: NextRequest) {
  const { pathname, searchParams } = request.nextUrl;

  const token = searchParams.get('token');
  if (token) {
    const cleanUrl = new URL(request.url);
    cleanUrl.searchParams.delete('token');
    const response = NextResponse.redirect(cleanUrl);
    response.cookies.set('accessToken', token, {
      maxAge: 900,
      path: '/',
      sameSite: 'lax',
    });
    return response;
  }

  if (pathname.startsWith('/api/auth/refresh')) return NextResponse.next();

  // If accessToken cookie is present, nothing to do
  if (request.cookies.get('accessToken')) return NextResponse.next();

  // Try to silently refresh using the httpOnly refreshToken cookie
  const refreshToken = request.cookies.get('refreshToken');
  if (!refreshToken) return NextResponse.next();

  try {
    const res = await fetch(new URL('/api/auth/refresh', request.url), {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ refreshToken: refreshToken.value }),
    });

    if (!res.ok) return NextResponse.next();

    const data = await res.json();
    const response = NextResponse.next();
    response.cookies.set('accessToken', data.accessToken, {
      maxAge: 900,
      path: '/',
      sameSite: 'lax',
    });
    response.cookies.set('refreshToken', data.refreshToken, {
      maxAge: 7 * 24 * 60 * 60,
      path: '/',
      sameSite: 'lax',
      httpOnly: true,
    });
    return response;
  } catch {
    return NextResponse.next();
  }
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon\\.ico).*)'],
};
