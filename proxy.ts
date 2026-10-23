import { NextResponse, type NextRequest } from "next/server";

import { refreshTokens } from "@/lib/auth-api";
import {
  ACCESS_COOKIE,
  ALL_AUTH_COOKIES,
  REFRESH_COOKIE,
  buildAuthCookies,
  type TokenResponse,
} from "@/lib/auth-cookies";

export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const isApi = pathname.startsWith("/api/");
  const isLoginPage = pathname === "/login";

  if (pathname.startsWith("/api/auth/")) return NextResponse.next();

  let accessToken = request.cookies.get(ACCESS_COOKIE)?.value;
  const refreshToken = request.cookies.get(REFRESH_COOKIE)?.value;
  let fresh: TokenResponse | null = null;
  let sessionExpired = false;

  if (!accessToken && refreshToken) {
    fresh = await refreshTokens(refreshToken);
    if (fresh) {
      accessToken = fresh.accessToken;
      request.cookies.set(ACCESS_COOKIE, fresh.accessToken);
      request.cookies.set(REFRESH_COOKIE, fresh.refreshToken);
    } else {
      sessionExpired = true; 
    }
  }

  const isLoggedIn = Boolean(accessToken);
  let response: NextResponse;

  if (!isLoggedIn) {
    if (isLoginPage) response = NextResponse.next();
    else if (isApi) response = NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    else response = NextResponse.redirect(new URL("/login", request.url));
  } else if (isLoginPage || pathname === "/") {
    response = NextResponse.redirect(new URL("/dashboard", request.url));
  } else {
    response = NextResponse.next({ request });
  }

  if (fresh) {
    for (const c of buildAuthCookies(fresh)) response.cookies.set(c.name, c.value, c.options);
  }
  if (sessionExpired) {
    for (const name of ALL_AUTH_COOKIES) response.cookies.delete(name);
  }

  return response;
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|.*\\..*).*)"],
};