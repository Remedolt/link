import { NextResponse } from "next/server";
import { auth } from "@/auth";

// Protects /dashboard/** — redirects unauthenticated visitors to /signin
// with a callback back to where they were headed.
// Note: Next.js 16 renamed the `middleware.ts` convention to `proxy.ts`
// (same behavior, new file/export name).
export default auth((req) => {
  const isLoggedIn = !!req.auth;
  const isDashboard = req.nextUrl.pathname.startsWith("/dashboard");

  if (isDashboard && !isLoggedIn) {
    const signInUrl = new URL("/signin", req.nextUrl.origin);
    signInUrl.searchParams.set("callbackUrl", req.nextUrl.pathname);
    return NextResponse.redirect(signInUrl);
  }

  return NextResponse.next();
});

export const config = {
  matcher: ["/dashboard/:path*"],
};
