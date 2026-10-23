import { config } from "@/config/env";
import type { TokenResponse } from "./auth-cookies";

// The refresh token is single-use (the API returns a new one each time).
// If several requests refresh at once, they share one call instead of
// racing each other and invalidating the session.
const inflight = new Map<string, Promise<TokenResponse | null>>();

async function callRefresh(refreshToken: string): Promise<TokenResponse | null> {
  try {
    const res = await fetch(`${config.apiBaseUrl}/auth/refresh`, {
      method: "POST",
      headers: { "Content-Type": "application/json", accept: "application/json" },
      body: JSON.stringify({ refreshToken }),
      cache: "no-store",
    });
    if (!res.ok) return null;
    return (await res.json()) as TokenResponse;
  } catch {
    return null;
  }
}

export function refreshTokens(refreshToken: string) {
  const existing = inflight.get(refreshToken);
  if (existing) return existing;

  const promise = callRefresh(refreshToken);
  inflight.set(refreshToken, promise);
  setTimeout(() => inflight.delete(refreshToken), 10_000); 
  return promise;
}