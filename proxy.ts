import { NextRequest, NextResponse } from "next/server";
import { ADMIN_SESSION_COOKIE, isValidSessionCookieValue } from "@/lib/admin-auth";
import { getHostIdFromSessionCookieValue, HOST_SESSION_COOKIE } from "@/lib/host-auth";

// Proxy (formerly "middleware") always runs on the Node.js runtime in this
// Next.js version — session verification uses node:crypto (scrypt/HMAC),
// which the old Edge middleware runtime didn't support.
export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  if (pathname.startsWith("/admin")) {
    if (pathname === "/admin/login") {
      return NextResponse.next();
    }
    const cookie = request.cookies.get(ADMIN_SESSION_COOKIE)?.value;
    if (!isValidSessionCookieValue(cookie)) {
      const loginUrl = new URL("/admin/login", request.url);
      loginUrl.searchParams.set("next", pathname);
      return NextResponse.redirect(loginUrl);
    }
    return NextResponse.next();
  }

  if (pathname.startsWith("/host")) {
    if (pathname === "/host/login" || pathname === "/host/apply") {
      return NextResponse.next();
    }
    const cookie = request.cookies.get(HOST_SESSION_COOKIE)?.value;
    if (!getHostIdFromSessionCookieValue(cookie)) {
      return NextResponse.redirect(new URL("/host/login", request.url));
    }
    return NextResponse.next();
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/admin/:path*", "/host/:path*"],
};
