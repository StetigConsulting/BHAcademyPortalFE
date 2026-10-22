import { Suspense, type ReactNode } from "react";

import { PortalShell } from "@/components/layout/portal-shell";
import { UserName } from "@/components/layout/user-name";

export default function PortalLayout({ children }: { children: ReactNode }) {
  return (
    <PortalShell
      user={
        <Suspense fallback="…">
          <UserName />
        </Suspense>
      }
    >
      {children}
    </PortalShell>
  );
}