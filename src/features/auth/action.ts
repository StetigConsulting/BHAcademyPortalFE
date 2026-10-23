"use server";

import { cookies } from "next/headers";
import { redirect } from "next/navigation";

import { config } from "@/config/env";
import {
  ALL_AUTH_COOKIES,
  buildAuthCookies,
  userCookie,
  type TokenResponse,
} from "@/lib/auth-cookies";

type LoginResult = {
  success: boolean;
  error?: string;
};

function isTokenResponse(value: unknown): value is TokenResponse {
  if (typeof value !== "object" || value === null) return false;

  const tokens = value as Record<string, unknown>;
  return (
    typeof tokens.accessToken === "string" &&
    tokens.accessToken.length > 0 &&
    typeof tokens.refreshToken === "string" &&
    tokens.refreshToken.length > 0 &&
    typeof tokens.tokenType === "string" &&
    typeof tokens.expiresInSeconds === "number" &&
    Number.isFinite(tokens.expiresInSeconds) &&
    tokens.expiresInSeconds > 0 &&
    typeof tokens.issuedAt === "string"
  );
}

export async function loginAction(
  email: string,
  password: string
): Promise<LoginResult> {
  const normalizedEmail = email.trim();
  if (!normalizedEmail || !password) {
    return { success: false, error: "Please enter your email ID and password." };
  }

  let response: Response;
  try {
    response = await fetch(`${config.apiBaseUrl}/auth/login`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        accept: "application/json",
      },
      body: JSON.stringify({ email: normalizedEmail, password }),
      cache: "no-store",
    });
  } catch (err) {
    console.error("Login fetch error:", err);
    return {
      success: false,
      error: "Unable to connect to the login service. Please try again.",
    };
  }

  if (!response.ok) {
    return {
      success: false,
      error:
        response.status === 401 || response.status === 403
          ? "Invalid email or password."
          : "Unable to sign in at the moment. Please try again.",
    };
  }

  let jsonResponse: unknown;
  try {
    jsonResponse = await response.json();
  } catch (err) {
    console.error("Failed to parse JSON response:", err);
    return {
      success: false,
      error: "The login service returned an invalid response.",
    };
  }

  // Check if tokens are enclosed under `data` or returned directly at top level
  let tokens: unknown = jsonResponse;
  if (
    typeof jsonResponse === "object" &&
    jsonResponse !== null &&
    "data" in jsonResponse &&
    (jsonResponse as Record<string, unknown>).data
  ) {
    tokens = (jsonResponse as Record<string, unknown>).data;
  }

  if (!isTokenResponse(tokens)) {
    console.error("Login response failed isTokenResponse validation:", jsonResponse);
    return {
      success: false,
      error: "The login service returned an invalid response.",
    };
  }

  const cookieStore = await cookies();
  for (const cookie of buildAuthCookies(tokens)) {
    cookieStore.set(cookie.name, cookie.value, cookie.options);
  }
  const emailCookie = userCookie(normalizedEmail);
  cookieStore.set(emailCookie.name, emailCookie.value, emailCookie.options);

  redirect("/dashboard");
}

export async function logoutAction() {
  const cookieStore = await cookies();
  for (const name of ALL_AUTH_COOKIES) {
    cookieStore.delete(name);
  }
  redirect("/login");
}