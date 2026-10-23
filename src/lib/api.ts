import { cookies } from "next/headers";

import { config } from "@/config/env";
import { ACCESS_COOKIE } from "@/lib/auth-cookies";

export class ApiError extends Error {
  constructor(
    public status: number,
    message: string,
    public data?: unknown
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

  if (!res.ok) {
    let errorDetails = `Request failed: ${res.status}`;
    let errBody: unknown = null;
    try {
      errBody = await res.json();
      if (errBody && typeof errBody === "object") {
        const obj = errBody as Record<string, unknown>;
        if (typeof obj.message === "string") {
          errorDetails = obj.message;
        } else if (typeof obj.error === "string") {
          errorDetails = obj.error;
        }
      }
    } catch {
      // not JSON
    }
    console.error(`API Error [${res.status}] on ${path}:`, errBody || errorDetails);
    throw new ApiError(res.status, errorDetails, errBody);
  }

  if (res.status === 204) return undefined as T;
  return (await res.json()) as T;
}