import { NextRequest, NextResponse } from "next/server";

const SESSION_COOKIE = "projexa_session";
const PUBLIC_PATHS = ["/login", "/api/auth/login"];

export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  const isPublic =
    PUBLIC_PATHS.some((p) => pathname === p) ||
    pathname.startsWith("/_next") ||
    pathname.startsWith("/api/health") ||
    pathname.startsWith("/proposta/") ||
    pathname.startsWith("/contrato/") ||
    pathname.startsWith("/portal/") ||
    pathname.startsWith("/api/public/") ||
    pathname.startsWith("/api/webhooks/");
  const hasCookie = request.cookies.has(SESSION_COOKIE);

  if (!isPublic && !hasCookie) {
    const loginUrl = new URL("/login", request.url);
    return NextResponse.redirect(loginUrl);
  }

  if (pathname === "/login" && hasCookie) {
    const dashboardUrl = new URL("/dashboard", request.url);
    return NextResponse.redirect(dashboardUrl);
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"],
};
