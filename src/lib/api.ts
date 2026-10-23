import { cookies } from "next/headers";

import { config } from "@/config/env";
import { ACCESS_COOKIE } from "@/lib/auth-cookies";

export class ApiError extends Error {
  constructor(
    public status: number,
    message: string
  ) {
    super(message);
  }
}

export async function apiFetch<T>(path: string, init: RequestInit = {}): Promise<T> {
  const token = (await cookies()).get(ACCESS_COOKIE)?.value;

  const res = await fetch(`${config.apiBaseUrl}${path}`, {
    ...init,
    headers: {
      "Content-Type": "application/json",
      accept: "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...init.headers,
    },
    cache: "no-store",
  });
  console.log("LOGIN API →", `${config.apiBaseUrl}/auth/login`, res.status);

  if (!res.ok) throw new ApiError(res.status, `Request failed: ${res.status}`);

  if (res.status === 204) return undefined as T;
  return (await res.json()) as T;
}