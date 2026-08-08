import { withAuth } from "next-auth/middleware";

import { NextResponse } from "next/server";

export default withAuth(
  function middleware(req) {
    const token = req.nextauth.token;
    const isAuth = !!token;
    const isAuthPage = req.nextUrl.pathname.startsWith('/login') || req.nextUrl.pathname.startsWith('/register');
    const isOnboarding = req.nextUrl.pathname === '/onboarding';

    if (isAuthPage) {
      if (isAuth) {
        return NextResponse.redirect(new URL('/home', req.url));
      }
      return null;
    }

    if (!isAuth) {
      let from = req.nextUrl.pathname;
      if (req.nextUrl.search) {
        from += req.nextUrl.search;
      }
      return NextResponse.redirect(new URL(`/login?from=${encodeURIComponent(from)}`, req.url));
    }

    if (token?.role === "pending" && !isOnboarding) {
      return NextResponse.redirect(new URL('/onboarding', req.url));
    }

    if (token?.role !== "pending" && isOnboarding) {
      return NextResponse.redirect(new URL('/home', req.url));
    }

    return null;
  },
  {
    callbacks: {
      authorized: () => true, // Let the middleware function handle all logic
    },
  }
);

export const config = {
  matcher: [
    "/home",
    "/marketplace",
    "/profile",
    "/settingtab",
    "/about-us",
    "/collaborators",
    "/recyclers",
    "/pickups",
  ],
};
