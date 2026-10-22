import { NextResponse, type NextRequest } from "next/server";

const PUBLIC_PATHS = ["/login"];

export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const isLoggedIn = Boolean(request.cookies.get("auth_token")?.value);
  const isPublic = PUBLIC_PATHS.some(
    (p) => pathname === p || pathname.startsWith(`${p}/`)
  );

  const go = (path: string) => NextResponse.redirect(new URL(path, request.url));

  if (pathname === "/") return go(isLoggedIn ? "/dashboard" : "/login");
  if (!isLoggedIn && !isPublic) return go("/login");
  if (isLoggedIn && isPublic) return go("/dashboard");

  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!api|_next/static|_next/image|.*\\..*).*)"],
};