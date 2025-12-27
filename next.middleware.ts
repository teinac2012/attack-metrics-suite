import { auth } from "@/lib/auth";
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export default auth(async (req) => {
  const isLoggedIn = !!req.auth;
  const mustChange = !!req.auth?.user && (req.auth!.user as any).mustChangePassword === true;
  const protectedPaths = ['/dashboard', '/apps', '/admin', '/perfil'];
  const isProtected = protectedPaths.some(p => req.nextUrl.pathname.startsWith(p));
  const isPasswordPage = req.nextUrl.pathname.startsWith('/perfil');
  const isApi = req.nextUrl.pathname.startsWith('/api');
  
  // Si está logueado, validar que la licencia siga activa
  if (isLoggedIn && !isApi) {
    try {
      const userId = (req.auth!.user as any).id;
      const user = await prisma.user.findUnique({
        where: { id: userId },
        include: { licenses: { where: { isActive: true, endDate: { gt: new Date() } }, take: 1 } }
      });

      // Si no tiene licencia válida, redirigir al login con cookie de sesión limpia
      if (!user || user.licenses.length === 0) {
        return NextResponse.redirect(new URL('/login', req.url));
      }
    } catch (error) {
      console.error("[MIDDLEWARE] Error checking license:", error);
      // En caso de error, permitir acceso para no bloquear
    }
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
