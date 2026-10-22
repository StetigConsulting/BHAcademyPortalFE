"use client";

import { LogOut, Menu } from "lucide-react";
import type { ReactNode } from "react";

import { Button } from "@/components/ui/button";
import { logoutAction } from "@/features/auth/action";
import { useSidebar } from "./sidebar-context";

export function Navbar({ user }: { user: ReactNode }) {
  const { toggle } = useSidebar();

  return (
    <header className="sticky top-0 z-20 flex h-16 shrink-0 items-center justify-between border-b bg-white px-4">
      <Button variant="ghost" size="icon" onClick={toggle} aria-label="Toggle sidebar">
        <Menu className="h-5 w-5" />
      </Button>

      <div className="flex items-center gap-3">
        <span className="hidden max-w-[220px] truncate text-sm text-slate-500 sm:block">
          <span className="font-semibold text-slate-800">{user}</span>
        </span>

        <form action={logoutAction}>
          <Button type="submit" variant="outline" size="sm" className="gap-2">
            <LogOut className="h-4 w-4" />
            <span className="hidden sm:inline">Logout</span>
          </Button>
        </form>
      </div>
    </header>
  );
}