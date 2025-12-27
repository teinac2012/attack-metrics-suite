import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function middleware(req: NextRequest) {
  const cookie = req.cookies.get('authjs.session-token') || req.cookies.get('next-auth.session-token');
  const protectedPaths = ['/dashboard', '/apps', '/admin'];
  const isProtected = protectedPaths.some(p => req.nextUrl.pathname.startsWith(p));
  if (isProtected && !cookie) return NextResponse.redirect(new URL('/login', req.url));
  return NextResponse.next();
}
export const config = { matcher: ['/dashboard/:path*', '/apps/:path*', '/admin/:path*'] };
