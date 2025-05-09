import { NextResponse } from 'next/server';
export function middleware(request) {
  const response = NextResponse.next();
  if (request.nextUrl.pathname === '/') {
    return NextResponse.redirect(new URL('/auth/sign-in', request.url));
  }
  return response;
}

// See "Matching Paths" below to learn more
export const config = {
  matcher: '/'
};
export { default } from 'next-auth/middleware';