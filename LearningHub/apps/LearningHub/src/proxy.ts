import { NextRequest, NextResponse } from 'next/server';

export async function proxy(request: NextRequest) {
  const { searchParams } = request.nextUrl;

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

  return NextResponse.next();
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon\\.ico).*)'],
};
