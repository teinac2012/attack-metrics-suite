import { auth } from "@/lib/auth";
import { NextResponse } from "next/server";

export default auth((req) => {
  const isLoggedIn = !!req.auth;
  const licenseValid = isLoggedIn && (req.auth?.user as any)?.licenseValid !== false;
  const mustChange = !!req.auth?.user && (req.auth!.user as any).mustChangePassword === true;
  const protectedPaths = ['/dashboard', '/apps', '/admin', '/perfil'];
  const isProtected = protectedPaths.some(p => req.nextUrl.pathname.startsWith(p));
  const isPasswordPage = req.nextUrl.pathname.startsWith('/perfil');
  const isApi = req.nextUrl.pathname.startsWith('/api');
  
  // Si está logueado pero la licencia no es válida, redirigir al login
  if (isLoggedIn && !licenseValid && !isApi) {
    return NextResponse.redirect(new URL('/login', req.url));
  }
  
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
  matcher: ['/dashboard/:path*', '/apps/:path*', '/admin/:path*', '/perfil/:path*']
};
