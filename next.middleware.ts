import { auth } from "@/lib/auth";
import { NextResponse } from "next/server";

export default auth((req) => {
  const isLoggedIn = !!req.auth;
  const mustChange = !!req.auth?.user && (req.auth!.user as any).mustChangePassword === true;
  const protectedPaths = ['/dashboard', '/apps', '/admin'];
  const isProtected = protectedPaths.some(p => req.nextUrl.pathname.startsWith(p));
  const isPasswordPage = req.nextUrl.pathname.startsWith('/perfil');
  const isApi = req.nextUrl.pathname.startsWith('/api');
  
  if (isProtected && !isLoggedIn) {
    return NextResponse.redirect(new URL('/login', req.url));
  }
  // Si debe cambiar contraseña, redirigir a perfil para realizar el cambio
  if (isLoggedIn && mustChange && !isPasswordPage && !isApi) {
    const url = new URL('/perfil', req.url);
    url.searchParams.set('focus', 'security');
    return NextResponse.redirect(url);
  }
  
  return NextResponse.next();
});

export const config = {
  matcher: ['/dashboard/:path*', '/apps/:path*', '/admin/:path*']
};
