import { Suspense, type ReactNode } from "react";

import { PortalShell } from "@/components/layout/portal-shell";
import { UserName } from "@/components/layout/user-name";
import { AuthProvider } from "@/lib/auth-context";
import { getCurrentUser } from "@/lib/auth-server";

// Opt out of instant prerender validation for dynamic session-dependent portal layout
export const instant = false;

export default async function PortalLayout({ children }: { children: ReactNode }) {
  const user = await getCurrentUser();

  return (
    <AuthProvider initialUser={user}>
      <PortalShell
        user={
          <Suspense fallback="…">
            <UserName fallback={user?.email} />
          </Suspense>
        }
      >
        <Suspense fallback={null}>{children}</Suspense>
      </PortalShell>
    </AuthProvider>
  );
}