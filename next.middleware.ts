import { auth } from "@/lib/auth";
import { NextResponse } from "next/server";

export default auth((req) => {
  const isLoggedIn = !!req.auth;
  const protectedPaths = ['/dashboard', '/apps', '/admin'];
  const isProtected = protectedPaths.some(p => req.nextUrl.pathname.startsWith(p));
  
  if (isProtected && !isLoggedIn) {
    return NextResponse.redirect(new URL('/login', req.url));
  }
  
  return NextResponse.next();
});

export const config = {
  matcher: ['/dashboard/:path*', '/apps/:path*', '/admin/:path*']
};
