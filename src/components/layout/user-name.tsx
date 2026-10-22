import { cookies } from "next/headers";

export async function UserName() {
  const email = (await cookies()).get("user_email")?.value;
  return <>{email ?? "User"}</>;
}