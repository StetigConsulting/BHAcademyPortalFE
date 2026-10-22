"use server";

import { cookies } from "next/headers";
import { redirect } from "next/navigation";

type LoginResult = { success: boolean; error?: string };

export async function loginAction(
  email: string,
  remember: boolean
): Promise<LoginResult> {
  // TODO: call your login API here, return { success: false, error } on failure
  // and use the real token from the response instead of "temporary-token".

  const cookieStore = await cookies();
  const options = {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax" as const,
    path: "/",
    ...(remember ? { maxAge: 60 * 60 * 24 * 30 } : {}), 
  };

  cookieStore.set("auth_token", "temporary-token", options);
  cookieStore.set("user_email", email, options);

  return { success: true };
}

export async function logoutAction() {
  const cookieStore = await cookies();
  cookieStore.delete("auth_token");
  cookieStore.delete("user_email");
  redirect("/login");
}